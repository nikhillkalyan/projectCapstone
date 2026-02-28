import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import StudentLayout from '../../components/layout/v2/StudentLayout';
import CourseCard from '../../components/shared/CourseCard';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import { Star, Play, Award, Compass, BookOpen, Heart, Trophy, TrendingUp } from 'lucide-react';
import { ACCENT, ACCENT2, TEAL, STEEL, CREAM, SAND, GOLD, DANGER, NAVY, NAVY2 } from '../../theme';

const SIDEBAR_W = 248;

import StatCard from '../../components/shared/StatCard';
import SectionShell from '../../components/shared/SectionShell';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { db, getCourseProgress } = useApp();
  const navigate = useNavigate();

  const enrolledCourses = useMemo(() => db.courses.filter(c => user?.enrolledCourses?.includes(c.id)), [user, db.courses]);
  const favCourses = useMemo(() => db.courses.filter(c => user?.favoriteCourses?.includes(c.id)), [user, db.courses]);
  const recommended = useMemo(() => {
    const interests = user?.interests || [];
    const enrolled = user?.enrolledCourses || [];
    return db.courses.filter(c => interests.includes(c.category) && !enrolled.includes(c.id)).slice(0, 3);
  }, [user, db.courses]);

  const completedCount = user?.completedCourses?.length || 0;
  const inProgressCourses = enrolledCourses.filter(c => { const p = getCourseProgress(c.id); return p > 0 && p < 100; });
  const totalProgress = enrolledCourses.length > 0
    ? Math.round(enrolledCourses.reduce((sum, c) => sum + getCourseProgress(c.id), 0) / enrolledCourses.length) : 0;

  const stats = [
    { icon: BookOpen, label: 'Enrolled', value: enrolledCourses.length, color: ACCENT2, delay: 1 },
    { icon: Heart, label: 'Favorites', value: favCourses.length, color: DANGER, delay: 2 },
    { icon: Trophy, label: 'Completed', value: completedCount, color: TEAL, delay: 3 },
    { icon: TrendingUp, label: 'Avg. Progress', value: `${totalProgress}%`, color: GOLD, delay: 4 },
  ];

  const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <StudentLayout>
      {/* Header */}
      <Box className="anim-fadeInUp" sx={{ display: 'flex', alignItems: { sm: 'center' }, justifyContent: 'space-between', mb: 4, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Box>
          <Typography sx={{ color: ACCENT2, fontSize: '0.78rem', fontWeight: 600, letterSpacing: 0.5, mb: 0.5 }}>{dateStr}</Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: CREAM, fontSize: { xs: '1.6rem', md: '2rem' }, lineHeight: 1.2 }}>
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </Typography>
          <Typography sx={{ color: STEEL, mt: 0.7, fontSize: '0.9rem' }}>
            {inProgressCourses.length > 0
              ? `You have ${inProgressCourses.length} course${inProgressCourses.length > 1 ? 's' : ''} in progress.`
              : 'Ready to start learning today?'}
          </Typography>
        </Box>
        <Button variant="contained" color="secondary" startIcon={<Compass />}
          onClick={() => navigate('/student/explore')} className="anim-pulse-glow"
          sx={{ px: 3, py: 1.3, background: `linear-gradient(135deg, ${SAND} 0%, #D4C9A5 100%)`, color: NAVY, whiteSpace: 'nowrap', flexShrink: 0 }}>
          Explore Courses
        </Button>
      </Box>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((s, idx) => (
          <StatCard key={s.label} {...s} delay={idx + 1} />
        ))}
      </div>

      {/* In Progress */}
      {inProgressCourses.length > 0 && (
        <SectionShell
          title="Continue Learning"
          icon={Play}
          iconColor="text-teal-400 fill-current"
          delay={2}
          action={
            <button
              onClick={() => navigate('/student/enrolled')}
              className="text-primary-400 font-medium text-sm hover:text-primary-500 transition-colors"
            >
              View All →
            </button>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {inProgressCourses.map(course => (
              <CourseCard key={course.id} course={course} enrolled={true} favorited={user?.favoriteCourses?.includes(course.id)} />
            ))}
          </div>
        </SectionShell>
      )}

      {/* Recommended */}
      {recommended.length > 0 && (
        <SectionShell
          title="Recommended for You"
          icon={Star}
          iconColor="text-amber-400 fill-current"
          delay={3}
          action={
            <button
              onClick={() => navigate('/student/explore')}
              className="text-primary-400 font-medium text-sm hover:text-primary-500 transition-colors"
            >
              See All →
            </button>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {recommended.map(course => (
              <CourseCard key={course.id} course={course} enrolled={user?.enrolledCourses?.includes(course.id)} favorited={user?.favoriteCourses?.includes(course.id)} />
            ))}
          </div>
        </SectionShell>
      )}

      {/* Completed */}
      {user?.completedCourses?.length > 0 && (
        <SectionShell
          title="Completed Courses"
          icon={Trophy}
          iconColor="text-amber-400"
          delay={4}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {user.completedCourses.map(({ courseId, score, completedAt }) => {
              const course = db.courses.find(c => c.id === courseId);
              if (!course) return null;
              return (
                <Card key={courseId} sx={{ background: 'rgba(22,27,39,0.85)', border: '1px solid rgba(139,155,180,0.1)', borderRadius: 3 }}>
                  <CardContent sx={{ p: 2.2, '&:last-child': { pb: 2.2 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box component="img" src={course.thumbnail} alt="" sx={{ width: 60, height: 42, borderRadius: 2, objectFit: 'cover', flexShrink: 0 }} />
                      <Box>
                        <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 600, color: CREAM, fontSize: '0.88rem' }}>{course.title}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.4 }}>
                          <Chip label="Completed" size="small" sx={{ background: 'rgba(78,205,196,0.15)', color: TEAL, border: '1px solid rgba(78,205,196,0.3)', fontSize: '0.65rem', height: 20 }} />
                          <Typography sx={{ color: TEAL, fontSize: '0.78rem', fontWeight: 700 }}>Score: {score}%</Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Button variant="contained" size="small" startIcon={<Award />}
                      onClick={() => navigate(`/student/certificate/${courseId}`)}
                      sx={{ background: `linear-gradient(135deg, ${GOLD} 0%, ${SAND} 100%)`, color: NAVY, fontWeight: 700, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                      View Certificate
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </SectionShell>
      )}

      {/* Empty state */}
      {enrolledCourses.length === 0 && (
        <Box className="anim-fadeInUp delay-2" sx={{ textAlign: 'center', py: 10 }}>
          <Typography className="anim-float" sx={{ fontSize: '4rem', mb: 2.5 }}>🎯</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: CREAM, mb: 1.5 }}>Start Your Learning Journey</Typography>
          <Typography sx={{ color: STEEL, mb: 4, fontSize: '0.95rem' }}>Explore courses tailored to your interests</Typography>
          <Button variant="contained" color="secondary" size="large" onClick={() => navigate('/student/explore')}
            sx={{ px: 5, py: 1.5, background: `linear-gradient(135deg, ${SAND} 0%, #D4C9A5 100%)`, color: NAVY }}>
            Explore Courses →
          </Button>
        </Box>
      )}
    </StudentLayout>
  );
}