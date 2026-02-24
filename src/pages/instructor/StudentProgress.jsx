import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import InstructorSidebar from '../../components/layout/InstructorSidebar';
import { ArrowLeft, CheckCircle, XCircle, MessageSquare } from 'lucide-react';

export default function StudentProgress() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { db } = useApp();
  const [selectedStudent, setSelectedStudent] = useState(null);

  const course = db.courses.find(c => c.id === courseId);
  const students = useMemo(() => db.students.filter(s => s.enrolledCourses?.includes(courseId)), [db.students, courseId]);

  if (!course) return null;

  const getChapterScore = (student, chapterId) => {
    return db.assessmentResults?.[student.id]?.[courseId]?.[chapterId]?.score ?? null;
  };

  const getProgress = (student) => {
    const prog = student.progress?.[courseId] || {};
    const done = Object.values(prog).filter(p => p.completed).length;
    return course.chapters?.length ? Math.round((done / course.chapters.length) * 100) : 0;
  };

  return (
    <div className="flex">
      <InstructorSidebar />
      <div className="main-content p-8">
        <button onClick={() => navigate(`/instructor/course/${courseId}`)} className="flex items-center gap-2 mb-6 text-sm" style={{ color: 'var(--steel)' }}>
          <ArrowLeft size={16} /> Back to Course
        </button>

        <div className="mb-8 animate-fadeInUp">
          <h1 className="text-3xl font-black mb-1" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>Student Progress</h1>
          <p style={{ color: 'var(--steel)' }}>{course.title} • {students.length} students enrolled</p>
        </div>

        {students.length === 0 ? (
          <div className="glass rounded-3xl p-16 text-center">
            <div className="text-5xl mb-4 animate-float">👥</div>
            <h2 className="text-xl font-bold mb-3" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>No students yet</h2>
            <p style={{ color: 'var(--steel)' }}>Students will appear here once they enroll</p>
          </div>
        ) : (
          <div className="glass rounded-3xl overflow-hidden animate-fadeInUp delay-100">
            {/* Table header */}
            <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(172, 186, 196, 0.1)', background: 'rgba(20, 25, 40, 0.4)' }}>
              <div className="grid gap-4 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--steel)', fontFamily: 'Syne',
                gridTemplateColumns: `200px repeat(${course.chapters?.length}, 1fr) 80px 80px 100px` }}>
                <span>Student</span>
                {course.chapters?.map((ch, i) => <span key={ch.id} className="text-center">Ch. {i + 1}</span>)}
                <span className="text-center">Progress</span>
                <span className="text-center">Status</span>
                <span className="text-center">Action</span>
              </div>
            </div>

            {/* Students */}
            {students.map(student => {
              const progress = getProgress(student);
              const isCompleted = student.completedCourses?.find(c => c.courseId === courseId);
              return (
                <div key={student.id} className="px-6 py-4 border-b hover:bg-white/5 transition-all"
                  style={{ borderColor: 'rgba(172, 186, 196, 0.05)' }}>
                  <div className="grid gap-4 items-center" style={{
                    gridTemplateColumns: `200px repeat(${course.chapters?.length}, 1fr) 80px 80px 100px`
                  }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #6B7FD4, #8FA4E8)', fontFamily: 'Syne', color: 'white' }}>
                        {student.name?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>{student.name}</div>
                        <div className="text-xs truncate" style={{ color: 'var(--steel)' }}>{student.year}</div>
                      </div>
                    </div>

                    {course.chapters?.map(ch => {
                      const score = getChapterScore(student, ch.id);
                      const chProg = student.progress?.[courseId]?.[ch.id];
                      return (
                        <div key={ch.id} className="text-center">
                          {score !== null ? (
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg`} style={{
                              background: score >= 70 ? 'rgba(78, 205, 196, 0.15)' : 'rgba(231, 76, 111, 0.15)',
                              color: score >= 70 ? '#4ECDC4' : '#E74C6F',
                              fontFamily: 'Syne'
                            }}>{score}%</span>
                          ) : chProg?.completed ? (
                            <CheckCircle size={16} className="mx-auto" style={{ color: '#4ECDC4' }} />
                          ) : (
                            <span className="text-xs" style={{ color: 'rgba(172, 186, 196, 0.3)' }}>—</span>
                          )}
                        </div>
                      );
                    })}

                    <div className="text-center">
                      <span className="text-sm font-bold" style={{ fontFamily: 'Syne', color: progress >= 70 ? '#4ECDC4' : 'var(--cream)' }}>
                        {progress}%
                      </span>
                    </div>

                    <div className="text-center">
                      {isCompleted ? (
                        <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(78, 205, 196, 0.15)', color: '#4ECDC4' }}>Done</span>
                      ) : progress > 0 ? (
                        <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(107, 127, 212, 0.15)', color: 'var(--accent-light)' }}>Active</span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(172, 186, 196, 0.1)', color: 'var(--steel)' }}>New</span>
                      )}
                    </div>

                    <div className="text-center">
                      <button onClick={() => navigate(`/instructor/chat?student=${student.id}&course=${courseId}`)}
                        className="btn-outline px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 mx-auto">
                        <MessageSquare size={12} /> Chat
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}