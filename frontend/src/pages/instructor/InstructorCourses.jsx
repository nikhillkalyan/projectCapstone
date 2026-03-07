import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import InstructorLayout from '../../components/layout/v2/InstructorLayout';
import { Plus, Settings, BarChart2, FileText } from 'lucide-react';

import CourseCard from '../../components/shared/CourseCard';
import SectionShell from '../../components/shared/SectionShell';
import EmptyState from '../../components/shared/EmptyState';

export default function InstructorCourses() {
  const { user } = useAuth();
  const { db } = useApp();
  const navigate = useNavigate();

  const myCourses = useMemo(() => db.courses.filter(c => c.instructorId === user?.id), [user, db.courses]);
  const totalStudents = myCourses.reduce((s, c) => s + (c.enrolledCount || 0), 0);

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