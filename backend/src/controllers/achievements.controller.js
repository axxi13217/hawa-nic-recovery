const pool = require('../config/db');

exports.getAchievements = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM achievements WHERE user_id = $1 ORDER BY unlocked_at DESC',
      [req.userId]
    );
    res.json({ achievements: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching achievements' });
  }
};