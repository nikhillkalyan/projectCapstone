import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StudentLayout from '../../components/layout/v2/StudentLayout';
import InstructorLayout from '../../components/layout/v2/InstructorLayout';
import { lookupUniversity, joinUniversitySpace } from '../../api/authApi';
import api from '../../lib/api';
import {
  Building2, CheckCircle2, ArrowRight, Loader2, AlertCircle,
  BookOpen, PlusCircle, LayoutGrid, Clock, Trash2, Send,
  AlertTriangle, FileText, BarChart2, GitBranch, ChevronRight,
  CheckCircle, Users, CalendarCheck, X, Info, Sparkles,
  Edit3, Save, Play, Type, Calendar, Zap, Shield, Target,
  ChevronDown, ChevronUp, Plus, Minus, HelpCircle, Eye,
  EyeOff, GripVertical, Award, TrendingUp, Lock, Unlock,
  FolderOpen, Settings, Star, Check, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const fmt = (iso) => iso
  ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  : '—';
const fmtDateInput = (iso) => iso ? new Date(iso).toISOString().slice(0, 16) : '';
const isPast = (iso) => iso && new Date(iso) < new Date();
const daysUntil = (iso) => {
  if (!iso) return null;
  const diff = new Date(iso) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
const normalizeCourse = (c) => ({
  ...c,
  status: c.status || c.approvalStatus || 'PENDING',
  targetBranch: c.targetBranch || c.targetBranchName || null,
});

const StatusBadge = ({ status, size = 'sm' }) => {
  const map = {
    APPROVED: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', text: 'text-emerald-400', dot: 'bg-emerald-400', label: 'Approved' },
    PENDING: { bg: 'bg-amber-500/10', border: 'border-amber-500/25', text: 'text-amber-400', dot: 'bg-amber-400', label: 'Pending' },
    REJECTED: { bg: 'bg-red-500/10', border: 'border-red-500/25', text: 'text-red-400', dot: 'bg-red-400', label: 'Rejected' },
  };
  const s = map[status] || map.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold border ${s.bg} ${s.border} ${s.text} ${size === 'xs' ? 'text-[10px]' : 'text-xs'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} animate-pulse`} />
      {s.label}
    </span>
  );
};

const DeadlinePill = ({ deadline, showDays = true }) => {
  if (!deadline) return <span className="text-xs text-text-muted italic">No deadline set</span>;
  const days = daysUntil(deadline);
  const past = days !== null && days < 0;
  const urgent = days !== null && days <= 3 && days >= 0;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
      past ? 'bg-red-500/10 border-red-500/25 text-red-400' :
      urgent ? 'bg-orange-500/10 border-orange-500/25 text-orange-400' :
        'bg-indigo-500/10 border-indigo-500/25 text-indigo-400'
    }`}>
      <Calendar className="w-3 h-3" />
      {past ? `Expired ${fmt(deadline)}` : fmt(deadline)}
      {showDays && !past && days !== null && <span className="opacity-70">· {days}d</span>}
    </span>
  );
};

