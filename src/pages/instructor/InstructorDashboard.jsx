import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import InstructorSidebar from '../../components/layout/InstructorSidebar';
import { BookOpen, Users, Star, Plus, TrendingUp, Award, Eye } from 'lucide-react';

export default function InstructorDashboard() {
  const { user } = useAuth();
  const { db } = useApp();
  const navigate = useNavigate();

  const myCourses = useMemo(() =>
    db.courses.filter(c => c.instructorId === user?.id),
    [user, db.courses]
  );

  const totalStudents = myCourses.reduce((s, c) => s + (c.enrolledCount || 0), 0);
  const avgRating = myCourses.length > 0
    ? (myCourses.reduce((s, c) => s + (c.rating || 0), 0) / myCourses.length).toFixed(1)
    : '0.0';
  const totalReviews = myCourses.reduce((s, c) => s + (c.reviews?.length || 0), 0);

  const stats = [
    { icon: BookOpen, label: 'Total Courses', value: myCourses.length, color: '#6B7FD4' },
    { icon: Users, label: 'Total Students', value: totalStudents.toLocaleString(), color: '#4ECDC4' },
    { icon: Star, label: 'Avg. Rating', value: avgRating, color: '#D4A843' },
    { icon: Award, label: 'Total Reviews', value: totalReviews, color: '#E74C6F' },
  ];

  return (
    <div className="flex">
      <InstructorSidebar />
      <div className="main-content p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10 animate-fadeInUp">
          <div>
            <h1 className="text-4xl font-black mb-2" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>
              Hello, {user?.name?.split(' ')[0]}! 👨‍🏫
            </h1>
            <p style={{ color: 'var(--steel)' }}>Here's your teaching overview</p>
          </div>
          <button onClick={() => navigate('/instructor/create-course')} className="btn-sand px-6 py-3 rounded-2xl flex items-center gap-2 animate-pulse-glow">
            <Plus size={18} /> Create Course
          </button>
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

        {/* Course list */}
        <section className="animate-fadeInUp delay-300">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>My Courses</h2>
            <button onClick={() => navigate('/instructor/courses')} className="text-sm" style={{ color: 'var(--accent-light)' }}>View All →</button>
          </div>

          {myCourses.length === 0 ? (
            <div className="text-center py-16 glass rounded-3xl">
              <div className="text-5xl mb-4 animate-float">📚</div>
              <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>No courses yet</h3>
              <p className="mb-6" style={{ color: 'var(--steel)' }}>Create your first course and start teaching!</p>
              <button onClick={() => navigate('/instructor/create-course')} className="btn-sand px-8 py-3 rounded-2xl">Create Course</button>
            </div>
          ) : (
            <div className="space-y-4">
              {myCourses.map(course => (
                <div key={course.id} className="glass rounded-2xl p-5 flex items-center gap-5 group hover:border-accent transition-all duration-200">
                  <img src={course.thumbnail} alt="" className="w-20 h-14 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold truncate" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>{course.title}</h3>
                      <span className={`badge badge-${course.category.toLowerCase()} flex-shrink-0`}>{course.category}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--steel)' }}>
                      <span className="flex items-center gap-1"><Users size={12} />{course.enrolledCount?.toLocaleString()} students</span>
                      <span className="flex items-center gap-1"><Star size={12} style={{ color: '#D4A843' }} fill="#D4A843" />{course.rating?.toFixed(1)}</span>
                      <span className="flex items-center gap-1"><BookOpen size={12} />{course.chapters?.length} chapters</span>
                      <span>{course.level}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => navigate(`/instructor/students/${course.id}`)} className="btn-outline px-4 py-2 rounded-xl text-xs flex items-center gap-1.5">
                      <Users size={14} /> Students
                    </button>
                    <button onClick={() => navigate(`/instructor/course/${course.id}`)} className="btn-primary px-4 py-2 rounded-xl text-xs flex items-center gap-1.5">
                      <Eye size={14} /> Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent reviews */}
        {totalReviews > 0 && (
          <section className="mt-10 animate-fadeInUp delay-400">
            <h2 className="text-xl font-bold mb-5" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>Recent Reviews</h2>
            <div className="grid grid-cols-2 gap-4">
              {myCourses.flatMap(c => (c.reviews || []).map(r => ({ ...r, courseName: c.title }))).slice(0, 4).map((review, i) => (
                <div key={i} className="glass rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>{review.studentName}</span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, s) => (
                        <span key={s} style={{ color: s < review.rating ? '#D4A843' : 'rgba(172, 186, 196, 0.3)', fontSize: '12px' }}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs mb-2" style={{ color: 'var(--steel)' }}>{review.courseName}</p>
                  <p className="text-sm" style={{ color: 'rgba(240, 240, 219, 0.8)' }}>{review.review}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}