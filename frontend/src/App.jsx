import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Timeline from './pages/Timeline';
import Analytics from './pages/Analytics';
import Achievements from './pages/Achievements';
import './App.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="card">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-container"><div className="card">Loading...</div></div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />
      <Route path="/dashboard" element={
  <ProtectedRoute><Dashboard /></ProtectedRoute>
} />
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
      <Route path="/timeline" element={
  <ProtectedRoute><Timeline /></ProtectedRoute>
} />
      <Route path="/analytics" element={
  <ProtectedRoute><Analytics /></ProtectedRoute>
} />
      <Route path="/achievements" element={
  <ProtectedRoute><Achievements /></ProtectedRoute>
} />
    </Routes>
  );
}

function AppLayout() {
  const location = useLocation();
  const isWide = location.pathname === '/analytics';

  return (
    <div className={`app-container ${isWide ? 'wide' : ''}`}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;