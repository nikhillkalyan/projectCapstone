import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getEnrolledCourses, getFavoriteCourses } from '../../api/studentApi';
import { getAllCourses } from '../../api/courseApi';
import { getCourseProgress } from '../../api/progressApi';
import StudentLayout from '../../components/layout/v2/StudentLayout';
import CourseCard from '../../components/shared/CourseCard';
import { Star, Play, Award, Compass, BookOpen, Heart, Trophy, TrendingUp, Loader2 } from 'lucide-react';
import { ACCENT, ACCENT2, TEAL, STEEL, CREAM, SAND, GOLD, DANGER, NAVY, NAVY2 } from '../../theme';
import StatCard from '../../components/shared/StatCard';
import SectionShell from '../../components/shared/SectionShell';
import EmptyState from '../../components/shared/EmptyState';

const SIDEBAR_W = 248;

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [favCourses, setFavCourses] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Run API calls in parallel
        const [enrolledRes, favRes, allRes] = await Promise.all([
          getEnrolledCourses().catch(() => ({ data: [] })),
          getFavoriteCourses().catch(() => ({ data: [] })),
          getAllCourses().catch(() => ({ data: [] }))
        ]);

        const favs = favRes.data || [];
        setFavCourses(favs);
        
        let enrollments = enrolledRes.data || [];
        
        // Extract courses
        let enrolled = enrollments.map(e => ({
            ...(e.course || {}),
            enrollmentId: e.enrollmentId,
            enrolledAt: e.enrolledAt,
            progress: 0
        }));
        
        // Fetch progress for each enrolled course
        const progressPromises = enrolled.map(c => {
            if(!c.id) return Promise.resolve({ data: { percentage: 0 } });
            return getCourseProgress(c.id).catch(() => ({ data: { percentage: 0 } }));
        });
        const progressResults = await Promise.all(progressPromises);
        
        enrolled = enrolled.map((c, i) => ({
            ...c,
            progress: progressResults[i]?.data?.overallProgress || 0,
            isCompleted: progressResults[i]?.data?.isCompleted || false
        }));
        
        // Sometimes the backend might return the same course multiple times if not Distinct, let's deduplicate just in case
        const uniqueEnrols = Array.from(new Map(enrolled.map(item => [item.id, item])).values());
        setEnrolledCourses(uniqueEnrols);

        const all = allRes.data || [];
        const interests = user?.profile?.interests || user?.interests || [];
        const enrolledIds = uniqueEnrols.map(c => c.id);
        const recs = all.filter(c => interests.includes(c.category) && !enrolledIds.includes(c.id)).slice(0, 3);
        setRecommended(recs.length > 0 ? recs : all.filter(c => !enrolledIds.includes(c.id)).slice(0, 3));
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    // Only attempt fetch if user exists
    if (user) {
        fetchDashboardData();
    } else {
        setLoading(false);
    }
  }, [user]);

  const completedCourses = enrolledCourses.filter(c => c.isCompleted || c.progress >= 100);
  const completedCount = completedCourses.length;
  
  // Define progress bounds
  const inProgressCourses = enrolledCourses.filter(c => !c.isCompleted && c.progress < 100);
  const activelyLearning = inProgressCourses.filter(c => c.progress > 0);
  
  const totalProgress = enrolledCourses.length > 0
    ? Math.round(enrolledCourses.reduce((sum, c) => sum + (c.progress || 0), 0) / enrolledCourses.length) : 0;

  const stats = [
    { icon: BookOpen, label: 'Enrolled', value: enrolledCourses.length, color: ACCENT2, delay: 1 },
    { icon: Heart, label: 'Favorites', value: favCourses.length, color: DANGER, delay: 2 },
    { icon: Trophy, label: 'Completed', value: completedCount, color: TEAL, delay: 3 },
    { icon: TrendingUp, label: 'Avg. Progress', value: `${totalProgress}%`, color: GOLD, delay: 4 },
  ];

  const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });

  if (loading) {
    return (
        <StudentLayout>
            <div className="flex flex-col h-full items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-4" />
                <p className="text-text-secondary font-dmsans">Loading dashboard...</p>
            </div>
        </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      {/* Header */}
      <div className="animate-fade-in-up flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-[#6C7FD8] text-xs font-semibold tracking-wider mb-1 uppercase drop-shadow-[0_0_8px_rgba(108,127,216,0.3)]">
            {dateStr}
          </p>
          <h1 className="font-syne font-extrabold text-white text-3xl md:text-4xl leading-tight mb-2">
            Welcome back, {user?.name?.split(' ')[0] || user?.profile?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-text-secondary text-sm">
            {activelyLearning.length > 0
              ? `You have ${activelyLearning.length} course${activelyLearning.length > 1 ? 's' : ''} in progress.`
              : 'Ready to start learning today?'}
          </p>
        </div>
        <button
          onClick={() => navigate('/student/explore')}
          className="animate-pulse-glow flex-shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#D4A843] to-[#D4C9A5] text-[#161B27] rounded-xl font-bold font-syne shadow-lg shadow-[#D4A843]/20 hover:shadow-[#D4A843]/40 transition-all hover:-translate-y-0.5 whitespace-nowrap"
        >
          <Compass className="w-5 h-5" />
          <span>Explore Courses</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((s, idx) => (
          <StatCard key={s.label} {...s} delay={idx + 1} />
        ))}
      </div>

      {/* In Progress */}
      {inProgressCourses.length > 0 && (
        <SectionShell
          title="Continue Learning"
          icon={Play}
          iconColor="text-teal-400 fill-current"
          delay={2}
          action={
            <button
              onClick={() => navigate('/student/enrolled')}
              className="text-primary-400 font-medium text-sm hover:text-primary-500 transition-colors"
            >
              View All →
            </button>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {inProgressCourses.slice(0, 3).map(course => (
              <CourseCard 
                key={course.id} 
                course={course} 
                enrolled={true} 
                favorited={favCourses.some(f => f.id === course.id)} 
                progress={course.progress}
              />
            ))}
          </div>
        </SectionShell>
      )}

      {/* Recommended */}
      {recommended.length > 0 && (
        <SectionShell
          title="Recommended for You"
          icon={Star}
          iconColor="text-amber-400 fill-current"
          delay={3}
          action={
            <button
              onClick={() => navigate('/student/explore')}
              className="text-primary-400 font-medium text-sm hover:text-primary-500 transition-colors"
            >
              See All →
            </button>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {recommended.map(course => (
              <CourseCard 
                key={course.id} 
                course={course} 
                enrolled={false} 
                favorited={favCourses.some(f => f.id === course.id)} 
              />
            ))}
          </div>
        </SectionShell>
      )}

      {/* Completed */}
      {completedCourses.length > 0 && (
        <SectionShell
          title="Completed Courses"
          icon={Trophy}
          iconColor="text-amber-400"
          delay={4}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {completedCourses.map(course => (
              <CourseCard 
                key={course.id} 
                course={course} 
                enrolled={true} 
                completed={true}
                favorited={favCourses.some(f => f.id === course.id)} 
                progress={course.progress}
              />
            ))}
          </div>
        </SectionShell>
      )}

      {/* Empty state */}
      {enrolledCourses.length === 0 && (
        <EmptyState
          icon={Compass}
          title="Start Your Learning Journey"
          description="Explore courses tailored to your interests to begin building your skills."
          action={
            <button
              onClick={() => navigate('/student/explore')}
              className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:shadow-[0_8px_24px_rgba(108,127,216,0.25)] transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              Explore Courses →
            </button>
          }
        />
      )}
    </StudentLayout>
  );
}