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

function ScoreRing({ score }) {
  const isPass = score >= 70;
  const strokeColor = isPass ? '#2DD4BF' : '#FB7185'; // teal-400 or rose-400
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
        <button
          onClick={onClose}
          className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-text-primary font-bold rounded-xl transition-all cursor-pointer"
        >
          Go Back
        </button>
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
                className={`p-4 rounded-2xl border ${isCorrect ? 'bg-teal-500/10 border-teal-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}
              >
                <div className="flex gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-teal-400" />
                    ) : (
                      <XOctagon className="w-5 h-5 text-rose-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-text-primary text-sm font-medium mb-1.5">{q.questionText || q.question}</p>
                    <p className={`text-xs flex flex-col gap-1 ${isCorrect ? 'text-teal-300' : 'text-rose-300'}`}>
                      <span>Your answer: <strong className="font-bold">{getOptText(q.options?.[answers[i]]) || 'No answer'}</strong></span>
                      {!isCorrect && q.options?.[correctIdx] && (
                        <span className="text-teal-400">Correct: <strong className="font-bold">{getOptText(q.options[correctIdx])}</strong></span>
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
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-border-subtle hover:bg-white/5 text-text-secondary font-bold transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
          <button 
            onClick={onClose}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all cursor-pointer text-bg-base ${passed ? 'bg-teal-400 hover:bg-teal-500' : 'bg-primary-500 hover:bg-primary-600 text-white'}`}
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
        <div className="px-3 py-1 bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-bold rounded-full">
          {answeredCount}/{totalQ} Answered
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-6">
        <div 
          className="h-full bg-primary-500 transition-all duration-300 ease-out rounded-full"
          style={{ width: `${((current + 1) / totalQ) * 100}%` }}
        />
      </div>

      {/* Question Text */}
      <div className="p-6 rounded-3xl bg-bg-elevated border border-border-subtle mb-6 shadow-inner">
        <h3 className="font-syne font-bold text-lg md:text-xl text-text-primary leading-relaxed">
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
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left cursor-pointer group ${isSelected ? 'bg-primary-500/10 border-primary-500/50' : 'bg-transparent border-border-subtle hover:border-primary-500/30 hover:bg-white/[0.02]'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'bg-primary-500 text-white' : 'bg-white/5 text-text-secondary group-hover:text-text-primary'}`}>
                <span className="font-syne font-bold text-sm">
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
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-transparent hover:border-border-subtle disabled:opacity-30 disabled:hover:border-transparent text-text-secondary hover:text-text-primary transition-all font-bold text-sm cursor-pointer"
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
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-text-primary font-bold text-sm transition-all cursor-pointer"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={answeredCount < totalQ}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-warning to-[#E2D9BE] disabled:opacity-50 disabled:grayscale text-[#09090b] font-bold text-sm transition-all cursor-pointer shadow-lg hover:shadow-warning/20 transform active:scale-95"
          >
            <Trophy className="w-4 h-4" /> Submit
          </button>
        )}
      </div>
    </motion.div>
  );
}