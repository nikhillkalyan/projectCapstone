import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Eye, ExternalLink,
  FileText, Github, Link, Loader2, MessageSquareText, Send, Users, X,
  Sparkles, GitBranch, FolderGit2, Activity, Circle,
} from 'lucide-react';
import { assignProject, linkRepo, reviewProposal } from './api';
import { aiApi } from '../../api/aiApi';
import Modal from '../../components/ui/Modal';
import GroupChatPanel from './GroupChatPanel';
import LazyGitHubViewer from './LazyGitHubViewer';
import { fmt, GroupStatusBadge } from './shared';

/* ── tiny sub-components ── */

function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-text-muted mb-3">
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
    <div className="flex items-center gap-2.5 px-3 py-2.5 bg-white/5 border border-white/8 rounded-2xl min-w-0">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500/30 to-sky-500/20 flex items-center justify-center text-violet-200 text-xs font-bold shrink-0">
        {member.name?.charAt(0)?.toUpperCase()}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-text-primary truncate">{member.name}</p>
        {member.githubUsername && (
          <p className="text-[10px] text-text-muted flex items-center gap-1 truncate">
            <Github className="w-2.5 h-2.5 shrink-0" />{member.githubUsername}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── main component ── */

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
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const missingReports = Math.max((group.members?.length || 0) - (group.reports?.length || 0), 0);

  const handleGenerateSummary = async () => {
    setIsAiGenerating(true);
    try {
      const ctx = {
        name: group.name,
        members: group.members?.map(m => m.name),
        projectTitle: group.projectTitle || group.proposal?.projectTitle || 'N/A',
        proposalStatus: group.proposal?.status || 'Not submitted',
        repoLinked: !!group.repo,
        reportsSubmitted: group.reports?.length || 0,
        missingReports,
        lastMessage: group.lastMessage?.messageText || 'No messages',
      };
      const result = await aiApi.summarizeProject(
        'Summarize the progress of this group and identify any blockers.',
        JSON.stringify(ctx),
      );
      setAiSummary(result);
    } catch {
      setError('Failed to generate AI summary.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleLinkRepo = async () => {
    if (!repoForm.githubUrl.trim() || !repoForm.repoName.trim()) { setError('URL and repo name required'); return; }
    setLinkingRepo(true); setError('');
    try { await linkRepo(courseId, group.id, repoForm); onRefresh(); setShowRepoForm(false); }
    catch (e) { setError(e.response?.data?.message || 'Failed to link repo'); }
    finally { setLinkingRepo(false); }
  };

  const handleAssign = async () => {
    if (!assignForm.projectTitle.trim()) { setError('Project title required'); return; }
    setAssigning(true); setError('');
    try { await assignProject(courseId, group.id, assignForm); onRefresh(); setShowAssignForm(false); }
    catch (e) { setError(e.response?.data?.message || 'Failed to assign project'); }
    finally { setAssigning(false); }
  };

  const handleReview = async (action, rejectionReason) => {
    try { await reviewProposal(courseId, group.id, { action, rejectionReason }); onRefresh(); }
    catch (e) { setError(e.response?.data?.message || 'Failed to review proposal'); }
  };

  /* derived */
  const proposalStatus = group.proposal?.status;
  const hasRepo = !!group.repo;

  const statTiles = [
    {
      label: 'Proposal',
      value: proposalStatus || 'None',
      tone: proposalStatus === 'APPROVED'
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
    <motion.div
      layout
      className="overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(155deg,rgba(15,23,42,0.97),rgba(7,13,28,0.95))] shadow-[0_16px_56px_rgba(2,6,23,0.32)]"
    >
      {/* ── collapsed header ── */}
      <div
        className="flex items-center gap-4 p-5 cursor-pointer select-none group"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500/20 to-sky-500/15 border border-white/10 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5 text-violet-300" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-bold font-display text-white">{group.name}</span>
            <GroupStatusBadge status={group.status} />
            {group.assignedByInstructor && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-bold">
                Instructor Assigned
              </span>
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-2 flex-wrap text-xs text-slate-400">
            <span>{group.members?.length || 0} members</span>
            {group.projectTitle && (
              <><span className="opacity-40">·</span><span className="truncate max-w-[260px]">{group.projectTitle}</span></>
            )}
            {group.lastMessage && (
              <><span className="opacity-40">·</span><span className="truncate max-w-[220px]">{group.lastMessage.senderName}: {group.lastMessage.messageText}</span></>
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

        <div className="shrink-0 flex items-center gap-2">
          <button
            onClick={e => { e.stopPropagation(); setShowAiModal(true); handleGenerateSummary(); }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-bold rounded-xl hover:bg-violet-500/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Insights
          </button>
          <div className="rounded-full border border-white/10 bg-white/5 p-2 group-hover:bg-white/8 transition-all">
            {expanded
              ? <ChevronUp className="w-4 h-4 text-slate-300" />
              : <ChevronDown className="w-4 h-4 text-slate-300" />
            }
          </div>
        </div>
      </div>

      {/* ── expanded body ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden border-t border-white/8"
          >
            <div className="p-5 space-y-6">

              {/* ── top two-column zone ── */}
              <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">

                {/* LEFT — members + stats + chat preview */}
                <div className="space-y-5">
                  {/* members */}
                  <div>
                    <SectionLabel>Members</SectionLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {group.members?.map(member => (
                        <MemberPill key={member.studentId} member={member} />
                      ))}
                    </div>
                  </div>

                  {/* stat tiles */}
                  <div>
                    <SectionLabel>Status Overview</SectionLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {statTiles.map(s => (
                        <StatTile key={s.label} label={s.label} value={s.value} tone={s.tone} />
                      ))}
                    </div>
                  </div>

                  {/* collaboration room */}
                  <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
                        <MessageSquareText className="h-3.5 w-3.5 text-sky-300" />
                        Collaboration Room
                      </p>
                      <button
                        onClick={() => setShowChat(v => !v)}
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
                      {group.lastMessage
                        ? `${group.lastMessage.senderName}: ${group.lastMessage.messageText}`
                        : 'No group messages yet'}
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

                {/* RIGHT — proposal + repo link */}
                <div className="space-y-5">
                  {/* proposal block */}
                  <div>
                    <SectionLabel>Proposal</SectionLabel>
                    {group.proposal ? (
                      <div className="p-4 bg-white/4 border border-white/10 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-text-primary leading-snug">{group.proposal.projectTitle}</p>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${proposalStatus === 'APPROVED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : proposalStatus === 'REJECTED'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                            {proposalStatus}
                          </span>
                        </div>
                        {group.proposal.description && (
                          <p className="text-xs text-text-secondary leading-relaxed">{group.proposal.description}</p>
                        )}
                        {group.proposal.docUrl && (
                          <a
                            href={group.proposal.docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 font-semibold transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" /> View Document
                          </a>
                        )}
                        {proposalStatus === 'PENDING' && (
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => handleReview('APPROVE')}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl hover:bg-emerald-500/20 transition-all"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => { const r = window.prompt('Rejection reason:'); if (r) handleReview('REJECT', r); }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl hover:bg-red-500/20 transition-all"
                            >
                              <X className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 border border-dashed border-white/10 rounded-2xl text-center">
                        <FileText className="w-8 h-8 text-text-muted mb-2 opacity-30" />
                        <p className="text-xs text-text-muted">No proposal submitted yet</p>
                      </div>
                    )}
                  </div>

                  {/* assign project (if no approved proposal) */}
                  {!group.isProposalApproved && (
                    <div>
                      {!showAssignForm ? (
                        <button
                          onClick={() => setShowAssignForm(true)}
                          className="flex items-center gap-1.5 text-xs text-orange-300 hover:text-orange-200 font-bold transition-colors"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" /> Assign Project Directly
                        </button>
                      ) : (
                        <div className="p-4 bg-orange-500/5 border border-orange-500/15 rounded-2xl space-y-3">
                          <p className="text-xs font-bold text-orange-400">Assign Project Directly</p>
                          <input
                            type="text"
                            placeholder="Project title"
                            value={assignForm.projectTitle}
                            onChange={e => setAssignForm(f => ({ ...f, projectTitle: e.target.value }))}
                            className="w-full h-9 bg-bg-elevated border border-border-subtle rounded-xl px-3 text-sm text-text-primary outline-none focus:border-orange-500/50 transition-all"
                          />
                          <textarea
                            rows={2}
                            placeholder="Description or doc URL"
                            value={assignForm.projectDoc}
                            onChange={e => setAssignForm(f => ({ ...f, projectDoc: e.target.value }))}
                            className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-orange-500/50 transition-all resize-none"
                          />
                          {error && <p className="text-xs text-red-400">{error}</p>}
                          <div className="flex gap-2">
                            <button onClick={() => setShowAssignForm(false)} className="px-3 py-1.5 text-xs text-text-muted bg-bg-elevated border border-border-subtle rounded-xl">Cancel</button>
                            <button onClick={handleAssign} disabled={assigning}
                              className="flex items-center gap-1.5 px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold rounded-xl hover:bg-orange-500/20 disabled:opacity-50 transition-all">
                              {assigning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}Assign
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* repo block */}
                  <div>
                    <SectionLabel>GitHub Repository</SectionLabel>
                    {hasRepo ? (
                      <div className="p-4 bg-violet-500/5 border border-violet-400/15 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center shrink-0">
                              <Github className="w-4 h-4 text-violet-300" />
                            </div>
                            <a
                              href={group.repo.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-mono text-primary-300 hover:text-primary-200 flex items-center gap-1 truncate"
                            >
                              {group.repo.repoName} <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          </div>
                          <button
                            onClick={() => setShowGithub(v => !v)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all shrink-0 ${showGithub
                                ? 'bg-violet-500/15 border-violet-400/25 text-violet-300'
                                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                              }`}
                          >
                            <Activity className="w-3.5 h-3.5" />
                            {showGithub ? 'Hide Activity' : 'View Activity'}
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                          <GitBranch className="w-3 h-3" />
                          <span>Default: <span className="text-text-secondary font-mono">{group.repo.defaultBranch || 'main'}</span></span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {!showRepoForm ? (
                          <button
                            onClick={() => setShowRepoForm(true)}
                            className="flex items-center gap-1.5 px-4 py-2.5 w-full justify-center border border-dashed border-primary-500/25 rounded-2xl text-xs text-primary-400 hover:border-primary-500/40 hover:bg-primary-500/5 font-bold transition-all"
                          >
                            <Link className="w-3.5 h-3.5" /> Link GitHub Repository
                          </button>
                        ) : (
                          <div className="p-4 bg-primary-500/5 border border-primary-500/15 rounded-2xl space-y-3">
                            <p className="text-xs font-bold text-primary-400">Link GitHub Repository</p>
                            <input
                              type="text"
                              placeholder="https://github.com/owner/repo"
                              value={repoForm.githubUrl}
                              onChange={e => setRepoForm(f => ({ ...f, githubUrl: e.target.value }))}
                              className="w-full h-9 bg-bg-elevated border border-border-subtle rounded-xl px-3 text-sm text-text-primary font-mono outline-none focus:border-primary-500/50 transition-all"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder="Repo name"
                                value={repoForm.repoName}
                                onChange={e => setRepoForm(f => ({ ...f, repoName: e.target.value }))}
                                className="h-9 bg-bg-elevated border border-border-subtle rounded-xl px-3 text-sm text-text-primary outline-none focus:border-primary-500/50 transition-all"
                              />
                              <input
                                type="text"
                                placeholder="Default branch (main)"
                                value={repoForm.defaultBranch}
                                onChange={e => setRepoForm(f => ({ ...f, defaultBranch: e.target.value }))}
                                className="h-9 bg-bg-elevated border border-border-subtle rounded-xl px-3 text-sm text-text-primary outline-none focus:border-primary-500/50 transition-all"
                              />
                            </div>
                            {error && <p className="text-xs text-red-400">{error}</p>}
                            <div className="flex gap-2">
                              <button onClick={() => setShowRepoForm(false)} className="px-3 py-1.5 text-xs text-text-muted bg-bg-elevated border border-border-subtle rounded-xl">Cancel</button>
                              <button onClick={handleLinkRepo} disabled={linkingRepo}
                                className="flex items-center gap-1.5 px-4 py-1.5 bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-bold rounded-xl hover:bg-primary-500/20 disabled:opacity-50 transition-all">
                                {linkingRepo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link className="w-3.5 h-3.5" />}Link Repo
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* individual reports */}
                  {group.reports?.length > 0 && (
                    <div>
                      <SectionLabel>Individual Reports ({group.reports.length})</SectionLabel>
                      <div className="space-y-1.5">
                        {group.reports.map(report => (
                          <div key={report.id} className="flex items-center gap-3 p-3 bg-white/4 border border-white/8 rounded-xl">
                            <FileText className="w-3.5 h-3.5 text-text-muted shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-text-primary truncate">{report.studentName}</p>
                              {report.rollNumber && <p className="text-[10px] text-text-muted">{report.rollNumber}</p>}
                            </div>
                            <a href={report.fileUrl} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-primary-400 hover:text-primary-300 font-semibold flex items-center gap-1 shrink-0">
                              <ExternalLink className="w-3 h-3" /> View
                            </a>
                            <span className="text-[10px] text-text-muted shrink-0">{fmt(report.submittedAt)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── full-width GitHub viewer ── */}
              <AnimatePresence>
                {showGithub && hasRepo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 border-t border-white/8">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Live Repository Activity</span>
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

      {/* ── AI modal ── */}
      <Modal open={showAiModal} onClose={() => setShowAiModal(false)} title="AI Group Insights">
        <div className="space-y-4">
          <p className="text-text-secondary text-sm">
            AI-generated summary of <strong>{group.name}</strong> based on their proposal, repo status, and reports.
          </p>
          <div className="p-4 bg-bg-elevated/50 border border-border-subtle rounded-xl min-h-[150px]">
            {isAiGenerating ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-primary-400 py-6">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-sm font-medium">Analyzing group data...</span>
              </div>
            ) : aiSummary ? (
              <div className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">{aiSummary}</div>
            ) : (
              <div className="text-sm text-text-muted italic">No summary available.</div>
            )}
          </div>
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setShowAiModal(false)}
              className="px-5 py-2 rounded-xl bg-bg-elevated border border-border-subtle text-text-primary text-sm font-medium hover:border-border-default transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}