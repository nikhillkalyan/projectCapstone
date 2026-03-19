import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('lms_user');
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = async (email, password, role) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const userData = res.data.user;
      userData.token = res.data.token;
      setUser(userData);
      localStorage.setItem('lms_user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Invalid credentials' };
    }
  };

  const signup = async (data, role) => {
    try {
      const endpoint = role === 'student' ? '/auth/student/signup' : '/auth/instructor/signup';
      const res = await api.post(endpoint, data);
      const userData = res.data.user;
      userData.token = res.data.token;
      setUser(userData);
      localStorage.setItem('lms_user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Signup failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lms_user');
  };

  const updateUser = async (updates) => {
    try {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('lms_user', JSON.stringify(updatedUser));
      // Optionally sync to backend here when endpoint exists
      // await api.put('/users/me', updates);
    } catch (err) {
      console.error('Failed to update user profile', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);