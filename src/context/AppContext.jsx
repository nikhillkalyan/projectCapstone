import { createContext, useContext, useState } from 'react';
import { db } from '../data/mockDatabase';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { user, updateUser } = useAuth();
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const enrollCourse = (courseId) => {
    if (!user || user.role !== 'student') return;
    if (user.enrolledCourses?.includes(courseId)) return;
    const enrolled = [...(user.enrolledCourses || []), courseId];
    updateUser({ enrolledCourses: enrolled });
    // Update course enrollment count
    const course = db.courses.find(c => c.id === courseId);
    if (course) course.enrolledCount = (course.enrolledCount || 0) + 1;
    showNotification('Successfully enrolled in course!');
  };

  const toggleFavorite = (courseId) => {
    if (!user || user.role !== 'student') return;
    const favs = user.favoriteCourses || [];
    const isFav = favs.includes(courseId);
    const updated = isFav ? favs.filter(id => id !== courseId) : [...favs, courseId];
    updateUser({ favoriteCourses: updated });
    showNotification(isFav ? 'Removed from favorites' : 'Added to favorites!');
  };

  const updateProgress = (courseId, chapterId, data) => {
    if (!user) return;
    const progress = user.progress || {};
    if (!progress[courseId]) progress[courseId] = {};
    progress[courseId][chapterId] = { ...progress[courseId][chapterId], ...data };
    updateUser({ progress });
  };

  const submitAssessment = (courseId, chapterId, answers, questions) => {
    let score = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correct) score++;
    });
    const percentage = Math.round((score / questions.length) * 100);
    updateProgress(courseId, chapterId, { assessmentScore: percentage, assessmentCompleted: true });
    
    // Save to db for instructor visibility
    if (!db.assessmentResults[user.id]) db.assessmentResults[user.id] = {};
    if (!db.assessmentResults[user.id][courseId]) db.assessmentResults[user.id][courseId] = {};
    db.assessmentResults[user.id][courseId][chapterId] = { score: percentage, completedAt: new Date().toISOString() };
    
    return percentage;
  };

  const completeCourse = (courseId, grandTestScore) => {
    if (!user) return;
    const completed = [...(user.completedCourses || []), { courseId, score: grandTestScore, completedAt: new Date().toISOString() }];
    updateUser({ completedCourses: completed });
    showNotification('🎉 Congratulations! Course completed!', 'success');
  };

  const rateCourse = (courseId, rating, review) => {
    const course = db.courses.find(c => c.id === courseId);
    if (!course) return;
    if (!course.reviews) course.reviews = [];
    course.reviews.push({ studentId: user.id, studentName: user.name, rating, review, date: new Date().toISOString() });
    course.rating = course.reviews.reduce((a, r) => a + r.rating, 0) / course.reviews.length;
    showNotification('Thank you for your review!');
  };

  const sendMessage = (toId, courseId, message) => {
    const msg = {
      id: `msg${Date.now()}`,
      fromId: user.id,
      fromName: user.name,
      fromRole: user.role,
      toId,
      courseId,
      message,
      timestamp: new Date().toISOString(),
      read: false
    };
    db.messages.push(msg);
    return msg;
  };

  const getMessages = (otherId, courseId) => {
    return db.messages.filter(m =>
      ((m.fromId === user?.id && m.toId === otherId) ||
       (m.fromId === otherId && m.toId === user?.id)) &&
      m.courseId === courseId
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  const getCourseProgress = (courseId) => {
    const course = db.courses.find(c => c.id === courseId);
    if (!course || !user) return 0;
    const progress = user.progress?.[courseId] || {};
    const totalChapters = course.chapters?.length || 0;
    const completed = Object.values(progress).filter(p => p.completed).length;
    return totalChapters ? Math.round((completed / totalChapters) * 100) : 0;
  };

  return (
    <AppContext.Provider value={{
      notification, showNotification,
      enrollCourse, toggleFavorite, updateProgress,
      submitAssessment, completeCourse, rateCourse,
      sendMessage, getMessages, getCourseProgress, db
    }}>
      {children}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-2xl text-sm font-semibold transition-all duration-300
          ${notification.type === 'success' ? 'bg-[#30364F] text-[#E1D9BC] border border-[#E1D9BC]/20' : 'bg-red-900 text-red-100'}`}>
          {notification.message}
        </div>
      )}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);