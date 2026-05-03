import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Download,
  Eye,
  FileSpreadsheet,
  Loader2,
  Printer,
  RotateCcw,
  X,
  XCircle,
} from 'lucide-react';
import '../../styles/shared.css';
import {
  approveFinalMarksSheet,
  getFinalMarksSheetDetail,
  getFinalMarksSheets,
  returnFinalMarksSheet,
} from '../../services/marksApi';

const FILTERS = ['SUBMITTED', 'RETURNED', 'APPROVED', 'ALL'];

const STATUS_CONFIG = {
  SUBMITTED: { label: 'Pending Review', cls: 'badge-pending' },
  APPROVED: { label: 'Approved', cls: 'badge-active' },
  RETURNED: { label: 'Returned', cls: 'badge-completed', style: { background: 'rgba(244, 63, 94, 0.12)', color: 'var(--error-400)' } },
  DRAFT: { label: 'Draft', cls: 'badge-completed' },
};

const fmtDateTime = (value) =>
  value ? new Date(value).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '-';

const csvValue = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const triggerDownload = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const toFileSafe = (value) => String(value || 'marks_sheet').trim().replace(/[^a-zA-Z0-9_-]+/g, '_');

const exportMarksSheetCsv = (detail) => {
  if (!detail) return;

  const rows = detail.rows || [];
  const headers = [
    'Student Name',
    'Roll Number',
    'Branch',
    'Section',
    'Attendance Score',
    'Tests Score',
    'Live Tests Score',
    'Project Bucket',
    'Late Penalty',
    'Adjustment',
    'Final Score',
    'Grade',
    'Remarks',
  ];

  const lines = [
    headers.map(csvValue).join(','),
    ...rows.map((row) => ([
      row.studentName,
      row.rollNumber,
      row.branchName,
      row.sectionName,
      row.attendanceScore,
      row.testsScore,
      row.liveTestsScore,
      row.projectScore,
      row.latePenalty,
      row.adjustmentScore,
      row.finalScore,
      row.grade,
      row.instructorRemarks,
    ].map(csvValue).join(','))),
  ];

  triggerDownload(
    new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' }),
    `${toFileSafe(detail.courseTitle)}_final_marks_sheet.csv`
  );
};

const openMarksSheetPrintView = (detail) => {
  if (!detail) return;

  const rows = detail.rows || [];
  const summary = detail.summary || {};
  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    throw new Error('Please allow popups to print the marks sheet.');
  }

  const tableRows = rows.map((row) => `
    <tr>
      <td>${row.studentName || '-'}</td>
      <td>${row.rollNumber || '-'}</td>
      <td>${row.branchName || '-'}</td>
      <td>${row.sectionName || '-'}</td>
      <td>${row.attendanceScore?.toFixed?.(1) ?? '-'}</td>
      <td>${row.testsScore?.toFixed?.(1) ?? '-'}</td>
      <td>${row.liveTestsScore?.toFixed?.(1) ?? '-'}</td>
      <td>${row.projectScore?.toFixed?.(1) ?? '-'}</td>
      <td>${row.latePenalty?.toFixed?.(1) ?? '-'}</td>
      <td>${row.adjustmentScore ?? 0}</td>
      <td>${row.finalScore?.toFixed?.(1) ?? '-'}</td>
      <td>${row.grade || '-'}</td>
      <td>${row.instructorRemarks || '-'}</td>
    </tr>
  `).join('');

  printWindow.document.write(`
    <html>
      <head>
        <title>${detail.courseTitle} - Final Marks Sheet</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
          h1 { margin-bottom: 8px; }
          .meta { margin-bottom: 18px; color: #4b5563; font-size: 13px; }
          .summary { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; margin-bottom: 18px; }
          .card { border: 1px solid #d1d5db; border-radius: 10px; padding: 12px; }
          .card strong { display: block; font-size: 20px; margin-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; vertical-align: top; }
          th { background: #f3f4f6; }
          @media print { body { margin: 10px; } }
        </style>
      </head>
      <body>
        <h1>${detail.courseTitle}</h1>
        <div class="meta">
          Instructor: ${detail.instructorName || 'Unknown'}<br />
          Branch / Year: ${detail.targetBranch || '-'} ${detail.targetYear ? `/ ${detail.targetYear}` : ''}<br />
          Status: ${detail.status || '-'}<br />
          Submitted: ${fmtDateTime(detail.submittedAt)}<br />
          Approved: ${fmtDateTime(detail.approvedAt)}
        </div>
        <div class="summary">
          <div class="card"><strong>${summary.totalStudents || 0}</strong>Students</div>
          <div class="card"><strong>${summary.classAverage || 0}%</strong>Average</div>
          <div class="card"><strong>${summary.passCount || 0}</strong>Pass</div>
          <div class="card"><strong>${summary.failCount || 0}</strong>Fail</div>
          <div class="card"><strong>${summary.highestScore || 0} / ${summary.lowestScore || 0}</strong>High / Low</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Roll</th>
              <th>Branch</th>
              <th>Section</th>
              <th>Attendance</th>
              <th>Tests</th>
              <th>Live</th>
              <th>Project</th>
              <th>Penalty</th>
              <th>Adjustment</th>
              <th>Final</th>
              <th>Grade</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body>
    </html>
  `);
  printWindow.document.close();
  window.setTimeout(() => printWindow.print(), 300);
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
  return (
    <span className={`badge ${config.cls}`} style={config.style}>
      {config.label}
    </span>
  );
}

