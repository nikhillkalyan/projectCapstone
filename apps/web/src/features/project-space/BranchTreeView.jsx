import { GitBranch, GitPullRequest, Layers3 } from 'lucide-react';
import { fmtTime } from './shared';

function BranchNode({ branch }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-200">
              <GitBranch className="h-3.5 w-3.5" />
              {branch.name}
            </div>
            {branch.isDefault && (
              <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                Default
              </span>
            )}
            {branch.latestPullRequest && (
              <span className={`rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                branch.latestPullRequest.state === 'merged'
                  ? 'border-violet-400/20 bg-violet-500/10 text-violet-300'
                  : branch.latestPullRequest.state === 'open'
                    ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300'
                    : 'border-red-400/20 bg-red-500/10 text-red-300'
              }`}>
                PR {branch.latestPullRequest.state}
              </span>
            )}
          </div>
          <p className="mt-3 text-xs text-text-secondary">
            {branch.sourceBranch ? `Branches off ${branch.sourceBranch}` : 'Primary project branch'}
          </p>
        </div>
        {branch.lastCommitSha && (
          <code className="rounded-lg border border-white/10 bg-slate-950/50 px-2 py-1 text-[10px] text-slate-300">
            {branch.lastCommitSha.slice(0, 7)}
          </code>
        )}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-slate-950/35 px-3 py-2">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Last Commit</div>
          <div className="mt-1 text-sm font-semibold text-text-primary">{branch.lastCommitMessage || 'No commit message available'}</div>
          <div className="mt-1 text-[11px] text-text-secondary">
            {branch.lastCommitAuthor || 'Unknown'} {branch.lastCommitDate ? `- ${fmtTime(branch.lastCommitDate)}` : ''}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-950/35 px-3 py-2">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">PR Linkage</div>
          {branch.relatedPullRequests?.length ? (
            <div className="mt-2 space-y-1.5">
              {branch.relatedPullRequests.slice(0, 2).map(pullRequest => (
                <div key={pullRequest.number} className="flex items-center gap-2 text-xs text-text-primary">
                  <GitPullRequest className="h-3.5 w-3.5 text-sky-300" />
                  <span className="truncate">#{pullRequest.number} {pullRequest.title}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-2 text-xs text-text-secondary">No pull requests linked to this branch yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BranchTreeView({ branches }) {
  if (!branches?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-text-secondary">
        Branch relationships will appear here once repository branches are available.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-text-muted">
        <Layers3 className="h-3.5 w-3.5 text-violet-300" />
        Branch Relationship Explorer
      </div>
      <div className="space-y-3">
        {branches.map(branch => (
          <BranchNode key={branch.name} branch={branch} />
        ))}
      </div>
    </div>
  );
}
