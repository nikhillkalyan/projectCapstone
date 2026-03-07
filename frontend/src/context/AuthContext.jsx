import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../data/mockDatabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('lms_user');
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = (email, password, role) => {
    const users = role === 'student' ? db.students : db.instructors;
    const found = users.find(u => u.email === email && u.password === password);
    if (found) {
      const userData = { ...found, role };
      setUser(userData);
      localStorage.setItem('lms_user', JSON.stringify(userData));
      return { success: true, user: userData };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const signup = (data, role) => {
    if (role === 'student') {
      const newStudent = { ...data, id: `s${Date.now()}`, role: 'student', enrolledCourses: [], favoriteCourses: [], completedCourses: [], progress: {} };
      db.students.push(newStudent);
      setUser(newStudent);
      localStorage.setItem('lms_user', JSON.stringify(newStudent));
      return { success: true, user: newStudent };
    } else {
      const newInstructor = { ...data, id: `i${Date.now()}`, role: 'instructor', courses: [] };
      db.instructors.push(newInstructor);
      setUser(newInstructor);
      localStorage.setItem('lms_user', JSON.stringify(newInstructor));
      return { success: true, user: newInstructor };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lms_user');
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('lms_user', JSON.stringify(updated));
    if (user.role === 'student') {
      const idx = db.students.findIndex(s => s.id === user.id);
      if (idx !== -1) db.students[idx] = updated;
    } else {
      const idx = db.instructors.findIndex(i => i.id === user.id);
      if (idx !== -1) db.instructors[idx] = updated;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);