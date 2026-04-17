import { useState } from 'react';
import { Search, Plus, Mail, GitBranch, X, Eye, Trash2 } from 'lucide-react';
import '../../styles/shared.css';

const mockInstructors = [
  { id: 1, name: 'Dr. Priya Verma', empId: 'EMP-001', email: 'priya@university.edu', branch: 'CSE', github: 'priya-verma', courses: 3, status: 'active' },
  { id: 2, name: 'Prof. K. Ramesh', empId: 'EMP-002', email: 'ramesh@university.edu', branch: 'ECE', github: 'kramesh', courses: 2, status: 'active' },
  { id: 3, name: 'Dr. S. Kumar', empId: 'EMP-003', email: 'skumar@university.edu', branch: 'MECH', github: 'skumar-mech', courses: 1, status: 'pending' },
  { id: 4, name: 'Dr. A. Patel', empId: 'EMP-004', email: 'apatel@university.edu', branch: 'CSE', github: 'apatel-dev', courses: 4, status: 'active' },
  { id: 5, name: 'Prof. L. Nair', empId: 'EMP-005', email: 'lnair@university.edu', branch: 'CIVIL', github: 'lnair', courses: 2, status: 'active' },
];

const avatarColors = ['', 'accent', 'success', 'warm', 'accent'];

const getInitials = (name) => name.split(' ').map(n => n[0]).join('').slice(0, 2);

const Instructors = () => {
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');

  const filtered = mockInstructors.filter((ins) => {
    const matchSearch = ins.name.toLowerCase().includes(search.toLowerCase()) ||
      ins.empId.toLowerCase().includes(search.toLowerCase());
    const matchBranch = branchFilter === 'all' || ins.branch === branchFilter;
    return matchSearch && matchBranch;
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Instructors</h2>
          <p>{mockInstructors.length} instructors in your university space</p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="form-input-wrapper" style={{ maxWidth: 300 }}>
          <input
            id="instructor-search"
            className="form-input"
            style={{ paddingLeft: 40 }}
            type="text"
            placeholder="Search by name or employee ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="input-icon" />
        </div>
        <select className="filter-select" value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
          <option value="all">All Branches</option>
          <option value="CSE">CSE</option>
          <option value="ECE">ECE</option>
          <option value="MECH">MECH</option>
          <option value="CIVIL">CIVIL</option>
        </select>
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Instructor</th>
              <th>Employee ID</th>
              <th>Branch</th>
              <th>GitHub</th>
              <th>Courses</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ins, i) => (
              <tr key={ins.id}>
                <td>
                  <div className="avatar-cell">
                    <div className={`avatar ${avatarColors[i % avatarColors.length]}`}>
                      {getInitials(ins.name)}
                    </div>
                    <div>
                      <div className="td-primary">{ins.name}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Mail size={11} />{ins.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td><span className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--primary-300)' }}>{ins.empId}</span></td>
                <td><span className="badge badge-active" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary-300)' }}>{ins.branch}</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)' }}>
                    <GitBranch size={12} />{ins.github}
                  </div>
                </td>
                <td><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{ins.courses}</span></td>
                <td>
                  <span className={`badge badge-${ins.status}`}>
                    {ins.status.charAt(0).toUpperCase() + ins.status.slice(1)}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                    <button className="icon-btn" title="View details"><Eye size={14} /></button>
                    <button className="icon-btn danger" title="Remove instructor"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
          <span className="pagination-info">Showing {filtered.length} of {mockInstructors.length} instructors</span>
          <div className="pagination-controls">
            <button className="page-btn" disabled>←</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">→</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Instructors;
