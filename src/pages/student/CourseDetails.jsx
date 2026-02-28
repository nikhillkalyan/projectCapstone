import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { BookOpen, Star, Info, List, Clock, BarChart2, Award, Bookmark, Play, Users, Calendar, ChevronDown, Video } from 'lucide-react';
import StudentLayout from '../../components/layout/v2/StudentLayout';
import SectionShell from '../../components/shared/SectionShell';
import ReviewCard from '../../components/shared/ReviewCard';

export default function CourseDetails() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { db, enrollCourse } = useApp();

    const [expandedChapter, setExpandedChapter] = useState(null);

    const toggleChapter = (chapterId) => {
        setExpandedChapter(expandedChapter === chapterId ? null : chapterId);
    };

    const course = db.courses.find(c => c.id === courseId);
    const isEnrolled = user?.enrolledCourses?.includes(courseId);

    // Fallback if course invalid
    if (!course) {
        return (
            <StudentLayout>
                <div className="flex h-full items-center justify-center min-h-[60vh]">
                    <p className="text-text-secondary font-dmsans">Course not found.</p>
                </div>
            </StudentLayout>
        );
    }

    // Temporary Placeholders
    const renderHero = () => (
        <div className="w-full mb-12 flex flex-col gap-6">

            {/* Title */}
            <h1 className="text-4xl lg:text-5xl font-syne font-bold text-text-primary leading-[1.1] tracking-tight">
                {course.title}
            </h1>

            {/* Short Description */}
            <p className="text-lg text-text-secondary max-w-3xl leading-relaxed font-dmsans">
                {course.description}
            </p>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-full text-[0.75rem] font-syne font-bold border border-primary-500/30 bg-primary-500/10 text-primary-400 tracking-wide">
                    {course.category}
                </span>
                <span className="px-3 py-1 rounded-full text-[0.75rem] font-syne font-bold border border-white/10 bg-white/5 text-text-secondary tracking-wide">
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
                        ({(course.enrolledCount > 1000 ? Math.floor(course.enrolledCount / 10) : 42).toLocaleString()} reviews)
                    </span>
                </div>

                {/* Enrollment */}
                <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <Users className="w-4 h-4" />
                    <span>{(course.enrolledCount || 0).toLocaleString()} students enrolled</span>
                </div>

                {/* Last Updated */}
                <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>Last updated {course.lastUpdated || "Recently"}</span>
                </div>
            </div>
        </div>
    );

    const renderSidebarCTA = () => (
        <div className="w-full bg-bg-surface border border-border-subtle rounded-2xl p-6 shadow-2xl shadow-black/40 flex flex-col gap-6">

            {/* Thumbnail */}
            <div className="w-full h-44 rounded-xl overflow-hidden relative border border-white/5 bg-bg-base">
                <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-base/80 to-transparent" />

                {/* Badge */}
                <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full text-[0.7rem] font-syne font-bold border border-teal-500/30 bg-teal-500/15 text-teal-400 backdrop-blur-md tracking-wide">
                        Free Course
                    </span>
                </div>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col gap-3">
                {isEnrolled ? (
                    <button
                        onClick={() => navigate(`/student/course/${courseId}/learn`)}
                        className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(108,127,216,0.15)]"
                    >
                        <Play className="w-4 h-4 fill-current" />
                        Continue Learning
                    </button>
                ) : (
                    <button
                        onClick={() => {
                            enrollCourse(courseId);
                            navigate(`/student/course/${courseId}/learn`);
                        }}
                        className="w-full bg-white/[0.03] border border-border-subtle hover:border-primary-500 hover:bg-primary-500/10 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                    >
                        <Bookmark className="w-4 h-4" />
                        Enroll Now
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
                    <span className="text-[0.85rem]"><strong className="text-text-primary font-medium">{course.duration}</strong> of content</span>
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
            <div className="flex items-center gap-3 pt-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-teal-400 flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-sm">{course.instructorName.charAt(0)}</span>
                </div>
                <div>
                    <p className="text-[0.7rem] text-text-secondary uppercase tracking-widest font-bold">Instructor</p>
                    <p className="font-syne font-bold text-text-primary text-[0.9rem] leading-tight">{course.instructorName}</p>
                </div>
            </div>

        </div>
    );

    return (
        <StudentLayout>
            <div className="max-w-[1400px] mx-auto w-full pb-20">

                {/* PREMIUM 3-COLUMN GRID LAYOUT */}
                {/* Mobile: 1 Col | Tablet: 1 Col | Desktop: 3 Cols (2 content / 1 sidebar) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 xl:gap-14 pt-4 md:pt-8 min-h-screen items-start">

                    {/* Main Content (Left Side - 2 columns span) */}
                    <div className="lg:col-span-2 flex flex-col w-full">

                        {/* HERO SECTION (Unconstrained Height) */}
                        {renderHero()}

                        {/* VERTICAL RHYTHM SECTIONS */}
                        <div className="space-y-12 pb-16">

                            {/* About Section */}
                            <SectionShell
                                title="About This Course"
                                icon={Info}
                                iconColor="text-teal-400"
                                delay={0.1}
                                disableAnimation={true} // Reduce motion on reading pages
                            >
                                <div className="prose prose-invert max-w-none font-dmsans text-text-secondary text-[0.95rem] leading-loose">
                                    <p>
                                        {course.longDescription || course.description || "Course description placeholder. This area will focus cleanly on typography."}
                                    </p>
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
                                <div className="w-full flex flex-col border border-border-subtle rounded-2xl overflow-hidden bg-bg-surface/30">
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
                                                        className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                                                        aria-expanded={isExpanded}
                                                    >
                                                        <div className="flex flex-col items-start gap-1">
                                                            <h4 className="font-syne font-bold text-text-primary text-[1.05rem] text-left">
                                                                {chapter.title}
                                                            </h4>
                                                            <div className="flex items-center gap-3 text-text-secondary text-[0.8rem] font-medium">
                                                                <span>{chapter.lessons?.length || 0} lessons</span>
                                                                <span className="w-1 h-1 rounded-full bg-border-subtle" />
                                                                <span>{chapter.lessons?.reduce((acc, curr) => acc + (parseInt(curr.duration) || 0), 0)} min</span>
                                                            </div>
                                                        </div>
                                                        <motion.div
                                                            animate={{ rotate: isExpanded ? 180 : 0 }}
                                                            transition={{ duration: 0.2, ease: "easeInOut" }}
                                                            className="w-8 h-8 rounded-full flex items-center justify-center bg-bg-elevated border border-border-subtle text-text-secondary group-hover:text-primary-400 group-hover:border-primary-500/50 transition-colors"
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
                                                                            className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] transition-colors group cursor-default"
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
                                                    courseTitle: course.title // Injecting for ReviewCard prop requirement 
                                                }}
                                                index={i}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="w-full flex flex-col items-center justify-center py-12 px-4 border border-border-subtle rounded-2xl bg-bg-surface/30">
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

                    {/* Sticky Sidebar / CTA Card (Right Side - 1 column span) */}
                    <div className="hidden lg:block lg:col-span-1 sticky top-24 z-10">
                        {renderSidebarCTA()}
                    </div>

                    {/* Mobile CTA Fallback (Shows only on mobile/tablet at bottom) */}
                    <div className="block lg:hidden mt-8 mb-12 w-full">
                        {renderSidebarCTA()}
                    </div>

                </div>
            </div>
        </StudentLayout>
    );
}
