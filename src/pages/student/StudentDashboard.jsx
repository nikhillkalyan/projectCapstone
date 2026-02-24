import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import StudentSidebar from '../../components/layout/StudentSidebar';
import CourseCard from '../../components/shared/CourseCard';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import LinearProgress from '@mui/material/LinearProgress';
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded';
import LibraryBooksRoundedIcon from '@mui/icons-material/LibraryBooksRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import { ACCENT, ACCENT2, TEAL, STEEL, CREAM, SAND, GOLD, DANGER, NAVY, NAVY2 } from '../../theme';

const SIDEBAR_W = 248;

function StatCard({ icon: Icon, label, value, color, delay }) {
  return (
    <Card className={`anim-fadeInUp delay-${delay}`} sx={{ background: `rgba(22,27,39,0.85)`, border: '1px solid rgba(139,155,180,0.1)', borderRadius: 3.5, overflow: 'visible', position: 'relative' }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography sx={{ color: STEEL, fontSize: '0.8rem' }}>{label}</Typography>
          <Box sx={{ width: 38, height: 38, borderRadius: 2, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon sx={{ color, fontSize: 20 }} />
          </Box>
        </Box>
        <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '2rem', color: CREAM, lineHeight: 1 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

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
    { icon: LibraryBooksRoundedIcon, label: 'Enrolled', value: enrolledCourses.length, color: ACCENT2, delay: 1 },
    { icon: FavoriteRoundedIcon, label: 'Favorites', value: favCourses.length, color: DANGER, delay: 2 },
    { icon: EmojiEventsRoundedIcon, label: 'Completed', value: completedCount, color: TEAL, delay: 3 },
    { icon: TrendingUpRoundedIcon, label: 'Avg. Progress', value: `${totalProgress}%`, color: GOLD, delay: 4 },
  ];

  const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0D1117' }}>
      <StudentSidebar />
      <Box sx={{ ml: { md: `${SIDEBAR_W}px` }, flex: 1, p: { xs: 2, sm: 3, md: 4 }, pt: { xs: 7, md: 4 } }}>
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
          <Button variant="contained" color="secondary" startIcon={<ExploreRoundedIcon />}
            onClick={() => navigate('/student/explore')} className="anim-pulse-glow"
            sx={{ px: 3, py: 1.3, background: `linear-gradient(135deg, ${SAND} 0%, #D4C9A5 100%)`, color: NAVY, whiteSpace: 'nowrap', flexShrink: 0 }}>
            Explore Courses
          </Button>
        </Box>

        {/* Stats */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {stats.map(s => (
            <Grid item xs={6} lg={3} key={s.label}>
              <StatCard {...s} />
            </Grid>
          ))}
        </Grid>

        {/* In Progress */}
        {inProgressCourses.length > 0 && (
          <Box className="anim-fadeInUp delay-2" sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: CREAM }}>📚 Continue Learning</Typography>
              <Button size="small" onClick={() => navigate('/student/enrolled')} sx={{ color: ACCENT2, fontSize: '0.8rem' }}>View All →</Button>
            </Box>
            <Grid container spacing={2.5}>
              {inProgressCourses.slice(0, 3).map(course => (
                <Grid item xs={12} sm={6} lg={4} key={course.id}>
                  <CourseCard course={course} enrolled favorited={user?.favoriteCourses?.includes(course.id)} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Recommended */}
        {recommended.length > 0 && (
          <Box className="anim-fadeInUp delay-3" sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: CREAM }}>⭐ Recommended for You</Typography>
              <Button size="small" onClick={() => navigate('/student/explore')} sx={{ color: ACCENT2, fontSize: '0.8rem' }}>See All →</Button>
            </Box>
            <Grid container spacing={2.5}>
              {recommended.map(course => (
                <Grid item xs={12} sm={6} lg={4} key={course.id}>
                  <CourseCard course={course} enrolled={user?.enrolledCourses?.includes(course.id)} favorited={user?.favoriteCourses?.includes(course.id)} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Completed */}
        {user?.completedCourses?.length > 0 && (
          <Box className="anim-fadeInUp delay-4" sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: CREAM, mb: 2.5 }}>🏆 Completed Courses</Typography>
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
                      <Button variant="contained" size="small" startIcon={<WorkspacePremiumRoundedIcon />}
                        onClick={() => navigate(`/student/certificate/${courseId}`)}
                        sx={{ background: `linear-gradient(135deg, ${GOLD} 0%, ${SAND} 100%)`, color: NAVY, fontWeight: 700, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                        View Certificate
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          </Box>
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
      </Box>
    </Box>
  );
}