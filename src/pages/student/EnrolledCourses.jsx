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
import Chip from '@mui/material/Chip';
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded';
import { ACCENT2, TEAL, STEEL, CREAM, SAND, GOLD, DANGER, NAVY } from '../../theme';

const SIDEBAR_W = 248;

function Section({ title, courses, user }) {
  if (courses.length === 0) return null;
  return (
    <Box className="anim-fadeInUp" sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, color: CREAM, mb: 2.5 }}>{title}</Typography>
      <Grid container spacing={2.5}>
        {courses.map(course => (
          <Grid item xs={12} sm={6} lg={4} key={course.id}>
            <CourseCard course={course} enrolled favorited={user?.favoriteCourses?.includes(course.id)} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export function EnrolledCourses() {
  const { user } = useAuth();
  const { db, getCourseProgress } = useApp();
  const navigate = useNavigate();

  const enrolled = useMemo(() => db.courses.filter(c => user?.enrolledCourses?.includes(c.id)), [user, db.courses]);
  const inProgress = enrolled.filter(c => { const p = getCourseProgress(c.id); return p > 0 && p < 100; });
  const notStarted = enrolled.filter(c => getCourseProgress(c.id) === 0);
  const completed = user?.completedCourses?.map(cc => db.courses.find(c => c.id === cc.courseId)).filter(Boolean) || [];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0D1117' }}>
      <StudentSidebar />
      <Box sx={{ ml: { md: `${SIDEBAR_W}px` }, flex: 1, p: { xs: 2, sm: 3, md: 4 }, pt: { xs: 7, md: 4 } }}>
        <Box className="anim-fadeInUp" sx={{ display: 'flex', alignItems: { sm: 'center' }, justifyContent: 'space-between', mb: 4, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: CREAM, fontSize: { xs: '1.6rem', md: '2rem' } }}>My Courses</Typography>
            <Typography sx={{ color: STEEL, mt: 0.5, fontSize: '0.9rem' }}>{enrolled.length} courses enrolled</Typography>
          </Box>
          <Button variant="contained" color="secondary" startIcon={<ExploreRoundedIcon />}
            onClick={() => navigate('/student/explore')}
            sx={{ background: `linear-gradient(135deg, ${SAND} 0%, #D4C9A5 100%)`, color: NAVY, whiteSpace: 'nowrap', flexShrink: 0 }}>
            Explore More
          </Button>
        </Box>

        {enrolled.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <Typography className="anim-float" sx={{ fontSize: '4rem', mb: 2.5 }}>📚</Typography>
            <Typography variant="h5" sx={{ color: CREAM, fontWeight: 700, mb: 1.5 }}>No enrolled courses yet</Typography>
            <Typography sx={{ color: STEEL, mb: 4 }}>Start your learning journey today!</Typography>
            <Button variant="contained" color="secondary" size="large" onClick={() => navigate('/student/explore')}
              sx={{ px: 5, py: 1.5, background: `linear-gradient(135deg, ${SAND} 0%, #D4C9A5 100%)`, color: NAVY }}>
              Explore Courses
            </Button>
          </Box>
        ) : (
          <>
            {inProgress.length > 0 && <Section title="📖 In Progress" courses={inProgress} user={user} />}
            {notStarted.length > 0 && <Section title="🆕 Not Started" courses={notStarted} user={user} />}
            {completed.length > 0 && <Section title="✅ Completed" courses={completed} user={user} />}
          </>
        )}
      </Box>
    </Box>
  );
}

export function FavoriteCourses() {
  const { user } = useAuth();
  const { db } = useApp();
  const navigate = useNavigate();

  const favorites = useMemo(() => db.courses.filter(c => user?.favoriteCourses?.includes(c.id)), [user, db.courses]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0D1117' }}>
      <StudentSidebar />
      <Box sx={{ ml: { md: `${SIDEBAR_W}px` }, flex: 1, p: { xs: 2, sm: 3, md: 4 }, pt: { xs: 7, md: 4 } }}>
        <Box className="anim-fadeInUp" sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: CREAM, fontSize: { xs: '1.6rem', md: '2rem' } }}>
            ❤️ Favorite Courses
          </Typography>
          <Typography sx={{ color: STEEL, mt: 0.5, fontSize: '0.9rem' }}>
            {favorites.length} course{favorites.length !== 1 ? 's' : ''} saved
          </Typography>
        </Box>

        {favorites.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <Typography className="anim-float" sx={{ fontSize: '4rem', mb: 2.5 }}>💝</Typography>
            <Typography variant="h5" sx={{ color: CREAM, fontWeight: 700, mb: 1.5 }}>No favorites yet</Typography>
            <Typography sx={{ color: STEEL, mb: 4 }}>Add courses to favorites by clicking the heart icon</Typography>
            <Button variant="contained" color="secondary" size="large" onClick={() => navigate('/student/explore')}
              sx={{ px: 5, py: 1.5, background: `linear-gradient(135deg, ${SAND} 0%, #D4C9A5 100%)`, color: NAVY }}>
              Explore Courses
            </Button>
          </Box>
        ) : (
          <Grid container spacing={2.5} className="anim-fadeInUp">
            {favorites.map(course => (
              <Grid item xs={12} sm={6} lg={4} key={course.id}>
                <CourseCard course={course} enrolled={user?.enrolledCourses?.includes(course.id)} favorited />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
}

export default EnrolledCourses;