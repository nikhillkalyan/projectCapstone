import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  HelpCircle,
  Loader2,
  Play,
  Plus,
  Square,
  Trash2,
  Trophy,
  X,
  Zap,
  Sparkles,
} from 'lucide-react';
import api from '../../lib/api';
import { aiApi } from '../../api/aiApi';
import { useApp } from '../../context/AppContext';
import Modal from '../../components/ui/Modal';

const formatDateTime = (iso) => (
  iso ? new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) : '-'
);

const formatRelative = (iso) => (
  iso ? new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  }) : '-'
);

const getStatus = (test) => {
  if (test.isLive && !test.isClosed) return 'LIVE';
  if (test.isClosed) return 'CLOSED';
  return 'DRAFT';
};

function exportSubmissionsCSV(test, submissions) {
  const headers = ['Student Name', 'Roll Number', 'Section', 'Score (%)', 'Passed', 'Submitted At'];
  const rows = submissions.map((submission) => [
    submission.studentName || '',
    submission.rollNumber || '',
    submission.sectionName || '',
    submission.score != null ? submission.score.toFixed(1) : '0',
    submission.passed ? 'Yes' : 'No',
    submission.submittedAt ? new Date(submission.submittedAt).toLocaleString('en-IN') : '',
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${test.title.replace(/\s+/g, '_')}_submissions.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function ScoreDistributionChart({ submissions }) {
  const buckets = [
    { label: '0-20', min: 0, max: 20, color: '#ef4444' },
    { label: '21-40', min: 21, max: 40, color: '#f97316' },
    { label: '41-60', min: 41, max: 60, color: '#f59e0b' },
    { label: '61-80', min: 61, max: 80, color: '#6C7FD8' },
    { label: '81-100', min: 81, max: 100, color: '#10b981' },
  ];

  const counts = buckets.map((bucket) => ({
    ...bucket,
    count: submissions.filter((submission) => {
      const score = submission.score ?? 0;
      return score >= bucket.min && score <= bucket.max;
    }).length,
  }));

  const maxCount = Math.max(...counts.map((bucket) => bucket.count), 1);
  const passed = submissions.filter((submission) => submission.passed).length;
  const passRate = submissions.length > 0 ? Math.round((passed / submissions.length) * 100) : 0;

  return (
    <div className="p-4 bg-bg-elevated/40 border border-border-subtle rounded-xl space-y-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Pass Rate</span>
        <span className="text-xs font-bold text-emerald-400">{passed}/{submissions.length} passed</span>
      </div>
      <div className="w-full h-2 bg-bg-elevated rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${passRate}%`,
            background: passRate >= 70
              ? 'linear-gradient(90deg, #10b981, #34d399)'
              : passRate >= 40
                ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                : 'linear-gradient(90deg, #ef4444, #f87171)',
          }}
        />
      </div>

      <div className="mt-3">
        <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-3">
          Score Distribution
        </span>
        <div className="flex items-end gap-2 h-20">
          {counts.map((bucket) => (
            <div key={bucket.label} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] font-bold" style={{ color: bucket.color }}>
                {bucket.count > 0 ? bucket.count : ''}
              </span>
              <div
                className="w-full rounded-t-md transition-all duration-700 relative group"
                style={{
                  height: `${Math.round((bucket.count / maxCount) * 56) + (bucket.count > 0 ? 4 : 0)}px`,
                  minHeight: bucket.count > 0 ? '8px' : '2px',
                  background: bucket.count > 0 ? bucket.color : 'rgba(255,255,255,0.05)',
                  opacity: bucket.count > 0 ? 1 : 0.3,
                }}
              />
              <span className="text-[9px] text-text-muted">{bucket.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ test }) {
  const status = getStatus(test);
  const classes = {
    LIVE: 'bg-red-500/15 border-red-500/30 text-red-400',
    CLOSED: 'bg-bg-elevated border-border-subtle text-text-muted',
    DRAFT: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${classes[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === 'LIVE' ? 'bg-red-400' : status === 'DRAFT' ? 'bg-amber-400' : 'bg-text-muted/40'
      }`}
      />
      {status}
    </span>
  );
}

function QuestionBuilder({ questions, onChange }) {
  const addQuestion = () => {
    onChange([...questions, { questionText: '', options: ['', '', '', ''], correctOptionIndex: 0 }]);
  };
  const removeQuestion = (questionIndex) => onChange(questions.filter((_, index) => index !== questionIndex));
  const updateQuestion = (questionIndex, field, value) => (
    onChange(questions.map((question, index) => (index === questionIndex ? { ...question, [field]: value } : question)))
  );
  const updateOption = (questionIndex, optionIndex, value) => (
    onChange(questions.map((question, index) => (
      index === questionIndex
        ? { ...question, options: question.options.map((option, idx) => (idx === optionIndex ? value : option)) }
        : question
    )))
  );

  return (
    <div className="space-y-4">
      {questions.map((question, questionIndex) => (
        <div key={questionIndex} className="p-4 bg-bg-elevated/60 border border-border-subtle rounded-xl relative group">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Q{questionIndex + 1}</span>
            {questions.length > 1 && (
              <button
                onClick={() => removeQuestion(questionIndex)}
                className="ml-auto w-6 h-6 rounded-lg text-text-muted hover:bg-red-500/10 hover:text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <input
            type="text"
            value={question.questionText}
            onChange={(event) => updateQuestion(questionIndex, 'questionText', event.target.value)}
            placeholder="Question text..."
            className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-amber-500/50 transition-all mb-3"
          />
          <div className="grid grid-cols-2 gap-2">
            {question.options.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center gap-2">
                <button
                  onClick={() => updateQuestion(questionIndex, 'correctOptionIndex', optionIndex)}
                  className={`w-5 h-5 rounded-full flex-shrink-0 border-2 transition-all flex items-center justify-center ${
                    question.correctOptionIndex === optionIndex
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-border-subtle hover:border-emerald-500/40'
                  }`}
                >
                  {question.correctOptionIndex === optionIndex && <div className="w-2 h-2 bg-white rounded-full" />}
                </button>
                <input
                  type="text"
                  value={option}
                  onChange={(event) => updateOption(questionIndex, optionIndex, event.target.value)}
                  placeholder={`Option ${optionIndex + 1}`}
                  className={`flex-1 bg-bg-elevated border rounded-lg px-2.5 py-1.5 text-xs text-text-primary placeholder:text-text-muted outline-none transition-all ${
                    question.correctOptionIndex === optionIndex
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-border-subtle focus:border-primary-500/50'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      <button
        onClick={addQuestion}
        className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 font-semibold transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> Add Question
      </button>
    </div>
  );
}

function CreateLiveTestForm({ courseId, onCreated, onCancel }) {
  const [form, setForm] = useState({ title: '', durationMinutes: 30, passingScore: 70, scheduledAt: '' });
  const [questions, setQuestions] = useState([{ questionText: '', options: ['', '', '', ''], correctOptionIndex: 0 }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const scheduleInputRef = useRef(null);
  const updateField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const handleGenerateQuiz = async () => {
    if (!aiPrompt) return;
    setIsAiGenerating(true);
    try {
      const result = await aiApi.generateQuiz(aiPrompt, form.title || "Live Test Topic");
      if (result && Array.isArray(result)) {
         setQuestions(result.map(q => ({
            questionText: q.questionText || '',
            options: q.options || ['', '', '', ''],
            correctOptionIndex: q.correctOptionIndex || 0
         })));
      }
      setShowAiModal(false);
      setAiPrompt('');
    } catch (err) {
      console.error(err);
      setError('Failed to generate quiz with AI.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleCreate = async () => {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    const invalid = questions.some((question) => !question.questionText.trim() || question.options.some((option) => !option.trim()));
    if (invalid) { setError('Fill in all questions and options.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const response = await api.post(`/live-tests/course/${courseId}`, {
        title: form.title,
        durationMinutes: Number(form.durationMinutes),
        passingScore: Number(form.passingScore),
        scheduledAt: form.scheduledAt || null,
        questions,
      });
      onCreated(response.data);
    } catch (errorResponse) {
      setError(errorResponse.response?.data?.message || 'Failed to create live test.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="border border-amber-500/20 bg-amber-500/3 rounded-2xl p-5 space-y-5"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-amber-400 flex items-center gap-2">
          <Zap className="w-4 h-4" /> New Live Test
        </span>
        <button onClick={onCancel} className="text-text-muted hover:text-text-primary"><X className="w-4 h-4" /></button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">Test Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(event) => updateField('title', event.target.value)}
            placeholder="e.g. Mid-Semester Live Quiz"
            className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-amber-500/50 transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">Duration (mins)</label>
          <input
            type="number"
            min="5"
            max="180"
            value={form.durationMinutes}
            onChange={(event) => updateField('durationMinutes', event.target.value)}
            className="w-full h-10 bg-bg-elevated border border-border-subtle rounded-xl px-3 text-sm text-text-primary outline-none focus:border-amber-500/50 transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">Passing Score (%)</label>
          <input
            type="number"
            min="1"
            max="100"
            value={form.passingScore}
            onChange={(event) => updateField('passingScore', event.target.value)}
            className="w-full h-10 bg-bg-elevated border border-border-subtle rounded-xl px-3 text-sm text-text-primary outline-none focus:border-amber-500/50 transition-all"
          />
        </div>
      </div>

      <div className="p-4 bg-amber-500/5 border border-amber-500/15 rounded-xl space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Schedule Launch</span>
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
          <div>
            <label className="text-xs font-semibold text-text-muted block mb-1.5">Date & Time</label>
            <input
              ref={scheduleInputRef}
              type="datetime-local"
              min={new Date().toISOString().slice(0, 16)}
              value={form.scheduledAt}
              onChange={(event) => updateField('scheduledAt', event.target.value)}
              className="w-full h-10 bg-bg-elevated border border-amber-500/20 rounded-xl px-3 text-xs text-text-primary focus:outline-none focus:border-amber-500/50 transition-all"
            />
          </div>
          <button
            type="button"
            onClick={() => scheduleInputRef.current?.showPicker?.() || scheduleInputRef.current?.focus()}
            className="h-10 px-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl hover:bg-amber-500/20 transition-all flex items-center gap-2 text-xs font-bold"
          >
            <Calendar className="w-3.5 h-3.5" /> Pick
          </button>
        </div>
        <p className="text-xs text-text-muted">
          {form.scheduledAt
            ? `Scheduled for ${formatDateTime(form.scheduledAt)}. Leave blank to launch manually.`
            : 'Leave blank to create and launch later manually.'}
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-text-primary">Questions</span>
            <span className="text-xs text-text-muted">({questions.length})</span>
          </div>
          <button
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold rounded-xl hover:bg-amber-500/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" /> Auto-Generate
          </button>
        </div>
        <QuestionBuilder questions={questions} onChange={setQuestions} />
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex justify-end gap-2 pt-1">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-xs text-text-muted bg-bg-elevated border border-border-subtle rounded-xl hover:border-border-strong transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleCreate}
          disabled={submitting}
          className="flex items-center gap-1.5 px-5 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold rounded-xl hover:bg-amber-500/20 transition-all disabled:opacity-50"
        >
          {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          Create Test
        </button>
      </div>

      <Modal open={showAiModal} onClose={() => !isAiGenerating && setShowAiModal(false)} title="AI Quiz Generator">
        <div className="space-y-4">
          <p className="text-text-secondary text-sm">
            Provide a topic or paste chapter content. The AI will generate multiple choice questions for you.
          </p>
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            disabled={isAiGenerating}
            rows={4}
            className="glass-input w-full rounded-lg px-4 py-3 text-text-primary outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all resize-none"
            placeholder="e.g. Generate 5 questions about React Hooks..."
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
              onClick={handleGenerateQuiz}
              disabled={!aiPrompt.trim() || isAiGenerating}
              className="flex items-center gap-2 rounded-lg bg-amber-500/20 px-5 py-2 text-sm font-semibold text-amber-400 shadow-glow transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-amber-500/30 hover:bg-amber-500 hover:text-bg-base"
            >
              {isAiGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isAiGenerating ? 'Generating...' : 'Generate Quiz'}
            </button>
          </div>
        </div>
      </Modal>

    </motion.div>
  );
}

function LiveTestCard({ test, onLaunched, onClosed, onDeleted }) {
  const [expanded, setExpanded] = useState(false);
  const [stats, setStats] = useState(null);
  const [launching, setLaunching] = useState(false);
  const [closing, setClosing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const status = getStatus(test);
  const { showNotification } = useApp();

  const loadStats = async () => {
    if (!expanded && (status === 'CLOSED' || status === 'LIVE')) {
      try {
        const response = await api.get(`/live-tests/${test.id}/stats`);
        setStats(response.data);
      } catch (error) {
        console.warn('Failed to load stats:', error);
      }
    }
  };

  const handleLaunch = async () => {
    setLaunching(true);
    try {
      const response = await api.post(`/live-tests/${test.id}/launch`);
      onLaunched(response.data);
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to launch.', 'error');
    } finally {
      setLaunching(false);
    }
  };

  const handleClose = async () => {
    setClosing(true);
    try {
      const response = await api.post(`/live-tests/${test.id}/close`);
      onClosed(response.data);
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to close.', 'error');
    } finally {
      setClosing(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/live-tests/${test.id}`);
      onDeleted(test.id);
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to delete.', 'error');
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const submissionCount = stats?.submissionCount ?? test.submissionCount;
  const averageScore = stats?.averageScore ?? test.averageScore;
  const submissions = stats?.submissions ?? test.submissions ?? [];

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`border rounded-2xl overflow-hidden bg-bg-surface transition-all ${
        status === 'LIVE'
          ? 'border-red-500/30 shadow-lg shadow-red-500/5'
          : 'border-border-subtle hover:border-border-strong'
      }`}
    >
      {status === 'LIVE' && (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border-b border-red-500/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Live Now</span>
        </div>
      )}

      <div
        className="flex items-center gap-3 p-4 cursor-pointer"
        onClick={() => { setExpanded((current) => !current); loadStats(); }}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          status === 'LIVE' ? 'bg-red-500/15' : status === 'CLOSED' ? 'bg-bg-elevated' : 'bg-amber-500/10'
        }`}
        >
          <Zap className={`w-5 h-5 ${
            status === 'LIVE' ? 'text-red-400' : status === 'CLOSED' ? 'text-text-muted' : 'text-amber-400'
          }`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-text-primary truncate">{test.title}</span>
            <StatusPill test={test} />
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-text-muted flex-wrap">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{test.durationMinutes} min</span>
            <span className="flex items-center gap-1"><HelpCircle className="w-3 h-3" />{test.questions?.length || 0} questions</span>
            {test.scheduledAt && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />Scheduled {formatDateTime(test.scheduledAt)}
              </span>
            )}
            {test.startTime && <span>Started {formatDateTime(test.startTime)}</span>}
            {status === 'CLOSED' && submissionCount != null && (
              <span className="text-primary-400 font-semibold">{submissionCount} submissions</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0" onClick={(event) => event.stopPropagation()}>
          {status === 'DRAFT' && (
            <>
              <button
                onClick={handleLaunch}
                disabled={launching}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl hover:bg-emerald-500/20 transition-all disabled:opacity-50"
              >
                {launching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                Launch
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-text-muted hover:bg-red-500/10 hover:text-red-400 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          {status === 'LIVE' && (
            <button
              onClick={handleClose}
              disabled={closing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl hover:bg-red-500/20 transition-all disabled:opacity-50"
            >
              {closing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Square className="w-3.5 h-3.5" />}
              Close Test
            </button>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border-subtle/50"
          >
            <div className="p-4 space-y-5">
              {(status === 'CLOSED' || status === 'LIVE') && (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Submissions', value: submissionCount ?? '-', color: 'text-primary-400', bg: 'bg-primary-500/10 border-primary-500/20' },
                    { label: 'Avg Score', value: averageScore != null ? `${averageScore.toFixed(1)}%` : '-', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                    { label: 'Pass Score', value: `${test.passingScore}%`, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                  ].map((stat) => (
                    <div key={stat.label} className={`p-3 rounded-xl border text-center ${stat.bg}`}>
                      <div className={`text-lg font-bold font-syne ${stat.color}`}>{stat.value}</div>
                      <div className={`text-[10px] font-semibold mt-0.5 ${stat.color} opacity-70`}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {status === 'CLOSED' && submissions.length > 0 && (
                <ScoreDistributionChart submissions={submissions} />
              )}

              {(status === 'CLOSED' || status === 'LIVE') && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-primary-400" />
                      <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                        Student Attempts ({submissions.length})
                      </span>
                    </div>
                    {status === 'CLOSED' && submissions.length > 0 && (
                      <button
                        onClick={() => exportSubmissionsCSV(test, submissions)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-bold rounded-xl hover:bg-primary-500/20 transition-all"
                      >
                        <Download className="w-3.5 h-3.5" /> Export CSV
                      </button>
                    )}
                  </div>

                  {submissions.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-border-subtle text-center">
                      <p className="text-xs font-semibold text-text-secondary">No submissions yet</p>
                      <p className="text-[11px] text-text-muted mt-1">
                        Scores appear here as students attempt the test.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {submissions.map((submission, index) => (
                        <motion.div
                          key={submission.submissionId || `${submission.studentId}-${index}`}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="flex items-center gap-3 p-3 bg-bg-elevated/50 rounded-xl border border-border-subtle"
                        >
                          <div className="w-6 text-center text-[10px] font-bold text-text-muted shrink-0">
                            #{index + 1}
                          </div>

                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {submission.studentName?.charAt(0)?.toUpperCase() || '?'}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-text-primary truncate">
                              {submission.studentName || 'Unknown'}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-text-muted flex-wrap">
                              {submission.rollNumber && <span>{submission.rollNumber}</span>}
                              {submission.sectionName && <span>· Sec {submission.sectionName}</span>}
                              <span>· {formatRelative(submission.submittedAt)}</span>
                            </div>
                          </div>

                          <div className="hidden sm:flex items-center gap-2 w-20 shrink-0">
                            <div className="flex-1 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${submission.score ?? 0}%`,
                                  background: (submission.score ?? 0) >= (test.passingScore ?? 70)
                                    ? '#10b981'
                                    : '#f59e0b',
                                }}
                              />
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className={`text-base font-bold font-syne ${
                              (submission.score ?? 0) >= (test.passingScore ?? 70)
                                ? 'text-emerald-400' : 'text-amber-400'
                            }`}
                            >
                              {submission.score != null ? `${submission.score.toFixed(1)}%` : '-'}
                            </div>
                            <div className={`text-[10px] font-bold uppercase tracking-wider ${
                              submission.passed ? 'text-emerald-400/80' : 'text-amber-400/80'
                            }`}
                            >
                              {submission.passed ? 'Passed' : 'Needs Retry'}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div>
                <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
                  Questions ({test.questions?.length || 0})
                </div>
                <div className="space-y-2">
                  {(test.questions || []).map((question, index) => (
                    <div key={index} className="p-3 bg-bg-elevated/50 rounded-xl border border-border-subtle">
                      <div className="text-xs font-semibold text-text-primary mb-1.5">
                        <span className="text-amber-400 mr-2">Q{index + 1}.</span>{question.questionText}
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {(question.options || []).map((option, optionIndex) => (
                          <div key={optionIndex} className="text-[11px] text-text-muted flex items-center gap-1.5 px-2 py-1 rounded-lg bg-bg-elevated/50">
                            <span className="w-4 h-4 rounded-full bg-bg-elevated border border-border-subtle flex items-center justify-center text-[9px] font-bold">
                              {String.fromCharCode(65 + optionIndex)}
                            </span>
                            {option}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-bg-elevated/95 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl"
          >
            <div className="text-center p-6">
              <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
              <p className="text-sm font-bold text-text-primary mb-1">Delete this test?</p>
              <p className="text-xs text-text-muted mb-4">This cannot be undone.</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-4 py-2 text-xs text-text-muted bg-bg-surface border border-border-subtle rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl hover:bg-red-500/20 disabled:opacity-50"
                >
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

export default function LiveTestsPanel({ courseId }) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchTests = useCallback(async () => {
    try {
      const response = await api.get(`/live-tests/course/${courseId}`);
      setTests(response.data || []);
    } catch (error) {
      console.warn('Failed to load live tests:', error);
      setTests([]);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { fetchTests(); }, [fetchTests]);

  const handleCreated = (test) => { setTests((current) => [test, ...current]); setShowCreate(false); };
  const handleLaunched = (test) => setTests((current) => current.map((item) => (item.id === test.id ? test : item)));
  const handleClosed = (test) => setTests((current) => current.map((item) => (item.id === test.id ? test : item)));
  const handleDeleted = (testId) => setTests((current) => current.filter((item) => item.id !== testId));

  const liveTest = tests.find((test) => test.isLive && !test.isClosed);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          Live Tests
          <span className="text-text-muted font-normal">({tests.length})</span>
        </h3>
        {!showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold rounded-xl hover:bg-amber-500/20 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" /> Create Test
          </button>
        )}
      </div>

      {liveTest && (
        <div className="flex items-center gap-3 p-4 bg-red-500/8 border border-red-500/20 rounded-xl">
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
          </span>
          <div className="flex-1">
            <span className="text-sm font-bold text-red-400">{liveTest.title}</span>
            <span className="text-xs text-red-400/70 ml-2">is live now · {liveTest.durationMinutes} min</span>
          </div>
          <button
            onClick={async () => {
              try {
                const response = await api.post(`/live-tests/${liveTest.id}/close`);
                handleClosed(response.data);
              } catch (error) {
                console.warn(error);
              }
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-500/15 border border-red-500/25 text-red-400 text-xs font-bold rounded-xl hover:bg-red-500/25 transition-all"
          >
            <Square className="w-3 h-3" /> Stop
          </button>
        </div>
      )}

      <AnimatePresence>
        {showCreate && (
          <CreateLiveTestForm courseId={courseId} onCreated={handleCreated} onCancel={() => setShowCreate(false)} />
        )}
      </AnimatePresence>

      {tests.length === 0 && !showCreate ? (
        <div className="flex flex-col items-center justify-center py-14 text-center border border-dashed border-border-subtle rounded-2xl">
          <Zap className="w-10 h-10 text-text-muted mb-3 opacity-30" />
          <p className="text-text-secondary text-sm font-bold mb-1">No live tests yet</p>
          <p className="text-text-muted text-xs mb-5">Create a timed quiz and launch it for all enrolled students.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-bold rounded-xl hover:bg-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Create First Test
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tests.map((test) => (
            <div key={test.id} className="relative">
              <LiveTestCard
                test={test}
                onLaunched={handleLaunched}
                onClosed={handleClosed}
                onDeleted={handleDeleted}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
