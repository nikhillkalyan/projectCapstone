import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import StudentLayout from '../../components/layout/v2/StudentLayout';
import CourseCard from '../../components/shared/CourseCard';
import EmptyState from '../../components/shared/EmptyState';
import SectionShell from '../../components/shared/SectionShell';
import { BookOpen, Heart, Compass, CheckCircle2, PlayCircle, Clock } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

function Section({ title, icon, courses, user, isCompletedSection = false }) {
  if (courses.length === 0) return null;
  return (
    <SectionShell title={title} icon={icon} className="mb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.map(course => {
          const completedData = user?.completedCourses?.find(cc => cc.courseId === course.id);
          return (
            <CourseCard
              key={course.id}
              course={course}
              enrolled={!isCompletedSection}
              favorited={user?.favoriteCourses?.includes(course.id)}
              completed={isCompletedSection}
              score={completedData?.score}
            />
          );
        })}
      </div>
    </SectionShell>
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

  console.info("DEBUG EnrolledCourses:", {
    user: user?.name,
    enrolledIds: user?.enrolledCourses,
    enrolledObjectsCount: enrolled.length,
    inProgressCount: inProgress.length,
    notStartedCount: notStarted.length,
    completedCount: completed.length
  });

  return (
    <StudentLayout>
      <div className="max-w-[1600px] mx-auto w-full pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-syne font-bold text-text-primary mb-2">My Courses</h1>
            <p className="text-text-secondary font-dmsans">
              {enrolled.length} course{enrolled.length !== 1 ? 's' : ''} enrolled
            </p>
          </div>
          <button
            onClick={() => navigate('/student/explore')}
            className="bg-primary-500 hover:bg-primary-600 text-white font-semibold flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-primary-500/25 active:scale-95 cursor-pointer max-w-fit"
          >
            <Compass className="w-5 h-5" />
            Explore More
          </button>
        </motion.div>

        {enrolled.length === 0 && completed.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No enrolled courses yet"
            description="Start your learning journey today! Browse our catalog to find a course that interests you."
            action={
              <button
                onClick={() => navigate('/student/explore')}
                className="bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 border border-primary-500/30 font-semibold flex items-center justify-center gap-2 px-8 py-3 rounded-xl transition-all active:scale-95 cursor-pointer"
              >
                <Compass className="w-5 h-5" />
                Explore Courses
              </button>
            }
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Section title="In Progress" icon={PlayCircle} courses={inProgress} user={user} />
            <Section title="Not Started" icon={Clock} courses={notStarted} user={user} />
            <Section title="Completed" icon={CheckCircle2} courses={completed} user={user} isCompletedSection />
          </motion.div>
        )}
      </div>
    </StudentLayout>
  );
}

export function FavoriteCourses() {
  const { user } = useAuth();
  const { db } = useApp();
  const navigate = useNavigate();

  const favorites = useMemo(() => db.courses.filter(c => user?.favoriteCourses?.includes(c.id)), [user, db.courses]);

  return (
    <StudentLayout>
      <div className="max-w-[1600px] mx-auto w-full pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-syne font-bold text-text-primary mb-2 flex flex-row items-center gap-3">
            <Heart className="w-8 h-8 text-rose-500 fill-rose-500/20" />
            Favorite Courses
          </h1>
          <p className="text-text-secondary font-dmsans">
            {favorites.length} course{favorites.length !== 1 ? 's' : ''} saved
          </p>
        </motion.div>

        {favorites.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No favorites yet"
            description="Add courses to your favorites by clicking the heart icon on any course card."
            action={
              <button
                onClick={() => navigate('/student/explore')}
                className="bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 border border-primary-500/30 font-semibold flex items-center justify-center gap-2 px-8 py-3 rounded-xl transition-all active:scale-95 cursor-pointer"
              >
                <Compass className="w-5 h-5" />
                Explore Courses
              </button>
            }
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {favorites.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                enrolled={user?.enrolledCourses?.includes(course.id)}
                favorited
              />
            ))}
          </motion.div>
        )}
      </div>
    </StudentLayout>
  );
}

export default EnrolledCourses;