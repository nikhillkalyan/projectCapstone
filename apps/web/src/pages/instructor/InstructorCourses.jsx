import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getCoursesByInstructor } from '../../api/courseApi';
import InstructorLayout from '../../components/layout/v2/InstructorLayout';
import { Plus, Settings, BarChart2, FileText, Loader2 } from 'lucide-react';

import CourseCard from '../../components/shared/CourseCard';
import SectionShell from '../../components/shared/SectionShell';
import EmptyState from '../../components/shared/EmptyState';

export default function InstructorCourses() {
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

  if (loading) {
      return (
          <InstructorLayout>
              <div className="flex flex-col h-[60vh] items-center justify-center font-dmsans text-text-primary">
                  <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-4" />
                  <span className="text-text-secondary">Loading courses...</span>
              </div>
          </InstructorLayout>
      );
  }

  return (
    <InstructorLayout>
      <div className="max-w-[1600px] mx-auto w-full pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-syne font-bold text-text-primary mb-2">My Courses</h1>
            <p className="text-text-secondary font-dmsans">
              {myCourses.length} course{myCourses.length !== 1 ? 's' : ''} · {totalStudents} total students
            </p>
          </div>
          <button
            onClick={() => navigate('/instructor/create-course')}
            className="bg-primary-500 hover:bg-primary-600 text-white font-semibold flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-primary-500/25 active:scale-95 cursor-pointer max-w-fit"
          >
            <Plus className="w-5 h-5 flex-shrink-0" />
            Create New Course
          </button>
        </motion.div>

        {myCourses.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No courses yet"
            description="Create your first course to start teaching and building your portfolio."
            action={
              <button
                onClick={() => navigate('/instructor/create-course')}
                className="bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 border border-primary-500/30 font-semibold flex items-center justify-center gap-2 px-8 py-3 rounded-xl transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-5 h-5 flex-shrink-0" />
                Create Course
              </button>
            }
          />
        ) : (
          <SectionShell title="Published Courses" icon={FileText} delay={1}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {myCourses.map((course) => (
                <div key={course.id} className="relative group flex flex-col">
                  {/* Reuse our standardized CourseCard component */}
                  <CourseCard course={course} />

                  {/* Instructor Admin Overlay Controls */}
                  <div className="absolute top-3 right-3 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/instructor/course/${course.id}`); }}
                      className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-primary-500 hover:border-primary-400 transition-colors cursor-pointer"
                      title="Manage Course"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/instructor/students/${course.id}`); }}
                      className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-teal-500 hover:border-teal-400 transition-colors cursor-pointer"
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
      </div>
    </InstructorLayout>
  );
}