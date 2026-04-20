import { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Keep a ref always pointing at the latest user so refreshUser closure never goes stale
  const userRef = useRef(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    const stored = localStorage.getItem('lms_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      userRef.current = parsed;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const data = res.data;
      const userData = {
        id: data.userId,
        name: data.name,
        email: data.email,
        role: data.role.toLowerCase(),
        token: data.token,
        universityId: data.universityId,
        profile: data.profile,
      };
      setUser(userData);
      userRef.current = userData;
      localStorage.setItem('lms_user', JSON.stringify(userData));
      localStorage.setItem('token', data.token);
      return { success: true, user: userData };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || 'Invalid credentials',
      };
    }
  };

  const signup = async (data, role) => {
    try {
      const endpoint =
        role === 'student' ? '/auth/student/signup' : '/auth/instructor/signup';
      const res = await api.post(endpoint, data);
      const resData = res.data;
      const userData = {
        id: resData.userId,
        name: resData.name,
        email: resData.email,
        role: resData.role.toLowerCase(),
        token: resData.token,
        universityId: resData.universityId,
        profile: resData.profile,
      };
      setUser(userData);
      userRef.current = userData;
      localStorage.setItem('lms_user', JSON.stringify(userData));
      localStorage.setItem('token', resData.token);
      return { success: true, user: userData };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || 'Signup failed',
      };
    }
  };

  const logout = () => {
    setUser(null);
    userRef.current = null;
    localStorage.removeItem('lms_user');
    localStorage.removeItem('token');
  };

  const updateUser = async (updates) => {
    try {
      const res = await api.put('/users/me', updates);
      const updatedUser = { ...userRef.current, profile: res.data.profile };
      setUser(updatedUser);
      userRef.current = updatedUser;
      localStorage.setItem('lms_user', JSON.stringify(updatedUser));
      return { success: true };
    } catch (err) {
      console.error('Failed to update user profile', err);
      return { success: false, error: err.response?.data?.error };
    }
  };

  const updateLocalUser = (updatedUser) => {
    setUser(updatedUser);
    userRef.current = updatedUser;
    localStorage.setItem('lms_user', JSON.stringify(updatedUser));
  };

  // Silently re-fetches /users/me, merges, syncs state + localStorage.
  // Uses userRef so it never closes over a stale user value.
  // Returns the fresh merged user, or null on network failure.
  const refreshUser = async () => {
    try {
      const res = await api.get('/users/me');
      const data = res.data;
      const current = userRef.current;
      if (!current) return null;
      const freshUser = {
        ...current,
        name: data.name ?? current.name,
        email: data.email ?? current.email,
        universityId: data.universityId ?? current.universityId,
        profile: data.profile ?? current.profile,
      };
      setUser(freshUser);
      userRef.current = freshUser;
      localStorage.setItem('lms_user', JSON.stringify(freshUser));
      return freshUser;
    } catch (err) {
      console.warn('refreshUser failed silently:', err?.response?.status);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, updateUser, updateLocalUser, refreshUser }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);