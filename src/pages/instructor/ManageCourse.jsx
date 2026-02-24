import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import InstructorSidebar from '../../components/layout/InstructorSidebar';
import { Users, Star, BarChart2, BookOpen, ArrowLeft, CheckCircle, Edit3, Save } from 'lucide-react';

export default function ManageCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { db, showNotification } = useApp();
  const [editMode, setEditMode] = useState(false);

  const course = db.courses.find(c => c.id === courseId);

  const enrolledStudents = useMemo(() => {
    return db.students.filter(s => s.enrolledCourses?.includes(courseId));
  }, [db.students, courseId]);

  if (!course || course.instructorId !== user?.id) {
    return (
      <div className="flex"><InstructorSidebar />
        <div className="main-content flex items-center justify-center">
          <p style={{ color: 'var(--steel)' }}>Course not found</p>
        </div>
      </div>
    );
  }

  const getStudentProgress = (student) => {
    const progress = student.progress?.[courseId] || {};
    const totalChapters = course.chapters?.length || 0;
    const completed = Object.values(progress).filter(p => p.completed).length;
    return totalChapters ? Math.round((completed / totalChapters) * 100) : 0;
  };

  const getStudentAvgScore = (student) => {
    const results = db.assessmentResults?.[student.id]?.[courseId] || {};
    const scores = Object.values(results).map(r => r.score);
    return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  };

  return (
    <div className="flex">
      <InstructorSidebar />
      <div className="main-content p-8">
        <button onClick={() => navigate('/instructor/courses')} className="flex items-center gap-2 mb-6 text-sm" style={{ color: 'var(--steel)' }}>
          <ArrowLeft size={16} /> Back to Courses
        </button>

        {/* Course header */}
        <div className="glass rounded-3xl p-8 mb-8 animate-fadeInUp">
          <div className="flex gap-6">
            <img src={course.thumbnail || 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=300&q=80'} alt=""
              className="w-40 h-28 rounded-2xl object-cover flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <span className={`badge badge-${course.category.toLowerCase()} mb-2`}>{course.category} • {course.level}</span>
                  <h1 className="text-2xl font-black mb-2" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>{course.title}</h1>
                  <p style={{ color: 'var(--steel)', fontSize: '14px' }}>{course.description}</p>
                </div>
              </div>
              <div className="flex gap-5 mt-4">
                <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--steel)' }}>
                  <Users size={15} /><b style={{ color: 'var(--cream)' }}>{enrolledStudents.length}</b> enrolled
                </span>
                <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--steel)' }}>
                  <Star size={15} style={{ color: '#D4A843' }} fill="#D4A843" />
                  <b style={{ color: 'var(--cream)' }}>{course.rating?.toFixed(1)}</b>
                </span>
                <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--steel)' }}>
                  <BookOpen size={15} /><b style={{ color: 'var(--cream)' }}>{course.chapters?.length}</b> chapters
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8 animate-fadeInUp delay-100">
          {[
            { label: 'Total Enrolled', value: enrolledStudents.length, color: '#6B7FD4' },
            { label: 'Completed', value: db.students.filter(s => s.completedCourses?.find(c => c.courseId === courseId)).length, color: '#4ECDC4' },
            { label: 'Reviews', value: course.reviews?.length || 0, color: '#D4A843' },
            { label: 'Avg Rating', value: course.rating?.toFixed(1) || '—', color: '#E74C6F' },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass rounded-2xl p-4 text-center">
              <div className="text-2xl font-black mb-1" style={{ fontFamily: 'Syne', color }}>{value}</div>
              <div className="text-xs" style={{ color: 'var(--steel)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Chapter overview */}
        <div className="glass rounded-3xl p-6 mb-8 animate-fadeInUp delay-200">
          <h2 className="text-lg font-bold mb-5" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>Chapter Overview</h2>
          <div className="space-y-3">
            {course.chapters?.map((ch, idx) => {
              const completedByStudents = enrolledStudents.filter(s => s.progress?.[courseId]?.[ch.id]?.completed).length;
              const pct = enrolledStudents.length > 0 ? Math.round((completedByStudents / enrolledStudents.length) * 100) : 0;
              return (
                <div key={ch.id} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: 'rgba(48, 54, 79, 0.3)' }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: 'rgba(107, 127, 212, 0.2)', color: 'var(--accent-light)', fontFamily: 'Syne' }}>{idx + 1}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium" style={{ color: 'var(--cream)' }}>{ch.title}</span>
                      <span className="text-xs" style={{ color: 'var(--steel)' }}>{completedByStudents}/{enrolledStudents.length} students</span>
                    </div>
                    <div className="progress-bar" style={{ height: '4px' }}>
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className="text-sm font-bold w-10 text-right" style={{ color: 'var(--accent-light)', fontFamily: 'Syne' }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enrolled students */}
        <div className="glass rounded-3xl p-6 mb-8 animate-fadeInUp delay-300">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>Enrolled Students</h2>
            <button onClick={() => navigate(`/instructor/students/${courseId}`)} className="btn-outline px-4 py-2 rounded-xl text-sm">
              View Full Progress →
            </button>
          </div>

          {enrolledStudents.length === 0 ? (
            <p style={{ color: 'var(--steel)' }}>No students enrolled yet.</p>
          ) : (
            <div className="space-y-3">
              {enrolledStudents.map(student => {
                const progress = getStudentProgress(student);
                const avgScore = getStudentAvgScore(student);
                const isCompleted = student.completedCourses?.find(c => c.courseId === courseId);
                return (
                  <div key={student.id} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'rgba(48, 54, 79, 0.3)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #6B7FD4, #8FA4E8)', fontFamily: 'Syne', color: 'white' }}>
                      {student.name?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>{student.name}</span>
                        {isCompleted && <CheckCircle size={14} style={{ color: '#4ECDC4' }} />}
                      </div>
                      <span className="text-xs" style={{ color: 'var(--steel)' }}>{student.college} • {student.year}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-bold" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>{progress}%</div>
                        <div className="text-xs" style={{ color: 'var(--steel)' }}>Progress</div>
                      </div>
                      {avgScore !== null && (
                        <div className="text-right">
                          <div className="text-sm font-bold" style={{ fontFamily: 'Syne', color: avgScore >= 70 ? '#4ECDC4' : '#E74C6F' }}>{avgScore}%</div>
                          <div className="text-xs" style={{ color: 'var(--steel)' }}>Avg Score</div>
                        </div>
                      )}
                      <button onClick={() => navigate(`/instructor/chat?student=${student.id}&course=${courseId}`)} className="btn-outline px-3 py-2 rounded-xl text-xs">
                        💬 Chat
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Reviews */}
        {course.reviews?.length > 0 && (
          <div className="glass rounded-3xl p-6 animate-fadeInUp delay-400">
            <h2 className="text-lg font-bold mb-5" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>Student Reviews</h2>
            <div className="grid grid-cols-2 gap-4">
              {course.reviews.map((review, i) => (
                <div key={i} className="p-4 rounded-2xl" style={{ background: 'rgba(48, 54, 79, 0.3)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>{review.studentName}</span>
                    <div className="flex">
                      {[...Array(5)].map((_, s) => (
                        <span key={s} style={{ color: s < review.rating ? '#D4A843' : 'rgba(172, 186, 196, 0.3)', fontSize: '13px' }}>★</span>
                      ))}
                    </div>
                  </div>
                  {review.review && <p className="text-sm" style={{ color: 'rgba(240, 240, 219, 0.8)' }}>{review.review}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}