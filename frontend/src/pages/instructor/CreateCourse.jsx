import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import InstructorLayout from '../../components/layout/v2/InstructorLayout';
import {
  CheckCircle, AlertCircle, ArrowLeft, ArrowRight, UploadCloud,
  Plus, Trash2, ChevronDown, MonitorPlay, FileText, HelpCircle
} from 'lucide-react';

const STEPS = ['Basic Info', 'Course Content', 'Grand Assessment'];
const CATEGORIES = ['AIML', 'Cloud', 'DataScience', 'Cybersecurity'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

function emptyQuestion() {
  return { question: '', options: ['', '', '', ''], correct: 0 };
}
function emptyChapter() {
  return {
    id: `ch_${Date.now()}`,
    title: '',
    type: 'text',
    duration: '',
    content: { videoUrl: '', textContent: '' },
    assessment: { questions: [emptyQuestion()] },
  };
}

// ─── Question editor (defined once, no duplicate bug) ──────────────────────
function QuestionEditor({ q, qi, onChange, onDelete, showDelete }) {
  const update = (field, val) => onChange({ ...q, [field]: val });
  const updateOption = (oi, val) => {
    const opts = [...q.options]; opts[oi] = val;
    onChange({ ...q, options: opts });
  };

  return (
    <div className="p-5 md:p-6 bg-bg-elevated/50 border border-border-subtle rounded-2xl mb-4 relative group">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-primary-400 font-syne font-bold text-sm tracking-wide">
          QUESTION {qi + 1}
        </h3>
        {showDelete && (
          <button
            onClick={onDelete}
            className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
            title="Delete Question"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="mb-5">
        <input
          type="text"
          value={q.question}
          onChange={e => update('question', e.target.value)}
          className="w-full bg-bg-surface border border-border-subtle rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-medium"
          placeholder="Enter your question here..."
        />
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
          Options (Select the correct answer)
        </p>

        {q.options.map((opt, oi) => {
          const isCorrect = q.correct === oi;
          return (
            <div key={oi} className="flex items-center gap-3">
              <button
                onClick={() => update('correct', oi)}
                className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center transition-all ${isCorrect
                  ? 'bg-teal-500 border-2 border-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.3)]'
                  : 'bg-transparent border-2 border-border-subtle hover:border-primary-500/50'
                  }`}
              >
                {isCorrect && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
              </button>

              <input
                type="text"
                value={opt}
                onChange={e => updateOption(oi, e.target.value)}
                className={`w-full bg-bg-surface border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none transition-all ${isCorrect
                  ? 'border-teal-500/50 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-teal-500/5'
                  : 'border-border-subtle focus:border-primary-500 focus:ring-1 focus:ring-primary-500'
                  }`}
                placeholder={`Option ${oi + 1}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Shared Components ───
function InputGroup({ label, required, children, helperText }) {
  return (
    <div className="flex flex-col gap-1.5 mb-5 w-full">
      <label className="text-sm font-semibold text-text-primary">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {helperText && <p className="text-xs text-text-muted mt-0.5">{helperText}</p>}
    </div>
  );
}

// ─── Step 1: Basic Info ─────────────────────────────────────────────────────
function Step1({ data, onChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="max-w-3xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary-400" />
        </div>
        <h2 className="text-xl font-bold font-syne text-text-primary">Course Details</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <div className="md:col-span-2">
          <InputGroup label="Course Title" required>
            <input
              type="text"
              value={data.title}
              onChange={e => onChange({ ...data, title: e.target.value })}
              className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-medium"
              placeholder="e.g. Complete Machine Learning Bootcamp 2024"
            />
          </InputGroup>
        </div>

        <div className="md:col-span-2">
          <InputGroup label="Short Description" required helperText="Brief overview shown on course cards">
            <textarea
              value={data.description}
              onChange={e => onChange({ ...data, description: e.target.value })}
              rows={2}
              className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all resize-none"
              placeholder="Write a catchy 1-2 sentence hook..."
            />
          </InputGroup>
        </div>

        <div className="md:col-span-2">
          <InputGroup label="Full Description" helperText="Detailed description for the course page">
            <textarea
              value={data.longDescription}
              onChange={e => onChange({ ...data, longDescription: e.target.value })}
              rows={5}
              className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
              placeholder="What will students learn in this course?"
            />
          </InputGroup>
        </div>

        <InputGroup label="Category" required>
          <div className="relative">
            <select
              value={data.category}
              onChange={e => onChange({ ...data, category: e.target.value })}
              className="w-full appearance-none bg-bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-text-primary outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all cursor-pointer font-medium"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          </div>
        </InputGroup>

        <InputGroup label="Level" required>
          <div className="relative">
            <select
              value={data.level}
              onChange={e => onChange({ ...data, level: e.target.value })}
              className="w-full appearance-none bg-bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-text-primary outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all cursor-pointer font-medium"
            >
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          </div>
        </InputGroup>

        <InputGroup label="Duration" required helperText="e.g. 24 hours">
          <input
            type="text"
            value={data.duration}
            onChange={e => onChange({ ...data, duration: e.target.value })}
            className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-text-primary outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
            placeholder="e.g. 24 hours"
          />
        </InputGroup>

        <InputGroup label="Thumbnail URL" helperText="16:9 aspect ratio recommended">
          <input
            type="text"
            value={data.thumbnail}
            onChange={e => onChange({ ...data, thumbnail: e.target.value })}
            className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-text-primary outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
            placeholder="https://example.com/image.jpg"
          />
        </InputGroup>

        <div className="md:col-span-2">
          <InputGroup label="Tags" helperText="Comma-separated tags to help students discover your course">
            <input
              type="text"
              value={data.tagsRaw}
              onChange={e => onChange({ ...data, tagsRaw: e.target.value })}
              className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-text-primary outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
              placeholder="Python, TensorFlow, Deep Learning"
            />
          </InputGroup>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Step 2: Chapters ────────────────────────────────────────────────────────
function Step2({ chapters, onChange }) {
  const [expandedId, setExpandedId] = useState(chapters[0]?.id || null);

  const addChapter = () => {
    const newCh = emptyChapter();
    onChange([...chapters, newCh]);
    setExpandedId(newCh.id);
  };

  const updateChapter = (idx, updated) => {
    const next = [...chapters]; next[idx] = updated; onChange(next);
  };

  const deleteChapter = (idx) => {
    if (chapters.length <= 1) return;
    onChange(chapters.filter((_, i) => i !== idx));
  };

  const addQuestion = (ci) => {
    const ch = { ...chapters[ci] };
    ch.assessment = { ...ch.assessment, questions: [...(ch.assessment?.questions || []), emptyQuestion()] };
    updateChapter(ci, ch);
  };

  const deleteQuestion = (ci, qi) => {
    const ch = { ...chapters[ci] };
    const qs = ch.assessment.questions.filter((_, i) => i !== qi);
    ch.assessment = { ...ch.assessment, questions: qs };
    updateChapter(ci, ch);
  };

  const updateQuestion = (ci, qi, updated) => {
    const ch = { ...chapters[ci] };
    const qs = [...ch.assessment.questions]; qs[qi] = updated;
    ch.assessment = { ...ch.assessment, questions: qs };
    updateChapter(ci, ch);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
            <MonitorPlay className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-syne text-text-primary">Curriculum</h2>
            <p className="text-sm text-text-muted">{chapters.length} Chapter{chapters.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button
          onClick={addChapter}
          className="flex items-center gap-2 px-4 py-2 bg-bg-elevated hover:bg-bg-elevated-hover border border-border-subtle hover:border-border-strong text-text-primary text-sm font-semibold rounded-lg transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Chapter
        </button>
      </div>

      <div className="space-y-4">
        {chapters.map((ch, ci) => {
          const isExpanded = expandedId === ch.id;

          return (
            <div
              key={ch.id}
              className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isExpanded ? 'border-primary-500/50 bg-bg-surface shadow-[0_4px_24px_rgba(0,0,0,0.2)]' : 'border-border-subtle bg-bg-elevated/30 hover:bg-bg-elevated/60'
                }`}
            >
              {/* Accordion Header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : ch.id)}
                className="w-full flex items-center justify-between p-4 md:p-5 outline-none"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-syne font-bold text-sm transition-colors ${isExpanded ? 'bg-primary-500/20 text-primary-400' : 'bg-bg-elevated text-text-muted'
                    }`}>
                    {ci + 1}
                  </div>
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-semibold text-text-primary text-left">
                      {ch.title || `Chapter ${ci + 1}`}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${ch.type === 'video' ? 'bg-primary-500/10 text-primary-400' : 'bg-amber-500/10 text-amber-500'
                        }`}>
                        {ch.type === 'video' ? <MonitorPlay size={10} /> : <FileText size={10} />}
                        {ch.type}
                      </span>
                      {ch.duration && <span className="text-xs text-text-muted">{ch.duration}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {chapters.length > 1 && (
                    <div
                      onClick={(e) => { e.stopPropagation(); deleteChapter(ci); }}
                      className="w-8 h-8 rounded-lg text-text-muted hover:bg-red-500/10 hover:text-red-500 flex items-center justify-center transition-colors cursor-pointer"
                      title="Delete Chapter"
                    >
                      <Trash2 className="w-4 h-4" />
                    </div>
                  )}
                  <div className={`w-8 h-8 rounded-lg text-text-muted flex items-center justify-center transition-transform duration-300 ${isExpanded ? 'rotate-180 text-text-primary' : ''}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </div>
              </button>

              {/* Accordion Body */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden border-t border-border-subtle bg-bg-surface"
                  >
                    <div className="p-4 md:p-6 pb-6">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-6">
                        <div className="md:col-span-7">
                          <InputGroup label="Chapter Title">
                            <input
                              type="text"
                              value={ch.title}
                              onChange={e => updateChapter(ci, { ...ch, title: e.target.value })}
                              className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-2.5 text-text-primary outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-medium"
                              placeholder="e.g. Introduction to Neural Networks"
                            />
                          </InputGroup>
                        </div>

                        <div className="md:col-span-3">
                          <InputGroup label="Duration">
                            <input
                              type="text"
                              value={ch.duration}
                              onChange={e => updateChapter(ci, { ...ch, duration: e.target.value })}
                              className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-2.5 text-text-primary outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-medium"
                              placeholder="e.g. 15 min"
                            />
                          </InputGroup>
                        </div>

                        <div className="md:col-span-2">
                          <InputGroup label="Type">
                            <div className="flex bg-bg-elevated p-1 rounded-xl border border-border-subtle w-full h-[46px]">
                              <button
                                onClick={() => updateChapter(ci, { ...ch, type: 'video' })}
                                className={`flex-1 flex items-center justify-center rounded-lg transition-all ${ch.type === 'video' ? 'bg-primary-500/20 text-primary-400 font-medium shadow-sm' : 'text-text-muted hover:text-text-primary hover:bg-bg-surface'
                                  }`}
                              >
                                <MonitorPlay className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => updateChapter(ci, { ...ch, type: 'text' })}
                                className={`flex-1 flex items-center justify-center rounded-lg transition-all ${ch.type === 'text' ? 'bg-amber-500/20 text-amber-500 font-medium shadow-sm' : 'text-text-muted hover:text-text-primary hover:bg-bg-surface'
                                  }`}
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                            </div>
                          </InputGroup>
                        </div>
                      </div>

                      {ch.type === 'video' && (
                        <div className="mb-6">
                          <InputGroup label="Video URL (YouTube Embed)">
                            <input
                              type="text"
                              value={ch.content.videoUrl}
                              onChange={e => updateChapter(ci, { ...ch, content: { ...ch.content, videoUrl: e.target.value } })}
                              className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-2.5 text-text-primary outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-medium"
                              placeholder="https://www.youtube.com/embed/..."
                            />
                          </InputGroup>
                        </div>
                      )}

                      <div className="mb-8">
                        <InputGroup label="Text Content (Markdown supported)">
                          <textarea
                            value={ch.content.textContent}
                            onChange={e => updateChapter(ci, { ...ch, content: { ...ch.content, textContent: e.target.value } })}
                            rows={6}
                            className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-text-primary outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-mono text-sm"
                            placeholder="# Chapter Overview\n\nWrite your content here..."
                          />
                        </InputGroup>
                      </div>

                      {/* Chapter Quiz Section */}
                      <div className="pt-6 border-t border-border-subtle">
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-amber-500" />
                            <h3 className="font-syne font-bold text-text-primary">
                              Chapter Quiz <span className="text-text-muted font-normal text-sm ml-2">({ch.assessment?.questions?.length || 0} questions)</span>
                            </h3>
                          </div>
                          <button
                            onClick={() => addQuestion(ci)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-elevated hover:bg-bg-elevated-hover border border-border-subtle text-text-primary text-xs font-semibold rounded-lg transition-all active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add Q
                          </button>
                        </div>

                        <div className="space-y-4">
                          {ch.assessment?.questions?.map((q, qi) => (
                            <QuestionEditor
                              key={qi}
                              q={q}
                              qi={qi}
                              onChange={updated => updateQuestion(ci, qi, updated)}
                              onDelete={() => deleteQuestion(ci, qi)}
                              showDelete={(ch.assessment?.questions?.length || 0) > 1}
                            />
                          ))}
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Step 3: Grand Assessment ────────────────────────────────────────────────
function Step3({ grandAssessment, onChange }) {
  const addQuestion = () => onChange({ ...grandAssessment, questions: [...(grandAssessment.questions || []), emptyQuestion()] });

  const deleteQuestion = (qi) => {
    if ((grandAssessment.questions?.length || 0) <= 1) return;
    onChange({ ...grandAssessment, questions: grandAssessment.questions.filter((_, i) => i !== qi) });
  };

  const updateQuestion = (qi, updated) => {
    const qs = [...(grandAssessment.questions || [])]; qs[qi] = updated;
    onChange({ ...grandAssessment, questions: qs });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="max-w-3xl"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <span className="text-xl">🏆</span>
          </div>
          <h2 className="text-xl font-bold font-syne text-text-primary">Grand Assessment</h2>
        </div>
        <button
          onClick={addQuestion}
          className="flex items-center gap-2 px-4 py-2 bg-bg-elevated hover:bg-bg-elevated-hover border border-border-subtle hover:border-border-strong text-text-primary text-sm font-semibold rounded-lg transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </button>
      </div>

      <p className="text-sm text-text-muted mb-8 ml-14">
        Students must complete all chapters before taking this final test to earn their certificate.
      </p>

      <div className="mb-8 w-full max-w-xs">
        <InputGroup label="Passing Score (%)" required>
          <input
            type="number"
            min="1"
            max="100"
            value={grandAssessment.passingScore}
            onChange={e => onChange({ ...grandAssessment, passingScore: Number(e.target.value) })}
            className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-2.5 text-text-primary outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-medium"
            placeholder="e.g. 70"
          />
        </InputGroup>
      </div>

      <div className="space-y-4">
        {(grandAssessment.questions || []).map((q, qi) => (
          <QuestionEditor
            key={qi}
            q={q}
            qi={qi}
            onChange={updated => updateQuestion(qi, updated)}
            onDelete={() => deleteQuestion(qi)}
            showDelete={(grandAssessment.questions?.length || 0) > 1}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function CreateCourse() {
  const { user } = useAuth();
  const { db, showNotification } = useApp();
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');

  const [courseData, setCourseData] = useState({
    title: '', description: '', longDescription: '', category: 'AIML',
    level: 'Beginner', duration: '', thumbnail: '', tagsRaw: '',
  });

  const [chapters, setChapters] = useState([emptyChapter()]);

  const [grandAssessment, setGrandAssessment] = useState({
    passingScore: 70,
    questions: [emptyQuestion()],
  });

  const step1Valid = courseData.title && courseData.description && courseData.category && courseData.level && courseData.duration;
  const step2Valid = chapters.every(ch => ch.title);
  const step3Valid = grandAssessment.questions.every(q => q.question && q.options.every(o => o));

  const handleNext = () => {
    setError('');
    if (activeStep === 0 && !step1Valid) { setError('Please fill in all required fields.'); return; }
    if (activeStep === 1 && !step2Valid) { setError('Please add a title to every chapter.'); return; }
    setActiveStep(s => s + 1);
  };

  const handlePublish = () => {
    if (!step3Valid) { setError('Please complete all questions with options.'); return; }

    const newCourse = {
      id: `course_${Date.now()}`,
      ...courseData,
      tags: courseData.tagsRaw.split(',').map(t => t.trim()).filter(Boolean),
      instructorId: user.id,
      instructorName: user.name,
      chapters: chapters.map((ch, i) => ({ ...ch, id: ch.id || `ch_${i}` })),
      grandAssessment,
      enrolledCount: 0,
      rating: 0,
      reviews: [],
      createdAt: new Date().toISOString(),
    };

    db.courses.push(newCourse);
    showNotification('🎉 Course published successfully!');
    navigate('/instructor/courses');
  };

  return (
    <InstructorLayout>
      <div className="max-w-4xl mx-auto w-full pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-syne font-bold text-text-primary mb-2">
            Create Course
          </h1>
          <p className="text-text-secondary font-dmsans">Build and publish your course step by step</p>
        </motion.div>

        {/* Custom Tailwind Stepper */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-border-subtle/50 -z-10" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-primary-500 -z-10 transition-all duration-300"
            style={{ width: `${(activeStep / (STEPS.length - 1)) * 100}%` }}
          />

          {STEPS.map((label, index) => {
            const isCompleted = index < activeStep;
            const isActive = index === activeStep;

            return (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 z-10 ${isActive ? 'bg-primary-500 text-white shadow-[0_0_15px_rgba(108,127,216,0.4)] scale-110' :
                  isCompleted ? 'bg-primary-500 text-white' :
                    'bg-bg-elevated text-text-muted border-2 border-border-subtle'
                  }`}>
                  {isCompleted ? <CheckCircle className="w-5 h-5" /> : index + 1}
                </div>
                <span className={`text-xs md:text-sm font-semibold transition-colors ${isActive || isCompleted ? 'text-text-primary' : 'text-text-muted'
                  }`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Content Card */}
        <div className="bg-bg-surface border border-border-subtle rounded-2xl md:rounded-3xl shadow-xl overflow-hidden">
          <div className="p-6 md:p-8 lg:p-10">
            {/* Form Content Will Go Here */}
            {activeStep === 0 && <Step1 data={courseData} onChange={setCourseData} />}
            {activeStep === 1 && <Step2 chapters={chapters} onChange={setChapters} />}
            {activeStep === 2 && <Step3 grandAssessment={grandAssessment} onChange={setGrandAssessment} />}

            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Navigation Footer */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-border-subtle">
              <button
                onClick={() => setActiveStep(s => s - 1)}
                disabled={activeStep === 0}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${activeStep === 0
                  ? 'opacity-50 cursor-not-allowed text-text-muted bg-bg-elevated/50'
                  : 'text-text-secondary bg-bg-elevated hover:bg-bg-elevated-hover hover:text-text-primary active:scale-95'
                  }`}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <div className="hidden sm:flex items-center gap-2">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all duration-300 ${i === activeStep ? 'w-6 bg-primary-500' :
                      i < activeStep ? 'w-2 bg-teal-500' : 'w-2 bg-border-subtle'
                      }`}
                  />
                ))}
              </div>

              {activeStep < STEPS.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-primary-500/25 active:scale-95"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handlePublish}
                  className="flex items-center gap-2 px-7 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-900 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95"
                >
                  <UploadCloud className="w-5 h-5 flex-shrink-0" />
                  Publish Course
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </InstructorLayout>
  );
}