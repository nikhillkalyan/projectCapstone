import { ExternalLink, GitBranch, GitCommit, GitPullRequest, ShieldCheck, TimerReset } from 'lucide-react';
import { fmtTime } from './shared';

function StatPill({ label, value, tone = 'text-text-primary' }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">{label}</div>
      <div className={`mt-1 text-sm font-bold ${tone}`}>{value}</div>
    </div>
  );
}

function LinkedPullRequestCard({ pullRequest, onSelectPullRequest, selected }) {
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
            {pullRequest.author || 'Unknown'} - {pullRequest.sourceBranch || 'unknown'} to {pullRequest.targetBranch || 'unknown'}
          </div>
        </div>
        <a href={pullRequest.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-text-muted hover:text-primary-400 transition-colors">
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-text-secondary">
        <span>{pullRequest.changedFiles ?? 0} files</span>
        <span>{pullRequest.additions ?? 0} additions</span>
        <span>{pullRequest.deletions ?? 0} deletions</span>
        {pullRequest.createdAt && <span>Opened {fmtTime(pullRequest.createdAt)}</span>}
      </div>
    </button>
  );
}

function BranchCommitCard({ commit }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-text-primary">{commit.message}</div>
          <div className="mt-2 text-xs text-text-secondary">
            {commit.author || 'Unknown'} {commit.date ? `- ${fmtTime(commit.date)}` : ''}
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

export default function BranchDetailsDrawer({
  branch,
  selectedPullRequestNumber,
  onSelectPullRequest,
  selectedCommitSha,
  onSelectCommit,
}) {
  if (!branch) {
    return (
      <div className="rounded-[24px] border border-white/10 bg-bg-surface p-5">
        <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 px-5 text-center">
          <div>
            <p className="text-sm font-bold text-text-primary">Select a branch</p>
            <p className="mt-2 text-xs text-text-secondary">
              Choose a branch from the explorer to inspect its activity, linked pull requests, and latest commits.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const mergeStatus = branch.isDefault
    ? 'Primary integration branch'
    : branch.latestPullRequest?.state === 'merged'
      ? 'Already merged through pull request'
      : branch.latestPullRequest?.state === 'open'
        ? 'Merge review in progress'
        : 'Not yet merged';

  const mergeTone = branch.isDefault
    ? 'text-emerald-300'
    : branch.latestPullRequest?.state === 'merged'
      ? 'text-violet-300'
      : branch.latestPullRequest?.state === 'open'
        ? 'text-amber-300'
        : 'text-red-300';

  return (
    <div className="rounded-[24px] border border-white/10 bg-bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200">
            <GitBranch className="h-3.5 w-3.5" />
            Branch Details
          </div>
          <h4 className="mt-4 text-xl font-bold font-syne text-white">{branch.name}</h4>
          <p className="mt-2 text-sm text-text-secondary">
            {branch.sourceBranch ? `Derived from ${branch.sourceBranch}` : 'Acts as the repository baseline branch for this project.'}
          </p>
        </div>
        {branch.lastCommitSha && (
          <code className="rounded-lg border border-white/10 bg-slate-950/50 px-2 py-1 text-[10px] text-slate-300">
            {branch.lastCommitSha.slice(0, 7)}
          </code>
        )}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatPill label="Role" value={branch.isDefault ? 'Default branch' : 'Feature branch'} tone={branch.isDefault ? 'text-emerald-300' : 'text-sky-200'} />
        <StatPill label="Linked PRs" value={branch.relatedPullRequests?.length || 0} />
        <StatPill label="Recent Commits" value={branch.relatedCommits?.length || 0} />
        <StatPill label="Merge Status" value={mergeStatus} tone={mergeTone} />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.15fr,0.85fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
              <TimerReset className="h-4 w-4 text-amber-300" />
              Branch Snapshot
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <StatPill label="Last Author" value={branch.lastCommitAuthor || 'Unknown'} />
              <StatPill label="Updated" value={branch.lastCommitDate ? fmtTime(branch.lastCommitDate) : 'Unknown'} />
              <StatPill label="Base Branch" value={branch.sourceBranch || 'None'} />
              <StatPill label="Target Branch" value={branch.latestPullRequest?.targetBranch || (branch.isDefault ? branch.name : branch.sourceBranch || 'Unknown')} />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <StatPill label="Contributors" value={branch.activeContributorCount || 0} />
              <StatPill label="Open PRs" value={branch.linkedOpenPullRequestCount || 0} tone={branch.linkedOpenPullRequestCount ? 'text-emerald-300' : 'text-text-primary'} />
            </div>
            <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/35 p-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Latest Commit Message</div>
              <div className="mt-2 text-sm font-semibold text-text-primary">
                {branch.lastCommitMessage || 'No commit message available'}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
              <GitCommit className="h-4 w-4 text-sky-300" />
              Recent Branch Commits
            </div>
            <div className="mt-4 space-y-3">
              {branch.relatedCommits?.length ? branch.relatedCommits.map(commit => (
                <button
                  key={commit.sha || `${commit.message}-${commit.date}`}
                  type="button"
                  onClick={() => onSelectCommit?.(commit)}
                  className={`w-full text-left rounded-2xl border transition-all ${
                    selectedCommitSha && commit.sha === selectedCommitSha
                      ? 'border-sky-400/30 bg-sky-500/10'
                      : 'border-transparent hover:border-white/15'
                  }`}
                >
                  <BranchCommitCard commit={commit} />
                </button>
              )) : (
                <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/25 px-4 py-6 text-center text-xs text-text-secondary">
                  No branch-specific commits were found in the current snapshot.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              Review Readiness
            </div>
            <div className="mt-4 space-y-3 text-xs text-text-secondary">
              <div className="rounded-xl border border-white/10 bg-slate-950/35 px-3 py-3">
                {branch.isDefault
                  ? 'This branch is the main integration path and should remain the cleanest reference point for the project.'
                  : branch.latestPullRequest?.state === 'open'
                    ? 'This branch already has an active pull request, so reviewers can assess merge readiness directly from the associated PR.'
                    : branch.latestPullRequest?.state === 'merged'
                      ? 'This branch has already been merged, which makes it useful for tracking completed work rather than pending review.'
                      : 'This branch does not currently expose an active review path, so it may represent unmerged or exploratory work.'}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <StatPill label="Open PR" value={branch.relatedPullRequests?.some(pullRequest => pullRequest.state === 'open') ? 'Yes' : 'No'} tone={branch.relatedPullRequests?.some(pullRequest => pullRequest.state === 'open') ? 'text-emerald-300' : 'text-red-300'} />
                <StatPill label="Merged PR" value={branch.relatedPullRequests?.some(pullRequest => pullRequest.state === 'merged') ? 'Yes' : 'No'} tone={branch.relatedPullRequests?.some(pullRequest => pullRequest.state === 'merged') ? 'text-violet-300' : 'text-text-primary'} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
              <GitPullRequest className="h-4 w-4 text-violet-300" />
              Linked Pull Requests
            </div>
            <div className="mt-4 space-y-3">
              {branch.relatedPullRequests?.length ? branch.relatedPullRequests.map(pullRequest => (
                <LinkedPullRequestCard
                  key={pullRequest.number}
                  pullRequest={pullRequest}
                  selected={selectedPullRequestNumber === pullRequest.number}
                  onSelectPullRequest={onSelectPullRequest}
                />
              )) : (
                <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/25 px-4 py-6 text-center text-xs text-text-secondary">
                  No linked pull requests were found for this branch in the current snapshot.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
