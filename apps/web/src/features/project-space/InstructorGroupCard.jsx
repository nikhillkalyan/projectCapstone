import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  GitBranch,
  Github,
  Link,
  Loader2,
  MessageSquareText,
  RefreshCw,
  Send,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { aiApi } from '../../api/aiApi';
import AIInsightPanel from '../../components/shared/AIInsightPanel';
import GroupChatPanel from './GroupChatPanel';
import LazyGitHubViewer from './LazyGitHubViewer';
import { assignProject, linkRepo, reviewProposal } from './api';
import { fmt, GroupStatusBadge } from './shared';

function SectionLabel({ children }) {
  return (
    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-text-muted">
      {children}
    </p>
  );
}

function StatTile({ label, value, tone = 'bg-white/5 border-white/10' }) {
  return (
    <div className={`rounded-2xl border p-4 ${tone}`}>
      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">{label}</div>
      <div className="mt-2 text-xl font-bold text-white">{value}</div>
    </div>
  );
}

function MemberPill({ member }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-2xl border border-white/8 bg-white/5 px-3 py-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/30 to-sky-500/20 text-xs font-bold text-violet-200">
        {member.name?.charAt(0)?.toUpperCase()}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-text-primary">{member.name}</p>
        {member.githubUsername && (
          <p className="flex items-center gap-1 truncate text-[10px] text-text-muted">
            <Github className="h-2.5 w-2.5 shrink-0" />
            {member.githubUsername}
          </p>
        )}
      </div>
    </div>
  );
}

