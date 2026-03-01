import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import InstructorLayout from '../../components/layout/v2/InstructorLayout';
import { ArrowLeft, Users, Trophy, TrendingUp, CheckCircle, Clock } from 'lucide-react';

export default function StudentProgress() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { db } = useApp();

  const course = db.courses.find(c => c.id === courseId && c.instructorId === user?.id);
  const enrolledStudents = useMemo(() => {
    return db.students.filter(s => s.enrolledCourses?.includes(courseId));
  }, [db.students, courseId]);

  // Compute per-student progress
  const studentRows = useMemo(() => {
    return enrolledStudents.map(student => {
      const prog = student.progress?.[courseId] || {};
      const totalChapters = course?.chapters?.length || 1;
      const completedChapters = Object.values(prog).filter(p => p.completed).length;
      const overallPct = Math.round((completedChapters / totalChapters) * 100);
      const isCompleted = student.completedCourses?.some(c => c.courseId === courseId);
      const grandScore = student.completedCourses?.find(c => c.courseId === courseId)?.score;

      // Per-chapter scores
      const chapterScores = course?.chapters?.map(ch => {
        const chProg = prog[ch.id] || {};
        return chProg.assessmentScore !== undefined ? chProg.assessmentScore : null;
      }) || [];

      return { student, overallPct, completedChapters, totalChapters, isCompleted, grandScore, chapterScores };
    });
  }, [enrolledStudents, course, courseId]);

  const completedCount = studentRows.filter(r => r.isCompleted).length;
  const avgProgress = studentRows.length > 0
    ? Math.round(studentRows.reduce((s, r) => s + r.overallPct, 0) / studentRows.length)
    : 0;

  if (!course) return (
    <InstructorLayout>
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <h2 className="text-2xl font-bold font-syne text-text-primary border-b border-border-subtle pb-4 mb-4">Course Not Found</h2>
        <button
          onClick={() => navigate('/instructor/courses')}
          className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-colors"
        >
          Back to Courses
        </button>
      </div>
    </InstructorLayout>
  );

  return (
    <InstructorLayout>
      <div className="max-w-6xl mx-auto pb-12">
        <button
          onClick={() => navigate(`/instructor/course/${courseId}`)}
          className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-6 group w-fit"
        >
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          <span className="font-medium text-sm">Back to Course</span>
        </button>

        <div className="animate-fade-in-up mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-syne text-text-primary">
            Student Progress
          </h1>
          <p className="text-primary-400 mt-2 font-medium">{course.title}</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {[
            { icon: Users, label: 'Enrolled', value: enrolledStudents.length, color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/20' },
            { icon: Trophy, label: 'Completed', value: completedCount, color: 'text-teal-400', bg: 'bg-teal-400/10', border: 'border-teal-400/20' },
            { icon: TrendingUp, label: 'Avg Progress', value: `${avgProgress}%`, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
          ].map((stat, idx) => (
            <div key={idx} className={`bg-bg-surface border border-border-subtle hover:border-border-strong transition-colors rounded-3xl p-6 shadow-xl flex flex-col items-center text-center`}>
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 border ${stat.border}`}>
                <stat.icon size={24} />
              </div>
              <div className="text-3xl font-bold font-syne text-text-primary leading-none mb-2">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-text-muted uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Student Data */}
        {enrolledStudents.length === 0 ? (
          <div className="animate-fade-in-up flex flex-col items-center justify-center py-20 text-center bg-bg-surface border border-border-subtle rounded-3xl" style={{ animationDelay: '0.2s' }}>
            <div className="w-20 h-20 rounded-full bg-bg-elevated flex items-center justify-center mb-6">
              <Users className="w-10 h-10 text-text-muted" />
            </div>
            <h3 className="text-xl font-bold font-syne text-text-primary mb-2">No students enrolled yet</h3>
            <p className="text-text-muted">Students will appear here once they enroll in your course.</p>
          </div>
        ) : (
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-bg-surface border border-border-subtle rounded-3xl overflow-hidden shadow-xl overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-bg-elevated border-b border-border-subtle text-sm font-bold text-text-muted">
                    <th className="py-4 px-6 font-medium">Student</th>
                    <th className="py-4 px-6 font-medium w-48">Overall Progress</th>
                    {course.chapters?.map((ch, i) => (
                      <th key={ch.id} className="py-4 px-4 text-center font-medium whitespace-nowrap">
                        <span className="font-syne text-xs uppercase tracking-wider text-text-muted">Ch {i + 1}</span>
                      </th>
                    ))}
                    <th className="py-4 px-6 text-center font-medium">Grand Test</th>
                    <th className="py-4 px-6 text-center font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {studentRows.map(({ student, overallPct, isCompleted, grandScore, chapterScores }) => (
                    <tr key={student.id} className="hover:bg-bg-elevated transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-syne font-bold shrink-0 shadow-lg shadow-indigo-500/20">
                            {student.name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <div className="font-semibold text-text-primary text-sm">{student.name}</div>
                            <div className="text-xs text-text-muted mt-0.5">{student.college || student.year || 'No Details'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 rounded-full bg-bg-elevated overflow-hidden border border-border-subtle">
                            <div
                              className={`h-full rounded-full ${overallPct === 100 ? 'bg-teal-500' : 'bg-primary-500'}`}
                              style={{ width: `${overallPct}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-primary-400 w-10">{overallPct}%</span>
                        </div>
                      </td>
                      {chapterScores.map((score, i) => (
                        <td key={i} className="py-4 px-4 text-center">
                          {score !== null ? (
                            <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-bold border ${score >= 70 ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                              {score}%
                            </span>
                          ) : (
                            <span className="text-text-muted/50">—</span>
                          )}
                        </td>
                      ))}
                      <td className="py-4 px-6 text-center">
                        {grandScore !== undefined && grandScore !== null ? (
                          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-lg shadow-sm text-xs font-bold border ${grandScore >= 70 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                            {grandScore}%
                          </span>
                        ) : (
                          <span className="text-text-muted/50">—</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-bold uppercase tracking-wider">
                            <CheckCircle size={14} /> Done
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-500/10 text-primary-400 border border-primary-500/20 text-xs font-bold uppercase tracking-wider">
                            <Clock size={14} /> Active
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden space-y-4">
              {studentRows.map(({ student, overallPct, isCompleted, grandScore, chapterScores }) => (
                <div key={student.id} className="bg-bg-surface border border-border-subtle rounded-3xl p-5 shadow-xl">
                  <div className="flex items-start justify-between mb-4 pb-4 border-b border-border-subtle">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-syne font-bold text-lg shadow-lg shadow-indigo-500/20">
                        {student.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <div className="font-semibold text-text-primary">{student.name}</div>
                        <div className="text-xs text-text-muted mt-0.5">{student.college || student.year || 'No Details'}</div>
                      </div>
                    </div>
                    {isCompleted ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[10px] font-bold uppercase tracking-wider">
                        Done
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-primary-500/10 text-primary-400 border border-primary-500/20 text-[10px] font-bold uppercase tracking-wider">
                        Active
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1.5">
                        <span className="text-text-muted">Progress</span>
                        <span className="text-primary-400 font-bold">{overallPct}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-bg-elevated overflow-hidden border border-border-subtle">
                        <div
                          className={`h-full rounded-full ${overallPct === 100 ? 'bg-teal-500' : 'bg-primary-500'}`}
                          style={{ width: `${overallPct}%` }}
                        />
                      </div>
                    </div>

                    {grandScore !== undefined && grandScore !== null && (
                      <div className="p-3 rounded-xl bg-bg-elevated border border-border-subtle flex justify-between items-center">
                        <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Grand Test Score</span>
                        <span className={`font-bold text-sm ${grandScore >= 70 ? 'text-amber-400' : 'text-rose-400'}`}>
                          {grandScore}%
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {chapterScores.map((score, i) => (
                        <div key={i} className="flex flex-col items-center p-2 rounded-xl border border-border-subtle bg-bg-elevated/50">
                          <span className="text-[10px] text-text-muted uppercase tracking-wider mb-1 font-medium">Ch {i + 1}</span>
                          {score !== null ? (
                            <span className={`text-xs font-bold ${score >= 70 ? 'text-teal-400' : 'text-rose-400'}`}>
                              {score}%
                            </span>
                          ) : (
                            <span className="text-xs text-text-muted/50">—</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>
    </InstructorLayout>
  );
}