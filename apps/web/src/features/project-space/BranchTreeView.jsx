import { ChevronRight, GitBranch, GitPullRequest, Layers3, Sparkles } from 'lucide-react';
import { fmtTime } from './shared';

function BranchNode({ branch, selected, onSelect, depth = 0, isLast = false }) {
  return (
    <div className="relative">
      {depth > 0 && (
        <>
          <div className="absolute left-4 top-0 h-6 w-px bg-white/12" />
          <div className={`absolute left-4 top-6 w-6 border-t border-white/12 ${isLast ? '' : ''}`} />
          {!isLast && <div className="absolute left-4 top-6 bottom-0 w-px bg-white/12" />}
        </>
      )}

      <div className="relative pl-10">
        <button
          type="button"
          onClick={() => onSelect(branch)}
          className={`w-full rounded-2xl border p-4 text-left transition-all ${
            selected
              ? 'border-sky-400/35 bg-sky-500/10 shadow-[0_12px_40px_rgba(14,165,233,0.12)]'
              : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
          }`}
        >
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
                {branch.children?.length > 0 && (
                  <span className="rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-fuchsia-200">
                    {branch.children.length} child{branch.children.length > 1 ? 'ren' : ''}
                  </span>
                )}
              </div>
              <p className="mt-3 text-xs text-text-secondary">
                {branch.sourceBranch ? `Branches off ${branch.sourceBranch}` : 'Primary project branch'}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {branch.lastCommitSha && (
                <code className="rounded-lg border border-white/10 bg-slate-950/50 px-2 py-1 text-[10px] text-slate-300">
                  {branch.lastCommitSha.slice(0, 7)}
                </code>
              )}
              <ChevronRight className={`h-4 w-4 ${selected ? 'text-sky-200' : 'text-text-muted'}`} />
            </div>
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
        </button>
      </div>
    </div>
  );
}

function BranchTreeNode({ branch, selectedBranchName, onSelectBranch, depth = 0, isLast = false }) {
  return (
    <div className="space-y-3">
      <BranchNode
        branch={branch}
        selected={branch.name === selectedBranchName}
        onSelect={onSelectBranch}
        depth={depth}
        isLast={isLast}
      />
      {branch.children?.length > 0 && (
        <div className="ml-6 space-y-3">
          {branch.children.map((child, index) => (
            <BranchTreeNode
              key={child.name}
              branch={child}
              selectedBranchName={selectedBranchName}
              onSelectBranch={onSelectBranch}
              depth={depth + 1}
              isLast={index === branch.children.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function BranchTreeView({ branches, branchTree, selectedBranchName, onSelectBranch }) {
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
        Visual Branch Tree
      </div>
      <p className="text-xs text-text-secondary">
        The tree shows inferred parent-child branch relationships so you can follow how work split from the default branch and where review paths exist.
      </p>
      <div className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.6),rgba(2,6,23,0.25))] p-4">
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-text-secondary">
          <Sparkles className="h-3.5 w-3.5 text-fuchsia-300" />
          <span>{branches.length} branches mapped</span>
          <span>{branches.filter(branch => branch.children?.length > 0).length} branching points</span>
          <span>{branches.filter(branch => branch.latestPullRequest?.state === 'open').length} active review paths</span>
        </div>
        <div className="space-y-3">
          {(branchTree || branches).map((branch, index) => (
            <BranchTreeNode
              key={branch.name}
              branch={branch}
              selectedBranchName={selectedBranchName}
              onSelectBranch={onSelectBranch}
              depth={0}
              isLast={index === (branchTree || branches).length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
