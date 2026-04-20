import { useState, useEffect, useCallback } from 'react';
import { Search, Mail, Eye, Trash2, Loader2, AlertCircle, GitBranch, BookOpen, CheckCircle, XCircle, X } from 'lucide-react';
import api from '../../services/api';
import '../../styles/shared.css';

const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';
const avatarColors = ['', 'accent', 'success', 'warm', 'accent'];

const STATUS_MAP = {
  APPROVED: { label: 'Approved', cls: 'badge-active' },
  PENDING:  { label: 'Pending',  cls: 'badge-pending' },
  REJECTED: { label: 'Rejected', cls: 'badge-removed' },
  REMOVED:  { label: 'Removed',  cls: 'badge-removed' },
};

const Instructors = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [branchFilter, setBranchFilter] = useState('all');

  const [actionLoading, setActionLoading] = useState(null);
  const [rejectingId, setRejectingId]     = useState(null);
  const [rejectReason, setRejectReason]   = useState('');

  const fetchInstructors = useCallback(async () => {
    try {
      setError('');
      const res = await api.get('/uni-admin/users/instructors');
      setInstructors(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load instructors.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInstructors(); }, [fetchInstructors]);

  // Unique branches from the real data for the filter dropdown
  const branches = [...new Set(instructors.map(i => i.branchName).filter(Boolean))].sort();

  const filtered = instructors.filter(ins => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      ins.name?.toLowerCase().includes(q) ||
      ins.email?.toLowerCase().includes(q) ||
      ins.employeeId?.toLowerCase().includes(q);
    const matchBranch = branchFilter === 'all' || ins.branchName === branchFilter;
    return matchSearch && matchBranch;
  });

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await api.put(`/uni-admin/users/instructors/${id}/approve`);
      setInstructors(prev => prev.map(ins => ins.id === id ? { ...ins, approvalStatus: 'APPROVED' } : ins));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve instructor');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    setActionLoading(rejectingId);
    try {
      await api.put(`/uni-admin/users/instructors/${rejectingId}/reject`, { reason: rejectReason });
      setInstructors(prev => prev.map(ins => ins.id === rejectingId ? { ...ins, approvalStatus: 'REJECTED' } : ins));
      setRejectingId(null);
      setRejectReason('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject instructor');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Are you sure you want to remove this instructor?")) return;
    setActionLoading(id);
    try {
      await api.put(`/uni-admin/users/instructors/${id}/remove`);
      setInstructors(prev => prev.map(ins => ins.id === id ? { ...ins, approvalStatus: 'REMOVED' } : ins));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove instructor');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h2>Instructors</h2>
          <p>{loading ? 'Loading...' : `${instructors.length} instructor${instructors.length !== 1 ? 's' : ''} in your university`}</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="form-error-banner">
          <AlertCircle size={15} /> <span>{error}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="form-input-wrapper" style={{ maxWidth: 300 }}>
          <input
            id="instructor-search"
            className="form-input"
            style={{ paddingLeft: 40 }}
            type="text"
            placeholder="Search name, email or employee ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Search className="input-icon" />
        </div>

        <select
          id="instructor-branch-filter"
          className="filter-select"
          value={branchFilter}
          onChange={e => setBranchFilter(e.target.value)}
        >
          <option value="all">All Branches</option>
          {branches.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loader-center">
          <Loader2 size={28} className="spin" />
          <span>Loading instructors…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <h3>{instructors.length === 0 ? 'No instructors yet' : 'No matches found'}</h3>
          <p>
            {instructors.length === 0
              ? 'Instructors will appear here once they sign up using your university join code.'
              : 'Try adjusting your search or filter.'}
          </p>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Instructor</th>
                <th>Employee ID</th>
                <th>Branch</th>
                <th>Specialization</th>
                <th>Courses</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ins, i) => {
                const status = STATUS_MAP[ins.approvalStatus] || STATUS_MAP.PENDING;
                return (
                  <tr key={ins.id}>
                    <td>
                      <div className="avatar-cell">
                        {ins.avatarUrl ? (
                          <img src={ins.avatarUrl} alt={ins.name} className="avatar" style={{ objectFit: 'cover' }} />
                        ) : (
                          <div className={`avatar ${avatarColors[i % avatarColors.length]}`}>
                            {getInitials(ins.name)}
                          </div>
                        )}
                        <div>
                          <div className="td-primary">{ins.name}</div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Mail size={11} />{ins.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--primary-300)' }}>
                        {ins.employeeId || '—'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-active" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary-300)' }}>
                        {ins.branchName || 'Not assigned'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>
                        <GitBranch size={12} />
                        {ins.specialization || '—'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-primary)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                        <BookOpen size={12} style={{ color: 'var(--text-tertiary)' }} />
                        {ins.totalStudents ?? 0}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${status.cls}`}>{status.label}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                        <button className="icon-btn" title="View details"><Eye size={14} /></button>
                        
                        {ins.approvalStatus === 'PENDING' && (
                          <>
                            <button 
                              className="icon-btn success" 
                              title="Approve"
                              disabled={actionLoading === ins.id}
                              onClick={() => handleApprove(ins.id)}
                            >
                              {actionLoading === ins.id ? <Loader2 size={14} className="spin" /> : <CheckCircle size={14} />}
                            </button>
                            <button 
                              className="icon-btn danger" 
                              title="Reject"
                              disabled={actionLoading === ins.id}
                              onClick={() => { setRejectingId(ins.id); setRejectReason(''); }}
                            >
                              <XCircle size={14} />
                            </button>
                          </>
                        )}
                        
                        {ins.approvalStatus === 'APPROVED' && (
                          <button 
                            className="icon-btn danger" 
                            title="Remove"
                            disabled={actionLoading === ins.id}
                            onClick={() => handleRemove(ins.id)}
                          >
                            {actionLoading === ins.id ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />}
                          </button>
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
              Showing {filtered.length} of {instructors.length} instructor{instructors.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectingId && (
        <div className="modal-overlay" onClick={() => setRejectingId(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reject Instructor</h3>
              <button className="modal-close" onClick={() => setRejectingId(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleReject}>
              <div className="modal-form">
                <div className="form-group">
                  <label className="form-label">Reason for rejection</label>
                  <div className="form-input-wrapper">
                    <input
                      className="form-input"
                      type="text"
                      placeholder="e.g. Invalid credentials, mismatched ID, etc."
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      required
                      autoFocus
                      style={{ paddingLeft: 'var(--space-4)' }}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setRejectingId(null)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ background: 'var(--danger-500)' }} disabled={actionLoading === rejectingId}>
                  {actionLoading === rejectingId ? 'Rejecting...' : 'Reject Instructor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Instructors;
