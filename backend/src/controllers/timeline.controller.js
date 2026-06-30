const pool = require('../config/db');

const MILESTONES = [
  { days: 1, title: '24 Hours', desc: 'Carbon monoxide levels in your blood drop to normal, and oxygen levels increase.' },
  { days: 7, title: '7 Days', desc: 'Nicotine is fully out of your system. Taste and smell continue to improve.' },
  { days: 30, title: '30 Days', desc: 'Lung function begins improving. Coughing and shortness of breath decrease.' },
  { days: 90, title: '90 Days', desc: 'Circulation has substantially improved. Lung function up to 30% better.' },
  { days: 180, title: '180 Days', desc: 'Risk of infection drops. Cilia in lungs have regrown, clearing mucus more effectively.' },
  { days: 365, title: '1 Year', desc: 'Risk of heart disease is roughly half that of a smoker.' },
];

exports.getTimeline = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT current_streak_days FROM streaks WHERE user_id = $1',
      [req.userId]
    );
    const currentStreak = result.rows.length > 0 ? result.rows[0].current_streak_days : 0;

    const milestones = MILESTONES.map(m => ({
      ...m,
      completed: currentStreak >= m.days,
    }));

    const next = milestones.find(m => !m.completed) || null;

    res.json({ currentStreak, milestones, next });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching timeline' });
  }
};