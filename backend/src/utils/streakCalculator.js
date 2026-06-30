const pool = require('../config/db');

// Recalculates current streak, longest streak, and total nicotine-free days
// by replaying the user's full relapse history. Called after every log insert/delete.
async function recalculateStreaks(userId) {
  const userResult = await pool.query('SELECT quit_date FROM users WHERE id = $1', [userId]);
  if (userResult.rows.length === 0) throw new Error('User not found');

  const quitDate = userResult.rows[0].quit_date;
  if (!quitDate) {
    // No quit date set yet, nothing to calculate
    return;
  }

  const relapseResult = await pool.query(
    `SELECT DISTINCT log_date FROM daily_logs
     WHERE user_id = $1 AND log_type = 'relapse'
     ORDER BY log_date ASC`,
    [userId]
  );
  const relapseDates = relapseResult.rows.map(r => r.log_date);

  const dayMs = 1000 * 60 * 60 * 24;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let periodStart = new Date(quitDate);
  periodStart.setHours(0, 0, 0, 0);

  let longestStreak = 0;
  let totalCleanDays = 0;
  let lastRelapseDate = null;

  for (const relapseDate of relapseDates) {
    const rDate = new Date(relapseDate);
    rDate.setHours(0, 0, 0, 0);

    const cleanDaysThisPeriod = Math.max(0, Math.floor((rDate - periodStart) / dayMs));
    totalCleanDays += cleanDaysThisPeriod;
    if (cleanDaysThisPeriod > longestStreak) longestStreak = cleanDaysThisPeriod;

    lastRelapseDate = rDate;
    periodStart = new Date(rDate.getTime() + dayMs); // streak resumes the day after relapse
  }

  // Current ongoing streak: from periodStart to today
  const currentStreak = Math.max(0, Math.floor((today - periodStart) / dayMs));
  totalCleanDays += currentStreak;
  if (currentStreak > longestStreak) longestStreak = currentStreak;

  await pool.query(
    `INSERT INTO streaks (user_id, current_streak_days, longest_streak_days, total_nicotine_free_days, last_relapse_date, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     ON CONFLICT (user_id) DO UPDATE SET
       current_streak_days = $2,
       longest_streak_days = $3,
       total_nicotine_free_days = $4,
       last_relapse_date = $5,
       updated_at = NOW()`,
    [userId, currentStreak, longestStreak, totalCleanDays, lastRelapseDate]
  );

  return { currentStreak, longestStreak, totalCleanDays, lastRelapseDate };
}

module.exports = { recalculateStreaks };