function SummaryCard({ label, value, tone }) {
  return (
    <div
      style={{
        padding: 'var(--space-4)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-subtle)',
        background: tone.bg,
      }}
    >
      <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.03em', color: tone.color }}>
        {value}
      </div>
      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: tone.color, opacity: 0.7 }}>
        {label}
      </div>
    </div>
  );
}

function MarksSheetModal({
  detail,
  onClose,
  onApprove,
  onReturn,
  onExportCsv,
  onPrint,
  actionLoading,
  returnReason,
  setReturnReason,
}) {
  if (!detail) return null;

  const rows = detail.rows || [];
  const summary = detail.summary || {};

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 1200 }} onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>{detail.courseTitle}</h3>
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <StatusBadge status={detail.status} />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                {detail.targetBranch || 'No branch'} {detail.targetYear ? `• ${detail.targetYear}` : ''}
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                Instructor: {detail.instructorName || 'Unknown'}
              </span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <button className="btn-secondary" onClick={onExportCsv}>
              <Download size={14} />
              Export CSV
            </button>
            <button className="btn-secondary" onClick={onPrint}>
              <Printer size={14} />
              Print / PDF
            </button>
          </div>

          {detail.returnReason && (
            <div className="form-error-banner" style={{ marginBottom: 0 }}>
              <AlertCircle size={15} />
              <span>{detail.returnReason}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 'var(--space-3)' }}>
            <SummaryCard label="Students" value={summary.totalStudents || 0} tone={{ bg: 'rgba(99,102,241,0.1)', color: 'var(--primary-300)' }} />
            <SummaryCard label="Average" value={`${summary.classAverage || 0}%`} tone={{ bg: 'rgba(6,182,212,0.1)', color: 'var(--accent-400)' }} />
            <SummaryCard label="Pass" value={summary.passCount || 0} tone={{ bg: 'rgba(16,185,129,0.1)', color: 'var(--success-400)' }} />
            <SummaryCard label="Fail" value={summary.failCount || 0} tone={{ bg: 'rgba(244,63,94,0.1)', color: 'var(--error-400)' }} />
            <SummaryCard label="High / Low" value={`${summary.highestScore || 0} / ${summary.lowestScore || 0}`} tone={{ bg: 'rgba(245,158,11,0.1)', color: 'var(--warning-400)' }} />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <span className="badge badge-completed">Submitted: {fmtDateTime(detail.submittedAt)}</span>
            {detail.approvedAt && <span className="badge badge-active">Approved: {fmtDateTime(detail.approvedAt)}</span>}
            {detail.approvedByName && <span className="badge badge-active">Approved By: {detail.approvedByName}</span>}
          </div>

          <div className="data-table-wrapper" style={{ maxHeight: '55vh', overflow: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Branch / Section</th>
                  <th>Attendance</th>
                  <th>Tests</th>
                  <th>Live Tests</th>
                  <th>Project Bucket</th>
                  <th>Penalty</th>
                  <th>Adjustment</th>
                  <th>Final Score</th>
                  <th>Grade</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.studentId}>
                    <td>
                      <div className="td-primary">{row.studentName}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{row.rollNumber || '-'}</div>
                    </td>
                    <td>
                      <div>{row.branchName || '-'}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{row.sectionName || '-'}</div>
                    </td>
                    <td>{row.attendanceScore?.toFixed(1)}%</td>
                    <td>{row.testsScore?.toFixed(1)}%</td>
                    <td>{row.liveTestsScore?.toFixed(1)}%</td>
                    <td>{row.projectScore?.toFixed(1)}</td>
                    <td style={{ color: 'var(--error-400)', fontWeight: 700 }}>-{row.latePenalty?.toFixed(1)}</td>
                    <td>{row.adjustmentScore ?? 0}</td>
                    <td style={{ fontWeight: 800, color: row.finalScore >= 50 ? 'var(--success-400)' : 'var(--error-400)' }}>
                      {row.finalScore?.toFixed(1)}%
                    </td>
                    <td style={{ fontWeight: 800 }}>{row.grade}</td>
                    <td style={{ maxWidth: 220, whiteSpace: 'normal' }}>{row.instructorRemarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {detail.status === 'SUBMITTED' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Return Reason
              </label>
              <textarea
                rows={3}
                value={returnReason}
                onChange={(event) => setReturnReason(event.target.value)}
                placeholder="Explain what the instructor needs to correct..."
                style={{
                  width: '100%',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-default)',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'var(--text-primary)',
                  padding: 'var(--space-4)',
                  resize: 'vertical',
                  outline: 'none',
                }}
              />
              <div className="modal-actions" style={{ marginTop: 0 }}>
                <button className="btn-secondary" onClick={onClose}>Close</button>
                <button className="btn-secondary" onClick={onReturn} disabled={actionLoading || !returnReason.trim()}>
                  {actionLoading ? <Loader2 size={14} className="spin" /> : <XCircle size={14} />}
                  Return for Correction
                </button>
                <button className="btn-primary" onClick={onApprove} disabled={actionLoading}>
                  {actionLoading ? <Loader2 size={14} className="spin" /> : <CheckCircle size={14} />}
                  Approve Sheet
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MarksReview() {
  const [filter, setFilter] = useState('SUBMITTED');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [returnReason, setReturnReason] = useState('');

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getFinalMarksSheets(filter);
      setItems(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load marks sheets.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const openDetail = async (courseId) => {
    setDetailLoading(true);
    setReturnReason('');
    try {
      const response = await getFinalMarksSheetDetail(courseId);
      setDetail(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load marks sheet details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!detail) return;
    setActionLoading(true);
    try {
      const response = await approveFinalMarksSheet(detail.courseId);
      setDetail(response.data);
      await fetchList();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve marks sheet.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!detail) return;
    setActionLoading(true);
    try {
      const response = await returnFinalMarksSheet(detail.courseId, returnReason.trim());
      setDetail(response.data);
      await fetchList();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to return marks sheet.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCsv = () => {
    try {
      exportMarksSheetCsv(detail);
    } catch (err) {
      setError(err.message || 'Failed to export CSV.');
    }
  };

  const handlePrint = () => {
    try {
      openMarksSheetPrintView(detail);
    } catch (err) {
      setError(err.message || 'Failed to open print view.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Marks Review</h2>
          <p>Review submitted final marks sheets before certificates are unlocked for students</p>
        </div>
      </div>

      <div className="filter-bar">
        <select className="filter-select" value={filter} onChange={(event) => setFilter(event.target.value)}>
          {FILTERS.map((item) => (
            <option key={item} value={item}>
              {item === 'ALL' ? 'All Sheets' : item.charAt(0) + item.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="form-error-banner" style={{ marginBottom: 'var(--space-5)' }}>
          <AlertCircle size={15} /> <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="loader-center">
          <Loader2 size={28} className="spin" />
          <span>Loading marks sheets...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state glass-panel">
          <div className="empty-state-icon">
            <FileSpreadsheet size={28} color="var(--primary-400)" />
          </div>
          <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>No marks sheets found</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 420 }}>
            Submitted and approved final marks sheets will appear here once instructors send them for university review.
          </p>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Instructor</th>
                <th>Branch / Year</th>
                <th>Students</th>
                <th>Average</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.courseId}>
                  <td className="td-primary">{item.courseTitle}</td>
                  <td>{item.instructorName || '-'}</td>
                  <td>
                    <div>{item.targetBranch || '-'}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{item.targetYear || '-'}</div>
                  </td>
                  <td style={{ fontWeight: 700 }}>{item.studentCount}</td>
                  <td style={{ fontWeight: 800, color: item.classAverage >= 50 ? 'var(--success-400)' : 'var(--error-400)' }}>
                    {item.classAverage?.toFixed(1)}%
                  </td>
                  <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                    {fmtDateTime(item.submittedAt)}
                  </td>
                  <td><StatusBadge status={item.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                      <button className="icon-btn" title="Open sheet" onClick={() => openDetail(item.courseId)}>
                        {detailLoading && detail?.courseId === item.courseId ? <Loader2 size={14} className="spin" /> : <Eye size={14} />}
                      </button>
                      {item.status === 'RETURNED' && (
                        <button className="icon-btn" title="Returned">
                          <RotateCcw size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <MarksSheetModal
        detail={detail}
        onClose={() => setDetail(null)}
        onApprove={handleApprove}
        onReturn={handleReturn}
        onExportCsv={handleExportCsv}
        onPrint={handlePrint}
        actionLoading={actionLoading}
        returnReason={returnReason}
        setReturnReason={setReturnReason}
      />
    </div>
  );
}
