import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import StudentSidebar from '../../components/layout/StudentSidebar';
import Assessment from '../../components/shared/Assessment';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Rating from '@mui/material/Rating';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import BookmarkAddRoundedIcon from '@mui/icons-material/BookmarkAddRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import { ACCENT, ACCENT2, TEAL, STEEL, CREAM, SAND, GOLD, DANGER, NAVY, NAVY2 } from '../../theme';

const SIDEBAR_W = 248;
const CHAPTER_DRAWER_W = 280;

function MarkdownRenderer({ text }) {
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
  const [chapterDrawerOpen, setChapterDrawerOpen] = useState(true);

  const isEnrolled = user?.enrolledCourses?.includes(courseId);
  const isFav = user?.favoriteCourses?.includes(courseId);
  const progress = user?.progress?.[courseId] || {};
  const overallProgress = getCourseProgress(courseId);
  const completed = user?.completedCourses?.find(c => c.courseId === courseId);
  const chapterProgress = activeChapter ? progress[activeChapter.id] || {} : {};
  const allChaptersComplete = course?.chapters?.every(ch => progress[ch.id]?.completed);

  useEffect(() => {
    if (course?.chapters?.length > 0) setActiveChapter(course.chapters[0]);
  }, [courseId]);

  if (!course) return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0D1117' }}>
      <StudentSidebar />
      <Box sx={{ ml: { md: `${SIDEBAR_W}px` }, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ color: STEEL }}>Course not found</Typography>
      </Box>
    </Box>
  );

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

  const currentIdx = course.chapters?.findIndex(c => c.id === activeChapter?.id);
  const nextChapter = course.chapters?.[currentIdx + 1];

  // Chapter drawer content
  const ChapterList = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'rgba(8,12,20,0.95)' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(139,155,180,0.1)' }}>
        <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 700, color: CREAM, fontSize: '0.88rem', mb: 1, lineHeight: 1.3,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {course.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinearProgress variant="determinate" value={overallProgress} sx={{ flex: 1, height: 5, borderRadius: 2 }} />
          <Typography sx={{ color: ACCENT2, fontSize: '0.72rem', fontWeight: 600, flexShrink: 0 }}>{overallProgress}%</Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', p: 1,
        '&::-webkit-scrollbar': { width: 3 }, '&::-webkit-scrollbar-thumb': { background: 'rgba(139,155,180,0.15)', borderRadius: 2 } }}>
        <Typography sx={{ color: STEEL, fontSize: '0.6rem', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', px: 1.5, py: 1 }}>
          Chapters ({course.chapters?.length})
        </Typography>

        {course.chapters?.map((ch, idx) => {
          const chProg = progress[ch.id] || {};
          const isActive = activeChapter?.id === ch.id;
          return (
            <ListItemButton key={ch.id}
              selected={isActive}
              onClick={() => { setActiveChapter(ch); setShowAssessment(false); setShowGrandTest(false); setGrandTestDone(false); }}
              sx={{ borderRadius: 2.5, mb: 0.5, px: 1.5, py: 1.2, flexDirection: 'column', alignItems: 'flex-start', gap: 0.5,
                '&.Mui-selected': { background: 'rgba(108,127,216,0.18)', border: '1px solid rgba(108,127,216,0.25)' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <Box sx={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: chProg.completed ? 'rgba(78,205,196,0.25)' : 'rgba(139,155,180,0.1)' }}>
                  {chProg.completed
                    ? <CheckCircleRoundedIcon sx={{ fontSize: 13, color: TEAL }} />
                    : <Typography sx={{ color: STEEL, fontSize: '0.6rem', fontWeight: 700, fontFamily: '"Syne",sans-serif' }}>{idx + 1}</Typography>}
                </Box>
                <Typography sx={{ color: isActive ? CREAM : STEEL, fontSize: '0.78rem', fontWeight: isActive ? 600 : 400, flex: 1, lineHeight: 1.35,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {ch.title}
                </Typography>
                {ch.type === 'video'
                  ? <PlayArrowRoundedIcon sx={{ fontSize: 13, color: STEEL, flexShrink: 0 }} />
                  : <ArticleRoundedIcon sx={{ fontSize: 13, color: STEEL, flexShrink: 0 }} />}
              </Box>
              {chProg.assessmentScore !== undefined && (
                <Typography sx={{ color: TEAL, fontSize: '0.68rem', ml: 3.5, fontWeight: 600 }}>
                  Quiz: {chProg.assessmentScore}%
                </Typography>
              )}
            </ListItemButton>
          );
        })}

        {/* Grand test */}
        {allChaptersComplete && (
          <Box sx={{ m: 1, p: 2, borderRadius: 2.5, background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.25)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2 }}>
              <EmojiEventsRoundedIcon sx={{ color: GOLD, fontSize: 16 }} />
              <Typography sx={{ color: GOLD, fontFamily: '"Syne",sans-serif', fontWeight: 700, fontSize: '0.8rem' }}>Grand Test</Typography>
            </Box>
            {completed ? (
              <>
                <Typography sx={{ color: TEAL, fontSize: '0.75rem', mb: 1 }}>✓ Passed with {completed.score}%</Typography>
                <Button variant="contained" fullWidth size="small" onClick={() => navigate(`/student/certificate/${courseId}`)}
                  sx={{ background: `linear-gradient(135deg, ${GOLD} 0%, ${SAND} 100%)`, color: NAVY, fontSize: '0.75rem', py: 0.8 }}>
                  View Certificate
                </Button>
              </>
            ) : (
              <Button variant="contained" fullWidth size="small"
                onClick={() => { setShowGrandTest(true); setShowAssessment(false); setGrandTestDone(false); }}
                sx={{ background: `linear-gradient(135deg, ${GOLD} 0%, ${SAND} 100%)`, color: NAVY, fontSize: '0.75rem', py: 0.8 }}>
                Take Grand Test
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0D1117' }}>
      <StudentSidebar />
      <Box sx={{ ml: { md: `${SIDEBAR_W}px` }, flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', pt: { xs: '56px', md: 0 } }}>
        {/* Top bar */}
        <Box sx={{
          px: { xs: 1.5, md: 2.5 }, py: 1.5, borderBottom: '1px solid rgba(139,155,180,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1,
          background: 'rgba(8,12,20,0.9)', backdropFilter: 'blur(12px)', zIndex: 10, flexShrink: 0,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Toggle chapters">
              <IconButton size="small" onClick={() => setChapterDrawerOpen(p => !p)}
                sx={{ color: chapterDrawerOpen ? ACCENT2 : STEEL, background: 'rgba(139,155,180,0.08)', borderRadius: 1.5 }}>
                <MenuBookRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Button size="small" startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate('/student/explore')}
              sx={{ color: STEEL, fontSize: '0.78rem', display: { xs: 'none', sm: 'flex' } }}>
              Back
            </Button>
            <Box sx={{ width: 1, height: 18, background: 'rgba(139,155,180,0.15)', display: { xs: 'none', sm: 'block' } }} />
            <Typography sx={{ color: CREAM, fontSize: '0.83rem', fontWeight: 600, fontFamily: '"Syne",sans-serif',
              display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: { xs: 160, md: 320 } }}>
              {activeChapter?.title}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!isEnrolled ? (
              <Button variant="contained" color="primary" size="small" startIcon={<BookmarkAddRoundedIcon />}
                onClick={() => enrollCourse(courseId)} sx={{ fontSize: '0.78rem' }}>
                Enroll Free
              </Button>
            ) : (
              <Chip label="✓ Enrolled" size="small"
                sx={{ background: 'rgba(78,205,196,0.15)', color: TEAL, border: '1px solid rgba(78,205,196,0.3)', fontSize: '0.7rem' }} />
            )}
            <IconButton size="small" onClick={() => toggleFavorite(courseId)}
              sx={{ background: isFav ? 'rgba(231,76,111,0.15)' : 'rgba(139,155,180,0.08)', borderRadius: 1.5, border: `1px solid ${isFav ? 'rgba(231,76,111,0.3)' : 'rgba(139,155,180,0.12)'}` }}>
              {isFav ? <FavoriteRoundedIcon sx={{ color: DANGER, fontSize: 17 }} /> : <FavoriteBorderRoundedIcon sx={{ color: STEEL, fontSize: 17 }} />}
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Chapter sidebar - desktop */}
          <Box sx={{
            width: chapterDrawerOpen ? CHAPTER_DRAWER_W : 0, flexShrink: 0,
            borderRight: '1px solid rgba(139,155,180,0.1)', overflow: 'hidden',
            transition: 'width 0.3s cubic-bezier(.22,.68,0,1.2)',
            display: { xs: 'none', md: 'block' },
          }}>
            {ChapterList}
          </Box>

          {/* Mobile chapter drawer */}
          <Drawer variant="temporary" open={chapterDrawerOpen} onClose={() => setChapterDrawerOpen(false)}
            sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: CHAPTER_DRAWER_W, background: 'rgba(8,12,20,0.98)', top: 'auto', height: 'calc(100% - 100px)' } }}>
            {ChapterList}
          </Drawer>

          {/* Main content */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 4 },
            '&::-webkit-scrollbar': { width: 5 }, '&::-webkit-scrollbar-thumb': { background: 'rgba(139,155,180,0.12)', borderRadius: 2 } }}>

            {showAssessment && activeChapter?.assessment ? (
              <Box sx={{ maxWidth: 640, mx: 'auto' }}>
                <Box sx={{ background: 'rgba(22,27,39,0.85)', border: '1px solid rgba(139,155,180,0.12)', borderRadius: 4, p: { xs: 2.5, md: 4 } }} className="anim-scaleIn">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: CREAM }}>Chapter Assessment</Typography>
                    <IconButton onClick={() => setShowAssessment(false)} size="small" sx={{ color: STEEL }}><CloseRoundedIcon /></IconButton>
                  </Box>
                  <Assessment assessment={activeChapter.assessment} onComplete={handleAssessmentComplete} onClose={() => setShowAssessment(false)} />
                </Box>
              </Box>
            ) : showGrandTest ? (
              <Box sx={{ maxWidth: 640, mx: 'auto' }}>
                <Box sx={{ background: 'rgba(22,27,39,0.85)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 4, p: { xs: 2.5, md: 4 } }} className="anim-scaleIn">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <EmojiEventsRoundedIcon sx={{ color: GOLD, fontSize: 24 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: CREAM }}>Grand Assessment</Typography>
                    </Box>
                    <IconButton onClick={() => setShowGrandTest(false)} size="small" sx={{ color: STEEL }}><CloseRoundedIcon /></IconButton>
                  </Box>
                  <Typography sx={{ color: STEEL, fontSize: '0.83rem', mb: 3 }}>Passing score: {course.grandAssessment.passingScore}%</Typography>
                  <Assessment assessment={course.grandAssessment} onComplete={handleGrandTestComplete} onClose={() => setShowGrandTest(false)} />
                </Box>
              </Box>
            ) : grandTestDone && grandScore !== null ? (
              <Box sx={{ maxWidth: 480, mx: 'auto', textAlign: 'center', py: 6 }} className="anim-scaleIn">
                <Typography className="anim-float" sx={{ fontSize: '5rem', mb: 3 }}>
                  {grandScore >= (course.grandAssessment.passingScore || 70) ? '🏆' : '📚'}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: CREAM, mb: 1.5 }}>
                  {grandScore >= (course.grandAssessment.passingScore || 70) ? 'Congratulations!' : 'Almost There!'}
                </Typography>
                <Typography className="gradient-text-teal" sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '3.5rem', mb: 2 }}>
                  {grandScore}%
                </Typography>
                <Typography sx={{ color: STEEL, mb: 4, fontSize: '0.95rem' }}>
                  {grandScore >= 70 ? 'You passed the grand assessment!' : `You need ${course.grandAssessment.passingScore}% to pass. Try again!`}
                </Typography>
                {grandScore >= 70 ? (
                  <Button variant="contained" size="large" startIcon={<WorkspacePremiumRoundedIcon />}
                    onClick={() => navigate(`/student/certificate/${courseId}`)}
                    sx={{ px: 4, py: 1.5, background: `linear-gradient(135deg, ${GOLD} 0%, ${SAND} 100%)`, color: NAVY, fontWeight: 700 }}>
                    Get Certificate
                  </Button>
                ) : (
                  <Button variant="contained" color="primary" size="large"
                    onClick={() => { setGrandTestDone(false); setShowGrandTest(true); }} sx={{ px: 4, py: 1.5 }}>
                    Retake Test
                  </Button>
                )}
              </Box>
            ) : activeChapter ? (
              <Box sx={{ maxWidth: 860 }}>
                {/* Chapter header */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Chip label={activeChapter.type === 'video' ? 'Video' : 'Reading'} size="small"
                      icon={activeChapter.type === 'video' ? <PlayArrowRoundedIcon sx={{ fontSize: '14px !important' }} /> : <ArticleRoundedIcon sx={{ fontSize: '14px !important' }} />}
                      sx={{ background: activeChapter.type === 'video' ? 'rgba(108,127,216,0.18)' : 'rgba(212,168,67,0.18)', color: activeChapter.type === 'video' ? ACCENT2 : GOLD, border: `1px solid ${activeChapter.type === 'video' ? 'rgba(108,127,216,0.3)' : 'rgba(212,168,67,0.3)'}` }} />
                    <Typography sx={{ color: STEEL, fontSize: '0.8rem' }}>{activeChapter.duration}</Typography>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: CREAM, lineHeight: 1.3 }}>{activeChapter.title}</Typography>
                </Box>

                {/* Video */}
                {activeChapter.type === 'video' && activeChapter.content.videoUrl && (
                  <Box sx={{ borderRadius: 3, overflow: 'hidden', mb: 3, aspectRatio: '16/9', background: '#000' }}>
                    <iframe src={activeChapter.content.videoUrl} title={activeChapter.title}
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen />
                  </Box>
                )}

                {/* Text content */}
                {activeChapter.content.textContent && (
                  <Box sx={{ background: 'rgba(22,27,39,0.7)', border: '1px solid rgba(139,155,180,0.1)', borderRadius: 3, p: { xs: 2.5, md: 4 }, mb: 3 }}>
                    <MarkdownRenderer text={activeChapter.content.textContent} />
                  </Box>
                )}

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                  {!chapterProgress.completed && isEnrolled && (
                    <Button variant="outlined" color="primary" startIcon={<DoneAllRoundedIcon />}
                      onClick={handleMarkComplete} sx={{ py: 1.2, px: 2.5, fontSize: '0.85rem' }}>
                      Mark Complete
                    </Button>
                  )}

                  {activeChapter.assessment && isEnrolled && !chapterProgress.assessmentCompleted && (
                    <Button variant="contained" color="primary" startIcon={<QuizRoundedIcon />}
                      onClick={() => setShowAssessment(true)} sx={{ py: 1.2, px: 2.5, fontSize: '0.85rem' }}>
                      Take Chapter Quiz
                    </Button>
                  )}

                  {chapterProgress.assessmentCompleted && (
                    <Chip icon={<CheckCircleRoundedIcon sx={{ color: `${TEAL} !important`, fontSize: '14px !important' }} />}
                      label={`Quiz: ${chapterProgress.assessmentScore}%`}
                      sx={{ background: 'rgba(78,205,196,0.12)', color: TEAL, border: '1px solid rgba(78,205,196,0.3)', fontWeight: 600 }} />
                  )}

                  <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                    {nextChapter && (
                      <Button variant="outlined" color="primary" endIcon={<ArrowForwardRoundedIcon />}
                        onClick={() => { setActiveChapter(nextChapter); setShowAssessment(false); }} sx={{ py: 1.2, px: 2.5, fontSize: '0.85rem' }}>
                        Next Chapter
                      </Button>
                    )}
                    {allChaptersComplete && !completed && !nextChapter && (
                      <Button variant="contained" startIcon={<EmojiEventsRoundedIcon />}
                        onClick={() => { setShowGrandTest(true); }}
                        sx={{ py: 1.2, px: 2.5, background: `linear-gradient(135deg, ${GOLD} 0%, ${SAND} 100%)`, color: NAVY, fontWeight: 700, fontSize: '0.85rem' }}>
                        Take Grand Test
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>
            ) : (
              // Course overview
              <Box sx={{ maxWidth: 760 }}>
                <Box sx={{ borderRadius: 3, overflow: 'hidden', mb: 3, position: 'relative', height: 240 }}>
                  <Box component="img" src={course.thumbnail} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,12,20,0.9), transparent)', display: 'flex', alignItems: 'flex-end', p: 3 }}>
                    <Box>
                      <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800 }}>{course.title}</Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>{course.instructorName}</Typography>
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ background: 'rgba(22,27,39,0.7)', border: '1px solid rgba(139,155,180,0.1)', borderRadius: 3, p: 3 }}>
                  <Typography sx={{ color: CREAM, lineHeight: 1.8 }}>{course.longDescription}</Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Rating Dialog */}
      <Dialog open={showRating} onClose={() => setShowRating(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { background: 'rgba(22,27,39,0.97)', border: '1px solid rgba(139,155,180,0.15)', borderRadius: 4, p: 1 } }}>
        <DialogContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: CREAM, mb: 0.8 }}>Rate This Course</Typography>
          <Typography sx={{ color: STEEL, mb: 3.5, fontSize: '0.9rem' }}>How was your learning experience?</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Rating size="large" value={ratingGiven} onChange={(_, v) => setRatingGiven(v || 0)}
              sx={{ fontSize: '2.5rem', '& .MuiRating-iconFilled': { color: GOLD }, '& .MuiRating-iconHover': { color: GOLD } }} />
          </Box>
          <TextField multiline rows={3} fullWidth placeholder="Write your review (optional)..."
            value={review} onChange={e => setReview(e.target.value)} sx={{ mb: 3 }} />
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button variant="outlined" color="primary" fullWidth onClick={() => setShowRating(false)} sx={{ py: 1.3 }}>Skip</Button>
            <Button variant="contained" fullWidth disabled={!ratingGiven} onClick={() => handleRateSubmit(ratingGiven)}
              sx={{ py: 1.3, background: `linear-gradient(135deg, ${GOLD} 0%, ${SAND} 100%)`, color: NAVY, fontWeight: 700, '&:disabled': { opacity: 0.4 } }}>
              Submit Review
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}