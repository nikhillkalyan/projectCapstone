import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle, AlertTriangle, CheckCircle2, Clock, ExternalLink, Eye, FileText, FolderGit2, Github, Loader2, Send, Upload, Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { uploadFileToCloudinary } from '../../lib/cloudinary';
import { fetchStudentGroup, submitProposal, submitReport } from './api';
import GitHubViewer from './GitHubViewer';
import { fmt, fmtTime, GroupStatusBadge, STUDENT_DOC_TYPES } from './shared';

function StudentMetricCard({ label, value, helper, accent }) {
  return (
    <div className={`rounded-[24px] border p-4 backdrop-blur-xl ${accent}`}>
      <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/60">{label}</div>
      <div className="mt-2 text-2xl font-syne font-extrabold text-text-primary">{value}</div>
      {helper && <div className="mt-1 text-xs text-slate-300">{helper}</div>}
    </div>
  );
}

function StudentDocumentUploader({
  title,
  description,
  value,
  fileName,
  uploading,
  error,
  actionLabel,
  onUpload,
  onClear,
  onManualChange,
}) {
  return (
      <div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
      <div>
        <div className="text-sm font-bold text-text-primary">{title}</div>
        <div className="mt-1 text-xs leading-relaxed text-text-secondary">{description}</div>
      </div>
      <div className="mt-4 space-y-3">
        <label className="relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-sky-400/25 bg-sky-500/5 px-4 py-5 text-center transition-all hover:border-sky-300/40 hover:bg-sky-500/10">
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="absolute inset-0 cursor-pointer opacity-0" onChange={onUpload} disabled={uploading} />
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-sky-300" />
              <div className="mt-2 text-sm font-bold text-sky-200">Uploading document...</div>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 text-sky-300" />
              <div className="mt-2 text-sm font-bold text-text-primary">{actionLabel}</div>
              <div className="mt-1 text-xs text-text-secondary">PDF, JPG or PNG up to 5MB</div>
            </>
          )}
        </label>

        <input
          type="text"
          value={value}
          onChange={e => onManualChange(e.target.value)}
          placeholder="Or paste an existing document URL"
          className="w-full h-10 rounded-xl border border-border-subtle bg-bg-surface px-4 text-sm text-text-primary outline-none transition-all placeholder:text-text-muted focus:border-sky-400/40"
        />

        {value && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">Document Ready</div>
              <div className="mt-1 truncate text-sm font-semibold text-text-primary">{fileName || 'Uploaded document'}</div>
            </div>
            <div className="flex items-center gap-2">
              <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-primary-300 hover:text-primary-200">
                View
              </a>
              <button type="button" onClick={onClear} className="text-xs font-bold text-red-300 hover:text-red-200">
                Clear
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default function StudentProjectView({ courseId, space }) {
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noGroup, setNoGroup] = useState(false);
  const [proposalForm, setProposalForm] = useState({ projectTitle: '', description: '', docUrl: '' });
  const [reportForm, setReportForm] = useState({ fileUrl: '', description: '' });
  const [submittingProposal, setSubmittingProposal] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);
  const [uploadingProposalDoc, setUploadingProposalDoc] = useState(false);
  const [uploadingReportDoc, setUploadingReportDoc] = useState(false);
  const [proposalDocName, setProposalDocName] = useState('');
  const [reportDocName, setReportDocName] = useState('');
  const [showGithub, setShowGithub] = useState(false);
  const [error, setError] = useState('');
  const [reportError, setReportError] = useState('');
  const [groupLoadError, setGroupLoadError] = useState('');

  const loadGroup = useCallback(async () => {
    setLoading(true);
    setNoGroup(false);
    setGroupLoadError('');
    try {
      const data = await fetchStudentGroup(courseId);
      setGroup(data);
    } catch (e) {
      setGroup(null);
      if (e.response?.status === 404) setNoGroup(true);
      else setGroupLoadError(e.response?.data?.message || 'Failed to load your project group');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadGroup();
  }, [loadGroup]);

  const handleProposalUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingProposalDoc(true);
    setError('');
    try {
      const uploaded = await uploadFileToCloudinary(file, {
        folder: 'capstone/project-space/proposals',
        allowedTypes: STUDENT_DOC_TYPES,
      });
      setProposalForm(form => ({ ...form, docUrl: uploaded.url }));
      setProposalDocName(uploaded.originalName);
    } catch (uploadError) {
      setError(uploadError.message || 'Failed to upload proposal document');
    } finally {
      setUploadingProposalDoc(false);
      event.target.value = '';
    }
  };

  const handleReportUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingReportDoc(true);
    setReportError('');
    try {
      const uploaded = await uploadFileToCloudinary(file, {
        folder: 'capstone/project-space/reports',
        allowedTypes: STUDENT_DOC_TYPES,
      });
      setReportForm(form => ({ ...form, fileUrl: uploaded.url }));
      setReportDocName(uploaded.originalName);
    } catch (uploadError) {
      setReportError(uploadError.message || 'Failed to upload report');
    } finally {
      setUploadingReportDoc(false);
      event.target.value = '';
    }
  };

  const handleSubmitProposal = async () => {
    if (!proposalForm.projectTitle.trim()) {
      setError('Title required');
      return;
    }

    setSubmittingProposal(true);
    setError('');
    try {
      await submitProposal(courseId, proposalForm);
      setProposalDocName('');
      loadGroup();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to submit proposal');
    } finally {
      setSubmittingProposal(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!reportForm.fileUrl.trim()) {
      setReportError('File URL required');
      return;
    }

    setSubmittingReport(true);
    setReportError('');
    try {
      await submitReport(courseId, reportForm);
      setReportDocName('');
      loadGroup();
    } catch (e) {
      setReportError(e.response?.data?.message || 'Failed to submit report');
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8 text-sm text-text-muted">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading your project group...
      </div>
    );
  }

  if (groupLoadError) {
    return (
      <div className="flex items-start justify-between gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-400">Could not load your project group</p>
            <p className="text-xs text-red-300 mt-1">{groupLoadError}</p>
          </div>
        </div>
        <button onClick={loadGroup} className="shrink-0 px-3 py-1.5 text-xs font-bold rounded-lg border border-red-500/20 text-red-300 hover:bg-red-500/10 transition-all">
          Retry
        </button>
      </div>
    );
  }

  if (noGroup) {
    return (
      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_38%),linear-gradient(145deg,rgba(15,23,42,0.96),rgba(2,6,23,0.92))]">
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="w-16 h-16 rounded-3xl border border-white/10 bg-white/5 flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-sky-300" />
          </div>
          <p className="text-text-primary text-lg font-bold font-syne mb-2">Team formation is in progress</p>
          <p className="text-text-secondary text-sm max-w-md">Your instructor has opened the project space for this course, but your group has not been allocated yet.</p>
        </div>
      </div>
    );
  }

  if (!group) return null;

  const myMember = group.members?.find(member => member.email === user?.email);
  const myReport = group.reports?.find(report => report.studentId === myMember?.studentId);

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden p-6 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(34,197,94,0.16),_transparent_28%),linear-gradient(140deg,rgba(15,23,42,0.96),rgba(2,6,23,0.92))] border border-white/10 rounded-[28px] space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-400/20 bg-sky-500/10 text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200">
              <FolderGit2 className="w-3.5 h-3.5" />
              Student Project Space
            </div>
            <h4 className="mt-4 text-2xl font-bold font-syne text-white">{space?.courseTitle || group.name}</h4>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              A focused workspace for your team&apos;s proposal, repository, and individual report submissions.
            </p>
            {space?.projectDescription && (
              <p className="mt-4 text-sm text-slate-200/90 leading-relaxed bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                {space.projectDescription}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted mb-2">Assigned Team</p>
            <p className="text-lg font-bold text-white">{group.name}</p>
            <p className="text-xs text-slate-300 mt-1">{group.members?.length} members</p>
            <div className="mt-3">
              <GroupStatusBadge status={group.status} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <StudentMetricCard label="Members" value={group.members?.length || 0} helper="Allocated to this course" accent="border-white/10 bg-white/5" />
          <StudentMetricCard label="Proposal" value={group.proposal?.status || 'Draft'} helper={group.proposal?.projectTitle || 'Ready to submit'} accent="border-sky-400/20 bg-gradient-to-br from-sky-500/16 to-cyan-500/10" />
          <StudentMetricCard label="Repository" value={group.repo ? 'Linked' : 'Pending'} helper={group.repo?.repoName || 'Waiting for instructor'} accent="border-violet-400/20 bg-gradient-to-br from-violet-500/16 to-fuchsia-500/10" />
          <StudentMetricCard label="My Report" value={myReport ? 'Submitted' : 'Pending'} helper={myReport ? fmt(myReport.submittedAt) : 'Upload contribution summary'} accent="border-emerald-400/20 bg-gradient-to-br from-emerald-500/16 to-teal-500/10" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Proposal Deadline</p>
            <p className="mt-2 text-sm font-semibold text-text-primary">{space?.proposalDeadline ? fmtTime(space.proposalDeadline) : 'Not set yet'}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Project Deadline</p>
            <p className="mt-2 text-sm font-semibold text-text-primary">{space?.projectDeadline ? fmtTime(space.projectDeadline) : 'Not set yet'}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {group.members?.map(member => (
            <div key={member.studentId} className={`flex items-center gap-2 px-3 py-2 border rounded-xl ${member.studentId === myMember?.studentId ? 'bg-sky-500/10 border-sky-400/20' : 'bg-white/5 border-white/10'}`}>
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 text-[10px] font-bold">
                {member.name?.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-semibold text-white">{member.name}</p>
                <div className="flex items-center gap-2">
                  {member.githubUsername && <p className="text-[10px] text-slate-300">@{member.githubUsername}</p>}
                  {member.studentId === myMember?.studentId && <span className="text-[10px] text-sky-200 font-bold uppercase tracking-[0.15em]">You</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {group.projectTitle && (
          <div className="p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
            <p className="text-xs font-bold text-emerald-400 mb-1">Project</p>
            <p className="text-sm font-bold text-text-primary">{group.projectTitle}</p>
            {group.assignedByInstructor && group.instructorAssignedDoc && (
              <p className="text-xs text-text-secondary mt-1">{group.instructorAssignedDoc}</p>
            )}
          </div>
        )}
      </div>

      {!group.isProposalApproved && (
        <div className="p-5 bg-bg-surface border border-border-subtle rounded-[28px] space-y-4 shadow-[0_20px_70px_rgba(2,6,23,0.18)]">
          <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" /> Project Proposal
          </h4>

          {group.proposal ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${group.proposal.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>{group.proposal.status}</span>
                <span className="text-xs text-text-muted">{group.proposal.projectTitle}</span>
              </div>
              {group.proposal.status === 'REJECTED' && (
                <p className="text-xs text-red-400 bg-red-500/8 border border-red-500/15 px-3 py-2 rounded-lg">
                  Rejected: {group.proposal.rejectionReason}
                </p>
              )}
            </div>
          ) : null}

          {(!group.proposal || group.proposal?.status === 'REJECTED') && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Project title *"
                value={proposalForm.projectTitle}
                onChange={e => setProposalForm(form => ({ ...form, projectTitle: e.target.value }))}
                className="w-full h-10 bg-bg-elevated border border-border-subtle rounded-xl px-4 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-blue-500/50 transition-all"
              />
              <textarea
                rows={2}
                placeholder="Brief description of what your team will build"
                value={proposalForm.description}
                onChange={e => setProposalForm(form => ({ ...form, description: e.target.value }))}
                className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-blue-500/50 transition-all resize-none"
              />
              <StudentDocumentUploader
                title="Proposal document"
                description="Upload your proposal PDF or images through Cloudinary, or paste an existing link if you already have one."
                value={proposalForm.docUrl}
                fileName={proposalDocName}
                uploading={uploadingProposalDoc}
                error={error}
                actionLabel="Upload proposal file"
                onUpload={handleProposalUpload}
                onClear={() => {
                  setProposalForm(form => ({ ...form, docUrl: '' }));
                  setProposalDocName('');
                  setError('');
                }}
                onManualChange={(value) => {
                  setProposalForm(form => ({ ...form, docUrl: value }));
                  if (!value) setProposalDocName('');
                }}
              />
              <button onClick={handleSubmitProposal} disabled={submittingProposal} className="flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold rounded-xl hover:bg-blue-500/20 disabled:opacity-50 transition-all">
                {submittingProposal ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit Proposal
              </button>
            </div>
          )}
        </div>
      )}

      {group.repo && (
        <div className="p-5 bg-bg-surface border border-border-subtle rounded-[28px] space-y-3 shadow-[0_20px_70px_rgba(2,6,23,0.18)]">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Github className="w-4 h-4 text-text-muted" /> GitHub Repository
            </h4>
            <button onClick={() => setShowGithub(value => !value)} className="text-xs text-primary-400 hover:text-primary-300 font-semibold flex items-center gap-1 transition-colors">
              <Eye className="w-3.5 h-3.5" /> {showGithub ? 'Hide' : 'View Activity'}
            </button>
          </div>
          <a href={group.repo.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-mono text-primary-400 hover:text-primary-300 transition-colors">
            {group.repo.repoName} <ExternalLink className="w-3.5 h-3.5" />
          </a>
          {showGithub && <GitHubViewer courseId={courseId} groupId={group.id} />}
        </div>
      )}

      <div className="p-5 bg-bg-surface border border-border-subtle rounded-[28px] space-y-4 shadow-[0_20px_70px_rgba(2,6,23,0.18)]">
        <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <Upload className="w-4 h-4 text-amber-400" /> Individual Report
        </h4>
        {myReport ? (
          <div className="flex items-center gap-3 p-3 bg-emerald-500/8 border border-emerald-500/15 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <div className="flex-1">
              <p className="text-xs font-bold text-emerald-400">Report submitted</p>
              <p className="text-[11px] text-text-muted">{fmt(myReport.submittedAt)}</p>
            </div>
            <a href={myReport.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-400 hover:text-primary-300 font-semibold flex items-center gap-1">
              <ExternalLink className="w-3 h-3" /> View
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            <StudentDocumentUploader
              title="Contribution report"
              description="Upload the report directly to Cloudinary, or paste an existing report URL if you already have one."
              value={reportForm.fileUrl}
              fileName={reportDocName}
              uploading={uploadingReportDoc}
              error={reportError}
              actionLabel="Upload report file"
              onUpload={handleReportUpload}
              onClear={() => {
                setReportForm(form => ({ ...form, fileUrl: '' }));
                setReportDocName('');
                setReportError('');
              }}
              onManualChange={(value) => {
                setReportForm(form => ({ ...form, fileUrl: value }));
                if (!value) setReportDocName('');
              }}
            />
            <textarea
              rows={2}
              placeholder="Brief summary of your individual contribution"
              value={reportForm.description}
              onChange={e => setReportForm(form => ({ ...form, description: e.target.value }))}
              className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-amber-500/50 transition-all resize-none"
            />
            <button onClick={handleSubmitReport} disabled={submittingReport} className="flex items-center gap-2 px-5 py-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-bold rounded-xl hover:bg-amber-500/20 disabled:opacity-50 transition-all">
              {submittingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Submit Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
