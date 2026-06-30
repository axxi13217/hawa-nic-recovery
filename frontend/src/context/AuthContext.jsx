import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('hawaToken');
    if (!token) {
      setLoading(false);
      return;
    }
    api.get('/api/auth/me')
      .then(res => setUser(res.data.user))
      .catch(() => localStorage.removeItem('hawaToken'))
      .finally(() => setLoading(false));
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('hawaToken', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('hawaToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}