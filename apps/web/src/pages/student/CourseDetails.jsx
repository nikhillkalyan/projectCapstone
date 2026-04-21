import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCourseById, getChapters } from '../../api/courseApi';
import { enrollInCourse } from '../../api/studentApi';
import { getCourseProgress } from '../../api/progressApi';
import { useApp } from '../../context/AppContext';
import { BookOpen, Star, Info, List, Clock, BarChart2, Award, Bookmark, Play, Users, Calendar, ChevronDown, Video, Loader2, AlertCircle, MessageSquare } from 'lucide-react';
import StudentLayout from '../../components/layout/v2/StudentLayout';
import SectionShell from '../../components/shared/SectionShell';
import ReviewCard from '../../components/shared/ReviewCard';

export default function CourseDetails() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user, updateLocalUser } = useAuth();

    const [expandedChapter, setExpandedChapter] = useState(null);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [enrolling, setEnrolling] = useState(false);
    const { rateCourse } = useApp();
    
    // Auth-based progress checks
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [courseProgress, setCourseProgress] = useState(null);

    // Review Modal State
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    
    const hasReviewed = course?.reviews?.some(r => r.studentId === user?.id);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                // Fetch course and chapters in parallel
                const [courseRes, chaptersRes] = await Promise.all([
                    getCourseById(courseId),
                    getChapters(courseId).catch(() => ({ data: [] })) // fallback if chapters fail
                ]);
                
                setCourse({
                    ...courseRes.data,
                    chapters: chaptersRes.data
                });

                // Check real enrollment via backend if logged in
                if (user) {
                    try {
                        const progRes = await getCourseProgress(courseId);
                        setIsEnrolled(true);
                        setCourseProgress(progRes.data);
                    } catch (e) {
                        setIsEnrolled(false);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch course details", err);
                setError("Course not found or unable to load details.");
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [courseId, user]);

    const toggleChapter = (chapterId) => {
        setExpandedChapter(expandedChapter === chapterId ? null : chapterId);
    };

    const handleEnroll = async () => {
        setEnrolling(true);
        try {
            await enrollInCourse(courseId);
            setIsEnrolled(true);
            // We navigate to the player which should fetch fresh progress
            navigate(`/student/course/${courseId}/learn`);
        } catch (err) {
            console.error("Failed to enroll", err);
            alert(err.response?.data?.error || "Failed to enroll. Please try again.");
            setEnrolling(false);
        }
    };

    // Loading State
    if (loading) {
        return (
            <StudentLayout>
                <div className="flex flex-col h-full items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-4" />
                    <p className="text-text-secondary font-dmsans">Loading course details...</p>
                </div>
            </StudentLayout>
        );
    }

    // Error / Fallback State
    if (error || !course) {
        return (
            <StudentLayout>
                <div className="flex h-full items-center justify-center min-h-[60vh]">
                    <div className="glass flex max-w-md flex-col items-center rounded-lg border-error-400/20 bg-error-500/5 p-8 text-center">
                        <AlertCircle className="w-12 h-12 text-error-400 mb-4" />
                        <h2 className="text-xl font-syne font-bold text-error-400 mb-2">Error</h2>
                        <p className="text-error-400/80 mb-6">{error || "Course not found."}</p>
                        <button 
                            onClick={() => navigate('/student/explore')}
                            className="rounded-lg bg-error-500/10 px-6 py-2.5 font-bold text-error-400 transition-colors hover:bg-error-500/20"
                        >
                            Back to Explore
                        </button>
                    </div>
                </div>
            </StudentLayout>
        );
    }

    // Main Rendering
    const renderHero = () => (
        <div className="w-full mb-12 flex flex-col gap-6">

            {/* Title */}
            <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-normal text-gradient lg:text-5xl">
                {course.title}
            </h1>

            {/* Short Description */}
            <p className="max-w-3xl text-lg leading-relaxed text-text-secondary">
                {course.description}
            </p>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-primary-400/30 bg-primary-500/10 px-3 py-1 font-display text-[0.75rem] font-bold tracking-wide text-primary-300">
                    {course.category}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-display text-[0.75rem] font-bold tracking-wide text-text-secondary">
                    {course.level} Level
                </span>
            </div>

            {/* Metadata Row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-4">

                {/* Rating */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                            <Star
                                key={star}
                                className={`w-4 h-4 ${star <= Math.round(course.rating || 0) ? 'fill-primary-500 text-primary-500' : 'fill-transparent text-border-subtle'}`}
                            />
                        ))}
                    </div>
                    <span className="text-sm font-medium text-text-primary ml-1">{course.rating?.toFixed(1) || "New"}</span>
                    <span className="text-sm text-text-secondary">
                        ({(course.totalEnrollments > 1000 ? Math.floor(course.totalEnrollments / 10) : (course.reviews?.length || 0)).toLocaleString()} reviews)
                    </span>
                </div>

                {/* Enrollment */}
                <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <Users className="w-4 h-4" />
                    <span>{(course.totalEnrollments || 0).toLocaleString()} students enrolled</span>
                </div>

                {/* Last Updated */}
                <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>Last updated {course.lastUpdated ? new Date(course.lastUpdated).toLocaleDateString() : "Recently"}</span>
                </div>
            </div>
        </div>
    );

    const renderSidebarCTA = () => (
        <div className="glass flex w-full flex-col gap-6 rounded-lg p-6">

            {/* Thumbnail */}
            <div className="relative h-44 w-full overflow-hidden rounded-lg border border-white/5 bg-bg-base">
                <img
                    src={course.thumbnail || `https://source.unsplash.com/800x600/?education,${course.category}`}
                    alt={course.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-base/80 to-transparent" />

                {/* Badge */}
                <div className="absolute top-3 left-3">
                    <span className="rounded-full border border-success-400/30 bg-success-500/15 px-3 py-1 font-display text-[0.7rem] font-bold tracking-wide text-success-400 backdrop-blur-md">
                        Free Course
                    </span>
                </div>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col gap-3">
                {isEnrolled ? (
                    <button
                        onClick={() => navigate(`/student/course/${courseId}/learn`)}
                        className="relative z-10 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-primary font-bold text-white shadow-glow transition-all hover:scale-[1.02] active:scale-95"
                    >
                        <Play className="w-4 h-4 fill-current" />
                        {courseProgress?.isCompleted || courseProgress?.overallProgress >= 100 ? "Revisit Course" : "Continue Learning"}
                    </button>
                ) : (
                    <button
                        onClick={handleEnroll}
                        disabled={enrolling}
                        className="relative z-10 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-border-subtle bg-white/[0.03] font-bold text-white transition-all hover:scale-[1.02] hover:border-primary-400/50 hover:bg-primary-500/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {enrolling ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Bookmark className="w-4 h-4" />
                                Enroll Now
                            </>
                        )}
                    </button>
                )}
                
                {isEnrolled && (courseProgress?.isCompleted || courseProgress?.overallProgress >= 100) && (
                    <button
                        onClick={() => { setShowReviewModal(true); setReviewRating(0); setReviewText(''); }}
                        disabled={hasReviewed}
                        className={`w-full h-12 flex items-center justify-center gap-2 rounded-xl transition-all border font-bold text-sm cursor-pointer ${hasReviewed 
                            ? 'border-border-subtle bg-white/5 text-text-tertiary disabled:cursor-not-allowed'
                            : 'border-warning-400/50 bg-transparent text-warning-400 shadow-warning-500/20 hover:bg-warning-500/10 hover:shadow-lg'
                        }`}
                    >
                        <MessageSquare className="w-4 h-4" />
                        {hasReviewed ? 'Reviewed' : 'Write a Review'}
                    </button>
                )}
                
                <p className="text-center text-text-secondary text-[0.75rem]">
                    Full lifetime access. No credit card required.
                </p>
            </div>

            <div className="h-[1px] w-full bg-border-subtle/50" />

            {/* Metadata Rows */}
            <div className="space-y-4">
                <h3 className="font-syne font-bold text-text-primary text-[0.95rem] mb-2">What's included</h3>

                <div className="flex items-center gap-3 text-text-secondary">
                    <Clock className="w-4 h-4 text-primary-400" />
                    <span className="text-[0.85rem]"><strong className="text-text-primary font-medium">{course.duration || 'Flexible'}</strong> of content</span>
                </div>

                <div className="flex items-center gap-3 text-text-secondary">
                    <BarChart2 className="w-4 h-4 text-primary-400" />
                    <span className="text-[0.85rem]"><strong className="text-text-primary font-medium">{course.level}</strong> level</span>
                </div>

                <div className="flex items-center gap-3 text-text-secondary">
                    <BookOpen className="w-4 h-4 text-primary-400" />
                    <span className="text-[0.85rem]"><strong className="text-text-primary font-medium">{course.chapters?.length || 0}</strong> interactive modules</span>
                </div>

                <div className="flex items-center gap-3 text-text-secondary">
                    <Award className="w-4 h-4 text-primary-400" />
                    <span className="text-[0.85rem]">Certificate of completion</span>
                </div>
            </div>

            <div className="h-[1px] w-full bg-border-subtle/50" />

            {/* Instructor Preview */}
            {(course.instructor || course.instructorName) && (
                <div className="flex items-center gap-3 pt-1">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-accent shadow-glow">
                        <span className="text-white font-bold text-sm">{(course.instructor?.name || course.instructorName)?.charAt(0)}</span>
                    </div>
                    <div>
                        <p className="text-[0.7rem] text-text-secondary uppercase tracking-widest font-bold">Instructor</p>
                        <p className={`font-syne font-bold text-[0.9rem] leading-tight ${course.instructor?.approvalStatus === 'REMOVED' ? 'text-error-400' : 'text-text-primary'}`}>
                            {course.instructor?.approvalStatus === 'REMOVED' ? '[Removed Account]' : (course.instructor?.name || course.instructorName)}
                        </p>
                    </div>
                </div>
            )}

        </div>
    );

    return (
        <StudentLayout>
            <div className="max-w-[1400px] mx-auto w-full pb-20">

                {/* PREMIUM 3-COLUMN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 xl:gap-14 pt-4 md:pt-8 min-h-screen items-start">

                    {/* Main Content (Left Side - 2 columns span) */}
                    <div className="lg:col-span-2 flex flex-col w-full">

                        {/* HERO SECTION */}
                        {renderHero()}

                        {/* VERTICAL RHYTHM SECTIONS */}
                        <div className="space-y-12 pb-16">

                            {/* About Section */}
                            <SectionShell
                                title="About This Course"
                                icon={Info}
                                iconColor="text-success-400"
                                delay={0.1}
                                disableAnimation={true}
                            >
                                <div className="prose prose-invert max-w-none whitespace-pre-line text-[0.95rem] leading-loose text-text-secondary">
                                    {course.longDescription || course.description || "Course description placeholder. This area will focus cleanly on typography."}
                                </div>
                            </SectionShell>

                            {/* Curriculum Section */}
                            <SectionShell
                                title="Curriculum"
                                icon={List}
                                iconColor="text-primary-400"
                                delay={0.2}
                                disableAnimation={true}
                            >
                                <div className="glass-sm flex w-full flex-col overflow-hidden rounded-lg">
                                    {course.chapters?.length > 0 ? (
                                        course.chapters.map((chapter, index) => {
                                            const isExpanded = expandedChapter === chapter.id;
                                            const isLast = index === course.chapters.length - 1;

                                            return (
                                                <div
                                                    key={chapter.id}
                                                    className={`w-full flex flex-col ${!isLast ? 'border-b border-border-subtle' : ''}`}
                                                >
                                                    {/* Accordion Header */}
                                                    <button
                                                        onClick={() => toggleChapter(chapter.id)}
                                                        className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 cursor-pointer"
                                                        aria-expanded={isExpanded}
                                                    >
                                                        <div className="flex flex-col items-start gap-1">
                                                            <h4 className="font-syne font-bold text-text-primary text-[1.05rem] text-left">
                                                                {chapter.title}
                                                            </h4>
                                                            <div className="flex items-center gap-3 text-text-secondary text-[0.8rem] font-medium">
                                                                <span>{chapter.lessons?.length || 0} lessons</span>
                                                                <span className="w-1 h-1 rounded-full bg-border-subtle" />
                                                                <span>{chapter.duration || "N/A"}</span>
                                                            </div>
                                                        </div>
                                                        <motion.div
                                                            animate={{ rotate: isExpanded ? 180 : 0 }}
                                                            transition={{ duration: 0.2, ease: "easeInOut" }}
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle bg-bg-elevated text-text-secondary transition-colors group-hover:border-primary-400/50 group-hover:text-primary-300"
                                                        >
                                                            <ChevronDown className="w-4 h-4" />
                                                        </motion.div>
                                                    </button>

                                                    {/* Accordion Content */}
                                                    <AnimatePresence>
                                                        {isExpanded && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: "auto", opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="flex flex-col px-5 pb-5 pt-1 space-y-2">
                                                                    {chapter.lessons?.map((lesson, lessonIndex) => (
                                                                        <div
                                                                            key={lesson.id}
                                                                            className="flex cursor-default items-center justify-between rounded-lg p-3 transition-colors hover:bg-white/[0.04]"
                                                                        >
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="w-8 h-8 rounded-lg bg-bg-elevated border border-border-subtle flex items-center justify-center text-text-secondary group-hover:text-primary-400 transition-colors">
                                                                                    <Video className="w-4 h-4 fill-current/10" />
                                                                                </div>
                                                                                <div className="flex flex-col">
                                                                                    <span className="text-[0.9rem] font-medium text-text-primary">
                                                                                        {lessonIndex + 1}. {lesson.title}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-3">
                                                                                {lesson.isPreview && (
                                                                                    <span className="px-2 py-0.5 rounded text-[0.65rem] font-bold uppercase tracking-wider bg-white/5 text-text-secondary border border-border-subtle">
                                                                                        Preview
                                                                                    </span>
                                                                                )}
                                                                                <span className="text-[0.8rem] text-text-secondary font-medium">
                                                                                    {lesson.duration}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="p-8 text-center text-text-secondary font-dmsans">
                                            Curriculum is currently being updated.
                                        </div>
                                    )}
                                </div>
                            </SectionShell>

                            {/* Reviews Section */}
                            <SectionShell
                                title="Student Reviews"
                                icon={Star}
                                iconColor="text-amber-400"
                                delay={0.3}
                                disableAnimation={true}
                            >
                                {course.reviews && course.reviews.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {course.reviews.slice(0, 4).map((review, i) => (
                                            <ReviewCard
                                                key={review.id || i}
                                                review={{
                                                    ...review,
                                                    courseTitle: course.title
                                                }}
                                                index={i}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="glass-sm flex w-full flex-col items-center justify-center rounded-lg px-4 py-12">
                                        <div className="w-12 h-12 rounded-full bg-bg-elevated border border-border-subtle flex items-center justify-center text-text-secondary mb-4">
                                            <Star className="w-5 h-5 opacity-50" />
                                        </div>
                                        <h3 className="font-syne font-bold text-text-primary text-lg mb-1">No reviews yet</h3>
                                        <p className="font-dmsans text-text-secondary text-sm text-center max-w-sm">
                                            Be the first student to enroll and leave a review for this course!
                                        </p>
                                    </div>
                                )}
                            </SectionShell>

                        </div>
                    </div>

                    {/* Sticky Sidebar / CTA Card */}
                    <div className="hidden lg:block lg:col-span-1 sticky top-24 z-10">
                        {renderSidebarCTA()}
                    </div>

                    {/* Mobile CTA Fallback */}
                    <div className="block lg:hidden mt-8 mb-12 w-full">
                        {renderSidebarCTA()}
                    </div>

                </div>
            </div>

            {/* Review Modal portal structure */}
            <AnimatePresence>
                {showReviewModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowReviewModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-default"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass-lg relative flex w-full max-w-md cursor-default flex-col items-center rounded-lg p-8 text-center shadow-strong"
                        >
                            <h3 className="mb-2 font-display text-2xl font-bold text-text-primary">Review Course</h3>
                            <p className="text-text-secondary font-medium mb-6 line-clamp-1">"{course.title}"</p>

                            <div className="flex justify-center gap-2 mb-6 cursor-pointer">
                                {[1, 2, 3, 4, 5].map((starIndex) => (
                                    <Star
                                        key={starIndex}
                                        onClick={() => setReviewRating(starIndex)}
                                        className={`w-12 h-12 transition-all hover:scale-110 ${reviewRating >= starIndex
                                            ? 'fill-warning-400 text-warning-400'
                                            : 'fill-white/5 text-white/10'
                                            }`}
                                    />
                                ))}
                            </div>

                            <textarea
                                rows={3}
                                placeholder="What did you think of the course? (optional)"
                                value={reviewText}
                                onChange={e => setReviewText(e.target.value)}
                                className="glass-input mb-6 w-full cursor-text resize-none rounded-lg p-4 text-text-primary outline-none"
                            />

                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setShowReviewModal(false)}
                                    className="flex-1 cursor-pointer rounded-lg border border-border-subtle py-3 font-bold text-text-secondary transition-colors hover:bg-white/[0.06] hover:text-text-primary"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={!reviewRating}
                                    onClick={() => {
                                        rateCourse(course.id, reviewRating, reviewText);
                                        setShowReviewModal(false);
                                        // Update local state so standard review immediately appears as reviewed 
                                        setCourse(prev => {
                                             const newReview = { id: Date.now(), studentId: user.id, studentName: user.name, rating: reviewRating, reviewText, date: new Date().toISOString() };
                                             return {...prev, reviews: [...(prev.reviews || []), newReview]};
                                        });
                                    }}
                                    className="flex-[2] cursor-pointer rounded-lg bg-gradient-warning py-3 font-display font-bold text-bg-base shadow-glow transition-all disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Submit Review
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </StudentLayout>
    );
}
