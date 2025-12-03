import React, { useState, useEffect } from 'react';
import { Heart, Wallet, Clock, CheckCircle, Flame, Smile, Trophy } from 'lucide-react';
import './App.css';

function App() {
  // --- STATE: Load from LocalStorage or start fresh ---
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hawaUser');
    return saved ? JSON.parse(saved) : null;
  });

  // --- EFFECT: Auto-save whenever 'user' changes ---
  useEffect(() => {
    if (user) {
      localStorage.setItem('hawaUser', JSON.stringify(user));
    }
  }, [user]);

  // --- RENDER ---
  return (
    <div className="app-container">
      {!user ? (
        <Onboarding onSave={setUser} />
      ) : (
        <Dashboard user={user} onReset={() => {
          localStorage.removeItem('hawaUser');
          setUser(null);
        }} />
      )}
    </div>
  );
}

// --- COMPONENT 1: SETUP SCREEN ---
function Onboarding({ onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    quitDate: '',
    quitTime: '00:00',
    cigsPerDay: '',
    costPerPack: '',
    cigsInPack: 20
  });

  const handleSetNow = (e) => {
    e.preventDefault(); 
    const now = new Date();
    
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    setFormData(prev => ({
      ...prev,
      quitDate: dateStr,
      quitTime: timeStr
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullDateTime = `${formData.quitDate}T${formData.quitTime}`;
    onSave({ ...formData, quitDateTime: fullDateTime });
  };

  return (
    <div className="card onboarding">
      <h1 style={{ marginBottom: '20px' }}>Hawa</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>What's your name?</label>
          <input 
            type="text" 
            required 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>

        {/* DATE & TIME SECTION */}
        <div className="form-group">
           <label>When did you quit?</label>
           
           <div className="form-row">
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <input 
                  type="date" 
                  required 
                  value={formData.quitDate}
                  onChange={e => setFormData({...formData, quitDate: e.target.value})}
                />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <input 
                  type="time" 
                  required 
                  value={formData.quitTime}
                  onChange={e => setFormData({...formData, quitTime: e.target.value})}
                />
              </div>
           </div>
           
           {/* Button moved below inputs, aligned right */}
           <div style={{ textAlign: 'right', marginTop: '8px' }}>
             <button type="button" onClick={handleSetNow} className="btn-small">Set to Now</button>
           </div>
        </div>

        <div className="form-group">
          <label>Cigarettes per Day</label>
          <input 
            type="number" 
            placeholder="e.g. 10" 
            required 
            value={formData.cigsPerDay}
            onChange={e => setFormData({...formData, cigsPerDay: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label>Cost per Pack</label>
          <input 
            type="number" 
            placeholder="e.g. 350" 
            required 
            value={formData.costPerPack}
            onChange={e => setFormData({...formData, costPerPack: e.target.value})}
          />
        </div>

        <button type="submit" className="btn-primary">Start Tracking</button>
      </form>
    </div>
  );
}

// --- COMPONENT 2: DASHBOARD ---
function Dashboard({ user, onReset }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- CALCULATIONS ---
  const quitDate = new Date(user.quitDateTime);
  const diffMs = now - quitDate;
  
  // Time breakdown
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const diffSeconds = Math.floor((diffMs / 1000) % 60);
  const totalHours = diffMs / (1000 * 60 * 60);

  // Money Stats
  const costPerCig = user.costPerPack / user.cigsInPack;
  const cigsPerMinute = user.cigsPerDay / (24 * 60);
  const totalMinutes = diffMs / (1000 * 60);
  
  const moneySaved = (totalMinutes * cigsPerMinute * costPerCig).toFixed(2);
  const cigsNotSmoked = Math.floor(totalMinutes * cigsPerMinute);

  // Life Regained Logic (11 mins per cig)
  const lifeSavedMinutes = cigsNotSmoked * 11;
  const lifeSavedHoursVal = lifeSavedMinutes / 60;
  
  let lifeSavedDisplay;
  if (lifeSavedHoursVal > 24) {
      const d = Math.floor(lifeSavedHoursVal / 24);
      const h = Math.round(lifeSavedHoursVal % 24);
      lifeSavedDisplay = `${d}d ${h}h`;
  } else {
      lifeSavedDisplay = `${lifeSavedHoursVal.toFixed(1)} hrs`;
  }

  return (
    <div className="dashboard">
      <header>
        <h2>Hi, {user.name}</h2>
        <button onClick={onReset} className="btn-reset">Reset</button>
      </header>

      {/* HERO TIMER */}
      <div className="hero-timer">
        <div className="time-unit">
          <span className="val">{diffDays}</span>
          <span className="label">DAYS</span>
        </div>
        <span className="sep">:</span>
        <div className="time-unit">
          <span className="val">{String(diffHours).padStart(2, '0')}</span>
          <span className="label">HR</span>
        </div>
        <span className="sep">:</span>
        <div className="time-unit">
          <span className="val">{String(diffMinutes).padStart(2, '0')}</span>
          <span className="label">MIN</span>
        </div>
        <span className="sep">:</span>
        <div className="time-unit">
          <span className="val active">{String(diffSeconds).padStart(2, '0')}</span>
          <span className="label">SEC</span>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="stats-grid">
        <div className="stat-card money">
          <div className="icon"><Wallet size={20} /></div>
          <div>
            <h3>Money Saved</h3>
            <p>₹{moneySaved}</p>
          </div>
        </div>
        <div className="stat-card health">
          <div className="icon"><Heart size={20} /></div>
          <div>
            <h3>Life Regained</h3>
            <p>{lifeSavedDisplay}</p>
          </div>
        </div>
        <div className="stat-card cigs">
          <div className="icon"><Flame size={20} /></div>
          <div>
            <h3>Not Smoked</h3>
            <p>{cigsNotSmoked}</p>
          </div>
        </div>
      </div>

      {/* RECOVERY TIMELINE */}
      <Timeline totalHours={totalHours} />
    </div>
  );
}

// --- COMPONENT 3: TIMELINE ---
function Timeline({ totalHours }) {
  const milestones = [
    { hours: 8, title: "Carbon Monoxide Drops", desc: "Oxygen levels return to normal." },
    { hours: 24, title: "Heart Attack Risk", desc: "Risk begins to drop significantly." },
    { hours: 48, title: "Taste & Smell", desc: "Nerve endings regrow. Food tastes better." },
    { hours: 72, title: "Easier Breathing", desc: "Bronchial tubes relax. Energy increases." },
    { hours: 336, title: "Withdrawal Ends", desc: "Most physical cravings disappear (2 weeks)." },
    { hours: 720, title: "Lung Repair", desc: "Lung function improves up to 30% (1 month)." }
  ];

  const next = milestones.find(m => m.hours > totalHours);
  const completed = milestones.filter(m => m.hours <= totalHours);

  return (
    <div className="timeline-box">
      <div className="timeline-header">
        <Trophy size={18} className="gold-icon" />
        <h3>Recovery Timeline</h3>
      </div>

      {next ? (
        <div className="next-goal">
          <div className="goal-info">
            <h4>Next: {next.title}</h4>
            <small>{(next.hours - totalHours).toFixed(1)} hours to go</small>
          </div>
          <div className="progress-bar">
            <div 
              className="fill" 
              style={{ width: `${(totalHours / next.hours) * 100}%` }}
            ></div>
          </div>
          <p className="goal-desc">{next.desc}</p>
        </div>
      ) : (
        <div className="all-done">
          <Smile size={30} />
          <p>All milestones crushed! You are free.</p>
        </div>
      )}

      <div className="history">
        {completed.slice().reverse().map((m, i) => (
          <div key={i} className="history-item">
            <CheckCircle size={14} className="check-icon" />
            <span>{m.title} <span style={{ opacity: 0.5, fontSize: '0.85em', marginLeft: '6px' }}>({m.hours}h)</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;