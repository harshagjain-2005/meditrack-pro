const Medicine = require('../models/Medicine');
const History = require('../models/History');

class MedicineController {
  // ✅ Get all medicines for a specific user (sorted newest first)
  static async getMedicines(req, res) {
    try {
      const userId = req.headers['user-id'];
      if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required in headers' });
      }

      const medicines = await Medicine.findByUserId(userId);

      // Sort by newest first for dashboard
      medicines.sort((a, b) => b.id - a.id);

      res.json({ success: true, medicines });
    } catch (error) {
      console.error('❌ Get medicines error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch medicines' });
    }
  }

  // ✅ Add new medicine (supports multiple reminder times)
  static async addMedicine(req, res) {
    try {
      const userId = req.headers['user-id'];
      if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required in headers' });
      }

      const {
        name,
        dosage,
        frequency,
        medicineTime1,
        medicineTime2,
        medicineTime3,
        stock,
        refill_reminder,
        voice_alert_type
      } = req.body;

      if (!name || !dosage || !medicineTime1) {
        return res.status(400).json({
          success: false,
          message: 'Name, dosage, and at least one time are required'
        });
      }

      // Prepare time list
      let times = [medicineTime1];
      if (frequency === 'twice' && medicineTime2) times.push(medicineTime2);
      else if (frequency === 'thrice' && medicineTime2 && medicineTime3)
        times.push(medicineTime2, medicineTime3);

      const medicineIds = [];

      // Create multiple reminders (same medicine, different times)
      for (let i = 0; i < times.length; i++) {
        const time = times[i];
        const id = await Medicine.create({
          user_id: userId,
          name: i === 0 ? name : `${name} (Time ${i + 1})`,
          dosage,
          time,
          frequency: frequency || 'once',
          stock: stock || 0,
          refill_reminder: refill_reminder || 0,
          voice_alert_type: voice_alert_type || 'default',
          status: 'pending'
        });
        medicineIds.push(id);
      }

      res.status(201).json({
        success: true,
        message: `Medicine added successfully with ${times.length} reminder(s)`,
        medicineIds
      });
    } catch (error) {
      console.error('❌ Add medicine error:', error);
      res.status(500).json({ success: false, message: 'Failed to add medicine' });
    }
  }

  // ✅ Mark medicine as taken, update stock, and add to history
  static async markAsTaken(req, res) {
    try {
      const userId = req.headers['user-id'];
      if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required in headers' });
      }

      const { medicineId } = req.params;
      const { notes } = req.body;

      const medicine = await Medicine.findById(medicineId);
      if (!medicine || medicine.user_id != userId) {
        return res.status(404).json({ success: false, message: 'Medicine not found' });
      }

      // Prevent duplicate marking
      const recentHistory = await History.findTodayByMedicineId(medicineId);
      if (recentHistory.length > 0) {
        return res.status(400).json({ success: false, message: 'Already marked as taken today' });
      }

      // Update stock for all related entries
      const baseName = medicine.name.replace(/ \(Time \d+\)$/, '');
      const allRelated = await Medicine.findByBaseName(userId, baseName);

      const dosageMatch = medicine.dosage.match(/(\d+)/);
      const dosageCount = dosageMatch ? parseInt(dosageMatch[1]) : 1;

      let newStock = medicine.stock;
      if (medicine.stock > 0) {
        newStock = Math.max(0, medicine.stock - dosageCount);
        for (const related of allRelated) {
          await Medicine.updateStock(related.id, newStock);
        }
      }

      // Update status
      await Medicine.updateStatus(medicineId, 'taken');

      // Log to history
      await History.create({
        user_id: userId,
        medicine_id: medicineId,
        medicine_name: medicine.name,
        dosage: medicine.dosage,
        scheduled_time: medicine.time,
        actual_time: new Date().toLocaleString('en-IN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }),
        status: 'taken',
        notes: notes || ''
      });

      if (newStock <= medicine.refill_reminder && medicine.refill_reminder > 0) {
        console.log(`⚠️ LOW STOCK ALERT: ${medicine.name} has ${newStock} doses left`);
      }

      res.json({ success: true, message: 'Medicine marked as taken', newStock });
    } catch (error) {
      console.error('❌ Mark as taken error:', error);
      res.status(500).json({ success: false, message: 'Failed to update medicine' });
    }
  }

  // ✅ Reschedule medicine reminder
  static async rescheduleMedicine(req, res) {
    try {
      const userId = req.headers['user-id'];
      if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required in headers' });
      }

      const { medicineId } = req.params;
      const { remindInMinutes } = req.body;

      const medicine = await Medicine.findById(medicineId);
      if (!medicine || medicine.user_id != userId) {
        return res.status(404).json({ success: false, message: 'Medicine not found' });
      }

      await History.create({
        user_id: userId,
        medicine_id: medicineId,
        medicine_name: medicine.name,
        dosage: medicine.dosage,
        scheduled_time: medicine.time,
        actual_time: null,
        status: 'rescheduled',
        notes: `Rescheduled for ${remindInMinutes} minutes later`
      });

      res.json({ success: true, message: `Reminder set for ${remindInMinutes} minutes later` });
    } catch (error) {
      console.error('❌ Reschedule error:', error);
      res.status(500).json({ success: false, message: 'Failed to reschedule medicine' });
    }
  }

  // ✅ Delete medicine (and all related time entries)
  static async deleteMedicine(req, res) {
    try {
      const userId = req.headers['user-id'];
      if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required in headers' });
      }

      const { medicineId } = req.params;

      const medicine = await Medicine.findById(medicineId);
      if (!medicine || medicine.user_id != userId) {
        return res.status(404).json({ success: false, message: 'Medicine not found' });
      }

      const baseName = medicine.name.replace(/ \(Time \d+\)$/, '');
      const related = await Medicine.findByBaseName(userId, baseName);

      for (const med of related) {
        await Medicine.delete(med.id);
      }

      res.json({ success: true, message: 'Medicine and related reminders deleted successfully' });
    } catch (error) {
      console.error('❌ Delete medicine error:', error);
      res.status(500).json({ success: false, message: 'Failed to delete medicine' });
    }
  }
}

module.exports = MedicineController;