function OnboardingFlow({ isStudent }) {
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
    } finally { setLookupLoading(false); }
  };

  const handleJoin = async (e) => {
    e.preventDefault(); setSubmitting(true); setError('');
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
      if (refreshUser) await refreshUser(); else window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join university.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-lg mx-auto py-16">
      <div className="text-center mb-12">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 blur-xl" />
          <div className="relative w-24 h-24 rounded-3xl bg-bg-surface border border-primary-500/20 flex items-center justify-center">
            <Building2 className="w-12 h-12 text-primary-400" />
          </div>
        </div>
        <h1 className="font-syne font-extrabold text-white text-3xl mb-3 tracking-tight">
          University Space
        </h1>
        <p className="text-text-secondary text-sm leading-relaxed max-w-xs mx-auto">
          Enter your institution's exclusive digital campus for private courses, live sessions, and project collaboration.
        </p>
      </div>

      <div className="bg-bg-surface/60 backdrop-blur-xl border border-border-subtle rounded-3xl p-8 shadow-2xl">
        {!university ? (
          <>
            <label className="text-xs font-bold text-text-muted uppercase tracking-widest block mb-3">
              Institution Join Code
            </label>
            <div className="flex gap-3 mb-4">
              <input type="text" value={joinCode}
                onChange={e => { setJoinCode(e.target.value.toUpperCase()); setError(''); }}
                placeholder="UNI-XXXXX" maxLength={10}
                className="flex-1 h-14 bg-bg-elevated border border-border-subtle rounded-2xl px-5 text-lg font-mono text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/40 transition-all tracking-widest uppercase placeholder:text-text-muted/40 placeholder:text-base placeholder:tracking-normal"
              />
              <button onClick={handleVerify} disabled={lookupLoading || !joinCode.trim()}
                className="h-14 px-7 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-2xl font-bold shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-primary-500/30 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed text-sm">
                {lookupLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify'}
              </button>
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}
          </>
        ) : (
          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-4 py-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <span className="text-sm font-bold text-emerald-300 block">{university.name}</span>
                  <span className="text-xs text-emerald-400/70">Verified Institution</span>
                </div>
              </div>
              <button type="button" onClick={() => setUniversity(null)} className="text-xs text-text-muted hover:text-white underline">Change</button>
            </div>

            {isStudent ? (
              <>
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest block mb-2">Section <span className="text-red-400">*</span></label>
                  <select required value={selectedSection} onChange={e => setSelectedSection(e.target.value)}
                    className="w-full h-12 bg-bg-elevated border border-border-subtle rounded-xl px-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/40 appearance-none">
                    <option value="" disabled hidden>Select your assigned section</option>
                    {university.branches?.map(b => (
                      <optgroup key={b.id} label={b.name}>
                        {(b.sections || []).map(s => <option key={s.id} value={s.id}>{s.year} — {s.name}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest block mb-2">Roll Number <span className="text-red-400">*</span></label>
                  <input required type="text" value={rollNumber} onChange={e => setRollNumber(e.target.value)} placeholder="e.g. 21CS101"
                    className="w-full h-12 bg-bg-elevated border border-border-subtle rounded-xl px-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/40 placeholder:text-text-muted/40" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-text-muted uppercase tracking-widest block mb-2">College</label>
                    <input type="text" value={college} onChange={e => setCollege(e.target.value)} placeholder="Optional"
                      className="w-full h-12 bg-bg-elevated border border-border-subtle rounded-xl px-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/40 placeholder:text-text-muted/40" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-text-muted uppercase tracking-widest block mb-2">Year</label>
                    <select value={yearOfStudy} onChange={e => setYearOfStudy(e.target.value)}
                      className="w-full h-12 bg-bg-elevated border border-border-subtle rounded-xl px-4 text-sm text-text-primary focus:outline-none appearance-none">
                      <option value="">Optional</option>
                      {['1st Year', '2nd Year', '3rd Year', '4th Year'].map(y => <option key={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest block mb-2">Department / Branch</label>
                  <select value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)}
                    className="w-full h-12 bg-bg-elevated border border-border-subtle rounded-xl px-4 text-sm text-text-primary focus:outline-none appearance-none">
                    <option value="">Select your branch</option>
                    {university.branches?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest block mb-2">Employee ID</label>
                  <input type="text" value={employeeId} onChange={e => setEmployeeId(e.target.value)} placeholder="Optional"
                    className="w-full h-12 bg-bg-elevated border border-border-subtle rounded-xl px-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/40 placeholder:text-text-muted/40" />
                </div>
              </>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}
            <button type="submit" disabled={submitting || (isStudent && (!selectedSection || !rollNumber))}
              className="w-full h-14 mt-2 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-2xl font-bold shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm">
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ArrowRight className="w-4 h-4" /> Join University Space</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function QuizBuilder({ chapterId, courseId, existingAssessment, onSaved }) {
  const hasQuiz = !!existingAssessment;
  const [open, setOpen] = useState(false);
  const [questions, setQuestions] = useState(
    existingAssessment?.questions?.map(q => ({
      questionText: q.questionText,
      correctOptionIndex: q.correctOptionIndex,
      options: q.options?.sort((a, b) => a.optionIndex - b.optionIndex).map(o => o.optionText) || ['', '', '', ''],
    })) || [{ questionText: '', correctOptionIndex: 0, options: ['', '', '', ''] }]
  );
  const [passingScore, setPassingScore] = useState(existingAssessment?.passingScore || 70);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const addQ = () => setQuestions(qs => [...qs, { questionText: '', correctOptionIndex: 0, options: ['', '', '', ''] }]);
  const removeQ = (i) => setQuestions(qs => qs.filter((_, idx) => idx !== i));
  const updateQ = (i, field, val) => setQuestions(qs => qs.map((q, idx) => idx === i ? { ...q, [field]: val } : q));
  const updateOpt = (qi, oi, val) => setQuestions(qs => qs.map((q, idx) => idx === qi ? { ...q, options: q.options.map((o, j) => j === oi ? val : o) } : q));

  const handleSave = async () => {
    const valid = questions.every(q => q.questionText.trim() && q.options.every(o => o.trim()));
    if (!valid) { setError('Fill in all questions and options.'); return; }
    setSaving(true); setError('');
    try {
      await api.post(`/courses/${courseId}/chapters/${chapterId}/assessment`, {
        title: 'Chapter Quiz', passingScore,
        questions: questions.map(q => ({
          questionText: q.questionText,
          correctOptionIndex: q.correctOptionIndex,
          options: q.options,
        })),
      });
      setSaved(true); setOpen(false);
      if (onSaved) onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save quiz.');
    } finally { setSaving(false); }
  };

  return (
    <div className="mt-4 border-t border-border-subtle/50 pt-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setOpen(v => !v)}
          className={`flex items-center gap-2 text-xs font-bold transition-all ${open ? 'text-amber-400' : 'text-text-muted hover:text-amber-400'}`}>
          <HelpCircle className="w-3.5 h-3.5" />
          {hasQuiz || saved ? 'Quiz Attached' : 'Add Quiz'}
          {(hasQuiz || saved) && <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[9px]">✓</span>}
          {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">Pass %</span>
          <input type="number" min="1" max="100" value={passingScore}
            onChange={e => setPassingScore(+e.target.value)}
            className="w-14 h-7 bg-bg-elevated border border-border-subtle rounded-lg px-2 text-xs font-bold text-center text-text-primary outline-none focus:border-amber-500 transition-all" />
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden">
            <div className="space-y-4 pb-2">
              {questions.map((q, qi) => (
                <div key={qi} className="p-4 bg-bg-elevated/50 border border-border-subtle rounded-xl relative group">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Q{qi + 1}</span>
                    {questions.length > 1 && (
                      <button onClick={() => removeQ(qi)} className="ml-auto w-6 h-6 rounded-lg text-text-muted hover:bg-red-500/10 hover:text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <input type="text" value={q.questionText} onChange={e => updateQ(qi, 'questionText', e.target.value)}
                    placeholder="Question text..."
                    className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-amber-500/50 transition-all mb-3" />
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <button onClick={() => updateQ(qi, 'correctOptionIndex', oi)}
                          className={`w-5 h-5 rounded-full flex-shrink-0 border-2 transition-all ${q.correctOptionIndex === oi ? 'bg-emerald-500 border-emerald-500' : 'border-border-subtle hover:border-emerald-500/40'}`}>
                          {q.correctOptionIndex === oi && <div className="w-2 h-2 bg-white rounded-full mx-auto" />}
                        </button>
                        <input type="text" value={opt} onChange={e => updateOpt(qi, oi, e.target.value)}
                          placeholder={`Option ${oi + 1}`}
                          className={`flex-1 bg-bg-elevated border rounded-lg px-2.5 py-1.5 text-xs text-text-primary placeholder:text-text-muted outline-none transition-all ${q.correctOptionIndex === oi ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border-subtle focus:border-primary-500/50'}`} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={addQ} className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 font-semibold transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add Question
              </button>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <div className="flex justify-end gap-2 pt-1">
                <button onClick={() => setOpen(false)} className="px-4 py-2 text-xs text-text-muted bg-bg-elevated border border-border-subtle rounded-xl hover:border-border-strong transition-all">Cancel</button>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold rounded-xl hover:bg-amber-500/20 transition-all disabled:opacity-50">
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Quiz
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChapterCard({ chapter, index, courseId, onDelete, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: chapter.title,
    duration: chapter.duration || '',
    type: chapter.type || 'VIDEO',
    videoUrl: chapter.videoUrl || '',
    textContent: chapter.textContent || '',
    description: chapter.description || '',
    deadline: fmtDateInput(chapter.deadline),
    penaltyPerDay: chapter.penaltyPerDay ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Title required.'); return; }
    setSaving(true); setError('');
    try {
      const payload = {
        ...form,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
        penaltyPerDay: +form.penaltyPerDay,
      };
      const res = await api.put(`/courses/${courseId}/chapters/${chapter.id}`, payload);
      onUpdate(res.data);
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save.');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/courses/${courseId}/chapters/${chapter.id}`);
      onDelete(chapter.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed.');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const days = daysUntil(chapter.deadline);
  const deadlinePast = isPast(chapter.deadline);
  const deadlineUrgent = days !== null && days <= 3 && days >= 0;

  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
      className={`border rounded-2xl overflow-hidden transition-all duration-200 ${expanded ? 'border-primary-500/30 shadow-lg shadow-primary-500/5' : 'border-border-subtle hover:border-border-strong'} bg-bg-surface`}>
      <div className="flex items-center gap-3 p-4 cursor-pointer select-none" onClick={() => { if (!editing) setExpanded(v => !v); }}>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-all ${expanded ? 'bg-primary-500/20 text-primary-400' : 'bg-bg-elevated text-text-muted'}`}>
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-text-primary truncate">{chapter.title}</span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${chapter.type === 'VIDEO' ? 'bg-primary-500/10 text-primary-400' : 'bg-amber-500/10 text-amber-400'}`}>
              {chapter.type === 'VIDEO' ? '▶ Video' : '📄 Text'}
            </span>
            {chapter.assessment && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400">
                {chapter.assessment.questions?.length || 0}Q Quiz
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            {chapter.duration && <span className="text-xs text-text-muted flex items-center gap-1"><Clock className="w-3 h-3" />{chapter.duration}</span>}
            {chapter.deadline && (
              <span className={`text-xs font-semibold flex items-center gap-1 ${deadlinePast ? 'text-red-400' : deadlineUrgent ? 'text-orange-400' : 'text-indigo-400'}`}>
                <Calendar className="w-3 h-3" />
                {deadlinePast ? 'Expired' : `Due ${fmt(chapter.deadline)}`}
                {!deadlinePast && days !== null && <span className="opacity-60">({days}d)</span>}
              </span>
            )}
            {chapter.penaltyPerDay > 0 && (
              <span className="text-xs text-red-400/70 flex items-center gap-1">
                <Minus className="w-3 h-3" />{chapter.penaltyPerDay} marks/day
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button onClick={e => { e.stopPropagation(); setEditing(v => !v); setExpanded(true); }}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${editing ? 'bg-primary-500/20 text-primary-400' : 'text-text-muted hover:bg-bg-elevated hover:text-text-primary'}`}>
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button onClick={e => { e.stopPropagation(); setConfirmDelete(true); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-red-500/10 hover:text-red-400 transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <div className={`w-6 h-6 flex items-center justify-center text-text-muted transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden border-t border-border-subtle/50">
            <div className="p-4 space-y-4">
              {editing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">Title <span className="text-red-400">*</span></label>
                      <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary-500 transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">Type</label>
                      <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                        className="w-full h-10 bg-bg-elevated border border-border-subtle rounded-xl px-3 text-sm text-text-primary focus:outline-none appearance-none">
                        <option value="VIDEO">Video</option>
                        <option value="TEXT">Text / Reading</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">Duration</label>
                      <input type="text" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="e.g. 45 mins"
                        className="w-full h-10 bg-bg-elevated border border-border-subtle rounded-xl px-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary-500 transition-all" />
                    </div>
                  </div>

                  {form.type === 'VIDEO' ? (
                    <div>
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">Video URL</label>
                      <input type="text" value={form.videoUrl} onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))} placeholder="YouTube or direct link"
                        className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary-500 transition-all" />
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">Text Content</label>
                      <textarea value={form.textContent} onChange={e => setForm(f => ({ ...f, textContent: e.target.value }))} rows={4} placeholder="Reading material, notes..."
                        className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary-500 transition-all resize-none" />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">Description</label>
                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="What students will learn..."
                      className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary-500 transition-all resize-none" />
                  </div>

                  <div className="p-4 bg-indigo-500/5 border border-indigo-500/15 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Completion Deadline</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-text-muted block mb-1.5">Deadline Date & Time</label>
                        <input type="datetime-local" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                          className="w-full h-10 bg-bg-elevated border border-indigo-500/20 rounded-xl px-3 text-xs text-text-primary focus:outline-none focus:border-indigo-500/50 transition-all" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-text-muted block mb-1.5">Penalty (marks/day late)</label>
                        <div className="relative">
                          <input type="number" min="0" step="0.5" value={form.penaltyPerDay}
                            onChange={e => setForm(f => ({ ...f, penaltyPerDay: e.target.value }))}
                            className="w-full h-10 bg-bg-elevated border border-indigo-500/20 rounded-xl px-3 text-xs text-text-primary focus:outline-none focus:border-indigo-500/50 transition-all" />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">marks</span>
                        </div>
                      </div>
                    </div>
                    {form.deadline && (
                      <p className="text-xs text-indigo-400/70">
                        Students must complete this chapter by {fmt(form.deadline)}.
                        {form.penaltyPerDay > 0 && ` Late submissions lose ${form.penaltyPerDay} mark(s) per day.`}
                      </p>
                    )}
                  </div>

                  {error && <p className="text-xs text-red-400">{error}</p>}
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => { setEditing(false); setError(''); }}
                      className="px-4 py-2 text-xs text-text-muted bg-bg-elevated border border-border-subtle rounded-xl hover:border-border-strong transition-all">
                      Discard
                    </button>
                    <button onClick={handleSave} disabled={saving}
                      className="flex items-center gap-1.5 px-5 py-2 bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-bold rounded-xl hover:bg-primary-500/20 transition-all disabled:opacity-50">
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {chapter.description && (
                    <p className="text-sm text-text-secondary leading-relaxed">{chapter.description}</p>
                  )}
                  {chapter.type === 'VIDEO' && chapter.videoUrl && (
                    <a href={chapter.videoUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs text-primary-400 hover:text-primary-300 font-semibold transition-colors">
                      <Play className="w-3.5 h-3.5" /> View Video
                    </a>
                  )}
                  {chapter.type === 'TEXT' && chapter.textContent && (
                    <div className="p-3 bg-bg-elevated/50 rounded-xl border border-border-subtle/50">
                      <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap line-clamp-3">{chapter.textContent}</p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <DeadlinePill deadline={chapter.deadline} />
                    {chapter.penaltyPerDay > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 border border-red-500/20 text-red-400">
                        <Minus className="w-3 h-3" />{chapter.penaltyPerDay} marks/day penalty
                      </span>
                    )}
                  </div>
                </div>
              )}

              {!editing && (
                <QuizBuilder
                  chapterId={chapter.id}
                  courseId={courseId}
                  existingAssessment={chapter.assessment}
                  onSaved={() => {}}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-bg-elevated/95 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
            <div className="text-center p-6">
              <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
              <p className="text-sm font-bold text-text-primary mb-1">Delete Chapter?</p>
              <p className="text-xs text-text-muted mb-4">This removes the chapter and its quiz permanently.</p>
              <div className="flex gap-2 justify-center">
                <button onClick={() => setConfirmDelete(false)} className="px-4 py-2 text-xs text-text-muted bg-bg-surface border border-border-subtle rounded-xl">Cancel</button>
                <button onClick={handleDelete} disabled={deleting}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl hover:bg-red-500/20 disabled:opacity-50">
                  {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function AddChapterForm({ courseId, onAdded, onCancel, nextOrder }) {
  const [form, setForm] = useState({
    title: '', type: 'VIDEO', videoUrl: '', textContent: '',
    description: '', duration: '', deadline: '', penaltyPerDay: 0,
  });
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setAdding(true); setError('');
    try {
      const res = await api.post(`/courses/${courseId}/chapters`, {
        ...form,
        chapterOrder: nextOrder,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
        penaltyPerDay: +form.penaltyPerDay,
      });
      onAdded(res.data);
      onCancel();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add chapter.');
    } finally { setAdding(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      className="border border-primary-500/25 bg-primary-500/3 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-primary-400 flex items-center gap-2"><Plus className="w-4 h-4" /> New Chapter</span>
        <button onClick={onCancel} className="text-text-muted hover:text-text-primary"><X className="w-4 h-4" /></button>
      </div>
      <form onSubmit={handleAdd} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">Chapter Title <span className="text-red-400">*</span></label>
            <input type="text" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Introduction to Sorting Algorithms" autoFocus
              className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary-500 transition-all" />
          </div>
          <div>
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">Type</label>
            <select value={form.type} onChange={e => set('type', e.target.value)}
              className="w-full h-10 bg-bg-elevated border border-border-subtle rounded-xl px-3 text-sm text-text-primary focus:outline-none appearance-none">
              <option value="VIDEO">Video</option>
              <option value="TEXT">Text / Reading</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">Duration</label>
            <input type="text" value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="e.g. 45 mins"
              className="w-full h-10 bg-bg-elevated border border-border-subtle rounded-xl px-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary-500 transition-all" />
          </div>
        </div>

        {form.type === 'VIDEO' ? (
          <div>
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">Video URL</label>
            <input type="text" value={form.videoUrl} onChange={e => set('videoUrl', e.target.value)} placeholder="YouTube embed or direct video URL"
              className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary-500 transition-all" />
          </div>
        ) : (
          <div>
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">Text Content</label>
            <textarea value={form.textContent} onChange={e => set('textContent', e.target.value)} rows={3} placeholder="Reading material, notes, markdown..."
              className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary-500 transition-all resize-none" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 p-3 bg-indigo-500/5 border border-indigo-500/15 rounded-xl">
          <div>
            <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1 mb-1.5"><Calendar className="w-3 h-3" /> Deadline</label>
            <input type="datetime-local" value={form.deadline} onChange={e => set('deadline', e.target.value)}
              className="w-full h-9 bg-bg-elevated border border-indigo-500/20 rounded-lg px-2 text-xs text-text-primary focus:outline-none focus:border-indigo-500/50 transition-all" />
          </div>
          <div>
            <label className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1 mb-1.5"><Minus className="w-3 h-3" /> Penalty</label>
            <div className="flex items-center gap-2">
              <input type="number" min="0" step="0.5" value={form.penaltyPerDay} onChange={e => set('penaltyPerDay', e.target.value)}
                className="w-20 h-9 bg-bg-elevated border border-red-500/20 rounded-lg px-2 text-xs text-text-primary focus:outline-none focus:border-red-500/40 transition-all" />
              <span className="text-xs text-text-muted">marks/day</span>
            </div>
          </div>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex gap-2 justify-end pt-1">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-xs text-text-muted bg-bg-elevated border border-border-subtle rounded-xl hover:border-border-strong transition-all">Cancel</button>
          <button type="submit" disabled={adding}
            className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-primary-600 to-accent-500 text-white text-xs font-bold rounded-xl disabled:opacity-50 transition-all active:scale-95">
            {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlusCircle className="w-3.5 h-3.5" />}
            Add Chapter
          </button>
        </div>
      </form>
    </motion.div>
  );
}

function PenaltySettingsPanel({ courseId, defaultPenaltyPerDay, penaltyDescription, onSaved }) {
  const [open, setOpen] = useState(false);
  const [penalty, setPenalty] = useState(defaultPenaltyPerDay ?? 0);
  const [desc, setDesc] = useState(penaltyDescription || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/uni-courses/${courseId}/settings`, {
        defaultPenaltyPerDay: +penalty,
        penaltyDescription: desc,
      });
      onSaved({ defaultPenaltyPerDay: +penalty, penaltyDescription: desc });
      setOpen(false);
    } catch {} finally { setSaving(false); }
  };

  return (
    <div className="p-4 bg-red-500/5 border border-red-500/15 rounded-2xl">
      <button onClick={() => setOpen(v => !v)} className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-red-400" />
          <span className="text-sm font-bold text-red-400">Penalty Policy</span>
          {defaultPenaltyPerDay > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">{defaultPenaltyPerDay} marks/day default</span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">Default Penalty (marks/day)</label>
                  <input type="number" min="0" step="0.5" value={penalty} onChange={e => setPenalty(e.target.value)}
                    className="w-full h-10 bg-bg-elevated border border-red-500/20 rounded-xl px-3 text-sm text-text-primary focus:outline-none focus:border-red-500/40 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">Policy Description</label>
                  <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g. 2 marks deducted per day after deadline"
                    className="w-full h-10 bg-bg-elevated border border-border-subtle rounded-xl px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-red-500/40 transition-all" />
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl hover:bg-red-500/20 transition-all disabled:opacity-50">
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Policy
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StudioTab({ courseId, course, onCourseUpdate }) {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [courseSettings, setCourseSettings] = useState({
    defaultPenaltyPerDay: course?.defaultPenaltyPerDay ?? 0,
    penaltyDescription: course?.penaltyDescription || '',
  });

  const fetchChapters = useCallback(async () => {
    try {
      const res = await api.get(`/courses/${courseId}/chapters`);
      setChapters(res.data || []);
    } catch { setChapters([]); } finally { setLoading(false); }
  }, [courseId]);

  useEffect(() => { fetchChapters(); }, [fetchChapters]);

  const handleAdded = (ch) => setChapters(prev => [...prev, ch]);
  const handleDeleted = (id) => setChapters(prev => prev.filter(c => c.id !== id));
  const handleUpdated = (updated) => setChapters(prev => prev.map(c => c.id === updated.id ? updated : c));

  const withDeadline = chapters.filter(c => c.deadline).length;
  const withQuiz = chapters.filter(c => c.assessment).length;
  const overdue = chapters.filter(c => isPast(c.deadline)).length;

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        <span className="text-xs text-text-muted">Loading studio...</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 py-2">
      {course && (
        <div className="relative overflow-hidden p-5 rounded-2xl border border-primary-500/20 bg-gradient-to-r from-primary-500/8 to-accent-500/5">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary-500/5 blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center gap-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold font-syne text-text-primary truncate">{course.title}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {course.targetBranch && <span className="text-xs text-text-muted flex items-center gap-1"><GitBranch className="w-3 h-3" />{course.targetBranch}</span>}
                {course.targetYear && <span className="text-xs text-text-muted">{course.targetYear}</span>}
                <StatusBadge status={course.status} size="xs" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-4">
            {[
              { label: 'Chapters', val: chapters.length, icon: FileText, color: 'text-primary-400' },
              { label: 'With Deadline', val: withDeadline, icon: Calendar, color: 'text-indigo-400' },
              { label: 'With Quiz', val: withQuiz, icon: HelpCircle, color: 'text-amber-400' },
              { label: 'Overdue', val: overdue, icon: AlertTriangle, color: overdue > 0 ? 'text-red-400' : 'text-text-muted' },
            ].map(s => (
              <div key={s.label} className="text-center p-2 bg-bg-surface/40 rounded-xl border border-border-subtle/40">
                <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
                <div className={`text-lg font-bold font-syne ${s.color}`}>{s.val}</div>
                <div className="text-[10px] text-text-muted font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <PenaltySettingsPanel
        courseId={courseId}
        defaultPenaltyPerDay={courseSettings.defaultPenaltyPerDay}
        penaltyDescription={courseSettings.penaltyDescription}
        onSaved={updates => setCourseSettings(s => ({ ...s, ...updates }))}
      />

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-primary-400" />
          Curriculum <span className="text-text-muted font-normal">({chapters.length} chapters)</span>
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowProgress(v => !v)}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
              showProgress
                ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'
                : 'bg-bg-elevated border-border-subtle text-text-muted hover:border-border-strong hover:text-text-secondary'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Student Progress
          </button>
          {!showAdd && (
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-bold rounded-xl hover:bg-primary-500/20 transition-all active:scale-95">
              <Plus className="w-3.5 h-3.5" /> Add Chapter
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <AddChapterForm courseId={courseId} onAdded={handleAdded} onCancel={() => setShowAdd(false)} nextOrder={chapters.length + 1} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProgress && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 bg-bg-surface border border-indigo-500/20 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-bold text-indigo-400">Student Progress</span>
              </div>
              <StudentProgressTable courseId={courseId} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {chapters.length === 0 && !showAdd ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border-subtle rounded-2xl">
          <FolderOpen className="w-12 h-12 text-text-muted mb-3 opacity-40" />
          <p className="text-text-secondary text-sm font-bold mb-1">No chapters yet</p>
          <p className="text-text-muted text-xs mb-5">Start building your curriculum by adding the first chapter.</p>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-bold rounded-xl hover:bg-primary-500/20 transition-all">
            <Plus className="w-4 h-4" /> Add First Chapter
          </button>
        </div>
      ) : (
        <div className="space-y-3 relative">
          {chapters.map((ch, i) => (
            <div key={ch.id} className="relative">
              <ChapterCard
                chapter={ch}
                index={i}
                courseId={courseId}
                onDelete={handleDeleted}
                onUpdate={handleUpdated}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const WEIGHT_CATS = [
  { key: 'weightTests', label: 'Chapter Tests', color: '#6C7FD8' },
  { key: 'weightAttendance', label: 'Lecture Completion', color: '#4ECDC4' },
  { key: 'weightLiveTests', label: 'Live Tests', color: '#F7B731' },
  { key: 'weightProject', label: 'Project', color: '#FC5C7D' },
];
const YEARS = ['First Year', 'Second Year', 'Third Year', 'Fourth Year'];

function WeightageBuilder({ weights, onChange }) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const isValid = total === 100;
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
      <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${isValid ? 'bg-emerald-500/10 border-emerald-500/20' : total < 100 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
        <span className={`text-sm font-semibold ${isValid ? 'text-emerald-400' : total < 100 ? 'text-amber-400' : 'text-red-400'}`}>
          {isValid ? '✓ Balanced' : total < 100 ? `${100 - total}% remaining` : `${total - 100}% over`}
        </span>
        <span className={`text-base font-bold font-mono ${isValid ? 'text-emerald-400' : 'text-amber-400'}`}>{total} / 100</span>
      </div>
    </div>
  );
}

function CreateCourseTab({ branches, onSuccess }) {
  const [form, setForm] = useState({ title: '', description: '', longDescription: '', thumbnail: '', duration: '', targetBranchId: '', targetYear: '' });
  const [weights, setWeights] = useState({ weightTests: 30, weightAttendance: 10, weightLiveTests: 20, weightProject: 40 });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (!form.title.trim()) { setError('Course title is required.'); return; }
    if (!form.description.trim()) { setError('Short description is required.'); return; }
    if (!form.targetBranchId) { setError('Please select a target branch.'); return; }
    if (!form.targetYear) { setError('Please select a target year.'); return; }
    if (totalWeight !== 100) { setError('Weightages must sum to exactly 100%.'); return; }
    setSubmitting(true);
    try {
      await api.post('/uni-courses', { ...form, ...weights });
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onSuccess(); }, 1500);
    } catch (err) { setError(err.response?.data?.message || 'Submission failed.'); }
    finally { setSubmitting(false); }
  };

  if (success) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
        className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
        <CheckCircle className="w-10 h-10 text-emerald-400" />
      </motion.div>
      <h3 className="text-xl font-bold font-syne text-text-primary">Course Submitted!</h3>
      <p className="text-text-secondary text-sm">Awaiting University Admin approval.</p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5 py-2">
      <div className="flex items-start gap-3 p-4 bg-primary-500/8 border border-primary-500/20 rounded-xl">
        <Info className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
        <p className="text-xs text-primary-300 leading-relaxed">University courses are <strong>fully dynamic</strong> — add chapters, materials and assessments anytime after approval.</p>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold font-syne text-text-primary flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary-400" /> Course Details</h3>
        <input type="text" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Course title *"
          className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary-500 transition-all" />
        <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="Short description *"
          className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary-500 transition-all resize-none" />
        <textarea value={form.longDescription} onChange={e => set('longDescription', e.target.value)} rows={3} placeholder="Full syllabus / description (optional)"
          className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary-500 transition-all resize-none" />
        <div className="grid grid-cols-2 gap-3">
          <input type="text" value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="Duration (e.g. 12 weeks)"
            className="bg-bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary-500 transition-all" />
          <input type="text" value={form.thumbnail} onChange={e => set('thumbnail', e.target.value)} placeholder="Thumbnail URL (optional)"
            className="bg-bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary-500 transition-all" />
        </div>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold font-syne text-text-primary flex items-center gap-2"><GitBranch className="w-4 h-4 text-success-400" /> Targeting</h3>
        <div className="grid grid-cols-2 gap-3">
          <select value={form.targetBranchId} onChange={e => set('targetBranchId', e.target.value)}
            className="w-full h-11 bg-bg-elevated border border-border-subtle rounded-xl px-4 text-sm text-text-primary focus:outline-none focus:border-primary-500 appearance-none">
            <option value="" disabled hidden>Select branch *</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select value={form.targetYear} onChange={e => set('targetYear', e.target.value)}
            className="w-full h-11 bg-bg-elevated border border-border-subtle rounded-xl px-4 text-sm text-text-primary focus:outline-none focus:border-primary-500 appearance-none">
            <option value="" disabled hidden>Select year *</option>
            {YEARS.map(y => <option key={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold font-syne text-text-primary flex items-center gap-2"><BarChart2 className="w-4 h-4 text-amber-400" /> Evaluation Weightage</h3>
          <span className="text-xs text-text-muted bg-bg-elevated px-3 py-1 rounded-full border border-border-subtle">Must total 100%</span>
        </div>
        <WeightageBuilder weights={weights} onChange={setWeights} />
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" /><p className="text-sm font-medium">{error}</p>
        </div>
      )}
      <div className="flex justify-end pt-1">
        <button type="submit" disabled={submitting || totalWeight !== 100}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-sm">
          {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Send className="w-4 h-4" /> Submit for Review</>}
        </button>
      </div>
    </form>
  );
}

const StatusBadgeLarge = StatusBadge;

function InstructorOverviewTab({ user, courses }) {
  const approved = courses.filter(c => c.status === 'APPROVED').length;
  const pending = courses.filter(c => c.status === 'PENDING').length;
  const rejected = courses.filter(c => c.status === 'REJECTED').length;

  return (
    <div className="space-y-5 py-2">
      <div className="relative overflow-hidden flex items-center gap-5 p-6 bg-bg-surface border border-border-subtle rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/3 to-transparent" />
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center shadow-xl shrink-0">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <div className="relative">
          <div className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">Linked Institution</div>
          <h2 className="text-xl font-bold font-syne text-text-primary">{user.profile?.universityName || 'Your University'}</h2>
          {user.profile?.approvalStatus === 'APPROVED' && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-semibold">Verified Faculty Member</span>
            </div>
          )}
          {user.profile?.approvalStatus === 'PENDING' && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="text-xs text-amber-400 font-semibold">Pending Admin Approval</span>
            </div>
          )}
        </div>
      </div>

      {user.profile?.approvalStatus === 'PENDING' && (
        <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-300 leading-relaxed">Your instructor account is pending review. The University Admin will approve your membership shortly — then you can start building courses.</p>
        </div>
      )}

      {user.profile?.approvalStatus === 'APPROVED' && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Approved', value: approved, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
            { label: 'Pending', value: pending, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
            { label: 'Rejected', value: rejected, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
          ].map(s => (
            <div key={s.label} className={`p-4 rounded-2xl border ${s.bg} ${s.border} text-center`}>
              <div className={`text-3xl font-bold font-syne ${s.color}`}>{s.value}</div>
              <div className={`text-xs font-semibold mt-1 ${s.color} opacity-70`}>{s.label} Courses</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InstructorCoursesTab({ courses, loading, onDelete, onStudio }) {
  if (loading) return <div className="space-y-3 py-4">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-bg-surface border border-border-subtle rounded-2xl animate-pulse" />)}</div>;
  if (courses.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary-500/8 border border-primary-500/20 flex items-center justify-center mb-4"><BookOpen className="w-8 h-8 text-primary-400" /></div>
      <h3 className="text-lg font-bold font-syne text-text-primary mb-2">No courses yet</h3>
      <p className="text-text-secondary text-sm max-w-xs">Create your first university course and submit it for admin approval.</p>
    </div>
  );
  return (
    <div className="space-y-3 py-2">
      {courses.map((c, i) => (
        <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
          className="flex items-start gap-4 p-5 bg-bg-surface border border-border-subtle rounded-2xl hover:border-border-strong transition-all group">
          <div className="w-11 h-11 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0"><BookOpen className="w-5 h-5 text-primary-400" /></div>
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
              <div className="mt-2 flex items-start gap-1.5 text-xs text-red-400 bg-red-500/8 px-3 py-2 rounded-lg border border-red-400/15">
                <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" /><span>{c.rejectionReason}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {c.status === 'APPROVED' && (
              <button onClick={() => onStudio(c.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-bold rounded-lg hover:bg-primary-500/20 transition-all">
                <Sparkles className="w-3 h-3" /> Studio
              </button>
            )}
            {c.status === 'PENDING' && (
              <button onClick={() => onDelete(c.id)} className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:bg-red-500/10 hover:text-red-400 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function StudentOverviewTab({ user, allocations }) {
  const active = allocations.filter(a => !isPast(a.finalDeadline)).length;
  return (
    <div className="space-y-5 py-2">
      <div className="relative overflow-hidden flex items-center gap-5 p-6 bg-bg-surface border border-border-subtle rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/3 to-transparent" />
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-600 flex items-center justify-center shadow-xl shrink-0">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <div className="relative">
          <div className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">Enrolled Institution</div>
          <h2 className="text-xl font-bold font-syne text-text-primary">{user.profile?.universityName || 'Your University'}</h2>
          <div className="flex items-center gap-1.5 mt-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-semibold">Active Student</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl border bg-primary-500/10 border-primary-500/20 text-center">
          <div className="text-3xl font-bold font-syne text-primary-400">{allocations.length}</div>
          <div className="text-xs font-semibold mt-1 text-primary-400 opacity-70">Total Courses</div>
        </div>
        <div className="p-4 rounded-2xl border bg-amber-500/10 border-amber-500/20 text-center">
          <div className="text-3xl font-bold font-syne text-amber-400">{active}</div>
          <div className="text-xs font-semibold mt-1 text-amber-400 opacity-70">Active Deadlines</div>
        </div>
      </div>
    </div>
  );
}

function StudentCoursesTab({ allocations, loading }) {
  if (loading) return <div className="space-y-3 py-4">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-bg-surface border border-border-subtle rounded-2xl animate-pulse" />)}</div>;
  if (allocations.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary-500/8 border border-primary-500/20 flex items-center justify-center mb-4"><CalendarCheck className="w-8 h-8 text-primary-400" /></div>
      <h3 className="text-lg font-bold font-syne text-text-primary mb-2">No courses yet</h3>
      <p className="text-text-secondary text-sm max-w-xs">Your university admin hasn't allocated courses to your section yet.</p>
    </div>
  );
  return (
    <div className="space-y-3 py-2">
      {allocations.map((a, i) => {
        return (
          <motion.div key={a.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="p-5 bg-bg-surface border border-border-subtle rounded-2xl hover:border-border-strong transition-all">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <BookOpen className="w-5 h-5 text-primary-400" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-text-primary leading-snug">{a.courseTitle}</h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-text-muted flex-wrap">
                    <span>{a.instructorName}</span>
                    {a.targetBranch && <><span>·</span><span>{a.targetBranch}</span></>}
                    {a.targetYear && <><span>·</span><span>{a.targetYear}</span></>}
                  </div>
                </div>
              </div>
              <DeadlinePill deadline={a.finalDeadline} />
            </div>
            {a.sectionName && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-text-muted">
                <Users className="w-3 h-3" />
                <span>Section: <span className="text-text-secondary font-semibold">{a.sectionName}</span></span>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

function StudentOverviewTabV2({ user, allocations }) {
  const active = allocations.filter(a => !isPast(a.finalDeadline)).length;
  const completed = allocations.filter(a => a.isCompleted).length;
  const inProgress = allocations.filter(a => !a.isCompleted && (a.overallProgress || 0) > 0).length;
  const avgProgress = allocations.length > 0
    ? Math.round(allocations.reduce((sum, a) => sum + (a.overallProgress || 0), 0) / allocations.length)
    : 0;

  return (
    <div className="space-y-5 py-2">
      <div className="relative overflow-hidden flex items-center gap-5 p-6 bg-bg-surface border border-border-subtle rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/3 to-transparent" />
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-indigo-500/5 blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-600 flex items-center justify-center shadow-xl shrink-0 relative">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <div className="relative">
          <div className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">Enrolled Institution</div>
          <h2 className="text-xl font-bold font-syne text-text-primary">{user.profile?.universityName || 'Your University'}</h2>
          <div className="flex items-center gap-1.5 mt-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-semibold">Active Student</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl border bg-primary-500/10 border-primary-500/20 text-center">
          <div className="text-3xl font-bold font-syne text-primary-400">{allocations.length}</div>
          <div className="text-xs font-semibold mt-1 text-primary-400 opacity-70">Total Courses</div>
        </div>
        <div className="p-4 rounded-2xl border bg-emerald-500/10 border-emerald-500/20 text-center">
          <div className="text-3xl font-bold font-syne text-emerald-400">{completed}</div>
          <div className="text-xs font-semibold mt-1 text-emerald-400 opacity-70">Completed</div>
        </div>
        <div className="p-4 rounded-2xl border bg-indigo-500/10 border-indigo-500/20 text-center">
          <div className="text-3xl font-bold font-syne text-indigo-400">{inProgress}</div>
          <div className="text-xs font-semibold mt-1 text-indigo-400 opacity-70">In Progress</div>
        </div>
        <div className="p-4 rounded-2xl border bg-amber-500/10 border-amber-500/20 text-center">
          <div className="text-3xl font-bold font-syne text-amber-400">{avgProgress}%</div>
          <div className="text-xs font-semibold mt-1 text-amber-400 opacity-70">Avg Progress</div>
        </div>
      </div>

      {active > 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-300">{active} course{active !== 1 ? 's' : ''} with active deadlines. Stay on track!</p>
        </div>
      )}
    </div>
  );
}

function StudentCoursesTabV2({ allocations, loading, navigate }) {
  if (loading) return (
    <div className="space-y-3 py-4">
      {[1, 2, 3].map(i => <div key={i} className="h-36 bg-bg-surface border border-border-subtle rounded-2xl animate-pulse" />)}
    </div>
  );

  if (allocations.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary-500/8 border border-primary-500/20 flex items-center justify-center mb-4">
        <CalendarCheck className="w-8 h-8 text-primary-400" />
      </div>
      <h3 className="text-lg font-bold font-syne text-text-primary mb-2">No courses yet</h3>
      <p className="text-text-secondary text-sm max-w-xs">Your university admin hasn't allocated courses to your section yet.</p>
    </div>
  );

  return (
    <div className="space-y-4 py-2">
      {allocations.map((a, i) => {
        const past = isPast(a.finalDeadline);
        const days = daysUntil(a.finalDeadline);
        const urgent = days !== null && days <= 3 && days >= 0;
        const prog = Math.round(a.overallProgress || 0);
        const done = a.completedChapters || 0;
        const total = a.totalChapters || 0;
        const completed = a.isCompleted;

        return (
          <motion.div key={a.courseId || a.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="p-5 bg-bg-surface border border-border-subtle rounded-2xl hover:border-border-strong transition-all group">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="relative shrink-0">
                  {a.courseThumbnail ? (
                    <img src={a.courseThumbnail} alt={a.courseTitle} className="w-12 h-12 rounded-xl object-cover border border-border-subtle" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                  )}
                  {completed && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-text-primary leading-snug">{a.courseTitle}</h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-text-muted flex-wrap">
                    {a.instructorName && <span>{a.instructorName}</span>}
                    {a.targetBranch && <><span>·</span><span className="flex items-center gap-0.5"><GitBranch className="w-2.5 h-2.5" />{a.targetBranch}</span></>}
                    {a.targetYear && <><span>·</span><span>{a.targetYear}</span></>}
                  </div>
                </div>
              </div>

              {a.finalDeadline && (
                <span className={`flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                  past ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                  urgent ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                    'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                }`}>
                  <Calendar className="w-3 h-3" />
                  {past ? 'Expired' : `${days}d left`}
                </span>
              )}
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-text-muted">{done}/{total} chapters complete</span>
                <span className={`text-xs font-bold ${completed ? 'text-emerald-400' : prog > 0 ? 'text-primary-400' : 'text-text-muted'}`}>
                  {completed ? 'Done' : `${prog}%`}
                </span>
              </div>
              <div className="w-full h-2 bg-bg-elevated rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${completed ? 'bg-emerald-500' : 'bg-gradient-to-r from-primary-600 to-accent-500'}`}
                  style={{ width: `${prog}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 mb-4 flex-wrap">
              {[
                { key: 'weightTests', label: 'Tests', color: '#6C7FD8' },
                { key: 'weightAttendance', label: 'Attend', color: '#4ECDC4' },
                { key: 'weightLiveTests', label: 'Live', color: '#F7B731' },
                { key: 'weightProject', label: 'Project', color: '#FC5C7D' },
              ].filter((cat) => a[cat.key] > 0).map((cat) => (
                <span
                  key={cat.key}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${cat.color}18`, color: cat.color, border: `1px solid ${cat.color}30` }}
                >
                  {cat.label} {a[cat.key]}%
                </span>
              ))}
              {a.sectionName && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-bg-elevated text-text-muted border border-border-subtle">
                  Section {a.sectionName}
                </span>
              )}
            </div>

            <button
              onClick={() => navigate(`/student/university/course/${a.courseId}`)}
              className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                completed
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                  : prog > 0
                    ? 'bg-primary-500/10 border border-primary-500/20 text-primary-400 hover:bg-primary-500/20'
                    : 'bg-bg-elevated border border-border-subtle text-text-secondary hover:border-primary-500/30 hover:text-primary-400'
              }`}
            >
              {completed ? (
                <><CheckCircle2 className="w-4 h-4" /> View Course</>
              ) : prog > 0 ? (
                <><TrendingUp className="w-4 h-4" /> Continue Learning</>
              ) : (
                <><Play className="w-4 h-4" /> Start Course</>
              )}
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}

const MARK_CATS = [
  { key: 'attendanceWeighted', rawKey: 'attendanceScore', wKey: 'weightAttendance', label: 'Lecture Completion', color: '#4ECDC4' },
  { key: 'testsWeighted', rawKey: 'testsScore', wKey: 'weightTests', label: 'Chapter Tests', color: '#6C7FD8' },
  { key: 'liveTestsWeighted', rawKey: 'liveTestsScore', wKey: 'weightLiveTests', label: 'Live Tests', color: '#F7B731' },
  { key: 'projectWeighted', rawKey: 'projectScore', wKey: 'weightProject', label: 'Project', color: '#FC5C7D' },
];

const gradeColor = (grade) => ({
  S: 'text-emerald-400',
  A: 'text-emerald-400',
  B: 'text-indigo-400',
  C: 'text-amber-400',
  D: 'text-orange-400',
  F: 'text-red-400',
}[grade] || 'text-text-muted');

function CourseMarksCard({ courseId, courseTitle }) {
  const [marks, setMarks] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/marks/student/course/${courseId}`)
      .then(response => setMarks(response.data))
      .catch(() => setMarks(null))
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) {
    return <div className="h-40 bg-bg-surface border border-border-subtle rounded-2xl animate-pulse" />;
  }

  if (!marks) {
    return null;
  }

  const activeCats = MARK_CATS.filter(cat => marks[cat.wKey] > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-surface border border-border-subtle rounded-2xl overflow-hidden"
    >
      <div className="flex items-center justify-between p-5 border-b border-border-subtle">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0">
            <BarChart2 className="w-5 h-5 text-primary-400" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-text-primary truncate">{courseTitle}</h4>
            <div className="text-xs text-text-muted mt-0.5">
              {marks.completedChapters}/{marks.totalChapters} chapters done
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center shrink-0 ml-4">
          <div className={`text-3xl font-bold font-syne ${gradeColor(marks.grade)}`}>
            {marks.grade}
          </div>
          <div className="text-xs text-text-muted">Grade</div>
        </div>
      </div>

      <div className="p-5 space-y-3">
        {activeCats.map(cat => {
          const raw = marks[cat.rawKey] || 0;
          const weighted = marks[cat.key] || 0;
          const weight = marks[cat.wKey] || 0;

          return (
            <div key={cat.key}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                  <span className="text-xs text-text-secondary">{cat.label}</span>
                  <span className="text-[10px] text-text-muted bg-bg-elevated px-1.5 py-0.5 rounded-full border border-border-subtle">
                    {weight}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">{raw.toFixed(1)} raw</span>
                  <span className="text-xs font-bold" style={{ color: cat.color }}>
                    +{weighted.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${raw}%`, background: cat.color }}
                />
              </div>
            </div>
          );
        })}

        {marks.totalPenalty > 0 && (
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-xs text-red-400">Penalty Deduction</span>
            </div>
            <span className="text-xs font-bold text-red-400">-{marks.totalPenalty.toFixed(1)}</span>
          </div>
        )}

        <div className="pt-3 border-t border-border-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-text-primary">Final Score</span>
            <span className={`text-lg font-bold font-syne ${gradeColor(marks.grade)}`}>
              {marks.finalScore.toFixed(1)} / 100
            </span>
          </div>
          <div className="w-full h-2.5 bg-bg-elevated rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${marks.finalScore}%`,
                background: marks.finalScore >= 70
                  ? 'linear-gradient(90deg, #10b981, #34d399)'
                  : marks.finalScore >= 50
                    ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                    : 'linear-gradient(90deg, #ef4444, #f87171)',
              }}
            />
          </div>
          {marks.penaltyDescription && marks.totalPenalty > 0 && (
            <p className="text-[10px] text-red-400/60 mt-1.5">{marks.penaltyDescription}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function StudentMarksTab({ allocations, loading }) {
  if (loading) return (
    <div className="space-y-3 py-4">
      {[1, 2].map(i => <div key={i} className="h-40 bg-bg-surface border border-border-subtle rounded-2xl animate-pulse" />)}
    </div>
  );

  if (allocations.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary-500/8 border border-primary-500/20 flex items-center justify-center mb-4">
        <Award className="w-8 h-8 text-primary-400" />
      </div>
      <h3 className="text-lg font-bold font-syne text-text-primary mb-2">No marks yet</h3>
      <p className="text-text-secondary text-sm max-w-xs">
        Marks will appear here once your courses are allocated and you start completing chapters.
      </p>
    </div>
  );

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-start gap-3 p-4 bg-indigo-500/8 border border-indigo-500/20 rounded-xl">
        <TrendingUp className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <p className="text-xs text-indigo-300 leading-relaxed">
          Marks are calculated live from your chapter completions, quiz scores, and any late penalties.
          Live test and project scores will appear once those are graded.
        </p>
      </div>
      {allocations.map(allocation => (
        <CourseMarksCard
          key={allocation.courseId}
          courseId={allocation.courseId}
          courseTitle={allocation.courseTitle}
        />
      ))}
    </div>
  );
}

function StudentProgressTable({ courseId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState('finalScore');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    api.get(`/marks/instructor/course/${courseId}/students`)
      .then(response => setRows(response.data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [courseId]);

  const sorted = [...rows].sort((a, b) => {
    const aVal = a[sortKey] ?? 0;
    const bVal = b[sortKey] ?? 0;
    return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
  });

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir(direction => direction === 'desc' ? 'asc' : 'desc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const SortBtn = ({ k, label }) => (
    <button
      onClick={() => toggleSort(k)}
      className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${
        sortKey === k ? 'text-primary-400' : 'text-text-muted hover:text-text-secondary'
      }`}
    >
      {label} {sortKey === k ? (sortDir === 'desc' ? '↓' : '↑') : ''}
    </button>
  );

  if (loading) return (
    <div className="space-y-2">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-12 bg-bg-elevated rounded-xl animate-pulse" />
      ))}
    </div>
  );

  if (rows.length === 0) return (
    <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border-subtle rounded-2xl">
      <Users className="w-10 h-10 text-text-muted mb-3 opacity-30" />
      <p className="text-text-secondary text-sm font-bold mb-1">No students enrolled yet</p>
      <p className="text-text-muted text-xs">Students are auto-enrolled when the course is allocated to a section.</p>
    </div>
  );

  const avg = rows.length ? (rows.reduce((sum, row) => sum + (row.finalScore || 0), 0) / rows.length).toFixed(1) : 0;
  const passing = rows.filter(row => (row.finalScore || 0) >= 50).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Students', val: rows.length, color: 'text-primary-400', bg: 'bg-primary-500/10 border-primary-500/20' },
          { label: 'Class Average', val: `${avg}%`, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
          { label: 'Passing', val: `${passing}/${rows.length}`, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        ].map(stat => (
          <div key={stat.label} className={`p-3 rounded-xl border text-center ${stat.bg}`}>
            <div className={`text-xl font-bold font-syne ${stat.color}`}>{stat.val}</div>
            <div className={`text-[10px] font-semibold mt-0.5 ${stat.color} opacity-70`}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 px-1">
        <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Sort by:</span>
        <SortBtn k="finalScore" label="Final Score" />
        <SortBtn k="attendanceScore" label="Attendance" />
        <SortBtn k="testsScore" label="Tests" />
        <SortBtn k="overallProgress" label="Progress" />
      </div>

      <div className="space-y-2">
        {sorted.map((row, index) => {
          const grade = row.grade || 'F';
          const gc = gradeColor(grade);

          return (
            <motion.div
              key={row.studentId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="flex items-center gap-4 p-4 bg-bg-surface border border-border-subtle rounded-xl hover:border-border-strong transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {row.studentName?.charAt(0)?.toUpperCase() || '?'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-text-primary truncate">{row.studentName}</div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-text-muted">
                  {row.rollNumber && <span>{row.rollNumber}</span>}
                  {row.sectionName && <><span>·</span><span>Sec {row.sectionName}</span></>}
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-3">
                {[
                  { label: 'Att', val: row.attendanceScore, color: '#4ECDC4' },
                  { label: 'Test', val: row.testsScore, color: '#6C7FD8' },
                ].map(cat => (
                  <div key={cat.label} className="text-center w-10">
                    <div className="text-[10px] font-bold" style={{ color: cat.color }}>{cat.val?.toFixed(0) || 0}%</div>
                    <div className="text-[9px] text-text-muted">{cat.label}</div>
                  </div>
                ))}
              </div>

              <div className="hidden md:block w-24">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-text-muted">{row.completedChapters}/{row.totalChapters}</span>
                  <span className="text-[10px] font-bold text-text-secondary">{Math.round(row.overallProgress || 0)}%</span>
                </div>
                <div className="w-full h-1 bg-bg-elevated rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-600 to-accent-500"
                    style={{ width: `${row.overallProgress || 0}%` }}
                  />
                </div>
              </div>

              {row.totalPenalty > 0 && (
                <div className="text-xs font-bold text-red-400 shrink-0">
                  -{row.totalPenalty.toFixed(1)}
                </div>
              )}

              <div className="text-right shrink-0 w-16">
                <div className={`text-base font-bold font-syne ${gc}`}>{row.finalScore?.toFixed(1)}</div>
                <div className={`text-xs font-bold ${gc} opacity-70`}>{grade}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function UniversitySpace() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isStudent = user?.role === 'student';
  const hasJoined = !!user?.universityId || !!user?.profile?.universityName;
  const isApproved = !isStudent ? user?.profile?.approvalStatus === 'APPROVED' : true;

  const [activeTab, setActiveTab] = useState('overview');
  const [studioTargetId, setStudioTargetId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!hasJoined) return;
    setLoading(true);
    try {
      if (!isStudent) {
        const [coursesRes, branchesRes] = await Promise.all([
          api.get('/uni-courses/my-courses').catch(() => api.get('/uni-courses/my').catch(() => ({ data: [] }))),
          api.get('/uni-courses/branches').catch(() => api.get('/uni-admin/context/branches').catch(() => ({ data: [] }))),
        ]);
        setCourses((coursesRes.data || []).map(normalizeCourse));
        setBranches(branchesRes.data || []);
      } else {
        const res = await api.get('/uni-courses/student/my-enrollments').catch(() => ({ data: [] }));
        setAllocations(res.data || []);
      }
    } finally { setLoading(false); }
  }, [hasJoined, isStudent]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/uni-courses/${deleteTarget}`);
      setCourses(cs => cs.filter(c => c.id !== deleteTarget));
    } catch {} finally { setDeleting(false); setDeleteTarget(null); }
  };

  const Layout = isStudent ? StudentLayout : InstructorLayout;

  if (!hasJoined) return <Layout><OnboardingFlow isStudent={isStudent} /></Layout>;

  const studioCourse = studioTargetId ? courses.find(c => c.id === studioTargetId) : null;

  const instructorTabs = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'courses', label: 'My Courses', icon: BookOpen },
    ...(isApproved ? [{ id: 'create', label: 'Create Course', icon: PlusCircle }] : []),
    ...(studioTargetId ? [{ id: 'studio', label: studioCourse?.title ? `Studio · ${studioCourse.title.slice(0, 20)}…` : 'Studio', icon: Sparkles }] : []),
  ];
  const studentTabs = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'courses', label: 'My Courses', icon: BookOpen },
    { id: 'marks', label: 'My Marks', icon: Award },
  ];
  const tabs = isStudent ? studentTabs : instructorTabs;

  const renderContent = () => {
    if (!isStudent) {
      switch (activeTab) {
        case 'overview': return <InstructorOverviewTab user={user} courses={courses} />;
        case 'courses': return <InstructorCoursesTab courses={courses} loading={loading} onDelete={id => setDeleteTarget(id)} onStudio={id => { setStudioTargetId(id); setActiveTab('studio'); }} />;
        case 'create': return <CreateCourseTab branches={branches} onSuccess={() => { fetchData(); setActiveTab('courses'); }} />;
        case 'studio': return <StudioTab courseId={studioTargetId} course={studioCourse} onCourseUpdate={(upd) => setCourses(cs => cs.map(c => c.id === upd.id ? upd : c))} />;
        default: return null;
      }
    } else {
      switch (activeTab) {
        case 'overview': return <StudentOverviewTabV2 user={user} allocations={allocations} />;
        case 'courses': return <StudentCoursesTabV2 allocations={allocations} loading={loading} navigate={navigate} />;
        case 'marks': return <StudentMarksTab allocations={allocations} loading={loading} />;
        default: return null;
      }
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto pb-24">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
              <span className="text-xs font-bold text-primary-400 uppercase tracking-widest">University Space</span>
            </div>
            <h1 className="text-3xl font-syne font-extrabold text-text-primary tracking-tight">
              {user.profile?.universityName || 'Your University'}
            </h1>
          </div>
          {!isStudent && isApproved && (
            <button onClick={() => setActiveTab('create')}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-bold rounded-xl hover:bg-primary-500/20 transition-all">
              <PlusCircle className="w-4 h-4" /> New Course
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 mb-8 border-b border-border-subtle overflow-x-auto pb-px scrollbar-hide">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all shrink-0 border-b-2 -mb-px whitespace-nowrap ${
                  isActive
                    ? 'text-primary-400 border-primary-500 bg-primary-500/5'
                    : 'text-text-muted border-transparent hover:text-text-secondary hover:bg-bg-surface/60'
                }`}>
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.id === 'studio' && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}>
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {deleteTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setDeleteTarget(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-bg-elevated border border-border-default rounded-2xl p-8 max-w-sm w-full shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-400/20 flex items-center justify-center mb-5">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-bold font-syne text-text-primary mb-2">Delete Course?</h3>
              <p className="text-text-secondary text-sm mb-6 leading-relaxed">This will permanently delete the pending course. This action cannot be undone.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteTarget(null)} className="px-5 py-2.5 bg-bg-surface border border-border-subtle text-text-secondary rounded-xl text-sm font-medium hover:border-border-strong transition-all">Cancel</button>
                <button onClick={handleDelete} disabled={deleting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 border border-red-400/20 text-red-400 rounded-xl text-sm font-bold hover:bg-red-500/20 transition-all disabled:opacity-50">
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
