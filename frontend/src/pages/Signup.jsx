import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function Signup() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', cigsPerDay: '', costPerPack: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/signup', formData);
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h1>Hawa</h1>
      <p className="subtitle">Start your recovery</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input required value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" required value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" required minLength={8} value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })} />
        </div>
        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label>Cigarettes / Day</label>
            <input type="number" required value={formData.cigsPerDay}
              onChange={e => setFormData({ ...formData, cigsPerDay: e.target.value })} />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Cost / Pack</label>
            <input type="number" required value={formData.costPerPack}
              onChange={e => setFormData({ ...formData, costPerPack: e.target.value })} />
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating account...' : 'Start Tracking'}
        </button>
      </form>

      <p className="switch-link">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}

export default Signup;