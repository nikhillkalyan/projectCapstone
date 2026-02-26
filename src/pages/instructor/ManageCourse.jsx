import { useParams, useNavigate } from 'react-router-dom';
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
import LinearProgress from '@mui/material/LinearProgress';
import Divider from '@mui/material/Divider';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import { ACCENT2, TEAL, STEEL, CREAM, SAND, GOLD, DANGER, NAVY } from '../../theme';

const SIDEBAR_W = 248;

const catColors = {
  AIML:         { bg: 'rgba(108,127,216,0.18)', color: ACCENT2 },
  Cloud:        { bg: 'rgba(78,205,196,0.18)',  color: TEAL    },
  DataScience:  { bg: 'rgba(212,168,67,0.18)',  color: GOLD    },
  Cybersecurity:{ bg: 'rgba(231,76,111,0.18)',  color: DANGER  },
};

export default function ManageCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { db } = useApp();

  const course = db.courses.find(c => c.id === courseId && c.instructorId === user?.id);

  if (!course) return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0D1117' }}>
      <InstructorSidebar />
      <Box sx={{ ml: { md: `${SIDEBAR_W}px` }, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', pt: { xs: 7, md: 0 } }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontSize: '3rem', mb: 2 }}>🔍</Typography>
          <Typography variant="h6" sx={{ color: CREAM, mb: 2 }}>Course not found</Typography>
          <Button variant="outlined" color="primary" onClick={() => navigate('/instructor/courses')}>Back to Courses</Button>
        </Box>
      </Box>
    </Box>
  );

  const cc = catColors[course.category] || catColors.AIML;
  const ratingDist = [5,4,3,2,1].map(star => {
    const count = course.reviews?.filter(r => Math.round(r.rating) === star).length || 0;
    const pct = course.reviews?.length ? Math.round((count / course.reviews.length) * 100) : 0;
    return { star, count, pct };
  });

  const stats = [
    { icon: PeopleRoundedIcon, label: 'Students',  value: course.enrolledCount || 0, color: TEAL },
    { icon: StarRoundedIcon,   label: 'Rating',    value: course.rating?.toFixed(1) || '—', color: GOLD },
    { icon: QuizRoundedIcon,   label: 'Reviews',   value: course.reviews?.length || 0, color: ACCENT2 },
    { icon: BarChartRoundedIcon,label:'Chapters',  value: course.chapters?.length || 0, color: DANGER },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0D1117' }}>
      <InstructorSidebar />
      <Box sx={{ ml: { md: `${SIDEBAR_W}px` }, flex: 1, p: { xs: 2, sm: 3, md: 4 }, pt: { xs: 7, md: 4 } }}>
        <Box sx={{ maxWidth: 900, mx: 'auto' }}>

          <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate('/instructor/courses')}
            sx={{ color: STEEL, mb: 3, '&:hover': { color: CREAM } }}>
            Back to Courses
          </Button>

          {/* Hero */}
          <Card className="anim-fadeInUp" sx={{ background: 'rgba(22,27,39,0.85)', border: '1px solid rgba(139,155,180,0.1)',
            borderRadius: 4, overflow: 'hidden', mb: 3 }}>
            <Box sx={{ position: 'relative', height: { xs: 160, sm: 220 } }}>
              <Box component="img" src={course.thumbnail} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,12,20,0.95) 0%, rgba(8,12,20,0.3) 60%, transparent 100%)' }} />
              <Box sx={{ position: 'absolute', bottom: 0, left: 0, p: 3 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                  <Chip label={course.category} size="small"
                    sx={{ background: cc.bg, color: cc.color, fontFamily: '"Syne",sans-serif', fontWeight: 700, fontSize: '0.65rem' }} />
                  <Chip label={course.level} size="small"
                    sx={{ background: 'rgba(0,0,0,0.5)', color: SAND, fontSize: '0.65rem', backdropFilter: 'blur(4px)' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', mb: 0.5 }}>{course.title}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <AccessTimeRoundedIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }} />
                  <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>{course.duration}</Typography>
                </Box>
              </Box>
            </Box>

            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={2.5}>
                {stats.map(({ icon: Icon, label, value, color }) => (
                  <Grid item xs={6} sm={3} key={label}>
                    <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: 2.5, background: `${color}10`, border: `1px solid ${color}25` }}>
                      <Icon sx={{ color, fontSize: 22, mb: 0.5 }} />
                      <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '1.5rem', color: CREAM, lineHeight: 1 }}>{value}</Typography>
                      <Typography sx={{ color: STEEL, fontSize: '0.72rem', mt: 0.4 }}>{label}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          <Grid container spacing={3}>
            {/* Chapters */}
            <Grid item xs={12} md={7}>
              <Card className="anim-fadeInUp delay-1" sx={{ background: 'rgba(22,27,39,0.85)', border: '1px solid rgba(139,155,180,0.1)', borderRadius: 3.5 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: CREAM, mb: 2.5 }}>
                    📖 Chapters ({course.chapters?.length || 0})
                  </Typography>
                  {course.chapters?.map((ch, i) => (
                    <Box key={ch.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5,
                      borderBottom: i < (course.chapters.length - 1) ? '1px solid rgba(139,155,180,0.08)' : 'none' }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: 2, background: 'rgba(108,127,216,0.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {ch.type === 'video'
                          ? <PlayArrowRoundedIcon sx={{ fontSize: 16, color: ACCENT2 }} />
                          : <ArticleRoundedIcon sx={{ fontSize: 16, color: GOLD }} />}
                      </Box>
                      <Box sx={{ flex: 1, overflow: 'hidden' }}>
                        <Typography sx={{ color: CREAM, fontWeight: 500, fontSize: '0.85rem',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {ch.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
                          <Typography sx={{ color: STEEL, fontSize: '0.72rem' }}>{ch.duration || 'N/A'}</Typography>
                          {ch.assessment?.questions?.length > 0 && (
                            <Chip label={`${ch.assessment.questions.length} quiz Q`} size="small"
                              sx={{ background: 'rgba(108,127,216,0.1)', color: ACCENT2, fontSize: '0.6rem', height: 18 }} />
                          )}
                        </Box>
                      </Box>
                      <Typography sx={{ color: STEEL, fontSize: '0.72rem', flexShrink: 0 }}>#{i + 1}</Typography>
                    </Box>
                  ))}

                  <Button variant="outlined" color="primary" fullWidth startIcon={<BarChartRoundedIcon />}
                    onClick={() => navigate(`/instructor/students/${course.id}`)} sx={{ mt: 2.5, py: 1.2 }}>
                    View Student Progress
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Reviews */}
            <Grid item xs={12} md={5}>
              <Card className="anim-fadeInUp delay-2" sx={{ background: 'rgba(22,27,39,0.85)', border: '1px solid rgba(139,155,180,0.1)', borderRadius: 3.5 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: CREAM, mb: 2 }}>⭐ Reviews</Typography>

                  {course.reviews?.length > 0 ? (
                    <>
                      <Box sx={{ textAlign: 'center', mb: 2.5 }}>
                        <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '3rem', color: GOLD, lineHeight: 1 }}>
                          {course.rating?.toFixed(1)}
                        </Typography>
                        <Rating value={course.rating} readOnly precision={0.5}
                          sx={{ mt: 0.5, '& .MuiRating-iconFilled': { color: GOLD }, '& .MuiRating-iconEmpty': { color: 'rgba(212,168,67,0.2)' } }} />
                        <Typography sx={{ color: STEEL, fontSize: '0.78rem', mt: 0.5 }}>
                          {course.reviews.length} review{course.reviews.length !== 1 ? 's' : ''}
                        </Typography>
                      </Box>

                      {/* Rating distribution */}
                      {ratingDist.map(({ star, count, pct }) => (
                        <Box key={star} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.8 }}>
                          <Typography sx={{ color: STEEL, fontSize: '0.75rem', width: 8, flexShrink: 0 }}>{star}</Typography>
                          <StarRoundedIcon sx={{ fontSize: 13, color: GOLD, flexShrink: 0 }} />
                          <LinearProgress variant="determinate" value={pct} sx={{ flex: 1, height: 6, borderRadius: 3,
                            background: 'rgba(139,155,180,0.1)', '& .MuiLinearProgress-bar': { background: GOLD } }} />
                          <Typography sx={{ color: STEEL, fontSize: '0.72rem', width: 22, textAlign: 'right', flexShrink: 0 }}>{count}</Typography>
                        </Box>
                      ))}

                      <Divider sx={{ my: 2.5, borderColor: 'rgba(139,155,180,0.08)' }} />

                      <Box sx={{ maxHeight: 260, overflowY: 'auto',
                        '&::-webkit-scrollbar': { width: 3 }, '&::-webkit-scrollbar-thumb': { background: 'rgba(139,155,180,0.15)', borderRadius: 2 } }}>
                        {[...course.reviews].reverse().map((r, i) => (
                          <Box key={i} sx={{ mb: 2, pb: 2, borderBottom: i < course.reviews.length - 1 ? '1px solid rgba(139,155,180,0.07)' : 'none' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography sx={{ color: CREAM, fontFamily: '"Syne",sans-serif', fontWeight: 600, fontSize: '0.82rem' }}>
                                {r.studentName}
                              </Typography>
                              <Rating value={r.rating} readOnly size="small"
                                sx={{ '& .MuiRating-iconFilled': { color: GOLD }, '& .MuiRating-iconEmpty': { color: 'rgba(212,168,67,0.15)' } }} />
                            </Box>
                            {r.review && (
                              <Typography sx={{ color: STEEL, fontSize: '0.78rem', fontStyle: 'italic', lineHeight: 1.5 }}>
                                "{r.review}"
                              </Typography>
                            )}
                          </Box>
                        ))}
                      </Box>
                    </>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4, opacity: 0.5 }}>
                      <StarRoundedIcon sx={{ fontSize: 36, color: STEEL, mb: 1 }} />
                      <Typography sx={{ color: STEEL, fontSize: '0.85rem' }}>No reviews yet</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}