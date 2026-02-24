import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import StudentSidebar from '../../components/layout/StudentSidebar';
import CourseCard from '../../components/shared/CourseCard';
import { BookOpen, Heart, Award, Compass, TrendingUp, Clock, Star } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { db, getCourseProgress } = useApp();
  const navigate = useNavigate();

  const enrolledCourses = useMemo(() => 
    db.courses.filter(c => user?.enrolledCourses?.includes(c.id)),
    [user, db.courses]
  );

  const favCourses = useMemo(() =>
    db.courses.filter(c => user?.favoriteCourses?.includes(c.id)),
    [user, db.courses]
  );

  const recommended = useMemo(() => {
    const interests = user?.interests || [];
    const enrolled = user?.enrolledCourses || [];
    return db.courses.filter(c => 
      interests.includes(c.category) && !enrolled.includes(c.id)
    ).slice(0, 3);
  }, [user, db.courses]);

  const completedCount = user?.completedCourses?.length || 0;
  const totalProgress = enrolledCourses.length > 0
    ? Math.round(enrolledCourses.reduce((sum, c) => sum + getCourseProgress(c.id), 0) / enrolledCourses.length)
    : 0;

  const stats = [
    { icon: BookOpen, label: 'Enrolled', value: enrolledCourses.length, color: '#6B7FD4' },
    { icon: Heart, label: 'Favorites', value: favCourses.length, color: '#E74C6F' },
    { icon: Award, label: 'Completed', value: completedCount, color: '#4ECDC4' },
    { icon: TrendingUp, label: 'Avg. Progress', value: `${totalProgress}%`, color: '#D4A843' },
  ];

  const inProgressCourses = enrolledCourses.filter(c => {
    const p = getCourseProgress(c.id);
    return p > 0 && p < 100;
  });

  return (
    <div className="flex">
      <StudentSidebar />
      <div className="main-content p-8">
        {/* Header */}
        <div className="mb-10 animate-fadeInUp">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm mb-2 font-semibold" style={{ color: 'var(--accent-light)' }}>
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
              <h1 className="text-4xl font-black" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>
                Welcome back, {user?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="mt-2" style={{ color: 'var(--steel)' }}>
                {inProgressCourses.length > 0 
                  ? `You have ${inProgressCourses.length} course${inProgressCourses.length > 1 ? 's' : ''} in progress. Keep it up!`
                  : 'Ready to start learning today?'}
              </p>
            </div>
            <button onClick={() => navigate('/student/explore')} className="btn-sand px-6 py-3 rounded-2xl flex items-center gap-2 animate-pulse-glow">
              <Compass size={18} /> Explore Courses
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-5 mb-10">
          {stats.map(({ icon: Icon, label, value, color }, i) => (
            <div key={label} className="glass rounded-2xl p-5 animate-fadeInUp" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm" style={{ color: 'var(--steel)' }}>{label}</span>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
                  <Icon size={18} style={{ color }} />
                </div>
              </div>
              <div className="text-3xl font-black" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* In Progress */}
        {inProgressCourses.length > 0 && (
          <section className="mb-10 animate-fadeInUp delay-200">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>
                📚 Continue Learning
              </h2>
              <button onClick={() => navigate('/student/enrolled')} className="text-sm" style={{ color: 'var(--accent-light)' }}>View All →</button>
            </div>
            <div className="grid grid-cols-3 gap-5">
              {inProgressCourses.map(course => (
                <CourseCard key={course.id} course={course} enrolled={true} favorited={user?.favoriteCourses?.includes(course.id)} />
              ))}
            </div>
          </section>
        )}

        {/* Recommended */}
        {recommended.length > 0 && (
          <section className="mb-10 animate-fadeInUp delay-300">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>
                ⭐ Recommended for You
              </h2>
              <button onClick={() => navigate('/student/explore')} className="text-sm" style={{ color: 'var(--accent-light)' }}>See All →</button>
            </div>
            <div className="grid grid-cols-3 gap-5">
              {recommended.map(course => (
                <CourseCard key={course.id} course={course} enrolled={user?.enrolledCourses?.includes(course.id)} favorited={user?.favoriteCourses?.includes(course.id)} />
              ))}
            </div>
          </section>
        )}

        {/* Completed courses */}
        {user?.completedCourses?.length > 0 && (
          <section className="animate-fadeInUp delay-400">
            <h2 className="text-xl font-bold mb-5" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>
              🏆 Completed Courses
            </h2>
            <div className="grid gap-3">
              {user.completedCourses.map(({ courseId, score, completedAt }) => {
                const course = db.courses.find(c => c.id === courseId);
                if (!course) return null;
                return (
                  <div key={courseId} className="glass rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img src={course.thumbnail} alt="" className="w-14 h-10 rounded-xl object-cover" />
                      <div>
                        <div className="font-semibold text-sm" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>{course.title}</div>
                        <div className="text-xs" style={{ color: 'var(--steel)' }}>Completed • Score: {score}%</div>
                      </div>
                    </div>
                    <button onClick={() => navigate(`/student/certificate/${courseId}`)} className="btn-sand px-4 py-2 rounded-xl text-xs flex items-center gap-1.5">
                      <Award size={14} /> View Certificate
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {enrolledCourses.length === 0 && (
          <div className="text-center py-20 animate-fadeInUp delay-200">
            <div className="text-6xl mb-6 animate-float">🎯</div>
            <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>Start Your Learning Journey</h2>
            <p className="mb-8" style={{ color: 'var(--steel)' }}>Explore courses tailored to your interests</p>
            <button onClick={() => navigate('/student/explore')} className="btn-sand px-8 py-4 rounded-2xl">
              Explore Courses →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}