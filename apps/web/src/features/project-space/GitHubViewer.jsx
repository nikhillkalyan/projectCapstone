import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity, AlertTriangle, ExternalLink, FolderGit2, GitBranch,
  GitCommit, Github, GitPullRequest, Loader2, RefreshCw, Users,
  Zap, TrendingUp, Clock, CheckCircle2, XCircle, GitMerge,
  ArrowUpRight, Circle,
} from 'lucide-react';
import { fetchGitHubActivity } from './api';
import BranchTreeView from './BranchTreeView';
import BranchDetailsDrawer from './BranchDetailsDrawer';
import CommitDetailsPanel from './CommitDetailsPanel';
import PullRequestDetailsPanel from './PullRequestDetailsPanel';
import { buildGitHubInsights } from './githubInsights';
import { fmtTime } from './shared';

/* ─── design tokens (match your CSS vars) ─────────────────── */
const TONE = {
  branches: { border: 'border-sky-400/20', bg: 'bg-sky-500/10', text: 'text-sky-300', glow: 'shadow-sky-500/10' },
  prs: { border: 'border-violet-400/20', bg: 'bg-violet-500/10', text: 'text-violet-300', glow: 'shadow-violet-500/10' },
  commits: { border: 'border-emerald-400/20', bg: 'bg-emerald-500/10', text: 'text-emerald-300', glow: 'shadow-emerald-500/10' },
  signals: { border: 'border-amber-400/20', bg: 'bg-amber-500/10', text: 'text-amber-300', glow: 'shadow-amber-500/10' },
  merged: { border: 'border-violet-400/20', bg: 'bg-violet-500/10', text: 'text-violet-300' },
  open: { border: 'border-emerald-400/20', bg: 'bg-emerald-500/10', text: 'text-emerald-300' },
  closed: { border: 'border-red-400/20', bg: 'bg-red-500/10', text: 'text-red-300' },
};

const prTone = (state) => TONE[state] || TONE.closed;

