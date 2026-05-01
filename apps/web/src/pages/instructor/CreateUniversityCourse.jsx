import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import InstructorLayout from '../../components/layout/v2/InstructorLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { aiApi } from '../../api/aiApi';
import Modal from '../../components/ui/Modal';
import {
  BookOpen, GitBranch, BarChart2, CheckCircle, AlertCircle,
  Loader2, ArrowLeft, ChevronDown, Info, Sparkles, Send
} from 'lucide-react';

// ─── Shared Input Components ────────────────────────────────────────────────

function InputGroup({ label, required, children, helperText, error }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-semibold text-text-primary">
        {label} {required && <span className="text-error-400">*</span>}
      </label>
      {children}
      {helperText && !error && (
        <p className="text-xs text-text-muted mt-0.5">{helperText}</p>
      )}
      {error && <p className="text-xs text-error-400 mt-0.5">{error}</p>}
    </div>
  );
}

function SelectInput({ value, onChange, children, placeholder }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full appearance-none bg-bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-text-primary outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all cursor-pointer font-medium"
      >
        {placeholder && <option value="" disabled hidden>{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
    </div>
  );
}

// ─── Weightage Slider ────────────────────────────────────────────────────────

const WEIGHT_CATEGORIES = [
  { key: 'weightTests',      label: 'Chapter Tests',      color: '#6C7FD8', desc: 'Pre-built quiz scores per chapter' },
  { key: 'weightAttendance', label: 'Lecture Completion',  color: '#4ECDC4', desc: 'Progress through video & reading content' },
  { key: 'weightLiveTests',  label: 'Live Tests',          color: '#F7B731', desc: 'Synchronised real-time assessments' },
  { key: 'weightProject',    label: 'Project',             color: '#FC5C7D', desc: 'Team project evaluation' },
];

function WeightageBuilder({ weights, onChange }) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const remaining = 100 - total;
  const isValid = total === 100;

  const handleChange = (key, val) => {
    const parsed = Math.max(0, Math.min(100, Number(val)));
    onChange({ ...weights, [key]: parsed });
  };

  return (
    <div className="space-y-4">
      {WEIGHT_CATEGORIES.map(cat => (
        <div key={cat.key} className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-text-primary">{cat.label}</span>
              <p className="text-xs text-text-muted">{cat.desc}</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={weights[cat.key]}
                onChange={e => handleChange(cat.key, e.target.value)}
                className="w-16 text-center bg-bg-elevated border border-border-subtle rounded-lg px-2 py-1.5 text-sm font-bold text-text-primary outline-none focus:border-primary-500 transition-all"
              />
              <span className="text-sm text-text-muted w-4">%</span>
            </div>
          </div>
          <div className="w-full h-2 bg-bg-elevated rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: cat.color }}
              animate={{ width: `${weights[cat.key]}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>
        </div>
      ))}

      {/* Total bar */}
      <div className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
        isValid
          ? 'bg-emerald-500/10 border-emerald-500/20'
          : remaining > 0
          ? 'bg-amber-500/10 border-amber-500/20'
          : 'bg-error-500/10 border-error-400/20'
      }`}>
        <div className="flex items-center gap-2">
          {isValid
            ? <CheckCircle className="w-4 h-4 text-emerald-400" />
            : <AlertCircle className="w-4 h-4 text-amber-400" />
          }
          <span className={`text-sm font-semibold ${isValid ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isValid ? 'Weightages are balanced' : remaining > 0 ? `${remaining}% remaining to allocate` : `${Math.abs(remaining)}% over limit`}
          </span>
        </div>
        <span className={`text-lg font-bold font-mono ${isValid ? 'text-emerald-400' : 'text-amber-400'}`}>
          {total} / 100
        </span>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

const YEARS = ['First Year', 'Second Year', 'Third Year', 'Fourth Year'];

export default function CreateUniversityCourse() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    longDescription: '',
    thumbnail: '',
    duration: '',
    targetBranchId: '',
    targetYear: '',
  });

  const [weights, setWeights] = useState({
    weightTests: 30,
    weightAttendance: 10,
    weightLiveTests: 20,
    weightProject: 40,
  });

  // Fetch branches from the instructor's own university
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await api.get('/uni-courses/branches');
        setBranches(res.data || []);
      } catch (err) {
        // If endpoint doesn't exist yet, try context endpoint
        try {
          const res2 = await api.get('/uni-admin/context/branches');
          setBranches(res2.data || []);
        } catch {
          setBranches([]);
        }
      } finally {
        setLoadingBranches(false);
      }
    };
    fetchBranches();
  }, []);

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const isWeightValid = totalWeight === 100;

  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const handleGenerateCourse = async () => {
    if (!aiPrompt) return;
    setIsAiGenerating(true);
    try {
       const result = await aiApi.generateCourse(aiPrompt, "University level course");
       setForm(prev => ({
           ...prev,
           title: result.title || prev.title,
           description: result.description || prev.description,
           longDescription: result.description || prev.longDescription,
       }));
       if (result.suggestedWeightages) {
           setWeights({
               weightTests: result.suggestedWeightages.tests || 30,
               weightAttendance: result.suggestedWeightages.attendance || 10,
               weightLiveTests: result.suggestedWeightages.liveTests || 20,
               weightProject: result.suggestedWeightages.project || 40,
           });
       }
       setShowAiModal(false);
       setAiPrompt('');
    } catch (err) {
       console.error(err);
       setError('Failed to generate course with AI.');
    } finally {
       setIsAiGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) { setError('Course title is required.'); return; }
    if (!form.description.trim()) { setError('Description is required.'); return; }
    if (!form.targetBranchId) { setError('Please select a target branch.'); return; }
    if (!form.targetYear) { setError('Please select a target year.'); return; }
    if (!isWeightValid) { setError('Evaluation weightages must sum to exactly 100%.'); return; }

    setSubmitting(true);
    try {
      await api.post('/uni-courses', {
        ...form,
        ...weights,
      });
      setSuccess(true);
      setTimeout(() => navigate('/instructor/university'), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit course. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  if (success) {
    return (
      <InstructorLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center"
          >
            <CheckCircle className="w-12 h-12 text-emerald-400" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold font-syne text-text-primary mb-2">Course Submitted!</h2>
            <p className="text-text-secondary">Your course is now in the pool awaiting University Admin approval.</p>
          </motion.div>
        </div>
      </InstructorLayout>
    );
  }

  return (
    <InstructorLayout>
      <div className="max-w-3xl mx-auto w-full pb-20">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-text-muted hover:text-text-primary text-sm font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                </div>
                <h1 className="text-3xl font-syne font-bold text-text-primary">Create University Course</h1>
              </div>
              <p className="text-text-secondary ml-13">
                This course will be submitted to your University Admin for review before it can be allocated to sections.
              </p>
            </div>
            <button
              onClick={() => setShowAiModal(true)}
              className="flex items-center gap-2 rounded-lg bg-primary-500/10 px-4 py-2 text-primary-400 font-semibold border border-primary-500/20 hover:bg-primary-500 hover:text-white transition-all shadow-glow"
            >
              <Sparkles className="w-4 h-4" />
              AI Assistant
            </button>
          </div>
        </motion.div>

        {/* Info banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-start gap-3 p-4 bg-primary-500/8 border border-primary-500/20 rounded-xl mb-8"
        >
          <Info className="w-5 h-5 text-primary-400 shrink-0 mt-0.5" />
          <p className="text-sm text-primary-300 leading-relaxed">
            University courses are <strong>fully dynamic</strong> — unlike public courses, you can add chapters,
            upload materials, and insert new assessments at any point during the course lifecycle after approval.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">

            {/* ── Section 1: Course Details ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-bg-surface border border-border-subtle rounded-2xl p-6 md:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-5 h-5 text-primary-400" />
                <h2 className="text-lg font-bold font-syne text-text-primary">Course Details</h2>
              </div>

              <div className="space-y-5">
                <InputGroup label="Course Title" required>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => set('title', e.target.value)}
                    placeholder="e.g. Data Structures & Algorithms"
                    className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-medium"
                  />
                </InputGroup>

                <InputGroup label="Short Description" required helperText="Shown on course cards and allocation board">
                  <textarea
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    rows={2}
                    placeholder="Brief overview of what this course covers..."
                    className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all resize-none"
                  />
                </InputGroup>

                <InputGroup label="Full Description" helperText="Detailed syllabus, prerequisites, and learning outcomes">
                  <textarea
                    value={form.longDescription}
                    onChange={e => set('longDescription', e.target.value)}
                    rows={5}
                    placeholder="What students will learn, prerequisites, topics covered..."
                    className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                  />
                </InputGroup>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputGroup label="Duration" helperText="e.g. 45 hours, 12 weeks">
                    <input
                      type="text"
                      value={form.duration}
                      onChange={e => set('duration', e.target.value)}
                      placeholder="e.g. 12 weeks"
                      className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                    />
                  </InputGroup>

                  <InputGroup label="Thumbnail URL" helperText="Optional course cover image">
                    <input
                      type="text"
                      value={form.thumbnail}
                      onChange={e => set('thumbnail', e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                    />
                  </InputGroup>
                </div>
              </div>
            </motion.div>

            {/* ── Section 2: Targeting ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-bg-surface border border-border-subtle rounded-2xl p-6 md:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <GitBranch className="w-5 h-5 text-success-400" />
                <h2 className="text-lg font-bold font-syne text-text-primary">Targeting</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputGroup label="Target Branch" required helperText="Which department is this course for?">
                  {loadingBranches ? (
                    <div className="h-12 bg-bg-elevated rounded-xl flex items-center px-4 gap-2 text-text-muted text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading branches...
                    </div>
                  ) : (
                    <SelectInput
                      value={form.targetBranchId}
                      onChange={e => set('targetBranchId', e.target.value)}
                      placeholder="Select branch"
                    >
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </SelectInput>
                  )}
                </InputGroup>

                <InputGroup label="Target Year" required helperText="Which year of students?">
                  <SelectInput
                    value={form.targetYear}
                    onChange={e => set('targetYear', e.target.value)}
                    placeholder="Select year"
                  >
                    {YEARS.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </SelectInput>
                </InputGroup>
              </div>
            </motion.div>

            {/* ── Section 3: Evaluation Weightage ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-bg-surface border border-border-subtle rounded-2xl p-6 md:p-8"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <BarChart2 className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-bold font-syne text-text-primary">Evaluation Weightage</h2>
                </div>
                <span className="text-xs text-text-muted bg-bg-elevated px-3 py-1 rounded-full border border-border-subtle">
                  Must total 100%
                </span>
              </div>
              <p className="text-sm text-text-muted mb-6 ml-8">
                Define how each evaluation component contributes to the final internal marks.
              </p>
              <WeightageBuilder weights={weights} onChange={setWeights} />
            </motion.div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 p-4 bg-error-500/10 border border-error-400/20 text-error-400 rounded-xl"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-end gap-4 pt-2"
            >
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 text-text-secondary bg-bg-elevated hover:bg-bg-elevated-hover border border-border-subtle hover:border-border-strong rounded-xl font-medium transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !isWeightValid}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-600 to-accent-500 hover:from-primary-500 hover:to-accent-400 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                {submitting
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
                  : <><Send className="w-5 h-5" /> Submit for Review</>
                }
              </button>
            </motion.div>

          </div>
        </form>
      </div>

      <Modal open={showAiModal} onClose={() => !isAiGenerating && setShowAiModal(false)} title="AI Course Generator">
        <div className="space-y-4">
          <p className="text-text-secondary text-sm">
            Describe the university course you want to teach. The AI will generate a title, description, and suggested weightages.
          </p>
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            disabled={isAiGenerating}
            rows={4}
            className="glass-input w-full rounded-lg px-4 py-3 text-text-primary outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all resize-none"
            placeholder="e.g. A comprehensive course on React 18 for 3rd-year students, including project-based learning."
          />
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowAiModal(false)}
              disabled={isAiGenerating}
              className="px-4 py-2 text-sm font-semibold text-text-muted hover:text-text-primary transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateCourse}
              disabled={!aiPrompt.trim() || isAiGenerating}
              className="flex items-center gap-2 rounded-lg bg-gradient-primary px-5 py-2 text-sm font-semibold text-white shadow-glow transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAiGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isAiGenerating ? 'Generating...' : 'Generate Content'}
            </button>
          </div>
        </div>
      </Modal>

    </InstructorLayout>
  );
}
