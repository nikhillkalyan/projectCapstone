import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

// Modern Lucide Icons
import {
  Star, Users, Clock, Play, Heart, Bookmark, CheckCircle2, Award
} from 'lucide-react';

const categoryConfig = {
  AIML: { badgeStyles: 'bg-primary-900 text-primary-400 border-primary-500/30' },
  Cloud: { badgeStyles: 'bg-teal-500/10 text-teal-400 border-teal-500/30' },
  DataScience: { badgeStyles: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  Cybersecurity: { badgeStyles: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
};

export default function CourseCard({
  course,
  enrolled = false,
  favorited = false,
  size = 'normal',
  completed = false,
  score = null
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const hoverTimeoutRef = useRef(null);

  const navigate = useNavigate();
  const { user } = useAuth();
  const { enrollCourse, toggleFavorite, getCourseProgress } = useApp();

  const cfg = categoryConfig[course.category] || categoryConfig.AIML;
  const progress = enrolled ? getCourseProgress(course.id) : 0;
  const imgHeight = size === 'small' ? 'h-36' : 'h-48';
  const borderColor = completed ? 'border-teal-500/15' : 'border-border-subtle';

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

  const handleEnroll = (e) => {
    e.stopPropagation();
    enrollCourse(course.id);
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    toggleFavorite(course.id);
  };

  const renderCardInner = (isOverlay = false) => (
    <>
      {/* Outer Glow Effect on Hover (Softer if completed) */}
      {isOverlay && (
        <div className={`absolute -inset-1 bg-gradient-to-br from-primary-500/0 via-primary-500/0 to-primary-500/0 opacity-0 group-hover:from-primary-500/20 group-hover:to-transparent group-hover:opacity-100 transition-all duration-500 blur-xl pointer-events-none rounded-[2rem] ${completed ? 'group-hover:from-teal-500/10' : ''}`} />
      )}

      {/* Thumbnail Header */}
      <div className={`relative ${imgHeight} w-full overflow-hidden bg-bg-base shrink-0 ${completed ? 'opacity-85' : ''}`}>
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
            <span className="px-2.5 py-0.5 rounded-full text-[0.65rem] font-syne font-bold border backdrop-blur-sm tracking-wide bg-teal-500/15 text-teal-400 border-teal-500/30">
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
            <span className="px-2.5 py-0.5 rounded-full text-[0.65rem] font-syne font-bold border border-white/10 bg-black/50 text-[#E2D9BE] backdrop-blur-sm tracking-wide">
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
            <div className="w-14 h-14 rounded-full bg-primary-500/90 backdrop-blur-md shadow-[0_0_30px_rgba(108,127,216,0.5)] flex items-center justify-center text-white pl-1">
              <Play className="fill-current w-6 h-6" />
            </div>
          </motion.div>
        )}

        {/* Progress Bar overlay */}
        {enrolled && progress > 0 && !completed && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-border-subtle overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-teal-400"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Completed thin bar */}
        {completed && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-teal-500/50 overflow-hidden shadow-[0_0_10px_rgba(78,205,196,0.3)]" />
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col relative z-10 bg-bg-surface">
        <h3 className={`font-syne font-bold text-[0.95rem] mb-1.5 leading-snug ${isOverlay ? 'line-clamp-none' : 'line-clamp-2'} ${completed ? 'text-text-primary/90' : 'text-text-primary'}`}>
          {course.title}
        </h3>
        <p className={`font-dmsans text-text-secondary text-[0.8rem] mb-4 leading-relaxed ${isOverlay ? 'line-clamp-none' : 'line-clamp-2'}`}>
          {course.description}
        </p>

        {/* Meta Grid */}
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-[#D4A843]">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-[0.8rem] font-medium text-text-primary">{course.rating?.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-text-secondary">
            <Users className="w-4 h-4" />
            <span className="text-[0.8rem]">{course.enrolledCount?.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-text-secondary">
            <Clock className="w-4 h-4" />
            <span className="text-[0.8rem]">{course.duration}</span>
          </div>
        </div>

        <p className="text-[0.8rem] text-text-secondary mb-4">
          By <span className="text-primary-400 font-medium">{course.instructorName}</span>
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
                    className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:shadow-[0_8px_24px_rgba(108,127,216,0.25)] text-white font-semibold flex flex-row items-center justify-center gap-2 rounded-xl py-3 text-[0.85rem] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    {progress > 0 ? 'Resume Course' : 'Start Course'}
                  </button>
                ) : (
                  <button
                    onClick={handleEnroll}
                    className="flex-1 bg-white/[0.03] border border-border-subtle hover:border-primary-500 hover:bg-primary-500/10 text-white font-medium flex flex-row items-center justify-center gap-2 rounded-xl py-3 text-[0.85rem] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                  >
                    <Bookmark className="w-4 h-4" />
                    Enroll Now
                  </button>
                )}

                <button
                  onClick={handleFavorite}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all hover:scale-[1.05] active:scale-95 cursor-pointer ${favorited
                    ? 'bg-rose-500/15 border border-rose-500/30 text-rose-500'
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
                className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold flex flex-row items-center justify-center gap-2 rounded-xl py-2 text-[0.8rem]"
              >
                <Play className="w-4 h-4 fill-current" />
                {progress > 0 ? 'Continue' : 'Start Learning'}
              </button>
            ) : (
              <button
                onClick={handleEnroll}
                className="flex-1 bg-white/[0.03] border border-border-subtle text-white font-medium flex flex-row items-center justify-center gap-2 rounded-xl py-2 text-[0.8rem]"
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
            <div className="flex items-center gap-1.5 text-teal-400">
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
          <div className="flex gap-2.5 mt-auto pt-4">
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/student/certificate/${course.id}`); }}
              className="flex-1 bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 text-teal-400 font-medium flex flex-row items-center justify-center gap-1.5 rounded-xl py-2 text-[0.75rem] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Award className="w-3.5 h-3.5" />
              View Certificate
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
        className={`w-full h-full bg-bg-surface border ${borderColor} rounded-2xl overflow-hidden flex flex-col relative z-0 opacity-100 ${isHovered && !completed ? 'lg:invisible' : ''}`}
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
            className={`hidden lg:flex absolute top-0 left-0 w-full bg-bg-surface border border-border-strong rounded-2xl overflow-hidden flex-col z-50 shadow-[0_20px_50px_rgba(0,0,0,0.8)] cursor-pointer origin-center`}
            onClick={handleCardClick}
          >
            {renderCardInner(true)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}