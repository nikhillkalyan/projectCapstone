import { useState, useEffect, useCallback } from 'react';
import {
  Github, Users, GitBranch, GitPullRequest, FileText, Plus,
  Loader2, CheckCircle2, AlertTriangle, X, ChevronDown, ChevronUp,
  ExternalLink, Clock, Send, Shuffle, UserPlus, FolderGit2,
  AlertCircle, Check, Upload, Eye, GitCommit, RefreshCw, Link
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { uploadFileToCloudinary } from '../../lib/cloudinary';

const fmt = (iso) => iso
  ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  : '—';

const fmtTime = (iso) => iso ? new Date(iso).toLocaleString('en-IN', {
  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
}) : '—';

const STATUS_MAP = {
  FORMING: { label: 'Forming', bg: 'bg-amber-500/10', border: 'border-amber-500/25', text: 'text-amber-400' },
  PROPOSAL_PENDING: { label: 'Proposal Pending', bg: 'bg-blue-500/10', border: 'border-blue-500/25', text: 'text-blue-400' },
  PROPOSAL_APPROVED: { label: 'Approved', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', text: 'text-emerald-400' },
  ACTIVE: { label: 'Active', bg: 'bg-primary-500/10', border: 'border-primary-500/25', text: 'text-primary-400' },
  SUBMITTED: { label: 'Submitted', bg: 'bg-purple-500/10', border: 'border-purple-500/25', text: 'text-purple-400' },
};

function GroupStatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.FORMING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${s.bg} ${s.border} ${s.text}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {s.label}
    </span>
  );
}

const STUDENT_DOC_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
];

const getDeadlineTone = (iso) => {
  if (!iso) {
    return {
      label: 'Flexible',
      copy: 'No deadline has been configured yet.',
      tone: 'text-text-secondary',
      card: 'bg-bg-surface/80 border-border-subtle',
    };
  }

  const diffMs = new Date(iso).getTime() - Date.now();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: 'Closed',
      copy: `Closed on ${fmt(iso)}`,
      tone: 'text-red-400',
      card: 'bg-red-500/10 border-red-500/20',
    };
  }

  if (diffDays <= 3) {
    return {
      label: 'Urgent',
      copy: `${diffDays === 0 ? 'Due today' : `${diffDays} day${diffDays !== 1 ? 's' : ''} left`}`,
      tone: 'text-amber-300',
      card: 'bg-amber-500/10 border-amber-500/20',
    };
  }

  return {
    label: 'On Track',
    copy: `${diffDays} days remaining`,
    tone: 'text-emerald-300',
    card: 'bg-emerald-500/10 border-emerald-500/20',
  };
};

