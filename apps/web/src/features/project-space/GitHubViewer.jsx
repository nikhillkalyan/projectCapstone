import { useCallback, useEffect, useState } from 'react';
import { ExternalLink, GitBranch, GitCommit, Github, GitPullRequest, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { fetchGitHubActivity } from './api';
import { fmtTime } from './shared';

export default function GitHubViewer({ courseId, groupId }) {
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('commits');

  const loadActivity = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchGitHubActivity(courseId, groupId);
      setActivity(data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to fetch GitHub activity');
    } finally {
      setLoading(false);
    }
  }, [courseId, groupId]);

  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-6 text-sm text-text-muted">
        <Loader2 className="w-4 h-4 animate-spin" /> Fetching GitHub activity...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
        <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
      </div>
    );
  }

  if (!activity) return null;

  const tabs = [
    { id: 'commits', label: 'Commits', icon: GitCommit, count: activity.recentCommits?.length },
    { id: 'prs', label: 'Pull Requests', icon: GitPullRequest, count: activity.pullRequests?.length },
    { id: 'branches', label: 'Branches', icon: GitBranch, count: activity.branches?.length },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <a href={activity.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold text-primary-400 hover:text-primary-300 transition-colors">
          <Github className="w-4 h-4" /> {activity.repoName}
          <ExternalLink className="w-3 h-3" />
        </a>
        <button onClick={loadActivity} className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="flex items-center gap-1 border-b border-border-subtle">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 -mb-px transition-all ${activeTab === tab.id ? 'text-primary-400 border-primary-500' : 'text-text-muted border-transparent hover:text-text-secondary'}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.count > 0 && <span className="ml-0.5 text-[10px] bg-bg-elevated px-1.5 py-0.5 rounded-full">{tab.count}</span>}
            </button>
          );
        })}
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto">
        {activeTab === 'commits' && activity.recentCommits?.map((commit, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-bg-surface border border-border-subtle rounded-xl">
            <GitCommit className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-primary truncate">{commit.message}</p>
              <p className="text-[11px] text-text-muted mt-0.5">{commit.author} · {fmtTime(commit.date)}</p>
            </div>
            <a href={commit.url} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-primary-400 transition-colors shrink-0">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <code className="text-[10px] font-mono text-text-muted shrink-0">{commit.sha}</code>
          </div>
        ))}

        {activeTab === 'prs' && activity.pullRequests?.map((pullRequest, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-bg-surface border border-border-subtle rounded-xl">
            <GitPullRequest className={`w-4 h-4 shrink-0 mt-0.5 ${pullRequest.state === 'merged' ? 'text-purple-400' : pullRequest.state === 'open' ? 'text-emerald-400' : 'text-red-400'}`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-primary truncate">#{pullRequest.number} {pullRequest.title}</p>
              <p className="text-[11px] text-text-muted mt-0.5">{pullRequest.author} · {pullRequest.sourceBranch} → {pullRequest.targetBranch}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${pullRequest.state === 'merged' ? 'bg-purple-500/10 text-purple-400' : pullRequest.state === 'open' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{pullRequest.state}</span>
                <span className="text-[10px] text-text-muted">{fmtTime(pullRequest.createdAt)}</span>
              </div>
            </div>
            <a href={pullRequest.url} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-primary-400 transition-colors shrink-0">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}

        {activeTab === 'branches' && activity.branches?.map((branch, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-bg-surface border border-border-subtle rounded-xl">
            <GitBranch className="w-4 h-4 text-text-muted shrink-0" />
            <span className="text-xs font-mono font-semibold text-text-primary flex-1">{branch.name}</span>
            {branch.lastCommitSha && <code className="text-[10px] font-mono text-text-muted">{branch.lastCommitSha.slice(0, 7)}</code>}
            {branch.name === activity.defaultBranch && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary-500/10 text-primary-400">default</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
