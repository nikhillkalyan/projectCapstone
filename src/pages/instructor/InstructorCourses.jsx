import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import InstructorSidebar from '../../components/layout/InstructorSidebar';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Rating from '@mui/material/Rating';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import { ACCENT2, TEAL, STEEL, CREAM, SAND, GOLD, DANGER, NAVY } from '../../theme';

const SIDEBAR_W = 248;

const catColors = {
  AIML:         { bg: 'rgba(108,127,216,0.18)', color: ACCENT2, border: 'rgba(108,127,216,0.3)' },
  Cloud:        { bg: 'rgba(78,205,196,0.18)',  color: TEAL,    border: 'rgba(78,205,196,0.3)'  },
  DataScience:  { bg: 'rgba(212,168,67,0.18)',  color: GOLD,    border: 'rgba(212,168,67,0.3)'  },
  Cybersecurity:{ bg: 'rgba(231,76,111,0.18)',  color: DANGER,  border: 'rgba(231,76,111,0.3)'  },
};

export default function InstructorCourses() {
  const { user } = useAuth();
  const { db } = useApp();
  const navigate = useNavigate();

  const myCourses = useMemo(() => db.courses.filter(c => c.instructorId === user?.id), [user, db.courses]);
  const totalStudents = myCourses.reduce((s, c) => s + (c.enrolledCount || 0), 0);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0D1117' }}>
      <InstructorSidebar />
      <Box sx={{ ml: { md: `${SIDEBAR_W}px` }, flex: 1, p: { xs: 2, sm: 3, md: 4 }, pt: { xs: 7, md: 4 } }}>

        {/* Header */}
        <Box className="anim-fadeInUp" sx={{ display: 'flex', alignItems: { sm: 'center' }, justifyContent: 'space-between',
          mb: 4, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: CREAM, fontSize: { xs: '1.6rem', md: '2rem' } }}>
              My Courses
            </Typography>
            <Typography sx={{ color: STEEL, mt: 0.5, fontSize: '0.9rem' }}>
              {myCourses.length} course{myCourses.length !== 1 ? 's' : ''} · {totalStudents} total students
            </Typography>
          </Box>
          <Button variant="contained" color="primary" startIcon={<AddRoundedIcon />}
            onClick={() => navigate('/instructor/create-course')}
            sx={{ px: 3, py: 1.3, whiteSpace: 'nowrap', flexShrink: 0 }}>
            Create New Course
          </Button>
        </Box>

        {myCourses.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <Typography className="anim-float" sx={{ fontSize: '4rem', mb: 2.5 }}>📝</Typography>
            <Typography variant="h5" sx={{ color: CREAM, fontWeight: 700, mb: 1.5 }}>No courses yet</Typography>
            <Typography sx={{ color: STEEL, mb: 4 }}>Create your first course to start teaching</Typography>
            <Button variant="contained" color="primary" size="large" startIcon={<AddRoundedIcon />}
              onClick={() => navigate('/instructor/create-course')} sx={{ px: 5, py: 1.5 }}>
              Create Course
            </Button>
          </Box>
        ) : (
          <Grid container spacing={2.5} className="anim-fadeInUp delay-1">
            {myCourses.map((course, i) => {
              const cc = catColors[course.category] || catColors.AIML;
              return (
                <Grid item xs={12} md={6} lg={4} key={course.id}>
                  <Card className={`anim-fadeInUp delay-${(i % 4) + 1}`}
                    sx={{ background: 'rgba(22,27,39,0.85)', border: '1px solid rgba(139,155,180,0.1)',
                      borderRadius: 3.5, transition: 'all 0.3s ease',
                      '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 20px 48px rgba(0,0,0,0.4)', borderColor: 'rgba(139,155,180,0.2)' } }}>

                    {/* Thumbnail */}
                    <Box sx={{ height: 145, overflow: 'hidden', position: 'relative' }}>
                      <Box component="img" src={course.thumbnail} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,12,20,0.9), transparent)' }} />
                      <Chip label={course.category} size="small"
                        sx={{ position: 'absolute', top: 10, left: 10, background: cc.bg, color: cc.color,
                          border: `1px solid ${cc.border}`, fontSize: '0.65rem', fontFamily: '"Syne",sans-serif', fontWeight: 700 }} />
                      <Chip label={course.level} size="small"
                        sx={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.55)',
                          color: SAND, fontSize: '0.65rem', backdropFilter: 'blur(4px)' }} />
                    </Box>

                    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                      <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 700, color: CREAM,
                        fontSize: '0.92rem', mb: 1.2, lineHeight: 1.35,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {course.title}
                      </Typography>

                      {/* Stats row */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.8 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PeopleRoundedIcon sx={{ fontSize: 14, color: STEEL }} />
                          <Typography sx={{ color: STEEL, fontSize: '0.78rem' }}>{course.enrolledCount || 0}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <StarRoundedIcon sx={{ fontSize: 14, color: GOLD }} />
                          <Typography sx={{ color: CREAM, fontSize: '0.78rem', fontWeight: 600 }}>
                            {course.rating?.toFixed(1) || '—'}
                          </Typography>
                        </Box>
                        <Chip label={`${course.reviews?.length || 0} reviews`} size="small"
                          sx={{ background: 'rgba(139,155,180,0.08)', color: STEEL, fontSize: '0.65rem', height: 20 }} />
                      </Box>

                      {/* Rating visual */}
                      {course.rating > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Rating value={course.rating} readOnly precision={0.5} size="small"
                            sx={{ '& .MuiRating-iconFilled': { color: GOLD }, '& .MuiRating-iconEmpty': { color: 'rgba(212,168,67,0.15)' } }} />
                        </Box>
                      )}

                      {/* Action buttons */}
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="contained" color="primary" size="small" fullWidth
                          startIcon={<SettingsRoundedIcon />}
                          onClick={() => navigate(`/instructor/course/${course.id}`)}
                          sx={{ py: 0.9, fontSize: '0.75rem' }}>
                          Manage
                        </Button>
                        <Button variant="outlined" color="primary" size="small" fullWidth
                          startIcon={<BarChartRoundedIcon />}
                          onClick={() => navigate(`/instructor/students/${course.id}`)}
                          sx={{ py: 0.9, fontSize: '0.75rem' }}>
                          Students
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    </Box>
  );
}