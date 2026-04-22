import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StudentLayout from '../../components/layout/v2/StudentLayout';
import InstructorLayout from '../../components/layout/v2/InstructorLayout';
import { lookupUniversity, joinUniversitySpace } from '../../api/authApi';
import api from '../../lib/api';
import {
  KeyRound, Building2, CheckCircle2, ArrowRight, Loader2, AlertCircle,
  BookOpen, PlusCircle, LayoutGrid, Clock, ChevronRight, Trash2,
  Send, AlertTriangle, FileText, BarChart2, GitBranch, ChevronDown,
  CheckCircle, Users, CalendarCheck, X, Info, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── helpers ────────────────────────────────────────────── */
const fmt = (iso) => iso
  ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  : '—';

const isPast = (iso) => iso && new Date(iso) < new Date();

const normalizeCourse = (course) => ({
  ...course,
  status: course.status || course.approvalStatus || 'PENDING',
  targetBranch: course.targetBranch || course.targetBranchName || null,
});

/* ─── status badge ──────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const map = {
    APPROVED:  { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400', label: 'Approved' },
    PENDING:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   text: 'text-amber-400',   dot: 'bg-amber-400',   label: 'Pending Review' },
    REJECTED:  { bg: 'bg-error-500/10',   border: 'border-error-400/20',   text: 'text-error-400',   dot: 'bg-error-400',   label: 'Rejected' },
  };
  const s = map[status] || map.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${s.bg} ${s.border} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

/* ══════════════════════════════════════════════════════════
   ONBOARDING — shared join flow (not yet linked)
══════════════════════════════════════════════════════════ */
function OnboardingFlow({ isStudent, onJoined }) {
  const { refreshUser } = useAuth();
  const [joinCode, setJoinCode] = useState('');
  const [university, setUniversity] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [college, setCollege] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleVerify = async () => {
    if (!joinCode.trim()) { setError('Please enter a join code'); return; }
    setLookupLoading(true); setError('');
    try {
      const res = await lookupUniversity(joinCode.trim().toUpperCase());
      setUniversity(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid join code.');
      setUniversity(null);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      await joinUniversitySpace({
        joinCode: joinCode.trim().toUpperCase(),
        branchId: selectedBranch || undefined,
        sectionId: selectedSection || undefined,
        rollNumber: isStudent ? rollNumber : undefined,
        employeeId: !isStudent ? employeeId : undefined,
        college: isStudent ? college : undefined,
        yearOfStudy: isStudent ? yearOfStudy : undefined,
      });
      if (refreshUser) await refreshUser();
      else window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join university.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="text-center mb-10 animate-fade-in-up">
        <div className="w-20 h-20 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mx-auto mb-5">
          <Building2 className="w-10 h-10 text-primary-400" />
        </div>
        <h1 className="font-syne font-extrabold text-white text-3xl mb-3">Join Your University Space</h1>
        <p className="text-text-secondary max-w-sm mx-auto text-sm leading-relaxed">
          Link your account to unlock private courses, live tests, and campus-exclusive features.
        </p>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-8 shadow-2xl backdrop-blur-xl animate-fade-in-up">
        {!university ? (
          <>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-2">
              University Join Code
            </label>
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={joinCode}
                onChange={e => { setJoinCode(e.target.value.toUpperCase()); setError(''); }}
                placeholder="e.g. UNI-A3K7X"
                maxLength={10}
                className="flex-1 h-14 bg-bg-elevated border border-border-subtle rounded-xl px-4 text-base font-mono text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all tracking-widest uppercase placeholder:text-text-muted"
              />
              <button
                type="button"
                onClick={handleVerify}
                disabled={lookupLoading || !joinCode.trim()}
                className="h-14 px-8 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl font-bold shadow-lg transition-all hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50"
              >
                {lookupLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify'}
              </button>
            </div>
            {error && (
              <div className="bg-error-500/10 border border-error-400/20 text-error-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}
          </>
        ) : (
          <form onSubmit={handleJoin} className="flex flex-col gap-5">
            <div className="flex items-center justify-between px-5 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-sm font-bold text-emerald-300 block">{university.name}</span>
                  <span className="text-xs text-emerald-400/80">Valid Join Code</span>
                </div>
              </div>
              <button type="button" onClick={() => setUniversity(null)} className="text-xs text-text-muted hover:text-white underline">Change</button>
            </div>

            {isStudent ? (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Your Section <span className="text-error-400">*</span></label>
                  <select required value={selectedSection} onChange={e => setSelectedSection(e.target.value)}
                    className="w-full h-12 bg-bg-elevated border border-border-subtle rounded-xl px-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none">
                    <option value="" disabled hidden>Select your assigned section</option>
                    {university.branches?.map(branch => (
                      <optgroup key={branch.id} label={branch.name}>
                        {(branch.sections || []).map(sec => (
                          <option key={sec.id} value={sec.id}>{sec.year} — {sec.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Roll Number <span className="text-error-400">*</span></label>
                  <input type="text" required value={rollNumber} onChange={e => setRollNumber(e.target.value)} placeholder="e.g. 21CS101"
                    className="w-full h-12 bg-bg-elevated border border-border-subtle rounded-xl px-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50 placeholder:text-text-muted" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">College / Institute</label>
                  <input type="text" value={college} onChange={e => setCollege(e.target.value)} placeholder="Optional"
                    className="w-full h-12 bg-bg-elevated border border-border-subtle rounded-xl px-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50 placeholder:text-text-muted" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Year of Study</label>
                  <select value={yearOfStudy} onChange={e => setYearOfStudy(e.target.value)}
                    className="w-full h-12 bg-bg-elevated border border-border-subtle rounded-xl px-4 text-sm text-text-primary focus:outline-none appearance-none">
                    <option value="">Select Year (Optional)</option>
                    {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Post Graduate'].map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Your Branch</label>
                  <select value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)}
                    className="w-full h-12 bg-bg-elevated border border-border-subtle rounded-xl px-4 text-sm text-text-primary focus:outline-none appearance-none">
                    <option value="">Select your branch</option>
                    {university.branches?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Employee ID</label>
                  <input type="text" value={employeeId} onChange={e => setEmployeeId(e.target.value)} placeholder="Optional"
                    className="w-full h-12 bg-bg-elevated border border-border-subtle rounded-xl px-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50 placeholder:text-text-muted" />
                </div>
              </>
            )}

            {error && (
              <div className="bg-error-500/10 border border-error-400/20 text-error-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <button type="submit"
              disabled={submitting || (isStudent && (!selectedSection || !rollNumber))}
              className="w-full h-14 mt-2 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl font-bold shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Integration'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   INSTRUCTOR TABS
══════════════════════════════════════════════════════════ */

/* ── Weightage Builder (inline) ── */
const WEIGHT_CATS = [
  { key: 'weightTests',      label: 'Chapter Tests',     color: '#6C7FD8' },
  { key: 'weightAttendance', label: 'Lecture Completion', color: '#4ECDC4' },
  { key: 'weightLiveTests',  label: 'Live Tests',         color: '#F7B731' },
  { key: 'weightProject',    label: 'Project',            color: '#FC5C7D' },
];
const YEARS = ['First Year', 'Second Year', 'Third Year', 'Fourth Year'];

function WeightageBuilder({ weights, onChange }) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const isValid = total === 100;
  const remaining = 100 - total;
  return (
    <div className="space-y-4">
      {WEIGHT_CATS.map(cat => (
        <div key={cat.key}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-semibold text-text-primary">{cat.label}</span>
            <div className="flex items-center gap-1.5">
              <input type="number" min="0" max="100" value={weights[cat.key]}
                onChange={e => onChange({ ...weights, [cat.key]: Math.max(0, Math.min(100, +e.target.value)) })}
                className="w-14 text-center bg-bg-elevated border border-border-subtle rounded-lg px-2 py-1 text-sm font-bold text-text-primary outline-none focus:border-primary-500 transition-all" />
              <span className="text-xs text-text-muted">%</span>
            </div>
          </div>
          <div className="w-full h-1.5 bg-bg-elevated rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-300" style={{ background: cat.color, width: `${weights[cat.key]}%` }} />
          </div>
        </div>
      ))}
      <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${isValid ? 'bg-emerald-500/10 border-emerald-500/20' : remaining > 0 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-error-500/10 border-error-400/20'}`}>
        <span className={`text-sm font-semibold ${isValid ? 'text-emerald-400' : remaining > 0 ? 'text-amber-400' : 'text-error-400'}`}>
          {isValid ? '✓ Balanced' : remaining > 0 ? `${remaining}% remaining` : `${Math.abs(remaining)}% over`}
        </span>
        <span className={`text-base font-bold font-mono ${isValid ? 'text-emerald-400' : 'text-amber-400'}`}>{total} / 100</span>
      </div>
    </div>
  );
}

/* ── Create Course Tab ── */
function CreateCourseTab({ branches, onSuccess }) {
  const [form, setForm] = useState({ title: '', description: '', longDescription: '', thumbnail: '', duration: '', targetBranchId: '', targetYear: '' });
  const [weights, setWeights] = useState({ weightTests: 30, weightAttendance: 10, weightLiveTests: 20, weightProject: 40 });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const isWeightValid = totalWeight === 100;
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) { setError('Course title is required.'); return; }
    if (!form.description.trim()) { setError('Short description is required.'); return; }
    if (!form.targetBranchId) { setError('Please select a target branch.'); return; }
    if (!form.targetYear) { setError('Please select a target year.'); return; }
    if (!isWeightValid) { setError('Weightages must sum to exactly 100%.'); return; }
    setSubmitting(true);
    try {
      await api.post('/uni-courses', { ...form, ...weights });
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onSuccess(); }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold font-syne text-text-primary">Course Submitted!</h3>
        <p className="text-text-secondary text-sm">Awaiting University Admin approval.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 py-2">
      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-primary-500/8 border border-primary-500/20 rounded-xl">
        <Info className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
        <p className="text-xs text-primary-300 leading-relaxed">
          University courses are <strong>fully dynamic</strong> — you can add chapters, upload materials and insert assessments throughout the course lifecycle after approval.
        </p>
      </div>

      {/* Course Details */}
      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <BookOpen className="w-4 h-4 text-primary-400" />
          <h3 className="text-base font-bold font-syne text-text-primary">Course Details</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1.5">Course Title <span className="text-error-400">*</span></label>
            <input type="text" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Data Structures & Algorithms"
              className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1.5">Short Description <span className="text-error-400">*</span></label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="Brief overview..."
              className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all resize-none text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1.5">Full Description</label>
            <textarea value={form.longDescription} onChange={e => set('longDescription', e.target.value)} rows={4} placeholder="Syllabus, prerequisites, learning outcomes..."
              className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all resize-none text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1.5">Duration</label>
              <input type="text" value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="e.g. 12 weeks"
                className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted outline-none focus:border-primary-500 transition-all text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1.5">Thumbnail URL</label>
              <input type="text" value={form.thumbnail} onChange={e => set('thumbnail', e.target.value)} placeholder="https://..."
                className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted outline-none focus:border-primary-500 transition-all text-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Targeting */}
      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <GitBranch className="w-4 h-4 text-success-400" />
          <h3 className="text-base font-bold font-syne text-text-primary">Targeting</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1.5">Target Branch <span className="text-error-400">*</span></label>
            <select value={form.targetBranchId} onChange={e => set('targetBranchId', e.target.value)}
              className="w-full h-11 bg-bg-elevated border border-border-subtle rounded-xl px-4 text-sm text-text-primary focus:outline-none focus:border-primary-500 appearance-none">
              <option value="" disabled hidden>Select branch</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1.5">Target Year <span className="text-error-400">*</span></label>
            <select value={form.targetYear} onChange={e => set('targetYear', e.target.value)}
              className="w-full h-11 bg-bg-elevated border border-border-subtle rounded-xl px-4 text-sm text-text-primary focus:outline-none focus:border-primary-500 appearance-none">
              <option value="" disabled hidden>Select year</option>
              {YEARS.map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Weightage */}
      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-bold font-syne text-text-primary">Evaluation Weightage</h3>
          </div>
          <span className="text-xs text-text-muted bg-bg-elevated px-3 py-1 rounded-full border border-border-subtle">Must total 100%</span>
        </div>
        <WeightageBuilder weights={weights} onChange={setWeights} />
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-error-500/10 border border-error-400/20 text-error-400 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button type="submit" disabled={submitting || !isWeightValid}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-sm">
          {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Send className="w-4 h-4" /> Submit for Review</>}
        </button>
      </div>
    </form>
  );
}

/* ── My Courses Tab (Instructor) ── */
function InstructorCoursesTab({ courses, loading, onDelete, onStudio }) {
  if (loading) return (
    <div className="space-y-3 py-4">
      {[1,2,3].map(i => <div key={i} className="h-24 bg-bg-surface border border-border-subtle rounded-2xl animate-pulse" />)}
    </div>
  );

  if (courses.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary-500/8 border border-primary-500/20 flex items-center justify-center mb-4">
        <BookOpen className="w-8 h-8 text-primary-400" />
      </div>
      <h3 className="text-lg font-bold font-syne text-text-primary mb-2">No courses yet</h3>
      <p className="text-text-secondary text-sm max-w-xs">Create your first university course and submit it for admin approval.</p>
    </div>
  );

  return (
    <div className="space-y-3 py-2">
      {courses.map((c, i) => (
        <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
          className="flex items-start gap-4 p-5 bg-bg-surface border border-border-subtle rounded-2xl hover:border-border-strong transition-all group">
          {/* icon */}
          <div className="w-11 h-11 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-primary-400" />
          </div>
          {/* content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <h4 className="text-sm font-bold text-text-primary leading-snug truncate">{c.title}</h4>
              <StatusBadge status={c.status} />
            </div>
            <p className="text-xs text-text-muted mt-1 line-clamp-1">{c.description}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
              {c.targetBranch && <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" />{c.targetBranch}</span>}
              {c.targetYear && <span>{c.targetYear}</span>}
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{fmt(c.createdAt)}</span>
            </div>
            {c.status === 'REJECTED' && c.rejectionReason && (
              <div className="mt-2 flex items-start gap-1.5 text-xs text-error-400 bg-error-500/8 px-3 py-2 rounded-lg border border-error-400/15">
                <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                <span>{c.rejectionReason}</span>
              </div>
            )}
          </div>
          {/* actions */}
          <div className="flex items-center gap-2 shrink-0">
            {c.status === 'APPROVED' && (
              <button onClick={() => onStudio(c.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-bold rounded-lg hover:bg-primary-500/20 transition-all">
                <Sparkles className="w-3 h-3" /> Studio
              </button>
            )}
            {c.status === 'PENDING' && (
              <button onClick={() => onDelete(c.id)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:bg-error-500/10 hover:text-error-400 hover:border hover:border-error-400/20 transition-all"
                title="Delete course">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Studio Tab (Instructor) ── */
function StudioTab({ courseId, course }) {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [addForm, setAddForm] = useState({ title: '', type: 'VIDEO', videoUrl: '', textContent: '', description: '', duration: '' });
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const fetchChapters = useCallback(async () => {
    try {
      const res = await api.get(`/courses/${courseId}/chapters`);
      setChapters(res.data || []);
    } catch { setChapters([]); } finally { setLoading(false); }
  }, [courseId]);

  useEffect(() => { fetchChapters(); }, [fetchChapters]);

  const handleAddChapter = async (e) => {
    e.preventDefault();
    if (!addForm.title.trim()) { setError('Title is required.'); return; }
    setAdding(true); setError('');
    try {
      await api.post(`/courses/${courseId}/chapters`, addForm);
      setAddForm({ title: '', type: 'VIDEO', videoUrl: '', textContent: '', description: '', duration: '' });
      setShowAddChapter(false);
      fetchChapters();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add chapter.');
    } finally { setAdding(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
    </div>
  );

  return (
    <div className="py-2 space-y-5 max-w-2xl">
      {/* Course info strip */}
      {course && (
        <div className="p-4 bg-bg-surface border border-border-subtle rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-text-primary">{course.title}</div>
            <div className="text-xs text-text-muted">{course.targetBranch} · {course.targetYear}</div>
          </div>
          <StatusBadge status={course.status} />
        </div>
      )}

      {/* Chapters */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary-400" />
          Chapters ({chapters.length})
        </h3>
        <button onClick={() => setShowAddChapter(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-bold rounded-lg hover:bg-primary-500/20 transition-all">
          <PlusCircle className="w-3.5 h-3.5" />
          Add Chapter
        </button>
      </div>

      {/* Add chapter form */}
      <AnimatePresence>
        {showAddChapter && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="bg-bg-surface border border-primary-500/20 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-text-primary">New Chapter</h4>
              <button onClick={() => setShowAddChapter(false)} className="text-text-muted hover:text-text-primary"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleAddChapter} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1.5">Title <span className="text-error-400">*</span></label>
                <input type="text" value={addForm.title} onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))} placeholder="Chapter title"
                  className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-2.5 text-text-primary placeholder:text-text-muted outline-none focus:border-primary-500 transition-all text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1.5">Type</label>
                  <select value={addForm.type} onChange={e => setAddForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full h-10 bg-bg-elevated border border-border-subtle rounded-xl px-3 text-sm text-text-primary focus:outline-none appearance-none">
                    <option value="VIDEO">Video</option>
                    <option value="TEXT">Text / Reading</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1.5">Duration</label>
                  <input type="text" value={addForm.duration} onChange={e => setAddForm(f => ({ ...f, duration: e.target.value }))} placeholder="e.g. 45 mins"
                    className="w-full h-10 bg-bg-elevated border border-border-subtle rounded-xl px-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary-500 transition-all" />
                </div>
              </div>
              {addForm.type === 'VIDEO' ? (
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1.5">Video URL</label>
                  <input type="text" value={addForm.videoUrl} onChange={e => setAddForm(f => ({ ...f, videoUrl: e.target.value }))} placeholder="YouTube or direct video URL"
                    className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-2.5 text-text-primary placeholder:text-text-muted outline-none focus:border-primary-500 transition-all text-sm" />
                </div>
              ) : (
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1.5">Text Content</label>
                  <textarea value={addForm.textContent} onChange={e => setAddForm(f => ({ ...f, textContent: e.target.value }))} rows={3} placeholder="Reading material..."
                    className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-2.5 text-text-primary placeholder:text-text-muted outline-none focus:border-primary-500 transition-all resize-none text-sm" />
                </div>
              )}
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1.5">Description</label>
                <textarea value={addForm.description} onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="What will students learn in this chapter?"
                  className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-2.5 text-text-primary placeholder:text-text-muted outline-none focus:border-primary-500 transition-all resize-none text-sm" />
              </div>
              {error && <p className="text-xs text-error-400">{error}</p>}
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setShowAddChapter(false)}
                  className="px-4 py-2 text-text-secondary bg-bg-elevated border border-border-subtle rounded-xl text-sm font-medium hover:border-border-strong transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={adding}
                  className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-primary-600 to-accent-500 text-white text-sm font-bold rounded-xl disabled:opacity-50 transition-all active:scale-95">
                  {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                  Add Chapter
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chapter list */}
      {chapters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border-subtle rounded-2xl">
          <FileText className="w-10 h-10 text-text-muted mb-3" />
          <p className="text-text-secondary text-sm font-medium">No chapters yet</p>
          <p className="text-text-muted text-xs mt-1">Add your first chapter to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {chapters.map((ch, i) => (
            <motion.div key={ch.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-center gap-4 p-4 bg-bg-surface border border-border-subtle rounded-xl hover:border-border-strong transition-all group">
              <div className="w-9 h-9 rounded-lg bg-primary-500/10 text-primary-400 flex items-center justify-center shrink-0 text-xs font-bold">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-text-primary truncate">{ch.title}</div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-text-muted">
                  <span className="uppercase tracking-wide font-medium">{ch.type}</span>
                  {ch.duration && <><span>·</span><span>{ch.duration}</span></>}
                  {ch.assessment?.questions?.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-medium">
                      {ch.assessment.questions.length}Q Quiz
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Instructor Overview Tab ── */
function InstructorOverviewTab({ user, courses }) {
  const approved = courses.filter(c => c.status === 'APPROVED').length;
  const pending  = courses.filter(c => c.status === 'PENDING').length;
  const rejected = courses.filter(c => c.status === 'REJECTED').length;

  return (
    <div className="space-y-6 py-2">
      {/* Uni card */}
      <div className="flex items-center gap-5 p-6 bg-bg-surface border border-border-subtle rounded-2xl">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center shadow-xl shrink-0">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <div>
          <div className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-1">Linked University</div>
          <h2 className="text-xl font-bold font-syne text-text-primary">{user.profile?.universityName || 'Your University'}</h2>
          {user.profile?.approvalStatus === 'APPROVED' && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-semibold">Verified Faculty</span>
            </div>
          )}
          {user.profile?.approvalStatus === 'PENDING' && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-amber-400 font-semibold">Pending Approval</span>
            </div>
          )}
        </div>
      </div>

      {user.profile?.approvalStatus === 'PENDING' && (
        <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-300 leading-relaxed">Your instructor account is pending approval from the University Admin. You'll be able to create and manage courses once approved.</p>
        </div>
      )}

      {/* Stats */}
      {user.profile?.approvalStatus === 'APPROVED' && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Approved', value: approved, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
            { label: 'Pending',  value: pending,  color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20'   },
            { label: 'Rejected', value: rejected, color: 'text-error-400',   bg: 'bg-error-500/10',   border: 'border-error-400/20'   },
          ].map(s => (
            <div key={s.label} className={`p-4 rounded-2xl border ${s.bg} ${s.border} text-center`}>
              <div className={`text-2xl font-bold font-syne ${s.color}`}>{s.value}</div>
              <div className={`text-xs font-semibold mt-0.5 ${s.color} opacity-80`}>{s.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   STUDENT TABS
══════════════════════════════════════════════════════════ */

/* ── Student Overview Tab ── */
function StudentOverviewTab({ user, allocations }) {
  return (
    <div className="space-y-6 py-2">
      <div className="flex items-center gap-5 p-6 bg-bg-surface border border-border-subtle rounded-2xl">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-600 flex items-center justify-center shadow-xl shrink-0">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <div>
          <div className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-1">Linked University</div>
          <h2 className="text-xl font-bold font-syne text-text-primary">{user.profile?.universityName || 'Your University'}</h2>
          <div className="flex items-center gap-1.5 mt-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-semibold">Enrolled Student</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl border bg-primary-500/10 border-primary-500/20 text-center">
          <div className="text-2xl font-bold font-syne text-primary-400">{allocations.length}</div>
          <div className="text-xs font-semibold mt-0.5 text-primary-400 opacity-80">Courses Allocated</div>
        </div>
        <div className="p-4 rounded-2xl border bg-amber-500/10 border-amber-500/20 text-center">
          <div className="text-2xl font-bold font-syne text-amber-400">
            {allocations.filter(a => !isPast(a.finalDeadline)).length}
          </div>
          <div className="text-xs font-semibold mt-0.5 text-amber-400 opacity-80">Active Deadlines</div>
        </div>
      </div>
    </div>
  );
}

/* ── Student Courses Tab ── */
function StudentCoursesTab({ allocations, loading }) {
  if (loading) return (
    <div className="space-y-3 py-4">
      {[1,2,3].map(i => <div key={i} className="h-24 bg-bg-surface border border-border-subtle rounded-2xl animate-pulse" />)}
    </div>
  );

  if (allocations.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary-500/8 border border-primary-500/20 flex items-center justify-center mb-4">
        <CalendarCheck className="w-8 h-8 text-primary-400" />
      </div>
      <h3 className="text-lg font-bold font-syne text-text-primary mb-2">No courses allocated yet</h3>
      <p className="text-text-secondary text-sm max-w-xs">Your university admin hasn't allocated any courses to your section yet.</p>
    </div>
  );

  return (
    <div className="space-y-3 py-2">
      {allocations.map((a, i) => {
        const past = isPast(a.finalDeadline);
        return (
          <motion.div key={a.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="flex items-start gap-4 p-5 bg-bg-surface border border-border-subtle rounded-2xl hover:border-border-strong transition-all">
            <div className="w-11 h-11 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-bold text-text-primary leading-snug">{a.courseTitle}</h4>
                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold shrink-0 ${
                  past ? 'bg-error-500/10 border border-error-400/20 text-error-400' : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                }`}>
                  <Clock className="w-3 h-3" />
                  {past ? 'Expired' : fmt(a.finalDeadline)}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-text-muted">
                <span>{a.instructorName}</span>
                {a.targetBranch && <><span>·</span><span>{a.targetBranch}</span></>}
                {a.targetYear && <><span>·</span><span>{a.targetYear}</span></>}
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <Users className="w-3 h-3 text-text-muted" />
                <span className="text-xs text-text-muted">Section: <span className="text-text-secondary font-semibold">{a.sectionName}</span></span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function UniversitySpace() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isStudent = user?.role === 'student';
  const hasJoined = !!user?.universityId || !!user?.profile?.universityName;
  const isApproved = !isStudent ? user?.profile?.approvalStatus === 'APPROVED' : true;

  // Tab state
  const [activeTab, setActiveTab] = useState('overview');
  const [studioTargetId, setStudioTargetId] = useState(null); // courseId for studio

  // Data
  const [courses, setCourses]         = useState([]);  // instructor's uni courses
  const [allocations, setAllocations] = useState([]);  // student's allocated courses
  const [branches, setBranches]       = useState([]);
  const [loading, setLoading]         = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);

  const fetchData = useCallback(async () => {
    if (!hasJoined) return;
    setLoading(true);
    try {
      if (!isStudent) {
        const [coursesRes, branchesRes] = await Promise.all([
          api.get('/uni-courses/my-courses')
            .catch(() => api.get('/uni-courses/my').catch(() => ({ data: [] }))),
          api.get('/uni-courses/branches').catch(() => api.get('/uni-admin/context/branches').catch(() => ({ data: [] }))),
        ]);
        setCourses((coursesRes.data || []).map(normalizeCourse));
        setBranches(branchesRes.data || []);
      } else {
        const res = await api.get('/uni-courses/student/allocated').catch(() => ({ data: [] }));
        setAllocations(res.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, [hasJoined, isStudent]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/uni-courses/${deleteTarget}`);
      setCourses(cs => cs.filter(c => c.id !== deleteTarget));
    } catch {} finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const Layout = isStudent ? StudentLayout : InstructorLayout;

  /* ── Not joined yet ── */
  if (!hasJoined) {
    return (
      <Layout>
        <OnboardingFlow isStudent={isStudent} onJoined={fetchData} />
      </Layout>
    );
  }

  /* ── Build tabs ── */
  const studioCourse = studioTargetId ? courses.find(c => c.id === studioTargetId) : null;

  const instructorTabs = [
    { id: 'overview',  label: 'Overview',    icon: LayoutGrid },
    { id: 'courses',   label: 'My Courses',  icon: BookOpen   },
    ...(isApproved ? [{ id: 'create', label: 'Create Course', icon: PlusCircle }] : []),
    ...(studioTargetId ? [{ id: 'studio', label: 'Studio', icon: Sparkles }] : []),
  ];

  const studentTabs = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'courses',  label: 'My Courses', icon: BookOpen  },
  ];

  const tabs = isStudent ? studentTabs : instructorTabs;

  /* ── render tab content ── */
  const renderContent = () => {
    if (!isStudent) {
      switch (activeTab) {
        case 'overview': return <InstructorOverviewTab user={user} courses={courses} />;
        case 'courses':  return (
          <InstructorCoursesTab
            courses={courses}
            loading={loading}
            onDelete={id => setDeleteTarget(id)}
            onStudio={id => { setStudioTargetId(id); setActiveTab('studio'); }}
          />
        );
        case 'create':   return <CreateCourseTab branches={branches} onSuccess={() => { fetchData(); setActiveTab('courses'); }} />;
        case 'studio':   return <StudioTab courseId={studioTargetId} course={studioCourse} />;
        default:         return null;
      }
    } else {
      switch (activeTab) {
        case 'overview': return <StudentOverviewTab user={user} allocations={allocations} />;
        case 'courses':  return <StudentCoursesTab allocations={allocations} loading={loading} />;
        default:         return null;
      }
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto pb-20">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-syne font-extrabold text-text-primary mb-1">University Space</h1>
          <p className="text-text-secondary text-sm">{user.profile?.universityName || 'Your University'}</p>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-1 mb-8 border-b border-border-subtle overflow-x-auto pb-px">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-all shrink-0 border-b-2 -mb-px ${
                  isActive
                    ? 'text-primary-400 border-primary-500 bg-primary-500/5'
                    : 'text-text-muted border-transparent hover:text-text-secondary hover:bg-bg-surface'
                }`}>
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}>
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Delete confirm modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setDeleteTarget(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-bg-elevated border border-border-default rounded-2xl p-8 max-w-sm w-full shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="w-12 h-12 rounded-xl bg-error-500/10 border border-error-400/20 flex items-center justify-center mb-5">
                <AlertTriangle className="w-6 h-6 text-error-400" />
              </div>
              <h3 className="text-lg font-bold font-syne text-text-primary mb-2">Delete Course?</h3>
              <p className="text-text-secondary text-sm mb-6 leading-relaxed">This will permanently delete the pending course. This action cannot be undone.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteTarget(null)}
                  className="px-5 py-2.5 bg-bg-surface border border-border-subtle text-text-secondary rounded-xl text-sm font-medium hover:border-border-strong transition-all">
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={deleting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-error-500/10 border border-error-400/20 text-error-400 rounded-xl text-sm font-bold hover:bg-error-500/20 transition-all disabled:opacity-50">
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
