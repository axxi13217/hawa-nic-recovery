import { useState, useEffect } from 'react';
import { Trophy, CheckCircle, Circle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

function Timeline() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/api/timeline').then(res => setData(res.data));
  }, []);

  if (!data) return <div className="card">Loading...</div>;

  const { currentStreak, milestones, next } = data;

  return (
    <div className="dashboard">
      <header>
        <h2>Recovery Timeline</h2>
        <Link to="/dashboard" className="btn-reset">Back</Link>
      </header>

      {next && (
        <div className="timeline-box" style={{ marginBottom: 20 }}>
          <div className="timeline-header">
            <Trophy size={18} className="gold-icon" />
            <h3>Next: {next.title}</h3>
          </div>
          <div className="next-goal">
            <div className="goal-info">
              <h4>{next.days - currentStreak} day{next.days - currentStreak !== 1 ? 's' : ''} to go</h4>
            </div>
            <div className="progress-bar">
              <div className="fill" style={{ width: `${Math.min(100, (currentStreak / next.days) * 100)}%` }}></div>
            </div>
            <p className="goal-desc">{next.desc}</p>
          </div>
        </div>
      )}

      {!next && (
        <div className="timeline-box" style={{ marginBottom: 20, textAlign: 'center' }}>
          <Trophy size={30} className="gold-icon" />
          <p className="goal-desc">All milestones reached. Keep going.</p>
        </div>
      )}

      <div className="timeline-box">
        <div className="timeline-header">
          <h3>All Milestones</h3>
        </div>
        <div className="history">
          {milestones.map((m, i) => (
            <div key={i} className="history-item" style={{ alignItems: 'flex-start' }}>
              {m.completed
                ? <CheckCircle size={16} className="check-icon" style={{ marginTop: 2 }} />
                : <Circle size={16} style={{ color: 'var(--muted)', marginTop: 2 }} />}
              <div>
                <div style={{ color: m.completed ? 'var(--text)' : 'var(--muted)', fontWeight: 600 }}>
                  {m.title}
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{m.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Timeline;