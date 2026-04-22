import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import {
  getCourseProgress as apiGetProgress,
  markChapterComplete as apiMarkChapter,
  submitChapterAssessment as apiSubmitAssessment,
} from '../../api/progressApi';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Play, FileText, CheckCircle2, CheckCheck,
  HelpCircle, Clock, Calendar, Minus, AlertTriangle,
  ChevronDown, ChevronRight, Loader2, Building2, GitBranch,
  BookOpen, Shield, X, Check, BarChart2, Sparkles
} from 'lucide-react';
import Assessment from '../../components/shared/Assessment';

const fmt = (iso) => iso
  ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  : '-';

const isPast = (iso) => iso && new Date(iso) < new Date();

const daysUntil = (iso) => {
  if (!iso) return null;
  const diff = new Date(iso) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

function MarkdownRenderer({ text }) {
  if (!text) return null;
  const html = text
    .replace(/^### (.+)$/gm, '<h3 style="font-size:1.1rem;font-weight:700;margin:1.2em 0 0.5em;color:var(--text-primary)">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:1.3rem;font-weight:700;margin:1.4em 0 0.6em;color:var(--text-primary)">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:1.6rem;font-weight:800;margin:1.5em 0 0.7em;color:var(--text-primary)">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--text-primary);font-weight:700">$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="background:rgba(99,102,241,0.1);color:var(--primary-300);padding:2px 6px;border-radius:4px;font-size:0.875em">$1</code>')
    .replace(/```[\w]*\n([\s\S]*?)```/gm, '<pre style="background:rgba(0,0,0,0.3);border:1px solid rgba(99,102,241,0.2);border-radius:12px;padding:16px;overflow-x:auto;margin:1em 0"><code style="font-size:0.85em;color:var(--primary-200)">$1</code></pre>')
    .replace(/^- (.+)$/gm, '<li style="color:var(--text-secondary);margin:4px 0;padding-left:4px">$1</li>')
    .replace(/\n\n/g, '</p><p style="color:var(--text-secondary);line-height:1.7;margin:0.8em 0">');

  return (
    <div
      className="leading-relaxed"
      style={{ color: 'var(--text-secondary)' }}
      dangerouslySetInnerHTML={{ __html: `<p style="color:var(--text-secondary);line-height:1.7;margin:0">${html}</p>` }}
    />
  );
}

function DeadlineBadge({ deadline, penaltyPerDay }) {
  if (!deadline) return null;
  const days = daysUntil(deadline);
  const past = days !== null && days < 0;
  const urgent = days !== null && days <= 3 && days >= 0;

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border ${
      past
        ? 'bg-red-500/10 border-red-500/20 text-red-400'
        : urgent
          ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
          : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
    }`}>
      <Calendar className="w-3.5 h-3.5" />
      <span>{past ? `Deadline passed · ${fmt(deadline)}` : `Due ${fmt(deadline)}`}</span>
      {!past && days !== null && <span className="opacity-60">· {days}d left</span>}
      {penaltyPerDay > 0 && (
        <span className="ml-1 flex items-center gap-0.5 opacity-80">
          <Minus className="w-3 h-3" />
          {penaltyPerDay} marks/day
        </span>
      )}
    </div>
  );
}

function ChapterListItem({ chapter, index, isActive, progress, onClick }) {
  const completed = progress?.completed;
  const hasQuiz = !!chapter.assessment;
  const quizPassed = progress?.assessmentPassed;
  const days = daysUntil(chapter.deadline);
  const past = isPast(chapter.deadline);
  const urgent = days !== null && days <= 3 && days >= 0;
  const isVideo = chapter.type === 'VIDEO' || chapter.type === 'video';

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl p-3 flex items-start gap-3 transition-all group mb-1 ${
        isActive
          ? 'bg-primary-500/10 border border-primary-500/25'
          : 'border border-transparent hover:bg-bg-elevated/60 hover:border-border-subtle'
      }`}
    >
      <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold transition-all mt-0.5 ${
        completed
          ? 'bg-emerald-500/20 text-emerald-400'
          : isActive
            ? 'bg-primary-500/20 text-primary-400'
            : 'bg-bg-elevated text-text-muted group-hover:text-text-secondary'
      }`}>
        {completed ? <CheckCircle2 className="w-4 h-4" /> : <span>{index + 1}</span>}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-text-primary leading-snug truncate">{chapter.title}</div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md ${
            isVideo ? 'bg-primary-500/10 text-primary-400' : 'bg-amber-500/10 text-amber-400'
          }`}>
            {isVideo ? 'Video' : 'Text'}
          </span>
          {chapter.duration && (
            <span className="text-[10px] text-text-muted flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" />
              {chapter.duration}
            </span>
          )}
          {hasQuiz && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
              quizPassed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'
            }`}>
              {quizPassed ? 'Quiz Passed' : 'Quiz'}
            </span>
          )}
          {chapter.deadline && (
            <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${
              past ? 'text-red-400' : urgent ? 'text-orange-400' : 'text-indigo-400'
            }`}>
              <Calendar className="w-2.5 h-2.5" />
              {past ? 'Expired' : `${days}d`}
            </span>
          )}
        </div>
        {progress?.assessmentScore != null && (
          <div className="text-[10px] text-emerald-400 font-bold mt-1">Quiz: {progress.assessmentScore}%</div>
        )}
      </div>

      <ChevronRight className={`w-4 h-4 flex-shrink-0 mt-1 transition-all ${
        isActive ? 'text-primary-400' : 'text-text-muted opacity-0 group-hover:opacity-100'
      }`} />
    </button>
  );
}

