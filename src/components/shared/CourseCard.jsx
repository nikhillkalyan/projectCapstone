import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

// Modern Lucide Icons replacing MUI System
import {
  Star, Users, Clock, Play, Heart, Bookmark, CheckCircle2
} from 'lucide-react';

const categoryConfig = {
  AIML: { badgeStyles: 'bg-primary-900 text-primary-400 border-primary-500/30' },
  Cloud: { badgeStyles: 'bg-teal-500/10 text-teal-400 border-teal-500/30' },
  DataScience: { badgeStyles: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  Cybersecurity: { badgeStyles: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
};

export default function CourseCard({ course, enrolled = false, favorited = false, size = 'normal' }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { enrollCourse, toggleFavorite, getCourseProgress } = useApp();

  const cfg = categoryConfig[course.category] || categoryConfig.AIML;
  const progress = enrolled ? getCourseProgress(course.id) : 0;
  const imgHeight = size === 'small' ? 'h-36' : 'h-48';

  const handleCardClick = () => {
    if (user?.role === 'student') navigate(`/student/course/${course.id}`);
  };

  const handleEnroll = (e) => {
    e.stopPropagation();
    enrollCourse(course.id);
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    toggleFavorite(course.id);
  };

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      className={`relative group bg-bg-surface border border-border-subtle rounded-2xl overflow-hidden cursor-pointer flex flex-col`}
      // Only applying hover motion, not mount animations as requested
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.3 }}
    >
      {/* Outer Glow Effect on Hover */}
      <div className={`absolute -inset-1 bg-gradient-to-br from-primary-500/0 via-primary-500/0 to-primary-500/0 opacity-0 group-hover:from-primary-500/20 group-hover:to-transparent group-hover:opacity-100 transition-all duration-500 blur-xl pointer-events-none rounded-[2rem]`} />

      {/* Thumbnail Header */}
      <div className={`relative ${imgHeight} w-full overflow-hidden bg-bg-base shrink-0`}>
        {/* Loading Skeleton built with Tailwind */}
        {!imgLoaded && (
          <div className="absolute inset-0 bg-white/5 animate-pulse" />
        )}

        <img
          src={course.thumbnail}
          alt={course.title}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${imgLoaded ? 'opacity-100' : 'opacity-0'
            } ${isHovered ? 'scale-110' : 'scale-100'}`}
        />

        {/* Gradient Overlay for Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/40 to-transparent opacity-90" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[0.65rem] font-syne font-bold border backdrop-blur-sm tracking-wide ${cfg.badgeStyles}`}>
            {course.category}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-0.5 rounded-full text-[0.65rem] font-syne font-bold border border-white/10 bg-black/50 text-[#E2D9BE] backdrop-blur-sm tracking-wide">
            {course.level}
          </span>
        </div>

        {/* Play Button Overlay (Framer Motion handled visibility) */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="w-14 h-14 rounded-full bg-primary-500/90 backdrop-blur-md shadow-[0_0_30px_rgba(108,127,216,0.5)] flex items-center justify-center text-white pl-1">
                <Play className="fill-current w-6 h-6" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Bar overlay */}
        {enrolled && progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-border-subtle overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-teal-400"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col relative z-10 bg-bg-surface">
        <h3 className="font-syne font-bold text-[0.95rem] text-text-primary mb-1.5 leading-snug line-clamp-2">
          {course.title}
        </h3>
        <p className="font-dmsans text-text-secondary text-[0.8rem] mb-4 leading-relaxed line-clamp-2">
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

        {/* Micro Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
          {course.tags?.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-1 bg-white/[0.03] border border-border-subtle rounded text-[0.65rem] text-text-secondary">
              {tag}
            </span>
          ))}
        </div>

        {/* Progress Text Block */}
        {enrolled && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-text-secondary text-[0.75rem]">Progress</span>
              <span className="text-primary-400 text-[0.75rem] font-bold">{progress}%</span>
            </div>
            {progress === 100 && (
              <div className="flex items-center gap-1.5 text-[#4ECDC4] mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="text-[0.75rem] font-bold">Completed</span>
              </div>
            )}
          </div>
        )}

        {/* Actions Footer */}
        {user?.role === 'student' && (
          <div className="flex gap-2.5 mt-auto pt-2">
            {enrolled ? (
              <button
                onClick={handleCardClick}
                className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:shadow-[0_8px_24px_rgba(108,127,216,0.25)] text-white font-semibold flex flex-row items-center justify-center gap-2 rounded-xl py-2 text-[0.8rem] transition-all hover:scale-[1.02]"
              >
                <Play className="w-4 h-4 fill-current" />
                {progress > 0 ? 'Continue' : 'Start Learning'}
              </button>
            ) : (
              <button
                onClick={handleEnroll}
                className="flex-1 bg-white/[0.03] border border-border-subtle hover:border-primary-500 hover:bg-primary-500/10 text-white font-medium flex flex-row items-center justify-center gap-2 rounded-xl py-2 text-[0.8rem] transition-all"
              >
                <Bookmark className="w-4 h-4" />
                Enroll Free
              </button>
            )}

            <button
              onClick={handleFavorite}
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all hover:scale-[1.05] ${favorited
                  ? 'bg-rose-500/15 border border-rose-500/30 text-rose-500'
                  : 'bg-white/[0.03] border border-border-subtle text-text-secondary hover:text-white'
                }`}
            >
              <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}