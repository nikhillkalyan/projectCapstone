import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle, Clock, FolderGit2, Loader2, RefreshCw,
  Users, CheckCircle2, GitBranch, FileText, Search,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CreateSpaceForm from '../../features/project-space/CreateSpaceForm';
import GroupFormation from '../../features/project-space/GroupFormation';
import InstructorGroupCard from '../../features/project-space/InstructorGroupCard';
import ProjectActivityTimeline from '../../features/project-space/ProjectActivityTimeline';
import StudentProjectView from '../../features/project-space/StudentProjectView';
import { fetchProjectSpace, resetProjectGroups } from '../../features/project-space/api';
import { fmt } from '../../features/project-space/shared';

/* ── stat pill used in the hero ── */
function HeroStat({ label, value, color, bg, border }) {
  return (
    <div className={`flex flex-col items-center justify-center p-4 rounded-2xl border ${bg} ${border}`}>
      <div className={`text-2xl font-bold font-display ${color}`}>{value}</div>
      <div className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ${color} opacity-60`}>{label}</div>
    </div>
  );
}

export default function ProjectSpacePanel({ courseId }) {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';

  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noSpace, setNoSpace] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [resettingGroups, setResettingGroups] = useState(false);
  const [groupFilter, setGroupFilter] = useState('all');
  const [groupSearch, setGroupSearch] = useState('');

  const fetchSpace = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setLoadError('');
    try {
      const data = await fetchProjectSpace(courseId);
      setSpace(data);
      setNoSpace(false);
    } catch (e) {
      setSpace(null);
      if (e.response?.status === 404) setNoSpace(true);
      else { setNoSpace(false); setLoadError(e.response?.data?.message || 'Failed to load project space'); }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [courseId]);

  const handleResetGroups = useCallback(async () => {
    const confirmed = window.confirm('This will remove all current groups so you can form them again. Continue?');
    if (!confirmed) return;
    setResettingGroups(true); setLoadError('');
    try { const data = await resetProjectGroups(courseId); setSpace(data); }
    catch (e) { setLoadError(e.response?.data?.message || 'Failed to reset groups'); }
    finally { setResettingGroups(false); }
  }, [courseId]);

  useEffect(() => { fetchSpace(); }, [fetchSpace]);

  /* ── loading ── */
  if (loading) return (
    <div className="flex items-center gap-2 py-8 text-sm text-text-muted">
      <Loader2 className="w-4 h-4 animate-spin text-primary-400" /> Loading project space…
    </div>
  );

  /* ── error ── */
  if (loadError && !space) return (
    <div className="flex items-start justify-between gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-red-400">Could not load project space</p>
          <p className="text-xs text-red-300 mt-1">{loadError}</p>
        </div>
      </div>
      <button onClick={fetchSpace} className="shrink-0 px-3 py-1.5 text-xs font-bold rounded-xl border border-red-500/20 text-red-300 hover:bg-red-500/10 transition-all">
        Retry
      </button>
    </div>
  );

  /* ── student: no space ── */
  if (isStudent && noSpace) return (
    <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border-subtle rounded-2xl">
      <FolderGit2 className="w-12 h-12 text-text-muted mb-3 opacity-30" />
      <p className="text-text-secondary text-sm font-bold mb-1">No project space yet</p>
      <p className="text-text-muted text-xs">Your instructor hasn't set up the project space for this course yet.</p>
    </div>
  );

  /* ── student view ── */
  if (isStudent) return <StudentProjectView courseId={courseId} space={space} />;

  /* ── instructor: no space → create form ── */
  if (noSpace) return (
    <CreateSpaceForm courseId={courseId} onCreated={(s) => { setSpace(s); setNoSpace(false); }} />
  );

  if (!space) return null;

  /* ── derived stats ── */
  const groups = space.groups || [];
  const statsRow = [
    { label: 'Groups', value: groups.length, color: 'text-sky-300', bg: 'bg-sky-500/8', border: 'border-sky-400/15' },
    { label: 'Proposals', value: groups.filter(g => g.proposal).length, color: 'text-amber-300', bg: 'bg-amber-500/8', border: 'border-amber-400/15' },
    { label: 'Approved', value: groups.filter(g => g.isProposalApproved).length, color: 'text-emerald-300', bg: 'bg-emerald-500/8', border: 'border-emerald-400/15' },
    { label: 'With Repo', value: groups.filter(g => g.repo).length, color: 'text-violet-300', bg: 'bg-violet-500/8', border: 'border-violet-400/15' },
  ];

  /* ── filtered groups ── */
  const filteredGroups = groups.filter(g => {
    const matchesSearch = !groupSearch || g.name?.toLowerCase().includes(groupSearch.toLowerCase()) ||
      g.members?.some(m => m.name?.toLowerCase().includes(groupSearch.toLowerCase()));
    const matchesFilter =
      groupFilter === 'all' ? true :
        groupFilter === 'approved' ? g.isProposalApproved :
          groupFilter === 'pending' ? g.proposal?.status === 'PENDING' :
            groupFilter === 'no-proposal' ? !g.proposal :
              groupFilter === 'no-repo' ? !g.repo :
                true;
    return matchesSearch && matchesFilter;
  });

  const filterOptions = [
    { id: 'all', label: 'All', count: groups.length },
    { id: 'approved', label: 'Approved', count: groups.filter(g => g.isProposalApproved).length },
    { id: 'pending', label: 'Pending review', count: groups.filter(g => g.proposal?.status === 'PENDING').length },
    { id: 'no-proposal', label: 'No proposal', count: groups.filter(g => !g.proposal).length },
    { id: 'no-repo', label: 'No repo', count: groups.filter(g => !g.repo).length },
  ].filter(f => f.id === 'all' || f.count > 0);

  return (
    <div className="space-y-5">

      {/* ── hero banner ── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_15%_25%,rgba(99,102,241,0.18),transparent_35%),radial-gradient(circle_at_85%_75%,rgba(14,165,233,0.14),transparent_32%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(2,6,23,0.95))]">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.05),transparent_28%)] pointer-events-none" />

        <div className="relative p-5">
          {/* top row */}
          <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-400/20 bg-violet-500/10 text-[10px] font-bold uppercase tracking-[0.22em] text-violet-200 mb-3">
                <FolderGit2 className="w-3 h-3" />
                Instructor Control Room
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center shrink-0">
                  <FolderGit2 className="w-5 h-5 text-violet-300" />
                </div>
                <div>
                  <h4 className="text-xl font-bold font-display text-white">Project Space</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Groups of {space.groupSize} · {groups.length} group{groups.length !== 1 ? 's' : ''} formed
                  </p>
                </div>
              </div>
              {space.projectDescription && (
                <p className="mt-3 text-sm text-slate-300 leading-relaxed max-w-xl bg-white/4 border border-white/8 rounded-xl px-4 py-2.5">
                  {space.projectDescription}
                </p>
              )}
            </div>

            {/* deadline pills + reset */}
            <div className="flex items-center gap-2 flex-wrap">
              {space.isGroupsFormed && (
                <button
                  onClick={handleResetGroups}
                  disabled={resettingGroups}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-400/20 bg-amber-500/10 text-amber-200 text-xs font-bold hover:bg-amber-500/20 disabled:opacity-50 transition-all"
                >
                  {resettingGroups ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  Re-form Groups
                </button>
              )}
              {space.proposalDeadline && (
                <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-sky-400/15 bg-sky-500/8 text-sky-300 text-xs font-semibold">
                  <Clock className="w-3 h-3" />Proposal by {fmt(space.proposalDeadline)}
                </span>
              )}
              {space.projectDeadline && (
                <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-fuchsia-400/15 bg-fuchsia-500/8 text-fuchsia-300 text-xs font-semibold">
                  <Clock className="w-3 h-3" />Project by {fmt(space.projectDeadline)}
                </span>
              )}
            </div>
          </div>

          {/* stat row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {statsRow.map(s => (
              <HeroStat key={s.label} {...s} />
            ))}
          </div>
        </div>
      </div>

      {/* ── group formation (if not formed yet) ── */}
      {!space.isGroupsFormed && (
        <GroupFormation courseId={courseId} space={space} onRefresh={fetchSpace} />
      )}

      {/* ── activity timeline — compact ── */}
      <ProjectActivityTimeline
        title="Course Activity"
        subtitle="Chronological feed of project events across all groups"
        events={space.recentActivity || []}
        emptyTitle="No course activity yet"
        emptyBody="Timeline events will appear as groups are formed, proposals reviewed, repos linked, and milestones progress."
        compact
        defaultVisible={3}
      />

      {/* ── groups section ── */}
      {space.isGroupsFormed && groups.length > 0 && (
        <div className="space-y-4">
          {/* section header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <h4 className="text-sm font-bold text-text-primary">
                Groups
                <span className="ml-2 text-text-muted font-normal">({filteredGroups.length}{filteredGroups.length !== groups.length ? ` of ${groups.length}` : ''})</span>
              </h4>
            </div>

            {/* search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted pointer-events-none" />
              <input
                type="text"
                value={groupSearch}
                onChange={e => setGroupSearch(e.target.value)}
                placeholder="Search groups or members…"
                className="h-8 pl-7 pr-3 bg-bg-elevated border border-border-subtle rounded-xl text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-primary-500/40 transition-all w-48"
              />
            </div>
          </div>

          {/* filter chips */}
          {filterOptions.length > 1 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {filterOptions.map(f => (
                <button
                  key={f.id}
                  onClick={() => setGroupFilter(f.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${groupFilter === f.id
                      ? 'bg-primary-500/15 border-primary-500/30 text-primary-300'
                      : 'bg-white/4 border-white/10 text-text-muted hover:border-white/20 hover:text-text-secondary'
                    }`}
                >
                  {f.label}
                  <span className={`ml-0.5 ${groupFilter === f.id ? 'text-primary-400' : 'text-text-muted'}`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* group cards */}
          {filteredGroups.length > 0 ? (
            <div className="space-y-3">
              {filteredGroups.map(group => (
                <InstructorGroupCard
                  key={group.id}
                  group={group}
                  courseId={courseId}
                  onRefresh={fetchSpace}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-white/10 rounded-2xl">
              <Users className="w-8 h-8 text-white/15 mb-2" />
              <p className="text-sm font-bold text-text-secondary">No groups match this filter</p>
              <button
                onClick={() => { setGroupFilter('all'); setGroupSearch(''); }}
                className="mt-2 text-xs text-primary-400 hover:text-primary-300 font-semibold transition-colors"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}