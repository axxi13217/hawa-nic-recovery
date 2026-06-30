import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Lock } from 'lucide-react';
import api from '../api/axios';

const ALL_ACHIEVEMENTS = [
  { type: 'first_day', title: 'First Day', desc: 'Log your first nicotine-free day.' },
  { type: '7_day_streak', title: '7 Day Streak', desc: 'Reach a 7-day current streak.' },
  { type: '30_day_streak', title: '30 Day Streak', desc: 'Reach a 30-day current streak.' },
  { type: '100_days_clean', title: '100 Days Clean', desc: 'Accumulate 100 total nicotine-free days.' },
];

function Achievements() {
  const [unlocked, setUnlocked] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/achievements')
      .then(res => setUnlocked(res.data.achievements))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card">Loading...</div>;

  const unlockedTypes = new Set(unlocked.map(a => a.achievement_type));
  const unlockedDate = (type) => unlocked.find(a => a.achievement_type === type)?.unlocked_at;

  return (
    <div className="dashboard">
      <header>
        <h2>Achievements</h2>
        <Link to="/dashboard" className="btn-reset">Back</Link>
      </header>

      <div className="stats-grid">
        {ALL_ACHIEVEMENTS.map(a => {
          const isUnlocked = unlockedTypes.has(a.type);
          return (
            <div key={a.type} className={`stat-card ${isUnlocked ? 'money' : ''}`} style={{ opacity: isUnlocked ? 1 : 0.5 }}>
              <div className="icon">
                {isUnlocked ? <Trophy size={20} /> : <Lock size={20} />}
              </div>
              <div>
                <h3>{a.title}</h3>
                <p style={{ fontSize: '0.85rem', fontWeight: 400 }}>
                  {isUnlocked
                    ? `Unlocked ${new Date(unlockedDate(a.type)).toLocaleDateString()}`
                    : a.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Achievements;