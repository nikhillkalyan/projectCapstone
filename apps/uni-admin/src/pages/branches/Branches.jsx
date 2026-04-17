import { useState } from 'react';
import { GitBranch, Plus, ChevronRight, Users, X, Pencil, Trash2 } from 'lucide-react';
import '../../styles/shared.css';
import './Branches.css';

const mockBranches = [
  {
    id: 1,
    name: 'Computer Science & Engineering',
    code: 'CSE',
    sections: ['Section A', 'Section B', 'Section C'],
    years: ['First Year', 'Second Year', 'Third Year', 'Fourth Year'],
    students: 420,
    instructors: 18,
  },
  {
    id: 2,
    name: 'Electronics & Communication Engineering',
    code: 'ECE',
    sections: ['Section A', 'Section B'],
    years: ['First Year', 'Second Year', 'Third Year', 'Fourth Year'],
    students: 280,
    instructors: 12,
  },
  {
    id: 3,
    name: 'Mechanical Engineering',
    code: 'MECH',
    sections: ['Section A', 'Section B'],
    years: ['First Year', 'Second Year', 'Third Year', 'Fourth Year'],
    students: 310,
    instructors: 14,
  },
  {
    id: 4,
    name: 'Civil Engineering',
    code: 'CIVIL',
    sections: ['Section A'],
    years: ['First Year', 'Second Year', 'Third Year', 'Fourth Year'],
    students: 190,
    instructors: 8,
  },
];

const branchColors = ['stat-primary', 'stat-accent', 'stat-success', 'stat-warm'];

const Branches = () => {
  const [expanded, setExpanded] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newBranch, setNewBranch] = useState({ name: '', code: '' });

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h2>Branches & Sections</h2>
          <p>Manage the academic structure of your university</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)} id="add-branch-btn">
          <Plus size={16} />
          Add Branch
        </button>
      </div>

      {/* Branch Cards */}
      <div className="branches-grid stagger-children">
        {mockBranches.map((branch, i) => (
          <div key={branch.id} className={`branch-card ${branchColors[i % branchColors.length]}`}>
            <div className="branch-card-header">
              <div className="branch-code-badge">
                <span>{branch.code}</span>
              </div>
              <div className="branch-card-actions">
                <button className="icon-btn" title="Edit branch"><Pencil size={14} /></button>
                <button className="icon-btn danger" title="Delete branch"><Trash2 size={14} /></button>
              </div>
            </div>

            <h3 className="branch-name">{branch.name}</h3>

            <div className="branch-meta">
              <span><Users size={13} /> {branch.students} students</span>
              <span><GitBranch size={13} /> {branch.instructors} instructors</span>
            </div>

            {/* Sections */}
            <div className="branch-sections-header" onClick={() => setExpanded(expanded === branch.id ? null : branch.id)}>
              <span>Sections ({branch.sections.length})</span>
              <ChevronRight size={16} className={expanded === branch.id ? 'rotated' : ''} />
            </div>

            {expanded === branch.id && (
              <div className="branch-sections-list animate-fade-in">
                {branch.years.map((year) => (
                  <div key={year} className="year-row">
                    <span className="year-label">{year}</span>
                    <div className="section-chips">
                      {branch.sections.map((sec) => (
                        <span key={sec} className="section-chip">{sec}</span>
                      ))}
                      <button className="section-chip section-chip-add" title="Add section">
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Branch Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Branch</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label className="form-label">Branch Name</label>
                <div className="form-input-wrapper">
                  <input
                    className="form-input"
                    style={{ paddingLeft: 'var(--space-4)' }}
                    type="text"
                    placeholder="e.g. Computer Science & Engineering"
                    value={newBranch.name}
                    onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Branch Code</label>
                <div className="form-input-wrapper">
                  <input
                    className="form-input"
                    style={{ paddingLeft: 'var(--space-4)', fontFamily: 'var(--font-mono)' }}
                    type="text"
                    placeholder="e.g. CSE"
                    value={newBranch.code}
                    onChange={(e) => setNewBranch({ ...newBranch, code: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary">Create Branch</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branches;