// ─── Create Project Space Form ───────────────────────────────────────────────
function CreateSpaceForm({ courseId, onCreated }) {
  const [form, setForm] = useState({
    groupSize: 4,
    proposalDeadline: '',
    projectDeadline: '',
    projectDescription: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.groupSize || form.groupSize < 1) { setError('Group size required'); return; }
    setSaving(true); setError('');
    try {
      const payload = {
        ...form,
        proposalDeadline: form.proposalDeadline ? new Date(form.proposalDeadline).toISOString() : null,
        projectDeadline: form.projectDeadline ? new Date(form.projectDeadline).toISOString() : null,
      };
      const res = await api.post(`/project-space/${courseId}`, payload);
      onCreated(res.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create project space');
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
          <FolderGit2 className="w-8 h-8 text-purple-400" />
        </div>
        <h3 className="text-xl font-bold font-syne text-text-primary mb-2">Set Up Project Space</h3>
        <p className="text-sm text-text-secondary">Configure group formation and deadlines for this course's project evaluation.</p>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 space-y-5">
        <div>
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Students per Group *</label>
          <input
            type="number" min="1" max="20" value={form.groupSize}
            onChange={e => setForm(f => ({ ...f, groupSize: +e.target.value }))}
            className="w-full h-11 bg-bg-elevated border border-border-subtle rounded-xl px-4 text-sm text-text-primary outline-none focus:border-purple-500/50 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Proposal Deadline</label>
            <input
              type="datetime-local" value={form.proposalDeadline}
              onChange={e => setForm(f => ({ ...f, proposalDeadline: e.target.value }))}
              className="w-full h-11 bg-bg-elevated border border-border-subtle rounded-xl px-3 text-xs text-text-primary outline-none focus:border-purple-500/50 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Project Deadline</label>
            <input
              type="datetime-local" value={form.projectDeadline}
              onChange={e => setForm(f => ({ ...f, projectDeadline: e.target.value }))}
              className="w-full h-11 bg-bg-elevated border border-border-subtle rounded-xl px-3 text-xs text-text-primary outline-none focus:border-purple-500/50 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Project Description / Brief</label>
          <textarea
            rows={3} value={form.projectDescription}
            onChange={e => setForm(f => ({ ...f, projectDescription: e.target.value }))}
            placeholder="What students are expected to build for this course..."
            className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-purple-500/50 transition-all resize-none"
          />
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          onClick={handleSubmit} disabled={saving}
          className="w-full py-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold text-sm rounded-xl hover:bg-purple-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Create Project Space
        </button>
      </div>
    </div>
  );
}

// ─── Group Formation ─────────────────────────────────────────────────────────
function GroupFormation({ courseId, space, onRefresh }) {
  const [mode, setMode] = useState(null); // 'random' | 'manual'
  const [manualGroups, setManualGroups] = useState([{ name: 'Group 1', studentIds: [] }]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [forming, setForming] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode === 'manual') {
      setLoadingStudents(true);
      api.get(`/marks/instructor/course/${courseId}/students`)
        .then(r => setEnrolledStudents(r.data || []))
        .catch(() => setEnrolledStudents([]))
        .finally(() => setLoadingStudents(false));
    }
  }, [mode, courseId]);

  const handleRandom = async () => {
    setForming(true); setError('');
    try {
      await api.post(`/project-space/${courseId}/groups/random`, { groupSize: space.groupSize });
      onRefresh();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to form groups');
    } finally { setForming(false); }
  };

  const addGroup = () => setManualGroups(g => [...g, { name: `Group ${g.length + 1}`, studentIds: [] }]);
  const removeGroup = (i) => setManualGroups(g => g.filter((_, idx) => idx !== i));

  const toggleStudent = (groupIdx, studentId) => {
    setManualGroups(groups => groups.map((g, i) => {
      if (i !== groupIdx) return g;
      const ids = g.studentIds.includes(studentId)
        ? g.studentIds.filter(id => id !== studentId)
        : [...g.studentIds, studentId];
      return { ...g, studentIds: ids };
    }));
  };

  const isAssigned = (studentId) => manualGroups.some(g => g.studentIds.includes(studentId));

  const handleManual = async () => {
    const invalid = manualGroups.find(g => !g.name.trim() || g.studentIds.length === 0);
    if (invalid) { setError('All groups need a name and at least one student'); return; }
    setForming(true); setError('');
    try {
      await api.post(`/project-space/${courseId}/groups/manual`, {
        groups: manualGroups.map(g => ({ name: g.name, studentIds: g.studentIds }))
      });
      onRefresh();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to form groups');
    } finally { setForming(false); }
  };

  return (
    <div className="space-y-5">
      <div className="p-5 bg-bg-surface border border-border-subtle rounded-2xl">
        <h4 className="text-sm font-bold text-text-primary mb-1 flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-400" /> Form Groups
        </h4>
        <p className="text-xs text-text-secondary mb-4">
          Groups of {space.groupSize}. Choose how to distribute the enrolled students.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => setMode('random')}
            className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${mode === 'random' ? 'border-purple-500/40 bg-purple-500/10' : 'border-border-subtle hover:border-border-strong bg-bg-elevated'}`}
          >
            <Shuffle className="w-5 h-5 text-purple-400 shrink-0" />
            <div>
              <div className="text-sm font-bold text-text-primary">Random</div>
              <div className="text-xs text-text-muted">Auto-shuffle students</div>
            </div>
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${mode === 'manual' ? 'border-purple-500/40 bg-purple-500/10' : 'border-border-subtle hover:border-border-strong bg-bg-elevated'}`}
          >
            <UserPlus className="w-5 h-5 text-purple-400 shrink-0" />
            <div>
              <div className="text-sm font-bold text-text-primary">Manual</div>
              <div className="text-xs text-text-muted">Pick students yourself</div>
            </div>
          </button>
        </div>

        {mode === 'random' && (
          <div className="space-y-3">
            <div className="flex items-start gap-2 p-3 bg-amber-500/8 border border-amber-500/20 rounded-xl">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300">Students will be shuffled and split into groups of {space.groupSize}. This cannot be undone.</p>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              onClick={handleRandom} disabled={forming}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-bold rounded-xl hover:bg-purple-500/20 transition-all disabled:opacity-50"
            >
              {forming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shuffle className="w-4 h-4" />}
              Form Groups Randomly
            </button>
          </div>
        )}

        {mode === 'manual' && (
          <div className="space-y-4">
            {loadingStudents ? (
              <div className="flex items-center gap-2 text-sm text-text-muted"><Loader2 className="w-4 h-4 animate-spin" /> Loading students...</div>
            ) : (
              <>
                {manualGroups.map((group, gi) => (
                  <div key={gi} className="p-4 bg-bg-elevated border border-border-subtle rounded-xl space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text" value={group.name}
                        onChange={e => setManualGroups(gs => gs.map((g, i) => i === gi ? { ...g, name: e.target.value } : g))}
                        className="flex-1 h-9 bg-bg-surface border border-border-subtle rounded-lg px-3 text-sm font-bold text-text-primary outline-none focus:border-purple-500/50 transition-all"
                      />
                      {manualGroups.length > 1 && (
                        <button onClick={() => removeGroup(gi)} className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {enrolledStudents.map(s => {
                        const inThisGroup = group.studentIds.includes(s.studentId);
                        const inOtherGroup = !inThisGroup && isAssigned(s.studentId);
                        return (
                          <button
                            key={s.studentId}
                            disabled={inOtherGroup}
                            onClick={() => toggleStudent(gi, s.studentId)}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                              inThisGroup ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' :
                              inOtherGroup ? 'bg-bg-surface border-border-subtle text-text-muted opacity-40 cursor-not-allowed' :
                              'bg-bg-surface border-border-subtle text-text-secondary hover:border-purple-500/30 hover:text-purple-400'
                            }`}
                          >
                            {inThisGroup && <Check className="w-3 h-3 inline mr-1" />}
                            {s.studentName}
                            {s.rollNumber && <span className="opacity-60 ml-1">· {s.rollNumber}</span>}
                          </button>
                        );
                      })}
                    </div>
                    <div className="text-xs text-text-muted">{group.studentIds.length} student{group.studentIds.length !== 1 ? 's' : ''} selected</div>
                  </div>
                ))}
                <button onClick={addGroup} className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-bold transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add Group
                </button>
                {error && <p className="text-xs text-red-400">{error}</p>}
                <button
                  onClick={handleManual} disabled={forming}
                  className="flex items-center gap-2 px-5 py-2.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-bold rounded-xl hover:bg-purple-500/20 transition-all disabled:opacity-50"
                >
                  {forming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Confirm Groups
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── GitHub Activity Viewer ───────────────────────────────────────────────────
function GitHubViewer({ courseId, groupId }) {
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('commits');

  const fetch = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get(`/project-space/${courseId}/groups/${groupId}/github`);
      setActivity(res.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to fetch GitHub activity');
    } finally { setLoading(false); }
  }, [courseId, groupId]);

  useEffect(() => { fetch(); }, [fetch]);

  if (loading) return (
    <div className="flex items-center gap-2 py-6 text-sm text-text-muted">
      <Loader2 className="w-4 h-4 animate-spin" /> Fetching GitHub activity...
    </div>
  );

  if (error) return (
    <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
      <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
    </div>
  );

  if (!activity) return null;

  const tabs = [
    { id: 'commits', label: 'Commits', icon: GitCommit, count: activity.recentCommits?.length },
    { id: 'prs', label: 'Pull Requests', icon: GitPullRequest, count: activity.pullRequests?.length },
    { id: 'branches', label: 'Branches', icon: GitBranch, count: activity.branches?.length },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <a href={activity.githubUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm font-bold text-primary-400 hover:text-primary-300 transition-colors">
          <Github className="w-4 h-4" /> {activity.repoName}
          <ExternalLink className="w-3 h-3" />
        </a>
        <button onClick={fetch} className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="flex items-center gap-1 border-b border-border-subtle">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 -mb-px transition-all ${
                activeTab === tab.id ? 'text-primary-400 border-primary-500' : 'text-text-muted border-transparent hover:text-text-secondary'
              }`}>
              <Icon className="w-3.5 h-3.5" />{tab.label}
              {tab.count > 0 && <span className="ml-0.5 text-[10px] bg-bg-elevated px-1.5 py-0.5 rounded-full">{tab.count}</span>}
            </button>
          );
        })}
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto">
        {activeTab === 'commits' && activity.recentCommits?.map((c, i) => (
          <div key={i} className="flex items-start gap-3 p-3 bg-bg-surface border border-border-subtle rounded-xl">
            <GitCommit className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-primary truncate">{c.message}</p>
              <p className="text-[11px] text-text-muted mt-0.5">{c.author} · {fmtTime(c.date)}</p>
            </div>
            <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-primary-400 transition-colors shrink-0">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <code className="text-[10px] font-mono text-text-muted shrink-0">{c.sha}</code>
          </div>
        ))}

        {activeTab === 'prs' && activity.pullRequests?.map((pr, i) => (
          <div key={i} className="flex items-start gap-3 p-3 bg-bg-surface border border-border-subtle rounded-xl">
            <GitPullRequest className={`w-4 h-4 shrink-0 mt-0.5 ${
              pr.state === 'merged' ? 'text-purple-400' :
              pr.state === 'open' ? 'text-emerald-400' : 'text-red-400'
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-primary truncate">#{pr.number} {pr.title}</p>
              <p className="text-[11px] text-text-muted mt-0.5">
                {pr.author} · {pr.sourceBranch} → {pr.targetBranch}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  pr.state === 'merged' ? 'bg-purple-500/10 text-purple-400' :
                  pr.state === 'open' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                }`}>{pr.state}</span>
                <span className="text-[10px] text-text-muted">{fmtTime(pr.createdAt)}</span>
              </div>
            </div>
            <a href={pr.url} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-primary-400 transition-colors shrink-0">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}

        {activeTab === 'branches' && activity.branches?.map((b, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-bg-surface border border-border-subtle rounded-xl">
            <GitBranch className="w-4 h-4 text-text-muted shrink-0" />
            <span className="text-xs font-mono font-semibold text-text-primary flex-1">{b.name}</span>
            {b.lastCommitSha && <code className="text-[10px] font-mono text-text-muted">{b.lastCommitSha.slice(0, 7)}</code>}
            {b.name === activity.defaultBranch && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary-500/10 text-primary-400">default</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Group Card (Instructor view) ─────────────────────────────────────────────
function InstructorGroupCard({ group, courseId, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [showGithub, setShowGithub] = useState(false);
  const [repoForm, setRepoForm] = useState({ githubUrl: '', repoName: '', defaultBranch: 'main' });
  const [assignForm, setAssignForm] = useState({ projectTitle: '', projectDoc: '' });
  const [linkingRepo, setLinkingRepo] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [showRepoForm, setShowRepoForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [error, setError] = useState('');

  const handleLinkRepo = async () => {
    if (!repoForm.githubUrl.trim() || !repoForm.repoName.trim()) { setError('URL and repo name required'); return; }
    setLinkingRepo(true); setError('');
    try {
      await api.put(`/project-space/${courseId}/groups/${group.id}/repo`, repoForm);
      onRefresh();
      setShowRepoForm(false);
    } catch (e) { setError(e.response?.data?.message || 'Failed to link repo'); }
    finally { setLinkingRepo(false); }
  };

  const handleAssign = async () => {
    if (!assignForm.projectTitle.trim()) { setError('Project title required'); return; }
    setAssigning(true); setError('');
    try {
      await api.put(`/project-space/${courseId}/groups/${group.id}/assign`, assignForm);
      onRefresh();
      setShowAssignForm(false);
    } catch (e) { setError(e.response?.data?.message || 'Failed to assign project'); }
    finally { setAssigning(false); }
  };

  const handleReview = async (action, rejectionReason) => {
    try {
      await api.put(`/project-space/${courseId}/groups/${group.id}/proposal/review`, { action, rejectionReason });
      onRefresh();
    } catch (e) { setError(e.response?.data?.message || 'Failed to review proposal'); }
  };

  return (
    <motion.div layout className="border border-border-subtle bg-bg-surface rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpanded(v => !v)}>
        <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
          <Users className="w-4 h-4 text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-text-primary">{group.name}</span>
            <GroupStatusBadge status={group.status} />
            {group.assignedByInstructor && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-bold">Instructor Assigned</span>
            )}
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            {group.members?.length || 0} members
            {group.projectTitle && ` · ${group.projectTitle}`}
          </p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="overflow-hidden border-t border-border-subtle/50">
            <div className="p-4 space-y-4">
              {/* Members */}
              <div>
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Members</p>
                <div className="flex flex-wrap gap-2">
                  {group.members?.map(m => (
                    <div key={m.studentId} className="flex items-center gap-2 px-3 py-1.5 bg-bg-elevated border border-border-subtle rounded-xl">
                      <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-[10px] font-bold">
                        {m.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-text-primary">{m.name}</p>
                        {m.githubUsername && (
                          <p className="text-[10px] text-text-muted flex items-center gap-1">
                            <Github className="w-2.5 h-2.5" />{m.githubUsername}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Proposal review */}
              {group.proposal && (
                <div className="p-4 bg-bg-elevated border border-border-subtle rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Proposal</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      group.proposal.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' :
                      group.proposal.status === 'REJECTED' ? 'bg-red-500/10 text-red-400' :
                      'bg-amber-500/10 text-amber-400'
                    }`}>{group.proposal.status}</span>
                  </div>
                  <p className="text-sm font-bold text-text-primary">{group.proposal.projectTitle}</p>
                  {group.proposal.description && <p className="text-xs text-text-secondary">{group.proposal.description}</p>}
                  {group.proposal.docUrl && (
                    <a href={group.proposal.docUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 font-semibold">
                      <FileText className="w-3.5 h-3.5" /> View Document
                    </a>
                  )}
                  {group.proposal.status === 'PENDING' && (
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => handleReview('APPROVE')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-500/20 transition-all">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button onClick={() => {
                        const reason = window.prompt('Rejection reason:');
                        if (reason) handleReview('REJECT', reason);
                      }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-lg hover:bg-red-500/20 transition-all">
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Assign project (for groups without approved proposal) */}
              {!group.isProposalApproved && (
                <div>
                  {!showAssignForm ? (
                    <button onClick={() => setShowAssignForm(true)}
                      className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 font-bold transition-colors">
                      <AlertTriangle className="w-3.5 h-3.5" /> Assign Project to This Group
                    </button>
                  ) : (
                    <div className="p-4 bg-orange-500/5 border border-orange-500/15 rounded-xl space-y-3">
                      <p className="text-xs font-bold text-orange-400">Assign Project Directly</p>
                      <input type="text" placeholder="Project title" value={assignForm.projectTitle}
                        onChange={e => setAssignForm(f => ({ ...f, projectTitle: e.target.value }))}
                        className="w-full h-9 bg-bg-elevated border border-border-subtle rounded-lg px-3 text-sm text-text-primary outline-none focus:border-orange-500/50 transition-all" />
                      <textarea rows={2} placeholder="What they need to build (description or doc URL)"
                        value={assignForm.projectDoc}
                        onChange={e => setAssignForm(f => ({ ...f, projectDoc: e.target.value }))}
                        className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-orange-500/50 transition-all resize-none" />
                      {error && <p className="text-xs text-red-400">{error}</p>}
                      <div className="flex gap-2">
                        <button onClick={() => setShowAssignForm(false)} className="px-3 py-1.5 text-xs text-text-muted bg-bg-elevated border border-border-subtle rounded-lg">Cancel</button>
                        <button onClick={handleAssign} disabled={assigning}
                          className="flex items-center gap-1.5 px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold rounded-lg hover:bg-orange-500/20 disabled:opacity-50 transition-all">
                          {assigning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                          Assign
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Repo linking */}
              {group.repo ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Github className="w-4 h-4 text-text-muted" />
                      <a href={group.repo.githubUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-mono text-primary-400 hover:text-primary-300 flex items-center gap-1">
                        {group.repo.repoName} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <button onClick={() => setShowGithub(v => !v)}
                      className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary font-semibold">
                      <Eye className="w-3.5 h-3.5" /> {showGithub ? 'Hide' : 'Activity'}
                    </button>
                  </div>
                  {showGithub && <GitHubViewer courseId={courseId} groupId={group.id} />}
                </div>
              ) : (
                <div>
                  {!showRepoForm ? (
                    <button onClick={() => setShowRepoForm(true)}
                      className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 font-bold transition-colors">
                      <Link className="w-3.5 h-3.5" /> Link GitHub Repo
                    </button>
                  ) : (
                    <div className="p-4 bg-primary-500/5 border border-primary-500/15 rounded-xl space-y-3">
                      <p className="text-xs font-bold text-primary-400">Link GitHub Repository</p>
                      <input type="text" placeholder="https://github.com/owner/repo" value={repoForm.githubUrl}
                        onChange={e => setRepoForm(f => ({ ...f, githubUrl: e.target.value }))}
                        className="w-full h-9 bg-bg-elevated border border-border-subtle rounded-lg px-3 text-sm text-text-primary font-mono outline-none focus:border-primary-500/50 transition-all" />
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" placeholder="Repo name" value={repoForm.repoName}
                          onChange={e => setRepoForm(f => ({ ...f, repoName: e.target.value }))}
                          className="h-9 bg-bg-elevated border border-border-subtle rounded-lg px-3 text-sm text-text-primary outline-none focus:border-primary-500/50 transition-all" />
                        <input type="text" placeholder="Default branch (main)" value={repoForm.defaultBranch}
                          onChange={e => setRepoForm(f => ({ ...f, defaultBranch: e.target.value }))}
                          className="h-9 bg-bg-elevated border border-border-subtle rounded-lg px-3 text-sm text-text-primary outline-none focus:border-primary-500/50 transition-all" />
                      </div>
                      {error && <p className="text-xs text-red-400">{error}</p>}
                      <div className="flex gap-2">
                        <button onClick={() => setShowRepoForm(false)} className="px-3 py-1.5 text-xs text-text-muted bg-bg-elevated border border-border-subtle rounded-lg">Cancel</button>
                        <button onClick={handleLinkRepo} disabled={linkingRepo}
                          className="flex items-center gap-1.5 px-4 py-1.5 bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-bold rounded-lg hover:bg-primary-500/20 disabled:opacity-50 transition-all">
                          {linkingRepo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link className="w-3.5 h-3.5" />}
                          Link Repo
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Individual reports */}
              {group.reports?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Individual Reports ({group.reports.length})</p>
                  <div className="space-y-1.5">
                    {group.reports.map(r => (
                      <div key={r.id} className="flex items-center gap-3 p-2.5 bg-bg-elevated border border-border-subtle rounded-lg">
                        <FileText className="w-3.5 h-3.5 text-text-muted shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-text-primary">{r.studentName}</p>
                          {r.rollNumber && <p className="text-[10px] text-text-muted">{r.rollNumber}</p>}
                        </div>
                        <a href={r.fileUrl} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-primary-400 hover:text-primary-300 font-semibold flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" /> View
                        </a>
                        <span className="text-[10px] text-text-muted">{fmt(r.submittedAt)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Student Project View ─────────────────────────────────────────────────────
function StudentMetricCard({ label, value, helper, accent }) {
  return (
    <div className={`rounded-2xl border p-4 ${accent}`}>
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">{label}</div>
      <div className="mt-2 text-2xl font-syne font-extrabold text-text-primary">{value}</div>
      {helper && <div className="mt-1 text-xs text-text-secondary">{helper}</div>}
    </div>
  );
}

function StudentDocumentUploader({
  title,
  description,
  value,
  fileName,
  uploading,
  error,
  actionLabel,
  onUpload,
  onClear,
  onManualChange,
}) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-elevated/50 p-4">
      <div>
        <div className="text-sm font-bold text-text-primary">{title}</div>
        <div className="mt-1 text-xs leading-relaxed text-text-secondary">{description}</div>
      </div>
      <div className="mt-4 space-y-3">
        <label className="relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-sky-400/25 bg-sky-500/5 px-4 py-5 text-center transition-all hover:border-sky-300/40 hover:bg-sky-500/10">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={onUpload}
            disabled={uploading}
          />
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-sky-300" />
              <div className="mt-2 text-sm font-bold text-sky-200">Uploading document...</div>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 text-sky-300" />
              <div className="mt-2 text-sm font-bold text-text-primary">{actionLabel}</div>
              <div className="mt-1 text-xs text-text-secondary">PDF, JPG or PNG up to 5MB</div>
            </>
          )}
        </label>

        <input
          type="text"
          value={value}
          onChange={e => onManualChange(e.target.value)}
          placeholder="Or paste an existing document URL"
          className="w-full h-10 rounded-xl border border-border-subtle bg-bg-surface px-4 text-sm text-text-primary outline-none transition-all placeholder:text-text-muted focus:border-sky-400/40"
        />

        {value && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">Document Ready</div>
              <div className="mt-1 truncate text-sm font-semibold text-text-primary">{fileName || 'Uploaded document'}</div>
            </div>
            <div className="flex items-center gap-2">
              <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-primary-300 hover:text-primary-200">
                View
              </a>
              <button type="button" onClick={onClear} className="text-xs font-bold text-red-300 hover:text-red-200">
                Clear
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

function StudentProjectView({ courseId, space }) {
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noGroup, setNoGroup] = useState(false);
  const [proposalForm, setProposalForm] = useState({ projectTitle: '', description: '', docUrl: '' });
  const [reportForm, setReportForm] = useState({ fileUrl: '', description: '' });
  const [submittingProposal, setSubmittingProposal] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);
  const [uploadingProposalDoc, setUploadingProposalDoc] = useState(false);
  const [uploadingReportDoc, setUploadingReportDoc] = useState(false);
  const [proposalDocName, setProposalDocName] = useState('');
  const [reportDocName, setReportDocName] = useState('');
  const [showGithub, setShowGithub] = useState(false);
  const [error, setError] = useState('');
  const [reportError, setReportError] = useState('');
  const [groupLoadError, setGroupLoadError] = useState('');

  const fetchGroup = useCallback(async () => {
    setLoading(true);
    setNoGroup(false);
    setGroupLoadError('');
    try {
      const res = await api.get(`/project-space/${courseId}/my-group`);
      setGroup(res.data);
      setNoGroup(false);
    } catch (e) {
      setGroup(null);
      if (e.response?.status === 404) setNoGroup(true);
      else setGroupLoadError(e.response?.data?.message || 'Failed to load your project group');
    } finally { setLoading(false); }
  }, [courseId]);

  useEffect(() => { fetchGroup(); }, [fetchGroup]);

  const handleProposalUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingProposalDoc(true);
    setError('');
    try {
      const uploaded = await uploadFileToCloudinary(file, {
        folder: 'capstone/project-space/proposals',
        allowedTypes: STUDENT_DOC_TYPES,
      });
      setProposalForm(form => ({ ...form, docUrl: uploaded.url }));
      setProposalDocName(uploaded.originalName);
    } catch (uploadError) {
      setError(uploadError.message || 'Failed to upload proposal document');
    } finally {
      setUploadingProposalDoc(false);
      event.target.value = '';
    }
  };

  const handleReportUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingReportDoc(true);
    setReportError('');
    try {
      const uploaded = await uploadFileToCloudinary(file, {
        folder: 'capstone/project-space/reports',
        allowedTypes: STUDENT_DOC_TYPES,
      });
      setReportForm(form => ({ ...form, fileUrl: uploaded.url }));
      setReportDocName(uploaded.originalName);
    } catch (uploadError) {
      setReportError(uploadError.message || 'Failed to upload report');
    } finally {
      setUploadingReportDoc(false);
      event.target.value = '';
    }
  };

  const handleSubmitProposal = async () => {
    if (!proposalForm.projectTitle.trim()) { setError('Title required'); return; }
    setSubmittingProposal(true); setError('');
    try {
      await api.post(`/project-space/${courseId}/proposal`, proposalForm);
      setProposalDocName('');
      fetchGroup();
    } catch (e) { setError(e.response?.data?.message || 'Failed to submit proposal'); }
    finally { setSubmittingProposal(false); }
  };

  const handleSubmitReport = async () => {
    if (!reportForm.fileUrl.trim()) { setReportError('File URL required'); return; }
    setSubmittingReport(true); setReportError('');
    try {
      await api.post(`/project-space/${courseId}/report`, reportForm);
      setReportDocName('');
      fetchGroup();
    } catch (e) { setReportError(e.response?.data?.message || 'Failed to submit report'); }
    finally { setSubmittingReport(false); }
  };

  if (loading) return (
    <div className="flex items-center gap-2 py-8 text-sm text-text-muted">
      <Loader2 className="w-4 h-4 animate-spin" /> Loading your project group...
    </div>
  );

  if (groupLoadError) return (
    <div className="flex items-start justify-between gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-red-400">Could not load your project group</p>
          <p className="text-xs text-red-300 mt-1">{groupLoadError}</p>
        </div>
      </div>
      <button
        onClick={fetchGroup}
        className="shrink-0 px-3 py-1.5 text-xs font-bold rounded-lg border border-red-500/20 text-red-300 hover:bg-red-500/10 transition-all"
      >
        Retry
      </button>
    </div>
  );

  if (noGroup) return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_38%),linear-gradient(145deg,rgba(15,23,42,0.96),rgba(2,6,23,0.92))]">
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-16 h-16 rounded-3xl border border-white/10 bg-white/5 flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-sky-300" />
        </div>
        <p className="text-text-primary text-lg font-bold font-syne mb-2">Team formation is in progress</p>
        <p className="text-text-secondary text-sm max-w-md">Your instructor has opened the project space for this course, but your group has not been allocated yet.</p>
      </div>
    </div>
  );

  if (!group) return null;

  const myMember = group.members?.find(member => member.email === user?.email);
  const myReport = group.reports?.find(r => r.studentId === myMember?.studentId);

  return (
    <div className="space-y-5">
      {/* Group info */}
      <div className="relative overflow-hidden p-6 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(34,197,94,0.16),_transparent_28%),linear-gradient(140deg,rgba(15,23,42,0.96),rgba(2,6,23,0.92))] border border-white/10 rounded-[28px] space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-400/20 bg-sky-500/10 text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200">
              <FolderGit2 className="w-3.5 h-3.5" />
              Student Project Space
            </div>
            <h4 className="mt-4 text-2xl font-bold font-syne text-white">{space?.courseTitle || group.name}</h4>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              A focused workspace for your team’s proposal, repository, and individual report submissions.
            </p>
            {space?.projectDescription && (
              <p className="mt-4 text-sm text-slate-200/90 leading-relaxed bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                {space.projectDescription}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted mb-2">Assigned Team</p>
            <p className="text-lg font-bold text-white">{group.name}</p>
            <p className="text-xs text-slate-300 mt-1">{group.members?.length} members</p>
            <div className="mt-3">
              <GroupStatusBadge status={group.status} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <StudentMetricCard label="Members" value={group.members?.length || 0} helper="Allocated to this course" accent="border-white/10 bg-white/5" />
          <StudentMetricCard label="Proposal" value={group.proposal?.status || 'Draft'} helper={group.proposal?.projectTitle || 'Ready to submit'} accent="border-sky-400/20 bg-sky-500/10" />
          <StudentMetricCard label="Repository" value={group.repo ? 'Linked' : 'Pending'} helper={group.repo?.repoName || 'Waiting for instructor'} accent="border-violet-400/20 bg-violet-500/10" />
          <StudentMetricCard label="My Report" value={myReport ? 'Submitted' : 'Pending'} helper={myReport ? fmt(myReport.submittedAt) : 'Upload contribution summary'} accent="border-emerald-400/20 bg-emerald-500/10" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Proposal Deadline</p>
            <p className="mt-2 text-sm font-semibold text-text-primary">{space?.proposalDeadline ? fmtTime(space.proposalDeadline) : 'Not set yet'}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Project Deadline</p>
            <p className="mt-2 text-sm font-semibold text-text-primary">{space?.projectDeadline ? fmtTime(space.projectDeadline) : 'Not set yet'}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {group.members?.map(m => (
            <div key={m.studentId} className={`flex items-center gap-2 px-3 py-2 border rounded-xl ${m.studentId === myMember?.studentId ? 'bg-sky-500/10 border-sky-400/20' : 'bg-white/5 border-white/10'}`}>
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 text-[10px] font-bold">
                {m.name?.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-semibold text-white">{m.name}</p>
                <div className="flex items-center gap-2">
                  {m.githubUsername && <p className="text-[10px] text-slate-300">@{m.githubUsername}</p>}
                  {m.studentId === myMember?.studentId && <span className="text-[10px] text-sky-200 font-bold uppercase tracking-[0.15em]">You</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {group.projectTitle && (
          <div className="p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
            <p className="text-xs font-bold text-emerald-400 mb-1">Project</p>
            <p className="text-sm font-bold text-text-primary">{group.projectTitle}</p>
            {group.assignedByInstructor && group.instructorAssignedDoc && (
              <p className="text-xs text-text-secondary mt-1">{group.instructorAssignedDoc}</p>
            )}
          </div>
        )}
      </div>

      {/* Proposal form */}
      {!group.isProposalApproved && (
        <div className="p-5 bg-bg-surface border border-border-subtle rounded-2xl space-y-4">
          <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" /> Project Proposal
          </h4>

          {group.proposal ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  group.proposal.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-red-500/10 text-red-400'
                }`}>{group.proposal.status}</span>
                <span className="text-xs text-text-muted">{group.proposal.projectTitle}</span>
              </div>
              {group.proposal.status === 'REJECTED' && (
                <p className="text-xs text-red-400 bg-red-500/8 border border-red-500/15 px-3 py-2 rounded-lg">
                  Rejected: {group.proposal.rejectionReason}
                </p>
              )}
            </div>
          ) : null}

          {(!group.proposal || group.proposal?.status === 'REJECTED') && (
            <div className="space-y-3">
              <input type="text" placeholder="Project title *" value={proposalForm.projectTitle}
                onChange={e => setProposalForm(f => ({ ...f, projectTitle: e.target.value }))}
                className="w-full h-10 bg-bg-elevated border border-border-subtle rounded-xl px-4 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-blue-500/50 transition-all" />
              <textarea rows={2} placeholder="Brief description of what your team will build"
                value={proposalForm.description}
                onChange={e => setProposalForm(f => ({ ...f, description: e.target.value }))}
                className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-blue-500/50 transition-all resize-none" />
              <StudentDocumentUploader
                title="Proposal document"
                description="Upload your proposal PDF or images through Cloudinary, or paste an existing link if you already have one."
                value={proposalForm.docUrl}
                fileName={proposalDocName}
                uploading={uploadingProposalDoc}
                error={error}
                actionLabel="Upload proposal file"
                onUpload={handleProposalUpload}
                onClear={() => {
                  setProposalForm(f => ({ ...f, docUrl: '' }));
                  setProposalDocName('');
                  setError('');
                }}
                onManualChange={(value) => {
                  setProposalForm(f => ({ ...f, docUrl: value }));
                  if (!value) setProposalDocName('');
                }}
              />
              <button onClick={handleSubmitProposal} disabled={submittingProposal}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold rounded-xl hover:bg-blue-500/20 disabled:opacity-50 transition-all">
                {submittingProposal ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit Proposal
              </button>
            </div>
          )}
        </div>
      )}

      {/* GitHub repo view (if linked) */}
      {group.repo && (
        <div className="p-5 bg-bg-surface border border-border-subtle rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Github className="w-4 h-4 text-text-muted" /> GitHub Repository
            </h4>
            <button onClick={() => setShowGithub(v => !v)}
              className="text-xs text-primary-400 hover:text-primary-300 font-semibold flex items-center gap-1 transition-colors">
              <Eye className="w-3.5 h-3.5" /> {showGithub ? 'Hide' : 'View Activity'}
            </button>
          </div>
          <a href={group.repo.githubUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-mono text-primary-400 hover:text-primary-300 transition-colors">
            {group.repo.repoName} <ExternalLink className="w-3.5 h-3.5" />
          </a>
          {showGithub && <GitHubViewer courseId={courseId} groupId={group.id} />}
        </div>
      )}

      {/* Individual report */}
      <div className="p-5 bg-bg-surface border border-border-subtle rounded-2xl space-y-4">
        <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <Upload className="w-4 h-4 text-amber-400" /> Individual Report
        </h4>
        {myReport ? (
          <div className="flex items-center gap-3 p-3 bg-emerald-500/8 border border-emerald-500/15 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <div className="flex-1">
              <p className="text-xs font-bold text-emerald-400">Report submitted</p>
              <p className="text-[11px] text-text-muted">{fmt(myReport.submittedAt)}</p>
            </div>
            <a href={myReport.fileUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-primary-400 hover:text-primary-300 font-semibold flex items-center gap-1">
              <ExternalLink className="w-3 h-3" /> View
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            <StudentDocumentUploader
              title="Contribution report"
              description="Upload the report directly to Cloudinary, or paste an existing report URL if you already have one."
              value={reportForm.fileUrl}
              fileName={reportDocName}
              uploading={uploadingReportDoc}
              error={reportError}
              actionLabel="Upload report file"
              onUpload={handleReportUpload}
              onClear={() => {
                setReportForm(f => ({ ...f, fileUrl: '' }));
                setReportDocName('');
                setReportError('');
              }}
              onManualChange={(value) => {
                setReportForm(f => ({ ...f, fileUrl: value }));
                if (!value) setReportDocName('');
              }}
            />
            <textarea rows={2} placeholder="Brief summary of your individual contribution"
              value={reportForm.description}
              onChange={e => setReportForm(f => ({ ...f, description: e.target.value }))}
              className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-amber-500/50 transition-all resize-none" />
            <button onClick={handleSubmitReport} disabled={submittingReport}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-bold rounded-xl hover:bg-amber-500/20 disabled:opacity-50 transition-all">
              {submittingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Submit Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function ProjectSpacePanel({ courseId }) {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';

  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noSpace, setNoSpace] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [resettingGroups, setResettingGroups] = useState(false);

  const fetchSpace = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await api.get(`/project-space/${courseId}`);
      setSpace(res.data);
      setNoSpace(false);
    } catch (e) {
      setSpace(null);
      if (e.response?.status === 404) {
        setNoSpace(true);
      } else {
        setNoSpace(false);
        setLoadError(e.response?.data?.message || 'Failed to load project space');
      }
    } finally { setLoading(false); }
  }, [courseId]);

  const handleResetGroups = useCallback(async () => {
    const confirmed = window.confirm('This will remove all current groups so you can form them again. Continue?');
    if (!confirmed) return;

    setResettingGroups(true);
    setLoadError('');
    try {
      const res = await api.delete(`/project-space/${courseId}/groups`);
      setSpace(res.data);
    } catch (e) {
      setLoadError(e.response?.data?.message || 'Failed to reset groups');
    } finally {
      setResettingGroups(false);
    }
  }, [courseId]);

  useEffect(() => { fetchSpace(); }, [fetchSpace]);

  if (loading) return (
    <div className="flex items-center gap-2 py-8 text-sm text-text-muted">
      <Loader2 className="w-4 h-4 animate-spin" /> Loading project space...
    </div>
  );

  if (loadError && !space) return (
    <div className="flex items-start justify-between gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-red-400">Could not load project space</p>
          <p className="text-xs text-red-300 mt-1">{loadError}</p>
        </div>
      </div>
      <button
        onClick={fetchSpace}
        className="shrink-0 px-3 py-1.5 text-xs font-bold rounded-lg border border-red-500/20 text-red-300 hover:bg-red-500/10 transition-all"
      >
        Retry
      </button>
    </div>
  );

  // Student view
  if (isStudent) {
    if (noSpace) return (
      <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border-subtle rounded-2xl">
        <FolderGit2 className="w-12 h-12 text-text-muted mb-3 opacity-30" />
        <p className="text-text-secondary text-sm font-bold mb-1">No project space yet</p>
        <p className="text-text-muted text-xs">Your instructor hasn't set up the project space for this course yet.</p>
      </div>
    );
    return <StudentProjectView courseId={courseId} space={space} />;
  }

  // Instructor: create space if none
  if (noSpace) return <CreateSpaceForm courseId={courseId} onCreated={(s) => { setSpace(s); setNoSpace(false); }} />;

  if (!space) return null;

  // Instructor: space exists
  return (
    <div className="space-y-6">
      {/* Space header */}
      <div className="p-5 bg-purple-500/5 border border-purple-500/15 rounded-2xl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
              <FolderGit2 className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-text-primary">Project Space</h4>
              <p className="text-xs text-text-muted">Groups of {space.groupSize} · {space.groups?.length || 0} groups formed</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-text-muted flex-wrap">
            {space.isGroupsFormed && (
              <button
                onClick={handleResetGroups}
                disabled={resettingGroups}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/20 text-amber-300 hover:bg-amber-500/10 transition-all disabled:opacity-50"
              >
                {resettingGroups ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                Re-form Groups
              </button>
            )}
            {space.proposalDeadline && (
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Proposal by {fmt(space.proposalDeadline)}</span>
            )}
            {space.projectDeadline && (
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Project by {fmt(space.projectDeadline)}</span>
            )}
          </div>
        </div>
        {space.projectDescription && (
          <p className="text-xs text-text-secondary mt-3 leading-relaxed">{space.projectDescription}</p>
        )}
        {/* Stats strip */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            { label: 'Groups', val: space.groups?.length || 0 },
            { label: 'Proposals', val: space.groups?.filter(g => g.proposal).length || 0 },
            { label: 'Approved', val: space.groups?.filter(g => g.isProposalApproved).length || 0 },
            { label: 'With Repo', val: space.groups?.filter(g => g.repo).length || 0 },
          ].map(s => (
            <div key={s.label} className="text-center p-2 bg-bg-surface/40 rounded-xl border border-border-subtle/40">
              <div className="text-lg font-bold font-syne text-purple-400">{s.val}</div>
              <div className="text-[10px] text-text-muted font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Group formation */}
      {!space.isGroupsFormed && (
        <GroupFormation courseId={courseId} space={space} onRefresh={fetchSpace} />
      )}

      {/* Groups list */}
      {space.isGroupsFormed && space.groups?.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" /> Groups ({space.groups.length})
          </h4>
          {space.groups.map(group => (
            <InstructorGroupCard
              key={group.id}
              group={group}
              courseId={courseId}
              onRefresh={fetchSpace}
            />
          ))}
        </div>
      )}
    </div>
  );
}
