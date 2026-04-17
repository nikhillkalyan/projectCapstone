import { useState } from 'react';
import { Search, Mail, Eye, Trash2, GitBranch } from 'lucide-react';
import '../../styles/shared.css';

const mockStudents = [
  { id: 1, name: 'Rahul Sharma', rollNo: 'CSE2023001', email: 'rahul@student.edu', branch: 'CSE', section: 'Section A', year: '2nd Year', github: 'rahul-sha', status: 'active' },
  { id: 2, name: 'Ananya Reddy', rollNo: 'MECH2023014', email: 'ananya@student.edu', branch: 'MECH', section: 'Section B', year: '3rd Year', github: 'ananya-r', status: 'active' },
  { id: 3, name: 'Vikram Singh', rollNo: 'ECE2023022', email: 'vikram@student.edu', branch: 'ECE', section: 'Section A', year: '2nd Year', github: 'vikram-s', status: 'active' },
  { id: 4, name: 'Sneha Nair', rollNo: 'CSE2023038', email: 'sneha@student.edu', branch: 'CSE', section: 'Section C', year: '1st Year', github: 'sneha-n', status: 'active' },
  { id: 5, name: 'Arjun Patel', rollNo: 'CIVIL2023007', email: 'arjun@student.edu', branch: 'CIVIL', section: 'Section A', year: '4th Year', github: 'arjun-p', status: 'inactive' },
];

const getInitials = (name) => name.split(' ').map(n => n[0]).join('').slice(0, 2);
const avatarColors = ['', 'accent', 'success', 'warm', ''];

const Students = () => {
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');

  const filtered = mockStudents.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(search.toLowerCase());
    const matchBranch = branchFilter === 'all' || s.branch === branchFilter;
    const matchYear = yearFilter === 'all' || s.year === yearFilter;
    return matchSearch && matchBranch && matchYear;
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Students</h2>
          <p>{mockStudents.length} students enrolled in your university space</p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="form-input-wrapper" style={{ maxWidth: 300 }}>
          <input
            id="student-search"
            className="form-input"
            style={{ paddingLeft: 40 }}
            type="text"
            placeholder="Search by name or roll number..."
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
        <select className="filter-select" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
          <option value="all">All Years</option>
          <option value="1st Year">1st Year</option>
          <option value="2nd Year">2nd Year</option>
          <option value="3rd Year">3rd Year</option>
          <option value="4th Year">4th Year</option>
        </select>
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Roll Number</th>
              <th>Branch</th>
              <th>Section / Year</th>
              <th>GitHub</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={s.id}>
                <td>
                  <div className="avatar-cell">
                    <div className={`avatar ${avatarColors[i % avatarColors.length]}`}>{getInitials(s.name)}</div>
                    <div>
                      <div className="td-primary">{s.name}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Mail size={11} />{s.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td><span className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-400)' }}>{s.rollNo}</span></td>
                <td><span className="badge badge-active" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary-300)' }}>{s.branch}</span></td>
                <td>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{s.section}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{s.year}</div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)' }}>
                    <GitBranch size={12} />{s.github}
                  </div>
                </td>
                <td>
                  <span className={`badge badge-${s.status === 'active' ? 'active' : 'pending'}`}>
                    {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                    <button className="icon-btn" title="View profile"><Eye size={14} /></button>
                    <button className="icon-btn danger" title="Remove student"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
          <span className="pagination-info">Showing {filtered.length} of {mockStudents.length} students</span>
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

export default Students;
