import {
  CheckCircle2, FileText, FolderGit2, GitBranch, GitCommit,
  GitPullRequest, MessageSquareText, Upload, Users, XCircle,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import { useState } from 'react';
import { fmtTime } from './shared';

const EVENT_CONFIG = {
  SPACE_CREATED: { icon: FolderGit2, badge: 'Space Created', color: 'text-sky-300', bg: 'bg-sky-500/15', border: 'border-sky-400/20' },
  GROUPS_FORMED_RANDOM: { icon: Users, badge: 'Groups Formed', color: 'text-violet-300', bg: 'bg-violet-500/15', border: 'border-violet-400/20' },
  GROUPS_FORMED_MANUAL: { icon: Users, badge: 'Groups Formed', color: 'text-violet-300', bg: 'bg-violet-500/15', border: 'border-violet-400/20' },
  GROUPS_RESET: { icon: Users, badge: 'Reset', color: 'text-amber-300', bg: 'bg-amber-500/15', border: 'border-amber-400/20' },
  PROPOSAL_SUBMITTED: { icon: FileText, badge: 'Proposal', color: 'text-sky-300', bg: 'bg-sky-500/15', border: 'border-sky-400/20' },
  PROPOSAL_APPROVED: { icon: CheckCircle2, badge: 'Approved', color: 'text-emerald-300', bg: 'bg-emerald-500/15', border: 'border-emerald-400/20' },
  PROPOSAL_REJECTED: { icon: XCircle, badge: 'Rejected', color: 'text-red-300', bg: 'bg-red-500/15', border: 'border-red-400/20' },
  PROJECT_ASSIGNED: { icon: FolderGit2, badge: 'Assigned', color: 'text-orange-300', bg: 'bg-orange-500/15', border: 'border-orange-400/20' },
  REPO_LINKED: { icon: FolderGit2, badge: 'Repo Linked', color: 'text-fuchsia-300', bg: 'bg-fuchsia-500/15', border: 'border-fuchsia-400/20' },
  REPORT_SUBMITTED: { icon: Upload, badge: 'Report', color: 'text-amber-300', bg: 'bg-amber-500/15', border: 'border-amber-400/20' },
  GROUP_MESSAGE_SENT: { icon: MessageSquareText, badge: 'Chat', color: 'text-cyan-300', bg: 'bg-cyan-500/15', border: 'border-cyan-400/20' },
  BRANCH_ACTIVITY_SYNCED: { icon: GitBranch, badge: 'Branch', color: 'text-indigo-300', bg: 'bg-indigo-500/15', border: 'border-indigo-400/20' },
  PR_ACTIVITY_SYNCED: { icon: GitPullRequest, badge: 'Pull Request', color: 'text-violet-300', bg: 'bg-violet-500/15', border: 'border-violet-400/20' },
  COMMIT_ACTIVITY_SYNCED: { icon: GitCommit, badge: 'Commit', color: 'text-emerald-300', bg: 'bg-emerald-500/15', border: 'border-emerald-400/20' },
};

const getConfig = (type) => EVENT_CONFIG[type] || {
  icon: FolderGit2, badge: 'Activity', color: 'text-slate-300', bg: 'bg-white/8', border: 'border-white/10',
};

const DEFAULT_VISIBLE = 4;

function TimelineEvent({ event, isLast }) {
  const cfg = getConfig(event.eventType);
  const Icon = cfg.icon;

  return (
    <div className="relative flex gap-3">
      {/* connector */}
      <div className="flex flex-col items-center shrink-0">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 ${cfg.bg} ${cfg.border}`}>
          <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
        </div>
        {!isLast && <div className="w-px flex-1 mt-1.5 bg-white/8 min-h-[16px]" />}
      </div>

      {/* content */}
      <div className={`pb-4 flex-1 min-w-0 ${isLast ? '' : ''}`}>
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-bold text-text-primary leading-snug">
                {event.title || 'Project activity'}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${cfg.border} ${cfg.bg} ${cfg.color}`}>
                {cfg.badge}
              </span>
              {event.groupName && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-400 font-semibold">
                  {event.groupName}
                </span>
              )}
            </div>
            {event.description && (
              <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{event.description}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] text-text-muted whitespace-nowrap">{fmtTime(event.createdAt)}</div>
            {event.actorName && (
              <div className="text-[10px] text-text-muted mt-0.5">{event.actorName}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectActivityTimeline({
  title = 'Project Timeline',
  subtitle,
  events = [],
  emptyTitle = 'No project activity yet',
  emptyBody = 'Timeline events will show up here as the project starts moving.',
  compact = false,
  defaultVisible,
}) {
  const limit = defaultVisible ?? (compact ? 3 : DEFAULT_VISIBLE);
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? events : events.slice(0, limit);
  const hasMore = events.length > limit;

  return (
    <div className="rounded-2xl border border-white/10 bg-bg-surface overflow-hidden">
      {/* header */}
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/8">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded-md bg-sky-500/15 flex items-center justify-center shrink-0">
            <FolderGit2 className="w-3 h-3 text-sky-300" />
          </div>
          <span className="text-sm font-bold text-text-primary">{title}</span>
          {events.length > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/8 text-text-muted">
              {events.length}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-[11px] text-text-muted hidden sm:block text-right max-w-xs leading-snug">{subtitle}</p>
        )}
      </div>

      {/* body */}
      <div className="px-5 pt-4 pb-2">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FolderGit2 className="w-8 h-8 text-white/15 mb-2" />
            <p className="text-sm font-bold text-text-secondary">{emptyTitle}</p>
            <p className="text-xs text-text-muted mt-1 max-w-xs leading-relaxed">{emptyBody}</p>
          </div>
        ) : (
          <>
            <div>
              {visible.map((event, i) => (
                <TimelineEvent
                  key={event.id || `${event.eventType}-${event.createdAt}-${i}`}
                  event={event}
                  isLast={i === visible.length - 1 && !hasMore}
                />
              ))}
            </div>

            {hasMore && (
              <button
                onClick={() => setShowAll(v => !v)}
                className="flex items-center gap-1.5 w-full justify-center py-2.5 text-xs font-bold text-text-muted hover:text-text-secondary transition-colors border-t border-white/8 mt-1"
              >
                {showAll ? (
                  <><ChevronUp className="w-3.5 h-3.5" />Show less</>
                ) : (
                  <><ChevronDown className="w-3.5 h-3.5" />Show {events.length - limit} more events</>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}