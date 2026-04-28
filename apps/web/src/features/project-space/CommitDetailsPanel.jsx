import { ExternalLink, GitBranch, GitCommit, GitPullRequest, Radar, UserRound } from 'lucide-react';
import { fmtTime } from './shared';

function DetailStat({ label, value, tone = 'text-text-primary' }) {
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
    </button>
  );
}

export default function CommitDetailsPanel({ commit, selectedPullRequestNumber, onSelectPullRequest }) {
  if (!commit) {
    return (
      <div className="rounded-[24px] border border-white/10 bg-bg-surface p-5">
        <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 px-5 text-center">
          <div>
            <p className="text-sm font-bold text-text-primary">Select a commit</p>
            <p className="mt-2 text-xs text-text-secondary">
              Choose a commit to inspect its branch context, related pull requests, and engineering signals.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-white/10 bg-bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200">
            <GitCommit className="h-3.5 w-3.5" />
            Commit Details
          </div>
          <h4 className="mt-4 text-xl font-bold font-syne text-white">{commit.message}</h4>
          <p className="mt-2 text-sm text-text-secondary">
            {commit.author || 'Unknown'} committed on {commit.branch || 'unknown branch'} {commit.date ? `at ${fmtTime(commit.date)}` : ''}.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {commit.sha && (
            <code className="rounded-lg border border-white/10 bg-slate-950/50 px-2 py-1 text-[10px] text-slate-300">
              {commit.sha.slice(0, 7)}
            </code>
          )}
          <a href={commit.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 transition-all">
            <ExternalLink className="h-3.5 w-3.5" />
            Open on GitHub
          </a>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DetailStat label="Branch" value={commit.branch || 'Unknown'} tone="text-sky-200" />
        <DetailStat label="Linked PRs" value={commit.relatedPullRequests?.length || 0} />
        <DetailStat label="Commit Time" value={commit.date ? fmtTime(commit.date) : 'Unknown'} />
        <DetailStat label="Traceability" value={commit.relatedPullRequests?.length ? 'Connected to PR flow' : 'Standalone snapshot'} tone={commit.relatedPullRequests?.length ? 'text-emerald-300' : 'text-amber-300'} />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.05fr,0.95fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
              <GitBranch className="h-4 w-4 text-violet-300" />
              Branch Context
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <DetailStat label="Branch Name" value={commit.branch || 'Unknown'} />
              <DetailStat label="Author" value={commit.author || 'Unknown'} />
              <DetailStat label="Related PRs" value={commit.relatedPullRequests?.length || 0} />
              <DetailStat label="PR States" value={commit.relatedPullRequests?.map(pullRequest => pullRequest.state).join(', ') || 'None'} tone="text-violet-300" />
            </div>
            <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/35 px-3 py-3 text-xs text-text-secondary">
              This commit is being traced through its branch because the current GitHub contract does not yet expose explicit per-commit file diffs or direct PR linkage metadata.
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
              <Radar className="h-4 w-4 text-amber-300" />
              Engineering Signal
            </div>
            <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/35 px-3 py-3 text-xs text-text-secondary">
              {commit.relatedPullRequests?.length
                ? 'This commit sits on a branch that already participates in pull request flow, which makes it easier to review in delivery context rather than as isolated git activity.'
                : 'This commit currently appears as standalone branch activity, which can indicate early implementation, exploratory work, or branch motion before a pull request is opened.'}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <DetailStat label="Has PR Context" value={commit.relatedPullRequests?.length ? 'Yes' : 'No'} tone={commit.relatedPullRequests?.length ? 'text-emerald-300' : 'text-red-300'} />
              <DetailStat label="Branch Known" value={commit.branch ? 'Yes' : 'No'} tone={commit.branch ? 'text-emerald-300' : 'text-red-300'} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
              <GitPullRequest className="h-4 w-4 text-violet-300" />
              Related Pull Requests
            </div>
            <div className="mt-4 space-y-3">
              {commit.relatedPullRequests?.length ? commit.relatedPullRequests.map(pullRequest => (
                <LinkedPullRequestCard
                  key={pullRequest.number}
                  pullRequest={pullRequest}
                  selected={selectedPullRequestNumber === pullRequest.number}
                  onSelectPullRequest={onSelectPullRequest}
                />
              )) : (
                <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/25 px-4 py-6 text-center text-xs text-text-secondary">
                  No pull requests were inferred for this commit from the current branch snapshot.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
              <UserRound className="h-4 w-4 text-sky-300" />
              Activity Notes
            </div>
            <div className="mt-4 space-y-3 text-xs text-text-secondary">
              <div className="rounded-xl border border-white/10 bg-slate-950/35 px-3 py-3">
                Commits are most useful here as a momentum signal: who changed what branch recently, and whether that work is flowing into review.
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-950/35 px-3 py-3">
                A later backend pass can enrich this with changed file lists, diff snippets, and direct commit-to-PR linkage instead of branch-level inference.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
