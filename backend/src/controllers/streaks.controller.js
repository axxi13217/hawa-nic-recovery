const pool = require('../config/db');

exports.getStreaks = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM streaks WHERE user_id = $1', [req.userId]);
    if (result.rows.length === 0) {
      return res.json({ streaks: { current_streak_days: 0, longest_streak_days: 0, total_nicotine_free_days: 0 } });
    }
    res.json({ streaks: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching streaks' });
  }
};