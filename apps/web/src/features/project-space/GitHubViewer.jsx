import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ExternalLink,
  FolderGit2,
  GitBranch,
  GitCommit,
  Github,
  GitPullRequest,
  Loader2,
  RefreshCw,
  Users,
} from 'lucide-react';
import { fetchGitHubActivity } from './api';
import BranchTreeView from './BranchTreeView';
import BranchDetailsDrawer from './BranchDetailsDrawer';
import CommitDetailsPanel from './CommitDetailsPanel';
import PullRequestDetailsPanel from './PullRequestDetailsPanel';
import { buildGitHubInsights } from './githubInsights';
import { fmtTime } from './shared';

function MetricCard({ label, value, helper, tone }) {
  return (
    <div className={`rounded-2xl border p-4 ${tone}`}>
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">{label}</div>
      <div className="mt-2 text-2xl font-bold font-syne text-text-primary">{value}</div>
      {helper && <div className="mt-1 text-xs text-text-secondary">{helper}</div>}
    </div>
  );
}

function EmptyState({ title, body }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-8 text-center">
      <p className="text-sm font-bold text-text-primary">{title}</p>
      <p className="mt-2 text-xs text-text-secondary">{body}</p>
    </div>
  );
}

function ContributorCard({ contributor }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-text-primary">{contributor.author}</div>
          <div className="mt-1 text-xs text-text-secondary">
            {contributor.branchCount} branches touched
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold font-syne text-white">{contributor.commitCount}</div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-text-muted">commits</div>
        </div>
      </div>
      {contributor.latestMessage && (
        <p className="mt-3 text-xs text-text-secondary">
          Latest: {contributor.latestMessage}
        </p>
      )}
    </div>
  );
}

