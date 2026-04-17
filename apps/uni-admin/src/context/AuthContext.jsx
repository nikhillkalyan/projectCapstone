import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('uniAdminUser');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('uniAdminToken'));
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!token && !!user;

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const data = res.data;

      // Ensure user is a UNIVERSITY_ADMIN
      if (data.role !== 'UNIVERSITY_ADMIN') {
        throw new Error('Access denied. University Admin credentials required.');
      }

      const userData = {
        id: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
        avatarUrl: data.profile?.avatarUrl || null,
        universityName: data.profile?.universityName || null,
      };

      localStorage.setItem('uniAdminToken', data.token);
      localStorage.setItem('uniAdminUser', JSON.stringify(userData));
      setToken(data.token);
      setUser(userData);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || err.message || 'Login failed';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('uniAdminToken');
    localStorage.removeItem('uniAdminUser');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
