const db = require('../config/database');


class History {
  // ✅ Add a new history record
  static async create({
    user_id,
    medicine_id,
    medicine_name,
    dosage,
    scheduled_time,
    actual_time,
    status,
    notes
  }) {
    await db.execute(
      `INSERT INTO history 
        (user_id, medicine_id, medicine_name, dosage, scheduled_time, actual_time, status, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [user_id, medicine_id, medicine_name, dosage, scheduled_time, actual_time, status, notes]
    );
  }

  // ✅ Fetch full history for a user (latest first)
  static async findByUserId(user_id) {
    const [rows] = await db.execute(
      `SELECT * FROM history 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [user_id]
    );
    return rows;
  }

  // ✅ Fetch all records for today (used to prevent double marking)
  static async findTodayByMedicineId(medicine_id) {
    const [rows] = await db.execute(
      `SELECT * FROM history 
       WHERE medicine_id = ? 
         AND DATE(created_at) = CURDATE()`,
      [medicine_id]
    );
    return rows;
  }

  // ✅ Filter history by range & status (used in frontend filters)
  static async filterHistory(user_id, range, status) {
    let query = `SELECT * FROM history WHERE user_id = ?`;
    const params = [user_id];

    if (status && status !== 'all') {
      query += ` AND status = ?`;
      params.push(status);
    }

    if (range && range !== 'all') {
      switch (range) {
        case 'today':
          query += ` AND DATE(created_at) = CURDATE()`;
          break;
        case 'week':
          query += ` AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`;
          break;
        case 'month':
          query += ` AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`;
          break;
      }
    }

    query += ` ORDER BY created_at DESC`;
    const [rows] = await db.execute(query, params);
    return rows;
  }

  // ✅ Export user history (for CSV download)
  static async exportHistory(user_id) {
    const [rows] = await db.execute(
      `SELECT medicine_name, dosage, scheduled_time, actual_time, status, notes, created_at 
       FROM history 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [user_id]
    );
    return rows;
  }
}

module.exports = History;
