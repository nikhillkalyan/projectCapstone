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
import { Star, Eye, BarChart2, BookOpen, Plus, Users, MessageSquare } from 'lucide-react';
import { ACCENT2, TEAL, STEEL, CREAM, SAND, GOLD, DANGER, NAVY } from '../../theme';

const SIDEBAR_W = 248;

const catColors = {
  AIML: { bg: 'rgba(108,127,216,0.18)', color: ACCENT2, border: 'rgba(108,127,216,0.3)' },
  Cloud: { bg: 'rgba(78,205,196,0.18)', color: TEAL, border: 'rgba(78,205,196,0.3)' },
  DataScience: { bg: 'rgba(212,168,67,0.18)', color: GOLD, border: 'rgba(212,168,67,0.3)' },
  Cybersecurity: { bg: 'rgba(231,76,111,0.18)', color: DANGER, border: 'rgba(231,76,111,0.3)' },
};
import CourseCard from '../../components/shared/CourseCard';
import StatCard from '../../components/shared/StatCard';
import SectionShell from '../../components/shared/SectionShell';
import EmptyState from '../../components/shared/EmptyState';

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
    { icon: BookOpen, label: 'Total Courses', value: myCourses.length, color: ACCENT2, delay: 1 },
    { icon: Users, label: 'Total Students', value: totalStudents, color: TEAL, delay: 2 },
    { icon: Star, label: 'Avg Rating', value: avgRating, color: GOLD, delay: 3 },
    { icon: MessageSquare, label: 'Total Reviews', value: allReviews.length, color: DANGER, delay: 4 },
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
        <Button variant="contained" color="primary" startIcon={<Plus />}
          onClick={() => navigate('/instructor/create-course')}
          sx={{ px: 3, py: 1.3, whiteSpace: 'nowrap', flexShrink: 0 }}>
          Create Course
        </Button>
      </Box>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((s, idx) => (
          <StatCard key={s.label} {...s} delay={idx + 1} />
        ))}
      </div>

      {/* Courses grid */}
      {myCourses.length > 0 && (
        <SectionShell
          title="Your Courses"
          icon={BookOpen}
          iconColor="text-indigo-400"
          delay={2}
          action={
            <button
              onClick={() => navigate('/instructor/courses')}
              className="text-primary-400 font-medium text-sm hover:text-primary-500 transition-colors"
            >
              View All →
            </button>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {myCourses.slice(0, 3).map((course, i) => (
              <div key={course.id} className="relative group flex flex-col">
                <CourseCard course={course} />
                {/* Injection of Instructor Admin Buttons Over the Card */}
                <div className="absolute top-3 right-3 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/instructor/course/${course.id}`); }}
                    className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-primary-500 hover:border-primary-400 transition-colors"
                    title="Manage Course"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/instructor/students/${course.id}`); }}
                    className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-teal-500 hover:border-teal-400 transition-colors"
                    title="View Students"
                  >
                    <BarChart2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SectionShell>
      )}

      {/* Recent Reviews */}
      {allReviews.length > 0 && (
        <SectionShell
          title="Recent Reviews"
          icon={Star}
          iconColor="text-amber-400 fill-current"
          delay={3}
        >
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
        </SectionShell>
      )}

      {/* Empty state */}
      {myCourses.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="Create Your First Course"
          description="Share your expertise with thousands of students and build your teaching portfolio."
          action={
            <button
              onClick={() => navigate('/instructor/create-course')}
              className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:shadow-[0_8px_24px_rgba(108,127,216,0.25)] transition-all hover:scale-[1.02] flex items-center justify-center gap-2 mt-2"
            >
              <Plus className="w-5 h-5 fill-current" />
              Create Course
            </button>
          }
        />
      )}
    </InstructorLayout>
  );
}