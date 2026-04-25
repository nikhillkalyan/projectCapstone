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

  const fetchSpace = useCallback(async () => {
    setLoading(true);
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
      setLoading(false);
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

  return (
    <div className="space-y-6">
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

        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            { label: 'Groups', value: space.groups?.length || 0 },
            { label: 'Proposals', value: space.groups?.filter(group => group.proposal).length || 0 },
            { label: 'Approved', value: space.groups?.filter(group => group.isProposalApproved).length || 0 },
            { label: 'With Repo', value: space.groups?.filter(group => group.repo).length || 0 },
          ].map(stat => (
            <div key={stat.label} className="text-center p-2 bg-bg-surface/40 rounded-xl border border-border-subtle/40">
              <div className="text-lg font-bold font-syne text-purple-400">{stat.value}</div>
              <div className="text-[10px] text-text-muted font-medium">{stat.label}</div>
            </div>
          ))}
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
