import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getCoursesByInstructor } from '../../api/courseApi';
import InstructorLayout from '../../components/layout/v2/InstructorLayout';
import { Star, Eye, BarChart2, BookOpen, Plus, Users, MessageSquare, Loader2 } from 'lucide-react';
import CourseCard from '../../components/shared/CourseCard';
import StatCard from '../../components/shared/StatCard';
import SectionShell from '../../components/shared/SectionShell';
import EmptyState from '../../components/shared/EmptyState';
import ReviewCard from '../../components/shared/ReviewCard';

export default function InstructorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     const fetchCourses = async () => {
         if (!user?.id) {
             setLoading(false);
             return;
         }
         setLoading(true);
         try {
             const res = await getCoursesByInstructor(user.id);
             setMyCourses(res.data || []);
         } catch(err) {
             console.error("Failed to fetch instructor courses:", err);
         } finally {
             setLoading(false);
         }
     };
     fetchCourses();
  }, [user]);

  const totalStudents = myCourses.reduce((s, c) => s + (c.totalEnrollments || 0), 0);
  const avgRating = myCourses.length > 0
    ? (myCourses.reduce((s, c) => s + (c.rating || 0), 0) / myCourses.length).toFixed(1) : '—';
  const allReviews = myCourses.flatMap(c => (c.reviews || []).map(r => ({ ...r, courseTitle: c.title })));

  const stats = [
    { icon: BookOpen, label: 'Total Courses', value: myCourses.length, color: '#6C7FD8', delay: 1 },
    { icon: Users, label: 'Total Students', value: totalStudents, color: '#4ECDC4', delay: 2 },
    { icon: Star, label: 'Avg Rating', value: avgRating, color: '#D4A843', delay: 3 },
    { icon: MessageSquare, label: 'Total Reviews', value: allReviews.length, color: '#E74C3C', delay: 4 },
  ];

  if (loading) {
      return (
          <InstructorLayout>
              <div className="flex flex-col h-[60vh] items-center justify-center font-dmsans text-text-primary">
                  <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-4" />
                  <span className="text-text-secondary">Loading dashboard...</span>
              </div>
          </InstructorLayout>
      );
  }

  return (
    <InstructorLayout>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4"
      >
        <div>
          <h1 className="heading-2 mb-2 text-gradient">
            Instructor Dashboard
          </h1>
          <p className="text-text-secondary">
            Welcome back, {user?.name?.split(' ')[0]}! Here's your overview.
          </p>
        </div>
        <button
          onClick={() => navigate('/instructor/create-course')}
          className="flex max-w-fit cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-primary px-6 py-2.5 font-semibold text-white shadow-glow transition-all hover:-translate-y-0.5 active:scale-95"
        >
          <Plus className="w-5 h-5 flex-shrink-0" />
          Create Course
        </button>
      </motion.div>

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
            {myCourses.slice(0, 3).map((course) => (
              <div key={course.id} className="relative group flex flex-col">
                <CourseCard course={course} />
                {/* Injection of Instructor Admin Buttons Over the Card */}
                <div className="absolute top-3 right-3 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/instructor/course/${course.id}`); }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-black/60 text-white backdrop-blur-md transition-colors hover:border-primary-400 hover:bg-primary-500"
                    title="Manage Course"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/instructor/students/${course.id}`); }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-black/60 text-white backdrop-blur-md transition-colors hover:border-accent-400 hover:bg-accent-500"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {allReviews.slice(-6).reverse().map((r, i) => (
              <ReviewCard key={i} review={r} index={i} />
            ))}
          </div>
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
              className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-gradient-primary px-6 py-2.5 font-semibold text-white shadow-glow transition-all hover:scale-[1.02]"
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
