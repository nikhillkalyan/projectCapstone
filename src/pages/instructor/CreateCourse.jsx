import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import InstructorSidebar from '../../components/layout/InstructorSidebar';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Accordion from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import MuiAccordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Alert from '@mui/material/Alert';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import PublishRoundedIcon from '@mui/icons-material/PublishRounded';
import { ACCENT, ACCENT2, TEAL, STEEL, CREAM, SAND, GOLD, DANGER, NAVY, NAVY2 } from '../../theme';

const SIDEBAR_W = 248;
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
    <Box sx={{ p: 2.5, borderRadius: 3, background: 'rgba(13,17,23,0.5)', border: '1px solid rgba(139,155,180,0.1)', mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography sx={{ color: ACCENT2, fontFamily: '"Syne",sans-serif', fontWeight: 600, fontSize: '0.82rem' }}>
          Question {qi + 1}
        </Typography>
        {showDelete && (
          <IconButton size="small" onClick={onDelete} sx={{ color: DANGER, background: 'rgba(231,76,111,0.1)', borderRadius: 1.5,
            '&:hover': { background: 'rgba(231,76,111,0.2)' } }}>
            <DeleteRoundedIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      <TextField fullWidth size="small" label="Question text *" value={q.question}
        onChange={e => update('question', e.target.value)} sx={{ mb: 1.5 }} />

      <Typography sx={{ color: STEEL, fontSize: '0.75rem', mb: 1, fontWeight: 500 }}>Options (click radio to set correct answer)</Typography>
      {q.options.map((opt, oi) => (
        <Box key={oi} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Box onClick={() => update('correct', oi)}
            sx={{
              width: 22, height: 22, borderRadius: '50%', flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: q.correct === oi ? TEAL : 'rgba(139,155,180,0.1)',
              border: `2px solid ${q.correct === oi ? TEAL : 'rgba(139,155,180,0.25)'}`,
              transition: 'all 0.2s ease',
            }}>
            {q.correct === oi && <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
          </Box>
          <TextField fullWidth size="small" placeholder={`Option ${oi + 1}`} value={opt}
            onChange={e => updateOption(oi, e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, ...(q.correct === oi ? { '& fieldset': { borderColor: `${TEAL} !important` } } : {}) } }} />
        </Box>
      ))}
    </Box>
  );
}

// ─── Step 1: Basic Info ─────────────────────────────────────────────────────
function Step1({ data, onChange }) {
  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, color: CREAM, mb: 2.5 }}>📋 Course Details</Typography>
      <Grid container spacing={2.5}>
        <Grid item xs={12}>
          <TextField label="Course Title *" fullWidth value={data.title}
            onChange={e => onChange({ ...data, title: e.target.value })}
            placeholder="e.g. Complete Machine Learning Bootcamp 2024" />
        </Grid>
        <Grid item xs={12}>
          <TextField label="Short Description *" fullWidth multiline rows={2} value={data.description}
            onChange={e => onChange({ ...data, description: e.target.value })}
            placeholder="Brief overview shown on course cards" />
        </Grid>
        <Grid item xs={12}>
          <TextField label="Full Description" fullWidth multiline rows={4} value={data.longDescription}
            onChange={e => onChange({ ...data, longDescription: e.target.value })}
            placeholder="Detailed description for the course page" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: STEEL }}>Category *</InputLabel>
            <Select value={data.category} label="Category *"
              onChange={e => onChange({ ...data, category: e.target.value })}
              sx={{ borderRadius: 2.5, color: CREAM, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(139,155,180,0.2)' } }}>
              {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: STEEL }}>Level *</InputLabel>
            <Select value={data.level} label="Level *"
              onChange={e => onChange({ ...data, level: e.target.value })}
              sx={{ borderRadius: 2.5, color: CREAM, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(139,155,180,0.2)' } }}>
              {LEVELS.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Duration *" fullWidth value={data.duration}
            onChange={e => onChange({ ...data, duration: e.target.value })}
            placeholder="e.g. 24 hours" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Thumbnail URL" fullWidth value={data.thumbnail}
            onChange={e => onChange({ ...data, thumbnail: e.target.value })}
            placeholder="https://example.com/image.jpg" />
        </Grid>
        <Grid item xs={12}>
          <TextField label="Tags (comma-separated)" fullWidth value={data.tagsRaw}
            onChange={e => onChange({ ...data, tagsRaw: e.target.value })}
            placeholder="Python, TensorFlow, Deep Learning" helperText="Helps students discover your course" />
        </Grid>
      </Grid>
    </Box>
  );
}

// ─── Step 2: Chapters ────────────────────────────────────────────────────────
function Step2({ chapters, onChange }) {
  const addChapter = () => onChange([...chapters, emptyChapter()]);

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
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: CREAM }}>📖 Chapters ({chapters.length})</Typography>
        <Button variant="outlined" color="primary" size="small" startIcon={<AddRoundedIcon />}
          onClick={addChapter} sx={{ borderRadius: 2.5 }}>
          Add Chapter
        </Button>
      </Box>

      {chapters.map((ch, ci) => (
        <MuiAccordion key={ch.id} defaultExpanded={ci === 0}
          sx={{ mb: 1.5, background: 'rgba(22,27,39,0.8)', border: '1px solid rgba(139,155,180,0.12)', borderRadius: '14px !important',
            '&:before': { display: 'none' }, '&.Mui-expanded': { margin: '0 0 12px 0' } }}>
          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon sx={{ color: STEEL }} />}
            sx={{ px: 2.5, py: 1.5, '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 1 } }}>
            <Box sx={{ width: 28, height: 28, borderRadius: 1.5, background: 'rgba(108,127,216,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Typography sx={{ color: ACCENT2, fontFamily: '"Syne",sans-serif', fontWeight: 700, fontSize: '0.75rem' }}>
                {ci + 1}
              </Typography>
            </Box>
            <Typography sx={{ color: CREAM, fontWeight: 600, fontSize: '0.88rem', flex: 1 }}>
              {ch.title || `Chapter ${ci + 1}`}
            </Typography>
            <Chip label={ch.type} size="small"
              icon={ch.type === 'video' ? <PlayArrowRoundedIcon sx={{ fontSize: '12px !important' }} /> : <ArticleRoundedIcon sx={{ fontSize: '12px !important' }} />}
              sx={{ background: ch.type === 'video' ? 'rgba(108,127,216,0.15)' : 'rgba(212,168,67,0.15)',
                color: ch.type === 'video' ? ACCENT2 : GOLD, fontSize: '0.65rem', mr: 1 }} />
            {chapters.length > 1 && (
              <IconButton size="small" onClick={e => { e.stopPropagation(); deleteChapter(ci); }}
                sx={{ color: DANGER, background: 'rgba(231,76,111,0.1)', borderRadius: 1.5, width: 28, height: 28,
                  '&:hover': { background: 'rgba(231,76,111,0.2)' } }}>
                <DeleteRoundedIcon sx={{ fontSize: 14 }} />
              </IconButton>
            )}
          </AccordionSummary>

          <AccordionDetails sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={7}>
                <TextField label="Chapter Title *" fullWidth size="small" value={ch.title}
                  onChange={e => updateChapter(ci, { ...ch, title: e.target.value })} />
              </Grid>
              <Grid item xs={6} sm={2.5}>
                <TextField label="Duration" fullWidth size="small" value={ch.duration}
                  onChange={e => updateChapter(ci, { ...ch, duration: e.target.value })}
                  placeholder="45 min" />
              </Grid>
              <Grid item xs={6} sm={2.5}>
                <ToggleButtonGroup exclusive value={ch.type} size="small"
                  onChange={(_, v) => v && updateChapter(ci, { ...ch, type: v })}
                  sx={{ height: 40, '& .MuiToggleButton-root': { px: 1.5, py: 0.5, color: STEEL, borderColor: 'rgba(139,155,180,0.2)', '&.Mui-selected': { background: 'rgba(108,127,216,0.2)', color: ACCENT2 } } }}>
                  <ToggleButton value="text"><ArticleRoundedIcon sx={{ fontSize: 15 }} /></ToggleButton>
                  <ToggleButton value="video"><PlayArrowRoundedIcon sx={{ fontSize: 15 }} /></ToggleButton>
                </ToggleButtonGroup>
              </Grid>
            </Grid>

            {ch.type === 'video' && (
              <TextField label="Video URL (YouTube embed)" fullWidth size="small" value={ch.content.videoUrl}
                onChange={e => updateChapter(ci, { ...ch, content: { ...ch.content, videoUrl: e.target.value } })}
                placeholder="https://www.youtube.com/embed/..." sx={{ mb: 2 }} />
            )}

            <TextField label="Text Content (Markdown supported)" fullWidth multiline rows={4} size="small"
              value={ch.content.textContent}
              onChange={e => updateChapter(ci, { ...ch, content: { ...ch.content, textContent: e.target.value } })}
              placeholder="# Chapter Title&#10;&#10;Write your content here..." sx={{ mb: 2.5 }} />

            {/* Chapter quiz */}
            <Box sx={{ borderTop: '1px solid rgba(139,155,180,0.1)', pt: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <QuizRoundedIcon sx={{ color: ACCENT2, fontSize: 18 }} />
                  <Typography sx={{ color: CREAM, fontFamily: '"Syne",sans-serif', fontWeight: 600, fontSize: '0.88rem' }}>
                    Chapter Quiz ({ch.assessment?.questions?.length || 0} questions)
                  </Typography>
                </Box>
                <Button variant="outlined" color="primary" size="small" startIcon={<AddRoundedIcon />}
                  onClick={() => addQuestion(ci)} sx={{ borderRadius: 2 }}>
                  Add Q
                </Button>
              </Box>

              {ch.assessment?.questions?.map((q, qi) => (
                <QuestionEditor key={qi} q={q} qi={qi}
                  onChange={updated => updateQuestion(ci, qi, updated)}
                  onDelete={() => deleteQuestion(ci, qi)}
                  showDelete={(ch.assessment?.questions?.length || 0) > 1} />
              ))}
            </Box>
          </AccordionDetails>
        </MuiAccordion>
      ))}
    </Box>
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
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: CREAM }}>🏆 Grand Assessment</Typography>
        <Button variant="outlined" color="primary" size="small" startIcon={<AddRoundedIcon />}
          onClick={addQuestion} sx={{ borderRadius: 2.5 }}>
          Add Question
        </Button>
      </Box>
      <Typography sx={{ color: STEEL, fontSize: '0.83rem', mb: 3 }}>
        Students must complete all chapters before taking this final test to earn their certificate.
      </Typography>

      <TextField label="Passing Score (%)" type="number" value={grandAssessment.passingScore}
        onChange={e => onChange({ ...grandAssessment, passingScore: Number(e.target.value) })}
        inputProps={{ min: 1, max: 100 }} sx={{ mb: 3, width: 200 }} size="small" />

      {(grandAssessment.questions || []).map((q, qi) => (
        <QuestionEditor key={qi} q={q} qi={qi}
          onChange={updated => updateQuestion(qi, updated)}
          onDelete={() => deleteQuestion(qi)}
          showDelete={(grandAssessment.questions?.length || 0) > 1} />
      ))}
    </Box>
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
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0D1117' }}>
      <InstructorSidebar />
      <Box sx={{ ml: { md: `${SIDEBAR_W}px` }, flex: 1, p: { xs: 2, sm: 3, md: 4 }, pt: { xs: 7, md: 4 } }}>
        <Box sx={{ maxWidth: 860, mx: 'auto' }}>

          {/* Header */}
          <Box className="anim-fadeInUp" sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: CREAM, fontSize: { xs: '1.6rem', md: '2rem' } }}>
              Create Course
            </Typography>
            <Typography sx={{ color: STEEL, mt: 0.5, fontSize: '0.9rem' }}>Build and publish your course step by step</Typography>
          </Box>

          {/* Stepper */}
          <Stepper activeStep={activeStep} className="anim-fadeInUp delay-1" sx={{ mb: 4,
            '& .MuiStepLabel-label': { fontFamily: '"Syne",sans-serif', fontWeight: 600, color: STEEL, fontSize: '0.83rem',
              '&.Mui-active': { color: CREAM }, '&.Mui-completed': { color: TEAL } },
            '& .MuiStepIcon-root': { color: 'rgba(139,155,180,0.2)', '&.Mui-active': { color: ACCENT }, '&.Mui-completed': { color: TEAL } },
          }}>
            {STEPS.map(label => (
              <Step key={label}><StepLabel>{label}</StepLabel></Step>
            ))}
          </Stepper>

          {/* Content card */}
          <Card className="anim-fadeInUp delay-2"
            sx={{ background: 'rgba(22,27,39,0.85)', border: '1px solid rgba(139,155,180,0.1)', borderRadius: 4 }}>
            <CardContent sx={{ p: { xs: 2.5, md: 4 }, '&:last-child': { pb: { xs: 2.5, md: 4 } } }}>
              {activeStep === 0 && <Step1 data={courseData} onChange={setCourseData} />}
              {activeStep === 1 && <Step2 chapters={chapters} onChange={setChapters} />}
              {activeStep === 2 && <Step3 grandAssessment={grandAssessment} onChange={setGrandAssessment} />}

              {error && <Alert severity="error" sx={{ mt: 2.5, borderRadius: 2.5 }}>{error}</Alert>}

              {/* Navigation */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, pt: 3, borderTop: '1px solid rgba(139,155,180,0.1)' }}>
                <Button variant="outlined" color="primary" startIcon={<ArrowBackRoundedIcon />}
                  onClick={() => setActiveStep(s => s - 1)} disabled={activeStep === 0}
                  sx={{ px: 3, py: 1.2 }}>
                  Back
                </Button>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {STEPS.map((_, i) => (
                    <Box key={i} sx={{ width: i === activeStep ? 24 : 8, height: 8, borderRadius: 4, transition: 'all 0.3s ease',
                      background: i < activeStep ? TEAL : i === activeStep ? ACCENT : 'rgba(139,155,180,0.2)' }} />
                  ))}
                </Box>

                {activeStep < STEPS.length - 1 ? (
                  <Button variant="contained" color="primary" endIcon={<ArrowForwardRoundedIcon />}
                    onClick={handleNext} sx={{ px: 3, py: 1.2 }}>
                    Continue
                  </Button>
                ) : (
                  <Button variant="contained" startIcon={<PublishRoundedIcon />}
                    onClick={handlePublish}
                    sx={{ px: 3.5, py: 1.2, background: `linear-gradient(135deg, ${GOLD} 0%, ${SAND} 100%)`, color: NAVY, fontWeight: 700 }}>
                    Publish Course
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}