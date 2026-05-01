import { aiApi } from '../../api/aiApi';
import Modal from '../../components/ui/Modal';
import { useEffect, useState } from 'react';
import {
  AlertTriangle, CheckCircle2, FileSpreadsheet, Loader2, Lock,
  RefreshCw, Save, Send, Sparkles, ChevronDown, ChevronUp,
  Users, TrendingUp, X, BarChart2,
} from 'lucide-react';
import {
  getInstructorFinalMarksSheet,
  saveInstructorFinalMarksSheet,
  submitInstructorFinalMarksSheet,
} from '../../api/marksApi';

/* ─── pure helpers (unchanged logic) ─────────────────────── */

const STATUS_STYLES = {
  DRAFT: 'bg-slate-500/10 border-slate-500/20 text-slate-300',
  SUBMITTED: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
  RETURNED: 'bg-red-500/10 border-red-500/20 text-red-300',
  APPROVED: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
};

const gradeColor = (grade) =>
  ({ S: 'text-emerald-400', A: 'text-emerald-400', B: 'text-indigo-400', C: 'text-amber-400', D: 'text-orange-400', F: 'text-red-400' }[grade] || 'text-text-muted');

const toInput = (v) => (v === null || v === undefined ? '' : String(v));
const toNullableNumber = (v) => {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const toGrade = (score) => {
  if (score >= 90) return 'S';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
};

const buildDraftState = (rows = []) =>
  rows.reduce((acc, row) => {
    acc[row.studentId] = {
      projectWorkScore: toInput(row.projectWorkScore),
      vivaScore: toInput(row.vivaScore),
      internalModerationScore: toInput(row.internalModerationScore),
      adjustmentScore: toInput(row.adjustmentScore),
      instructorRemarks: row.instructorRemarks || '',
    };
    return acc;
  }, {});

const computeProjectBucket = (draft) => {
  const vals = [
    toNullableNumber(draft.projectWorkScore),
    toNullableNumber(draft.vivaScore),
    toNullableNumber(draft.internalModerationScore),
  ].filter((v) => v !== null);
  if (!vals.length) return 0;
  return vals.reduce((s, v) => s + v, 0) / vals.length;
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
  if (!rows.length) return { totalStudents: 0, passCount: 0, failCount: 0, classAverage: 0, highestScore: 0, lowestScore: 0 };
  const scores = rows.map((r) => r.finalScore || 0);
  const passCount = rows.filter((r) => r.passed).length;
  const total = scores.reduce((s, v) => s + v, 0);
  return {
    totalStudents: rows.length,
    passCount,
    failCount: rows.length - passCount,
    classAverage: Number((total / rows.length).toFixed(2)),
    highestScore: Number(Math.max(...scores).toFixed(2)),
    lowestScore: Number(Math.min(...scores).toFixed(2)),
  };
};

/* ─── sub-components ──────────────────────────────────────── */

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider ${STATUS_STYLES[status] || STATUS_STYLES.DRAFT}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 animate-pulse" />
      {status}
    </span>
  );
}

