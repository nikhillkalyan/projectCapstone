import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Eye, ExternalLink, FileText, Github, Link, Loader2, MessageSquareText, Send, Users, X,
} from 'lucide-react';
import { assignProject, linkRepo, reviewProposal } from './api';
import GitHubViewer from './GitHubViewer';
import GroupChatPanel from './GroupChatPanel';
import { fmt, GroupStatusBadge } from './shared';

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
  const missingReports = Math.max((group.members?.length || 0) - (group.reports?.length || 0), 0);

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
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to link repo');
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
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to assign project');
    } finally {
      setAssigning(false);
    }
  };

  const handleReview = async (action, rejectionReason) => {
    try {
      await reviewProposal(courseId, group.id, { action, rejectionReason });
      onRefresh();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to review proposal');
    }
  };

  return (
    <motion.div layout className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(155deg,rgba(15,23,42,0.96),rgba(7,13,28,0.94))] shadow-[0_20px_70px_rgba(2,6,23,0.28)]">
      <div className="flex items-center gap-4 p-5 cursor-pointer" onClick={() => setExpanded(value => !value)}>
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500/20 to-sky-500/15 border border-white/10 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5 text-violet-300" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-bold font-syne text-white">{group.name}</span>
            <GroupStatusBadge status={group.status} />
            {group.assignedByInstructor && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-bold">Instructor Assigned</span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-2 flex-wrap text-xs text-slate-300">
            <span>{group.members?.length || 0} members</span>
            {group.projectTitle && <span className="truncate max-w-[320px]">· {group.projectTitle}</span>}
            {group.lastMessage && <span className="truncate max-w-[280px]">· {group.lastMessage.senderName}: {group.lastMessage.messageText}</span>}
            {group.unreadMessageCount > 0 && (
              <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold text-sky-200">{group.unreadMessageCount} unread</span>
            )}
            {missingReports > 0 && (
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-200">{missingReports} reports missing</span>
            )}
          </div>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 p-2">
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-300" /> : <ChevronDown className="w-4 h-4 text-slate-300" />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-white/10">
            <div className="p-5 space-y-5">
              <div>
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Members</p>
                <div className="flex flex-wrap gap-2">
                  {group.members?.map(member => (
                    <div key={member.studentId} className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-2xl">
                      <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 text-[10px] font-bold">
                        {member.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-text-primary">{member.name}</p>
                        {member.githubUsername && (
                          <p className="text-[10px] text-text-muted flex items-center gap-1">
                            <Github className="w-2.5 h-2.5" />{member.githubUsername}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Proposal</div>
                  <div className="mt-2 text-lg font-bold text-white">{group.proposal?.status || 'Not submitted'}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Repository</div>
                  <div className="mt-2 text-lg font-bold text-white">{group.repo ? 'Linked' : 'Pending'}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Reports</div>
                  <div className="mt-2 text-lg font-bold text-white">{group.reports?.length || 0}/{group.members?.length || 0}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Chat Status</div>
                  <div className="mt-2 text-lg font-bold text-white">{group.lastMessage ? 'Active' : 'Quiet'}</div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
                      <MessageSquareText className="h-3.5 w-3.5 text-sky-300" />
                      Collaboration Room
                    </p>
                    <p className="mt-1 truncate text-xs text-text-secondary">
                      {group.lastMessage ? `${group.lastMessage.senderName}: ${group.lastMessage.messageText}` : 'No group messages yet'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowChat(value => !value)}
                    className="flex items-center gap-1.5 rounded-xl border border-sky-400/20 bg-sky-500/10 px-3 py-2 text-xs font-bold text-sky-300 transition-all hover:bg-sky-500/20"
                  >
                    <MessageSquareText className="h-3.5 w-3.5" />
                    {showChat ? 'Hide Chat' : 'Open Chat'}
                    {group.unreadMessageCount > 0 && <span className="rounded-full bg-sky-300/20 px-1.5 py-0.5 text-[10px]">{group.unreadMessageCount}</span>}
                  </button>
                </div>
                {showChat && (
                  <div className="mt-4">
                    <GroupChatPanel courseId={courseId} group={group} compact readOnly onRead={onRefresh} />
                  </div>
                )}
              </div>

              {group.proposal && (
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Proposal</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${group.proposal.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' : group.proposal.status === 'REJECTED' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>{group.proposal.status}</span>
                  </div>
                  <p className="text-sm font-bold text-text-primary">{group.proposal.projectTitle}</p>
                  {group.proposal.description && <p className="text-xs text-text-secondary">{group.proposal.description}</p>}
                  {group.proposal.docUrl && (
                    <a href={group.proposal.docUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 font-semibold">
                      <FileText className="w-3.5 h-3.5" /> View Document
                    </a>
                  )}
                  {group.proposal.status === 'PENDING' && (
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => handleReview('APPROVE')} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-500/20 transition-all">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => {
                          const reason = window.prompt('Rejection reason:');
                          if (reason) handleReview('REJECT', reason);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-lg hover:bg-red-500/20 transition-all"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              )}

              {!group.isProposalApproved && (
                <div>
                  {!showAssignForm ? (
                    <button onClick={() => setShowAssignForm(true)} className="flex items-center gap-1.5 text-xs text-orange-300 hover:text-orange-200 font-bold transition-colors">
                      <AlertTriangle className="w-3.5 h-3.5" /> Assign Project to This Group
                    </button>
                  ) : (
                    <div className="p-4 bg-orange-500/5 border border-orange-500/15 rounded-2xl space-y-3">
                      <p className="text-xs font-bold text-orange-400">Assign Project Directly</p>
                      <input
                        type="text"
                        placeholder="Project title"
                        value={assignForm.projectTitle}
                        onChange={e => setAssignForm(current => ({ ...current, projectTitle: e.target.value }))}
                        className="w-full h-9 bg-bg-elevated border border-border-subtle rounded-lg px-3 text-sm text-text-primary outline-none focus:border-orange-500/50 transition-all"
                      />
                      <textarea
                        rows={2}
                        placeholder="What they need to build (description or doc URL)"
                        value={assignForm.projectDoc}
                        onChange={e => setAssignForm(current => ({ ...current, projectDoc: e.target.value }))}
                        className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-orange-500/50 transition-all resize-none"
                      />
                      {error && <p className="text-xs text-red-400">{error}</p>}
                      <div className="flex gap-2">
                        <button onClick={() => setShowAssignForm(false)} className="px-3 py-1.5 text-xs text-text-muted bg-bg-elevated border border-border-subtle rounded-lg">Cancel</button>
                        <button onClick={handleAssign} disabled={assigning} className="flex items-center gap-1.5 px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold rounded-lg hover:bg-orange-500/20 disabled:opacity-50 transition-all">
                          {assigning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                          Assign
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {group.repo ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Github className="w-4 h-4 text-violet-300" />
                      <a href={group.repo.githubUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-primary-300 hover:text-primary-200 flex items-center gap-1">
                        {group.repo.repoName} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <button onClick={() => setShowGithub(value => !value)} className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white font-semibold">
                      <Eye className="w-3.5 h-3.5" /> {showGithub ? 'Hide' : 'Activity'}
                    </button>
                  </div>
                  {showGithub && <GitHubViewer courseId={courseId} groupId={group.id} variant="instructor" />}
                </div>
              ) : (
                <div>
                  {!showRepoForm ? (
                    <button onClick={() => setShowRepoForm(true)} className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 font-bold transition-colors">
                      <Link className="w-3.5 h-3.5" /> Link GitHub Repo
                    </button>
                  ) : (
                    <div className="p-4 bg-primary-500/5 border border-primary-500/15 rounded-xl space-y-3">
                      <p className="text-xs font-bold text-primary-400">Link GitHub Repository</p>
                      <input
                        type="text"
                        placeholder="https://github.com/owner/repo"
                        value={repoForm.githubUrl}
                        onChange={e => setRepoForm(current => ({ ...current, githubUrl: e.target.value }))}
                        className="w-full h-9 bg-bg-elevated border border-border-subtle rounded-lg px-3 text-sm text-text-primary font-mono outline-none focus:border-primary-500/50 transition-all"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Repo name"
                          value={repoForm.repoName}
                          onChange={e => setRepoForm(current => ({ ...current, repoName: e.target.value }))}
                          className="h-9 bg-bg-elevated border border-border-subtle rounded-lg px-3 text-sm text-text-primary outline-none focus:border-primary-500/50 transition-all"
                        />
                        <input
                          type="text"
                          placeholder="Default branch (main)"
                          value={repoForm.defaultBranch}
                          onChange={e => setRepoForm(current => ({ ...current, defaultBranch: e.target.value }))}
                          className="h-9 bg-bg-elevated border border-border-subtle rounded-lg px-3 text-sm text-text-primary outline-none focus:border-primary-500/50 transition-all"
                        />
                      </div>
                      {error && <p className="text-xs text-red-400">{error}</p>}
                      <div className="flex gap-2">
                        <button onClick={() => setShowRepoForm(false)} className="px-3 py-1.5 text-xs text-text-muted bg-bg-elevated border border-border-subtle rounded-lg">Cancel</button>
                        <button onClick={handleLinkRepo} disabled={linkingRepo} className="flex items-center gap-1.5 px-4 py-1.5 bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-bold rounded-lg hover:bg-primary-500/20 disabled:opacity-50 transition-all">
                          {linkingRepo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link className="w-3.5 h-3.5" />}
                          Link Repo
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {group.reports?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Individual Reports ({group.reports.length})</p>
                  <div className="space-y-1.5">
                    {group.reports.map(report => (
                      <div key={report.id} className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
                        <FileText className="w-3.5 h-3.5 text-text-muted shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-text-primary">{report.studentName}</p>
                          {report.rollNumber && <p className="text-[10px] text-text-muted">{report.rollNumber}</p>}
                        </div>
                        <a href={report.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-400 hover:text-primary-300 font-semibold flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" /> View
                        </a>
                        <span className="text-[10px] text-text-muted">{fmt(report.submittedAt)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
