import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import InstructorSidebar from '../../components/layout/InstructorSidebar';
import { Plus, Trash2, ChevronDown, ChevronUp, Video, FileText, ArrowLeft, ArrowRight } from 'lucide-react';

const categories = ['AIML', 'Cloud', 'DataScience', 'Cybersecurity'];
const levels = ['Beginner', 'Intermediate', 'Advanced'];

const newChapter = () => ({
  id: `ch${Date.now()}${Math.random().toString(36).slice(2)}`,
  title: '', duration: '', type: 'text',
  content: { textContent: '', videoUrl: '', description: '' },
  assessment: { id: `a${Date.now()}`, questions: [{ question: '', options: ['', '', '', ''], correct: 0 }] }
});

const newQuestion = () => ({ question: '', options: ['', '', '', ''], correct: 0 });

export default function CreateCourse() {
  const { user, updateUser } = useAuth();
  const { db, showNotification } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [expanded, setExpanded] = useState({ 0: true });
  const [form, setForm] = useState({
    title: '', description: '', longDescription: '',
    category: 'AIML', level: 'Beginner', duration: '', thumbnail: '', tags: '',
    chapters: [newChapter()],
    grandAssessment: { id: `ga${Date.now()}`, title: '', passingScore: 70, questions: [newQuestion()] }
  });

  const updateForm = (field, val) => setForm(p => ({ ...p, [field]: val }));

  const updateChapter = (idx, field, val) => {
    setForm(p => {
      const chs = [...p.chapters];
      if (field.includes('.')) {
        const [a, b] = field.split('.');
        chs[idx] = { ...chs[idx], [a]: { ...chs[idx][a], [b]: val } };
      } else {
        chs[idx] = { ...chs[idx], [field]: val };
      }
      return { ...p, chapters: chs };
    });
  };

  const updateChapterQuestion = (chIdx, qIdx, field, val) => {
    setForm(p => {
      const chs = [...p.chapters];
      const qs = [...chs[chIdx].assessment.questions];
      if (field.startsWith('opt.')) {
        const oIdx = +field.split('.')[1];
        const opts = [...qs[qIdx].options]; opts[oIdx] = val;
        qs[qIdx] = { ...qs[qIdx], options: opts };
      } else qs[qIdx] = { ...qs[qIdx], [field]: val };
      chs[chIdx] = { ...chs[chIdx], assessment: { ...chs[chIdx].assessment, questions: qs } };
      return { ...p, chapters: chs };
    });
  };

  const updateGrandQuestion = (qIdx, field, val) => {
    setForm(p => {
      const qs = [...p.grandAssessment.questions];
      if (field.startsWith('opt.')) {
        const oIdx = +field.split('.')[1];
        const opts = [...qs[qIdx].options]; opts[oIdx] = val;
        qs[qIdx] = { ...qs[qIdx], options: opts };
      } else qs[qIdx] = { ...qs[qIdx], [field]: val };
      return { ...p, grandAssessment: { ...p.grandAssessment, questions: qs } };
    });
  };

  const handleCreate = () => {
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    const course = {
      ...form, tags,
      id: `c${Date.now()}`,
      instructorId: user.id,
      instructorName: user.name,
      price: 'Free', rating: 0, enrolledCount: 0,
      reviews: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.courses.push(course);
    updateUser({ courses: [...(user.courses || []), course.id] });
    showNotification('Course created successfully! 🎉');
    navigate('/instructor/courses');
  };

  // Render question editor
  const QuestionEditor = ({ q, qIdx, onChange, onDelete, canDelete }) => (
    <div className="p-4 rounded-xl mb-3" style={{ background: 'rgba(20, 25, 40, 0.5)', border: '1px solid rgba(172, 186, 196, 0.1)' }}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-bold" style={{ color: 'var(--accent-light)', fontFamily: 'Syne' }}>Q{qIdx + 1}</span>
        {canDelete && <button onClick={onDelete} className="text-red-400 hover:text-red-300"><Trash2 size={13} /></button>}
      </div>
      <input className="input-field text-sm mb-3" placeholder="Enter question..." value={q.question} onChange={e => onChange('question', e.target.value)} />
      <div className="space-y-2 mb-3">
        {q.options.map((opt, oi) => (
          <div key={oi} className="flex items-center gap-2">
            <button onClick={() => onChange('correct', oi)}
              className="w-5 h-5 rounded-full flex-shrink-0 transition-all duration-200"
              style={{ background: q.correct === oi ? '#4ECDC4' : 'rgba(172, 186, 196, 0.2)', border: `2px solid ${q.correct === oi ? '#4ECDC4' : 'rgba(172, 186, 196, 0.3)'}` }} />
            <input className="input-field text-sm py-2" placeholder={`Option ${String.fromCharCode(65 + oi)}`} value={opt} onChange={e => onChange(`opt.${oi}`, e.target.value)} />
          </div>
        ))}
      </div>
      <p className="text-xs" style={{ color: 'var(--steel)' }}>Click circle to mark correct answer</p>
    </div>
  );

  return (
    <div className="flex">
      <InstructorSidebar />
      <div className="main-content p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 animate-fadeInUp">
            <h1 className="text-4xl font-black mb-2" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>Create New Course</h1>
            <div className="flex gap-3 mt-5">
              {['Course Details', 'Chapters & Content', 'Grand Assessment'].map((s, i) => (
                <button key={i} onClick={() => setStep(i + 1)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: step === i + 1 ? 'rgba(107, 127, 212, 0.25)' : 'rgba(48, 54, 79, 0.3)',
                    border: `1.5px solid ${step === i + 1 ? 'rgba(107, 127, 212, 0.5)' : 'rgba(172, 186, 196, 0.15)'}`,
                    color: step === i + 1 ? 'var(--cream)' : 'var(--steel)', fontFamily: 'Syne'
                  }}>
                  {i + 1}. {s}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <div className="glass rounded-3xl p-8 animate-fadeInUp space-y-5">
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--sand)' }}>Course Title *</label>
                <input className="input-field" placeholder="Machine Learning Fundamentals" value={form.title} onChange={e => updateForm('title', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--sand)' }}>Short Description *</label>
                <textarea className="input-field resize-none" rows={2} value={form.description} onChange={e => updateForm('description', e.target.value)} placeholder="Brief course overview..." />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--sand)' }}>Long Description</label>
                <textarea className="input-field resize-none" rows={4} value={form.longDescription} onChange={e => updateForm('longDescription', e.target.value)} placeholder="Detailed course description..." />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--sand)' }}>Category *</label>
                  <select className="input-field" value={form.category} onChange={e => updateForm('category', e.target.value)} style={{ appearance: 'none' }}>
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--sand)' }}>Level *</label>
                  <select className="input-field" value={form.level} onChange={e => updateForm('level', e.target.value)} style={{ appearance: 'none' }}>
                    {levels.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--sand)' }}>Duration</label>
                  <input className="input-field" placeholder="24 hours" value={form.duration} onChange={e => updateForm('duration', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--sand)' }}>Thumbnail URL</label>
                <input className="input-field" placeholder="https://..." value={form.thumbnail} onChange={e => updateForm('thumbnail', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--sand)' }}>Tags (comma-separated)</label>
                <input className="input-field" placeholder="Python, ML, TensorFlow" value={form.tags} onChange={e => updateForm('tags', e.target.value)} />
              </div>
              <button onClick={() => form.title && form.description && setStep(2)} disabled={!form.title || !form.description} className="btn-sand py-3 px-8 rounded-2xl disabled:opacity-40 flex items-center gap-2">
                Next: Chapters <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="animate-fadeInUp space-y-4">
              {form.chapters.map((ch, idx) => (
                <div key={ch.id} className="glass rounded-2xl overflow-hidden">
                  <button className="w-full p-5 flex items-center justify-between" onClick={() => setExpanded(p => ({ ...p, [idx]: !p[idx] }))}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold" style={{ background: 'rgba(107,127,212,0.2)', color: 'var(--accent-light)', fontFamily: 'Syne' }}>{idx + 1}</div>
                      <span className="font-semibold" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>{ch.title || `Chapter ${idx + 1}`}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {form.chapters.length > 1 && (
                        <span onClick={e => { e.stopPropagation(); setForm(p => ({ ...p, chapters: p.chapters.filter((_, i) => i !== idx) })); }} className="p-1.5 rounded-lg cursor-pointer text-red-400 hover:bg-red-900/20">
                          <Trash2 size={14} />
                        </span>
                      )}
                      {expanded[idx] ? <ChevronUp size={18} style={{ color: 'var(--steel)' }} /> : <ChevronDown size={18} style={{ color: 'var(--steel)' }} />}
                    </div>
                  </button>

                  {expanded[idx] && (
                    <div className="px-5 pb-5 border-t space-y-4" style={{ borderColor: 'rgba(172,186,196,0.1)', paddingTop: '16px' }}>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                          <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--sand)' }}>Title *</label>
                          <input className="input-field" placeholder="Chapter title" value={ch.title} onChange={e => updateChapter(idx, 'title', e.target.value)} />
                        </div>
                        <div>
                          <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--sand)' }}>Duration</label>
                          <input className="input-field" placeholder="45 min" value={ch.duration} onChange={e => updateChapter(idx, 'duration', e.target.value)} />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {['text', 'video'].map(t => (
                          <button key={t} onClick={() => updateChapter(idx, 'type', t)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all"
                            style={{
                              background: ch.type === t ? 'rgba(107,127,212,0.2)' : 'rgba(48,54,79,0.3)',
                              border: `1.5px solid ${ch.type === t ? 'rgba(107,127,212,0.5)' : 'rgba(172,186,196,0.15)'}`,
                              color: ch.type === t ? 'var(--cream)' : 'var(--steel)'
                            }}>
                            {t === 'video' ? <Video size={14} /> : <FileText size={14} />}
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                          </button>
                        ))}
                      </div>

                      {ch.type === 'video' && (
                        <div>
                          <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--sand)' }}>YouTube Embed URL</label>
                          <input className="input-field" placeholder="https://www.youtube.com/embed/..." value={ch.content.videoUrl} onChange={e => updateChapter(idx, 'content.videoUrl', e.target.value)} />
                        </div>
                      )}
                      <div>
                        <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--sand)' }}>Text Content (supports markdown)</label>
                        <textarea className="input-field resize-none font-mono text-xs" rows={6} placeholder="# Chapter Title&#10;&#10;Write your content here in Markdown..." value={ch.content.textContent} onChange={e => updateChapter(idx, 'content.textContent', e.target.value)} />
                      </div>

                      {/* Assessment */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-bold" style={{ fontFamily: 'Syne', color: 'var(--sand)' }}>Chapter Assessment</h4>
                          <button onClick={() => {
                            const chs = [...form.chapters];
                            chs[idx].assessment.questions.push(newQuestion());
                            setForm(p => ({ ...p, chapters: chs }));
                          }} className="btn-outline px-3 py-1.5 rounded-xl text-xs flex items-center gap-1">
                            <Plus size={12} /> Add Question
                          </button>
                        </div>
                        {ch.assessment.questions.map((q, qi) => (
                          <QuestionEditor key={qi} q={q} qIdx={qi}
                            onChange={(field, val) => updateChapterQuestion(idx, qi, field, val)}
                            onDelete={() => {
                              const chs = [...form.chapters];
                              chs[idx].assessment.questions.splice(qi, 1);
                              setForm(p => ({ ...p, chapters: chs }));
                            }}
                            canDelete={ch.assessment.questions.length > 1} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <button onClick={() => { setForm(p => ({ ...p, chapters: [...p.chapters, newChapter()] })); setExpanded(p => ({ ...p, [form.chapters.length]: true })); }}
                className="btn-outline w-full py-3 rounded-2xl flex items-center justify-center gap-2 text-sm">
                <Plus size={16} /> Add Chapter
              </button>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-outline py-3 px-6 rounded-2xl flex items-center gap-2"><ArrowLeft size={18} /> Back</button>
                <button onClick={() => form.chapters.every(c => c.title) && setStep(3)} disabled={!form.chapters.every(c => c.title)} className="btn-sand flex-1 py-3 rounded-2xl disabled:opacity-40 flex items-center justify-center gap-2">
                  Next: Grand Assessment <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="glass rounded-3xl p-8 animate-fadeInUp space-y-5">
              <div>
                <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>Grand Assessment</h2>
                <p className="text-sm" style={{ color: 'var(--steel)' }}>Final test students must pass to earn their certificate</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--sand)' }}>Assessment Title</label>
                  <input className="input-field" placeholder="Final Assessment" value={form.grandAssessment.title} onChange={e => setForm(p => ({ ...p, grandAssessment: { ...p.grandAssessment, title: e.target.value } }))} />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--sand)' }}>Passing Score (%)</label>
                  <input className="input-field" type="number" min="50" max="100" value={form.grandAssessment.passingScore}
                    onChange={e => setForm(p => ({ ...p, grandAssessment: { ...p.grandAssessment, passingScore: +e.target.value } }))} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold" style={{ fontFamily: 'Syne', color: 'var(--sand)' }}>Questions ({form.grandAssessment.questions.length})</h4>
                  <button onClick={() => setForm(p => ({ ...p, grandAssessment: { ...p.grandAssessment, questions: [...p.grandAssessment.questions, newQuestion()] } }))}
                    className="btn-outline px-3 py-1.5 rounded-xl text-xs flex items-center gap-1">
                    <Plus size={12} /> Add Question
                  </button>
                </div>
                {form.grandAssessment.questions.map((q, qi) => (
                  <QuestionEditor key={qi} q={q} qIdx={qi}
                    onChange={(f, v) => updateGrandQuestion(qi, f, v)}
                    onDelete={() => setForm(p => ({ ...p, grandAssessment: { ...p.grandAssessment, questions: p.grandAssessment.questions.filter((_, i) => i !== qi) } }))}
                    canDelete={form.grandAssessment.questions.length > 1} />
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-outline py-3 px-6 rounded-2xl flex items-center gap-2"><ArrowLeft size={18} /> Back</button>
                <button onClick={handleCreate} className="btn-sand flex-1 py-3 rounded-2xl flex items-center justify-center gap-2">
                  🚀 Publish Course
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QuestionEditor({ q, qIdx, onChange, onDelete, canDelete }) {
  return (
    <div className="p-4 rounded-xl mb-3" style={{ background: 'rgba(20, 25, 40, 0.5)', border: '1px solid rgba(172, 186, 196, 0.1)' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold" style={{ color: 'var(--accent-light)', fontFamily: 'Syne' }}>Q{qIdx + 1}</span>
        {canDelete && <button onClick={onDelete} className="text-red-400 hover:text-red-300"><Trash2 size={13} /></button>}
      </div>
      <input className="input-field text-sm mb-3" placeholder="Enter question..." value={q.question} onChange={e => onChange('question', e.target.value)} />
      <div className="space-y-2 mb-2">
        {q.options.map((opt, oi) => (
          <div key={oi} className="flex items-center gap-2">
            <button onClick={() => onChange('correct', oi)}
              className="w-5 h-5 rounded-full flex-shrink-0 border-2 transition-all"
              style={{ background: q.correct === oi ? '#4ECDC4' : 'transparent', borderColor: q.correct === oi ? '#4ECDC4' : 'rgba(172,186,196,0.3)' }} />
            <input className="input-field text-sm py-2" placeholder={`Option ${String.fromCharCode(65 + oi)}`} value={opt} onChange={e => onChange(`opt.${oi}`, e.target.value)} />
          </div>
        ))}
      </div>
      <p className="text-xs" style={{ color: 'var(--steel)' }}>● = correct answer</p>
    </div>
  );
}