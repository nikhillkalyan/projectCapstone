import { useState, useEffect, useCallback } from 'react';
import {
  BookOpen, Search, CheckCircle, XCircle, Eye,
  Loader2, AlertCircle, X, GitBranch, BarChart2,
  Clock, Filter
} from 'lucide-react';
import api from '../../services/api';
import '../../styles/shared.css';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getInitials = (name) =>
  name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';

const STATUS_CONFIG = {
  PENDING:  { label: 'Pending Review', cls: 'badge-pending',  dot: '#F7B731' },
  APPROVED: { label: 'Approved',       cls: 'badge-active',   dot: '#26de81' },
  REJECTED: { label: 'Rejected',       cls: 'badge-removed',  dot: '#FC5C7D' },
};

const WEIGHT_COLORS = {
  weightTests:      { label: 'Tests',      color: '#6C7FD8' },
  weightAttendance: { label: 'Attendance', color: '#4ECDC4' },
  weightLiveTests:  { label: 'Live Tests', color: '#F7B731' },
  weightProject:    { label: 'Project',    color: '#FC5C7D' },
};

function WeightPill({ label, value, color }) {
  if (!value) return null;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
    >
      {label} {value}%
    </span>
  );
}

function WeightBar({ course }) {
  const segments = Object.entries(WEIGHT_COLORS).map(([key, cfg]) => ({
    ...cfg,
    value: course[key] || 0,
  }));
  return (
    <div className="flex h-1.5 rounded-full overflow-hidden w-full gap-px">
      {segments.map(seg => (
        seg.value > 0 && (
          <div
            key={seg.label}
            title={`${seg.label}: ${seg.value}%`}
            style={{ width: `${seg.value}%`, background: seg.color }}
          />
        )
      ))}
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function CourseDetailModal({ course, onClose, onApprove, onReject, actionLoading }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Course Details</h3>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

          {/* Course Title + Instructor */}
          <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.title}
                style={{ width: 80, height: 56, objectFit: 'cover', borderRadius: 'var(--radius-lg)', flexShrink: 0, border: '1px solid var(--border-subtle)' }}
              />
            ) : (
              <div style={{ width: 80, height: 56, borderRadius: 'var(--radius-lg)', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--border-subtle)' }}>
                <BookOpen size={22} style={{ color: 'var(--primary-400)' }} />
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                {course.title}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <div className="avatar" style={{ width: 20, height: 20, fontSize: 9, flexShrink: 0 }}>
                  {getInitials(course.instructorName)}
                </div>
                {course.instructorName}
                {course.instructorEmployeeId && (
                  <span style={{ fontFamily: 'monospace', color: 'var(--primary-300)', fontSize: 11 }}>
                    • {course.instructorEmployeeId}
                  </span>
                )}
              </div>
            </div>
            <span className={`badge ${STATUS_CONFIG[course.approvalStatus]?.cls || 'badge-pending'}`}>
              {STATUS_CONFIG[course.approvalStatus]?.label}
            </span>
          </div>

          {/* Meta */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <span className="badge badge-active" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary-300)' }}>
              <GitBranch size={11} style={{ marginRight: 4 }} /> {course.targetBranchName || 'No branch'}
            </span>
            <span className="badge badge-active" style={{ background: 'rgba(6,182,212,0.1)', color: 'var(--accent-400)' }}>
              {course.targetYear}
            </span>
            {course.duration && (
              <span className="badge badge-active" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--warning-400)' }}>
                <Clock size={11} style={{ marginRight: 4 }} /> {course.duration}
              </span>
            )}
          </div>

          {/* Description */}
          {course.description && (
            <div>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                Description
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {course.description}
              </p>
            </div>
          )}

          {/* Weightage breakdown */}
          <div>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              Evaluation Weightage
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 10 }}>
              {Object.entries(WEIGHT_COLORS).map(([key, cfg]) =>
                course[key] > 0 && (
                  <WeightPill key={key} label={cfg.label} value={course[key]} color={cfg.color} />
                )
              )}
            </div>
            <WeightBar course={course} />
          </div>

          {/* Rejection reason if any */}
          {course.rejectionReason && (
            <div style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)' }}>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Rejection Reason</div>
              <p style={{ fontSize: 'var(--text-sm)', color: '#f87171' }}>{course.rejectionReason}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        {course.approvalStatus === 'PENDING' && (
          <div className="modal-actions" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <button
              className="btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
            <button
              className="icon-btn danger"
              style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)', fontWeight: 600, height: 'auto' }}
              disabled={actionLoading === course.id}
              onClick={() => onReject(course.id)}
            >
              {actionLoading === course.id ? <Loader2 size={14} className="spin" /> : <XCircle size={14} />}
              Reject
            </button>
            <button
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              disabled={actionLoading === course.id}
              onClick={() => onApprove(course.id)}
            >
              {actionLoading === course.id ? <Loader2 size={14} className="spin" /> : <CheckCircle size={14} />}
              Approve Course
            </button>
          </div>
        )}

        {course.approvalStatus !== 'PENDING' && (
          <div className="modal-actions">
            <button className="btn-secondary" onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Reject Modal ─────────────────────────────────────────────────────────────

function RejectModal({ courseId, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState('');
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Reject Course</h3>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-form">
          <div className="form-group">
            <label className="form-label">Reason for rejection</label>
            <div className="form-input-wrapper">
              <input
                className="form-input"
                style={{ paddingLeft: 'var(--space-4)' }}
                type="text"
                placeholder="e.g. Missing syllabus details, incorrect branch..."
                value={reason}
                onChange={e => setReason(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            style={{ background: 'var(--error-500, #ef4444)', display: 'flex', alignItems: 'center', gap: 6 }}
            disabled={loading || !reason.trim()}
            onClick={() => onConfirm(reason)}
          >
            {loading ? <Loader2 size={13} className="spin" /> : <XCircle size={13} />}
            Reject Course
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CoursePool() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');

  const [viewingCourse, setViewingCourse] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchPool = useCallback(async () => {
    try {
      setError('');
      const res = await api.get('/uni-courses/pool');
      setCourses(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load course pool.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPool(); }, [fetchPool]);

  // Unique branches from data for filter
  const branches = [...new Set(courses.map(c => c.targetBranchName).filter(Boolean))].sort();

  // Counts for status tabs
  const counts = {
    all: courses.length,
    PENDING: courses.filter(c => c.approvalStatus === 'PENDING').length,
    APPROVED: courses.filter(c => c.approvalStatus === 'APPROVED').length,
    REJECTED: courses.filter(c => c.approvalStatus === 'REJECTED').length,
  };

  const filtered = courses.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      c.title?.toLowerCase().includes(q) ||
      c.instructorName?.toLowerCase().includes(q) ||
      c.targetBranchName?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || c.approvalStatus === statusFilter;
    const matchBranch = branchFilter === 'all' || c.targetBranchName === branchFilter;
    return matchSearch && matchStatus && matchBranch;
  });

  const handleApprove = async (courseId) => {
    setActionLoading(courseId);
    try {
      const res = await api.put(`/uni-courses/${courseId}/approve`);
      setCourses(prev => prev.map(c => c.id === courseId ? res.data : c));
      setViewingCourse(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve course.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (reason) => {
    setActionLoading(rejectingId);
    try {
      const res = await api.put(`/uni-courses/${rejectingId}/reject`, { reason });
      setCourses(prev => prev.map(c => c.id === rejectingId ? res.data : c));
      setRejectingId(null);
      setViewingCourse(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject course.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h2>Course Pool</h2>
          <p>
            {loading ? 'Loading...' : `${courses.length} course${courses.length !== 1 ? 's' : ''} submitted by instructors`}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="form-error-banner">
          <AlertCircle size={15} /> <span>{error}</span>
        </div>
      )}

      {/* Status tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
        {[
          { key: 'all',      label: 'All' },
          { key: 'PENDING',  label: 'Pending Review' },
          { key: 'APPROVED', label: 'Approved' },
          { key: 'REJECTED', label: 'Rejected' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={statusFilter === tab.key ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 14px', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {tab.label}
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              minWidth: 20, height: 20, borderRadius: 'var(--radius-full)',
              background: 'rgba(255,255,255,0.12)', fontSize: 11, fontWeight: 700,
            }}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="form-input-wrapper" style={{ maxWidth: 300 }}>
          <input
            className="form-input"
            style={{ paddingLeft: 40 }}
            type="text"
            placeholder="Search course or instructor…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Search className="input-icon" />
        </div>
        <select
          className="filter-select"
          value={branchFilter}
          onChange={e => setBranchFilter(e.target.value)}
        >
          <option value="all">All Branches</option>
          {branches.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="loader-center">
          <Loader2 size={28} className="spin" />
          <span>Loading course pool…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={36} />
          <h3>{courses.length === 0 ? 'No courses submitted yet' : 'No matches found'}</h3>
          <p>
            {courses.length === 0
              ? 'Courses created by instructors in the university space will appear here for review.'
              : 'Try adjusting your search or filters.'}
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
                <th>Evaluation Split</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((course, i) => {
                const status = STATUS_CONFIG[course.approvalStatus] || STATUS_CONFIG.PENDING;
                return (
                  <tr key={course.id}>
                    {/* Course */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            style={{ width: 44, height: 32, objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0, border: '1px solid var(--border-subtle)' }}
                          />
                        ) : (
                          <div style={{ width: 44, height: 32, borderRadius: 'var(--radius-sm)', background: 'rgba(99,102,241,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <BookOpen size={14} style={{ color: 'var(--primary-400)' }} />
                          </div>
                        )}
                        <div>
                          <div className="td-primary" style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {course.title}
                          </div>
                          {course.duration && (
                            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 3 }}>
                              <Clock size={10} /> {course.duration}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Instructor */}
                    <td>
                      <div className="avatar-cell">
                        <div className={`avatar ${['', 'accent', 'success', 'warm'][i % 4]}`} style={{ width: 30, height: 30, fontSize: 11 }}>
                          {getInitials(course.instructorName)}
                        </div>
                        <div>
                          <div className="td-primary" style={{ fontSize: 'var(--text-sm)' }}>{course.instructorName}</div>
                          {course.instructorEmployeeId && (
                            <div style={{ fontSize: 10, color: 'var(--primary-300)', fontFamily: 'monospace' }}>
                              {course.instructorEmployeeId}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Branch / Year */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <span className="badge badge-active" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary-300)', width: 'fit-content' }}>
                          <GitBranch size={10} style={{ marginRight: 3 }} />{course.targetBranchName || '—'}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{course.targetYear}</span>
                      </div>
                    </td>

                    {/* Weightage visual */}
                    <td style={{ minWidth: 160 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 5 }}>
                        {Object.entries(WEIGHT_COLORS).map(([key, cfg]) =>
                          course[key] > 0 && (
                            <WeightPill key={key} label={cfg.label} value={course[key]} color={cfg.color} />
                          )
                        )}
                      </div>
                      <WeightBar course={course} />
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`badge ${status.cls}`}>{status.label}</span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                        <button
                          className="icon-btn"
                          title="View details"
                          onClick={() => setViewingCourse(course)}
                        >
                          <Eye size={14} />
                        </button>
                        {course.approvalStatus === 'PENDING' && (
                          <>
                            <button
                              className="icon-btn success"
                              title="Approve"
                              disabled={actionLoading === course.id}
                              onClick={() => handleApprove(course.id)}
                            >
                              {actionLoading === course.id
                                ? <Loader2 size={14} className="spin" />
                                : <CheckCircle size={14} />
                              }
                            </button>
                            <button
                              className="icon-btn danger"
                              title="Reject"
                              disabled={actionLoading === course.id}
                              onClick={() => setRejectingId(course.id)}
                            >
                              <XCircle size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="pagination">
            <span className="pagination-info">
              Showing {filtered.length} of {courses.length} course{courses.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {viewingCourse && (
        <CourseDetailModal
          course={viewingCourse}
          onClose={() => setViewingCourse(null)}
          onApprove={handleApprove}
          onReject={(id) => { setViewingCourse(null); setRejectingId(id); }}
          actionLoading={actionLoading}
        />
      )}

      {/* Reject modal */}
      {rejectingId && (
        <RejectModal
          courseId={rejectingId}
          onClose={() => setRejectingId(null)}
          onConfirm={handleReject}
          loading={actionLoading === rejectingId}
        />
      )}
    </div>
  );
}