function ProgressRing({ percent, size = 56, stroke = 4 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(99,102,241,0.12)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#6C7FD8"
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  );
}

const WEIGHT_CATS = [
  { key: 'weightTests', label: 'Tests', color: '#6C7FD8' },
  { key: 'weightAttendance', label: 'Attendance', color: '#4ECDC4' },
  { key: 'weightLiveTests', label: 'Live Tests', color: '#F7B731' },
  { key: 'weightProject', label: 'Project', color: '#FC5C7D' },
];

function WeightagePanel({ course }) {
  return (
    <div className="p-4 bg-bg-surface border border-border-subtle rounded-2xl">
      <div className="flex items-center gap-2 mb-3">
        <BarChart2 className="w-4 h-4 text-amber-400" />
        <span className="text-xs font-bold text-text-primary uppercase tracking-wider">Marks Breakdown</span>
      </div>
      <div className="space-y-2">
        {WEIGHT_CATS.map((cat) => {
          const val = course[cat.key] || 0;
          if (!val) return null;
          return (
            <div key={cat.key}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-text-secondary">{cat.label}</span>
                <span className="text-xs font-bold" style={{ color: cat.color }}>{val}%</span>
              </div>
              <div className="w-full h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${val}%`, background: cat.color, transition: 'width 0.6s ease' }} />
              </div>
            </div>
          );
        })}
      </div>
      {course.penaltyDescription && (
        <div className="mt-3 flex items-start gap-2 text-xs text-red-400/70 bg-red-500/5 px-3 py-2 rounded-xl border border-red-500/10">
          <Shield className="w-3 h-3 shrink-0 mt-0.5" />
          <span>{course.penaltyDescription}</span>
        </div>
      )}
    </div>
  );
}

