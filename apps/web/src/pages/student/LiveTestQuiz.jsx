import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Send,
  X,
  Zap,
} from 'lucide-react';
import api from '../../lib/api';

function Timer({ totalSeconds, onExpired }) {
  const [remaining, setRemaining] = useState(totalSeconds);

  useEffect(() => {
    if (remaining <= 0) {
      onExpired();
      return undefined;
    }

    const timerId = setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          clearInterval(timerId);
          onExpired();
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [onExpired, remaining]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const percentage = totalSeconds > 0 ? (remaining / totalSeconds) * 100 : 0;
  const urgent = remaining <= 60;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16">
        <svg className="-rotate-90 w-16 h-16">
          <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke={urgent ? '#ef4444' : '#6C7FD8'}
            strokeWidth="4"
            strokeDasharray={2 * Math.PI * 28}
            strokeDashoffset={2 * Math.PI * 28 * (1 - percentage / 100)}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-sm font-bold font-mono tabular-nums ${urgent ? 'text-red-400' : 'text-text-primary'}`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>
      {urgent && <span className="text-[10px] text-red-400 font-bold mt-1 animate-pulse">Hurry!</span>}
    </div>
  );
}

function ResultScreen({ result, onClose }) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200 }}
      className="flex flex-col items-center justify-center h-full text-center px-8 py-16"
    >
      <div className={`w-28 h-28 rounded-full flex items-center justify-center mb-6 border-4 ${
        result.passed
          ? 'bg-emerald-500/10 border-emerald-500/30'
          : 'bg-amber-500/10 border-amber-500/30'
      }`}>
        {result.passed
          ? <CheckCircle className="w-14 h-14 text-emerald-400" />
          : <AlertTriangle className="w-14 h-14 text-amber-400" />
        }
      </div>

      <h2 className="text-2xl font-bold font-syne text-text-primary mb-2">
        {result.passed ? 'Test Passed!' : 'Keep Going!'}
      </h2>
      <p className="text-text-secondary text-sm mb-8 max-w-xs">
        {result.passed
          ? 'Great work! Your score will feed into your Live Tests marks category.'
          : `You needed ${result.passingScore}% to pass. Your score has been recorded.`}
      </p>

      <div className={`text-6xl font-bold font-syne mb-2 ${result.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
        {result.score}%
      </div>
      <div className="text-sm text-text-muted mb-2">
        {result.correctAnswers} / {result.totalQuestions} correct
      </div>
      <div className="text-xs text-text-muted mb-10">
        Passing score: {result.passingScore}%
      </div>

      <button
        onClick={() => onClose(true)}
        className="px-10 py-3 bg-primary-500/10 border border-primary-500/20 text-primary-400 font-bold rounded-2xl hover:bg-primary-500/20 transition-all text-sm"
      >
        Back to Course
      </button>
    </motion.div>
  );
}

export default function LiveTestQuiz({ liveTest, onClose }) {
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [timeUp, setTimeUp] = useState(false);
  const [error, setError] = useState('');
  const submittedRef = useRef(false);

  const questions = liveTest?.questions || [];

  const handleSubmit = useCallback(async () => {
    if (!liveTest?.id || submittedRef.current) {
      return;
    }

    submittedRef.current = true;
    setSubmitting(true);
    setError('');

    try {
      const orderedAnswers = questions.map((_, index) => answers[index] ?? -1);
      const response = await api.post(`/live-tests/${liveTest.id}/submit`, { answers: orderedAnswers });
      setResult(response.data);
    } catch (submissionError) {
      setError(submissionError.response?.data?.message || 'Submission failed. Please try again.');
      submittedRef.current = false;
    } finally {
      setSubmitting(false);
    }
  }, [answers, liveTest, questions]);

  useEffect(() => {
    if (timeUp && !result) {
      handleSubmit();
    }
  }, [handleSubmit, result, timeUp]);

  if (!liveTest) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-bg-base z-50 flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-surface/80 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-text-primary">{liveTest.title}</div>
            <div className="text-xs text-text-muted">{questions.length} questions</div>
          </div>
        </div>

        {!result && (
          <Timer totalSeconds={(liveTest.durationMinutes || 30) * 60} onExpired={() => setTimeUp(true)} />
        )}

        <button
          onClick={() => onClose(false)}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-border-subtle text-text-muted hover:text-text-primary transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {result ? (
            <ResultScreen key="result" result={result} onClose={onClose} />
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-red-400" />
              <p className="text-text-secondary">{error}</p>
              <button onClick={() => onClose(false)} className="text-primary-400 text-sm hover:underline">Go back</button>
            </div>
          ) : questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
              <p className="text-text-secondary text-sm">No questions found for this live test.</p>
              <button onClick={() => onClose(false)} className="text-primary-400 text-sm hover:underline">Go back</button>
            </div>
          ) : (
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto w-full p-6 md:p-10 pb-32"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="flex-1 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-amber-400 tabular-nums shrink-0">
                  {currentQuestion + 1} / {questions.length}
                </span>
              </div>

              <div className="mb-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-4">
                  Question {currentQuestion + 1}
                </div>
                <h2 className="text-xl md:text-2xl font-bold font-syne text-text-primary leading-snug">
                  {questions[currentQuestion]?.questionText}
                </h2>
              </div>

              <div className="space-y-3">
                {questions[currentQuestion]?.options?.map((option, optionIndex) => {
                  const selected = answers[currentQuestion] === optionIndex;
                  return (
                    <motion.button
                      key={optionIndex}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setAnswers((current) => ({ ...current, [currentQuestion]: optionIndex }))}
                      className={`w-full text-left flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                        selected
                          ? 'bg-primary-500/10 border-primary-500/30 shadow-sm shadow-primary-500/10'
                          : 'bg-bg-surface border-border-subtle hover:border-border-strong hover:bg-bg-elevated/40'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                        selected ? 'bg-primary-500 text-white' : 'bg-bg-elevated text-text-muted'
                      }`}>
                        {String.fromCharCode(65 + optionIndex)}
                      </div>
                      <span className={`text-sm font-medium transition-colors ${selected ? 'text-text-primary' : 'text-text-secondary'}`}>
                        {option}
                      </span>
                      {selected && <CheckCircle className="w-4 h-4 text-primary-400 ml-auto shrink-0" />}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!result && questions.length > 0 && (
        <div className="flex-shrink-0 border-t border-border-subtle bg-bg-surface/80 backdrop-blur-md px-6 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
            <button
              onClick={() => setCurrentQuestion((index) => Math.max(0, index - 1))}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2 px-4 py-2.5 bg-bg-elevated border border-border-subtle text-text-secondary rounded-xl text-sm font-semibold hover:border-border-strong disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>

            <div className="flex items-center gap-1.5 overflow-x-auto max-w-xs">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-7 h-7 rounded-lg text-[10px] font-bold transition-all flex-shrink-0 ${
                    index === currentQuestion
                      ? 'bg-primary-500 text-white'
                      : answers[index] !== undefined
                        ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                        : 'bg-bg-elevated text-text-muted border border-border-subtle hover:border-border-strong'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestion((index) => index + 1)}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary-500/10 border border-primary-500/20 text-primary-400 rounded-xl text-sm font-bold hover:bg-primary-500/20 transition-all"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-amber-500/20"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