function AIGroupDrawer({ open, onClose, group }) {
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const missingReports = Math.max((group.members?.length || 0) - (group.reports?.length || 0), 0);

  const run = useCallback(async () => {
    setLoading(true);
    setError('');
    setAiResult(null);

    try {
      const context = {
        name: group.name,
        members: group.members?.map((member) => member.name),
        projectTitle: group.projectTitle || group.proposal?.projectTitle || 'N/A',
        proposalStatus: group.proposal?.status || 'Not submitted',
        repoLinked: !!group.repo,
        reportsSubmitted: group.reports?.length || 0,
        missingReports,
        lastMessage: group.lastMessage?.messageText || 'No messages',
      };

      const result = await aiApi.summarizeProject(
        'Summarize the progress of this group and identify any blockers.',
        JSON.stringify(context),
      );
      setAiResult(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate AI insights.');
    } finally {
      setLoading(false);
    }
  }, [group, missingReports]);

  useEffect(() => {
    if (open && !aiResult && !loading) {
      run();
    }
  }, [aiResult, loading, open, run]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border-subtle bg-bg-elevated shadow-2xl"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-border-subtle px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/20 to-sky-500/10">
                  <Sparkles className="h-4 w-4 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-text-primary">AI Group Insights</h2>
                  <p className="mt-0.5 text-[10px] text-text-muted">
                    {group.name} · {group.members?.length || 0} members
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!loading && (
                  <button
                    onClick={run}
                    className="flex items-center gap-1.5 rounded-xl border border-border-subtle px-3 py-1.5 text-xs font-bold text-text-muted transition-all hover:border-border-default hover:text-text-secondary"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Regenerate
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-text-muted transition-all hover:bg-bg-surface hover:text-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="shrink-0 border-b border-border-subtle/50 px-6 py-3">
              <div className="flex flex-wrap items-center gap-3">
                {[
                  {
                    label: 'Proposal',
                    value: group.proposal?.status || 'None',
                    color:
                      group.proposal?.status === 'APPROVED'
                        ? 'text-emerald-400'
                        : group.proposal?.status === 'PENDING'
                          ? 'text-amber-400'
                          : 'text-text-muted',
                  },
                  {
                    label: 'Repo',
                    value: group.repo ? 'Linked' : 'Missing',
                    color: group.repo ? 'text-violet-400' : 'text-red-400',
                  },
                  {
                    label: 'Reports',
                    value: `${group.reports?.length || 0}/${group.members?.length || 0}`,
                    color: missingReports > 0 ? 'text-amber-400' : 'text-emerald-400',
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <span className="text-[10px] text-text-muted">{item.label}</span>
                    <span className={`text-[10px] font-bold ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <AIInsightPanel
                result={aiResult}
                loading={loading}
                error={error}
                onRetry={run}
                title="Group Progress"
                context={`${group.name} · ${group.members?.length || 0} members`}
                variant="project"
              />
            </div>

            <div className="shrink-0 border-t border-border-subtle px-6 py-4">
              <p className="text-center text-[10px] leading-relaxed text-text-muted">
                Insights generated from proposal status, repo linkage, report submissions, and chat activity.
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default function InstructorGroupCard({ group, courseId, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [showGithub, setShowGithub] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [repoForm, setRepoForm] = useState({ githubUrl: '', repoName: '', defaultBranch: 'main' });
  const [assignForm, setAssignForm] = useState({ projectTitle: '', projectDoc: '' });
  const [linkingRepo, setLinkingRepo] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [showRepoForm, setShowRepoForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [error, setError] = useState('');
  const [showAiDrawer, setShowAiDrawer] = useState(false);

  const missingReports = Math.max((group.members?.length || 0) - (group.reports?.length || 0), 0);
  const proposalStatus = group.proposal?.status;
  const hasRepo = !!group.repo;

  const handleLinkRepo = async () => {
    if (!repoForm.githubUrl.trim() || !repoForm.repoName.trim()) {
      setError('URL and repo name required');
      return;
    }

    setLinkingRepo(true);
    setError('');

    try {
      await linkRepo(courseId, group.id, repoForm);
      onRefresh();
      setShowRepoForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to link repo');
    } finally {
      setLinkingRepo(false);
    }
  };

  const handleAssign = async () => {
    if (!assignForm.projectTitle.trim()) {
      setError('Project title required');
      return;
    }

    setAssigning(true);
    setError('');

    try {
      await assignProject(courseId, group.id, assignForm);
      onRefresh();
      setShowAssignForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign project');
    } finally {
      setAssigning(false);
    }
  };

  const handleReview = async (action, rejectionReason) => {
    try {
      await reviewProposal(courseId, group.id, { action, rejectionReason });
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to review proposal');
    }
  };

  const statTiles = [
    {
      label: 'Proposal',
      value: proposalStatus || 'None',
      tone:
        proposalStatus === 'APPROVED'
          ? 'bg-emerald-500/10 border-emerald-400/20'
          : proposalStatus === 'PENDING'
            ? 'bg-amber-500/10 border-amber-400/20'
            : proposalStatus === 'REJECTED'
              ? 'bg-red-500/10 border-red-400/20'
              : 'bg-white/5 border-white/10',
    },
    {
      label: 'Repository',
      value: hasRepo ? 'Linked' : 'Pending',
      tone: hasRepo ? 'bg-violet-500/10 border-violet-400/20' : 'bg-white/5 border-white/10',
    },
    {
      label: 'Reports',
      value: `${group.reports?.length || 0}/${group.members?.length || 0}`,
      tone: missingReports > 0 ? 'bg-amber-500/10 border-amber-400/20' : 'bg-white/5 border-white/10',
    },
    {
      label: 'Chat Status',
      value: group.lastMessage ? 'Active' : 'Quiet',
      tone: group.lastMessage ? 'bg-sky-500/10 border-sky-400/20' : 'bg-white/5 border-white/10',
    },
  ];

  return (
    <>
      <AIGroupDrawer
        open={showAiDrawer}
        onClose={() => setShowAiDrawer(false)}
        group={group}
      />

      <motion.div
        layout
        className="overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(155deg,rgba(15,23,42,0.97),rgba(7,13,28,0.95))] shadow-[0_16px_56px_rgba(2,6,23,0.32)]"
      >
        <div
          className="group flex cursor-pointer select-none items-center gap-4 p-5"
          onClick={() => setExpanded((value) => !value)}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/20 to-sky-500/15">
            <Users className="h-5 w-5 text-violet-300" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-base font-bold text-white">{group.name}</span>
              <GroupStatusBadge status={group.status} />
              {group.assignedByInstructor && (
                <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-1.5 py-0.5 text-[10px] font-bold text-orange-400">
                  Instructor Assigned
                </span>
              )}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span>{group.members?.length || 0} members</span>
              {group.projectTitle && (
                <>
                  <span className="opacity-40">·</span>
                  <span className="max-w-[260px] truncate">{group.projectTitle}</span>
                </>
              )}
              {group.lastMessage && (
                <>
                  <span className="opacity-40">·</span>
                  <span className="max-w-[220px] truncate">{group.lastMessage.senderName}: {group.lastMessage.messageText}</span>
                </>
              )}
              {group.unreadMessageCount > 0 && (
                <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold text-sky-200">
                  {group.unreadMessageCount} unread
                </span>
              )}
              {missingReports > 0 && (
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-200">
                  {missingReports} reports missing
                </span>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={(event) => {
                event.stopPropagation();
                setShowAiDrawer(true);
              }}
              className="group/ai hidden items-center gap-1.5 rounded-xl border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-bold text-violet-300 transition-all hover:bg-violet-500/20 sm:flex"
            >
              <Sparkles className="h-3.5 w-3.5 group-hover/ai:animate-pulse" />
              AI Insights
            </button>
            <div className="rounded-full border border-white/10 bg-white/5 p-2 transition-all group-hover:bg-white/8">
              {expanded ? (
                <ChevronUp className="h-4 w-4 text-slate-300" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-300" />
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden border-t border-white/8"
            >
              <div className="space-y-6 p-5">
                <div className="sm:hidden">
                  <button
                    onClick={() => setShowAiDrawer(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-2.5 text-xs font-bold text-violet-300 transition-all hover:bg-violet-500/20"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    View AI Insights for this Group
                  </button>
                </div>

                <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
                  <div className="space-y-5">
                    <div>
                      <SectionLabel>Members</SectionLabel>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {group.members?.map((member) => (
                          <MemberPill key={member.studentId} member={member} />
                        ))}
                      </div>
                    </div>

                    <div>
                      <SectionLabel>Status Overview</SectionLabel>
                      <div className="grid grid-cols-2 gap-2">
                        {statTiles.map((tile) => (
                          <StatTile key={tile.label} label={tile.label} value={tile.value} tone={tile.tone} />
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
                      <div className="mb-1 flex items-center justify-between gap-3">
                        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
                          <MessageSquareText className="h-3.5 w-3.5 text-sky-300" />
                          Collaboration Room
                        </p>
                        <button
                          onClick={() => setShowChat((value) => !value)}
                          className="flex items-center gap-1.5 rounded-xl border border-sky-400/20 bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-300 transition-all hover:bg-sky-500/20"
                        >
                          <MessageSquareText className="h-3 w-3" />
                          {showChat ? 'Hide Chat' : 'Open Chat'}
                          {group.unreadMessageCount > 0 && (
                            <span className="rounded-full bg-sky-300/20 px-1.5 py-0.5 text-[10px]">
                              {group.unreadMessageCount}
                            </span>
                          )}
                        </button>
                      </div>
                      <p className="truncate text-xs text-text-secondary">
                        {group.lastMessage ? `${group.lastMessage.senderName}: ${group.lastMessage.messageText}` : 'No group messages yet'}
                      </p>
                      <AnimatePresence>
                        {showChat && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4">
                              <GroupChatPanel courseId={courseId} group={group} compact readOnly onRead={onRefresh} />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <SectionLabel>Proposal</SectionLabel>
                      {group.proposal ? (
                        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/4 p-4">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-bold leading-snug text-text-primary">{group.proposal.projectTitle}</p>
                            <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                              proposalStatus === 'APPROVED'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : proposalStatus === 'REJECTED'
                                  ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            }`}>
                              {proposalStatus}
                            </span>
                          </div>
                          {group.proposal.description && (
                            <p className="text-xs leading-relaxed text-text-secondary">{group.proposal.description}</p>
                          )}
                          {group.proposal.docUrl && (
                            <a
                              href={group.proposal.docUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-400 transition-colors hover:text-primary-300"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              View Document
                            </a>
                          )}
                          {proposalStatus === 'PENDING' && (
                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={() => handleReview('APPROVE')}
                                className="flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 transition-all hover:bg-emerald-500/20"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  const rejectionReason = window.prompt('Rejection reason:');
                                  if (rejectionReason) handleReview('REJECT', rejectionReason);
                                }}
                                className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400 transition-all hover:bg-red-500/20"
                              >
                                <X className="h-3.5 w-3.5" />
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-8 text-center">
                          <FileText className="mb-2 h-8 w-8 text-text-muted opacity-30" />
                          <p className="text-xs text-text-muted">No proposal submitted yet</p>
                        </div>
                      )}
                    </div>

                    {!group.isProposalApproved && (
                      <div>
                        {!showAssignForm ? (
                          <button
                            onClick={() => setShowAssignForm(true)}
                            className="flex items-center gap-1.5 text-xs font-bold text-orange-300 transition-colors hover:text-orange-200"
                          >
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Assign Project Directly
                          </button>
                        ) : (
                          <div className="space-y-3 rounded-2xl border border-orange-500/15 bg-orange-500/5 p-4">
                            <p className="text-xs font-bold text-orange-400">Assign Project Directly</p>
                            <input
                              type="text"
                              placeholder="Project title"
                              value={assignForm.projectTitle}
                              onChange={(event) => setAssignForm((current) => ({ ...current, projectTitle: event.target.value }))}
                              className="h-9 w-full rounded-xl border border-border-subtle bg-bg-elevated px-3 text-sm text-text-primary outline-none transition-all focus:border-orange-500/50"
                            />
                            <textarea
                              rows={2}
                              placeholder="Description or doc URL"
                              value={assignForm.projectDoc}
                              onChange={(event) => setAssignForm((current) => ({ ...current, projectDoc: event.target.value }))}
                              className="w-full resize-none rounded-xl border border-border-subtle bg-bg-elevated px-3 py-2 text-sm text-text-primary outline-none transition-all placeholder:text-text-muted focus:border-orange-500/50"
                            />
                            {error && <p className="text-xs text-red-400">{error}</p>}
                            <div className="flex gap-2">
                              <button
                                onClick={() => setShowAssignForm(false)}
                                className="rounded-xl border border-border-subtle bg-bg-elevated px-3 py-1.5 text-xs text-text-muted"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleAssign}
                                disabled={assigning}
                                className="flex items-center gap-1.5 rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-1.5 text-xs font-bold text-orange-400 transition-all hover:bg-orange-500/20 disabled:opacity-50"
                              >
                                {assigning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                                Assign
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <SectionLabel>GitHub Repository</SectionLabel>
                      {hasRepo ? (
                        <div className="space-y-3 rounded-2xl border border-violet-400/15 bg-violet-500/5 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-500/15">
                                <Github className="h-4 w-4 text-violet-300" />
                              </div>
                              <a
                                href={group.repo.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 truncate text-xs font-mono text-primary-300 transition-colors hover:text-primary-200"
                              >
                                {group.repo.repoName}
                                <ExternalLink className="h-3 w-3 shrink-0" />
                              </a>
                            </div>
                            <button
                              onClick={() => setShowGithub((value) => !value)}
                              className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                                showGithub
                                  ? 'bg-violet-500/15 border-violet-400/25 text-violet-300'
                                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                              }`}
                            >
                              <Activity className="h-3.5 w-3.5" />
                              {showGithub ? 'Hide Activity' : 'View Activity'}
                            </button>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-text-muted">
                            <GitBranch className="h-3 w-3" />
                            <span>
                              Default: <span className="font-mono text-text-secondary">{group.repo.defaultBranch || 'main'}</span>
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {!showRepoForm ? (
                            <button
                              onClick={() => setShowRepoForm(true)}
                              className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-primary-500/25 px-4 py-2.5 text-xs font-bold text-primary-400 transition-all hover:border-primary-500/40 hover:bg-primary-500/5"
                            >
                              <Link className="h-3.5 w-3.5" />
                              Link GitHub Repository
                            </button>
                          ) : (
                            <div className="space-y-3 rounded-2xl border border-primary-500/15 bg-primary-500/5 p-4">
                              <p className="text-xs font-bold text-primary-400">Link GitHub Repository</p>
                              <input
                                type="text"
                                placeholder="https://github.com/owner/repo"
                                value={repoForm.githubUrl}
                                onChange={(event) => setRepoForm((current) => ({ ...current, githubUrl: event.target.value }))}
                                className="h-9 w-full rounded-xl border border-border-subtle bg-bg-elevated px-3 font-mono text-sm text-text-primary outline-none transition-all focus:border-primary-500/50"
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  placeholder="Repo name"
                                  value={repoForm.repoName}
                                  onChange={(event) => setRepoForm((current) => ({ ...current, repoName: event.target.value }))}
                                  className="h-9 rounded-xl border border-border-subtle bg-bg-elevated px-3 text-sm text-text-primary outline-none transition-all focus:border-primary-500/50"
                                />
                                <input
                                  type="text"
                                  placeholder="Default branch (main)"
                                  value={repoForm.defaultBranch}
                                  onChange={(event) => setRepoForm((current) => ({ ...current, defaultBranch: event.target.value }))}
                                  className="h-9 rounded-xl border border-border-subtle bg-bg-elevated px-3 text-sm text-text-primary outline-none transition-all focus:border-primary-500/50"
                                />
                              </div>
                              {error && <p className="text-xs text-red-400">{error}</p>}
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setShowRepoForm(false)}
                                  className="rounded-xl border border-border-subtle bg-bg-elevated px-3 py-1.5 text-xs text-text-muted"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleLinkRepo}
                                  disabled={linkingRepo}
                                  className="flex items-center gap-1.5 rounded-xl border border-primary-500/20 bg-primary-500/10 px-4 py-1.5 text-xs font-bold text-primary-400 transition-all hover:bg-primary-500/20 disabled:opacity-50"
                                >
                                  {linkingRepo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link className="h-3.5 w-3.5" />}
                                  Link Repo
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {group.reports?.length > 0 && (
                      <div>
                        <SectionLabel>Individual Reports ({group.reports.length})</SectionLabel>
                        <div className="space-y-1.5">
                          {group.reports.map((report) => (
                            <div key={report.id} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 p-3">
                              <FileText className="h-3.5 w-3.5 shrink-0 text-text-muted" />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold text-text-primary">{report.studentName}</p>
                                {report.rollNumber && <p className="text-[10px] text-text-muted">{report.rollNumber}</p>}
                              </div>
                              <a
                                href={report.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex shrink-0 items-center gap-1 text-xs font-semibold text-primary-400 transition-colors hover:text-primary-300"
                              >
                                <ExternalLink className="h-3 w-3" />
                                View
                              </a>
                              <span className="shrink-0 text-[10px] text-text-muted">{fmt(report.submittedAt)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {showGithub && hasRepo && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-white/8 pt-2">
                        <div className="mb-4 flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Live Repository Activity</span>
                        </div>
                        <LazyGitHubViewer courseId={courseId} groupId={group.id} variant="instructor" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
