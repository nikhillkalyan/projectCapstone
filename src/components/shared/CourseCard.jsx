import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import BookmarkAddRoundedIcon from '@mui/icons-material/BookmarkAddRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { ACCENT, ACCENT2, TEAL, STEEL, CREAM, SAND, GOLD, DANGER, NAVY } from '../../theme';

const categoryConfig = {
  AIML: { bg: 'rgba(108,127,216,0.2)', color: ACCENT2, border: 'rgba(108,127,216,0.35)', glow: 'rgba(108,127,216,0.3)' },
  Cloud: { bg: 'rgba(78,205,196,0.2)', color: TEAL, border: 'rgba(78,205,196,0.35)', glow: 'rgba(78,205,196,0.3)' },
  DataScience: { bg: 'rgba(212,168,67,0.2)', color: GOLD, border: 'rgba(212,168,67,0.35)', glow: 'rgba(212,168,67,0.3)' },
  Cybersecurity: { bg: 'rgba(231,76,111,0.2)', color: DANGER, border: 'rgba(231,76,111,0.35)', glow: 'rgba(231,76,111,0.3)' },
};

export default function CourseCard({ course, enrolled = false, favorited = false, size = 'normal' }) {
  const [hovered, setHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { enrollCourse, toggleFavorite, getCourseProgress } = useApp();

  const cfg = categoryConfig[course.category] || categoryConfig.AIML;
  const progress = enrolled ? getCourseProgress(course.id) : 0;
  const imgHeight = size === 'small' ? 150 : 185;

  const handleCardClick = () => {
    if (user?.role === 'student') navigate(`/student/course/${course.id}`);
  };
  const handleEnroll = (e) => { e.stopPropagation(); enrollCourse(course.id); };
  const handleFavorite = (e) => { e.stopPropagation(); toggleFavorite(course.id); };

  return (
    <Card
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleCardClick}
      sx={{
        position: 'relative', cursor: 'pointer', overflow: 'hidden',
        border: '1px solid rgba(139,155,180,0.1)',
        background: 'rgba(16,20,32,0.95)',
        transform: hovered ? 'scale(1.035) translateY(-6px)' : 'scale(1) translateY(0)',
        transition: 'all 0.35s cubic-bezier(.22,.68,0,1.2)',
        boxShadow: hovered
          ? `0 24px 60px ${cfg.glow}, 0 0 0 1px rgba(255,255,255,0.04)`
          : '0 4px 20px rgba(0,0,0,0.35)',
        zIndex: hovered ? 10 : 1,
        borderRadius: 4,
      }}
    >
      {/* Thumbnail */}
      <Box sx={{ position: 'relative', height: imgHeight, overflow: 'hidden' }}>
        {!imgLoaded && <Skeleton variant="rectangular" height={imgHeight} sx={{ background: 'rgba(30,37,53,0.6)' }} />}
        <CardMedia
          component="img"
          image={course.thumbnail}
          alt={course.title}
          onLoad={() => setImgLoaded(true)}
          sx={{
            height: imgHeight, objectFit: 'cover',
            opacity: imgLoaded ? 1 : 0,
            transform: hovered ? 'scale(1.08)' : 'scale(1)',
            transition: 'transform 0.5s ease, opacity 0.3s ease',
          }}
        />

        {/* Gradient overlay */}
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,12,20,0.92) 0%, rgba(8,12,20,0.2) 50%, transparent 100%)' }} />

        {/* Category + level chips */}
        <Box sx={{ position: 'absolute', top: 10, left: 10 }}>
          <Chip label={course.category} size="small"
            sx={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontFamily: '"Syne",sans-serif', fontWeight: 700, fontSize: '0.65rem' }} />
        </Box>
        <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
          <Chip label={course.level} size="small"
            sx={{ background: 'rgba(0,0,0,0.55)', color: SAND, border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)', fontFamily: '"Syne",sans-serif', fontSize: '0.65rem' }} />
        </Box>

        {/* Play button on hover */}
        <Box sx={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: hovered ? 1 : 0, transition: 'opacity 0.3s ease',
        }}>
          <Box sx={{
            width: 52, height: 52, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `rgba(108,127,216,0.88)`, backdropFilter: 'blur(8px)',
            boxShadow: `0 0 24px rgba(108,127,216,0.5)`,
            transform: hovered ? 'scale(1)' : 'scale(0.7)',
            transition: 'transform 0.3s cubic-bezier(.22,.68,0,1.2)',
          }}>
            <PlayArrowRoundedIcon sx={{ color: '#fff', fontSize: 26, ml: '3px' }} />
          </Box>
        </Box>

        {/* Progress bar */}
        {enrolled && progress > 0 && (
          <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 3, borderRadius: 0, '& .MuiLinearProgress-bar': { background: `linear-gradient(90deg, ${ACCENT} 0%, ${TEAL} 100%)` } }} />
          </Box>
        )}
      </Box>

      {/* Card body */}
      <CardContent sx={{ p: 2.2, '&:last-child': { pb: 2.2 } }}>
        <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 700, fontSize: '0.88rem', color: CREAM, mb: 0.7, lineHeight: 1.3,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {course.title}
        </Typography>
        <Typography sx={{ color: STEEL, fontSize: '0.77rem', mb: 1.8, lineHeight: 1.45,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {course.description}
        </Typography>

        {/* Meta row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8, mb: 1.5, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <StarRoundedIcon sx={{ fontSize: 13, color: GOLD }} />
            <Typography sx={{ color: CREAM, fontSize: '0.75rem', fontWeight: 600 }}>{course.rating?.toFixed(1)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <PeopleRoundedIcon sx={{ fontSize: 13, color: STEEL }} />
            <Typography sx={{ color: STEEL, fontSize: '0.75rem' }}>{course.enrolledCount?.toLocaleString()}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <AccessTimeRoundedIcon sx={{ fontSize: 13, color: STEEL }} />
            <Typography sx={{ color: STEEL, fontSize: '0.75rem' }}>{course.duration}</Typography>
          </Box>
        </Box>

        <Typography sx={{ color: STEEL, fontSize: '0.75rem', mb: 1.5 }}>
          By <Box component="span" sx={{ color: ACCENT2 }}>{course.instructorName}</Box>
        </Typography>

        {/* Tags */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, mb: 1.8 }}>
          {course.tags?.slice(0, 3).map(tag => (
            <Chip key={tag} label={tag} size="small"
              sx={{ background: 'rgba(139,155,180,0.08)', color: STEEL, border: '1px solid rgba(139,155,180,0.12)', fontSize: '0.62rem', height: 20 }} />
          ))}
        </Box>

        {/* Progress text */}
        {enrolled && (
          <Box sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ color: STEEL, fontSize: '0.73rem' }}>Progress</Typography>
              <Typography sx={{ color: ACCENT2, fontSize: '0.73rem', fontWeight: 600 }}>{progress}%</Typography>
            </Box>
            {progress === 100 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CheckCircleRoundedIcon sx={{ fontSize: 13, color: TEAL }} />
                <Typography sx={{ color: TEAL, fontSize: '0.72rem', fontWeight: 600 }}>Completed</Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Actions */}
        {user?.role === 'student' && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {enrolled ? (
              <Button variant="contained" color="primary" size="small"
                startIcon={<PlayArrowRoundedIcon />} onClick={handleCardClick}
                fullWidth sx={{ py: 1, fontSize: '0.78rem', borderRadius: 2.5 }}>
                {progress > 0 ? 'Continue' : 'Start Learning'}
              </Button>
            ) : (
              <Button variant="contained" color="primary" size="small"
                startIcon={<BookmarkAddRoundedIcon />} onClick={handleEnroll}
                fullWidth sx={{ py: 1, fontSize: '0.78rem', borderRadius: 2.5 }}>
                Enroll Free
              </Button>
            )}
            <Tooltip title={favorited ? 'Remove from favorites' : 'Add to favorites'}>
              <IconButton onClick={handleFavorite} size="small"
                sx={{
                  borderRadius: 2, flexShrink: 0, width: 36,
                  background: favorited ? 'rgba(231,76,111,0.15)' : 'rgba(139,155,180,0.08)',
                  border: `1px solid ${favorited ? 'rgba(231,76,111,0.35)' : 'rgba(139,155,180,0.15)'}`,
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'scale(1.1)' },
                }}>
                {favorited
                  ? <FavoriteRoundedIcon sx={{ fontSize: 16, color: DANGER }} />
                  : <FavoriteBorderRoundedIcon sx={{ fontSize: 16, color: STEEL }} />}
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}