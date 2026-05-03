import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  Clock,
  FolderGit2,
  Loader2,
  RefreshCw,
  Search,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GroupCardSkeleton } from '../../components/shared/Skeletons';
import CreateSpaceForm from '../../features/project-space/CreateSpaceForm';
import GroupFormation from '../../features/project-space/GroupFormation';
import InstructorGroupCard from '../../features/project-space/InstructorGroupCard';
import ProjectActivityTimeline from '../../features/project-space/ProjectActivityTimeline';
import StudentProjectView from '../../features/project-space/StudentProjectView';
import { fetchProjectSpace, resetProjectGroups } from '../../features/project-space/api';
import { fmt } from '../../features/project-space/shared';

function HeroStat({ label, value, color, bg, border }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl border p-4 ${bg} ${border}`}>
      <div className={`font-display text-2xl font-bold ${color}`}>{value}</div>
      <div className={`mt-1 text-[10px] font-bold uppercase tracking-[0.2em] ${color} opacity-60`}>{label}</div>
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
    } catch (err) {
      setSpace(null);
      if (err.response?.status === 404) {
        setNoSpace(true);
      } else {
        setNoSpace(false);
        setLoadError(err.response?.data?.message || 'Failed to load project space');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [courseId]);

  const handleResetGroups = useCallback(async () => {
    const confirmed = window.confirm('This will remove all current groups so you can form them again. Continue?');
    if (!confirmed) return;

    setResettingGroups(true);
    setLoadError('');

    try {
      const data = await resetProjectGroups(courseId);
      setSpace(data);
    } catch (err) {
      setLoadError(err.response?.data?.message || 'Failed to reset groups');
    } finally {
      setResettingGroups(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchSpace();
  }, [fetchSpace]);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-48 animate-pulse rounded-2xl border border-border-subtle bg-bg-surface" />
        <GroupCardSkeleton count={3} />
      </div>
    );
  }

  if (loadError && !space) {
    return (
      <div className="flex items-start justify-between gap-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <div>
            <p className="text-sm font-bold text-red-400">Could not load project space</p>
            <p className="mt-1 text-xs text-red-300">{loadError}</p>
          </div>
        </div>
        <button
          onClick={fetchSpace}
          className="shrink-0 rounded-xl border border-red-500/20 px-3 py-1.5 text-xs font-bold text-red-300 transition-all hover:bg-red-500/10"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isStudent && noSpace) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-subtle py-16 text-center">
        <FolderGit2 className="mb-3 h-12 w-12 text-text-muted opacity-30" />
        <p className="mb-1 text-sm font-bold text-text-secondary">No project space yet</p>
        <p className="text-xs text-text-muted">Your instructor hasn't set up the project space for this course yet.</p>
      </div>
    );
  }

  if (isStudent) return <StudentProjectView courseId={courseId} space={space} />;

  if (noSpace) {
    return (
      <CreateSpaceForm courseId={courseId} onCreated={(createdSpace) => { setSpace(createdSpace); setNoSpace(false); }} />
    );
  }

  if (!space) return null;

  const groups = space.groups || [];
  const statsRow = [
    { label: 'Groups', value: groups.length, color: 'text-sky-300', bg: 'bg-sky-500/8', border: 'border-sky-400/15' },
    { label: 'Proposals', value: groups.filter((group) => group.proposal).length, color: 'text-amber-300', bg: 'bg-amber-500/8', border: 'border-amber-400/15' },
    { label: 'Approved', value: groups.filter((group) => group.isProposalApproved).length, color: 'text-emerald-300', bg: 'bg-emerald-500/8', border: 'border-emerald-400/15' },
    { label: 'With Repo', value: groups.filter((group) => group.repo).length, color: 'text-violet-300', bg: 'bg-violet-500/8', border: 'border-violet-400/15' },
  ];

  const filteredGroups = groups.filter((group) => {
    const matchesSearch = !groupSearch ||
      group.name?.toLowerCase().includes(groupSearch.toLowerCase()) ||
      group.members?.some((member) => member.name?.toLowerCase().includes(groupSearch.toLowerCase()));

    const matchesFilter =
      groupFilter === 'all' ? true :
        groupFilter === 'approved' ? group.isProposalApproved :
          groupFilter === 'pending' ? group.proposal?.status === 'PENDING' :
            groupFilter === 'no-proposal' ? !group.proposal :
              groupFilter === 'no-repo' ? !group.repo :
                true;

    return matchesSearch && matchesFilter;
  });

  const filterOptions = [
    { id: 'all', label: 'All', count: groups.length },
    { id: 'approved', label: 'Approved', count: groups.filter((group) => group.isProposalApproved).length },
    { id: 'pending', label: 'Pending review', count: groups.filter((group) => group.proposal?.status === 'PENDING').length },
    { id: 'no-proposal', label: 'No proposal', count: groups.filter((group) => !group.proposal).length },
    { id: 'no-repo', label: 'No repo', count: groups.filter((group) => !group.repo).length },
  ].filter((filter) => filter.id === 'all' || filter.count > 0);

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_15%_25%,rgba(99,102,241,0.18),transparent_35%),radial-gradient(circle_at_85%_75%,rgba(14,165,233,0.14),transparent_32%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(2,6,23,0.95))]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.05),transparent_28%)]" />

        <div className="relative p-5">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-violet-200">
                <FolderGit2 className="h-3 w-3" />
                Instructor Control Room
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/8">
                  <FolderGit2 className="h-5 w-5 text-violet-300" />
                </div>
                <div>
                  <h4 className="font-display text-xl font-bold text-white">Project Space</h4>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Groups of {space.groupSize} · {groups.length} group{groups.length !== 1 ? 's' : ''} formed
                  </p>
                </div>
              </div>
              {space.projectDescription && (
                <p className="mt-3 max-w-xl rounded-xl border border-white/8 bg-white/4 px-4 py-2.5 text-sm leading-relaxed text-slate-300">
                  {space.projectDescription}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {space.isGroupsFormed && (
                <button
                  onClick={handleResetGroups}
                  disabled={resettingGroups}
                  className="flex items-center gap-1.5 rounded-xl border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-200 transition-all hover:bg-amber-500/20 disabled:opacity-50"
                >
                  {resettingGroups ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  Re-form Groups
                </button>
              )}
              {space.proposalDeadline && (
                <span className="flex items-center gap-1.5 rounded-xl border border-sky-400/15 bg-sky-500/8 px-3 py-2 text-xs font-semibold text-sky-300">
                  <Clock className="h-3 w-3" />
                  Proposal by {fmt(space.proposalDeadline)}
                </span>
              )}
              {space.projectDeadline && (
                <span className="flex items-center gap-1.5 rounded-xl border border-fuchsia-400/15 bg-fuchsia-500/8 px-3 py-2 text-xs font-semibold text-fuchsia-300">
                  <Clock className="h-3 w-3" />
                  Project by {fmt(space.projectDeadline)}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {statsRow.map((stat) => (
              <HeroStat key={stat.label} {...stat} />
            ))}
          </div>
        </div>
      </div>

      {!space.isGroupsFormed && (
        <GroupFormation courseId={courseId} space={space} onRefresh={fetchSpace} />
      )}

      <ProjectActivityTimeline
        title="Course Activity"
        subtitle="Chronological feed of project events across all groups"
        events={space.recentActivity || []}
        emptyTitle="No course activity yet"
        emptyBody="Timeline events will appear as groups are formed, proposals reviewed, repos linked, and milestones progress."
        compact
        defaultVisible={3}
      />

      {space.isGroupsFormed && groups.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-400" />
              <h4 className="text-sm font-bold text-text-primary">
                Groups
                <span className="ml-2 font-normal text-text-muted">
                  ({filteredGroups.length}{filteredGroups.length !== groups.length ? ` of ${groups.length}` : ''})
                </span>
              </h4>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={groupSearch}
                onChange={(event) => setGroupSearch(event.target.value)}
                placeholder="Search groups or members..."
                className="h-8 w-48 rounded-xl border border-border-subtle bg-bg-elevated pl-7 pr-3 text-xs text-text-primary outline-none transition-all placeholder:text-text-muted focus:border-primary-500/40"
              />
            </div>
          </div>

          {filterOptions.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {filterOptions.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setGroupFilter(filter.id)}
                  className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold transition-all ${
                    groupFilter === filter.id
                      ? 'bg-primary-500/15 border-primary-500/30 text-primary-300'
                      : 'bg-white/4 border-white/10 text-text-muted hover:border-white/20 hover:text-text-secondary'
                  }`}
                >
                  {filter.label}
                  <span className={`ml-0.5 ${groupFilter === filter.id ? 'text-primary-400' : 'text-text-muted'}`}>
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>
          )}

          {filteredGroups.length > 0 ? (
            <div className="space-y-3">
              {filteredGroups.map((group) => (
                <InstructorGroupCard
                  key={group.id}
                  group={group}
                  courseId={courseId}
                  onRefresh={fetchSpace}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-12 text-center">
              <Users className="mb-2 h-8 w-8 text-white/15" />
              <p className="text-sm font-bold text-text-secondary">No groups match this filter</p>
              <button
                onClick={() => {
                  setGroupFilter('all');
                  setGroupSearch('');
                }}
                className="mt-2 text-xs font-semibold text-primary-400 transition-colors hover:text-primary-300"
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
