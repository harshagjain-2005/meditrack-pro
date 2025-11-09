const History = require('../models/History');
const { Parser } = require('json2csv');

class HistoryController {
  // ✅ Fetch user’s full history (or with filters)
  static async getHistory(req, res) {
    try {
      const userId = req.headers['user-id'];
      if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required in headers' });
      }

      const { range = 'all', status = 'all' } = req.query;
      const history = await History.filterHistory(userId, range, status);

      res.json({ success: true, history });
    } catch (error) {
      console.error('❌ Get history error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch history' });
    }
  }

  // ✅ Export user’s history as CSV
  static async exportHistory(req, res) {
    try {
      const userId = req.headers['user-id'];
      if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required in headers' });
      }

      const rows = await History.exportHistory(userId);
      if (!rows || rows.length === 0) {
        return res.status(404).json({ success: false, message: 'No history found to export' });
      }

      const fields = [
        { label: 'Medicine Name', value: 'medicine_name' },
        { label: 'Dosage', value: 'dosage' },
        { label: 'Scheduled Time', value: 'scheduled_time' },
        { label: 'Actual Time', value: 'actual_time' },
        { label: 'Status', value: 'status' },
        { label: 'Notes', value: 'notes' },
        { label: 'Created At', value: 'created_at' }
      ];

      const parser = new Parser({ fields });
      const csv = parser.parse(rows);

      res.header('Content-Type', 'text/csv');
      res.attachment(`meditrack-history-${new Date().toISOString().split('T')[0]}.csv`);
      return res.send(csv);
    } catch (error) {
      console.error('❌ Export history error:', error);
      res.status(500).json({ success: false, message: 'Failed to export history' });
    }
  }
}

module.exports = HistoryController;
