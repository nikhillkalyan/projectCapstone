import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  BadgeCheck,
  BookOpenCheck,
  ClipboardCheck,
  Clock3,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import InstructorLayout from '../../components/layout/v2/InstructorLayout';
import SectionShell from '../../components/shared/SectionShell';
import EmptyState from '../../components/shared/EmptyState';
import { getMyUniversityCourses } from '../../api/courseApi';
import { getInstructorFinalMarksSheet } from '../../api/marksApi';

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '-';

const getCourseApprovalTone = (status) => {
  switch (status) {
    case 'APPROVED':
      return 'border-success-400/20 bg-success-500/10 text-success-300';
    case 'REJECTED':
      return 'border-error-400/20 bg-error-500/10 text-error-300';
    default:
      return 'border-warning-400/20 bg-warning-500/10 text-warning-300';
  }
};

const getMarksTone = (status) => {
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

function TonePill({ children, tone }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.2em] ${tone}`}>
      {children}
    </span>
  );
}

function SourcePill() {
  return (
    <span className="inline-flex items-center rounded-full border border-primary-400/20 bg-primary-500/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-primary-300">
      University Workflow
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

function HistoryCard({ item, navigate }) {
  const sheet = item.sheet;
  const summary = sheet?.summary;

  return (
    <div className="glass rounded-2xl border border-border-subtle p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <TonePill tone={getCourseApprovalTone(item.approvalStatus)}>{item.approvalStatus}</TonePill>
            <TonePill tone={getMarksTone(sheet?.status || 'DRAFT')}>{sheet?.status || 'DRAFT'}</TonePill>
            <SourcePill />
          </div>
          <h3 className="text-lg font-bold text-text-primary">{item.title}</h3>
          <p className="mt-1 text-sm text-text-secondary">
            {item.targetBranchName || '-'} {item.targetYear ? `- ${item.targetYear}` : ''} - {item.universityName || 'University'}
          </p>
        </div>
        <div className="rounded-2xl bg-primary-500/10 p-3 text-primary-300">
          <ClipboardCheck className="h-5 w-5" />
        </div>
      </div>

      <div className="grid gap-3 text-sm text-text-secondary sm:grid-cols-4">
        <div>
          <div className="text-[0.72rem] uppercase tracking-[0.2em] text-text-secondary/70">Students</div>
          <div className="mt-1 text-base font-bold text-text-primary">{summary?.totalStudents ?? 0}</div>
        </div>
        <div>
          <div className="text-[0.72rem] uppercase tracking-[0.2em] text-text-secondary/70">Average</div>
          <div className="mt-1 text-base font-bold text-text-primary">
            {typeof summary?.classAverage === 'number' ? `${summary.classAverage.toFixed(1)}%` : '-'}
          </div>
        </div>
        <div>
          <div className="text-[0.72rem] uppercase tracking-[0.2em] text-text-secondary/70">Submitted</div>
          <div className="mt-1 text-base font-bold text-text-primary">{formatDate(sheet?.submittedAt)}</div>
        </div>
        <div>
          <div className="text-[0.72rem] uppercase tracking-[0.2em] text-text-secondary/70">Approved</div>
          <div className="mt-1 text-base font-bold text-text-primary">{formatDate(sheet?.approvedAt)}</div>
        </div>
      </div>

      {item.rejectionReason ? (
        <div className="mt-4 rounded-2xl border border-error-400/20 bg-error-500/10 px-4 py-3 text-sm text-error-200">
          <span className="font-semibold text-error-300">Course review note:</span> {item.rejectionReason}
        </div>
      ) : null}

      {sheet?.returnReason ? (
        <div className="mt-4 rounded-2xl border border-warning-400/20 bg-warning-500/10 px-4 py-3 text-sm text-warning-100">
          <span className="font-semibold text-warning-300">Marks sheet returned:</span> {sheet.returnReason}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <ActionButton onClick={() => navigate(`/instructor/course/${item.id}`)}>
          Manage Course
        </ActionButton>
        <ActionButton variant="secondary" onClick={() => navigate(`/instructor/students/${item.id}`)}>
          View Students
        </ActionButton>
      </div>
    </div>
  );
}

export default function InstructorHistory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [records, setRecords] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const fetchHistory = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await getMyUniversityCourses();
        const courses = response.data || [];

        const historyRecords = await Promise.all(
          courses.map(async (course) => {
            const sheetResponse = await getInstructorFinalMarksSheet(course.id).catch(() => null);
            return {
              ...course,
              sheet: sheetResponse?.data || null,
            };
          })
        );

        if (cancelled) {
          return;
        }

        setRecords(
          historyRecords.sort((left, right) => {
            const leftTime = left.sheet?.approvedAt || left.sheet?.submittedAt || left.createdAt || '';
            const rightTime = right.sheet?.approvedAt || right.sheet?.submittedAt || right.createdAt || '';
            return new Date(rightTime || 0) - new Date(leftTime || 0);
          })
        );
      } catch (fetchError) {
        console.error('Failed to load instructor history', fetchError);
        if (!cancelled) {
          setError('Failed to load instructor history right now.');
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

  const pendingCourseReview = useMemo(
    () => records.filter((item) => item.approvalStatus === 'PENDING' || item.approvalStatus === 'REJECTED'),
    [records]
  );

  const awaitingMarksReview = useMemo(
    () => records.filter((item) => item.approvalStatus === 'APPROVED' && item.sheet?.status === 'SUBMITTED'),
    [records]
  );

  const approvedHistory = useMemo(
    () => records.filter((item) => item.sheet?.status === 'APPROVED'),
    [records]
  );

  const needsAttention = useMemo(
    () => records.filter((item) =>
      item.approvalStatus === 'REJECTED' ||
      item.sheet?.status === 'RETURNED' ||
      (item.approvalStatus === 'APPROVED' && item.sheet?.status === 'DRAFT')
    ),
    [records]
  );

  if (loading) {
    return (
      <InstructorLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary-500" />
          <p className="text-text-secondary">Loading your history...</p>
        </div>
      </InstructorLayout>
    );
  }

  return (
    <InstructorLayout>
      <div className="mx-auto w-full max-w-[1600px] pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <h1 className="heading-2 mb-2 text-gradient">History</h1>
            <p className="text-text-secondary">
              Review your university course approvals and final marks sheet journey in one place.
            </p>
          </div>
        </motion.div>

        {error ? (
          <div className="glass mb-8 rounded-2xl border border-error-400/20 bg-error-500/10 px-5 py-4 text-sm text-error-300">
            {error}
          </div>
        ) : null}

        {records.length === 0 ? (
          <EmptyState
            icon={BookOpenCheck}
            title="No university course history yet"
            description="Create or submit your first university course and the approval timeline will start appearing here."
            action={(
              <button
                onClick={() => navigate('/instructor/university')}
                className="rounded-xl bg-primary-500 px-6 py-3 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary-400 active:scale-95"
              >
                Open University Space
              </button>
            )}
          />
        ) : (
          <>
            <div className="mb-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard icon={Clock3} label="Awaiting Course Review" value={pendingCourseReview.length} tone="border-warning-400/15 bg-warning-500/8" />
              <MetricCard icon={ClipboardCheck} label="Marks In Review" value={awaitingMarksReview.length} tone="border-primary-400/15 bg-primary-500/8" />
              <MetricCard icon={BadgeCheck} label="Approved Records" value={approvedHistory.length} tone="border-success-400/15 bg-success-500/8" />
              <MetricCard icon={RotateCcw} label="Needs Attention" value={needsAttention.length} tone="border-error-400/15 bg-error-500/8" />
            </div>

            <SectionShell title="Needs Attention" icon={AlertTriangle} iconColor="text-error-300">
              {needsAttention.length === 0 ? (
                <EmptyState
                  icon={BadgeCheck}
                  title="No blockers right now"
                  description="Returned marks sheets, rejected course submissions, or drafts that still need action will appear here."
                  isCompact
                />
              ) : (
                <div className="grid gap-5 xl:grid-cols-2">
                  {needsAttention.map((item) => (
                    <HistoryCard key={`attention-${item.id}`} item={item} navigate={navigate} />
                  ))}
                </div>
              )}
            </SectionShell>

            <SectionShell title="Awaiting University Review" icon={Clock3} iconColor="text-primary-300">
              {awaitingMarksReview.length === 0 && pendingCourseReview.length === 0 ? (
                <EmptyState
                  icon={Clock3}
                  title="Nothing is waiting on admin review"
                  description="When a course or marks sheet is pending university approval, its status will show up here."
                  isCompact
                />
              ) : (
                <div className="grid gap-5 xl:grid-cols-2">
                  {[...pendingCourseReview, ...awaitingMarksReview].map((item) => (
                    <HistoryCard key={`review-${item.id}`} item={item} navigate={navigate} />
                  ))}
                </div>
              )}
            </SectionShell>

            <SectionShell title="Approved History" icon={BadgeCheck} iconColor="text-success-300">
              {approvedHistory.length === 0 ? (
                <EmptyState
                  icon={BadgeCheck}
                  title="No approved records yet"
                  description="Approved final marks sheets and stable university course records will accumulate here over time."
                  isCompact
                />
              ) : (
                <div className="grid gap-5 xl:grid-cols-2">
                  {approvedHistory.map((item) => (
                    <HistoryCard key={`approved-${item.id}`} item={item} navigate={navigate} />
                  ))}
                </div>
              )}
            </SectionShell>
          </>
        )}
      </div>
    </InstructorLayout>
  );
}
