import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Award,
  BookCheck,
  CalendarDays,
  FileCheck2,
  GraduationCap,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import StudentLayout from '../../components/layout/v2/StudentLayout';
import SectionShell from '../../components/shared/SectionShell';
import EmptyState from '../../components/shared/EmptyState';
import { getEnrolledCourses } from '../../api/studentApi';
import { getStudentUniversityEnrollments } from '../../api/courseApi';
import { getApprovedFinalMarks, getStudentMarks } from '../../api/marksApi';
import { getCourseProgress } from '../../api/progressApi';

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '-';

const formatPercent = (value) =>
  typeof value === 'number' ? `${value.toFixed(1)}%` : '-';

const getMarksStatusMeta = (status) => {
  switch (status) {
    case 'APPROVED':
      return 'border-success-400/20 bg-success-500/10 text-success-300';
    case 'SUBMITTED':
      return 'border-primary-400/20 bg-primary-500/10 text-primary-300';
    case 'RETURNED':
      return 'border-warning-400/20 bg-warning-500/10 text-warning-300';
    default:
      return 'border-border-subtle bg-bg-surface text-text-secondary';
  }
};

const getStudentCoursePath = (course) =>
  course?.isUniversityCourse
    ? `/student/university/course/${course.id}`
    : `/student/course/${course.id}`;

function MetricCard({ icon: Icon, label, value, tone }) {
  return (
    <div className={`glass rounded-2xl border px-5 py-5 ${tone}`}>
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5">
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-3xl font-extrabold tracking-tight text-text-primary">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-[0.22em] text-text-secondary">{label}</div>
    </div>
  );
}

function StatusPill({ children, status }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.2em] ${getMarksStatusMeta(status)}`}>
      {children}
    </span>
  );
}

function SourcePill({ type = 'university' }) {
  const isUniversity = type === 'university';
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] ${
      isUniversity
        ? 'border-primary-400/20 bg-primary-500/10 text-primary-300'
        : 'border-amber-400/20 bg-amber-500/10 text-amber-300'
    }`}>
      {isUniversity ? 'University' : 'Public'}
    </span>
  );
}

