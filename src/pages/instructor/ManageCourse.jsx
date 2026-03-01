import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import InstructorLayout from '../../components/layout/v2/InstructorLayout';
import { ArrowLeft, Users, Star, MessageSquare, BarChart, Clock, Play, FileText, Search } from 'lucide-react';

const categoryColors = {
  AIML: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
  Cloud: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20' },
  DataScience: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  Cybersecurity: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
};

function StarRating({ rating, size = 16, className = "" }) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          fill={star <= Math.round(rating) ? "currentColor" : "none"}
          className={star <= Math.round(rating) ? "text-amber-400" : "text-neutral-700"}
        />
      ))}
    </div>
  );
}

export default function ManageCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { db } = useApp();

  const course = db.courses.find(c => c.id === courseId && c.instructorId === user?.id);

  if (!course) return (
    <InstructorLayout>
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="w-20 h-20 bg-bg-elevated rounded-full flex items-center justify-center mb-6 border border-border-subtle">
          <Search className="w-10 h-10 text-text-muted" />
        </div>
        <h2 className="text-2xl font-bold font-syne text-text-primary border-b border-border-subtle pb-4 mb-4">Course Not Found</h2>
        <p className="text-text-muted max-w-md mx-auto mb-8">
          The course you are looking for does not exist or you do not have permission to manage it.
        </p>
        <button
          onClick={() => navigate('/instructor/courses')}
          className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-colors"
        >
          Back to Courses
        </button>
      </div>
    </InstructorLayout>
  );

  const cc = categoryColors[course.category] || categoryColors.AIML;

  const ratingDist = [5, 4, 3, 2, 1].map(star => {
    const count = course.reviews?.filter(r => Math.round(r.rating) === star).length || 0;
    const pct = course.reviews?.length ? Math.round((count / course.reviews.length) * 100) : 0;
    return { star, count, pct };
  });

  const stats = [
    { icon: Users, label: 'Students', value: course.enrolledCount || 0, color: 'text-teal-400', bg: 'bg-teal-400/10', border: 'border-teal-400/20' },
    { icon: Star, label: 'Rating', value: course.rating?.toFixed(1) || '—', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
    { icon: MessageSquare, label: 'Reviews', value: course.reviews?.length || 0, color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/20' },
    { icon: BarChart, label: 'Chapters', value: course.chapters?.length || 0, color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20' },
  ];

  return (
    <InstructorLayout>
      <div className="max-w-5xl mx-auto pb-12">
        <button
          onClick={() => navigate('/instructor/courses')}
          className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-6 group w-fit"
        >
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          <span className="font-medium text-sm">Back to Courses</span>
        </button>

        {/* Hero Card */}
        <div
          className="animate-fade-in-up bg-bg-surface border border-border-subtle rounded-3xl overflow-hidden mb-8 shadow-2xl shadow-black/50"
        >
          {/* Header Image Area */}
          <div className="relative h-48 sm:h-64 md:h-72">
            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-surface via-bg-surface/60 to-transparent" />

            <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8">
              <div className="flex gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${cc.bg} ${cc.text} ${cc.border} border`}>
                  {course.category}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/50 text-amber-200 border border-amber-200/20 backdrop-blur-md">
                  {course.level}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold font-syne text-white mb-2">{course.title}</h1>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Clock size={16} />
                <span>{course.duration}</span>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="p-6 sm:p-8 border-t border-border-subtle bg-bg-surface/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, idx) => (
                <div key={idx} className={`flex flex-col items-center justify-center p-4 rounded-2xl border ${stat.bg} ${stat.border}`}>
                  <stat.icon className={`mb-2 w-6 h-6 ${stat.color}`} />
                  <span className="text-2xl font-bold font-syne text-text-primary leading-tight">{stat.value}</span>
                  <span className="text-xs font-medium text-text-muted uppercase tracking-wider mt-1">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Area: Chapters */}
          <div className="lg:col-span-7 space-y-8">
            <div
              className="animate-fade-in-up bg-bg-surface border border-border-subtle rounded-3xl p-6 sm:p-8 shadow-xl"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold font-syne text-text-primary flex items-center gap-2">
                  <FileText className="text-primary-500" />
                  Chapters ({course.chapters?.length || 0})
                </h2>
              </div>

              <div className="space-y-3">
                {course.chapters?.map((ch, i) => (
                  <div key={ch.id} className="flex items-center gap-4 p-4 rounded-2xl bg-bg-elevated border border-border-subtle hover:border-border-strong transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center shrink-0">
                      {ch.type === 'video' ? <Play size={20} className="ml-1" /> : <FileText size={20} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-text-primary truncate">{ch.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                        <span>{ch.duration || 'N/A'}</span>
                        {ch.assessment?.questions?.length > 0 && (
                          <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 font-medium">
                            {ch.assessment.questions.length} Quiz Qs
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-xs font-bold text-text-muted/50 w-8 text-right">#{i + 1}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate(`/instructor/students/${course.id}`)}
                className="w-full mt-6 py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <BarChart size={18} />
                View Student Progress
              </button>
            </div>
          </div>

          {/* Sidebar Area: Reviews */}
          <div className="lg:col-span-5 space-y-8">
            <div
              className="animate-fade-in-up bg-bg-surface border border-border-subtle rounded-3xl p-6 sm:p-8 shadow-xl"
              style={{ animationDelay: '0.2s' }}
            >
              <h2 className="text-xl font-bold font-syne text-text-primary flex items-center gap-2 mb-6">
                <Star className="text-amber-400" />
                Reviews
              </h2>

              {course.reviews?.length > 0 ? (
                <div>
                  {/* Rating Summary */}
                  <div className="flex flex-col items-center mb-8">
                    <div className="text-5xl font-bold font-syne text-amber-400 leading-none mb-2">
                      {course.rating?.toFixed(1)}
                    </div>
                    <StarRating rating={course.rating || 0} size={20} className="mb-2" />
                    <div className="text-sm text-text-muted">
                      {course.reviews.length} {course.reviews.length === 1 ? 'review' : 'reviews'}
                    </div>
                  </div>

                  {/* Rating Bars */}
                  <div className="space-y-2.5 mb-8">
                    {ratingDist.map(({ star, count, pct }) => (
                      <div key={star} className="flex items-center gap-3">
                        <span className="text-xs font-medium text-text-muted w-3 text-right">{star}</span>
                        <Star size={12} className="text-amber-400 shrink-0" fill="currentColor" />
                        <div className="flex-1 h-2 rounded-full bg-bg-elevated overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-medium text-text-muted w-6 text-right">{count}</span>
                      </div>
                    ))}
                  </div>

                  <div className="h-px w-full bg-border-subtle mb-6" />

                  {/* Review List */}
                  <div className="space-y-5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {[...course.reviews].reverse().map((r, i) => (
                      <div key={i} className="pb-5 border-b border-border-subtle/50 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-semibold text-sm text-text-primary">{r.studentName}</div>
                          <StarRating rating={r.rating} size={12} />
                        </div>
                        {r.review && (
                          <p className="text-sm text-text-muted italic leading-relaxed">"{r.review}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Star className="w-12 h-12 text-border-strong mb-4" />
                  <p className="text-text-muted font-medium">No reviews yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </InstructorLayout>
  );
}