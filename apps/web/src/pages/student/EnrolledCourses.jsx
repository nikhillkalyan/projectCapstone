import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getEnrolledCourses, getFavoriteCourses } from '../../api/studentApi';
import { getCourseProgress } from '../../api/progressApi';
import StudentLayout from '../../components/layout/v2/StudentLayout';
import CourseCard from '../../components/shared/CourseCard';
import EmptyState from '../../components/shared/EmptyState';
import SectionShell from '../../components/shared/SectionShell';
import { BookOpen, Heart, Compass, CheckCircle2, PlayCircle, Clock, Loader2 } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

function Section({ title, icon, courses, user, isCompletedSection = false }) {
  if (!courses || courses.length === 0) return null;
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
              progress={course.progress}
            />
          );
        })}
      </div>
    </SectionShell>
  );
}

export function EnrolledCourses() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [enrolled, setEnrolled] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getEnrolledCourses();
            let enrollments = res.data || [];
            
            // extract courses
            let courses = enrollments.map(e => ({
                ...(e.course || {}),
                enrollmentId: e.enrollmentId,
                enrolledAt: e.enrolledAt,
                progress: 0 // Default, will be updated below
            }));
            
            // fetch progress for all
            const progressPromises = courses.map(c => {
                if(!c.id) return Promise.resolve({ data: { percentage: 0 } });
                return getCourseProgress(c.id).catch(() => ({ data: { percentage: 0 } }));
            });
            const progressResults = await Promise.all(progressPromises);
            
            courses = courses.map((c, i) => ({
                ...c,
                progress: progressResults[i]?.data?.overallProgress || 0,
                isCompleted: progressResults[i]?.data?.isCompleted || false
            }));

            // unique in case backend returns dups
            const unique = Array.from(new Map(courses.map(item => [item.id, item])).values());
            setEnrolled(unique);
        } catch (err) {
            console.error("Failed to load enrolled courses:", err);
        } finally {
            setLoading(false);
        }
    }
    if (user) fetchData();
  }, [user]);

  const inProgress = enrolled.filter(c => c.progress > 0 && !c.isCompleted);
  const notStarted = enrolled.filter(c => c.progress === 0 && !c.isCompleted);
  const completed = enrolled.filter(c => c.isCompleted || c.progress >= 100);

  if (loading) {
    return (
        <StudentLayout>
            <div className="flex flex-col h-full items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-4" />
                <p className="text-text-secondary font-dmsans">Loading your courses...</p>
            </div>
        </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-[1600px] mx-auto w-full pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="heading-2 mb-2 text-gradient">My Courses</h1>
            <p className="text-text-secondary">
              {enrolled.length} course{enrolled.length !== 1 ? 's' : ''} enrolled
            </p>
          </div>
          <button
            onClick={() => navigate('/student/explore')}
            className="flex max-w-fit cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-primary px-6 py-2.5 font-semibold text-white shadow-glow transition-all hover:-translate-y-0.5 active:scale-95"
          >
            <Compass className="w-5 h-5" />
            Explore More
          </button>
        </motion.div>

        {enrolled.length === 0 ? (
          <EmptyState
             icon={BookOpen}
            title="No enrolled courses yet"
            description="Start your learning journey today! Browse our catalog to find a course that interests you."
            action={
              <button
                onClick={() => navigate('/student/explore')}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-primary-400/30 bg-primary-500/10 px-8 py-3 font-semibold text-primary-300 transition-all hover:bg-primary-500/20 active:scale-95"
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
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            const [favRes, enrRes] = await Promise.all([
                getFavoriteCourses(),
                getEnrolledCourses().catch(() => ({ data: [] }))
            ]);
            setFavorites(favRes.data || []);
            setEnrolledIds((enrRes.data || []).map(e => e.course?.id).filter(Boolean));
        } catch (err) {
            console.error("Failed to load favorite courses:", err);
        } finally {
            setLoading(false);
        }
    }
    if (user) fetchData();
  }, [user]);

  if (loading) {
    return (
        <StudentLayout>
            <div className="flex flex-col h-full items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-4" />
                <p className="text-text-secondary font-dmsans">Loading favorites...</p>
            </div>
        </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-[1600px] mx-auto w-full pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="heading-2 mb-2 flex flex-row items-center gap-3 text-gradient">
            <Heart className="h-8 w-8 fill-error-500/20 text-error-400" />
            Favorite Courses
          </h1>
          <p className="text-text-secondary">
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
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-primary-400/30 bg-primary-500/10 px-8 py-3 font-semibold text-primary-300 transition-all hover:bg-primary-500/20 active:scale-95"
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
                enrolled={enrolledIds.includes(course.id)}
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
