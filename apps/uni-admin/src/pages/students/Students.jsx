import { useState, useEffect, useCallback } from 'react';
import { Search, Mail, Eye, Loader2, AlertCircle, LayoutGrid } from 'lucide-react';
import api from '../../services/api';
import '../../styles/shared.css';

const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';
const avatarColors = ['', 'accent', 'success', 'warm', ''];

const Students = () => {
  const [students, setStudents]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [yearFilter, setYearFilter]     = useState('all');

  const fetchStudents = useCallback(async () => {
    try {
      setError('');
      const res = await api.get('/uni-admin/users/students');
      setStudents(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load students.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  // Unique branches and years from real data
  const branches = [...new Set(students.map(s => s.branchName).filter(Boolean))].sort();
  const years    = [...new Set(students.map(s => s.year).filter(Boolean))];

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.rollNumber?.toLowerCase().includes(q);
    const matchBranch = branchFilter === 'all' || s.branchName === branchFilter;
    const matchYear   = yearFilter   === 'all' || s.year === yearFilter;
    return matchSearch && matchBranch && matchYear;
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h2>Students</h2>
          <p>{loading ? 'Loading...' : `${students.length} student${students.length !== 1 ? 's' : ''} enrolled in your university`}</p>
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
            id="student-search"
            className="form-input"
            style={{ paddingLeft: 40 }}
            type="text"
            placeholder="Search name, email or roll number…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Search className="input-icon" />
        </div>

        <select
          id="student-branch-filter"
          className="filter-select"
          value={branchFilter}
          onChange={e => setBranchFilter(e.target.value)}
        >
          <option value="all">All Branches</option>
          {branches.map(b => <option key={b} value={b}>{b}</option>)}
        </select>

        <select
          id="student-year-filter"
          className="filter-select"
          value={yearFilter}
          onChange={e => setYearFilter(e.target.value)}
        >
          <option value="all">All Years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loader-center">
          <Loader2 size={28} className="spin" />
          <span>Loading students…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <LayoutGrid size={36} />
          <h3>{students.length === 0 ? 'No students yet' : 'No matches found'}</h3>
          <p>
            {students.length === 0
              ? 'Students will appear here once they sign up using your university join code.'
              : 'Try adjusting your search or filters.'}
          </p>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll Number</th>
                <th>Branch</th>
                <th>Section / Year</th>
                <th>Interests</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id}>
                  <td>
                    <div className="avatar-cell">
                      {s.avatarUrl ? (
                        <img src={s.avatarUrl} alt={s.name} className="avatar" style={{ objectFit: 'cover' }} />
                      ) : (
                        <div className={`avatar ${avatarColors[i % avatarColors.length]}`}>
                          {getInitials(s.name)}
                        </div>
                      )}
                      <div>
                        <div className="td-primary">{s.name}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Mail size={11} />{s.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-400)' }}>
                      {s.rollNumber || '—'}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-active" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary-300)' }}>
                      {s.branchName || 'Not assigned'}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                      {s.sectionName || 'No section'}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                      {s.year || s.yearOfStudy || '—'}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {(s.interests || []).slice(0, 2).map(int => (
                        <span key={int} className="section-chip" style={{ fontSize: 10, padding: '2px 8px' }}>
                          {int}
                        </span>
                      ))}
                      {(s.interests || []).length > 2 && (
                        <span className="section-chip" style={{ fontSize: 10, padding: '2px 8px', opacity: 0.6 }}>
                          +{s.interests.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                      <button className="icon-btn" title="View profile"><Eye size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <span className="pagination-info">
              Showing {filtered.length} of {students.length} student{students.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
