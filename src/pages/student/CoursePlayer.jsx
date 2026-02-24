import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import StudentSidebar from '../../components/layout/StudentSidebar';
import Assessment from '../../components/shared/Assessment';
import { 
  Play, FileText, CheckCircle, Lock, ChevronRight, Star, Award, Heart,
  X, ArrowLeft, ChevronDown, ChevronUp, BookOpen, Trophy
} from 'lucide-react';

function MarkdownRenderer({ text }) {
  const html = text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^```[\w]*\n([\s\S]*?)```/gm, '<pre><code>$1</code></pre>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[h1-6|ul|li|pre|p])/gm, '');
  return <div className="course-content" dangerouslySetInnerHTML={{ __html: html }} />;
}

function StarRating({ onRate }) {
  const [hover, setHover] = useState(0);
  const [selected, setSelected] = useState(0);
  return (
    <div className="star-rating flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} className={n <= (hover || selected) ? 'active' : ''}
          style={{ color: n <= (hover || selected) ? '#D4A843' : 'var(--steel)' }}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => { setSelected(n); onRate(n); }}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function CoursePlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { db, updateProgress, submitAssessment, completeCourse, rateCourse, enrollCourse, toggleFavorite, getCourseProgress, showNotification } = useApp();

  const course = db.courses.find(c => c.id === courseId);
  const [activeChapter, setActiveChapter] = useState(null);
  const [showAssessment, setShowAssessment] = useState(false);
  const [showGrandTest, setShowGrandTest] = useState(false);
  const [grandTestDone, setGrandTestDone] = useState(false);
  const [grandScore, setGrandScore] = useState(null);
  const [showRating, setShowRating] = useState(false);
  const [review, setReview] = useState('');
  const [ratingGiven, setRatingGiven] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isEnrolled = user?.enrolledCourses?.includes(courseId);
  const isFav = user?.favoriteCourses?.includes(courseId);
  const progress = user?.progress?.[courseId] || {};
  const overallProgress = getCourseProgress(courseId);
  const completed = user?.completedCourses?.find(c => c.courseId === courseId);

  useEffect(() => {
    if (course?.chapters?.length > 0) setActiveChapter(course.chapters[0]);
  }, [courseId]);

  if (!course) return (
    <div className="flex"><StudentSidebar />
      <div className="main-content flex items-center justify-center">
        <p style={{ color: 'var(--steel)' }}>Course not found</p>
      </div>
    </div>
  );

  const chapterProgress = activeChapter ? progress[activeChapter.id] || {} : {};
  const allChaptersComplete = course.chapters?.every(ch => progress[ch.id]?.completed);

  const handleMarkComplete = () => {
    if (!activeChapter) return;
    updateProgress(courseId, activeChapter.id, { completed: true });
    showNotification(`Chapter "${activeChapter.title}" marked complete!`);
  };

  const handleAssessmentComplete = (score) => {
    submitAssessment(courseId, activeChapter.id, {}, activeChapter.assessment.questions);
    setShowAssessment(false);
    updateProgress(courseId, activeChapter.id, { assessmentScore: score, assessmentCompleted: true, completed: true });
  };

  const handleGrandTestComplete = (score) => {
    setGrandScore(score);
    setGrandTestDone(true);
    setShowGrandTest(false);
    if (score >= course.grandAssessment.passingScore) {
      completeCourse(courseId, score);
      setTimeout(() => setShowRating(true), 1500);
    }
  };

  const handleRateSubmit = (r) => {
    rateCourse(courseId, r, review);
    setShowRating(false);
    showNotification('Thank you for your feedback!');
  };

  return (
    <div className="flex">
      <StudentSidebar />
      <div className="main-content flex" style={{ minHeight: '100vh' }}>
        {/* Chapter Sidebar */}
        <div className={`flex-shrink-0 border-r transition-all duration-300 ${sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-72'}`}
          style={{ borderColor: 'rgba(172, 186, 196, 0.1)', background: 'rgba(20, 25, 40, 0.6)' }}>
          <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(172, 186, 196, 0.1)' }}>
            <div>
              <h2 className="font-bold text-sm line-clamp-1" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>{course.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="progress-bar flex-1" style={{ height: '4px' }}>
                  <div className="progress-fill" style={{ width: `${overallProgress}%` }} />
                </div>
                <span className="text-xs" style={{ color: 'var(--steel)' }}>{overallProgress}%</span>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
            <div className="p-3">
              <p className="text-xs font-bold uppercase tracking-widest mb-3 px-2" style={{ color: 'var(--steel)', fontSize: '10px' }}>
                Chapters ({course.chapters?.length})
              </p>
              {course.chapters?.map((ch, idx) => {
                const chProg = progress[ch.id] || {};
                const isActive = activeChapter?.id === ch.id;
                return (
                  <button key={ch.id} onClick={() => { setActiveChapter(ch); setShowAssessment(false); }}
                    className={`w-full text-left p-3 rounded-xl mb-1 transition-all duration-200 ${isActive ? 'active' : ''} sidebar-link`}
                    style={{ background: isActive ? 'rgba(107, 127, 212, 0.2)' : 'transparent', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', paddingRight: '12px' }}>
                    <div className="flex items-center gap-2 w-full">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0`}
                        style={{ background: chProg.completed ? 'rgba(78, 205, 196, 0.3)' : 'rgba(172, 186, 196, 0.1)' }}>
                        {chProg.completed 
                          ? <CheckCircle size={12} style={{ color: '#4ECDC4' }} />
                          : <span className="text-xs font-bold" style={{ color: 'var(--steel)', fontFamily: 'Syne', fontSize: '9px' }}>{idx + 1}</span>}
                      </div>
                      <span className="text-xs font-medium flex-1 leading-tight" style={{ color: isActive ? 'var(--cream)' : 'var(--steel)', fontFamily: 'DM Sans' }}>
                        {ch.title}
                      </span>
                      {ch.type === 'video' ? <Play size={11} style={{ color: 'var(--steel)' }} /> : <FileText size={11} style={{ color: 'var(--steel)' }} />}
                    </div>
                    {chProg.assessmentScore !== undefined && (
                      <span className="text-xs ml-7" style={{ color: '#4ECDC4', fontSize: '10px' }}>Quiz: {chProg.assessmentScore}%</span>
                    )}
                  </button>
                );
              })}

              {/* Grand Test */}
              {allChaptersComplete && (
                <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(212, 168, 67, 0.1)', border: '1px solid rgba(212, 168, 67, 0.3)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy size={14} style={{ color: '#D4A843' }} />
                    <span className="text-xs font-bold" style={{ color: '#D4A843', fontFamily: 'Syne' }}>Grand Test</span>
                  </div>
                  {completed ? (
                    <div>
                      <p className="text-xs" style={{ color: '#4ECDC4' }}>✓ Passed with {completed.score}%</p>
                      <button onClick={() => navigate(`/student/certificate/${courseId}`)} className="btn-sand w-full py-2 px-3 rounded-lg text-xs mt-2">
                        View Certificate
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setShowGrandTest(true)} className="btn-sand w-full py-2 px-3 rounded-lg text-xs">
                      Take Grand Test
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          {/* Top bar */}
          <div className="sticky top-0 z-20 px-6 py-3 border-b flex items-center justify-between" 
            style={{ background: 'rgba(20, 25, 40, 0.9)', backdropFilter: 'blur(10px)', borderColor: 'rgba(172, 186, 196, 0.1)' }}>
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 rounded-lg" style={{ color: 'var(--steel)', background: 'rgba(172, 186, 196, 0.1)' }}>
                <BookOpen size={16} />
              </button>
              <button onClick={() => navigate('/student/explore')} className="flex items-center gap-1 text-sm" style={{ color: 'var(--steel)' }}>
                <ArrowLeft size={16} /> Back
              </button>
              <div className="w-px h-5" style={{ background: 'rgba(172, 186, 196, 0.2)' }} />
              <span className="text-sm font-semibold" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>{activeChapter?.title}</span>
            </div>
            <div className="flex items-center gap-3">
              {!isEnrolled ? (
                <button onClick={() => enrollCourse(courseId)} className="btn-primary px-4 py-2 rounded-xl text-sm">Enroll Free</button>
              ) : (
                <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(78, 205, 196, 0.2)', color: '#4ECDC4' }}>✓ Enrolled</span>
              )}
              <button onClick={() => toggleFavorite(courseId)} className="p-2 rounded-xl" style={{ background: isFav ? 'rgba(231, 76, 111, 0.2)' : 'rgba(172, 186, 196, 0.1)' }}>
                <Heart size={16} style={{ color: isFav ? '#E74C6F' : 'var(--steel)' }} fill={isFav ? '#E74C6F' : 'none'} />
              </button>
            </div>
          </div>

          {/* Content area */}
          <div className="p-8">
            {!activeChapter ? (
              // Course overview
              <div className="max-w-3xl">
                <div className="relative rounded-2xl overflow-hidden mb-8 h-64">
                  <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                    <div>
                      <h1 className="text-3xl font-black text-white mb-2" style={{ fontFamily: 'Syne' }}>{course.title}</h1>
                      <p className="text-white/70">{course.instructorName}</p>
                    </div>
                  </div>
                </div>
                <div className="glass rounded-2xl p-6">
                  <p style={{ color: 'var(--cream)', lineHeight: '1.8' }}>{course.longDescription}</p>
                </div>
              </div>
            ) : showAssessment ? (
              // Assessment
              <div className="max-w-2xl mx-auto">
                <div className="glass rounded-3xl p-8 animate-scaleIn">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>
                      Chapter Assessment
                    </h2>
                    <button onClick={() => setShowAssessment(false)} style={{ color: 'var(--steel)' }}><X size={20} /></button>
                  </div>
                  <Assessment
                    assessment={activeChapter.assessment}
                    onComplete={handleAssessmentComplete}
                    onClose={() => setShowAssessment(false)}
                  />
                </div>
              </div>
            ) : showGrandTest ? (
              // Grand Test
              <div className="max-w-2xl mx-auto">
                <div className="glass rounded-3xl p-8 animate-scaleIn">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Trophy size={24} style={{ color: '#D4A843' }} />
                      <h2 className="text-xl font-bold" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>Grand Assessment</h2>
                    </div>
                    <button onClick={() => setShowGrandTest(false)} style={{ color: 'var(--steel)' }}><X size={20} /></button>
                  </div>
                  <p className="text-sm mb-6" style={{ color: 'var(--steel)' }}>Passing score: {course.grandAssessment.passingScore}%</p>
                  <Assessment
                    assessment={course.grandAssessment}
                    onComplete={handleGrandTestComplete}
                    onClose={() => setShowGrandTest(false)}
                  />
                </div>
              </div>
            ) : grandTestDone && grandScore !== null ? (
              // Grand test result
              <div className="max-w-lg mx-auto text-center py-16 animate-scaleIn">
                <div className="text-7xl mb-6 animate-float">{grandScore >= (course.grandAssessment.passingScore || 70) ? '🏆' : '📚'}</div>
                <h2 className="text-3xl font-black mb-3" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>
                  {grandScore >= (course.grandAssessment.passingScore || 70) ? 'Congratulations!' : 'Almost There!'}
                </h2>
                <p className="text-5xl font-black mb-4" style={{ fontFamily: 'Syne', color: grandScore >= 70 ? '#4ECDC4' : '#E74C6F' }}>
                  {grandScore}%
                </p>
                <p className="mb-8" style={{ color: 'var(--steel)' }}>
                  {grandScore >= 70 ? 'You passed the grand assessment!' : `You need ${course.grandAssessment.passingScore}% to pass. Try again!`}
                </p>
                {grandScore >= 70 && (
                  <div className="flex gap-4 justify-center">
                    <button onClick={() => navigate(`/student/certificate/${courseId}`)} className="btn-sand px-8 py-4 rounded-2xl flex items-center gap-2">
                      <Award size={20} /> Get Certificate
                    </button>
                  </div>
                )}
                {grandScore < 70 && (
                  <button onClick={() => { setGrandTestDone(false); setShowGrandTest(true); }} className="btn-primary px-8 py-4 rounded-2xl">
                    Retake Test
                  </button>
                )}
              </div>
            ) : (
              // Chapter content
              <div className="max-w-4xl">
                {/* Chapter header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`badge ${activeChapter.type === 'video' ? 'badge-aiml' : 'badge-datascience'}`}>
                      {activeChapter.type === 'video' ? <Play size={10} /> : <FileText size={10} />}
                      {activeChapter.type}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--steel)' }}>{activeChapter.duration}</span>
                  </div>
                  <h1 className="text-2xl font-black" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>{activeChapter.title}</h1>
                </div>

                {/* Video */}
                {activeChapter.type === 'video' && activeChapter.content.videoUrl && (
                  <div className="rounded-2xl overflow-hidden mb-6" style={{ aspectRatio: '16/9' }}>
                    <iframe
                      src={activeChapter.content.videoUrl}
                      title={activeChapter.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                {/* Text content */}
                {activeChapter.content.textContent && (
                  <div className="glass rounded-2xl p-8 mb-6">
                    <MarkdownRenderer text={activeChapter.content.textContent} />
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4 flex-wrap">
                  {!chapterProgress.completed && isEnrolled && (
                    <button onClick={handleMarkComplete} className="btn-outline px-6 py-3 rounded-2xl flex items-center gap-2 text-sm">
                      <CheckCircle size={18} /> Mark as Complete
                    </button>
                  )}

                  {activeChapter.assessment && isEnrolled && !chapterProgress.assessmentCompleted && (
                    <button onClick={() => setShowAssessment(true)} className="btn-primary px-6 py-3 rounded-2xl flex items-center gap-2 text-sm">
                      <Star size={18} /> Take Chapter Quiz
                    </button>
                  )}

                  {chapterProgress.assessmentCompleted && (
                    <div className="flex items-center gap-2 px-5 py-3 rounded-2xl" style={{ background: 'rgba(78, 205, 196, 0.1)', border: '1px solid rgba(78, 205, 196, 0.3)' }}>
                      <CheckCircle size={18} style={{ color: '#4ECDC4' }} />
                      <span className="text-sm" style={{ color: '#4ECDC4' }}>Quiz: {chapterProgress.assessmentScore}%</span>
                    </div>
                  )}

                  {/* Next chapter */}
                  {(() => {
                    const currentIdx = course.chapters?.findIndex(c => c.id === activeChapter.id);
                    const nextCh = course.chapters?.[currentIdx + 1];
                    if (nextCh) return (
                      <button onClick={() => setActiveChapter(nextCh)} className="btn-outline px-6 py-3 rounded-2xl flex items-center gap-2 text-sm ml-auto">
                        Next Chapter <ChevronRight size={18} />
                      </button>
                    );
                    if (allChaptersComplete && !completed) return (
                      <button onClick={() => setShowGrandTest(true)} className="btn-sand px-6 py-3 rounded-2xl flex items-center gap-2 text-sm ml-auto">
                        <Trophy size={18} /> Take Grand Test
                      </button>
                    );
                    return null;
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rating modal */}
      {showRating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="glass rounded-3xl p-8 max-w-md w-full animate-scaleIn">
            <h2 className="text-2xl font-black mb-2 text-center" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>Rate This Course</h2>
            <p className="text-center mb-6" style={{ color: 'var(--steel)' }}>How was your learning experience?</p>
            <div className="flex justify-center mb-5">
              <StarRating onRate={r => setRatingGiven(r)} />
            </div>
            <textarea className="input-field resize-none mb-5" rows={3} placeholder="Write your review (optional)..." value={review} onChange={e => setReview(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={() => setShowRating(false)} className="btn-outline flex-1 py-3 rounded-2xl">Skip</button>
              <button onClick={() => handleRateSubmit(ratingGiven)} disabled={!ratingGiven} className="btn-sand flex-1 py-3 rounded-2xl disabled:opacity-40">Submit Review</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}