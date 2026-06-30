import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../api/axios';

function Analytics() {
  const [period, setPeriod] = useState('weekly');
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/api/analytics?period=${period}`).then(res => setData(res.data));
  }, [period]);

  if (!data) return <div className="card">Loading...</div>;

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="dashboard">
      <header>
        <h2>Analytics</h2>
        <Link to="/dashboard" className="btn-reset">Back</Link>
      </header>

      <div className="log-actions" style={{ marginBottom: 20 }}>
        <button
          className={`btn-log ${period === 'weekly' ? 'clean' : ''}`}
          onClick={() => setPeriod('weekly')}
        >
          Weekly
        </button>
        <button
          className={`btn-log ${period === 'monthly' ? 'clean' : ''}`}
          onClick={() => setPeriod('monthly')}
        >
          Monthly
        </button>
      </div>

      <div className="timeline-box" style={{ marginBottom: 20 }}>
        <div className="timeline-header"><h3>Consumption Trend</h3></div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.consumptionTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
            <XAxis dataKey="date" tickFormatter={formatDate} stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
            <Tooltip
              labelFormatter={formatDate}
              contentStyle={{ background: '#151a21', border: '1px solid #2d3748', borderRadius: 8 }}
            />
            <Bar dataKey="cravings" fill="#3b82f6" name="Cravings" />
            <Bar dataKey="relapses" fill="#ef4444" name="Relapses" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="timeline-box" style={{ marginBottom: 20 }}>
        <div className="timeline-header"><h3>Savings Over Time</h3></div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data.savingsTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
            <XAxis dataKey="date" tickFormatter={formatDate} stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip
              labelFormatter={formatDate}
              contentStyle={{ background: '#151a21', border: '1px solid #2d3748', borderRadius: 8 }}
            />
            <Line type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="timeline-box">
        <div className="timeline-header"><h3>Relapse History</h3></div>
        {data.relapseHistory.length === 0 ? (
          <p className="goal-desc">No relapses logged. Keep it up.</p>
        ) : (
          <div className="history">
            {data.relapseHistory.map((r, i) => (
              <div key={i} className="history-item log-relapse">
                <span>{formatDate(r.date)} — {r.cigarettesSmoked} cigarette{r.cigarettesSmoked !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Analytics;