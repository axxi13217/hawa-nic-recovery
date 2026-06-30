const pool = require('../config/db');

const ACHIEVEMENT_RULES = [
  { type: 'first_day', check: (s) => s.totalCleanDays >= 1 },
  { type: '7_day_streak', check: (s) => s.currentStreak >= 7 },
  { type: '30_day_streak', check: (s) => s.currentStreak >= 30 },
  { type: '100_days_clean', check: (s) => s.totalCleanDays >= 100 }
];

async function checkAndAwardAchievements(userId, streaks) {
  const newlyUnlocked = [];

  for (const rule of ACHIEVEMENT_RULES) {
    if (rule.check(streaks)) {
      const result = await pool.query(
        `INSERT INTO achievements (user_id, achievement_type)
         VALUES ($1, $2)
         ON CONFLICT (user_id, achievement_type) DO NOTHING
         RETURNING *`,
        [userId, rule.type]
      );
      if (result.rows.length > 0) {
        newlyUnlocked.push(result.rows[0]);
      }
    }
  }

  return newlyUnlocked;
}

module.exports = { checkAndAwardAchievements };