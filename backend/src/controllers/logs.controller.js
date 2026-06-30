const pool = require('../config/db');
const { recalculateStreaks } = require('../utils/streakCalculator');
const { checkAndAwardAchievements } = require('../utils/achievementChecker');

// CREATE a log (craving, relapse, or clean check-in)
exports.createLog = async (req, res) => {
  try {
    const { logDate, logType, cigarettesSmoked, notes } = req.body;
    const userId = req.userId;

    if (!logDate || !logType) {
      return res.status(400).json({ error: 'logDate and logType are required' });
    }
    if (!['craving', 'relapse', 'clean'].includes(logType)) {
      return res.status(400).json({ error: 'logType must be craving, relapse, or clean' });
    }

    // If this is the user's first log ever and quit_date isn't set, set it now
    const userResult = await pool.query('SELECT quit_date FROM users WHERE id = $1', [userId]);
    if (!userResult.rows[0].quit_date) {
      await pool.query('UPDATE users SET quit_date = $1 WHERE id = $2', [logDate, userId]);
    }

    const result = await pool.query(
      `INSERT INTO daily_logs (user_id, log_date, log_type, cigarettes_smoked, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, logDate, logType, cigarettesSmoked || 0, notes || null]
    );

    const streaks = await recalculateStreaks(userId);
    const newAchievements = await checkAndAwardAchievements(userId, streaks);
    res.status(201).json({ log: result.rows[0], streaks, newAchievements });
  
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error creating log' });
  }
};

// GET all logs for the logged-in user (optionally filtered by type)
exports.getLogs = async (req, res) => {
  try {
    const { type } = req.query;
    let query = 'SELECT * FROM daily_logs WHERE user_id = $1';
    const params = [req.userId];

    if (type) {
      query += ' AND log_type = $2';
      params.push(type);
    }
    query += ' ORDER BY log_date DESC, created_at DESC';

    const result = await pool.query(query, params);
    res.json({ logs: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching logs' });
  }
};

// DELETE a log (e.g. user logged a relapse by mistake)
exports.deleteLog = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM daily_logs WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Log not found' });
    }

    const streaks = await recalculateStreaks(req.userId);
    res.json({ message: 'Log deleted', streaks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error deleting log' });
  }
};