function ScoreBar({ value, max = 100, color = '#6366f1' }) {
  const pct = Math.min(100, Math.max(0, ((value ?? 0) / max) * 100));
  return (
    <div className="w-full h-1 bg-bg-elevated rounded-full overflow-hidden mt-1">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function ReadonlyScore({ label, value, color }) {
  return (
    <div>
      <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">{label}</div>
      <div className="text-sm font-bold" style={{ color }}>{value?.toFixed(1) ?? '—'}%</div>
      <ScoreBar value={value} color={color} />
    </div>
  );
}

function EditableInput({ label, value, onChange, disabled, min = 0, max = 100, step = '0.1', hint }) {
  return (
    <div>
      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">
        {label}
        {hint && <span className="ml-1 normal-case opacity-60 font-normal">({hint})</span>}
      </label>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="—"
        className="w-full h-9 bg-bg-deep border border-border-subtle rounded-xl px-3 text-sm text-text-primary outline-none focus:border-primary-500/60 focus:ring-1 focus:ring-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all placeholder:text-text-muted/40 font-mono"
      />
    </div>
  );
}

/* per-student card */
function StudentMarkCard({ row, draft, locked, onUpdate, index }) {
  const [open, setOpen] = useState(false);

  const gc = gradeColor(row.grade);
  const isPassing = row.passed;

  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-200 ${open ? 'border-primary-500/25 shadow-lg shadow-primary-500/5' : 'border-border-subtle hover:border-border-default'
      } bg-bg-surface`}>

      {/* ── collapsed row ── */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer select-none"
        onClick={() => setOpen((v) => !v)}
      >
        {/* rank / avatar */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${open ? 'bg-primary-500/20 text-primary-400' : 'bg-bg-elevated text-text-muted'
          }`}>
          {index + 1}
        </div>

        {/* name + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-text-primary">{row.studentName}</span>
            {row.rollNumber && <span className="text-[10px] text-text-muted font-mono">{row.rollNumber}</span>}
            {row.branchName && <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-bg-elevated text-text-muted border border-border-subtle">{row.branchName} · {row.sectionName}</span>}
          </div>
          {/* mini score bar */}
          <div className="flex items-center gap-3 mt-2">
            {[
              { label: 'Att', val: row.attendanceScore, color: '#4ECDC4' },
              { label: 'Tests', val: row.testsScore, color: '#6C7FD8' },
              { label: 'Live', val: row.liveTestsScore, color: '#F7B731' },
              { label: 'Project', val: row.projectScore, color: '#FC5C7D' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-1">
                <span className="text-[10px] text-text-muted">{s.label}</span>
                <span className="text-[10px] font-bold" style={{ color: s.color }}>{s.val?.toFixed(0) ?? '—'}</span>
              </div>
            ))}
            {row.latePenalty > 0 && (
              <span className="text-[10px] font-bold text-red-400">-{row.latePenalty?.toFixed(1)} penalty</span>
            )}
          </div>
        </div>

        {/* final score + grade */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right hidden sm:block">
            <div className={`text-xl font-bold font-display ${gc}`}>{row.finalScore?.toFixed(1)}</div>
            <div className="text-[10px] text-text-muted">/ 100</div>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base font-display border ${isPassing ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
            {row.grade}
          </div>
          <div className={`w-6 h-6 flex items-center justify-center text-text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ── expanded detail ── */}
      {open && (
        <div className="border-t border-border-subtle/60 p-5">
          <div className="grid gap-5 lg:grid-cols-2">

            {/* LEFT — auto-computed scores */}
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Auto-Computed Scores</p>
              <div className="grid grid-cols-2 gap-4 p-4 bg-bg-elevated/40 rounded-2xl border border-border-subtle/60">
                <ReadonlyScore label="Attendance" value={row.attendanceScore} color="#4ECDC4" />
                <ReadonlyScore label="Chapter Tests" value={row.testsScore} color="#6C7FD8" />
                <ReadonlyScore label="Live Tests" value={row.liveTestsScore} color="#F7B731" />
                <ReadonlyScore label="Project Bucket" value={row.projectScore} color="#FC5C7D" />
              </div>

              {/* weighted breakdown */}
              <div className="p-4 bg-bg-elevated/30 rounded-2xl border border-border-subtle/50 space-y-2">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Weighted Breakdown</p>
                {[
                  { label: 'Attendance weighted', val: row.attendanceWeighted, color: '#4ECDC4' },
                  { label: 'Tests weighted', val: row.testsWeighted, color: '#6C7FD8' },
                  { label: 'Live Tests weighted', val: row.liveTestsWeighted, color: '#F7B731' },
                  { label: 'Project weighted', val: row.projectWeighted, color: '#FC5C7D' },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary">{s.label}</span>
                    <span className="text-xs font-bold" style={{ color: s.color }}>+{s.val?.toFixed(2) ?? '0.00'}</span>
                  </div>
                ))}
                {row.latePenalty > 0 && (
                  <div className="flex items-center justify-between border-t border-border-subtle/50 pt-2 mt-2">
                    <span className="text-xs text-red-400">Late penalty</span>
                    <span className="text-xs font-bold text-red-400">-{row.latePenalty?.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-border-subtle/50 pt-2 mt-2">
                  <span className="text-xs font-bold text-text-primary">Final Score</span>
                  <span className={`text-sm font-bold font-display ${gc}`}>{row.finalScore?.toFixed(2)} / 100</span>
                </div>
              </div>
            </div>

            {/* RIGHT — instructor inputs */}
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Instructor Evaluation</p>

              <div className="grid grid-cols-3 gap-3">
                <EditableInput
                  label="Project Work"
                  hint="0–100"
                  value={locked ? toInput(row.projectWorkScore) : (draft.projectWorkScore ?? '')}
                  onChange={(v) => onUpdate('projectWorkScore', v)}
                  disabled={locked}
                />
                <EditableInput
                  label="Viva"
                  hint="0–100"
                  value={locked ? toInput(row.vivaScore) : (draft.vivaScore ?? '')}
                  onChange={(v) => onUpdate('vivaScore', v)}
                  disabled={locked}
                />
                <EditableInput
                  label="Moderation"
                  hint="0–100"
                  value={locked ? toInput(row.internalModerationScore) : (draft.internalModerationScore ?? '')}
                  onChange={(v) => onUpdate('internalModerationScore', v)}
                  disabled={locked}
                />
              </div>

              <EditableInput
                label="Adjustment"
                hint="-20 to +20"
                value={locked ? toInput(row.adjustmentScore) : (draft.adjustmentScore ?? '')}
                onChange={(v) => onUpdate('adjustmentScore', v)}
                disabled={locked}
                min={-20}
                max={20}
              />

              {/* project bucket live preview */}
              {!locked && (
                <div className="flex items-center justify-between p-3 bg-primary-500/6 border border-primary-500/15 rounded-xl">
                  <span className="text-xs text-primary-300">Project bucket avg</span>
                  <span className="text-sm font-bold text-primary-300 font-display">
                    {computeProjectBucket(draft).toFixed(2)}
                  </span>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-1.5">Instructor Remarks</label>
                <textarea
                  rows={3}
                  value={locked ? (row.instructorRemarks || '') : (draft.instructorRemarks ?? '')}
                  onChange={(e) => onUpdate('instructorRemarks', e.target.value)}
                  disabled={locked}
                  placeholder="Optional remarks for this student…"
                  className="w-full bg-bg-deep border border-border-subtle rounded-xl px-3 py-2.5 text-xs text-text-primary placeholder:text-text-muted/40 outline-none focus:border-primary-500/60 focus:ring-1 focus:ring-primary-500/20 disabled:opacity-50 resize-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── main panel ──────────────────────────────────────────── */

function FinalMarksSheetPanel({ courseId }) {
  const [sheet, setSheet] = useState(null);
  const [draftRows, setDraftRows] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [showAiModal, setShowAiModal] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);

  /* fetch */
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

  useEffect(() => { if (courseId) fetchSheet(); }, [courseId]);

  /* cell update */
  const updateCell = (studentId, field, value) => {
    setDraftRows((cur) => ({
      ...cur,
      [studentId]: {
        ...(cur[studentId] || buildDraftState([{ studentId }])[studentId] || {}),
        [field]: value,
      },
    }));
    setDirty(true);
    setNotice('');
  };

  /* derived */
  const locked = sheet?.locked;
  const previewRows = (sheet?.rows || []).map((row) =>
    locked ? row : computePreviewRow(row, draftRows[row.studentId] || buildDraftState([row])[row.studentId], sheet),
  );
  const previewSummary = locked ? sheet?.summary : summariseRows(previewRows);

  /* payload */
  const buildPayload = () =>
    (sheet?.rows || []).map((row) => {
      const d = draftRows[row.studentId] || {};
      return {
        studentId: row.studentId,
        projectWorkScore: toNullableNumber(d.projectWorkScore),
        vivaScore: toNullableNumber(d.vivaScore),
        internalModerationScore: toNullableNumber(d.internalModerationScore),
        adjustmentScore: toNullableNumber(d.adjustmentScore),
        instructorRemarks: (d.instructorRemarks || '').trim() || null,
      };
    });

  /* validation */
  const validateDrafts = () => {
    for (const row of sheet?.rows || []) {
      const d = draftRows[row.studentId] || {};
      for (const v of [toNullableNumber(d.projectWorkScore), toNullableNumber(d.vivaScore), toNullableNumber(d.internalModerationScore)]) {
        if (v !== null && (v < 0 || v > 100)) return 'Project, viva, and moderation scores must stay between 0 and 100.';
      }
      const adj = toNullableNumber(d.adjustmentScore);
      if (adj !== null && (adj < -20 || adj > 20)) return 'Adjustment must stay between -20 and 20.';
    }
    return '';
  };

  /* save */
  const persistDraft = async () => {
    const ve = validateDrafts();
    if (ve) { setError(ve); return null; }
    setSaving(true); setError('');
    try {
      const res = await saveInstructorFinalMarksSheet(courseId, buildPayload());
      setSheet(res.data);
      setDraftRows(buildDraftState(res.data?.rows || []));
      setDirty(false);
      setNotice('Draft saved.');
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save final marks sheet.');
      return null;
    } finally {
      setSaving(false);
    }
  };

  /* submit */
  const handleSubmit = async () => {
    const ve = validateDrafts();
    if (ve) { setError(ve); return; }
    setSubmitting(true); setError(''); setNotice('');
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
      setError(err.response?.data?.message || 'Failed to submit final marks sheet.');
    } finally {
      setSubmitting(false); setSaving(false);
    }
  };

  /* AI */
  const handleAnalyzePerformance = async () => {
    setIsAiAnalyzing(true);
    try {
      const ctx = {
        summary: locked ? sheet?.summary : summariseRows(previewRows),
        students: previewRows.map((r) => ({
          studentName: r.studentName,
          attendance: r.attendanceScore,
          tests: r.testsScore,
          liveTests: r.liveTestsScore,
          projectScore: r.projectScore,
          finalScore: r.finalScore,
          grade: r.grade,
        })),
      };
      const result = await aiApi.analyzePerformance(
        'Analyze the class performance, highlight trends, outliers, and areas of improvement.',
        JSON.stringify(ctx),
      );
      setAiAnalysis(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze performance with AI.');
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  /* ── loading ── */
  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-7 h-7 text-primary-400 animate-spin" />
        <span className="text-xs text-text-muted">Loading final marks sheet…</span>
      </div>
    </div>
  );

  if (!sheet) return (
    <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
      <p className="text-sm text-red-300">{error || 'Final marks sheet is unavailable right now.'}</p>
    </div>
  );

  /* ── render ── */
  return (
    <div className="space-y-5">

      {/* ── header ── */}
      <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface p-5">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/4 to-transparent pointer-events-none" />
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-text-primary">Final Marks Sheet</h3>
              <StatusBadge status={sheet.status} />
              {dirty && !locked && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold animate-pulse">
                  Unsaved changes
                </span>
              )}
            </div>
            <p className="text-xs text-text-muted max-w-xl leading-relaxed">
              Project, viva, and moderation are averaged into the course project bucket. Adjustment is applied after late penalties. Submit freezes the sheet for uni-admin review.
            </p>
          </div>

          {/* action toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => { setShowAiModal(true); handleAnalyzePerformance(); }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />AI Analysis
            </button>
            <button
              onClick={() => fetchSheet(false)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-border-subtle text-text-muted hover:border-border-default hover:text-text-secondary transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />Refresh
            </button>
            {!locked && (
              <>
                <button
                  onClick={persistDraft}
                  disabled={saving || submitting || !dirty}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border border-primary-500/20 bg-primary-500/10 text-primary-300 hover:bg-primary-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Draft
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving || submitting || !sheet.rows?.length}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Submit
                </button>
              </>
            )}
            {locked && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                <Lock className="w-3.5 h-3.5" />Read only
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── summary stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Students', value: previewSummary?.totalStudents ?? 0, color: 'text-primary-300', bg: 'bg-primary-500/8 border-primary-500/20' },
          { label: 'Average', value: `${previewSummary?.classAverage ?? 0}%`, color: 'text-indigo-300', bg: 'bg-indigo-500/8 border-indigo-500/20' },
          { label: 'Pass', value: previewSummary?.passCount ?? 0, color: 'text-emerald-300', bg: 'bg-emerald-500/8 border-emerald-500/20' },
          { label: 'Fail', value: previewSummary?.failCount ?? 0, color: 'text-red-300', bg: 'bg-red-500/8 border-red-500/20' },
          { label: 'High / Low', value: `${previewSummary?.highestScore ?? 0} / ${previewSummary?.lowestScore ?? 0}`, color: 'text-amber-300', bg: 'bg-amber-500/8 border-amber-500/20' },
        ].map((card) => (
          <div key={card.label} className={`p-4 rounded-2xl border ${card.bg}`}>
            <div className={`text-2xl font-bold font-display ${card.color}`}>{card.value}</div>
            <div className={`text-[11px] font-semibold mt-1 ${card.color} opacity-70 uppercase tracking-wider`}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* ── status notices ── */}
      {(sheet.returnReason || notice || error || sheet.approvedAt || sheet.submittedAt) && (
        <div className="space-y-2">
          {sheet.returnReason && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-red-300 mb-1">Returned For Correction</div>
                <div className="text-xs text-red-200/80 leading-relaxed">{sheet.returnReason}</div>
              </div>
            </div>
          )}
          {sheet.approvedAt && (
            <div className="flex items-start gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-200/90 leading-relaxed">
                Approved on {new Date(sheet.approvedAt).toLocaleString('en-IN')}{sheet.approvedByName ? ` by ${sheet.approvedByName}` : ''}.
              </div>
            </div>
          )}
          {!sheet.approvedAt && sheet.submittedAt && (
            <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-200/90 leading-relaxed">
                Submitted on {new Date(sheet.submittedAt).toLocaleString('en-IN')}. Sheet is frozen until uni-admin approves or returns it.
              </div>
            </div>
          )}
          {notice && <div className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-xl">{notice}</div>}
          {error && <div className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl">{error}</div>}
        </div>
      )}

      {/* ── per-student cards ── */}
      {previewRows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border-subtle rounded-2xl">
          <Users className="w-10 h-10 text-text-muted mb-3 opacity-30" />
          <p className="text-text-secondary text-sm font-bold mb-1">No students enrolled</p>
          <p className="text-text-muted text-xs">Students will appear here once the course is allocated to a section.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-text-muted" />
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              {previewRows.length} Students — click any row to expand and evaluate
            </span>
          </div>
          {previewRows.map((row, i) => (
            <StudentMarkCard
              key={row.studentId}
              row={row}
              draft={draftRows[row.studentId] || {}}
              locked={locked}
              index={i}
              onUpdate={(field, value) => updateCell(row.studentId, field, value)}
            />
          ))}
        </div>
      )}

      {/* ── AI modal ── */}
      <Modal open={showAiModal} onClose={() => setShowAiModal(false)} title="AI Class Performance Analysis">
        <div className="space-y-4">
          <p className="text-text-secondary text-sm">
            AI-generated analysis of the overall class performance based on attendance, tests, and project scores.
          </p>
          <div className="p-4 bg-bg-elevated/50 border border-border-subtle rounded-xl min-h-[200px]">
            {isAiAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3 text-amber-400">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-sm font-medium">Analyzing class data…</span>
              </div>
            ) : aiAnalysis ? (
              <div className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">{aiAnalysis}</div>
            ) : (
              <div className="text-sm text-text-muted italic">No analysis available.</div>
            )}
          </div>
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setShowAiModal(false)}
              className="px-5 py-2 rounded-xl bg-bg-elevated border border-border-subtle text-text-primary text-sm font-medium hover:border-border-default transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default FinalMarksSheetPanel;