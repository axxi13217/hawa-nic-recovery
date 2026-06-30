const pool = require('../config/db');

exports.getFinance = async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT cigs_per_day, cost_per_pack, cigs_per_pack FROM users WHERE id = $1',
      [req.userId]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { cigs_per_day, cost_per_pack, cigs_per_pack } = userResult.rows[0];

    if (!cigs_per_day || !cost_per_pack) {
      return res.json({
        message: 'Set cigarettes per day and cost per pack to see savings',
        moneySaved: 0, monthlySavings: 0, yearlySavings: 0, cigarettesAvoided: 0
      });
    }

    const streakResult = await pool.query(
      'SELECT total_nicotine_free_days FROM streaks WHERE user_id = $1',
      [req.userId]
    );
    const cleanDays = streakResult.rows.length > 0 ? streakResult.rows[0].total_nicotine_free_days : 0;

    const costPerCig = cost_per_pack / cigs_per_pack;
    const dailySavings = cigs_per_day * costPerCig;

    const moneySaved = (cleanDays * dailySavings).toFixed(2);
    const monthlySavings = (dailySavings * 30).toFixed(2);
    const yearlySavings = (dailySavings * 365).toFixed(2);
    const cigarettesAvoided = cleanDays * cigs_per_day;

    res.json({
      moneySaved: Number(moneySaved),
      monthlySavings: Number(monthlySavings),
      yearlySavings: Number(yearlySavings),
      cigarettesAvoided,
      dailySavings: Number(dailySavings.toFixed(2))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching finance data' });
  }
};