import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Flame, Trophy, Calendar } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';


function Dashboard() {
  const { user, logout } = useAuth();
  const [streaks, setStreaks] = useState(null);
  const [finance, setFinance] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newBadge, setNewBadge] = useState(null);

  const fetchAll = async () => {
    const [streaksRes, financeRes, logsRes] = await Promise.all([
      api.get('/api/streaks'),
      api.get('/api/finance'),
      api.get('/api/logs'),
    ]);
    setStreaks(streaksRes.data.streaks);
    setFinance(financeRes.data);
    setLogs(logsRes.data.logs.slice(0, 5)); // most recent 5
  };

  useEffect(() => {
    fetchAll().finally(() => setLoading(false));
  }, []);

  const handleLog = async (logType) => {
    setSubmitting(true);
    setNewBadge(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await api.post('/api/logs', {
        logDate: today,
        logType,
        cigarettesSmoked: logType === 'relapse' ? 1 : 0,
      });
      if (res.data.newAchievements?.length > 0) {
        setNewBadge(res.data.newAchievements[0].achievement_type);
      }
      await fetchAll();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="card">Loading...</div>;

  return (
    <div className="dashboard">
      <header>
        <h2>Hi, {user.name}</h2>
        <button onClick={logout} className="btn-reset">Log Out</button>
      </header>

      <Link to="/timeline" className="btn-log clean" style={{ display: 'block', textAlign: 'center', marginBottom: 20, textDecoration: 'none' }}>
        View Recovery Timeline
      </Link>
      <Link to="/analytics" className="btn-log craving" style={{ display: 'block', textAlign: 'center', marginBottom: 20, textDecoration: 'none' }}>
        View Analytics
      </Link>
      <Link to="/achievements" className="btn-log relapse" style={{ display: 'block', textAlign: 'center', marginBottom: 20, textDecoration: 'none' }}>
        View Achievements
      </Link>

      {newBadge && (
        <div className="badge-toast">
          <Trophy size={16} /> Achievement unlocked: {newBadge.replace(/_/g, ' ')}
        </div>
      )}

      {/* STREAK HERO */}
      <div className="hero-timer">
        <div className="time-unit">
          <span className="val active">{streaks.current_streak_days}</span>
          <span className="label">CURRENT STREAK</span>
        </div>
        <div className="time-unit">
          <span className="val">{streaks.longest_streak_days}</span>
          <span className="label">LONGEST</span>
        </div>
        <div className="time-unit">
          <span className="val">{streaks.total_nicotine_free_days}</span>
          <span className="label">TOTAL FREE DAYS</span>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="stats-grid">
        <div className="stat-card money">
          <div className="icon"><Wallet size={20} /></div>
          <div>
            <h3>Money Saved</h3>
            <p>₹{finance.moneySaved}</p>
          </div>
        </div>
        <div className="stat-card cigs">
          <div className="icon"><Flame size={20} /></div>
          <div>
            <h3>Cigarettes Avoided</h3>
            <p>{finance.cigarettesAvoided}</p>
          </div>
        </div>
        <div className="stat-card health">
          <div className="icon"><Calendar size={20} /></div>
          <div>
            <h3>Yearly Projection</h3>
            <p>₹{finance.yearlySavings}</p>
          </div>
        </div>
      </div>

      {/* LOG ACTIONS */}
      <div className="log-actions">
        <button className="btn-log clean" disabled={submitting} onClick={() => handleLog('clean')}>
          Log Clean Day
        </button>
        <button className="btn-log craving" disabled={submitting} onClick={() => handleLog('craving')}>
          Log Craving
        </button>
        <button className="btn-log relapse" disabled={submitting} onClick={() => handleLog('relapse')}>
          Log Relapse
        </button>
      </div>

      {/* RECENT LOGS */}
      <div className="timeline-box">
        <div className="timeline-header">
          <h3>Recent Activity</h3>
        </div>
        {logs.length === 0 ? (
          <p className="goal-desc">No logs yet. Log your first day above.</p>
        ) : (
          <div className="history">
            {logs.map(log => (
              <div key={log.id} className={`history-item log-${log.log_type}`}>
                <span>{log.log_type} — {new Date(log.log_date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;