/* ─── MetricCard ───────────────────────────────────────────── */
function MetricCard({ label, value, helper, icon: Icon, tone }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg ${tone.border} ${tone.bg} ${tone.glow}`}>
      <div className="absolute top-3 right-3 opacity-20">
        <Icon className={`w-8 h-8 ${tone.text}`} />
      </div>
      <div className={`text-[10px] font-bold uppercase tracking-[0.22em] mb-2 ${tone.text} opacity-70`}>{label}</div>
      <div className={`text-3xl font-bold font-display ${tone.text}`}>{value}</div>
      {helper && <div className="mt-1.5 text-[11px] text-white/50 leading-snug">{helper}</div>}
    </div>
  );
}

/* ─── EmptyState ───────────────────────────────────────────── */
function EmptyState({ title, body, icon: Icon = GitBranch }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center rounded-2xl border border-dashed border-white/10 bg-white/3">
      <Icon className="w-8 h-8 text-white/20 mb-3" />
      <p className="text-sm font-bold text-text-primary">{title}</p>
      <p className="mt-1.5 text-xs text-text-secondary max-w-xs leading-relaxed">{body}</p>
    </div>
  );
}

/* ─── ContributorRow ───────────────────────────────────────── */
function ContributorRow({ contributor, rank, maxCommits }) {
  const pct = maxCommits > 0 ? (contributor.commitCount / maxCommits) * 100 : 0;
  const rankColors = ['text-amber-300', 'text-slate-300', 'text-orange-400'];
  const rankBg = ['bg-amber-500/15 border-amber-400/20', 'bg-slate-500/15 border-slate-400/20', 'bg-orange-500/15 border-orange-400/20'];

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-white/8 bg-white/4 hover:bg-white/7 transition-all group">
      <div className={`w-7 h-7 rounded-xl border flex items-center justify-center text-xs font-bold shrink-0 ${rank < 3 ? rankBg[rank] : 'bg-white/5 border-white/10'}`}>
        <span className={rank < 3 ? rankColors[rank] : 'text-text-muted'}>{rank + 1}</span>
      </div>

      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/30 to-sky-500/20 flex items-center justify-center text-sm font-bold text-violet-200 shrink-0">
        {contributor.author?.charAt(0)?.toUpperCase() || '?'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-bold text-text-primary truncate">{contributor.author}</span>
          <span className="text-xs font-bold text-white/70 shrink-0 ml-2">{contributor.commitCount} commits</span>
        </div>
        <div className="w-full h-1.5 bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-violet-500 to-sky-400"
            style={{ width: `${pct}%` }}
          />
        </div>
        {contributor.latestMessage && (
          <p className="text-[11px] text-text-muted mt-1.5 truncate">Latest: {contributor.latestMessage}</p>
        )}
      </div>

      <div className="text-[10px] text-text-muted text-right shrink-0">
        <div className="font-semibold">{contributor.branchCount}</div>
        <div className="opacity-60">branches</div>
      </div>
    </div>
  );
}

/* ─── PullRequestCard ──────────────────────────────────────── */
function PullRequestCard({ pullRequest, onSelectPullRequest, selected }) {
  const tone = prTone(pullRequest.state);
  const StateIcon = pullRequest.state === 'merged' ? GitMerge : pullRequest.state === 'open' ? GitPullRequest : XCircle;

  const totalChanges = (pullRequest.additions ?? 0) + (pullRequest.deletions ?? 0);
  const addPct = totalChanges > 0 ? ((pullRequest.additions ?? 0) / totalChanges) * 100 : 50;

  return (
    <button
      type="button"
      onClick={() => onSelectPullRequest?.(pullRequest)}
      className={`w-full rounded-2xl border p-4 text-left transition-all group ${selected
          ? `${tone.border} ${tone.bg}`
          : 'border-white/8 bg-white/4 hover:border-white/15 hover:bg-white/7'
        }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${tone.bg} border ${tone.border}`}>
            <StateIcon className={`w-3.5 h-3.5 ${tone.text}`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-mono text-text-muted">#{pullRequest.number}</span>
              <span className="text-sm font-bold text-text-primary truncate">{pullRequest.title}</span>
            </div>
            <div className="text-[11px] text-text-muted mt-0.5">
              {pullRequest.author || 'Unknown'} · {pullRequest.sourceBranch || '?'} → {pullRequest.targetBranch || '?'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tone.border} ${tone.bg} ${tone.text}`}>
            {pullRequest.state}
          </span>
          <a
            href={pullRequest.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-white/30 hover:text-primary-400 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* diff bar */}
      {totalChanges > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-text-muted">{pullRequest.changedFiles ?? 0} files changed</span>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="text-emerald-400">+{pullRequest.additions ?? 0}</span>
              <span className="text-red-400">-{pullRequest.deletions ?? 0}</span>
            </div>
          </div>
          <div className="w-full h-1.5 bg-white/8 rounded-full overflow-hidden flex">
            <div className="h-full bg-emerald-500/70 rounded-l-full" style={{ width: `${addPct}%` }} />
            <div className="h-full bg-red-500/70 rounded-r-full" style={{ width: `${100 - addPct}%` }} />
          </div>
        </div>
      )}

      <div className="text-[11px] text-text-muted">
        {pullRequest.createdAt ? fmtTime(pullRequest.createdAt) : '—'}
      </div>
    </button>
  );
}

