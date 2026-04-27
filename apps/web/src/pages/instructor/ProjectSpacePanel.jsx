import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Clock, FolderGit2, Loader2, RefreshCw, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CreateSpaceForm from '../../features/project-space/CreateSpaceForm';
import GroupFormation from '../../features/project-space/GroupFormation';
import InstructorGroupCard from '../../features/project-space/InstructorGroupCard';
import StudentProjectView from '../../features/project-space/StudentProjectView';
import { fetchProjectSpace, resetProjectGroups } from '../../features/project-space/api';
import { fmt } from '../../features/project-space/shared';

export default function ProjectSpacePanel({ courseId }) {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';

  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noSpace, setNoSpace] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [resettingGroups, setResettingGroups] = useState(false);

  const fetchSpace = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setLoadError('');
    try {
      const data = await fetchProjectSpace(courseId);
      setSpace(data);
      setNoSpace(false);
    } catch (e) {
      setSpace(null);
      if (e.response?.status === 404) {
        setNoSpace(true);
      } else {
        setNoSpace(false);
        setLoadError(e.response?.data?.message || 'Failed to load project space');
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
    } catch (e) {
      setLoadError(e.response?.data?.message || 'Failed to reset groups');
    } finally {
      setResettingGroups(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchSpace();
  }, [fetchSpace]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8 text-sm text-text-muted">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading project space...
      </div>
    );
  }

  if (loadError && !space) {
    return (
      <div className="flex items-start justify-between gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-400">Could not load project space</p>
            <p className="text-xs text-red-300 mt-1">{loadError}</p>
          </div>
        </div>
        <button onClick={fetchSpace} className="shrink-0 px-3 py-1.5 text-xs font-bold rounded-lg border border-red-500/20 text-red-300 hover:bg-red-500/10 transition-all">
          Retry
        </button>
      </div>
    );
  }

  if (isStudent) {
    if (noSpace) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border-subtle rounded-2xl">
          <FolderGit2 className="w-12 h-12 text-text-muted mb-3 opacity-30" />
          <p className="text-text-secondary text-sm font-bold mb-1">No project space yet</p>
          <p className="text-text-muted text-xs">Your instructor hasn&apos;t set up the project space for this course yet.</p>
        </div>
      );
    }

    return <StudentProjectView courseId={courseId} space={space} />;
  }

  if (noSpace) {
    return <CreateSpaceForm courseId={courseId} onCreated={(createdSpace) => { setSpace(createdSpace); setNoSpace(false); }} />;
  }

  if (!space) return null;

  const stats = [
    { label: 'Groups', value: space.groups?.length || 0, tone: 'from-sky-500/20 to-cyan-500/10 text-sky-300' },
    { label: 'Proposals', value: space.groups?.filter(group => group.proposal).length || 0, tone: 'from-amber-500/20 to-orange-500/10 text-amber-300' },
    { label: 'Approved', value: space.groups?.filter(group => group.isProposalApproved).length || 0, tone: 'from-emerald-500/20 to-teal-500/10 text-emerald-300' },
    { label: 'With Repo', value: space.groups?.filter(group => group.repo).length || 0, tone: 'from-violet-500/20 to-fuchsia-500/10 text-violet-300' },
  ];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.16),_transparent_28%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(2,6,23,0.94))] p-6 shadow-[0_28px_100px_rgba(2,6,23,0.45)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.06),transparent_30%,transparent_70%,rgba(255,255,255,0.04))]" />
        <div className="relative">
          <div className="flex items-start justify-between flex-wrap gap-5">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-violet-200">
                <FolderGit2 className="w-3.5 h-3.5" />
                Instructor Control Room
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/8 border border-white/10 flex items-center justify-center">
                  <FolderGit2 className="w-6 h-6 text-violet-300" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold font-syne text-white">Project Space</h4>
                  <p className="text-sm text-slate-300">Groups of {space.groupSize} · {space.groups?.length || 0} groups formed</p>
                </div>
              </div>
              {space.projectDescription && (
                <p className="mt-4 max-w-xl rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-relaxed text-slate-200">
                  {space.projectDescription}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap">
              {space.isGroupsFormed && (
                <button
                  onClick={handleResetGroups}
                  disabled={resettingGroups}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-2 text-amber-200 transition-all hover:bg-amber-500/20 disabled:opacity-50"
                >
                  {resettingGroups ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  Re-form Groups
                </button>
              )}
              {space.proposalDeadline && (
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-sky-400/15 bg-sky-500/10 px-3 py-2">
                  <Clock className="w-3.5 h-3.5" />
                  Proposal by {fmt(space.proposalDeadline)}
                </span>
              )}
              {space.projectDeadline && (
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-fuchsia-400/15 bg-fuchsia-500/10 px-3 py-2">
                  <Clock className="w-3.5 h-3.5" />
                  Project by {fmt(space.projectDeadline)}
                </span>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {stats.map(stat => (
              <div key={stat.label} className={`rounded-[24px] border border-white/10 bg-gradient-to-br ${stat.tone} p-4 backdrop-blur-xl`}>
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/70">{stat.label}</div>
                <div className="mt-2 text-3xl font-bold font-syne text-white">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {!space.isGroupsFormed && (
        <GroupFormation courseId={courseId} space={space} onRefresh={fetchSpace} />
      )}

      {space.isGroupsFormed && space.groups?.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" /> Groups ({space.groups.length})
          </h4>
          {space.groups.map(group => (
            <InstructorGroupCard key={group.id} group={group} courseId={courseId} onRefresh={fetchSpace} />
          ))}
        </div>
      )}
    </div>
  );
}