function PullRequestCard({ pullRequest, onSelectPullRequest, selected }) {
  const stateTone = pullRequest.state === 'merged'
    ? 'border-violet-400/20 bg-violet-500/10 text-violet-300'
    : pullRequest.state === 'open'
      ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300'
      : 'border-red-400/20 bg-red-500/10 text-red-300';

  return (
    <button
      type="button"
      onClick={() => onSelectPullRequest?.(pullRequest)}
      className={`w-full rounded-2xl border p-4 text-left transition-all ${
        selected
          ? 'border-violet-400/30 bg-violet-500/10'
          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="truncate text-sm font-bold text-text-primary">#{pullRequest.number} {pullRequest.title}</span>
            <span className={`rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${stateTone}`}>
              {pullRequest.state}
            </span>
          </div>
          <div className="mt-2 text-xs text-text-secondary">
            {pullRequest.author || 'Unknown'} opened from {pullRequest.sourceBranch || 'unknown'} into {pullRequest.targetBranch || 'unknown'}
          </div>
        </div>
        <a href={pullRequest.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-text-muted hover:text-primary-400 transition-colors">
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-slate-950/35 px-3 py-2 text-center">
          <div className="text-[10px] uppercase tracking-[0.18em] text-text-muted">Files</div>
          <div className="mt-1 text-sm font-bold text-text-primary">{pullRequest.changedFiles ?? '-'}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-950/35 px-3 py-2 text-center">
          <div className="text-[10px] uppercase tracking-[0.18em] text-text-muted">Additions</div>
          <div className="mt-1 text-sm font-bold text-emerald-300">{pullRequest.additions ?? '-'}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-950/35 px-3 py-2 text-center">
          <div className="text-[10px] uppercase tracking-[0.18em] text-text-muted">Deletions</div>
          <div className="mt-1 text-sm font-bold text-red-300">{pullRequest.deletions ?? '-'}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-950/35 px-3 py-2 text-center">
          <div className="text-[10px] uppercase tracking-[0.18em] text-text-muted">Created</div>
          <div className="mt-1 text-sm font-bold text-text-primary">{pullRequest.createdAt ? fmtTime(pullRequest.createdAt) : '-'}</div>
        </div>
      </div>
    </button>
  );
}

function CommitCard({ commit }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-text-primary">{commit.message}</div>
          <div className="mt-2 flex items-center gap-2 flex-wrap text-xs text-text-secondary">
            <span>{commit.author || 'Unknown'}</span>
            {commit.branch && (
              <span className="rounded-full border border-sky-400/15 bg-sky-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-200">
                {commit.branch}
              </span>
            )}
            <span>{commit.date ? fmtTime(commit.date) : 'Unknown time'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {commit.sha && (
            <code className="rounded-lg border border-white/10 bg-slate-950/50 px-2 py-1 text-[10px] text-slate-300">
              {commit.sha.slice(0, 7)}
            </code>
          )}
          <a href={commit.url} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-primary-400 transition-colors">
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function GitHubViewer({ courseId, groupId, variant = 'instructor' }) {
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const insights = useMemo(() => buildGitHubInsights(activity), [activity]);
  const [selectedBranchName, setSelectedBranchName] = useState('');
  const [selectedPullRequestNumber, setSelectedPullRequestNumber] = useState(null);
  const [selectedCommitSha, setSelectedCommitSha] = useState('');

  const loadActivity = useCallback(async ({ force = false } = {}) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchGitHubActivity(courseId, groupId, { force });
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

  useEffect(() => {
    if (!insights.branches.length) {
      setSelectedBranchName('');
      return;
    }

    if (selectedBranchName && insights.branchMap.has(selectedBranchName)) {
      return;
    }

    setSelectedBranchName(insights.branches[0].name);
  }, [insights, selectedBranchName]);

  useEffect(() => {
    if (!insights.pullRequests.length) {
      setSelectedPullRequestNumber(null);
      return;
    }

    if (selectedPullRequestNumber && insights.pullRequests.some(pullRequest => pullRequest.number === selectedPullRequestNumber)) {
      return;
    }

    setSelectedPullRequestNumber(insights.pullRequests[0].number);
  }, [insights, selectedPullRequestNumber]);

  useEffect(() => {
    if (!insights.commits.length) {
      setSelectedCommitSha('');
      return;
    }

    if (selectedCommitSha && insights.commits.some(commit => commit.sha === selectedCommitSha)) {
      return;
    }

    setSelectedCommitSha(insights.commits[0].sha || '');
  }, [insights, selectedCommitSha]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-6 text-sm text-text-muted">
        <Loader2 className="h-4 w-4 animate-spin" /> Fetching GitHub activity...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
        <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
      </div>
    );
  }

  if (!activity) return null;

  const selectedBranch = selectedBranchName ? insights.branchMap.get(selectedBranchName) : null;
  const selectedPullRequest = selectedPullRequestNumber
    ? insights.pullRequests.find(pullRequest => pullRequest.number === selectedPullRequestNumber) || null
    : null;
  const selectedCommit = selectedCommitSha
    ? insights.commits.find(commit => commit.sha === selectedCommitSha) || null
    : null;

  const handleSelectPullRequest = (pullRequest) => {
    setSelectedPullRequestNumber(pullRequest.number);
    setActiveTab('prs');
  };

  const handleSelectCommit = (commit) => {
    setSelectedCommitSha(commit.sha || '');
    setActiveTab('commits');
  };

  const isStudentVariant = variant === 'student';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'branches', label: 'Branches', icon: GitBranch, count: insights.branches.length },
    { id: 'prs', label: 'Pull Requests', icon: GitPullRequest, count: insights.pullRequests.length },
    { id: 'commits', label: 'Commits', icon: GitCommit, count: insights.commits.length },
    { id: 'contributors', label: 'Contributors', icon: Users, count: insights.contributors.length },
  ].filter(tab => {
    if (!isStudentVariant) return true;
    return ['overview', 'branches', 'prs'].includes(tab.id);
  });

  return (
    <div className="space-y-4">
      <div className="rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_28%),linear-gradient(145deg,rgba(15,23,42,0.96),rgba(2,6,23,0.92))] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200">
              <Github className="h-3.5 w-3.5" />
              {isStudentVariant ? 'Team Repository View' : 'Engineering Dashboard'}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <FolderGit2 className="h-5 w-5 text-violet-300" />
              </div>
              <div>
                <a href={activity.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold text-primary-300 hover:text-primary-200 transition-colors">
                  {activity.repoName}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <p className="mt-1 text-xs text-slate-300">Default branch: {activity.defaultBranch || 'Not set'}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
              <span className={`rounded-full border px-2.5 py-1 font-bold uppercase tracking-[0.18em] ${
                activity.source === 'LIVE'
                  ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200'
                  : 'border-amber-400/20 bg-amber-500/10 text-amber-200'
              }`}>
                {activity.source === 'LIVE' ? 'Live sync' : 'Cached snapshot'}
              </span>
              {activity.syncedAt && <span>Synced {fmtTime(activity.syncedAt)}</span>}
              {isStudentVariant && <span>Focused on branch and PR awareness for your team</span>}
            </div>
          </div>

          <button onClick={() => loadActivity({ force: true })} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-200 transition-all hover:bg-white/10">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <MetricCard
            label="Branches"
            value={insights.branches.length}
            helper={`${insights.activeBranches.length} active this week`}
            tone="border-sky-400/15 bg-gradient-to-br from-sky-500/16 to-cyan-500/10"
          />
          <MetricCard
            label="Pull Requests"
            value={insights.pullRequests.length}
            helper={`${insights.openPullRequests.length} open, ${insights.mergedPullRequests.length} merged`}
            tone="border-violet-400/15 bg-gradient-to-br from-violet-500/16 to-fuchsia-500/10"
          />
          <MetricCard
            label="Commits"
            value={insights.commits.length}
            helper={`${insights.contributors.length} contributors detected`}
            tone="border-emerald-400/15 bg-gradient-to-br from-emerald-500/16 to-teal-500/10"
          />
          <MetricCard
            label="Signals"
            value={insights.staleBranches.length}
            helper={insights.staleBranches.length ? 'stale branches need attention' : 'no stale branches detected'}
            tone="border-amber-400/15 bg-gradient-to-br from-amber-500/16 to-orange-500/10"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto border-b border-border-subtle">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 -mb-px transition-all ${activeTab === tab.id ? 'text-primary-400 border-primary-500' : 'text-text-muted border-transparent hover:text-text-secondary'}`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
              {tab.count > 0 && <span className="ml-0.5 rounded-full bg-bg-elevated px-1.5 py-0.5 text-[10px]">{tab.count}</span>}
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {activeTab === 'overview' && (
          <>
            <div className="grid gap-4 xl:grid-cols-[1.4fr,1fr]">
              <div className="space-y-4 rounded-[24px] border border-white/10 bg-bg-surface p-5">
                <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
                  <GitBranch className="h-4 w-4 text-sky-300" />
                  Repo Health
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Default Branch</div>
                    <div className="mt-2 text-lg font-bold text-white">{insights.defaultBranch || 'Not set'}</div>
                    <div className="mt-1 text-xs text-text-secondary">
                      {insights.branchMap.get(insights.defaultBranch)?.lastCommitMessage || 'No commit summary available'}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Code Review Flow</div>
                    <div className="mt-2 text-lg font-bold text-white">{insights.openPullRequests.length} open PRs</div>
                    <div className="mt-1 text-xs text-text-secondary">
                      {insights.mergedPullRequests.length} merged across this snapshot
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Review Surface</div>
                    <div className="mt-2 text-lg font-bold text-white">{insights.totalChangedFiles}</div>
                    <div className="mt-1 text-xs text-text-secondary">files changed across tracked pull requests</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Stale Branches</div>
                    <div className="mt-2 text-lg font-bold text-white">{insights.staleBranches.length}</div>
                    <div className="mt-1 text-xs text-text-secondary">Branches inactive for more than 14 days</div>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-bg-surface p-5">
                <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
                  <Users className="h-4 w-4 text-violet-300" />
                  {isStudentVariant ? 'Active Contributors' : 'Top Contributors'}
                </div>
                <div className="mt-4 space-y-3">
                  {insights.contributors.length ? (
                    insights.contributors.slice(0, 3).map(contributor => (
                      <ContributorCard key={contributor.author} contributor={contributor} />
                    ))
                  ) : (
                    <EmptyState
                      title="No contributor activity yet"
                      body="Contributor insights will appear once commits or pull requests are available."
                    />
                  )}
                </div>
              </div>
            </div>

            <div className={`grid gap-4 ${isStudentVariant ? 'xl:grid-cols-1' : 'xl:grid-cols-2'}`}>
              <div className="rounded-[24px] border border-white/10 bg-bg-surface p-5">
                <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
                  <GitPullRequest className="h-4 w-4 text-emerald-300" />
                  Active Pull Requests
                </div>
                <div className="mt-4 space-y-3">
                  {insights.openPullRequests.length ? (
                    insights.openPullRequests.slice(0, 3).map(pullRequest => (
                      <PullRequestCard
                        key={pullRequest.number}
                        pullRequest={pullRequest}
                        selected={selectedPullRequestNumber === pullRequest.number}
                        onSelectPullRequest={handleSelectPullRequest}
                      />
                    ))
                  ) : (
                    <EmptyState title="No open pull requests" body="Open pull requests will show up here for quick review." />
                  )}
                </div>
              </div>

              {!isStudentVariant && (
                <div className="rounded-[24px] border border-white/10 bg-bg-surface p-5">
                  <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
                    <GitCommit className="h-4 w-4 text-amber-300" />
                    Recent Commits
                  </div>
                  <div className="mt-4 space-y-3">
                    {insights.commits.length ? (
                      insights.commits.slice(0, 4).map(commit => (
                        <CommitCard key={commit.sha || `${commit.message}-${commit.date}`} commit={commit} />
                      ))
                    ) : (
                      <EmptyState title="No commits in snapshot" body="Commit activity will appear here after the next repository sync." />
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'branches' && (
          <div className="grid gap-4 xl:grid-cols-[0.9fr,1.1fr]">
            <div className="rounded-[24px] border border-white/10 bg-bg-surface p-5">
              <BranchTreeView
                branches={insights.branches}
                branchTree={insights.branchTree}
                selectedBranchName={selectedBranchName}
                onSelectBranch={branch => setSelectedBranchName(branch.name)}
              />
            </div>
            <BranchDetailsDrawer
              branch={selectedBranch}
              selectedPullRequestNumber={selectedPullRequestNumber}
              onSelectPullRequest={handleSelectPullRequest}
              selectedCommitSha={selectedCommitSha}
              onSelectCommit={handleSelectCommit}
            />
          </div>
        )}

        {activeTab === 'prs' && (
          <div className="grid gap-4 xl:grid-cols-[0.85fr,1.15fr]">
            <div className="rounded-[24px] border border-white/10 bg-bg-surface p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
                <GitPullRequest className="h-4 w-4 text-violet-300" />
                Pull Request Queue
              </div>
              <p className="mt-2 text-xs text-text-secondary">
                Select a pull request to inspect branch flow, related commits, and code-change volume.
              </p>
              <div className="mt-4 space-y-3">
                {insights.pullRequests.length ? insights.pullRequests.map(pullRequest => (
                  <PullRequestCard
                    key={pullRequest.number}
                    pullRequest={pullRequest}
                    selected={selectedPullRequestNumber === pullRequest.number}
                    onSelectPullRequest={handleSelectPullRequest}
                  />
                )) : (
                  <EmptyState title="No pull requests found" body="This repository snapshot does not include pull requests yet." />
                )}
              </div>
            </div>
            <PullRequestDetailsPanel pullRequest={selectedPullRequest} />
          </div>
        )}

        {!isStudentVariant && activeTab === 'commits' && (
          <div className="grid gap-4 xl:grid-cols-[0.85fr,1.15fr]">
            <div className="rounded-[24px] border border-white/10 bg-bg-surface p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
                <GitCommit className="h-4 w-4 text-sky-300" />
                Commit Timeline
              </div>
              <p className="mt-2 text-xs text-text-secondary">
                Select a commit to inspect branch context, PR traceability, and recent engineering movement.
              </p>
              <div className="mt-4 space-y-3">
                {insights.commits.length ? insights.commits.map(commit => (
                  <button
                    key={commit.sha || `${commit.message}-${commit.date}`}
                    type="button"
                    onClick={() => handleSelectCommit(commit)}
                    className={`w-full text-left rounded-2xl border transition-all ${
                      selectedCommitSha && commit.sha === selectedCommitSha
                        ? 'border-sky-400/30 bg-sky-500/10'
                        : 'border-transparent hover:border-white/15'
                    }`}
                  >
                    <CommitCard commit={commit} />
                  </button>
                )) : (
                  <EmptyState title="No commits found" body="Commit activity will show here once the repository sync succeeds." />
                )}
              </div>
            </div>
            <CommitDetailsPanel
              commit={selectedCommit}
              selectedPullRequestNumber={selectedPullRequestNumber}
              onSelectPullRequest={handleSelectPullRequest}
            />
          </div>
        )}

        {!isStudentVariant && activeTab === 'contributors' && (
          <div className="grid gap-3 lg:grid-cols-2">
            {insights.contributors.length ? insights.contributors.map(contributor => (
              <ContributorCard key={contributor.author} contributor={contributor} />
            )) : (
              <EmptyState title="No contributor data yet" body="We need commit or pull request data before contributor patterns can be derived." />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
