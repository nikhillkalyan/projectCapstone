import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  FileSpreadsheet,
  Loader2,
  Lock,
  RefreshCw,
  Save,
  Send,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { aiApi } from '../../api/aiApi';
import {
  getInstructorFinalMarksSheet,
  saveInstructorFinalMarksSheet,
  submitInstructorFinalMarksSheet,
} from '../../api/marksApi';
import AIInsightPanel from '../../components/shared/AIInsightPanel';
import { FinalMarksSheetSkeleton } from '../../components/shared/Skeletons';

const STATUS_STYLES = {
  DRAFT: 'bg-slate-500/10 border-slate-500/20 text-slate-300',
  SUBMITTED: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
  RETURNED: 'bg-red-500/10 border-red-500/20 text-red-300',
  APPROVED: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
};

const gradeColor = (grade) =>
  ({ S: 'text-emerald-400', A: 'text-emerald-400', B: 'text-indigo-400', C: 'text-amber-400', D: 'text-orange-400', F: 'text-red-400' }[grade] || 'text-text-muted');

const toInput = (value) => (value === null || value === undefined ? '' : String(value));
const toNullableNumber = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const toGrade = (score) => (
  score >= 90 ? 'S' :
    score >= 80 ? 'A' :
      score >= 70 ? 'B' :
        score >= 60 ? 'C' :
          score >= 50 ? 'D' : 'F'
);

const buildDraftState = (rows = []) =>
  rows.reduce((accumulator, row) => {
    accumulator[row.studentId] = {
      projectWorkScore: toInput(row.projectWorkScore),
      vivaScore: toInput(row.vivaScore),
      internalModerationScore: toInput(row.internalModerationScore),
      adjustmentScore: toInput(row.adjustmentScore),
      instructorRemarks: row.instructorRemarks || '',
    };
    return accumulator;
  }, {});

const computeProjectBucket = (draft) => {
  const values = [
    toNullableNumber(draft.projectWorkScore),
    toNullableNumber(draft.vivaScore),
    toNullableNumber(draft.internalModerationScore),
  ].filter((value) => value !== null);

  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
};

const computePreviewRow = (row, draft, sheet) => {
  const projectBucket = computeProjectBucket(draft);
  const adjustment = toNullableNumber(draft.adjustmentScore) ?? 0;
  const projectWeighted = (projectBucket * (sheet.weightProject || 0)) / 100;
  const weightedTotal =
    (row.attendanceWeighted || 0) +
    (row.testsWeighted || 0) +
    (row.liveTestsWeighted || 0) +
    projectWeighted;
  const finalScore = clamp(weightedTotal - (row.latePenalty || 0) + adjustment, 0, 100);

  return {
    ...row,
    projectWorkScore: toNullableNumber(draft.projectWorkScore),
    vivaScore: toNullableNumber(draft.vivaScore),
    internalModerationScore: toNullableNumber(draft.internalModerationScore),
    adjustmentScore: toNullableNumber(draft.adjustmentScore),
    instructorRemarks: draft.instructorRemarks || '',
    projectScore: Number(projectBucket.toFixed(2)),
    projectWeighted: Number(projectWeighted.toFixed(2)),
    weightedTotal: Number(weightedTotal.toFixed(2)),
    finalScore: Number(finalScore.toFixed(2)),
    grade: toGrade(finalScore),
    passed: finalScore >= 50,
  };
};

const summariseRows = (rows) => {
  if (!rows.length) {
    return {
      totalStudents: 0,
      passCount: 0,
      failCount: 0,
      classAverage: 0,
      highestScore: 0,
      lowestScore: 0,
    };
  }

  const scores = rows.map((row) => row.finalScore || 0);
  const passCount = rows.filter((row) => row.passed).length;

  return {
    totalStudents: rows.length,
    passCount,
    failCount: rows.length - passCount,
    classAverage: Number((scores.reduce((sum, value) => sum + value, 0) / rows.length).toFixed(2)),
    highestScore: Number(Math.max(...scores).toFixed(2)),
    lowestScore: Number(Math.min(...scores).toFixed(2)),
  };
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${STATUS_STYLES[status] || STATUS_STYLES.DRAFT}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80 animate-pulse" />
      {status}
    </span>
  );
}

function ScoreBar({ value, max = 100, color = '#6366f1' }) {
  const percentage = Math.min(100, Math.max(0, ((value ?? 0) / max) * 100));
  return (
    <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-bg-elevated">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, background: color }} />
    </div>
  );
}

