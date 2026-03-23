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

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const data = res.data;

      // Map backend response to user object
      const userData = {
        id: data.userId,
        name: data.name,
        email: data.email,
        role: data.role.toLowerCase(), // backend sends "STUDENT" → "student"
        token: data.token,
        profile: data.profile,
      };

      setUser(userData);
      localStorage.setItem('lms_user', JSON.stringify(userData));
      localStorage.setItem('token', data.token);
      return { success: true, user: userData };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.error || 'Invalid credentials' 
      };
    }
  };

  const signup = async (data, role) => {
    try {
      const endpoint = role === 'student' 
        ? '/auth/student/signup' 
        : '/auth/instructor/signup';
        
      const res = await api.post(endpoint, data);
      const resData = res.data;

      // Map backend response to user object
      const userData = {
        id: resData.userId,
        name: resData.name,
        email: resData.email,
        role: resData.role.toLowerCase(),
        token: resData.token,
        profile: resData.profile,
      };

      setUser(userData);
      localStorage.setItem('lms_user', JSON.stringify(userData));
      localStorage.setItem('token', resData.token);
      return { success: true, user: userData };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.error || 'Signup failed' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lms_user');
    localStorage.removeItem('token');
  };

  const updateUser = async (updates) => {
    try {
      const res = await api.put('/users/me', updates);
      const updatedUser = { 
        ...user, 
        profile: res.data.profile 
      };
      setUser(updatedUser);
      localStorage.setItem('lms_user', JSON.stringify(updatedUser));
      return { success: true };
    } catch (err) {
      console.error('Failed to update user profile', err);
      return { success: false, error: err.response?.data?.error };
    }
  };

  const updateLocalUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('lms_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser, updateLocalUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);