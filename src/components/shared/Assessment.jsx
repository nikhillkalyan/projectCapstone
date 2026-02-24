import { useState } from 'react';
import { CheckCircle, XCircle, Award, ChevronRight, RefreshCw } from 'lucide-react';

export default function Assessment({ assessment, onComplete, onClose }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [current, setCurrent] = useState(0);

  const questions = assessment.questions;
  const totalQ = questions.length;

  const selectAnswer = (qIdx, optIdx) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correct) correct++;
    });
    const pct = Math.round((correct / totalQ) * 100);
    setScore(pct);
    setSubmitted(true);
    onComplete(pct, answers, questions);
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(null);
    setCurrent(0);
  };

  const answeredCount = Object.keys(answers).length;
  const currentQ = questions[current];

  if (submitted) {
    return (
      <div className="animate-scaleIn text-center p-8">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl`}
          style={{ background: score >= 70 ? 'rgba(78, 205, 196, 0.2)' : 'rgba(231, 76, 111, 0.2)', border: `2px solid ${score >= 70 ? '#4ECDC4' : '#E74C6F'}` }}>
          {score >= 70 ? '🎉' : '📚'}
        </div>
        
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>
          {score >= 70 ? 'Great Job!' : 'Keep Practicing!'}
        </h2>
        <p className="mb-6" style={{ color: 'var(--steel)' }}>
          You scored <span className="text-2xl font-bold" style={{ color: score >= 70 ? '#4ECDC4' : '#E74C6F' }}>{score}%</span>
          {' '}({Math.round(score * totalQ / 100)}/{totalQ} correct)
        </p>

        {/* Answer review */}
        <div className="text-left space-y-3 mb-8 max-h-64 overflow-y-auto">
          {questions.map((q, i) => {
            const isCorrect = answers[i] === q.correct;
            return (
              <div key={i} className="p-3 rounded-xl text-sm" style={{ 
                background: isCorrect ? 'rgba(78, 205, 196, 0.1)' : 'rgba(231, 76, 111, 0.1)',
                border: `1px solid ${isCorrect ? 'rgba(78, 205, 196, 0.3)' : 'rgba(231, 76, 111, 0.3)'}`
              }}>
                <div className="flex items-start gap-2">
                  {isCorrect ? <CheckCircle size={16} className="text-green-400 flex-shrink-0 mt-0.5" /> : <XCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />}
                  <div>
                    <p style={{ color: 'var(--cream)' }}>{q.question}</p>
                    {!isCorrect && <p className="text-xs mt-1" style={{ color: '#4ECDC4' }}>✓ {q.options[q.correct]}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button onClick={handleReset} className="btn-outline flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm">
            <RefreshCw size={16} /> Try Again
          </button>
          <button onClick={onClose} className="btn-primary flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm">
            Continue <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm" style={{ color: 'var(--steel)' }}>Question {current + 1} of {totalQ}</span>
        <span className="text-sm" style={{ color: 'var(--accent-light)' }}>{answeredCount}/{totalQ} answered</span>
      </div>
      
      <div className="progress-bar mb-6">
        <div className="progress-fill" style={{ width: `${((current + 1) / totalQ) * 100}%` }} />
      </div>

      {/* Question */}
      <div className="mb-6 p-5 rounded-2xl" style={{ background: 'rgba(48, 54, 79, 0.4)', border: '1px solid rgba(172, 186, 196, 0.15)' }}>
        <p className="text-lg font-semibold leading-relaxed" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>
          {currentQ.question}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-8">
        {currentQ.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => selectAnswer(current, i)}
            className={`quiz-option w-full text-left transition-all duration-200 ${answers[current] === i ? 'selected' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-200`}
                style={{ 
                  background: answers[current] === i ? 'var(--accent)' : 'rgba(172, 186, 196, 0.1)',
                  color: answers[current] === i ? 'white' : 'var(--steel)',
                  fontFamily: 'Syne'
                }}>
                {String.fromCharCode(65 + i)}
              </div>
              <span style={{ color: 'var(--cream)' }}>{opt}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrent(c => Math.max(0, c - 1))}
          disabled={current === 0}
          className="btn-outline px-5 py-2.5 rounded-xl text-sm disabled:opacity-30"
        >
          ← Previous
        </button>

        <div className="flex gap-2">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="w-2 h-2 rounded-full transition-all duration-200"
              style={{ background: i === current ? 'var(--accent)' : answers[i] !== undefined ? 'var(--success)' : 'rgba(172, 186, 196, 0.3)' }}
            />
          ))}
        </div>

        {current < totalQ - 1 ? (
          <button
            onClick={() => setCurrent(c => Math.min(totalQ - 1, c + 1))}
            className="btn-primary px-5 py-2.5 rounded-xl text-sm"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={answeredCount < totalQ}
            className="btn-sand px-5 py-2.5 rounded-xl text-sm disabled:opacity-40"
          >
            <Award size={15} className="inline mr-1" />
            Submit
          </button>
        )}
      </div>

      {answeredCount < totalQ && current === totalQ - 1 && (
        <p className="text-center text-xs mt-3" style={{ color: 'var(--steel)' }}>
          Please answer all {totalQ - answeredCount} remaining question{totalQ - answeredCount > 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}