function ReadonlyScore({ label, value, color }) {
  return (
    <div>
      <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">{label}</div>
      <div className="text-sm font-bold" style={{ color }}>{value?.toFixed(1) ?? '-'}%</div>
      <ScoreBar value={value} color={color} />
    </div>
  );
}

function EditableInput({ label, value, onChange, disabled, min = 0, max = 100, step = '0.1', hint }) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-text-muted">
        {label}
        {hint && <span className="ml-1 font-normal normal-case opacity-60">({hint})</span>}
      </label>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        placeholder="-"
        className="h-9 w-full rounded-xl border border-border-subtle bg-bg-deep px-3 font-mono text-sm text-text-primary outline-none transition-all placeholder:text-text-muted/40 focus:border-primary-500/60 focus:ring-1 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}

function StudentMarkCard({ row, draft, locked, onUpdate, index }) {
  const [open, setOpen] = useState(false);
  const gradeTone = gradeColor(row.grade);
  const isPassing = row.passed;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`overflow-hidden rounded-2xl border bg-bg-surface transition-all duration-200 ${
        open ? 'border-primary-500/25 shadow-lg shadow-primary-500/5' : 'border-border-subtle hover:border-border-default'
      }`}
    >
      <div className="flex cursor-pointer select-none items-center gap-4 px-5 py-4" onClick={() => setOpen((value) => !value)}>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
          open ? 'bg-primary-500/20 text-primary-400' : 'bg-bg-elevated text-text-muted'
        }`}>
          {index + 1}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-text-primary">{row.studentName}</span>
            {row.rollNumber && <span className="font-mono text-[10px] text-text-muted">{row.rollNumber}</span>}
            {row.branchName && (
              <span className="rounded-md border border-border-subtle bg-bg-elevated px-1.5 py-0.5 text-[10px] text-text-muted">
                {row.branchName} · {row.sectionName}
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-3">
            {[
              { label: 'Att', value: row.attendanceScore, color: '#4ECDC4' },
              { label: 'Tests', value: row.testsScore, color: '#6C7FD8' },
              { label: 'Live', value: row.liveTestsScore, color: '#F7B731' },
              { label: 'Project', value: row.projectScore, color: '#FC5C7D' },
            ].map((score) => (
              <div key={score.label} className="flex items-center gap-1">
                <span className="text-[10px] text-text-muted">{score.label}</span>
                <span className="text-[10px] font-bold" style={{ color: score.color }}>
                  {score.value?.toFixed(0) ?? '-'}
                </span>
              </div>
            ))}
            {row.latePenalty > 0 && (
              <span className="text-[10px] font-bold text-red-400">-{row.latePenalty?.toFixed(1)} penalty</span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <div className="hidden text-right sm:block">
            <div className={`font-display text-xl font-bold ${gradeTone}`}>{row.finalScore?.toFixed(1)}</div>
            <div className="text-[10px] text-text-muted">/ 100</div>
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl border font-display text-base font-bold ${
            isPassing
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {row.grade}
          </div>
          <div className={`flex h-6 w-6 items-center justify-center text-text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border-subtle/60"
          >
            <div className="grid gap-5 p-5 lg:grid-cols-2">
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Auto-Computed Scores</p>
                <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border-subtle/60 bg-bg-elevated/40 p-4">
                  <ReadonlyScore label="Attendance" value={row.attendanceScore} color="#4ECDC4" />
                  <ReadonlyScore label="Chapter Tests" value={row.testsScore} color="#6C7FD8" />
                  <ReadonlyScore label="Live Tests" value={row.liveTestsScore} color="#F7B731" />
                  <ReadonlyScore label="Project Bucket" value={row.projectScore} color="#FC5C7D" />
                </div>

                <div className="space-y-2 rounded-2xl border border-border-subtle/50 bg-bg-elevated/30 p-4">
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-text-muted">Weighted Breakdown</p>
                  {[
                    { label: 'Attendance weighted', value: row.attendanceWeighted, color: '#4ECDC4' },
                    { label: 'Tests weighted', value: row.testsWeighted, color: '#6C7FD8' },
                    { label: 'Live Tests weighted', value: row.liveTestsWeighted, color: '#F7B731' },
                    { label: 'Project weighted', value: row.projectWeighted, color: '#FC5C7D' },
                  ].map((score) => (
                    <div key={score.label} className="flex items-center justify-between">
                      <span className="text-xs text-text-secondary">{score.label}</span>
                      <span className="text-xs font-bold" style={{ color: score.color }}>+{score.value?.toFixed(2) ?? '0.00'}</span>
                    </div>
                  ))}
                  {row.latePenalty > 0 && (
                    <div className="mt-2 border-t border-border-subtle/50 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-red-400">Late penalty</span>
                        <span className="text-xs font-bold text-red-400">-{row.latePenalty?.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                  <div className="mt-2 border-t border-border-subtle/50 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-text-primary">Final Score</span>
                      <span className={`font-display text-sm font-bold ${gradeTone}`}>{row.finalScore?.toFixed(2)} / 100</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Instructor Evaluation</p>
                <div className="grid grid-cols-3 gap-3">
                  <EditableInput
                    label="Project Work"
                    hint="0-100"
                    value={locked ? toInput(row.projectWorkScore) : (draft.projectWorkScore ?? '')}
                    onChange={(value) => onUpdate('projectWorkScore', value)}
                    disabled={locked}
                  />
                  <EditableInput
                    label="Viva"
                    hint="0-100"
                    value={locked ? toInput(row.vivaScore) : (draft.vivaScore ?? '')}
                    onChange={(value) => onUpdate('vivaScore', value)}
                    disabled={locked}
                  />
                  <EditableInput
                    label="Moderation"
                    hint="0-100"
                    value={locked ? toInput(row.internalModerationScore) : (draft.internalModerationScore ?? '')}
                    onChange={(value) => onUpdate('internalModerationScore', value)}
                    disabled={locked}
                  />
                </div>
                <EditableInput
                  label="Adjustment"
                  hint="-20 to +20"
                  value={locked ? toInput(row.adjustmentScore) : (draft.adjustmentScore ?? '')}
                  onChange={(value) => onUpdate('adjustmentScore', value)}
                  disabled={locked}
                  min={-20}
                  max={20}
                />
                {!locked && (
                  <div className="flex items-center justify-between rounded-xl border border-primary-500/15 bg-primary-500/6 p-3">
                    <span className="text-xs text-primary-300">Project bucket avg</span>
                    <span className="font-display text-sm font-bold text-primary-300">
                      {computeProjectBucket(draft).toFixed(2)}
                    </span>
                  </div>
                )}
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-text-muted">Instructor Remarks</label>
                  <textarea
                    rows={3}
                    value={locked ? (row.instructorRemarks || '') : (draft.instructorRemarks ?? '')}
                    onChange={(event) => onUpdate('instructorRemarks', event.target.value)}
                    disabled={locked}
                    placeholder="Optional remarks for this student..."
                    className="w-full resize-none rounded-xl border border-border-subtle bg-bg-deep px-3 py-2.5 text-xs text-text-primary outline-none transition-all placeholder:text-text-muted/40 focus:border-primary-500/60 focus:ring-1 focus:ring-primary-500/20 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function AIDrawer({ open, onClose, previewRows }) {
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const summary = summariseRows(previewRows);
  const contextStr = `${summary.totalStudents} students · avg ${summary.classAverage}% · ${summary.passCount} passing`;

  const run = useCallback(async () => {
    setLoading(true);
    setError('');
    setAiResult(null);

    try {
      const context = {
        summary,
        students: previewRows.map((row) => ({
          studentName: row.studentName,
          attendance: row.attendanceScore,
          tests: row.testsScore,
          liveTests: row.liveTestsScore,
          projectScore: row.projectScore,
          finalScore: row.finalScore,
          grade: row.grade,
        })),
      };

      const result = await aiApi.analyzePerformance(
        'Analyze the class performance, highlight trends, outliers, and areas of improvement.',
        JSON.stringify(context),
      );
      setAiResult(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze performance with AI.');
    } finally {
      setLoading(false);
    }
  }, [previewRows, summary]);

  useEffect(() => {
    if (open && !aiResult && !loading) {
      run();
    }
  }, [aiResult, loading, open, run]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col border-l border-border-subtle bg-bg-elevated shadow-2xl"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-border-subtle px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/20 to-orange-500/10">
                  <Sparkles className="h-4.5 w-4.5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-text-primary">AI Class Performance Analysis</h2>
                  <p className="mt-0.5 text-[10px] text-text-muted">{contextStr}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!loading && (
                  <button
                    onClick={run}
                    className="flex items-center gap-1.5 rounded-xl border border-border-subtle px-3 py-1.5 text-xs font-bold text-text-muted transition-all hover:border-border-default hover:text-text-secondary"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Regenerate
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-text-muted transition-all hover:bg-bg-surface hover:text-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <AIInsightPanel
                result={aiResult}
                loading={loading}
                error={error}
                onRetry={run}
                title="Class Performance"
                context={contextStr}
                variant="performance"
              />
            </div>

            <div className="shrink-0 border-t border-border-subtle px-6 py-4">
              <p className="text-center text-[10px] leading-relaxed text-text-muted">
                AI analysis is generated from live preview data. Finalize scores before submitting the sheet.
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function FinalMarksSheetPanel({ courseId }) {
  const [sheet, setSheet] = useState(null);
  const [draftRows, setDraftRows] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showAiDrawer, setShowAiDrawer] = useState(false);

  const fetchSheet = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError('');

    try {
      const res = await getInstructorFinalMarksSheet(courseId);
      setSheet(res.data);
      setDraftRows(buildDraftState(res.data?.rows || []));
      setDirty(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load final marks sheet.');
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) fetchSheet();
  }, [courseId]);

  const updateCell = (studentId, field, value) => {
    setDraftRows((current) => ({
      ...current,
      [studentId]: {
        ...(current[studentId] || {}),
        [field]: value,
      },
    }));
    setDirty(true);
    setNotice('');
  };

  const locked = sheet?.locked;
  const previewRows = (sheet?.rows || []).map((row) =>
    locked
      ? row
      : computePreviewRow(row, draftRows[row.studentId] || buildDraftState([row])[row.studentId], sheet),
  );
  const previewSummary = locked ? sheet?.summary : summariseRows(previewRows);

  const buildPayload = () =>
    (sheet?.rows || []).map((row) => {
      const draft = draftRows[row.studentId] || {};
      return {
        studentId: row.studentId,
        projectWorkScore: toNullableNumber(draft.projectWorkScore),
        vivaScore: toNullableNumber(draft.vivaScore),
        internalModerationScore: toNullableNumber(draft.internalModerationScore),
        adjustmentScore: toNullableNumber(draft.adjustmentScore),
        instructorRemarks: (draft.instructorRemarks || '').trim() || null,
      };
    });

  const validateDrafts = () => {
    for (const row of sheet?.rows || []) {
      const draft = draftRows[row.studentId] || {};
      for (const value of [
        toNullableNumber(draft.projectWorkScore),
        toNullableNumber(draft.vivaScore),
        toNullableNumber(draft.internalModerationScore),
      ]) {
        if (value !== null && (value < 0 || value > 100)) {
          return 'Project, viva, and moderation scores must stay between 0 and 100.';
        }
      }

      const adjustment = toNullableNumber(draft.adjustmentScore);
      if (adjustment !== null && (adjustment < -20 || adjustment > 20)) {
        return 'Adjustment must stay between -20 and 20.';
      }
    }

    return '';
  };

  const persistDraft = async () => {
    const validationError = validateDrafts();
    if (validationError) {
      setError(validationError);
      return null;
    }

    setSaving(true);
    setError('');

    try {
      const res = await saveInstructorFinalMarksSheet(courseId, buildPayload());
      setSheet(res.data);
      setDraftRows(buildDraftState(res.data?.rows || []));
      setDirty(false);
      setNotice('Draft saved.');
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save.');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    const validationError = validateDrafts();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError('');
    setNotice('');

    try {
      if (dirty) {
        const saved = await saveInstructorFinalMarksSheet(courseId, buildPayload());
        setSheet(saved.data);
        setDraftRows(buildDraftState(saved.data?.rows || []));
      }

      const res = await submitInstructorFinalMarksSheet(courseId);
      setSheet(res.data);
      setDraftRows(buildDraftState(res.data?.rows || []));
      setDirty(false);
      setNotice('Final marks sheet submitted to university admin.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit.');
    } finally {
      setSubmitting(false);
      setSaving(false);
    }
  };

  if (loading) return <FinalMarksSheetSkeleton />;

  if (!sheet) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
        <p className="text-sm text-red-300">{error || 'Final marks sheet is unavailable right now.'}</p>
      </div>
    );
  }

  return (
    <>
      <AIDrawer
        open={showAiDrawer}
        onClose={() => setShowAiDrawer(false)}
        previewRows={previewRows}
      />

      <div className="space-y-5">
        <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface p-5">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/4 to-transparent" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-text-primary">Final Marks Sheet</h3>
                <StatusBadge status={sheet.status} />
                {dirty && !locked && (
                  <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 animate-pulse">
                    Unsaved changes
                  </span>
                )}
              </div>
              <p className="max-w-xl text-xs leading-relaxed text-text-muted">
                Project, viva, and moderation are averaged into the course project bucket. Adjustment is applied after late penalties. Submit freezes the sheet for uni-admin review.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowAiDrawer(true)}
                className="group flex items-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-400 transition-all hover:bg-amber-500/20"
              >
                <Sparkles className="h-3.5 w-3.5 group-hover:animate-pulse" />
                AI Analysis
              </button>

              <button
                onClick={() => fetchSheet(false)}
                className="flex items-center gap-1.5 rounded-xl border border-border-subtle px-3 py-2 text-xs font-bold text-text-muted transition-all hover:border-border-default hover:text-text-secondary"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </button>

              {!locked && (
                <>
                  <button
                    onClick={persistDraft}
                    disabled={saving || submitting || !dirty}
                    className="flex items-center gap-1.5 rounded-xl border border-primary-500/20 bg-primary-500/10 px-4 py-2 text-xs font-bold text-primary-300 transition-all hover:bg-primary-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    Save Draft
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={saving || submitting || !sheet.rows?.length}
                    className="flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-300 transition-all hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    Submit
                  </button>
                </>
              )}

              {locked && (
                <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-300">
                  <Lock className="h-3.5 w-3.5" />
                  Read only
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {[
            { label: 'Students', value: previewSummary?.totalStudents ?? 0, color: 'text-primary-300', bg: 'bg-primary-500/8 border-primary-500/20' },
            { label: 'Average', value: `${previewSummary?.classAverage ?? 0}%`, color: 'text-indigo-300', bg: 'bg-indigo-500/8 border-indigo-500/20' },
            { label: 'Pass', value: previewSummary?.passCount ?? 0, color: 'text-emerald-300', bg: 'bg-emerald-500/8 border-emerald-500/20' },
            { label: 'Fail', value: previewSummary?.failCount ?? 0, color: 'text-red-300', bg: 'bg-red-500/8 border-red-500/20' },
            { label: 'High / Low', value: `${previewSummary?.highestScore ?? 0} / ${previewSummary?.lowestScore ?? 0}`, color: 'text-amber-300', bg: 'bg-amber-500/8 border-amber-500/20' },
          ].map((card) => (
            <div key={card.label} className={`rounded-2xl border p-4 ${card.bg}`}>
              <div className={`font-display text-2xl font-bold ${card.color}`}>{card.value}</div>
              <div className={`mt-1 text-[11px] font-semibold uppercase tracking-wider ${card.color} opacity-70`}>{card.label}</div>
            </div>
          ))}
        </div>

        {(sheet.returnReason || notice || error || sheet.approvedAt || sheet.submittedAt) && (
          <div className="space-y-2">
            {sheet.returnReason && (
              <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                <div>
                  <div className="mb-1 text-sm font-bold text-red-300">Returned For Correction</div>
                  <div className="text-xs leading-relaxed text-red-200/80">{sheet.returnReason}</div>
                </div>
              </div>
            )}
            {sheet.approvedAt && (
              <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <div className="text-xs leading-relaxed text-emerald-200/90">
                  Approved on {new Date(sheet.approvedAt).toLocaleString('en-IN')}
                  {sheet.approvedByName ? ` by ${sheet.approvedByName}` : ''}.
                </div>
              </div>
            )}
            {!sheet.approvedAt && sheet.submittedAt && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <div className="text-xs leading-relaxed text-amber-200/90">
                  Submitted on {new Date(sheet.submittedAt).toLocaleString('en-IN')}. Sheet is frozen until uni-admin approves or returns it.
                </div>
              </div>
            )}
            {notice && <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-300">{notice}</div>}
            {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-300">{error}</div>}
          </div>
        )}

        {previewRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-subtle py-16 text-center">
            <Users className="mb-3 h-10 w-10 text-text-muted opacity-30" />
            <p className="mb-1 text-sm font-bold text-text-secondary">No students enrolled</p>
            <p className="text-xs text-text-muted">Students will appear here once the course is allocated to a section.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="mb-1 flex items-center gap-2">
              <Users className="h-4 w-4 text-text-muted" />
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                {previewRows.length} Students - click any row to expand and evaluate
              </span>
            </div>
            {previewRows.map((row, index) => (
              <StudentMarkCard
                key={row.studentId}
                row={row}
                draft={draftRows[row.studentId] || {}}
                locked={locked}
                index={index}
                onUpdate={(field, value) => updateCell(row.studentId, field, value)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default FinalMarksSheetPanel;