/* ─── CommitCard ───────────────────────────────────────────── */
function CommitCard({ commit, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border p-4 text-left transition-all group ${selected
          ? 'border-sky-400/30 bg-sky-500/8'
          : 'border-white/8 bg-white/4 hover:border-white/15 hover:bg-white/7'
        }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-400/20 flex items-center justify-center shrink-0 mt-0.5">
          <GitCommit className="w-3.5 h-3.5 text-amber-300" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary leading-snug line-clamp-2">{commit.message}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-[11px] text-text-muted">{commit.author || 'Unknown'}</span>
            {commit.branch && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-400/15">
                {commit.branch}
              </span>
            )}
            <span className="text-[11px] text-text-muted">{commit.date ? fmtTime(commit.date) : '—'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {commit.sha && (
            <code className="text-[10px] font-mono px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
              {commit.sha.slice(0, 7)}
            </code>
          )}
          {commit.url && (
            <a
              href={commit.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-white/30 hover:text-primary-400 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </button>
  );
}

/* ─── RepoHealthGrid ───────────────────────────────────────── */
function RepoHealthGrid({ insights }) {
  const items = [
    {
      label: 'Default Branch',
      value: insights.defaultBranch || 'Not set',
      sub: insights.branchMap.get(insights.defaultBranch)?.lastCommitMessage || 'No commit summary available',
      icon: GitBranch,
      color: 'text-sky-300',
    },
    {
      label: 'Code Review Flow',
      value: `${insights.openPullRequests.length} open PRs`,
      sub: `${insights.mergedPullRequests.length} merged across this snapshot`,
      icon: GitPullRequest,
      color: 'text-violet-300',
    },
    {
      label: 'Review Surface',
      value: String(insights.totalChangedFiles),
      sub: 'files changed across tracked pull requests',
      icon: Activity,
      color: 'text-emerald-300',
    },
    {
      label: 'Stale Branches',
      value: String(insights.staleBranches.length),
      sub: insights.staleBranches.length ? 'branches inactive for 14+ days' : 'no stale branches detected',
      icon: Clock,
      color: insights.staleBranches.length ? 'text-amber-300' : 'text-text-muted',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <div key={item.label} className="p-4 rounded-2xl border border-white/8 bg-white/4">
          <div className="flex items-center gap-2 mb-2">
            <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">{item.label}</span>
          </div>
          <div className={`text-base font-bold ${item.color}`}>{item.value}</div>
          <div className="text-[11px] text-text-secondary mt-1 leading-snug">{item.sub}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── main component ───────────────────────────────────────── */
export default function GitHubViewer({ courseId, groupId, variant = 'instructor' }) {
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const insights = useMemo(() => buildGitHubInsights(activity), [activity]);
  const [selectedBranchName, setSelectedBranchName] = useState('');
  const [selectedPullRequestNumber, setSelectedPRNumber] = useState(null);
  const [selectedCommitSha, setSelectedCommitSha] = useState('');

  const isStudentVariant = variant === 'student';

  /* ── data loading ── */
  const loadActivity = useCallback(async ({ force = false } = {}) => {
    setLoading(true); setError('');
    try {
      const data = await fetchGitHubActivity(courseId, groupId, { force });
      setActivity(data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to fetch GitHub activity');
    } finally { setLoading(false); }
  }, [courseId, groupId]);

  useEffect(() => { loadActivity(); }, [loadActivity]);

  /* ── selection sync ── */
  useEffect(() => {
    if (!insights.branches.length) { setSelectedBranchName(''); return; }
    if (selectedBranchName && insights.branchMap.has(selectedBranchName)) return;
    setSelectedBranchName(insights.branches[0].name);
  }, [insights, selectedBranchName]);

  useEffect(() => {
    if (!insights.pullRequests.length) { setSelectedPRNumber(null); return; }
    if (selectedPullRequestNumber && insights.pullRequests.some(p => p.number === selectedPullRequestNumber)) return;
    setSelectedPRNumber(insights.pullRequests[0].number);
  }, [insights, selectedPullRequestNumber]);

  useEffect(() => {
    if (!insights.commits.length) { setSelectedCommitSha(''); return; }
    if (selectedCommitSha && insights.commits.some(c => c.sha === selectedCommitSha)) return;
    setSelectedCommitSha(insights.commits[0].sha || '');
  }, [insights, selectedCommitSha]);

  const handleSelectPullRequest = (pr) => { setSelectedPRNumber(pr.number); setActiveTab('prs'); };
  const handleSelectCommit = (c) => { setSelectedCommitSha(c.sha || ''); setActiveTab('commits'); };

  const selectedBranch = selectedBranchName ? insights.branchMap.get(selectedBranchName) : null;
  const selectedPullRequest = selectedPullRequestNumber ? insights.pullRequests.find(p => p.number === selectedPullRequestNumber) || null : null;
  const selectedCommit = selectedCommitSha ? insights.commits.find(c => c.sha === selectedCommitSha) || null : null;

  const maxCommits = insights.contributors.length ? Math.max(...insights.contributors.map(c => c.commitCount)) : 1;

  /* ── early states ── */
  if (loading) return (
    <div className="flex items-center gap-3 py-8 text-sm text-text-muted">
      <Loader2 className="h-4 w-4 animate-spin text-primary-400" />
      <span>Fetching GitHub activity…</span>
    </div>
  );

  if (error) return (
    <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/8 p-4 text-sm text-red-400">
      <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
    </div>
  );

  if (!activity) return null;

  /* ── tabs ── */
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'branches', label: 'Branches', icon: GitBranch, count: insights.branches.length },
    { id: 'prs', label: 'Pull Requests', icon: GitPullRequest, count: insights.pullRequests.length },
    { id: 'commits', label: 'Commits', icon: GitCommit, count: insights.commits.length },
    { id: 'contributors', label: 'Contributors', icon: Users, count: insights.contributors.length },
  ].filter(t => isStudentVariant ? ['overview', 'branches', 'prs'].includes(t.id) : true);

  return (
    <div className="space-y-5">

      {/* ── hero banner ── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.14),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.12),transparent_40%),linear-gradient(145deg,rgba(15,23,42,0.97),rgba(2,6,23,0.94))]">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.04),transparent_30%)]" />

        <div className="relative p-5">
          {/* top row: repo identity + refresh */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/8 border border-white/12 flex items-center justify-center shrink-0">
                <Github className="w-5 h-5 text-violet-300" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={activity.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-bold text-white hover:text-primary-300 transition-colors flex items-center gap-1.5 truncate"
                  >
                    {activity.repoName}
                    <ArrowUpRight className="w-3.5 h-3.5 shrink-0 opacity-60" />
                  </a>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${activity.source === 'LIVE'
                      ? 'bg-emerald-500/10 border-emerald-400/20 text-emerald-300'
                      : 'bg-amber-500/10 border-amber-400/20 text-amber-300'
                    }`}>
                    {activity.source === 'LIVE' ? '● Live sync' : '○ Cached'}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-white/45">
                  <span className="flex items-center gap-1">
                    <GitBranch className="w-3 h-3" />
                    Default: <span className="font-mono text-white/60 ml-0.5">{activity.defaultBranch || 'main'}</span>
                  </span>
                  {activity.syncedAt && (
                    <span>Synced {fmtTime(activity.syncedAt)}</span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => loadActivity({ force: true })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-slate-300 hover:bg-white/10 transition-all shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>

          {/* metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard
              label="Branches"
              value={insights.branches.length}
              helper={`${insights.activeBranches.length} active this week`}
              icon={GitBranch}
              tone={TONE.branches}
            />
            <MetricCard
              label="Pull Requests"
              value={insights.pullRequests.length}
              helper={`${insights.openPullRequests.length} open · ${insights.mergedPullRequests.length} merged`}
              icon={GitPullRequest}
              tone={TONE.prs}
            />
            <MetricCard
              label="Commits"
              value={insights.commits.length}
              helper={`${insights.contributors.length} contributors`}
              icon={GitCommit}
              tone={TONE.commits}
            />
            <MetricCard
              label="Signals"
              value={insights.staleBranches.length}
              helper={insights.staleBranches.length ? 'stale branches detected' : 'no stale branches'}
              icon={Zap}
              tone={TONE.signals}
            />
          </div>
        </div>
      </div>

      {/* ── tab bar ── */}
      <div className="flex items-center gap-0.5 overflow-x-auto border-b border-white/8 pb-px scrollbar-hide">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 -mb-px transition-all rounded-t-lg ${isActive
                  ? 'text-primary-300 border-primary-500 bg-primary-500/5'
                  : 'text-text-muted border-transparent hover:text-text-secondary hover:bg-white/4'
                }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-primary-500/20 text-primary-300' : 'bg-white/8 text-text-muted'
                  }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── tab content ── */}
      <div>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">

              {/* repo health */}
              <div className="rounded-2xl border border-white/10 bg-bg-surface p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-sky-500/15 flex items-center justify-center">
                    <GitBranch className="w-3.5 h-3.5 text-sky-300" />
                  </div>
                  <span className="text-sm font-bold text-text-primary">Repo Health</span>
                </div>
                <RepoHealthGrid insights={insights} />
              </div>

              {/* contributors */}
              <div className="rounded-2xl border border-white/10 bg-bg-surface p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-violet-500/15 flex items-center justify-center">
                    <Users className="w-3.5 h-3.5 text-violet-300" />
                  </div>
                  <span className="text-sm font-bold text-text-primary">
                    {isStudentVariant ? 'Active Contributors' : 'Top Contributors'}
                  </span>
                </div>
                {insights.contributors.length ? (
                  <div className="space-y-2">
                    {insights.contributors.slice(0, isStudentVariant ? 5 : 4).map((c, i) => (
                      <ContributorRow key={c.author} contributor={c} rank={i} maxCommits={maxCommits} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No contributor activity yet"
                    body="Contributor insights appear once commits or pull requests are available."
                    icon={Users}
                  />
                )}
              </div>
            </div>

            <div className={`grid gap-4 ${isStudentVariant ? '' : 'xl:grid-cols-2'}`}>
              {/* open PRs */}
              <div className="rounded-2xl border border-white/10 bg-bg-surface p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                      <GitPullRequest className="w-3.5 h-3.5 text-emerald-300" />
                    </div>
                    <span className="text-sm font-bold text-text-primary">Active Pull Requests</span>
                  </div>
                  {insights.openPullRequests.length > 3 && (
                    <button
                      onClick={() => setActiveTab('prs')}
                      className="text-[11px] text-primary-400 hover:text-primary-300 font-semibold transition-colors"
                    >
                      View all →
                    </button>
                  )}
                </div>
                {insights.openPullRequests.length ? (
                  <div className="space-y-2">
                    {insights.openPullRequests.slice(0, 3).map(pr => (
                      <PullRequestCard
                        key={pr.number}
                        pullRequest={pr}
                        selected={selectedPullRequestNumber === pr.number}
                        onSelectPullRequest={handleSelectPullRequest}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No open pull requests" body="Open pull requests will show here for quick review." icon={GitPullRequest} />
                )}
              </div>

              {/* recent commits — instructor only */}
              {!isStudentVariant && (
                <div className="rounded-2xl border border-white/10 bg-bg-surface p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/15 flex items-center justify-center">
                        <GitCommit className="w-3.5 h-3.5 text-amber-300" />
                      </div>
                      <span className="text-sm font-bold text-text-primary">Recent Commits</span>
                    </div>
                    {insights.commits.length > 4 && (
                      <button
                        onClick={() => setActiveTab('commits')}
                        className="text-[11px] text-primary-400 hover:text-primary-300 font-semibold transition-colors"
                      >
                        View all →
                      </button>
                    )}
                  </div>
                  {insights.commits.length ? (
                    <div className="space-y-2">
                      {insights.commits.slice(0, 4).map(c => (
                        <CommitCard
                          key={c.sha || `${c.message}-${c.date}`}
                          commit={c}
                          selected={selectedCommitSha === c.sha}
                          onClick={() => handleSelectCommit(c)}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState title="No commits in snapshot" body="Commit activity appears after the next repository sync." icon={GitCommit} />
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* BRANCHES */}
        {activeTab === 'branches' && (
          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-2xl border border-white/10 bg-bg-surface p-5">
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

        {/* PULL REQUESTS */}
        {activeTab === 'prs' && (
          <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-2xl border border-white/10 bg-bg-surface p-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-violet-500/15 flex items-center justify-center">
                  <GitPullRequest className="w-3.5 h-3.5 text-violet-300" />
                </div>
                <span className="text-sm font-bold text-text-primary">Pull Request Queue</span>
              </div>
              <p className="text-xs text-text-secondary">Select a pull request to inspect branch flow, related commits, and code-change volume.</p>

              {/* state filter pills */}
              {insights.pullRequests.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {['open', 'merged', 'closed'].map(state => {
                    const count = insights.pullRequests.filter(p => p.state === state).length;
                    if (!count) return null;
                    const t = prTone(state);
                    return (
                      <span key={state} className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${t.border} ${t.bg} ${t.text}`}>
                        {count} {state}
                      </span>
                    );
                  })}
                </div>
              )}

              <div className="space-y-2">
                {insights.pullRequests.length ? insights.pullRequests.map(pr => (
                  <PullRequestCard
                    key={pr.number}
                    pullRequest={pr}
                    selected={selectedPullRequestNumber === pr.number}
                    onSelectPullRequest={handleSelectPullRequest}
                  />
                )) : (
                  <EmptyState title="No pull requests found" body="This repository snapshot does not include pull requests yet." icon={GitPullRequest} />
                )}
              </div>
            </div>
            <PullRequestDetailsPanel pullRequest={selectedPullRequest} />
          </div>
        )}

        {/* COMMITS */}
        {!isStudentVariant && activeTab === 'commits' && (
          <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-2xl border border-white/10 bg-bg-surface p-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-sky-500/15 flex items-center justify-center">
                  <GitCommit className="w-3.5 h-3.5 text-sky-300" />
                </div>
                <span className="text-sm font-bold text-text-primary">Commit Timeline</span>
              </div>
              <p className="text-xs text-text-secondary">Select a commit to inspect branch context, PR traceability, and recent engineering movement.</p>
              <div className="space-y-2">
                {insights.commits.length ? insights.commits.map(c => (
                  <CommitCard
                    key={c.sha || `${c.message}-${c.date}`}
                    commit={c}
                    selected={selectedCommitSha === c.sha}
                    onClick={() => handleSelectCommit(c)}
                  />
                )) : (
                  <EmptyState title="No commits found" body="Commit activity will show here once the repository sync succeeds." icon={GitCommit} />
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

        {/* CONTRIBUTORS */}
        {!isStudentVariant && activeTab === 'contributors' && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-bg-surface p-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-violet-500/15 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 text-violet-300" />
                </div>
                <span className="text-sm font-bold text-text-primary">Contributor Leaderboard</span>
              </div>
              {insights.contributors.length ? (
                <div className="space-y-2">
                  {insights.contributors.map((c, i) => (
                    <ContributorRow key={c.author} contributor={c} rank={i} maxCommits={maxCommits} />
                  ))}
                </div>
              ) : (
                <EmptyState title="No contributor data yet" body="We need commit or pull request data before contributor patterns can be derived." icon={Users} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}