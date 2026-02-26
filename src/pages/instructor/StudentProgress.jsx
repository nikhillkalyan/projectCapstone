import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import InstructorSidebar from '../../components/layout/InstructorSidebar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import LinearProgress from '@mui/material/LinearProgress';
import Avatar from '@mui/material/Avatar';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';
import { ACCENT2, TEAL, STEEL, CREAM, SAND, GOLD, DANGER, NAVY } from '../../theme';

const SIDEBAR_W = 248;

export default function StudentProgress() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { db } = useApp();

  const course = db.courses.find(c => c.id === courseId && c.instructorId === user?.id);
  const enrolledStudents = useMemo(() => {
    return db.students.filter(s => s.enrolledCourses?.includes(courseId));
  }, [db.students, courseId]);

  // Compute per-student progress
  const studentRows = useMemo(() => {
    return enrolledStudents.map(student => {
      const prog = student.progress?.[courseId] || {};
      const totalChapters = course?.chapters?.length || 1;
      const completedChapters = Object.values(prog).filter(p => p.completed).length;
      const overallPct = Math.round((completedChapters / totalChapters) * 100);
      const isCompleted = student.completedCourses?.some(c => c.courseId === courseId);
      const grandScore = student.completedCourses?.find(c => c.courseId === courseId)?.score;

      // Per-chapter scores
      const chapterScores = course?.chapters?.map(ch => {
        const chProg = prog[ch.id] || {};
        return chProg.assessmentScore !== undefined ? chProg.assessmentScore : null;
      }) || [];

      const avgChapterScore = chapterScores.filter(s => s !== null).length > 0
        ? Math.round(chapterScores.filter(s => s !== null).reduce((a, b) => a + b, 0) / chapterScores.filter(s => s !== null).length)
        : null;

      return { student, overallPct, completedChapters, totalChapters, isCompleted, grandScore, chapterScores, avgChapterScore };
    });
  }, [enrolledStudents, course, courseId]);

  const completedCount = studentRows.filter(r => r.isCompleted).length;
  const avgProgress = studentRows.length > 0
    ? Math.round(studentRows.reduce((s, r) => s + r.overallPct, 0) / studentRows.length) : 0;

  if (!course) return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0D1117' }}>
      <InstructorSidebar />
      <Box sx={{ ml: { md: `${SIDEBAR_W}px` }, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', pt: { xs: 7, md: 0 } }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: CREAM, mb: 2 }}>Course not found</Typography>
          <Button variant="outlined" color="primary" onClick={() => navigate('/instructor/courses')}>Back</Button>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0D1117' }}>
      <InstructorSidebar />
      <Box sx={{ ml: { md: `${SIDEBAR_W}px` }, flex: 1, p: { xs: 2, sm: 3, md: 4 }, pt: { xs: 7, md: 4 } }}>

        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate(`/instructor/course/${courseId}`)}
          sx={{ color: STEEL, mb: 3, '&:hover': { color: CREAM } }}>
          Back to Course
        </Button>

        <Box className="anim-fadeInUp" sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: CREAM, fontSize: { xs: '1.6rem', md: '2rem' } }}>
            Student Progress
          </Typography>
          <Typography sx={{ color: ACCENT2, mt: 0.5, fontSize: '0.9rem' }}>{course.title}</Typography>
        </Box>

        {/* Overview stats */}
        <Grid container spacing={2.5} sx={{ mb: 4 }} className="anim-fadeInUp delay-1">
          {[
            { icon: PeopleRoundedIcon,    label: 'Enrolled',    value: enrolledStudents.length, color: ACCENT2 },
            { icon: EmojiEventsRoundedIcon,label: 'Completed',  value: completedCount,          color: TEAL    },
            { icon: TrendingUpRoundedIcon, label: 'Avg Progress',value: `${avgProgress}%`,      color: GOLD    },
          ].map(({ icon: Icon, label, value, color }) => (
            <Grid item xs={4} key={label}>
              <Card sx={{ background: 'rgba(22,27,39,0.85)', border: '1px solid rgba(139,155,180,0.1)', textAlign: 'center' }}>
                <CardContent sx={{ py: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 2, background: `${color}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1 }}>
                    <Icon sx={{ color, fontSize: 20 }} />
                  </Box>
                  <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '1.8rem', color: CREAM, lineHeight: 1 }}>
                    {value}
                  </Typography>
                  <Typography sx={{ color: STEEL, fontSize: '0.75rem', mt: 0.4 }}>{label}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Student table */}
        {enrolledStudents.length === 0 ? (
          <Box className="anim-fadeInUp delay-2" sx={{ textAlign: 'center', py: 10 }}>
            <PeopleRoundedIcon sx={{ fontSize: 48, color: STEEL, mb: 2, opacity: 0.4 }} />
            <Typography variant="h6" sx={{ color: CREAM, mb: 1 }}>No students enrolled yet</Typography>
            <Typography sx={{ color: STEEL, fontSize: '0.9rem' }}>Students will appear here once they enroll</Typography>
          </Box>
        ) : (
          <Box className="anim-fadeInUp delay-2">
            {/* Desktop table */}
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <TableContainer sx={{ borderRadius: 3, border: '1px solid rgba(139,155,180,0.1)', background: 'rgba(22,27,39,0.85)' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Overall Progress</TableCell>
                      {course.chapters?.map((ch, i) => (
                        <TableCell key={ch.id} align="center" sx={{ whiteSpace: 'nowrap', maxWidth: 120 }}>
                          <Typography sx={{ color: STEEL, fontSize: '0.68rem', fontFamily: '"Syne",sans-serif', fontWeight: 700,
                            overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            Ch {i + 1}
                          </Typography>
                        </TableCell>
                      ))}
                      <TableCell align="center">Grand Test</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {studentRows.map(({ student, overallPct, isCompleted, grandScore, chapterScores }) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 34, height: 34, borderRadius: 2, fontSize: '0.8rem', fontFamily: '"Syne",sans-serif',
                              background: `linear-gradient(135deg, ${ACCENT2} 0%, ${TEAL} 100%)`, color: '#fff' }}>
                              {student.name?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography sx={{ color: CREAM, fontSize: '0.83rem', fontWeight: 500 }}>{student.name}</Typography>
                              <Typography sx={{ color: STEEL, fontSize: '0.7rem' }}>{student.college || student.year || ''}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ minWidth: 160 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <LinearProgress variant="determinate" value={overallPct}
                              sx={{ flex: 1, height: 6, borderRadius: 3 }} />
                            <Typography sx={{ color: ACCENT2, fontSize: '0.75rem', fontWeight: 700, width: 36, flexShrink: 0 }}>
                              {overallPct}%
                            </Typography>
                          </Box>
                        </TableCell>
                        {chapterScores.map((score, i) => (
                          <TableCell key={i} align="center">
                            {score !== null
                              ? <Chip label={`${score}%`} size="small"
                                  sx={{ background: score >= 70 ? 'rgba(78,205,196,0.15)' : 'rgba(231,76,111,0.15)',
                                    color: score >= 70 ? TEAL : DANGER, fontSize: '0.65rem', height: 20,
                                    border: `1px solid ${score >= 70 ? 'rgba(78,205,196,0.3)' : 'rgba(231,76,111,0.3)'}` }} />
                              : <Typography sx={{ color: 'rgba(139,155,180,0.3)', fontSize: '0.8rem' }}>—</Typography>}
                          </TableCell>
                        ))}
                        <TableCell align="center">
                          {grandScore !== undefined && grandScore !== null
                            ? <Chip label={`${grandScore}%`} size="small"
                                sx={{ background: grandScore >= 70 ? 'rgba(212,168,67,0.2)' : 'rgba(231,76,111,0.15)',
                                  color: grandScore >= 70 ? GOLD : DANGER, fontSize: '0.65rem', height: 20, fontWeight: 700 }} />
                            : <Typography sx={{ color: 'rgba(139,155,180,0.3)', fontSize: '0.8rem' }}>—</Typography>}
                        </TableCell>
                        <TableCell align="center">
                          {isCompleted
                            ? <Chip icon={<CheckCircleRoundedIcon sx={{ fontSize: '13px !important' }} />}
                                label="Done" size="small"
                                sx={{ background: 'rgba(78,205,196,0.15)', color: TEAL, border: '1px solid rgba(78,205,196,0.3)', fontSize: '0.65rem' }} />
                            : <Chip icon={<HourglassTopRoundedIcon sx={{ fontSize: '13px !important' }} />}
                                label="In Progress" size="small"
                                sx={{ background: 'rgba(108,127,216,0.12)', color: ACCENT2, border: '1px solid rgba(108,127,216,0.2)', fontSize: '0.65rem' }} />}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Mobile cards */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2 }}>
              {studentRows.map(({ student, overallPct, isCompleted, grandScore }) => (
                <Card key={student.id} sx={{ background: 'rgba(22,27,39,0.85)', border: '1px solid rgba(139,155,180,0.1)' }}>
                  <CardContent sx={{ p: 2.2, '&:last-child': { pb: 2.2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 36, height: 36, borderRadius: 2, fontFamily: '"Syne",sans-serif', fontWeight: 700,
                          background: `linear-gradient(135deg, ${ACCENT2} 0%, ${TEAL} 100%)`, color: '#fff', fontSize: '0.85rem' }}>
                          {student.name?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ color: CREAM, fontSize: '0.85rem', fontWeight: 600 }}>{student.name}</Typography>
                          <Typography sx={{ color: STEEL, fontSize: '0.72rem' }}>{student.college || ''}</Typography>
                        </Box>
                      </Box>
                      {isCompleted
                        ? <Chip label="Done" size="small" sx={{ background: 'rgba(78,205,196,0.15)', color: TEAL, fontSize: '0.65rem' }} />
                        : <Chip label="In Progress" size="small" sx={{ background: 'rgba(108,127,216,0.12)', color: ACCENT2, fontSize: '0.65rem' }} />}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <LinearProgress variant="determinate" value={overallPct} sx={{ flex: 1, height: 6, borderRadius: 3 }} />
                      <Typography sx={{ color: ACCENT2, fontSize: '0.75rem', fontWeight: 700, width: 36 }}>{overallPct}%</Typography>
                    </Box>
                    {grandScore !== undefined && grandScore !== null && (
                      <Typography sx={{ color: GOLD, fontSize: '0.75rem', mt: 1, fontWeight: 600 }}>
                        Grand Test: {grandScore}%
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}