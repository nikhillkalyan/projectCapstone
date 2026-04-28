import {
  CheckCircle2,
  FileText,
  FolderGit2,
  GitBranch,
  GitCommit,
  GitPullRequest,
  MessageSquareText,
  Upload,
  Users,
  XCircle,
} from 'lucide-react';
import { fmtTime } from './shared';

const EVENT_STYLES = {
  SPACE_CREATED: {
    icon: FolderGit2,
    badge: 'Space',
    tone: 'border-sky-400/20 bg-sky-500/10 text-sky-200',
  },
  GROUPS_FORMED_RANDOM: {
    icon: Users,
    badge: 'Grouping',
    tone: 'border-violet-400/20 bg-violet-500/10 text-violet-200',
  },
  GROUPS_FORMED_MANUAL: {
    icon: Users,
    badge: 'Grouping',
    tone: 'border-violet-400/20 bg-violet-500/10 text-violet-200',
  },
  GROUPS_RESET: {
    icon: Users,
    badge: 'Reset',
    tone: 'border-amber-400/20 bg-amber-500/10 text-amber-200',
  },
  PROPOSAL_SUBMITTED: {
    icon: FileText,
    badge: 'Proposal',
    tone: 'border-sky-400/20 bg-sky-500/10 text-sky-200',
  },
  PROPOSAL_APPROVED: {
    icon: CheckCircle2,
    badge: 'Approved',
    tone: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200',
  },
  PROPOSAL_REJECTED: {
    icon: XCircle,
    badge: 'Rejected',
    tone: 'border-red-400/20 bg-red-500/10 text-red-200',
  },
  PROJECT_ASSIGNED: {
    icon: FolderGit2,
    badge: 'Assigned',
    tone: 'border-orange-400/20 bg-orange-500/10 text-orange-200',
  },
  REPO_LINKED: {
    icon: FolderGit2,
    badge: 'Repository',
    tone: 'border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-200',
  },
  REPORT_SUBMITTED: {
    icon: Upload,
    badge: 'Report',
    tone: 'border-amber-400/20 bg-amber-500/10 text-amber-200',
  },
  GROUP_MESSAGE_SENT: {
    icon: MessageSquareText,
    badge: 'Chat',
    tone: 'border-cyan-400/20 bg-cyan-500/10 text-cyan-200',
  },
  BRANCH_ACTIVITY_SYNCED: {
    icon: GitBranch,
    badge: 'Branch',
    tone: 'border-indigo-400/20 bg-indigo-500/10 text-indigo-200',
  },
  PR_ACTIVITY_SYNCED: {
    icon: GitPullRequest,
    badge: 'Pull Request',
    tone: 'border-violet-400/20 bg-violet-500/10 text-violet-200',
  },
  COMMIT_ACTIVITY_SYNCED: {
    icon: GitCommit,
    badge: 'Commit',
    tone: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200',
  },
};

function getEventStyle(eventType) {
  return EVENT_STYLES[eventType] || {
    icon: FolderGit2,
    badge: 'Activity',
    tone: 'border-white/10 bg-white/5 text-slate-200',
  };
}

function TimelineItem({ event, isLast, compact = false }) {
  const style = getEventStyle(event.eventType);
  const Icon = style.icon;

  return (
    <div className="relative pl-12">
      {!isLast && <div className="absolute left-[18px] top-10 bottom-0 w-px bg-white/10" />}
      <div className={`absolute left-0 top-1 flex h-9 w-9 items-center justify-center rounded-2xl border ${style.tone}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className={`rounded-2xl border border-white/10 bg-white/5 ${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-sm font-bold text-text-primary">{event.title || 'Project activity'}</div>
              <span className={`rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${style.tone}`}>
                {style.badge}
              </span>
              {event.groupName && (
                <span className="rounded-full border border-white/10 bg-slate-950/35 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
                  {event.groupName}
                </span>
              )}
            </div>
            {event.description && <p className="mt-2 text-xs leading-relaxed text-text-secondary">{event.description}</p>}
          </div>
          <div className="text-right text-[11px] text-text-muted">
            <div>{fmtTime(event.createdAt)}</div>
            {event.actorName && <div className="mt-1">by {event.actorName}</div>}
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
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-bg-surface p-5 shadow-[0_20px_70px_rgba(2,6,23,0.18)]">
      <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
        <FolderGit2 className="h-4 w-4 text-sky-300" />
        {title}
      </div>
      {subtitle && <p className="mt-2 text-xs text-text-secondary">{subtitle}</p>}

      <div className="mt-5 space-y-4">
        {events.length ? (
          events.map((event, index) => (
            <TimelineItem
              key={event.id || `${event.eventType}-${event.createdAt}-${index}`}
              event={event}
              isLast={index === events.length - 1}
              compact={compact}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-8 text-center">
            <p className="text-sm font-bold text-text-primary">{emptyTitle}</p>
            <p className="mt-2 text-xs text-text-secondary">{emptyBody}</p>
          </div>
        )}
      </div>
    </div>
  );
}
