import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCourseById, getChapters, submitReview as submitCourseReview } from '../../api/courseApi';
import { enrollInCourse as apiEnroll, toggleFavorite as apiToggleFav, getFavoriteCourses, getEnrolledCourses } from '../../api/studentApi';
import { getCourseProgress as apiGetProgress, markChapterComplete as apiMarkChapter, submitChapterAssessment as apiSubmitAssessment, submitGrandAssessment as apiSubmitGrand } from '../../api/progressApi';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Play,
  FileText,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Heart,
  HelpCircle,
  Trophy,
  BookOpen,
  X,
  BookmarkPlus,
  CheckCheck,
  Award,
  Loader2
} from 'lucide-react';
import Assessment from '../../components/shared/Assessment';

function MarkdownRenderer({ text }) {
  if (!text) return null;
  const html = text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/```[\w]*\n([\s\S]*?)```/gm, '<pre><code>$1</code></pre>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>');
  return <div className="course-content" dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function CoursePlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [activeChapter, setActiveChapter] = useState(null);
  const [showAssessment, setShowAssessment] = useState(false);
  const [showGrandTest, setShowGrandTest] = useState(false);
  const [grandTestDone, setGrandTestDone] = useState(false);
  const [grandScore, setGrandScore] = useState(null);
  const [showRating, setShowRating] = useState(false);
  const [review, setReview] = useState('');
  const [ratingGiven, setRatingGiven] = useState(0);
  const [chapterDrawerOpen, setChapterDrawerOpen] = useState(true);

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [progressData, setProgressData] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [courseCompleted, setCourseCompleted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch course structure
            const [courseRes, chaptersRes] = await Promise.all([
                getCourseById(courseId),
                getChapters(courseId).catch(() => ({ data: [] }))
            ]);
            
            const fetchedCourse = { ...courseRes.data, chapters: chaptersRes.data };
            setCourse(fetchedCourse);
            
            if (fetchedCourse.chapters?.length > 0) {
                setActiveChapter(fetchedCourse.chapters[0]);
            }
            
            // Fetch user specific data
            if (user) {
                try {
                    const favs = await getFavoriteCourses();
                    setIsFav((favs.data || []).some(f => f.id === courseId));
                } catch (e) {}

                try {
                    const progRes = await apiGetProgress(courseId);
                    const d = progRes.data || {};
                    setOverallProgress(d.overallProgress || 0);
                    setCourseCompleted(d.isCompleted || false);
                    
                    if (d.grandAssessmentResult && d.grandAssessmentResult.score !== undefined) {
                        setGrandScore(d.grandAssessmentResult.score);
                        setGrandTestDone(true);
                    }
                    
                    const pMap = {};
                    if (Array.isArray(d.chapterProgress)) {
                        d.chapterProgress.forEach(cp => {
                            pMap[cp.chapterId] = {
                                completed: cp.completed,
                                assessmentScore: cp.assessmentScore,
                                assessmentCompleted: cp.assessmentScore !== null && cp.assessmentScore !== undefined,
                                assessmentPassed: cp.assessmentPassed
                            };
                        });
                    }
                    setProgressData(pMap);
                } catch(e) {
                    // No progress exists yet
                }
                
                try {
                    const enrollRes = await getEnrolledCourses();
                    const enrollments = enrollRes.data || [];
                    const isEnr = enrollments.some(e => e.course?.id === courseId);
                    setIsEnrolled(isEnr || user?.profile?.enrolledCourses?.includes(courseId) || user?.enrolledCourses?.includes(courseId));
                } catch(e) {
                    setIsEnrolled(user?.profile?.enrolledCourses?.includes(courseId) || user?.enrolledCourses?.includes(courseId));
                }
            }
            
        } catch(err) {
            console.error("Failed to fetch course player data", err);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [courseId, user]);

  if (loading) {
    return (
        <div className="flex flex-col h-screen w-full bg-bg-base items-center justify-center font-dmsans text-text-primary">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-4" />
            <span className="text-text-secondary">Loading course content...</span>
        </div>
    );
  }

  if (!course) {
    return (
        <div className="flex h-screen w-full bg-bg-base items-center justify-center font-dmsans text-text-primary">
            <span className="text-text-secondary">Course not found</span>
        </div>
    );
  }

  const handleMarkComplete = async () => {
    if (!activeChapter) return;
    try {
        await apiMarkChapter(courseId, activeChapter.id);
        setProgressData(prev => ({ ...prev, [activeChapter.id]: { ...prev[activeChapter.id], completed: true } }));
        alert(`Chapter "${activeChapter.title}" marked complete!`);
        // update overall progress locally roughly
        setOverallProgress(prev => Math.min(100, prev + Math.floor(100 / (course.chapters?.length || 1))));
    } catch(err) {
        console.error("Failed to mark complete", err);
        // Optimistic UI for demo if backend fails
        setProgressData(prev => ({ ...prev, [activeChapter.id]: { ...prev[activeChapter.id], completed: true } }));
        setOverallProgress(prev => Math.min(100, prev + Math.floor(100 / (course.chapters?.length || 1))));
    }
  };

  const handleAssessmentComplete = async (score, answersMap, questionsList) => {
    try {
        const answersArray = questionsList.map((q, i) => answersMap[i] ?? -1);
        await apiSubmitAssessment(courseId, activeChapter.id, { answers: answersArray });
    } catch(err) {
        console.error("Failed API submit assessment", err);
    } finally {
        // Always apply local state for smooth UX
        setProgressData(prev => ({ ...prev, [activeChapter.id]: { ...prev[activeChapter.id], assessmentScore: score, assessmentCompleted: true, completed: true } }));
        setShowAssessment(false);
        setOverallProgress(prev => Math.min(100, prev + Math.floor(100 / (course.chapters?.length || 1))));
    }
  };

  const handleGrandTestComplete = async (score, answersMap, questionsList) => {
    try {
        const answersArray = questionsList.map((q, i) => answersMap[i] ?? -1);
        await apiSubmitGrand(courseId, { answers: answersArray });
    } catch(err) {
        console.error("Failed API grand config", err);
    } finally {
        setGrandScore(score);
        setGrandTestDone(true);
        setShowGrandTest(false);
        if (score >= (course.grandAssessment?.passingScore || 70)) {
            setCourseCompleted(true);
            setTimeout(() => setShowRating(true), 1500);
        }
    }
  };

  const handleRateSubmit = async (r) => {
    try {
        await submitCourseReview(courseId, { rating: r, comment: review });
    } catch(err) {
        console.error("Failed to submit review", err);
    } finally {
        setShowRating(false);
        alert('Thank you for your feedback!');
    }
  };

  const handleEnroll = async () => {
      try {
          await apiEnroll(courseId);
          setIsEnrolled(true);
      } catch(err) {
          console.error("Enrollment failed", err);
          alert("Failed to enroll. Please try again.");
      }
  };

  const handleToggleFav = async () => {
      try {
          await apiToggleFav(courseId);
          setIsFav(!isFav);
      } catch(err) {
          console.error("Fav toggle failed", err);
          setIsFav(!isFav); // Optimistic UI
      }
  };

  const currentIdx = course.chapters?.findIndex(c => c.id === activeChapter?.id);
  const nextChapter = course.chapters?.[currentIdx + 1];
  
  const chapterProgress = activeChapter ? progressData[activeChapter.id] || {} : {};
  const allChaptersComplete = course?.chapters?.length > 0 && course.chapters.every(ch => progressData[ch.id]?.completed);

  // Chapter drawer content
  const ChapterList = (
    <div className="flex flex-col h-full bg-bg-surface">

      {/* Drawer Header */}
      <div className="p-4 border-b border-border-subtle bg-bg-surface backdrop-blur-md sticky top-0 z-10 flex-shrink-0">
        <h2 className="font-syne font-bold text-text-primary text-[0.85rem] mb-2 line-clamp-2 leading-snug">
          {course.title}
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden relative">
            <div
              className="absolute top-0 left-0 h-full bg-primary-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <span className="text-primary-400 text-[0.7rem] font-bold flex-shrink-0">{overallProgress}%</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 hide-scrollbar">
        <h3 className="text-text-secondary text-[0.65rem] font-bold tracking-widest uppercase px-2 pb-2">
          Curriculum ({course.chapters?.length || 0})
        </h3>

        {course.chapters?.map((ch, idx) => {
          const chProg = progressData[ch.id] || {};
          const isActive = activeChapter?.id === ch.id;
          return (
            <button
              key={ch.id}
              onClick={() => { setActiveChapter(ch); setShowAssessment(false); setShowGrandTest(false); setGrandTestDone(false); if (window.innerWidth < 768) setChapterDrawerOpen(false); }}
              className={`w-full text-left rounded-xl mb-1 px-3 py-3 flex flex-col gap-1 transition-all group cursor-pointer ${isActive ? 'bg-primary-500/10 border border-primary-500/20' : 'bg-transparent border border-transparent hover:bg-white/[0.03]'}`}
            >
              <div className="flex items-center gap-3 w-full">
                <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center transition-colors ${chProg.completed ? 'bg-teal-500/20 text-teal-400' : 'bg-bg-elevated border border-border-subtle text-text-secondary group-hover:text-primary-400 group-hover:border-primary-500/50'}`}>
                  {chProg.completed
                    ? <CheckCircle2 size={16} />
                    : <span className="font-syne font-bold text-[0.65rem]">{idx + 1}</span>}
                </div>
                <span className={`text-[0.85rem] flex-1 line-clamp-2 leading-snug ${isActive ? 'text-text-primary font-bold' : 'text-text-secondary font-medium group-hover:text-text-primary transition-colors'}`}>
                  {ch.title}
                </span>
                {ch.type === 'video' || ch.videoUrl
                  ? <Play size={16} className={isActive ? "text-primary-400 flex-shrink-0" : "text-text-tertiary flex-shrink-0"} />
                  : <FileText size={16} className={isActive ? "text-primary-400 flex-shrink-0" : "text-text-tertiary flex-shrink-0"} />}
              </div>
              {chProg.assessmentScore !== undefined && (
                <span className="text-teal-400 text-[0.65rem] ml-10 font-bold block mt-1">
                  Quiz: {chProg.assessmentScore}%
                </span>
              )}
            </button>
          );
        })}

        {/* Grand test */}
        {allChaptersComplete && course.grandAssessment && (
          <div className="mt-4 p-4 rounded-2xl bg-warning/10 border border-warning/20 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-[#D4A843]" />
              <span className="font-syne font-bold text-warning text-[0.85rem]">Grand Test</span>
            </div>
            {courseCompleted || (grandScore >= course.grandAssessment.passingScore) ? (
              <>
                <span className="text-teal-400 text-[0.75rem] font-bold">✓ Passed with {grandScore || '--'}%</span>
                <button
                  onClick={() => navigate(`/student/certificate/${courseId}`)}
                  className="cursor-pointer w-full py-2 px-4 bg-gradient-to-br from-[#D4A843] to-[#E2D9BE] text-[#09090b] font-syne font-bold text-sm rounded-lg hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                >
                  View Certificate
                </button>
              </>
            ) : (
              <button
                onClick={() => { setShowGrandTest(true); setShowAssessment(false); setGrandTestDone(false); if (window.innerWidth < 768) setChapterDrawerOpen(false); }}
                className="cursor-pointer w-full py-2 px-4 bg-gradient-to-br from-[#D4A843] to-[#E2D9BE] text-[#09090b] font-syne font-bold text-sm rounded-lg hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
              >
                Take Grand Test
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-bg-base overflow-hidden font-dmsans text-text-primary">

      {/* Left: Main Content Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 relative">

        {/* Top bar (Theatre Mode header) */}
        <header className="h-[72px] flex-shrink-0 flex items-center justify-between px-4 lg:px-8 bg-bg-base border-b border-border-subtle z-20">
          <div className="flex items-center gap-3 md:gap-4">
            <button
              className="text-text-secondary hover:text-text-primary transition-all flex items-center gap-2 group p-2 rounded-xl border border-transparent hover:border-border-subtle hover:bg-white/5 cursor-pointer active:scale-95"
              onClick={() => navigate(`/student/course/${courseId}`)}
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline font-syne font-bold text-sm">Course Details</span>
            </button>
            <div className="hidden sm:block w-[1px] h-6 bg-border-subtle mx-2" />
            <h1 className="text-text-primary font-syne font-bold text-[0.95rem] md:text-[1.1rem] line-clamp-1 max-w-[200px] sm:max-w-[300px] md:max-w-[400px] tracking-tight">
              {activeChapter?.title || "Course Overview"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {!isEnrolled ? (
              <button
                onClick={handleEnroll}
                className="flex items-center gap-2 px-4 py-1.5 rounded-xl border border-primary-500/50 hover:bg-white/5 text-primary-400 font-bold text-xs transition-all hover:scale-[1.05] active:scale-95 cursor-pointer"
              >
                <BookmarkPlus size={16} />
                Enroll Free
              </button>
            ) : (
              <div className="hidden md:flex items-center">
                <div className="px-3 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 font-bold text-[0.7rem] rounded-full flex items-center gap-1.5">
                  ✓ Enrolled
                </div>
              </div>
            )}

            <button
              onClick={handleToggleFav}
              title={isFav ? "Remove from Favorites" : "Add to Favorites"}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all hover:scale-110 active:scale-95 cursor-pointer border ${isFav ? 'bg-danger/10 border-danger/30 text-danger' : 'bg-transparent border-border-subtle hover:bg-white/5 text-text-secondary hover:text-text-primary'}`}
            >
              {isFav ? <Heart size={18} className="fill-current" /> : <Heart size={18} />}
            </button>

            {/* Mobile Sidebar Toggle */}
            <button
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl transition-all hover:scale-110 active:scale-95 cursor-pointer border border-border-subtle bg-bg-surface text-text-secondary"
              onClick={() => setChapterDrawerOpen(p => !p)}
            >
              <BookOpen size={16} />
            </button>
          </div>
        </header>

        {/* Main scrollable area */}
        <main className="flex-1 overflow-y-auto hide-scrollbar bg-gradient-to-b from-bg-base to-bg-surface">
          <div className="max-w-[1000px] mx-auto w-full p-4 lg:p-8 xl:p-10 pb-24">

            <AnimatePresence mode="wait">
              {showAssessment && activeChapter?.assessment ? (
                <motion.div
                  key="assessment"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="max-w-[640px] mx-auto"
                >
                  <div className="bg-bg-surface/80 backdrop-blur-md border border-border-subtle rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-syne font-bold text-xl text-text-primary">Chapter Assessment</h2>
                      <button
                        onClick={() => setShowAssessment(false)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-text-secondary transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <Assessment assessment={activeChapter.assessment} onComplete={handleAssessmentComplete} onClose={() => setShowAssessment(false)} />
                  </div>
                </motion.div>
              ) : showGrandTest && course.grandAssessment ? (
                <motion.div
                  key="grand-test"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="max-w-[640px] mx-auto"
                >
                  <div className="bg-bg-surface/80 backdrop-blur-md border border-warning/20 rounded-3xl p-6 md:p-8 shadow-2xl shadow-warning/5 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Trophy size={28} className="text-[#D4A843]" />
                        <h2 className="font-syne font-bold text-xl text-text-primary">Grand Assessment</h2>
                      </div>
                      <button
                        onClick={() => setShowGrandTest(false)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-text-secondary transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <p className="text-text-secondary text-sm font-medium mb-8">Passing score: {course.grandAssessment.passingScore || 70}%</p>
                    <Assessment assessment={course.grandAssessment} onComplete={handleGrandTestComplete} onClose={() => setShowGrandTest(false)} />
                  </div>
                </motion.div>
              ) : grandTestDone && grandScore !== null && course.grandAssessment ? (
                <motion.div
                  key="grand-test-result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-[480px] mx-auto text-center py-10"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="text-[6rem] leading-none mb-6 drop-shadow-2xl"
                  >
                    {grandScore >= (course.grandAssessment.passingScore || 70) ? '🏆' : '📚'}
                  </motion.div>
                  <h2 className="font-syne font-bold text-3xl md:text-4xl text-text-primary mb-2">
                    {grandScore >= (course.grandAssessment.passingScore || 70) ? 'Congratulations!' : 'Almost There!'}
                  </h2>
                  <div className={`font-syne font-bold text-[5rem] tracking-tighter ${grandScore >= (course.grandAssessment.passingScore || 70) ? 'text-teal-400 drop-shadow-[0_0_20px_rgba(78,205,196,0.3)]' : 'text-primary-400'}`}>
                    {grandScore}%
                  </div>
                  <p className="text-text-secondary mb-8 text-lg">
                    {grandScore >= (course.grandAssessment.passingScore || 70) ? 'You passed the grand assessment!' : `You need ${course.grandAssessment.passingScore || 70}% to pass. Try again!`}
                  </p>
                  
                  {grandScore >= (course.grandAssessment.passingScore || 70) ? (
                    <button
                      onClick={() => navigate(`/student/certificate/${courseId}`)}
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-warning to-[#E2D9BE] text-[#09090b] shadow-xl shadow-warning/20 font-bold text-[1.1rem] transition-transform hover:scale-105"
                    >
                      <Award size={20} />
                      Get Certificate
                    </button>
                  ) : (
                    <button
                      onClick={() => { setGrandTestDone(false); setShowGrandTest(true); }}
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary-500 hover:bg-primary-600 text-white shadow-xl shadow-primary-500/20 font-bold text-[1.1rem] transition-transform hover:scale-105"
                    >
                      Retake Test
                    </button>
                  )}
                </motion.div>
              ) : activeChapter ? (
                <div className="max-w-[860px] mx-auto">
                  {/* Chapter header */}
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.75rem] font-bold tracking-wide uppercase border ${activeChapter.type === 'video' || activeChapter.videoUrl
                          ? 'bg-primary-500/10 text-primary-400 border-primary-500/20'
                          : 'bg-warning/10 text-warning border-warning/20'
                          }`}
                      >
                        {activeChapter.type === 'video' || activeChapter.videoUrl ? <Play size={16} /> : <FileText size={16} />}
                        {activeChapter.type === 'video' || activeChapter.videoUrl ? 'Video' : 'Reading'}
                      </span>
                      <span className="text-text-secondary text-[0.85rem] font-medium flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-border-strong"></div>
                        {activeChapter.duration || "N/A"}
                      </span>
                    </div>
                    <h2 className="font-syne font-bold text-[1.8rem] md:text-[2.2rem] text-text-primary leading-tight tracking-tight">
                      {activeChapter.title}
                    </h2>
                  </div>

                  {/* Video */}
                  {(activeChapter.type === 'video' || activeChapter.videoUrl || (activeChapter.content?.videoUrl)) && (
                    <div className="w-full rounded-2xl md:rounded-3xl overflow-hidden mb-8 aspect-video bg-black shadow-2xl border border-white/5 relative group">
                      <iframe src={activeChapter.videoUrl || activeChapter.content?.videoUrl || `https://www.youtube.com/embed/dQw4w9WgXcQ`} title={activeChapter.title}
                        className="w-full h-full absolute inset-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen />
                    </div>
                  )}

                  {/* Text content */}
                  {(activeChapter.textContent || activeChapter.content?.textContent) && (
                    <div className="bg-bg-surface/50 border border-border-subtle rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 mb-8 backdrop-blur-sm">
                      <div className="prose prose-invert max-w-none font-dmsans prose-headings:font-syne prose-headings:font-bold prose-h1:text-[1.8rem] prose-h2:text-[1.4rem] prose-h3:text-[1.2rem] prose-p:text-text-secondary prose-p:leading-relaxed prose-a:text-primary-400 hover:prose-a:text-primary-300 prose-strong:text-text-primary prose-code:text-primary-300 prose-code:bg-primary-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none prose-ul:text-text-secondary prose-li:marker:text-primary-500">
                        <MarkdownRenderer text={activeChapter.textContent || activeChapter.content?.textContent} />
                      </div>
                    </div>
                  )}

                  {/* Actions & Navigation Controls */}
                  <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between p-4 rounded-2xl bg-bg-surface border border-border-subtle mt-10">
                    <div className="flex flex-wrap items-center gap-3">
                      {!chapterProgress.completed && isEnrolled && (
                        <button
                          onClick={handleMarkComplete}
                          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-primary-500/50 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 font-bold text-[0.85rem] transition-all cursor-pointer active:scale-95 hover:scale-[1.02] group focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        >
                          <CheckCheck size={18} className="transition-transform group-hover:scale-110" />
                          Mark Complete
                        </button>
                      )}

                      {activeChapter.assessment && isEnrolled && !chapterProgress.assessmentCompleted && (
                        <button
                          onClick={() => setShowAssessment(true)}
                          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-[0.85rem] transition-all cursor-pointer active:scale-95 hover:scale-[1.02] group shadow-lg shadow-primary-500/20 focus:ring-2 focus:ring-primary-400 focus:outline-none"
                        >
                          <HelpCircle size={18} className="transition-transform group-hover:-rotate-6 group-hover:scale-110" />
                          Take Chapter Quiz
                        </button>
                      )}

                      {chapterProgress.assessmentCompleted && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 font-bold text-[0.85rem] cursor-default">
                          <CheckCircle2 size={18} />
                          Quiz Passed ({chapterProgress.assessmentScore || 100}%)
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 sm:ml-auto">
                      {nextChapter && (
                        <button
                          onClick={() => { setActiveChapter(nextChapter); setShowAssessment(false); }}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-bg-base font-bold text-[0.85rem] transition-all cursor-pointer active:scale-95 hover:scale-[1.02] group focus:ring-2 focus:ring-white focus:outline-none"
                        >
                          Next Chapter
                          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                        </button>
                      )}
                      {allChaptersComplete && !courseCompleted && !nextChapter && course.grandAssessment && (
                        <button
                          onClick={() => setShowGrandTest(true)}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-warning to-[#E2D9BE] text-[#09090b] shadow-lg shadow-warning/20 font-bold text-[0.85rem] transition-transform hover:scale-[1.02] cursor-pointer active:scale-95 group focus:ring-2 focus:ring-warning focus:outline-none"
                        >
                          <Trophy size={18} className="transition-transform group-hover:scale-110" />
                          Take Grand Test
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // Course overview (Not Started state)
                <div className="max-w-[800px] mx-auto">
                  <div className="w-full aspect-[21/9] rounded-3xl overflow-hidden relative mb-8 shadow-2xl border border-white/5 group">
                    <img src={course.thumbnail || `https://source.unsplash.com/1200x500/?education,course`} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/60 to-transparent flex flex-col justify-end p-6 md:p-10">
                      <h2 className="font-syne font-bold text-[2rem] md:text-[2.5rem] text-text-primary leading-tight mb-2 tracking-tight">
                        {course.title}
                      </h2>
                      <div className="flex items-center gap-3 text-text-secondary font-medium">
                        <span>Taught by <strong className="text-text-primary">{course.instructorName}</strong></span>
                        <div className="w-1.5 h-1.5 rounded-full bg-border-strong"></div>
                        <span>{course.chapters?.length || 0} Modules</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-bg-surface/50 border border-border-subtle rounded-3xl p-8 md:p-10 backdrop-blur-sm">
                    <h3 className="font-syne font-bold text-lg mb-4 text-text-primary">About this course</h3>
                    <p className="font-dmsans text-text-secondary text-[0.95rem] leading-relaxed">
                      {course.longDescription || course.description}
                    </p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div >

      {/* Right: Curriculum Sidebar */}
      {/* Desktop sidebar */}
      <AnimatePresence initial={false}>
        {chapterDrawerOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 340, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="hidden md:block flex-shrink-0 h-screen border-l border-border-subtle bg-bg-surface z-30 overflow-hidden relative"
          >
            <div className="w-[340px] h-full absolute top-0 left-0 right-0 bottom-0">
              {ChapterList}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {chapterDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setChapterDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-[85%] max-w-[340px] h-screen bg-bg-surface border-l border-border-subtle z-50 md:hidden shadow-2xl overflow-hidden"
            >
              {ChapterList}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Rating Dialog Overlay using Framer Motion */}
      <AnimatePresence>
        {showRating && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRating(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-bg-surface border border-border-subtle rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center"
            >
              <h3 className="font-syne font-bold text-2xl text-text-primary mb-2">Rate This Course</h3>
              <p className="text-text-secondary font-medium mb-6">How was your learning experience?</p>

              <div className="flex justify-center gap-2 mb-6 cursor-pointer">
                {[1, 2, 3, 4, 5].map((starIndex) => (
                  <Star
                    key={starIndex}
                    onClick={() => setRatingGiven(starIndex)}
                    className={`w-12 h-12 transition-all hover:scale-110 ${ratingGiven >= starIndex
                      ? 'fill-[#D4A843] text-[#D4A843]'
                      : 'fill-white/5 text-white/10'
                      }`}
                  />
                ))}
              </div>

              <textarea
                rows={3}
                placeholder="Write your review (optional)..."
                value={review}
                onChange={e => setReview(e.target.value)}
                className="w-full bg-bg-base border border-border-subtle rounded-xl p-4 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 mb-6 resize-none transition-all"
              />

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowRating(false)}
                  className="cursor-pointer flex-1 py-3 rounded-xl border border-border-subtle hover:bg-white/5 text-text-secondary font-bold transition-colors"
                >
                  Skip
                </button>
                <button
                  disabled={!ratingGiven}
                  onClick={() => handleRateSubmit(ratingGiven)}
                  className="cursor-pointer disabled:cursor-not-allowed flex-[2] py-3 rounded-xl bg-gradient-to-r from-warning to-[#E2D9BE] disabled:opacity-50 text-[#09090b] font-bold shadow-lg shadow-warning/10 hover:shadow-warning/20 transition-all font-syne"
                >
                  Submit Review
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div >
  );
}