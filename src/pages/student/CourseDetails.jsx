import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { BookOpen, Star, Info, List, Clock, BarChart2, Award, Bookmark, Play } from 'lucide-react';
import StudentLayout from '../../components/layout/v2/StudentLayout';
import SectionShell from '../../components/shared/SectionShell';

export default function CourseDetails() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { db, enrollCourse } = useApp();

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
    const renderHeroPlaceholder = () => (
        <div className="w-full bg-bg-surface border border-border-subtle rounded-2xl h-[340px] flex items-center justify-center mb-10 overflow-hidden relative group">
            <span className="text-text-secondary font-syne z-10">Hero Section Placeholder</span>
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
                        {renderHeroPlaceholder()}

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
                                <div className="w-full h-64 border border-border-subtle rounded-2xl flex items-center justify-center bg-bg-surface/50">
                                    <span className="text-text-secondary font-syne">Curriculum Accordion Placeholder</span>
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
                                <div className="w-full h-48 border border-border-subtle rounded-2xl flex items-center justify-center bg-bg-surface/50">
                                    <span className="text-text-secondary font-syne">Review Grid Placeholder</span>
                                </div>
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
