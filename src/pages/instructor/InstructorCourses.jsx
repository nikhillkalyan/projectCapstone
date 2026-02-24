import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import InstructorSidebar from '../../components/layout/InstructorSidebar';
import { Plus, Star, Users, BookOpen, Eye, BarChart2 } from 'lucide-react';

export default function InstructorCourses() {
  const { user } = useAuth();
  const { db } = useApp();
  const navigate = useNavigate();

  const courses = useMemo(() => db.courses.filter(c => c.instructorId === user?.id), [user, db.courses]);

  return (
    <div className="flex">
      <InstructorSidebar />
      <div className="main-content p-8">
        <div className="flex items-center justify-between mb-10 animate-fadeInUp">
          <div>
            <h1 className="text-4xl font-black mb-2" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>My Courses</h1>
            <p style={{ color: 'var(--steel)' }}>{courses.length} course{courses.length !== 1 ? 's' : ''} created</p>
          </div>
          <button onClick={() => navigate('/instructor/create-course')} className="btn-sand px-5 py-3 rounded-2xl flex items-center gap-2 animate-pulse-glow">
            <Plus size={18} /> Create Course
          </button>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-20 glass rounded-3xl">
            <div className="text-6xl mb-6 animate-float">📚</div>
            <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>No courses yet</h2>
            <p className="mb-8" style={{ color: 'var(--steel)' }}>Create your first course and start teaching!</p>
            <button onClick={() => navigate('/instructor/create-course')} className="btn-sand px-8 py-4 rounded-2xl">Create Course</button>
          </div>
        ) : (
          <div className="grid gap-5 animate-fadeInUp delay-100">
            {courses.map(course => (
              <div key={course.id} className="glass rounded-2xl p-6 flex gap-6">
                <div className="relative flex-shrink-0">
                  <img src={course.thumbnail || 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=200&q=80'} alt=""
                    className="w-36 h-24 rounded-xl object-cover" />
                  <span className={`badge badge-${course.category.toLowerCase()} absolute top-2 left-2`} style={{ fontSize: '9px', padding: '2px 6px' }}>{course.category}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold mb-1" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>{course.title}</h3>
                      <p className="text-sm line-clamp-2 mb-3" style={{ color: 'var(--steel)' }}>{course.description}</p>
                    </div>
                    <span className="badge text-xs ml-4 flex-shrink-0" style={{ background: 'rgba(172, 186, 196, 0.1)', color: 'var(--steel)' }}>{course.level}</span>
                  </div>

                  <div className="flex items-center gap-6 mb-4">
                    <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--steel)' }}>
                      <Users size={15} /><span style={{ color: 'var(--cream)' }}>{course.enrolledCount?.toLocaleString()}</span> students
                    </span>
                    <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--steel)' }}>
                      <Star size={15} style={{ color: '#D4A843' }} fill="#D4A843" />
                      <span style={{ color: 'var(--cream)' }}>{course.rating?.toFixed(1)}</span> ({course.reviews?.length || 0} reviews)
                    </span>
                    <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--steel)' }}>
                      <BookOpen size={15} /><span style={{ color: 'var(--cream)' }}>{course.chapters?.length}</span> chapters
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex gap-1.5 flex-wrap">
                    {course.tags?.slice(0, 4).map(t => (
                      <span key={t} className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(172, 186, 196, 0.1)', color: 'var(--steel)' }}>{t}</span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button onClick={() => navigate(`/instructor/students/${course.id}`)} className="btn-outline px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
                    <BarChart2 size={15} /> Progress
                  </button>
                  <button onClick={() => navigate(`/instructor/course/${course.id}`)} className="btn-primary px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
                    <Eye size={15} /> Manage
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}