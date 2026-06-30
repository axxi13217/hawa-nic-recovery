const express = require('express');
const cors = require('cors');
const logsRoutes = require('./src/routes/logs.routes');
const streaksRoutes = require('./src/routes/streaks.routes');
const financeRoutes = require('./src/routes/finance.routes');
const achievementsRoutes = require('./src/routes/achievements.routes');
const timelineRoutes = require('./src/routes/timeline.routes');
const analyticsRoutes = require('./src/routes/analytics.routes');

require('dotenv').config();

const authRoutes = require('./src/routes/auth.routes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/logs', logsRoutes);
app.use('/api/streaks', streaksRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Hawa backend is running' });
});

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
