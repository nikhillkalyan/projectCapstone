import { ExternalLink, FileCode2, GitCommit, GitMerge, GitPullRequest, ShieldCheck, UserRound } from 'lucide-react';
import { fmtTime } from './shared';

function DetailStat({ label, value, tone = 'text-text-primary' }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">{label}</div>
      <div className={`mt-1 text-sm font-bold ${tone}`}>{value}</div>
    </div>
  );
}

function RelatedCommitCard({ commit }) {
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

export default function PullRequestDetailsPanel({ pullRequest }) {
  if (!pullRequest) {
    return (
      <div className="rounded-[24px] border border-white/10 bg-bg-surface p-5">
        <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 px-5 text-center">
          <div>
            <p className="text-sm font-bold text-text-primary">Select a pull request</p>
            <p className="mt-2 text-xs text-text-secondary">
              Choose a pull request to inspect branch flow, code change volume, and related commit activity.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const stateTone = pullRequest.state === 'merged'
    ? 'text-violet-300'
    : pullRequest.state === 'open'
      ? 'text-emerald-300'
      : 'text-red-300';

  const reviewSummary = pullRequest.state === 'open'
    ? 'Active review path'
    : pullRequest.state === 'merged'
      ? 'Merged into target branch'
      : 'Closed without merge';

  return (
    <div className="rounded-[24px] border border-white/10 bg-bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-200">
            <GitPullRequest className="h-3.5 w-3.5" />
            Pull Request Details
          </div>
          <h4 className="mt-4 text-xl font-bold font-syne text-white">#{pullRequest.number} {pullRequest.title}</h4>
          <p className="mt-2 text-sm text-text-secondary">
            {pullRequest.author || 'Unknown'} opened this change from {pullRequest.sourceBranch || 'unknown'} into {pullRequest.targetBranch || 'unknown'}.
          </p>
        </div>
        <a href={pullRequest.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 transition-all">
          <ExternalLink className="h-3.5 w-3.5" />
          Open on GitHub
        </a>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DetailStat label="Status" value={pullRequest.state || 'Unknown'} tone={stateTone} />
        <DetailStat label="Review Flow" value={reviewSummary} tone={stateTone} />
        <DetailStat label="Changed Files" value={pullRequest.changedFiles ?? 0} />
        <DetailStat label="Linked Commits" value={pullRequest.relatedCommits?.length || 0} />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
              <GitMerge className="h-4 w-4 text-violet-300" />
              Merge Path
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <DetailStat label="Source Branch" value={pullRequest.sourceBranch || 'Unknown'} />
              <DetailStat label="Target Branch" value={pullRequest.targetBranch || 'Unknown'} />
              <DetailStat label="Created" value={pullRequest.createdAt ? fmtTime(pullRequest.createdAt) : 'Unknown'} />
              <DetailStat label="Merged" value={pullRequest.mergedAt ? fmtTime(pullRequest.mergedAt) : 'Not merged'} tone={pullRequest.mergedAt ? 'text-violet-300' : 'text-text-primary'} />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
              <FileCode2 className="h-4 w-4 text-emerald-300" />
              Code Change Summary
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <DetailStat label="Files" value={pullRequest.changedFiles ?? 0} />
              <DetailStat label="Additions" value={pullRequest.additions ?? 0} tone="text-emerald-300" />
              <DetailStat label="Deletions" value={pullRequest.deletions ?? 0} tone="text-red-300" />
            </div>
            <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/35 px-3 py-3 text-xs text-text-secondary">
              Labels, per-file diffs, and explicit review decision metadata are not yet part of the cached contract, so this panel focuses on the highest-signal PR data currently available.
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
              <GitCommit className="h-4 w-4 text-sky-300" />
              Related Commits
            </div>
            <div className="mt-4 space-y-3">
              {pullRequest.relatedCommits?.length ? pullRequest.relatedCommits.map(commit => (
                <RelatedCommitCard key={commit.sha || `${commit.message}-${commit.date}`} commit={commit} />
              )) : (
                <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/25 px-4 py-6 text-center text-xs text-text-secondary">
                  No related commits were inferred for this pull request from the current branch snapshot.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
              <ShieldCheck className="h-4 w-4 text-amber-300" />
              Review Signal
            </div>
            <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/35 px-3 py-3 text-xs text-text-secondary">
              {pullRequest.state === 'open'
                ? 'This pull request is still active, which makes it the best point for instructors to inspect current branch intent and engineering progress.'
                : pullRequest.state === 'merged'
                  ? 'This pull request has already landed, which makes it useful for understanding completed delivery and merge discipline.'
                  : 'This pull request is closed, so it may indicate abandoned work, a superseded path, or a review cycle that did not complete.'}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <DetailStat label="Author" value={pullRequest.author || 'Unknown'} />
              <DetailStat label="Commit Count" value={pullRequest.relatedCommits?.length || 0} />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
              <UserRound className="h-4 w-4 text-sky-300" />
              PR Traceability
            </div>
            <div className="mt-4 space-y-3 text-xs text-text-secondary">
              <div className="rounded-xl border border-white/10 bg-slate-950/35 px-3 py-3">
                This PR is currently linked through branch-level inference. A later backend expansion can enrich this with explicit PR files, reviews, labels, and timeline events.
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <DetailStat label="Source Seen In Tree" value={pullRequest.sourceBranch ? 'Yes' : 'No'} tone={pullRequest.sourceBranch ? 'text-emerald-300' : 'text-red-300'} />
                <DetailStat label="Target Known" value={pullRequest.targetBranch ? 'Yes' : 'No'} tone={pullRequest.targetBranch ? 'text-emerald-300' : 'text-red-300'} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
