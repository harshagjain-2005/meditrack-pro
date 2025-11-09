const db = require('../config/db');

class Medicine {
  // ✅ Create a new medicine record
  static async create({
    user_id,
    name,
    dosage,
    time,
    frequency,
    stock,
    refill_reminder,
    voice_alert_type,
    status
  }) {
    const [result] = await db.execute(
      `INSERT INTO medicines 
        (user_id, name, dosage, time, frequency, stock, refill_reminder, voice_alert_type, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [user_id, name, dosage, time, frequency, stock, refill_reminder, voice_alert_type, status]
    );
    return result.insertId;
  }

  // ✅ Fetch all medicines for a specific user
  static async findByUserId(user_id) {
    const [rows] = await db.execute(
      `SELECT * FROM medicines WHERE user_id = ? ORDER BY id DESC`,
      [user_id]
    );
    return rows;
  }

  // ✅ Fetch single medicine by ID
  static async findById(id) {
    const [rows] = await db.execute(`SELECT * FROM medicines WHERE id = ?`, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  // ✅ Find all medicine entries with the same base name (for multiple times)
  static async findByBaseName(user_id, baseName) {
    const [rows] = await db.execute(
      `SELECT * FROM medicines 
       WHERE user_id = ? 
         AND (name = ? OR name LIKE ?)
       ORDER BY id ASC`,
      [user_id, baseName, `${baseName} (Time %)`]
    );
    return rows;
  }

  // ✅ Update stock for a specific medicine
  static async updateStock(id, newStock) {
    await db.execute(`UPDATE medicines SET stock = ? WHERE id = ?`, [newStock, id]);
  }

  // ✅ Update status (e.g., pending, taken, missed)
  static async updateStatus(id, status) {
    await db.execute(`UPDATE medicines SET status = ? WHERE id = ?`, [status, id]);
  }

  // ✅ Delete a specific medicine
  static async delete(id) {
    await db.execute(`DELETE FROM medicines WHERE id = ?`, [id]);
  }

  // ✅ Fetch reminders due for a user (optional, used in reminder checkers)
  static async findDueReminders(user_id) {
    const [rows] = await db.execute(
      `SELECT * FROM medicines 
       WHERE user_id = ? 
         AND status = 'pending'
         AND TIME_FORMAT(time, '%H:%i') <= TIME_FORMAT(NOW(), '%H:%i') 
         AND DATE(created_at) = CURDATE()`,
      [user_id]
    );
    return rows;
  }
}

module.exports = Medicine;
