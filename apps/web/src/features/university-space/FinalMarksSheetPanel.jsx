import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Lock,
  RefreshCw,
  Save,
  Send,
} from 'lucide-react';
import {
  getInstructorFinalMarksSheet,
  saveInstructorFinalMarksSheet,
  submitInstructorFinalMarksSheet,
} from '../../api/marksApi';

const STATUS_STYLES = {
  DRAFT: 'bg-slate-500/10 border-slate-500/20 text-slate-300',
  SUBMITTED: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
  RETURNED: 'bg-red-500/10 border-red-500/20 text-red-300',
  APPROVED: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
};

const gradeColor = (grade) => ({
  S: 'text-emerald-400',
  A: 'text-emerald-400',
  B: 'text-indigo-400',
  C: 'text-amber-400',
  D: 'text-orange-400',
  F: 'text-red-400',
}[grade] || 'text-text-muted');

const toInput = (value) => (value === null || value === undefined ? '' : String(value));

const toNullableNumber = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

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
  const values = [
    toNullableNumber(draft.projectWorkScore),
    toNullableNumber(draft.vivaScore),
    toNullableNumber(draft.internalModerationScore),
  ].filter((value) => value !== null);

  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
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
    return { totalStudents: 0, passCount: 0, failCount: 0, classAverage: 0, highestScore: 0, lowestScore: 0 };
  }

  const scores = rows.map((row) => row.finalScore || 0);
  const passCount = rows.filter((row) => row.passed).length;
  const total = scores.reduce((sum, score) => sum + score, 0);

  return {
    totalStudents: rows.length,
    passCount,
    failCount: rows.length - passCount,
    classAverage: Number((total / rows.length).toFixed(2)),
    highestScore: Number(Math.max(...scores).toFixed(2)),
    lowestScore: Number(Math.min(...scores).toFixed(2)),
  };
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider ${STATUS_STYLES[status] || STATUS_STYLES.DRAFT}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
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

  const fetchSheet = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError('');
    try {
      const response = await getInstructorFinalMarksSheet(courseId);
      setSheet(response.data);
      setDraftRows(buildDraftState(response.data?.rows || []));
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
        ...(current[studentId] || {
          projectWorkScore: '',
          vivaScore: '',
          internalModerationScore: '',
          adjustmentScore: '',
          instructorRemarks: '',
        }),
        [field]: value,
      },
    }));
    setDirty(true);
    setNotice('');
  };

  const locked = sheet?.locked;
  const previewRows = (sheet?.rows || []).map((row) =>
    locked ? row : computePreviewRow(row, draftRows[row.studentId] || buildDraftState([row])[row.studentId], sheet)
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
      const project = toNullableNumber(draft.projectWorkScore);
      const viva = toNullableNumber(draft.vivaScore);
      const moderation = toNullableNumber(draft.internalModerationScore);
      const adjustment = toNullableNumber(draft.adjustmentScore);

      for (const value of [project, viva, moderation]) {
        if (value !== null && (value < 0 || value > 100)) {
          return 'Project, viva, and moderation scores must stay between 0 and 100.';
        }
      }

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
      const response = await saveInstructorFinalMarksSheet(courseId, buildPayload());
      setSheet(response.data);
      setDraftRows(buildDraftState(response.data?.rows || []));
      setDirty(false);
      setNotice('Draft saved.');
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save final marks sheet.');
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

      const response = await submitInstructorFinalMarksSheet(courseId);
      setSheet(response.data);
      setDraftRows(buildDraftState(response.data?.rows || []));
      setDirty(false);
      setNotice('Final marks sheet submitted to university admin.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit final marks sheet.');
    } finally {
      setSubmitting(false);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 text-primary-400 animate-spin" />
          <span className="text-xs text-text-muted">Loading final marks sheet...</span>
        </div>
      </div>
    );
  }

  if (!sheet) {
    return (
      <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
        <p className="text-sm text-red-300">{error || 'Final marks sheet is unavailable right now.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-text-primary">Final Marks Sheet</h3>
            <StatusBadge status={sheet.status} />
          </div>
          <p className="text-xs text-text-muted max-w-2xl leading-relaxed">
            Project, viva, and moderation are averaged into the course project bucket. Adjustment is applied after late penalties, and submit will freeze the sheet for uni-admin review.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fetchSheet(false)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-border-subtle text-text-muted hover:border-border-strong hover:text-text-secondary transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
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
              <Lock className="w-3.5 h-3.5" />
              Read only
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Students', value: previewSummary?.totalStudents ?? 0, color: 'text-primary-300', bg: 'bg-primary-500/10 border-primary-500/20' },
          { label: 'Average', value: `${previewSummary?.classAverage ?? 0}%`, color: 'text-indigo-300', bg: 'bg-indigo-500/10 border-indigo-500/20' },
          { label: 'Pass', value: previewSummary?.passCount ?? 0, color: 'text-emerald-300', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Fail', value: previewSummary?.failCount ?? 0, color: 'text-red-300', bg: 'bg-red-500/10 border-red-500/20' },
          { label: 'High / Low', value: `${previewSummary?.highestScore ?? 0} / ${previewSummary?.lowestScore ?? 0}`, color: 'text-amber-300', bg: 'bg-amber-500/10 border-amber-500/20' },
        ].map((card) => (
          <div key={card.label} className={`p-4 rounded-2xl border ${card.bg}`}>
            <div className={`text-2xl font-bold font-syne ${card.color}`}>{card.value}</div>
            <div className={`text-[11px] font-semibold mt-1 ${card.color} opacity-70 uppercase tracking-wider`}>{card.label}</div>
          </div>
        ))}
      </div>

      {(sheet.returnReason || notice || error || sheet.approvedAt || sheet.submittedAt) && (
        <div className="space-y-3">
          {sheet.returnReason && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-red-300">Returned For Correction</div>
                <div className="text-xs text-red-200/80 mt-1 leading-relaxed">{sheet.returnReason}</div>
              </div>
            </div>
          )}
          {sheet.approvedAt && (
            <div className="flex items-start gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-200/90 leading-relaxed">
                Approved on {new Date(sheet.approvedAt).toLocaleString('en-IN')}
                {sheet.approvedByName ? ` by ${sheet.approvedByName}.` : '.'}
              </div>
            </div>
          )}
          {!sheet.approvedAt && sheet.submittedAt && (
            <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-200/90 leading-relaxed">
                Submitted on {new Date(sheet.submittedAt).toLocaleString('en-IN')}. The sheet is frozen until uni-admin approves it or returns it for corrections.
              </div>
            </div>
          )}
          {notice && (
            <div className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-xl">
              {notice}
            </div>
          )}
          {error && (
            <div className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-border-subtle bg-bg-surface">
        <table className="w-full min-w-[1320px]">
          <thead className="bg-bg-elevated/80 border-b border-border-subtle">
            <tr>
              {['Student', 'Branch / Section', 'Attendance', 'Tests', 'Live Tests', 'Project', 'Viva', 'Moderation', 'Project Bucket', 'Penalty', 'Adjustment', 'Final', 'Grade', 'Remarks'].map((label) => (
                <th key={label} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-text-muted whitespace-nowrap">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row) => {
              const draft = draftRows[row.studentId] || {};
              return (
                <tr key={row.studentId} className="border-b border-border-subtle last:border-b-0 align-top">
                  <td className="px-4 py-4">
                    <div className="text-sm font-bold text-text-primary">{row.studentName}</div>
                    <div className="text-xs text-text-muted mt-1">{row.rollNumber || 'No roll number'}</div>
                  </td>
                  <td className="px-4 py-4 text-xs text-text-secondary whitespace-nowrap">
                    <div>{row.branchName || '-'}</div>
                    <div className="text-text-muted mt-1">{row.sectionName || '-'}</div>
                  </td>
                  <td className="px-4 py-4 text-sm text-text-secondary">{row.attendanceScore?.toFixed(1)}%</td>
                  <td className="px-4 py-4 text-sm text-text-secondary">{row.testsScore?.toFixed(1)}%</td>
                  <td className="px-4 py-4 text-sm text-text-secondary">{row.liveTestsScore?.toFixed(1)}%</td>
                  {[
                    { key: 'projectWorkScore', min: 0, max: 100 },
                    { key: 'vivaScore', min: 0, max: 100 },
                    { key: 'internalModerationScore', min: 0, max: 100 },
                  ].map((field) => (
                    <td key={field.key} className="px-4 py-4">
                      <input
                        type="number"
                        min={field.min}
                        max={field.max}
                        step="0.1"
                        value={locked ? toInput(row[field.key]) : (draft[field.key] ?? '')}
                        onChange={(event) => updateCell(row.studentId, field.key, event.target.value)}
                        disabled={locked}
                        className="w-24 bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-primary-500 disabled:opacity-60"
                      />
                    </td>
                  ))}
                  <td className="px-4 py-4 text-sm font-bold text-primary-300">{row.projectScore?.toFixed(1)}</td>
                  <td className="px-4 py-4 text-sm text-red-300">-{row.latePenalty?.toFixed(1)}</td>
                  <td className="px-4 py-4">
                    <input
                      type="number"
                      min={-20}
                      max={20}
                      step="0.1"
                      value={locked ? toInput(row.adjustmentScore) : (draft.adjustmentScore ?? '')}
                      onChange={(event) => updateCell(row.studentId, 'adjustmentScore', event.target.value)}
                      disabled={locked}
                      className="w-24 bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-primary-500 disabled:opacity-60"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className={`text-base font-bold font-syne ${gradeColor(row.grade)}`}>{row.finalScore?.toFixed(1)}</div>
                    <div className="text-[10px] text-text-muted mt-1">/ 100</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-sm font-bold ${gradeColor(row.grade)}`}>{row.grade}</span>
                  </td>
                  <td className="px-4 py-4">
                    <textarea
                      rows={2}
                      value={locked ? (row.instructorRemarks || '') : (draft.instructorRemarks ?? '')}
                      onChange={(event) => updateCell(row.studentId, 'instructorRemarks', event.target.value)}
                      disabled={locked}
                      placeholder="Optional remarks"
                      className="w-56 bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary outline-none focus:border-primary-500 resize-none disabled:opacity-60"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FinalMarksSheetPanel;
