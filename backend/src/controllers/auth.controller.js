const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const SALT_ROUNDS = 10;

// SIGNUP
exports.signup = async (req, res) => {
  try {
    const { name, email, password, cigsPerDay, costPerPack, cigsPerPack } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, cigs_per_day, cost_per_pack, cigs_per_pack)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, cigs_per_day, cost_per_pack, cigs_per_pack, quit_date, created_at`,
      [name, email, passwordHash, cigsPerDay || null, costPerPack || null, cigsPerPack || 20]
    );

    const user = result.rows[0];

    // Initialize streaks row for this user
    await pool.query('INSERT INTO streaks (user_id) VALUES ($1)', [user.id]);

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during signup' });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    delete user.password_hash; // never send the hash back

    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// GET CURRENT USER (for checking token validity / loading profile)
exports.getMe = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, cigs_per_day, cost_per_pack, cigs_per_pack, quit_date, created_at FROM users WHERE id = $1',
      [req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
