import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X, TriangleAlert } from 'lucide-react';
import { db } from '../data/mockDatabase';
import { useAuth } from './AuthContext';
import { submitReview } from '../api/courseApi';
import {
  getFavoriteCourses as fetchFavoriteCourses,
  toggleFavorite as toggleFavoriteCourse,
} from '../api/studentApi';

const AppContext = createContext(null);

const toastStyles = {
  success: {
    icon: CheckCircle2,
    className: 'border-success-400/25 bg-success-500/12 text-success-400',
  },
  error: {
    icon: AlertCircle,
    className: 'border-error-400/25 bg-error-500/12 text-error-400',
  },
  warning: {
    icon: TriangleAlert,
    className: 'border-warning-400/25 bg-warning-500/12 text-warning-400',
  },
  info: {
    icon: Info,
    className: 'border-info-400/25 bg-info-500/12 text-info-400',
  },
};

export function AppProvider({ children }) {
  const { user, updateUser } = useAuth();
  const [notification, setNotification] = useState(null);
  const [favoriteCourseIds, setFavoriteCourseIds] = useState([]);
  const notificationTimer = useRef(null);
  const favoriteLoadKeyRef = useRef(null);

  const isStudentUser = (candidate) => (
    Boolean(candidate?.token) &&
    typeof candidate?.role === 'string' &&
    candidate.role.toLowerCase() === 'student'
  );

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    window.clearTimeout(notificationTimer.current);
    notificationTimer.current = window.setTimeout(() => setNotification(null), 3000);
  };

  const handleClose = () => {
    window.clearTimeout(notificationTimer.current);
    setNotification(null);
  };

  const refreshFavoriteCourses = async ({ suppressError = false } = {}) => {
    if (!isStudentUser(user)) {
      setFavoriteCourseIds([]);
      return [];
    }

    try {
      const response = await fetchFavoriteCourses();
      const favorites = response.data || [];
      setFavoriteCourseIds(favorites.map(course => course.id).filter(Boolean));
      return favorites;
    } catch (error) {
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        setFavoriteCourseIds([]);
      }
      if (!suppressError && status !== 401 && status !== 403) {
        showNotification('Failed to refresh favorites', 'error');
      }
      throw error;
    }
  };

  useEffect(() => {
    if (!isStudentUser(user)) {
      favoriteLoadKeyRef.current = null;
      setFavoriteCourseIds([]);
      return;
    }

    const loadKey = `${user.id}:${user.token}`;
    if (favoriteLoadKeyRef.current === loadKey) {
      return;
    }

    favoriteLoadKeyRef.current = loadKey;
    refreshFavoriteCourses({ suppressError: true }).catch(err => {
      const status = err.response?.status;
      if (status !== 401 && status !== 403) {
        console.error('Failed to load favorite courses', err);
      }
    });
  }, [user]);

  const enrollCourse = (courseId) => {
    if (!isStudentUser(user)) return;
    if (user.enrolledCourses?.includes(courseId)) return;
    const enrolled = [...(user.enrolledCourses || []), courseId];
    updateUser({ enrolledCourses: enrolled });
    const course = db.courses.find(c => c.id === courseId);
    if (course) course.enrolledCount = (course.enrolledCount || 0) + 1;
    showNotification('Successfully enrolled in course!');
  };

  const toggleFavorite = async (courseId) => {
    if (!isStudentUser(user)) return false;

    const isFav = favoriteCourseIds.includes(courseId);

    try {
      await toggleFavoriteCourse(courseId);
      await refreshFavoriteCourses({ suppressError: true });
      showNotification(isFav ? 'Removed from favorites' : 'Added to favorites!');
      return !isFav;
    } catch (error) {
      console.error('Failed to toggle favorite', error);
      showNotification(error.response?.data?.error || 'Failed to update favorites', 'error');
      return isFav;
    }
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
    questions.forEach((q, i) => { if (answers[i] === q.correct) score++; });
    const percentage = Math.round((score / questions.length) * 100);
    updateProgress(courseId, chapterId, { assessmentScore: percentage, assessmentCompleted: true });
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

  const rateCourse = async (courseId, rating, reviewText) => {
    try {
      if (!user) {
        showNotification('Please log in to submit a review', 'error');
        return;
      }
      await submitReview(courseId, { rating, reviewText });
      showNotification('Thank you for your valuable review!');
    } catch (e) {
      console.error(e);
      showNotification(e.response?.data?.error || 'Failed to submit review', 'error');
    }
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
      read: false,
    };
    db.messages.push(msg);
    return msg;
  };

  const getMessages = (otherId, courseId) => {
    return db.messages
      .filter(m =>
        ((m.fromId === user?.id && m.toId === otherId) ||
         (m.fromId === otherId && m.toId === user?.id)) &&
        m.courseId === courseId
      )
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  return (
    <AppContext.Provider value={{
      notification, showNotification,
      enrollCourse, toggleFavorite, updateProgress,
      submitAssessment, completeCourse, rateCourse,
      sendMessage, getMessages, favoriteCourseIds,
      refreshFavoriteCourses, db,
    }}>
      {children}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            className="fixed right-4 top-4 z-[var(--z-toast)] w-[calc(100vw-2rem)] max-w-sm"
          >
            <Toast notification={notification} onClose={handleClose} />
          </motion.div>
        )}
      </AnimatePresence>
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);

function Toast({ notification, onClose }) {
  const config = toastStyles[notification.type] || toastStyles.success;
  const Icon = config.icon;

  return (
    <div className={`glass-lg flex items-start gap-3 rounded-lg border p-4 shadow-glass ${config.className}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <p className="flex-1 text-sm font-semibold leading-5 text-text-primary">{notification.message}</p>
      <button
        type="button"
        onClick={onClose}
        className="rounded-md p-1 text-text-secondary transition hover:bg-white/[0.06] hover:text-text-primary"
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}
