import { useState, useEffect, useCallback } from 'react';
import { GitBranch, Plus, ChevronRight, X, Trash2, Loader2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import '../../styles/shared.css';
import './Branches.css';

const YEARS = ['First Year', 'Second Year', 'Third Year', 'Fourth Year'];

const Branches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);

  // Branch modal state
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [branchName, setBranchName] = useState('');
  const [savingBranch, setSavingBranch] = useState(false);
  const [branchError, setBranchError] = useState('');

  // Section modal state
  const [showSectionModal, setShowSectionModal] = useState(null); // holds the branchId
  const [sectionName, setSectionName] = useState('');
  const [sectionYear, setSectionYear] = useState('First Year');
  const [savingSection, setSavingSection] = useState(false);
  const [sectionError, setSectionError] = useState('');

  // Deleting state
  const [deletingBranch, setDeletingBranch] = useState(null);
  const [deletingSection, setDeletingSection] = useState(null);

  // ── Fetch ──────────────────────────────────────────────────────────────

  const fetchBranches = useCallback(async () => {
    try {
      setError('');
      const res = await api.get('/uni-admin/context/branches');
      setBranches(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load branches.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBranches(); }, [fetchBranches]);

  // ── Branch Operations ──────────────────────────────────────────────────

  const handleCreateBranch = async (e) => {
    e.preventDefault();
    if (!branchName.trim()) { setBranchError('Branch name is required'); return; }
    setSavingBranch(true);
    setBranchError('');
    try {
      const res = await api.post('/uni-admin/context/branches', { name: branchName });
      setBranches(prev => [...prev, res.data]);
      setShowBranchModal(false);
      setBranchName('');
    } catch (err) {
      setBranchError(err.response?.data?.message || 'Failed to create branch.');
    } finally {
      setSavingBranch(false);
    }
  };

  const handleDeleteBranch = async (branchId) => {
    setDeletingBranch(branchId);
    try {
      await api.delete(`/uni-admin/context/branches/${branchId}`);
      setBranches(prev => prev.filter(b => b.id !== branchId));
      if (expanded === branchId) setExpanded(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete branch.');
    } finally {
      setDeletingBranch(null);
    }
  };

  // ── Section Operations ─────────────────────────────────────────────────

  const openSectionModal = (branchId) => {
    setShowSectionModal(branchId);
    setSectionName('');
    setSectionYear('First Year');
    setSectionError('');
  };

  const handleCreateSection = async (e) => {
    e.preventDefault();
    if (!sectionName.trim()) { setSectionError('Section name is required'); return; }
    setSavingSection(true);
    setSectionError('');
    try {
      const res = await api.post('/uni-admin/context/sections', {
        branchId: showSectionModal,
        name: sectionName,
        year: sectionYear,
      });
      // Append the new section into the correct branch in local state (no re-fetch needed)
      setBranches(prev => prev.map(b =>
        b.id === showSectionModal
          ? { ...b, sections: [...b.sections, res.data] }
          : b
      ));
      setShowSectionModal(null);
    } catch (err) {
      setSectionError(err.response?.data?.message || 'Failed to create section.');
    } finally {
      setSavingSection(false);
    }
  };

  const handleDeleteSection = async (e, branchId, sectionId) => {
    e.stopPropagation();
    setDeletingSection(sectionId);
    try {
      await api.delete(`/uni-admin/context/sections/${sectionId}`);
      setBranches(prev => prev.map(b =>
        b.id === branchId
          ? { ...b, sections: b.sections.filter(s => s.id !== sectionId) }
          : b
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete section.');
    } finally {
      setDeletingSection(null);
    }
  };

  // ── Group sections by year within a branch ─────────────────────────────

  const groupByYear = (sections) => {
    const map = {};
    sections.forEach(s => {
      if (!map[s.year]) map[s.year] = [];
      map[s.year].push(s);
    });
    // Return in a predictable year order
    return YEARS.filter(y => map[y]).map(y => ({ year: y, sections: map[y] }));
  };

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h2>Branches &amp; Sections</h2>
          <p>Manage the academic structure of your university</p>
        </div>
        <button
          id="add-branch-btn"
          className="btn-primary"
          onClick={() => { setShowBranchModal(true); setBranchError(''); setBranchName(''); }}
        >
          <Plus size={16} />
          Add Branch
        </button>
      </div>

      {/* Global error */}
      {error && (
        <div className="form-error-banner">
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="loader-center">
          <Loader2 size={28} className="spin" />
          <span>Loading branches...</span>
        </div>
      ) : branches.length === 0 ? (
        <div className="empty-state">
          <GitBranch size={36} />
          <h3>No branches yet</h3>
          <p>Add your first branch to start building your university structure.</p>
          <button className="btn-primary" onClick={() => setShowBranchModal(true)}>
            <Plus size={15} /> Add First Branch
          </button>
        </div>
      ) : (
        <div className="branches-grid stagger-children">
          {branches.map((branch, i) => {
            const colorClasses = ['stat-primary', 'stat-accent', 'stat-success', 'stat-warm'];
            const grouped = groupByYear(branch.sections || []);

            return (
              <div key={branch.id} className={`branch-card ${colorClasses[i % colorClasses.length]}`}>

                {/* Card Header */}
                <div className="branch-card-header">
                  <div className="branch-code-badge">
                    <GitBranch size={14} />
                  </div>
                  <div className="branch-card-actions">
                    <button
                      className="icon-btn danger"
                      title="Delete branch"
                      disabled={deletingBranch === branch.id}
                      onClick={() => handleDeleteBranch(branch.id)}
                    >
                      {deletingBranch === branch.id
                        ? <Loader2 size={13} className="spin" />
                        : <Trash2 size={13} />}
                    </button>
                  </div>
                </div>

                <h3 className="branch-name">{branch.name}</h3>

                <div className="branch-meta">
                  <span><GitBranch size={13} /> {branch.sections?.length || 0} sections</span>
                </div>

                {/* Sections Expand Toggle */}
                <div
                  className="branch-sections-header"
                  onClick={() => setExpanded(expanded === branch.id ? null : branch.id)}
                >
                  <span>Sections ({branch.sections?.length || 0})</span>
                  <ChevronRight size={16} className={expanded === branch.id ? 'rotated' : ''} />
                </div>

                {expanded === branch.id && (
                  <div className="branch-sections-list animate-fade-in">
                    {grouped.length === 0 ? (
                      <p className="no-sections-hint">No sections yet. Add one below.</p>
                    ) : (
                      grouped.map(({ year, sections }) => (
                        <div key={year} className="year-row">
                          <span className="year-label">{year}</span>
                          <div className="section-chips">
                            {sections.map(sec => (
                              <span key={sec.id} className="section-chip section-chip-deletable">
                                {sec.name}
                                <button
                                  className="section-chip-delete"
                                  disabled={deletingSection === sec.id}
                                  onClick={(e) => handleDeleteSection(e, branch.id, sec.id)}
                                  title="Remove section"
                                >
                                  {deletingSection === sec.id
                                    ? <Loader2 size={9} className="spin" />
                                    : <X size={9} />}
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                    {/* Add Section inline */}
                    <button
                      className="btn-add-section"
                      onClick={() => openSectionModal(branch.id)}
                    >
                      <Plus size={13} /> Add Section
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ════════════════════════════════════════
          CREATE BRANCH MODAL
      ════════════════════════════════════════ */}
      {showBranchModal && (
        <div className="modal-overlay" onClick={() => setShowBranchModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Branch</h3>
              <button className="modal-close" onClick={() => setShowBranchModal(false)}><X size={16} /></button>
            </div>
            {branchError && (
              <div className="modal-error">
                <AlertCircle size={14} /> {branchError}
              </div>
            )}
            <form id="create-branch-form" onSubmit={handleCreateBranch}>
              <div className="modal-form">
                <div className="form-group">
                  <label className="form-label">Branch Name</label>
                  <div className="form-input-wrapper">
                    <input
                      id="branch-name-input"
                      className="form-input"
                      style={{ paddingLeft: 'var(--space-4)' }}
                      type="text"
                      placeholder="e.g. Computer Science &amp; Engineering"
                      value={branchName}
                      onChange={e => setBranchName(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowBranchModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={savingBranch}>
                  {savingBranch ? <><Loader2 size={13} className="spin" /> Creating...</> : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          CREATE SECTION MODAL
      ════════════════════════════════════════ */}
      {showSectionModal && (
        <div className="modal-overlay" onClick={() => setShowSectionModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Section</h3>
              <button className="modal-close" onClick={() => setShowSectionModal(null)}><X size={16} /></button>
            </div>
            {sectionError && (
              <div className="modal-error">
                <AlertCircle size={14} /> {sectionError}
              </div>
            )}
            <form id="create-section-form" onSubmit={handleCreateSection}>
              <div className="modal-form">
                <div className="form-group">
                  <label className="form-label">Section Name</label>
                  <div className="form-input-wrapper">
                    <input
                      id="section-name-input"
                      className="form-input"
                      style={{ paddingLeft: 'var(--space-4)' }}
                      type="text"
                      placeholder="e.g. Section A"
                      value={sectionName}
                      onChange={e => setSectionName(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Academic Year</label>
                  <div className="form-input-wrapper">
                    <select
                      id="section-year-select"
                      className="form-input"
                      style={{ paddingLeft: 'var(--space-4)' }}
                      value={sectionYear}
                      onChange={e => setSectionYear(e.target.value)}
                    >
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowSectionModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={savingSection}>
                  {savingSection ? <><Loader2 size={13} className="spin" /> Adding...</> : 'Add Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branches;
