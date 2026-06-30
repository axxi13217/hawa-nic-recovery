const pool = require('../config/db');

exports.getAnalytics = async (req, res) => {
  try {
    const period = req.query.period === 'monthly' ? 30 : 7;
    const userId = req.userId;

    // Get user's daily savings rate for the savings chart
    const userResult = await pool.query(
      'SELECT cigs_per_day, cost_per_pack, cigs_per_pack FROM users WHERE id = $1',
      [userId]
    );
    const { cigs_per_day, cost_per_pack, cigs_per_pack } = userResult.rows[0];
    const dailySavings = (cigs_per_day && cost_per_pack)
      ? cigs_per_day * (cost_per_pack / cigs_per_pack)
      : 0;

    // Pull all logs in range
    const logsResult = await pool.query(
      `SELECT log_date, log_type, cigarettes_smoked
       FROM daily_logs
       WHERE user_id = $1 AND log_date >= CURRENT_DATE - INTERVAL '${period} days'
       ORDER BY log_date ASC`,
      [userId]
    );

    // Build a full date range so the chart has no gaps, even on days with no logs
    const dateMap = {};
    for (let i = period - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dateMap[key] = { date: key, cravings: 0, relapses: 0, cleanDays: 0, cigarettesSmoked: 0 };
    }

    logsResult.rows.forEach(log => {
      const key = new Date(log.log_date).toISOString().split('T')[0];
      if (!dateMap[key]) return;
      if (log.log_type === 'craving') dateMap[key].cravings += 1;
      if (log.log_type === 'relapse') {
        dateMap[key].relapses += 1;
        dateMap[key].cigarettesSmoked += log.cigarettes_smoked;
      }
      if (log.log_type === 'clean') dateMap[key].cleanDays += 1;
    });

    const consumptionTrend = Object.values(dateMap);

    // Savings over time: cumulative clean days * dailySavings, running total across the range
    let cumulativeCleanDays = 0;
    const savingsTrend = consumptionTrend.map(day => {
      if (day.cleanDays > 0) cumulativeCleanDays += 1;
      return { date: day.date, savings: Number((cumulativeCleanDays * dailySavings).toFixed(2)) };
    });

    // Relapse history: just the relapse rows, most recent first
    const relapseHistory = logsResult.rows
      .filter(r => r.log_type === 'relapse')
      .map(r => ({ date: r.log_date, cigarettesSmoked: r.cigarettes_smoked }))
      .reverse();

    res.json({ period, consumptionTrend, savingsTrend, relapseHistory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching analytics' });
  }
};