import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import InstructorLayout from '../../components/layout/v2/InstructorLayout';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Rating from '@mui/material/Rating';
import LinearProgress from '@mui/material/LinearProgress';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import LibraryBooksRoundedIcon from '@mui/icons-material/LibraryBooksRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import RateReviewRoundedIcon from '@mui/icons-material/RateReviewRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import { ACCENT2, TEAL, STEEL, CREAM, SAND, GOLD, DANGER, NAVY } from '../../theme';

const SIDEBAR_W = 248;

const catColors = {
  AIML: { bg: 'rgba(108,127,216,0.18)', color: ACCENT2, border: 'rgba(108,127,216,0.3)' },
  Cloud: { bg: 'rgba(78,205,196,0.18)', color: TEAL, border: 'rgba(78,205,196,0.3)' },
  DataScience: { bg: 'rgba(212,168,67,0.18)', color: GOLD, border: 'rgba(212,168,67,0.3)' },
  Cybersecurity: { bg: 'rgba(231,76,111,0.18)', color: DANGER, border: 'rgba(231,76,111,0.3)' },
};

function StatCard({ icon: Icon, label, value, color, delay = 1 }) {
  return (
    <Card className={`anim-fadeInUp delay-${delay}`}
      sx={{ background: 'rgba(22,27,39,0.85)', border: '1px solid rgba(139,155,180,0.1)', borderRadius: 3.5 }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography sx={{ color: STEEL, fontSize: '0.8rem' }}>{label}</Typography>
          <Box sx={{
            width: 38, height: 38, borderRadius: 2, background: `${color}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
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

export default function InstructorDashboard() {
  const { user } = useAuth();
  const { db } = useApp();
  const navigate = useNavigate();

  const myCourses = useMemo(() => db.courses.filter(c => c.instructorId === user?.id), [user, db.courses]);
  const totalStudents = myCourses.reduce((s, c) => s + (c.enrolledCount || 0), 0);
  const avgRating = myCourses.length > 0
    ? (myCourses.reduce((s, c) => s + (c.rating || 0), 0) / myCourses.length).toFixed(1) : '—';
  const allReviews = myCourses.flatMap(c => (c.reviews || []).map(r => ({ ...r, courseTitle: c.title })));

  const stats = [
    { icon: LibraryBooksRoundedIcon, label: 'Total Courses', value: myCourses.length, color: ACCENT2, delay: 1 },
    { icon: PeopleRoundedIcon, label: 'Total Students', value: totalStudents, color: TEAL, delay: 2 },
    { icon: StarRoundedIcon, label: 'Avg Rating', value: avgRating, color: GOLD, delay: 3 },
    { icon: RateReviewRoundedIcon, label: 'Total Reviews', value: allReviews.length, color: DANGER, delay: 4 },
  ];

  return (
    <InstructorLayout>

      {/* Header */}
      <Box className="anim-fadeInUp" sx={{
        display: 'flex', alignItems: { sm: 'center' }, justifyContent: 'space-between',
        mb: 4, flexDirection: { xs: 'column', sm: 'row' }, gap: 2
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: CREAM, fontSize: { xs: '1.6rem', md: '2rem' } }}>
            Instructor Dashboard
          </Typography>
          <Typography sx={{ color: STEEL, mt: 0.5, fontSize: '0.9rem' }}>
            Welcome back, {user?.name?.split(' ')[0]}! Here's your overview.
          </Typography>
        </Box>
        <Button variant="contained" color="primary" startIcon={<AddRoundedIcon />}
          onClick={() => navigate('/instructor/create-course')}
          sx={{ px: 3, py: 1.3, whiteSpace: 'nowrap', flexShrink: 0 }}>
          Create Course
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

      {/* Courses grid */}
      {myCourses.length > 0 && (
        <Box className="anim-fadeInUp delay-2" sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: CREAM }}>📚 Your Courses</Typography>
            <Button size="small" onClick={() => navigate('/instructor/courses')} sx={{ color: ACCENT2, fontSize: '0.8rem' }}>
              View All →
            </Button>
          </Box>
          <Grid container spacing={2.5}>
            {myCourses.slice(0, 3).map((course, i) => {
              const cc = catColors[course.category] || catColors.AIML;
              return (
                <Grid item xs={12} md={4} key={course.id}>
                  <Card className={`anim-fadeInUp delay-${i + 1}`}
                    sx={{
                      background: 'rgba(22,27,39,0.85)', border: '1px solid rgba(139,155,180,0.1)', borderRadius: 3.5,
                      transition: 'all 0.3s ease', cursor: 'pointer',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 16px 40px rgba(0,0,0,0.4)' }
                    }}
                    onClick={() => navigate(`/instructor/course/${course.id}`)}>
                    <Box sx={{ height: 130, overflow: 'hidden', position: 'relative' }}>
                      <Box component="img" src={course.thumbnail} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,12,20,0.85), transparent)' }} />
                      <Chip label={course.category} size="small"
                        sx={{
                          position: 'absolute', top: 10, left: 10, background: cc.bg, color: cc.color,
                          border: `1px solid ${cc.border}`, fontSize: '0.65rem', fontFamily: '"Syne",sans-serif', fontWeight: 700
                        }} />
                    </Box>
                    <CardContent sx={{ p: 2.2, '&:last-child': { pb: 2.2 } }}>
                      <Typography sx={{
                        fontFamily: '"Syne",sans-serif', fontWeight: 700, color: CREAM, fontSize: '0.88rem',
                        mb: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                      }}>
                        {course.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PeopleRoundedIcon sx={{ fontSize: 14, color: STEEL }} />
                          <Typography sx={{ color: STEEL, fontSize: '0.78rem' }}>{course.enrolledCount || 0} students</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <StarRoundedIcon sx={{ fontSize: 14, color: GOLD }} />
                          <Typography sx={{ color: CREAM, fontSize: '0.78rem', fontWeight: 600 }}>
                            {course.rating?.toFixed(1) || '—'}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="outlined" color="primary" size="small" fullWidth
                          startIcon={<VisibilityRoundedIcon />}
                          onClick={e => { e.stopPropagation(); navigate(`/instructor/course/${course.id}`); }}
                          sx={{ fontSize: '0.73rem', py: 0.7 }}>
                          Manage
                        </Button>
                        <Button variant="outlined" color="primary" size="small" fullWidth
                          startIcon={<BarChartRoundedIcon />}
                          onClick={e => { e.stopPropagation(); navigate(`/instructor/students/${course.id}`); }}
                          sx={{ fontSize: '0.73rem', py: 0.7 }}>
                          Students
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Recent Reviews */}
      {allReviews.length > 0 && (
        <Box className="anim-fadeInUp delay-3" sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: CREAM, mb: 2.5 }}>⭐ Recent Reviews</Typography>
          <Grid container spacing={2}>
            {allReviews.slice(-6).reverse().map((r, i) => (
              <Grid item xs={12} md={6} key={i}>
                <Card sx={{ background: 'rgba(22,27,39,0.85)', border: '1px solid rgba(139,155,180,0.1)', borderRadius: 3 }}>
                  <CardContent sx={{ p: 2.2, '&:last-child': { pb: 2.2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ color: CREAM, fontFamily: '"Syne",sans-serif', fontWeight: 600, fontSize: '0.85rem' }}>
                        {r.studentName}
                      </Typography>
                      <Rating value={r.rating} readOnly size="small"
                        sx={{ '& .MuiRating-iconFilled': { color: GOLD }, '& .MuiRating-iconEmpty': { color: 'rgba(212,168,67,0.2)' } }} />
                    </Box>
                    <Typography sx={{ color: STEEL, fontSize: '0.78rem', mb: 1, fontStyle: 'italic' }}>
                      "{r.review || 'Great course!'}"
                    </Typography>
                    <Typography sx={{ color: ACCENT2, fontSize: '0.7rem' }}>{r.courseTitle}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Empty state */}
      {myCourses.length === 0 && (
        <Box className="anim-fadeInUp delay-2" sx={{ textAlign: 'center', py: 12 }}>
          <Typography className="anim-float" sx={{ fontSize: '4rem', mb: 2.5 }}>🎓</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: CREAM, mb: 1.5 }}>Create Your First Course</Typography>
          <Typography sx={{ color: STEEL, mb: 4, fontSize: '0.95rem' }}>Share your expertise with thousands of students</Typography>
          <Button variant="contained" color="primary" size="large" startIcon={<AddRoundedIcon />}
            onClick={() => navigate('/instructor/create-course')} sx={{ px: 5, py: 1.5 }}>
            Create Course
          </Button>
        </Box>
      )}
    </InstructorLayout>
  );
}