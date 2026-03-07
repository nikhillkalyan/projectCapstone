import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import { ACCENT, ACCENT2, TEAL, STEEL, CREAM, SAND, DANGER, GOLD } from '../../theme';

function ScoreRing({ score }) {
  const color = score >= 70 ? TEAL : DANGER;
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
      <CircularProgress variant="determinate" value={100} size={110}
        sx={{ color: 'rgba(139,155,180,0.1)', position: 'absolute', top: 0, left: 0 }} />
      <CircularProgress variant="determinate" value={score} size={110}
        sx={{ color, '& .MuiCircularProgress-circle': { strokeLinecap: 'round' } }} />
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '1.5rem', color }}>
          {score}%
        </Typography>
      </Box>
    </Box>
  );
}

export default function Assessment({ assessment, onComplete, onClose }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [current, setCurrent] = useState(0);

  const questions = assessment.questions;
  const totalQ = questions.length;
  const answeredCount = Object.keys(answers).length;
  const currentQ = questions[current];
  const passed = score >= 70;

  const selectAnswer = (qIdx, optIdx) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q, i) => { if (answers[i] === q.correct) correct++; });
    const pct = Math.round((correct / totalQ) * 100);
    setScore(pct);
    setSubmitted(true);
    onComplete(pct, answers, questions);
  };

  const handleReset = () => {
    setAnswers({}); setSubmitted(false); setScore(null); setCurrent(0);
  };

  if (submitted && score !== null) {
    return (
      <Box className="anim-scaleIn" sx={{ textAlign: 'center', py: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <ScoreRing score={score} />
        </Box>
        <Box sx={{ mb: 0.5 }}>
          {passed
            ? <EmojiEventsRoundedIcon sx={{ fontSize: 32, color: GOLD }} />
            : <AutoStoriesRoundedIcon sx={{ fontSize: 32, color: ACCENT2 }} />}
        </Box>
        <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '1.4rem', color: CREAM, mb: 0.5 }}>
          {passed ? 'Excellent Work!' : 'Keep Practicing!'}
        </Typography>
        <Typography sx={{ color: STEEL, mb: 3, fontSize: '0.9rem' }}>
          {Math.round(score * totalQ / 100)}/{totalQ} correct answers
        </Typography>

        {/* Review */}
        <Box sx={{ textAlign: 'left', mb: 3, maxHeight: 260, overflowY: 'auto', pr: 1,
          '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { background: 'rgba(139,155,180,0.2)', borderRadius: 2 } }}>
          {questions.map((q, i) => {
            const isCorrect = answers[i] === q.correct;
            return (
              <Box key={i} sx={{
                p: 1.5, borderRadius: 2.5, mb: 1,
                background: isCorrect ? 'rgba(78,205,196,0.08)' : 'rgba(231,76,111,0.08)',
                border: `1px solid ${isCorrect ? 'rgba(78,205,196,0.25)' : 'rgba(231,76,111,0.25)'}`,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  {isCorrect
                    ? <CheckCircleRoundedIcon sx={{ fontSize: 16, color: TEAL, flexShrink: 0, mt: 0.2 }} />
                    : <CancelRoundedIcon sx={{ fontSize: 16, color: DANGER, flexShrink: 0, mt: 0.2 }} />}
                  <Box>
                    <Typography sx={{ color: CREAM, fontSize: '0.82rem' }}>{q.question}</Typography>
                    {!isCorrect && (
                      <Typography sx={{ color: TEAL, fontSize: '0.75rem', mt: 0.4 }}>
                        ✓ {q.options[q.correct]}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" color="primary" startIcon={<RefreshRoundedIcon />}
            onClick={handleReset} fullWidth sx={{ py: 1.3 }}>
            Try Again
          </Button>
          <Button variant="contained" color="primary" endIcon={<ChevronRightRoundedIcon />}
            onClick={onClose} fullWidth sx={{ py: 1.3 }}>
            Continue
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="anim-fadeIn">
      {/* Progress header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography sx={{ color: STEEL, fontSize: '0.82rem' }}>
          Question <b style={{ color: CREAM }}>{current + 1}</b> of {totalQ}
        </Typography>
        <Chip
          label={`${answeredCount}/${totalQ} answered`}
          size="small"
          sx={{ background: 'rgba(108,127,216,0.15)', color: ACCENT2, border: '1px solid rgba(108,127,216,0.25)', fontSize: '0.7rem' }}
        />
      </Box>

      <LinearProgress variant="determinate" value={((current + 1) / totalQ) * 100} sx={{ mb: 3, borderRadius: 2 }} />

      {/* Question */}
      <Box sx={{
        p: 2.5, borderRadius: 3, mb: 3,
        background: 'rgba(13,17,23,0.5)', border: '1px solid rgba(139,155,180,0.12)',
      }}>
        <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 600, fontSize: '1rem', color: CREAM, lineHeight: 1.6 }}>
          {currentQ.question}
        </Typography>
      </Box>

      {/* Options */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mb: 3.5 }}>
        {currentQ.options.map((opt, i) => {
          const selected = answers[current] === i;
          return (
            <Box key={i} onClick={() => selectAnswer(current, i)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.8,
                p: '14px 18px', borderRadius: 2.5, cursor: 'pointer',
                background: selected ? 'rgba(108,127,216,0.18)' : 'rgba(30,37,53,0.6)',
                border: `1.5px solid ${selected ? 'rgba(108,127,216,0.5)' : 'rgba(139,155,180,0.15)'}`,
                transition: 'all 0.2s cubic-bezier(.22,.68,0,1.2)',
                '&:hover': { borderColor: 'rgba(108,127,216,0.4)', background: 'rgba(108,127,216,0.1)', transform: 'translateX(4px)' },
              }}>
              <Box sx={{
                width: 30, height: 30, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, background: selected ? ACCENT : 'rgba(139,155,180,0.1)',
                transition: 'all 0.2s ease',
              }}>
                <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 700, fontSize: '0.72rem', color: selected ? '#fff' : STEEL }}>
                  {String.fromCharCode(65 + i)}
                </Typography>
              </Box>
              <Typography sx={{ color: CREAM, fontSize: '0.88rem', lineHeight: 1.5 }}>{opt}</Typography>
            </Box>
          );
        })}
      </Box>

      {/* Navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Button variant="outlined" color="primary" startIcon={<ChevronLeftRoundedIcon />}
          onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
          sx={{ px: 2.5 }}>
          Previous
        </Button>

        {/* Dot indicators */}
        <Box sx={{ display: 'flex', gap: 0.8 }}>
          {questions.map((_, i) => (
            <Box key={i} onClick={() => setCurrent(i)}
              sx={{
                width: i === current ? 20 : 8, height: 8, borderRadius: 4, cursor: 'pointer',
                background: i === current ? ACCENT : answers[i] !== undefined ? `${TEAL}80` : 'rgba(139,155,180,0.25)',
                transition: 'all 0.3s ease',
              }} />
          ))}
        </Box>

        {current < totalQ - 1 ? (
          <Button variant="contained" color="primary" endIcon={<ChevronRightRoundedIcon />}
            onClick={() => setCurrent(c => Math.min(totalQ - 1, c + 1))} sx={{ px: 2.5 }}>
            Next
          </Button>
        ) : (
          <Button variant="contained" color="secondary"
            startIcon={<EmojiEventsRoundedIcon />}
            onClick={handleSubmit}
            disabled={answeredCount < totalQ}
            sx={{ px: 2.5, background: `linear-gradient(135deg, ${GOLD} 0%, ${SAND} 100%)`, color: '#1a1a2e', '&:disabled': { opacity: 0.4 } }}>
            Submit
          </Button>
        )}
      </Box>

      {answeredCount < totalQ && current === totalQ - 1 && (
        <Typography sx={{ textAlign: 'center', color: STEEL, fontSize: '0.78rem', mt: 1.5 }}>
          {totalQ - answeredCount} question{totalQ - answeredCount > 1 ? 's' : ''} remaining
        </Typography>
      )}
    </Box>
  );
}