function ActionButton({ onClick, children, variant = 'primary' }) {
  const className = variant === 'secondary'
    ? 'border border-border-subtle bg-bg-surface text-text-secondary hover:text-text-primary'
    : 'bg-primary-500 text-white hover:bg-primary-400';

  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5 active:scale-95 ${className}`}
    >
      {children}
    </button>
  );
}

function CertificateCard({ item, navigate }) {
  return (
    <div className="glass rounded-2xl border border-success-400/10 p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <StatusPill status="APPROVED">Issued</StatusPill>
            <SourcePill type="university" />
            <span className="text-xs text-text-secondary">Certificate</span>
          </div>
          <h3 className="text-lg font-bold text-text-primary">{item.courseTitle}</h3>
          <p className="mt-1 text-sm text-text-secondary">
            {item.instructorName || 'Instructor'} - {item.targetBranch || '-'} {item.targetYear ? `- ${item.targetYear}` : ''}
          </p>
        </div>
        <div className="rounded-2xl bg-success-500/10 p-3 text-success-300">
          <Award className="h-5 w-5" />
        </div>
      </div>

      <div className="grid gap-3 text-sm text-text-secondary sm:grid-cols-3">
        <div>
          <div className="text-[0.72rem] uppercase tracking-[0.2em] text-text-secondary/70">Final Score</div>
          <div className="mt-1 text-base font-bold text-text-primary">{formatPercent(item.certificate?.finalScore)}</div>
        </div>
        <div>
          <div className="text-[0.72rem] uppercase tracking-[0.2em] text-text-secondary/70">Grade</div>
          <div className="mt-1 text-base font-bold text-text-primary">{item.certificate?.grade || '-'}</div>
        </div>
        <div>
          <div className="text-[0.72rem] uppercase tracking-[0.2em] text-text-secondary/70">Issued On</div>
          <div className="mt-1 text-base font-bold text-text-primary">{formatDate(item.certificate?.approvedAt)}</div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <ActionButton onClick={() => navigate(`/student/certificate/${item.courseId}`)}>
          View Certificate
        </ActionButton>
        <ActionButton variant="secondary" onClick={() => navigate(`/student/university/course/${item.courseId}`)}>
          Open Course
        </ActionButton>
      </div>
    </div>
  );
}

function ResultCard({ item, navigate }) {
  return (
    <div className="glass rounded-2xl border border-border-subtle p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <StatusPill status={item.marks?.marksSheetStatus}>{item.marks?.marksSheetStatus || 'DRAFT'}</StatusPill>
            <SourcePill type="university" />
          </div>
          <h3 className="text-lg font-bold text-text-primary">{item.courseTitle}</h3>
          <p className="mt-1 text-sm text-text-secondary">
            {item.instructorName || 'Instructor'} - {item.sectionName || '-'}
          </p>
        </div>
        <div className="rounded-2xl bg-primary-500/10 p-3 text-primary-300">
          <FileCheck2 className="h-5 w-5" />
        </div>
      </div>

      <div className="grid gap-3 text-sm text-text-secondary sm:grid-cols-4">
        <div>
          <div className="text-[0.72rem] uppercase tracking-[0.2em] text-text-secondary/70">Progress</div>
          <div className="mt-1 text-base font-bold text-text-primary">{formatPercent(item.overallProgress ?? item.marks?.overallProgress)}</div>
        </div>
        <div>
          <div className="text-[0.72rem] uppercase tracking-[0.2em] text-text-secondary/70">Projected Score</div>
          <div className="mt-1 text-base font-bold text-text-primary">{formatPercent(item.marks?.finalScore)}</div>
        </div>
        <div>
          <div className="text-[0.72rem] uppercase tracking-[0.2em] text-text-secondary/70">Grade</div>
          <div className="mt-1 text-base font-bold text-text-primary">{item.marks?.grade || '-'}</div>
        </div>
        <div>
          <div className="text-[0.72rem] uppercase tracking-[0.2em] text-text-secondary/70">Approved On</div>
          <div className="mt-1 text-base font-bold text-text-primary">{formatDate(item.marks?.approvedAt)}</div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <ActionButton variant="secondary" onClick={() => navigate(`/student/university/course/${item.courseId}`)}>
          Open Course
        </ActionButton>
        {item.certificate ? (
          <ActionButton onClick={() => navigate(`/student/certificate/${item.courseId}`)}>
            View Certificate
          </ActionButton>
        ) : null}
      </div>
    </div>
  );
}

function MilestoneCard({ course, navigate }) {
  return (
    <div className="glass rounded-2xl border border-border-subtle p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <StatusPill status="APPROVED">Completed</StatusPill>
            <SourcePill type={course.isUniversityCourse ? 'university' : 'public'} />
            <span className="text-xs text-text-secondary">Learning milestone</span>
          </div>
          <h3 className="text-lg font-bold text-text-primary">{course.title}</h3>
          <p className="mt-1 text-sm text-text-secondary">
            {course.enrolledAt ? `Enrolled ${formatDate(course.enrolledAt)}` : 'Course completed'}
          </p>
        </div>
        <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-300">
          <GraduationCap className="h-5 w-5" />
        </div>
      </div>

      <div className="grid gap-3 text-sm text-text-secondary sm:grid-cols-3">
        <div>
          <div className="text-[0.72rem] uppercase tracking-[0.2em] text-text-secondary/70">Progress</div>
          <div className="mt-1 text-base font-bold text-text-primary">{formatPercent(course.overallProgress)}</div>
        </div>
        <div>
          <div className="text-[0.72rem] uppercase tracking-[0.2em] text-text-secondary/70">Type</div>
          <div className="mt-1 text-base font-bold text-text-primary">{course.isUniversityCourse ? 'University' : 'Public'}</div>
        </div>
        <div>
          <div className="text-[0.72rem] uppercase tracking-[0.2em] text-text-secondary/70">Status</div>
          <div className="mt-1 text-base font-bold text-text-primary">{course.isCompleted ? 'Completed' : '100% Reached'}</div>
        </div>
      </div>

      <div className="mt-5">
        <ActionButton variant="secondary" onClick={() => navigate(getStudentCoursePath(course))}>
          Open Course
        </ActionButton>
      </div>
    </div>
  );
}

export default function StudentHistory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [historyItems, setHistoryItems] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const fetchHistory = async () => {
      setLoading(true);
      setError('');

      try {
        const [universityRes, enrolledRes] = await Promise.allSettled([
          getStudentUniversityEnrollments(),
          getEnrolledCourses(),
        ]);

        const universityEnrollments = universityRes.status === 'fulfilled'
          ? (universityRes.value.data || [])
          : [];
        const enrolledCourses = enrolledRes.status === 'fulfilled'
          ? (enrolledRes.value.data || [])
          : [];

        const [historyResults, progressResults] = await Promise.all([
          Promise.all(
            universityEnrollments.map(async (enrollment) => {
              const marksRes = await getStudentMarks(enrollment.courseId)
                .then((response) => ({ status: 'fulfilled', value: response }))
                .catch((reason) => ({ status: 'rejected', reason }));

              let certificateRes = { status: 'fulfilled', value: { data: null } };

              if (
                marksRes.status === 'fulfilled' &&
                marksRes.value?.data?.marksSheetStatus === 'APPROVED'
              ) {
                certificateRes = await getApprovedFinalMarks(enrollment.courseId)
                  .then((response) => ({ status: 'fulfilled', value: response }))
                  .catch((reason) => ({ status: 'rejected', reason }));
              }

              return {
                ...enrollment,
                marks: marksRes.status === 'fulfilled' ? marksRes.value.data : null,
                certificate: certificateRes.status === 'fulfilled' ? certificateRes.value.data : null,
              };
            })
          ),
          Promise.all(
            enrolledCourses.map(async (enrollment) => {
              const course = enrollment?.course;
              if (!course?.id) {
                return null;
              }

              const progressRes = await getCourseProgress(course.id).catch(() => ({
                data: { overallProgress: 0, isCompleted: false },
              }));

              return {
                ...course,
                enrolledAt: enrollment.enrolledAt,
                overallProgress: progressRes.data?.overallProgress || 0,
                isCompleted: Boolean(progressRes.data?.isCompleted) || (progressRes.data?.overallProgress || 0) >= 100,
              };
            })
          ),
        ]);

        if (cancelled) {
          return;
        }

        const filteredProgress = progressResults.filter(Boolean);
        const uniqueCompletedCourses = Array.from(
          new Map(
            filteredProgress
              .filter((course) => course.isCompleted || course.overallProgress >= 100)
              .map((course) => [course.id, course])
          ).values()
        );

        setHistoryItems(
          historyResults.sort((left, right) => {
            const leftTime = left.certificate?.approvedAt || left.marks?.approvedAt || left.finalDeadline || '';
            const rightTime = right.certificate?.approvedAt || right.marks?.approvedAt || right.finalDeadline || '';
            return new Date(rightTime || 0) - new Date(leftTime || 0);
          })
        );
        setCompletedCourses(uniqueCompletedCourses);

        if (universityRes.status === 'rejected' && enrolledRes.status === 'rejected') {
          setError('Failed to load your history right now.');
        }
      } catch (fetchError) {
        console.error('Failed to build student history', fetchError);
        if (!cancelled) {
          setError('Failed to load your history right now.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchHistory();

    return () => {
      cancelled = true;
    };
  }, []);

  const issuedCertificates = useMemo(
    () => historyItems.filter((item) => item.certificate),
    [historyItems]
  );

  const finalResults = useMemo(
    () => historyItems.filter((item) => item.marks),
    [historyItems]
  );

  const pendingResults = useMemo(
    () => historyItems.filter((item) => {
      const status = item.marks?.marksSheetStatus || 'DRAFT';
      return status !== 'APPROVED';
    }),
    [historyItems]
  );

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary-500" />
          <p className="text-text-secondary">Loading your history...</p>
        </div>
      </StudentLayout>
    );
  }

  const hasAnyHistory = issuedCertificates.length > 0 || finalResults.length > 0 || completedCourses.length > 0;

  return (
    <StudentLayout>
      <div className="mx-auto w-full max-w-[1600px] pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <h1 className="heading-2 mb-2 text-gradient">History</h1>
            <p className="text-text-secondary">
              Track your completed courses, final result progress, and issued certificates.
            </p>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-success-400/20 bg-success-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-success-300 sm:flex">
            <ShieldCheck className="h-4 w-4" />
            Verified Learning Record
          </div>
        </motion.div>

        {error ? (
          <div className="glass mb-8 rounded-2xl border border-error-400/20 bg-error-500/10 px-5 py-4 text-sm text-error-300">
            {error}
          </div>
        ) : null}

        {!hasAnyHistory ? (
          <EmptyState
            icon={BookCheck}
            title="No history entries yet"
            description="Once you complete courses or the university final-result workflow starts, your history timeline will appear here."
            action={(
              <button
                onClick={() => navigate('/student/explore')}
                className="rounded-xl bg-primary-500 px-6 py-3 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary-400 active:scale-95"
              >
                Explore Courses
              </button>
            )}
          />
        ) : (
          <>
            <div className="mb-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard icon={GraduationCap} label="Completed Courses" value={completedCourses.length} tone="border-amber-400/15 bg-amber-500/8" />
              <MetricCard icon={Award} label="Issued Certificates" value={issuedCertificates.length} tone="border-success-400/15 bg-success-500/8" />
              <MetricCard icon={FileCheck2} label="Final Results" value={finalResults.length} tone="border-primary-400/15 bg-primary-500/8" />
              <MetricCard icon={CalendarDays} label="Pending Review" value={pendingResults.length} tone="border-warning-400/15 bg-warning-500/8" />
            </div>

            <SectionShell title="Issued Certificates" icon={Award} iconColor="text-success-300">
              {issuedCertificates.length === 0 ? (
                <EmptyState
                  icon={Award}
                  title="No certificates yet"
                  description="Certificates will appear here as soon as your university final marks sheets are approved."
                  isCompact
                />
              ) : (
                <div className="grid gap-5 xl:grid-cols-2">
                  {issuedCertificates.map((item) => (
                    <CertificateCard key={`certificate-${item.courseId}`} item={item} navigate={navigate} />
                  ))}
                </div>
              )}
            </SectionShell>

            <SectionShell title="Final Result Timeline" icon={FileCheck2} iconColor="text-primary-300">
              {finalResults.length === 0 ? (
                <EmptyState
                  icon={FileCheck2}
                  title="No final result records yet"
                  description="Once a university course begins moving through the marks workflow, you'll be able to track it here."
                  isCompact
                />
              ) : (
                <div className="grid gap-5 xl:grid-cols-2">
                  {finalResults.map((item) => (
                    <ResultCard key={`result-${item.courseId}`} item={item} navigate={navigate} />
                  ))}
                </div>
              )}
            </SectionShell>

            <SectionShell title="Completed Course Milestones" icon={GraduationCap} iconColor="text-amber-300">
              {completedCourses.length === 0 ? (
                <EmptyState
                  icon={GraduationCap}
                  title="No completed courses yet"
                  description="Finish your first course and it will show up here as part of your personal learning record."
                  isCompact
                />
              ) : (
                <div className="grid gap-5 xl:grid-cols-2">
                  {completedCourses.map((course) => (
                    <MilestoneCard key={`milestone-${course.id}`} course={course} navigate={navigate} />
                  ))}
                </div>
              )}
            </SectionShell>
          </>
        )}
      </div>
    </StudentLayout>
  );
}