export default function UniversityCoursePlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  useAuth();

  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeChapter, setActiveChapter] = useState(null);
  const [progressMap, setProgressMap] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [showAssessment, setShowAssessment] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [chapRes, progRes, enrollmentsRes] = await Promise.all([
        api.get(`/courses/${courseId}/chapters`),
        apiGetProgress(courseId).catch(() => ({ data: null })),
        api.get('/uni-courses/student/my-enrollments').catch(() => ({ data: [] })),
      ]);

      const fetchedChapters = chapRes.data || [];
      setChapters(fetchedChapters);
      setActiveChapter((prev) => {
        if (prev) {
          const matching = fetchedChapters.find((chapter) => chapter.id === prev.id);
          if (matching) return matching;
        }
        return fetchedChapters[0] || null;
      });

      const foundCourse = (enrollmentsRes.data || []).find((entry) => entry.courseId === courseId);
      if (foundCourse) {
        setCourse(foundCourse);
      }

      const prog = progRes.data;
      if (prog) {
        setOverallProgress(prog.overallProgress || 0);
        const nextProgressMap = {};
        (prog.chapterProgress || []).forEach((cp) => {
          nextProgressMap[cp.chapterId] = {
            completed: cp.completed,
            assessmentScore: cp.assessmentScore,
            assessmentPassed: cp.assessmentPassed,
          };
        });
        setProgressMap(nextProgressMap);
        setCompletedCount(prog.completedChapters || 0);
      } else {
        setProgressMap({});
        setOverallProgress(0);
        setCompletedCount(0);
      }
    } catch (err) {
      setError('Failed to load course content.');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleMarkComplete = async () => {
    if (!activeChapter || markingComplete) return;
    setMarkingComplete(true);
    try {
      await apiMarkChapter(courseId, activeChapter.id);
      const wasCompleted = !!progressMap[activeChapter.id]?.completed;
      setProgressMap((prev) => ({
        ...prev,
        [activeChapter.id]: { ...prev[activeChapter.id], completed: true },
      }));
      if (!wasCompleted) {
        const newCompleted = completedCount + 1;
        setCompletedCount(newCompleted);
        setOverallProgress(chapters.length > 0 ? Math.round((newCompleted / chapters.length) * 100) : 0);
      }
    } catch (err) {
      const wasCompleted = !!progressMap[activeChapter.id]?.completed;
      setProgressMap((prev) => ({
        ...prev,
        [activeChapter.id]: { ...prev[activeChapter.id], completed: true },
      }));
      if (!wasCompleted) {
        const newCompleted = completedCount + 1;
        setCompletedCount(newCompleted);
        setOverallProgress(chapters.length > 0 ? Math.round((newCompleted / chapters.length) * 100) : 0);
      }
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleAssessmentComplete = async (score, answersMap, questionsList) => {
    try {
      const answersArray = questionsList.map((_, index) => answersMap[index] ?? -1);
      const res = await apiSubmitAssessment(courseId, activeChapter.id, { answers: answersArray });
      const result = res.data;
      const previousCompleted = !!progressMap[activeChapter.id]?.completed;

      setSubmitResult({
        score: result.score,
        passed: result.passed,
        passingScore: result.passingScore,
      });

      setProgressMap((prev) => ({
        ...prev,
        [activeChapter.id]: {
          ...prev[activeChapter.id],
          assessmentScore: result.score,
          assessmentPassed: result.passed,
          completed: result.passed ? true : prev[activeChapter.id]?.completed,
        },
      }));

      if (result.passed && !previousCompleted) {
        const newCompleted = completedCount + 1;
        setCompletedCount(newCompleted);
        setOverallProgress(chapters.length > 0 ? Math.round((newCompleted / chapters.length) * 100) : 0);
      }
    } catch (err) {
      setSubmitResult({ score, passed: false, passingScore: 70 });
    } finally {
      setShowAssessment(false);
    }
  };

  const currentIdx = chapters.findIndex((chapter) => chapter.id === activeChapter?.id);
  const nextChapter = chapters[currentIdx + 1];
  const prevChapter = chapters[currentIdx - 1];
  const chapterProg = activeChapter ? progressMap[activeChapter.id] || {} : {};
  const alreadyCompleted = chapterProg.completed;
  const quizAlreadyPassed = chapterProg.assessmentPassed;
  const isVideo = activeChapter?.type === 'VIDEO' || activeChapter?.type === 'video';

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-bg-base">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
          <span className="text-text-secondary text-sm">Loading course...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-bg-base">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-text-secondary">{error}</p>
          <button onClick={() => navigate('/student/university')} className="mt-4 text-primary-400 text-sm hover:underline">
            Back to University Space
          </button>
        </div>
      </div>
    );
  }

  const sidebar = (
    <div className="flex flex-col h-full bg-bg-surface border-r border-border-subtle">
      <div className="p-4 border-b border-border-subtle flex-shrink-0">
        <button
          onClick={() => navigate('/student/university')}
          className="flex items-center gap-2 text-text-muted hover:text-text-primary text-xs font-semibold mb-3 transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          University Space
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-sm font-bold text-text-primary leading-snug line-clamp-2">{course?.courseTitle || 'University Course'}</h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <ProgressRing percent={overallProgress} size={44} stroke={3} />
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-primary-400">{overallProgress}%</span>
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold text-text-primary mb-1">{completedCount}/{chapters.length} chapters</div>
            <div className="w-full h-1.5 bg-bg-elevated rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary-600 to-accent-500 rounded-full transition-all duration-500" style={{ width: `${overallProgress}%` }} />
            </div>
          </div>
        </div>

        {course && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {course.targetBranch && (
              <span className="text-[10px] text-text-muted flex items-center gap-0.5">
                <GitBranch className="w-2.5 h-2.5" />
                {course.targetBranch}
              </span>
            )}
            {course.targetYear && <span className="text-[10px] text-text-muted">{course.targetYear}</span>}
            {course.finalDeadline && (
              <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${isPast(course.finalDeadline) ? 'text-red-400' : 'text-indigo-400'}`}>
                <Calendar className="w-2.5 h-2.5" />
                Course due {fmt(course.finalDeadline)}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-2 pb-2 pt-1">
          Curriculum ({chapters.length})
        </div>
        {chapters.map((chapter, index) => (
          <ChapterListItem
            key={chapter.id}
            chapter={chapter}
            index={index}
            isActive={activeChapter?.id === chapter.id}
            progress={progressMap[chapter.id]}
            onClick={() => {
              setActiveChapter(chapter);
              setShowAssessment(false);
              setSubmitResult(null);
            }}
          />
        ))}
      </div>

      {course && (
        <div className="p-3 border-t border-border-subtle flex-shrink-0">
          <WeightagePanel course={course} />
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg-base text-text-primary">
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="hidden md:block h-screen flex-shrink-0 overflow-hidden"
            style={{ minWidth: sidebarOpen ? 320 : 0 }}
          >
            <div className="w-[320px] h-full absolute">{sidebar}</div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-border-subtle bg-bg-surface/80 backdrop-blur-md px-4 lg:px-6 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((value) => !value)}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-border-subtle text-text-muted hover:text-text-primary hover:border-border-strong transition-all"
            >
              <BookOpen className="w-4 h-4" />
            </button>

            <div className="hidden sm:block w-px h-5 bg-border-subtle" />

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary-500/20 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-primary-400" />
              </div>
              <span className="text-sm font-bold text-text-primary line-clamp-1 max-w-[200px] sm:max-w-xs">
                {activeChapter?.title || 'Select a chapter'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
              <span className="text-xs font-bold text-primary-400">{completedCount}/{chapters.length} done</span>
            </div>

            <button
              onClick={() => setSidebarOpen((value) => !value)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-border-subtle text-text-muted hover:text-text-primary transition-all"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto w-full p-4 md:p-8 pb-24">
            <AnimatePresence mode="wait">
              {submitResult && (
                <motion.div
                  key="quiz-result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                  onClick={() => setSubmitResult(null)}
                >
                  <motion.div
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    className="bg-bg-elevated border border-border-default rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className={`text-6xl mb-4 ${submitResult.passed ? '' : 'grayscale'}`}>
                      {submitResult.passed ? 'PASS' : 'TRY'}
                    </div>
                    <h3 className="text-xl font-bold font-syne text-text-primary mb-1">
                      {submitResult.passed ? 'Chapter Cleared!' : 'Keep Studying'}
                    </h3>
                    <div className={`text-5xl font-bold font-syne my-4 ${submitResult.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {submitResult.score}%
                    </div>
                    <p className="text-text-muted text-sm mb-6">
                      {submitResult.passed
                        ? `Passed! Required ${submitResult.passingScore}%`
                        : `Need ${submitResult.passingScore}% to pass`}
                    </p>
                    <div className="flex gap-2">
                      {!submitResult.passed && (
                        <button
                          onClick={() => {
                            setSubmitResult(null);
                            setShowAssessment(true);
                          }}
                          className="flex-1 py-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-sm font-bold hover:bg-amber-500/20 transition-all"
                        >
                          Retry Quiz
                        </button>
                      )}
                      <button
                        onClick={() => setSubmitResult(null)}
                        className="flex-1 py-2.5 bg-primary-500/10 border border-primary-500/20 text-primary-400 rounded-xl text-sm font-bold hover:bg-primary-500/20 transition-all"
                      >
                        {submitResult.passed ? 'Continue' : 'Review Chapter'}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {showAssessment && activeChapter?.assessment ? (
                <motion.div
                  key="assessment"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="max-w-2xl mx-auto"
                >
                  <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 md:p-8 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                          <HelpCircle className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                          <h2 className="text-base font-bold font-syne text-text-primary">Chapter Quiz</h2>
                          <p className="text-xs text-text-muted">{activeChapter.title}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowAssessment(false)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-bg-elevated hover:text-text-primary transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <Assessment
                      assessment={activeChapter.assessment}
                      onComplete={handleAssessmentComplete}
                      onClose={() => setShowAssessment(false)}
                    />
                  </div>
                </motion.div>
              ) : activeChapter ? (
                <motion.div
                  key={activeChapter.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                        isVideo
                          ? 'bg-primary-500/10 border-primary-500/20 text-primary-400'
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                      }`}>
                        {isVideo ? <Play className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                        {isVideo ? 'Video' : 'Reading'}
                      </span>
                      {activeChapter.duration && (
                        <span className="text-xs text-text-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activeChapter.duration}
                        </span>
                      )}
                      {alreadyCompleted && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          Completed
                        </span>
                      )}
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold font-syne text-text-primary leading-tight">
                      {activeChapter.title}
                    </h1>

                    {activeChapter.deadline && (
                      <div className="mt-3">
                        <DeadlineBadge deadline={activeChapter.deadline} penaltyPerDay={activeChapter.penaltyPerDay} />
                      </div>
                    )}
                  </div>

                  {isVideo && activeChapter.videoUrl && (
                    <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-2xl border border-border-subtle bg-black shadow-xl">
                      <iframe
                        src={activeChapter.videoUrl}
                        title={activeChapter.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}

                  {(activeChapter.textContent || activeChapter.content?.textContent) && (
                    <div className="mb-6 bg-bg-surface border border-border-subtle rounded-2xl p-6 md:p-8">
                      <MarkdownRenderer text={activeChapter.textContent || activeChapter.content?.textContent} />
                    </div>
                  )}

                  {activeChapter.description && (
                    <div className="mb-6 p-4 bg-indigo-500/5 border border-indigo-500/15 rounded-xl">
                      <p className="text-sm text-text-secondary leading-relaxed">{activeChapter.description}</p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 bg-bg-surface border border-border-subtle rounded-2xl">
                    {!alreadyCompleted && (
                      <button
                        onClick={handleMarkComplete}
                        disabled={markingComplete}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-bold hover:bg-emerald-500/20 transition-all disabled:opacity-50 active:scale-95"
                      >
                        {markingComplete ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Marking...
                          </>
                        ) : (
                          <>
                            <CheckCheck className="w-4 h-4" />
                            Mark Complete
                          </>
                        )}
                      </button>
                    )}

                    {activeChapter.assessment && !quizAlreadyPassed && (
                      <button
                        onClick={() => setShowAssessment(true)}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-sm font-bold hover:bg-amber-500/20 transition-all active:scale-95"
                      >
                        <HelpCircle className="w-4 h-4" />
                        Take Quiz
                      </button>
                    )}

                    {quizAlreadyPassed && (
                      <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-bold">
                        <Check className="w-4 h-4" />
                        Quiz Passed ({chapterProg.assessmentScore}%)
                      </div>
                    )}

                    <div className="flex items-center gap-2 sm:ml-auto">
                      {prevChapter && (
                        <button
                          onClick={() => {
                            setActiveChapter(prevChapter);
                            setShowAssessment(false);
                            setSubmitResult(null);
                          }}
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-bg-elevated border border-border-subtle text-text-secondary rounded-xl text-sm font-semibold hover:border-border-strong hover:text-text-primary transition-all"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          Prev
                        </button>
                      )}
                      {nextChapter && (
                        <button
                          onClick={() => {
                            setActiveChapter(nextChapter);
                            setShowAssessment(false);
                            setSubmitResult(null);
                          }}
                          className="flex items-center gap-1.5 px-5 py-2.5 bg-primary-500/10 border border-primary-500/20 text-primary-400 rounded-xl text-sm font-bold hover:bg-primary-500/20 transition-all active:scale-95"
                        >
                          Next
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <BookOpen className="w-16 h-16 text-text-muted mb-4 opacity-30" />
                  <p className="text-text-secondary font-medium">Select a chapter to get started</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 z-50 h-screen w-[85%] max-w-[320px] shadow-2xl md:hidden"
            >
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
