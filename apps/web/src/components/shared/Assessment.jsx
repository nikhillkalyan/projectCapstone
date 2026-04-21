import { useState } from 'react';
import { 
  CheckCircle2, 
  XOctagon, 
  RotateCcw, 
  Trophy, 
  BookOpen, 
  ChevronRight, 
  ChevronLeft 
} from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';

function ScoreRing({ score }) {
  const isPass = score >= 70;
  const strokeColor = isPass ? '#22d3ee' : '#f87171';
  const circumference = 2 * Math.PI * 52; // r=52
  const strokeDashoffset = Math.max(0, circumference - (score / 100) * circumference);

  return (
    <div className="relative inline-flex items-center justify-center mb-6">
      <svg className="w-32 h-32 transform -rotate-90">
        <circle
          cx="64"
          cy="64"
          r="52"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-white/5"
        />
        <circle
          cx="64"
          cy="64"
          r="52"
          stroke={strokeColor}
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-syne font-bold text-2xl" style={{ color: strokeColor }}>
          {score}%
        </span>
      </div>
    </div>
  );
}

export default function Assessment({ assessment, onComplete, onClose }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [current, setCurrent] = useState(0);

  const questions = assessment?.questions || [];
  const totalQ = questions.length;
  const answeredCount = Object.keys(answers).length;

  if (totalQ === 0) {
    return (
      <div className="text-center py-10">
        <BookOpen className="w-16 h-16 text-text-tertiary mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-syne font-bold text-text-primary mb-2">No Questions Found</h3>
        <p className="text-text-secondary mb-8">This assessment does not have any questions configured.</p>
        <Button onClick={onClose} variant="secondary">
          Go Back
        </Button>
      </div>
    );
  }

  const currentQ = questions[current] || { question: '', options: [] };
  const passed = score >= 70;

  const selectAnswer = (qIdx, optIdx) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q, i) => { 
      const correctIdx = q.correctOptionIndex !== undefined ? q.correctOptionIndex : q.correct;
      if (answers[i] === correctIdx) correct++; 
    });
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
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
        <ScoreRing score={score} />
        
        <div className="mb-2 flex justify-center">
          {passed ? (
            <Trophy className="w-10 h-10 text-amber-400" />
          ) : (
            <BookOpen className="w-10 h-10 text-primary-400" />
          )}
        </div>
        
        <h3 className="font-syne font-bold text-2xl text-text-primary mb-1">
          {passed ? 'Excellent Work!' : 'Keep Practicing!'}
        </h3>
        <p className="text-text-secondary mb-6 font-medium">
          {Math.round(score * totalQ / 100)} / {totalQ} correct answers
        </p>

        {/* Review Scrollable Area */}
        <div className="text-left mb-8 max-h-[300px] overflow-y-auto hide-scrollbar space-y-3 pr-2">
          {questions.map((q, i) => {
            const correctIdx = q.correctOptionIndex !== undefined ? q.correctOptionIndex : q.correct;
            const isCorrect = answers[i] === correctIdx;
            const getOptText = (optObj) => typeof optObj === 'object' ? optObj?.optionText : optObj;
            
            return (
              <div 
                key={i} 
                className={`rounded-lg border p-4 ${isCorrect ? 'border-success-400/30 bg-success-500/10' : 'border-error-400/30 bg-error-500/10'}`}
              >
                <div className="flex gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-success-400" />
                    ) : (
                      <XOctagon className="w-5 h-5 text-error-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-text-primary text-sm font-medium mb-1.5">{q.questionText || q.question}</p>
                    <p className={`text-xs flex flex-col gap-1 ${isCorrect ? 'text-success-400' : 'text-error-400'}`}>
                      <span>Your answer: <strong className="font-bold">{getOptText(q.options?.[answers[i]]) || 'No answer'}</strong></span>
                      {!isCorrect && q.options?.[correctIdx] && (
                        <span className="text-success-400">Correct: <strong className="font-bold">{getOptText(q.options[correctIdx])}</strong></span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-4">
          <button 
            onClick={handleReset}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border-subtle py-3 font-bold text-text-secondary transition-all hover:bg-white/[0.06] hover:text-text-primary"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
          <button 
            onClick={onClose}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-3 font-bold transition-all ${passed ? 'bg-gradient-success text-bg-base' : 'bg-gradient-primary text-white shadow-glow'}`}
          >
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col">
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-text-secondary text-sm">
          Question <strong className="text-text-primary text-base">{current + 1}</strong> of {totalQ}
        </span>
        <div className="rounded-full border border-primary-400/20 bg-primary-500/10 px-3 py-1 text-xs font-bold text-primary-300">
          {answeredCount}/{totalQ} Answered
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-white/5">
        <div 
          className="h-full rounded-full bg-gradient-primary transition-all duration-300 ease-out"
          style={{ width: `${((current + 1) / totalQ) * 100}%` }}
        />
      </div>

      {/* Question Text */}
      <div className="glass-sm mb-6 rounded-lg p-6 shadow-inner">
        <h3 className="font-display text-lg font-bold leading-relaxed text-text-primary md:text-xl">
          {currentQ.questionText || currentQ.question}
        </h3>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-3 mb-8">
        {currentQ.options?.map((opt, i) => {
          const isSelected = answers[current] === i;
          return (
            <button
              key={i}
              onClick={() => selectAnswer(current, i)}
              className={`group flex cursor-pointer items-center gap-4 rounded-lg border p-4 text-left transition-all ${isSelected ? 'border-primary-400/50 bg-primary-500/12 shadow-glow' : 'border-border-subtle bg-white/[0.015] hover:border-primary-400/30 hover:bg-white/[0.04]'}`}
            >
              <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${isSelected ? 'bg-gradient-primary text-white' : 'bg-white/5 text-text-secondary group-hover:text-text-primary'}`}>
                <span className="font-display text-sm font-bold">
                  {String.fromCharCode(65 + i)}
                </span>
              </div>
              <span className={`text-sm ${isSelected ? 'text-text-primary font-medium' : 'text-text-secondary group-hover:text-text-primary'}`}>
                {typeof opt === 'object' ? opt.optionText : opt}
              </span>
            </button>
          );
        })}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between mt-auto">
        <button
          onClick={() => setCurrent(c => Math.max(0, c - 1))}
          disabled={current === 0}
          className="flex items-center gap-1.5 rounded-lg border border-transparent px-4 py-2.5 text-sm font-bold text-text-secondary transition-all hover:border-border-subtle hover:text-text-primary disabled:opacity-30 disabled:hover:border-transparent"
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>

        {/* Dot Indicators */}
        <div className="flex gap-1.5">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all cursor-pointer ${i === current ? 'w-6 bg-primary-500' : answers[i] !== undefined ? 'w-2 bg-primary-400/50' : 'w-2 bg-white/10 hover:bg-white/20'}`}
              aria-label={`Go to question ${i + 1}`}
            />
          ))}
        </div>

        {current < totalQ - 1 ? (
          <button
            onClick={() => setCurrent(c => Math.min(totalQ - 1, c + 1))}
            className="flex items-center gap-1.5 rounded-lg bg-white/10 px-6 py-2.5 text-sm font-bold text-text-primary transition-all hover:bg-white/20"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={answeredCount < totalQ}
            className="flex items-center gap-2 rounded-lg bg-gradient-warning px-6 py-2.5 text-sm font-bold text-bg-base shadow-glow transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
          >
            <Trophy className="w-4 h-4" /> Submit
          </button>
        )}
      </div>
    </motion.div>
  );
}
