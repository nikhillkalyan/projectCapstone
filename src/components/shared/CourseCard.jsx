import { useState } from 'react';
import { Star, Users, Clock, Play, Heart, BookmarkPlus, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

const categoryColors = {
  AIML: { badge: 'badge-aiml', glow: 'rgba(107, 127, 212, 0.4)' },
  Cloud: { badge: 'badge-cloud', glow: 'rgba(78, 205, 196, 0.4)' },
  DataScience: { badge: 'badge-datascience', glow: 'rgba(212, 168, 67, 0.4)' },
  Cybersecurity: { badge: 'badge-cybersecurity', glow: 'rgba(231, 76, 111, 0.4)' },
};

export default function CourseCard({ course, enrolled = false, favorited = false, size = 'normal' }) {
  const [hovered, setHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { enrollCourse, toggleFavorite, getCourseProgress } = useApp();
  
  const colors = categoryColors[course.category] || categoryColors.AIML;
  const progress = enrolled ? getCourseProgress(course.id) : 0;

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
    <div
      className="netflix-card rounded-2xl overflow-hidden group"
      style={{ 
        boxShadow: hovered ? `0 20px 60px ${colors.glow}, 0 0 0 1px rgba(255,255,255,0.05)` : '0 4px 20px rgba(0,0,0,0.3)',
        transform: hovered ? 'scale(1.04) translateY(-6px)' : 'scale(1) translateY(0)',
        transition: 'all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        zIndex: hovered ? 10 : 1
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleCardClick}
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden" style={{ height: size === 'small' ? '140px' : '180px' }}>
        {!imgLoaded && <div className="skeleton absolute inset-0" />}
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onLoad={() => setImgLoaded(true)}
          style={{ opacity: imgLoaded ? 1 : 0 }}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className={`badge ${colors.badge}`}>{course.category}</span>
        </div>

        {/* Level badge */}
        <div className="absolute top-3 right-3">
          <span className="badge" style={{ background: 'rgba(0,0,0,0.5)', color: 'var(--cream)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}>
            {course.level}
          </span>
        </div>

        {/* Play button on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(107, 127, 212, 0.9)', backdropFilter: 'blur(8px)' }}>
            <Play size={22} className="text-white ml-1" fill="white" />
          </div>
        </div>

        {/* Progress bar if enrolled */}
        {enrolled && progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: 'rgba(0,0,0,0.4)' }}>
            <div className="h-full transition-all duration-1000" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #6B7FD4, #4ECDC4)' }} />
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4" style={{ background: 'rgba(25, 30, 48, 0.95)' }}>
        <h3 className="font-bold text-sm mb-1 leading-tight line-clamp-2" style={{ color: 'var(--cream)', fontFamily: 'Syne' }}>
          {course.title}
        </h3>
        <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--steel)' }}>
          {course.description}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs mb-3" style={{ color: 'var(--steel)' }}>
          <span className="flex items-center gap-1">
            <Star size={11} className="text-yellow-400" fill="#FACC15" />
            <span style={{ color: 'var(--cream)' }}>{course.rating?.toFixed(1)}</span>
          </span>
          <span className="flex items-center gap-1">
            <Users size={11} />
            {course.enrolledCount?.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {course.duration}
          </span>
        </div>

        <p className="text-xs mb-4" style={{ color: 'var(--steel)' }}>
          By <span style={{ color: 'var(--accent-light)' }}>{course.instructorName}</span>
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {course.tags?.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-0.5 text-xs rounded-full" style={{ background: 'rgba(172, 186, 196, 0.1)', color: 'var(--steel)', fontSize: '10px' }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Progress text if enrolled */}
        {enrolled && (
          <div className="mb-3 text-xs" style={{ color: 'var(--steel)' }}>
            Progress: <span style={{ color: 'var(--accent-light)' }}>{progress}%</span>
            {progress === 100 && <span className="ml-2" style={{ color: 'var(--success)' }}>✓ Completed</span>}
          </div>
        )}

        {/* Actions */}
        {user?.role === 'student' && (
          <div className="flex gap-2">
            {enrolled ? (
              <button
                onClick={handleCardClick}
                className="btn-primary flex-1 py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                <Play size={13} fill="white" /> {progress > 0 ? 'Continue' : 'Start Learning'}
              </button>
            ) : (
              <button
                onClick={handleEnroll}
                className="btn-primary flex-1 py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                <BookmarkPlus size={13} /> Enroll Free
              </button>
            )}
            <button
              onClick={handleFavorite}
              className="p-2.5 rounded-xl transition-all duration-200"
              style={{ 
                background: favorited ? 'rgba(231, 76, 111, 0.2)' : 'rgba(172, 186, 196, 0.1)',
                border: `1px solid ${favorited ? 'rgba(231, 76, 111, 0.4)' : 'rgba(172, 186, 196, 0.2)'}`
              }}
            >
              <Heart size={15} style={{ color: favorited ? '#E74C6F' : 'var(--steel)' }} fill={favorited ? '#E74C6F' : 'none'} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}