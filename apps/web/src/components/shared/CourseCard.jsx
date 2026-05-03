import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { enrollInCourse } from '../../api/studentApi';

// Modern Lucide Icons
import {
  Star, Users, Clock, Play, Heart, Bookmark, CheckCircle2, Award, MessageSquare
} from 'lucide-react';

const categoryConfig = {
  AIML: { badgeStyles: 'bg-primary-500/12 text-primary-300 border-primary-400/30' },
  Cloud: { badgeStyles: 'bg-accent-500/12 text-accent-400 border-accent-400/30' },
  DataScience: { badgeStyles: 'bg-warning-500/12 text-warning-400 border-warning-400/30' },
  Cybersecurity: { badgeStyles: 'bg-error-500/12 text-error-400 border-error-400/30' },
};

export default function CourseCard({
  course,
  enrolled = false,
  favorited = false,
  size = 'normal',
  completed = false,
  score = null,
  progress = 0,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [favoritePending, setFavoritePending] = useState(false);
  const hoverTimeoutRef = useRef(null);

  const navigate = useNavigate();
  const { user, updateLocalUser } = useAuth();
  const { toggleFavorite, rateCourse } = useApp();

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const hasReviewed = course.reviews?.some(r => r.studentId === user?.id);

  const cfg = categoryConfig[course.category] || categoryConfig.AIML;
  const courseProgress = enrolled ? Math.max(0, Math.min(100, Number(progress) || 0)) : 0;
  const imgHeight = size === 'small' ? 'h-36' : 'h-48';
  const borderColor = completed ? 'border-success-400/20' : 'border-border-subtle';

  const handleMouseEnter = () => {
    // 350ms delay keeps fast scrolling smooth without flashing cards
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 350);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(false);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const handleCardClick = () => {
    if (user?.role === 'student') {
      if (enrolled) {
        navigate(`/student/course/${course.id}/learn`);
      } else {
        navigate(`/student/course/${course.id}`);
      }
    }
  };

  const handleEnroll = async (e) => {
    e.stopPropagation();
    try {
      await enrollInCourse(course.id);
      const currentEnrolled = user?.profile?.enrolledCourses || user?.enrolledCourses || [];
      if (!currentEnrolled.includes(course.id)) {
        updateLocalUser({
          ...user,
          profile: {
            ...(user.profile || {}),
            enrolledCourses: [...currentEnrolled, course.id]
          }
        });
      }
      // Assuming we navigate after enrollment
      navigate(`/student/course/${course.id}/learn`);
    } catch (err) {
      console.error("Failed to enroll", err);
      alert(err.response?.data?.error || "Failed to enroll. Please try again.");
    }
  };

  const handleFavorite = async (e) => {
    e.stopPropagation();
    if (favoritePending) return;

    setFavoritePending(true);
    try {
      await toggleFavorite(course.id);
    } finally {
      setFavoritePending(false);
    }
  };

  const renderCardInner = (isOverlay = false) => (
    <>
      {/* Outer Glow Effect on Hover (Softer if completed) */}
      {isOverlay && (
        <div className={`pointer-events-none absolute -inset-1 rounded-lg bg-gradient-to-br from-primary-500/0 via-primary-500/0 to-primary-500/0 opacity-0 blur-xl transition-all duration-500 group-hover:from-primary-500/20 group-hover:to-transparent group-hover:opacity-100 ${completed ? 'group-hover:from-accent-500/10' : ''}`} />
      )}

      {/* Thumbnail Header */}
      <div className={`relative ${imgHeight} w-full shrink-0 overflow-hidden bg-bg-base ${completed ? 'opacity-85' : ''}`}>
        {!imgLoaded && (
          <div className="absolute inset-0 bg-white/5 animate-pulse" />
        )}

        <img
          src={course.thumbnail}
          alt={course.title}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${imgLoaded ? 'opacity-100' : 'opacity-0'} ${isOverlay ? 'scale-110' : 'scale-100'} ${completed ? 'grayscale-[30%]' : ''}`}
        />

        <div className={`absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/40 to-transparent opacity-90 ${completed ? 'bg-bg-base/20' : ''}`} />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {completed ? (
            <span className="rounded-full border border-success-400/30 bg-success-500/15 px-2.5 py-0.5 text-[0.65rem] font-bold tracking-wide text-success-400 backdrop-blur-sm">
              Completed
            </span>
          ) : (
            <span className={`px-2.5 py-0.5 rounded-full text-[0.65rem] font-syne font-bold border backdrop-blur-sm tracking-wide ${cfg.badgeStyles}`}>
              {course.category}
            </span>
          )}
        </div>

        {!completed && (
          <div className="absolute top-3 right-3">
            <span className="rounded-full border border-white/10 bg-black/50 px-2.5 py-0.5 text-[0.65rem] font-bold tracking-wide text-primary-200 backdrop-blur-sm">
              {course.level}
            </span>
          </div>
        )}

        {/* Play Button Overlay (Framer Motion handled visibility) */}
        {!completed && isOverlay && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-500/90 pl-1 text-white shadow-glow backdrop-blur-md">
              <Play className="fill-current w-6 h-6" />
            </div>
          </motion.div>
        )}

        {/* Progress Bar overlay */}
        {enrolled && courseProgress > 0 && !completed && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-border-subtle overflow-hidden">
            <div
              className="h-full bg-gradient-accent"
              style={{ width: `${courseProgress}%` }}
            />
          </div>
        )}

        {/* Completed thin bar */}
        {completed && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] overflow-hidden bg-success-500/50 shadow-glow-accent" />
        )}
      </div>

      {/* Card Body */}
      <div className="relative z-10 flex flex-1 flex-col bg-transparent p-5">
        <h3 className={`mb-1.5 font-display text-[0.95rem] font-bold leading-snug ${isOverlay ? 'line-clamp-none' : 'line-clamp-2'} ${completed ? 'text-text-primary/90' : 'text-text-primary'}`}>
          {course.title}
        </h3>
        <p className={`mb-4 text-[0.8rem] leading-relaxed text-text-secondary ${isOverlay ? 'line-clamp-none' : 'line-clamp-2'}`}>
          {course.description}
        </p>

        {/* Meta Grid */}
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-warning-400">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-[0.8rem] font-medium text-text-primary">{course.rating?.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-text-secondary">
            <Users className="w-4 h-4" />
            <span className="text-[0.8rem]">{course.totalEnrollments?.toLocaleString() || 0}</span>
          </div>
          <div className="flex items-center gap-1.5 text-text-secondary">
            <Clock className="w-4 h-4" />
            <span className="text-[0.8rem]">{course.duration}</span>
          </div>
        </div>

        <p className="text-[0.8rem] text-text-secondary mb-4">
          By <span className="text-primary-400 font-medium">{course.instructor?.approvalStatus === 'REMOVED' ? '[Removed Account]' : (course.instructor?.name || course.instructorName || 'Unknown Instructor')}</span>
        </p>

        {/* Netflix Expanded Section (Tags & Dynamic CTA) */}
        {!completed && isOverlay && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mt-2 mb-2"
          >
            {/* Full width Micro Tags */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {course.tags?.map(tag => (
                <span key={tag} className="px-2 py-1 bg-white/[0.03] border border-border-subtle rounded text-[0.65rem] text-text-secondary">
                  {tag}
                </span>
              ))}
            </div>

            {/* Expanded Action Buttons (More Prominent) */}
            {user?.role === 'student' && (
              <div className="flex gap-2.5 pt-2">
                {enrolled ? (
              <button
                onClick={handleCardClick}
                    className="flex flex-1 cursor-pointer flex-row items-center justify-center gap-2 rounded-lg bg-gradient-primary py-3 text-[0.85rem] font-semibold text-white shadow-glow transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    {courseProgress > 0 ? 'Resume Course' : 'Start Course'}
                  </button>
                ) : (
                  <button
                    onClick={handleEnroll}
                    className="flex flex-1 cursor-pointer flex-row items-center justify-center gap-2 rounded-lg border border-border-subtle bg-white/[0.03] py-3 text-[0.85rem] font-medium text-white transition-all hover:scale-[1.02] hover:border-primary-400/50 hover:bg-primary-500/10 active:scale-95"
                  >
                    <Bookmark className="w-4 h-4" />
                    Enroll Now
                  </button>
                )}

                <button
                  onClick={handleFavorite}
                  disabled={favoritePending}
                  className={`flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-all hover:scale-[1.05] active:scale-95 ${favorited
                    ? 'border border-error-400/30 bg-error-500/15 text-error-400'
                    : 'bg-white/[0.03] border border-border-subtle text-text-secondary hover:text-white'
                    }`}
                >
                  <Heart className={`w-5 h-5 ${favorited ? 'fill-current' : ''}`} />
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Minimal Actions Footer (Only shows on base un-hovered card if needed, or if instructor) */}
        {user?.role === 'student' && !completed && !isOverlay && (
          <div className="flex gap-2.5 mt-auto pt-2">
            {enrolled ? (
              <button
                onClick={handleCardClick}
                className="flex flex-1 flex-row items-center justify-center gap-2 rounded-lg bg-gradient-primary py-2 text-[0.8rem] font-semibold text-white shadow-glow"
              >
                <Play className="w-4 h-4 fill-current" />
                {courseProgress > 0 ? 'Continue' : 'Start Learning'}
              </button>
            ) : (
              <button
                onClick={handleEnroll}
                className="flex flex-1 flex-row items-center justify-center gap-2 rounded-lg border border-border-subtle bg-white/[0.03] py-2 text-[0.8rem] font-medium text-white"
              >
                <Bookmark className="w-4 h-4" />
                Enroll Free
              </button>
            )}
          </div>
        )}

        {/* Completed Status / Score */}
        {completed && (
          <div className="mb-4 pt-4 border-t border-border-subtle/50 flex justify-between items-center mt-auto">
            <div className="flex items-center gap-1.5 text-success-400">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-[0.75rem] font-bold">Achieved</span>
            </div>
            {score && (
              <span className="text-text-secondary text-[0.75rem]">
                Score: <span className="text-white font-medium">{score}%</span>
              </span>
            )}
          </div>
        )}

        {/* Actions Footer For Completed (No pop-out needed, just standard) */}
        {user?.role === 'student' && completed && (
          <div className="flex gap-2.5 mt-auto pt-4 flex-wrap sm:flex-nowrap">
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/student/certificate/${course.id}`); }}
              className="flex flex-1 cursor-pointer flex-row items-center justify-center gap-1.5 rounded-lg border border-success-400/20 bg-success-500/10 py-2 text-[0.75rem] font-medium text-success-400 transition-all hover:scale-[1.02] hover:bg-success-500/20 active:scale-95"
            >
              <Award className="w-3.5 h-3.5" />
              Certificate
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowReviewModal(true); setReviewRating(0); setReviewText(''); }}
              disabled={hasReviewed}
              className={`flex-1 flex flex-row items-center justify-center gap-1.5 rounded-lg py-2 text-[0.75rem] transition-all border font-medium cursor-pointer ${hasReviewed
                  ? 'border-border-subtle bg-white/5 text-text-tertiary disabled:cursor-not-allowed'
                  : 'border-border-subtle bg-white/[0.03] text-white hover:scale-[1.02] hover:border-warning-400/50 hover:bg-warning-500/10 hover:text-warning-400 active:scale-95'
                }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              {hasReviewed ? 'Reviewed' : 'Write Review'}
            </button>
          </div>
        )}

      </div>
    </>
  );

  return (
    <div
      className="relative w-full h-full group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* BASE CARD (Stays in flow to maintain grid height constraints) */}
      <div
        className={`glass-card relative z-0 flex h-full w-full flex-col overflow-hidden rounded-lg border ${borderColor} opacity-100 ${isHovered && !completed ? 'lg:invisible' : ''}`}
        onClick={handleCardClick}
      >
        {renderCardInner(false)}
      </div>

      {/* OVERLAY CARD (Netflix Pop-out Effect - Absolutely positioned over the base card) */}
      {/* We only show the overlay on desktop/large screens to avoid mobile layout breaking */}
      <AnimatePresence>
        {isHovered && !completed && (
          <motion.div
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 1.10, y: -10 }}
            exit={{ opacity: 0, scale: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="glass-lg absolute left-0 top-0 z-50 hidden w-full origin-center cursor-pointer flex-col overflow-hidden rounded-lg border border-border-strong shadow-strong lg:flex"
            onClick={handleCardClick}
          >
            {renderCardInner(true)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Modal portal structure */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => { e.stopPropagation(); setShowReviewModal(false); }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-default"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-lg relative flex w-full max-w-md cursor-default flex-col items-center rounded-lg p-8 text-center shadow-strong"
              onClick={e => e.stopPropagation()} // Stop bubbling to card
            >
              <h3 className="mb-2 font-display text-2xl font-bold text-text-primary">Review Course</h3>
              <p className="text-text-secondary font-medium mb-6 line-clamp-1">"{course.title}"</p>

              <div className="flex justify-center gap-2 mb-6 cursor-pointer">
                {[1, 2, 3, 4, 5].map((starIndex) => (
                  <Star
                    key={starIndex}
                    onClick={(e) => { e.stopPropagation(); setReviewRating(starIndex); }}
                    className={`w-12 h-12 transition-all hover:scale-110 ${reviewRating >= starIndex
                        ? 'fill-warning-400 text-warning-400'
                        : 'fill-white/5 text-white/10'
                      }`}
                  />
                ))}
              </div>

              <textarea
                rows={3}
                placeholder="What did you think of the course? (optional)"
                value={reviewText}
                onClick={e => e.stopPropagation()}
                onChange={e => setReviewText(e.target.value)}
                className="glass-input mb-6 w-full cursor-text resize-none rounded-lg p-4 text-text-primary outline-none"
              />

              <div className="flex gap-3 w-full">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowReviewModal(false); }}
                  className="flex-1 cursor-pointer rounded-lg border border-border-subtle py-3 font-bold text-text-secondary transition-colors hover:bg-white/[0.06] hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  disabled={!reviewRating}
                  onClick={(e) => {
                    e.stopPropagation();
                    rateCourse(course.id, reviewRating, reviewText);
                    setShowReviewModal(false);
                  }}
                  className="flex-[2] cursor-pointer rounded-lg bg-gradient-warning py-3 font-display font-bold text-bg-base shadow-glow transition-all disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Submit Review
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
