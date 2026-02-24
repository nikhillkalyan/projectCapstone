import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Zap, ArrowRight, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';

const interests = [
  { key: 'AIML', label: 'AI & Machine Learning', icon: '🤖', desc: 'Neural networks, deep learning, NLP' },
  { key: 'Cloud', label: 'Cloud Computing', icon: '☁️', desc: 'AWS, Azure, GCP, DevOps' },
  { key: 'DataScience', label: 'Data Science', icon: '📊', desc: 'Analytics, visualization, statistics' },
  { key: 'Cybersecurity', label: 'Cybersecurity', icon: '🔒', desc: 'Ethical hacking, network security' },
];

const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Post Graduate'];

export default function StudentSignup() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', college: '', year: '', bio: '', interests: [] });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const toggleInterest = (key) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(key) ? prev.interests.filter(i => i !== key) : [...prev.interests, key]
    }));
  };

  const step1Valid = form.name && form.email && form.password.length >= 6;
  const step2Valid = form.college && form.year && form.interests.length > 0;

  const handleSubmit = () => {
    setError('');
    const result = signup(form, 'student');
    if (result.success) navigate('/student');
    else setError(result.error);
  };

  return (
    <div className="min-h-screen hero-gradient grid-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg animate-scaleIn">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6B7FD4, #4ECDC4)' }}>
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-2xl font-black gradient-text" style={{ fontFamily: 'Syne' }}>EduForge</span>
          </Link>
          <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>Join as Student</h1>
          <p style={{ color: 'var(--steel)' }}>Step {step} of 2 — {step === 1 ? 'Account Details' : 'Your Profile'}</p>
        </div>

        {/* Progress */}
        <div className="flex gap-3 mb-8">
          {[1, 2].map(s => (
            <div key={s} className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(172, 186, 196, 0.2)' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: step >= s ? '100%' : '0%', background: 'linear-gradient(90deg, #6B7FD4, #4ECDC4)' }} />
            </div>
          ))}
        </div>

        <div className="glass rounded-3xl p-8">
          {step === 1 && (
            <div className="animate-fadeInUp space-y-5">
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--sand)' }}>Full Name *</label>
                <input className="input-field" placeholder="Arjun Sharma" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--sand)' }}>Email Address *</label>
                <input className="input-field" type="email" placeholder="arjun@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--sand)' }}>Password * (min 6 chars)</label>
                <div className="relative">
                  <input className="input-field pr-12" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                  <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--steel)' }}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <button onClick={() => step1Valid && setStep(2)} disabled={!step1Valid} className="btn-sand w-full py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                Continue <ArrowRight size={18} />
              </button>

              <p className="text-center text-sm" style={{ color: 'var(--steel)' }}>
                Already have an account?{' '}
                <Link to="/student/login" className="font-semibold" style={{ color: 'var(--accent-light)' }}>Sign In</Link>
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fadeInUp space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--sand)' }}>College *</label>
                  <input className="input-field" placeholder="IIT Madras" value={form.college} onChange={e => setForm(p => ({ ...p, college: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--sand)' }}>Year *</label>
                  <select className="input-field" value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))} style={{ appearance: 'none' }}>
                    <option value="">Select Year</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold mb-3 block" style={{ color: 'var(--sand)' }}>
                  Interests * <span style={{ color: 'var(--steel)', fontWeight: 400 }}>(select all that apply)</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {interests.map(int => {
                    const selected = form.interests.includes(int.key);
                    return (
                      <button key={int.key} onClick={() => toggleInterest(int.key)}
                        className="p-3 rounded-2xl text-left transition-all duration-200 relative"
                        style={{
                          background: selected ? 'rgba(107, 127, 212, 0.2)' : 'rgba(48, 54, 79, 0.4)',
                          border: `1.5px solid ${selected ? 'rgba(107, 127, 212, 0.6)' : 'rgba(172, 186, 196, 0.15)'}`,
                          transform: selected ? 'scale(1.02)' : 'scale(1)'
                        }}>
                        {selected && <CheckCircle size={14} className="absolute top-2 right-2" style={{ color: 'var(--accent-light)' }} />}
                        <div className="text-xl mb-1">{int.icon}</div>
                        <div className="text-xs font-bold" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>{int.label}</div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--steel)' }}>{int.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--sand)' }}>About You (optional)</label>
                <textarea className="input-field resize-none" rows={3} placeholder="Tell us about your learning goals..." value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-outline py-4 px-6 rounded-2xl flex items-center gap-2">
                  <ArrowLeft size={18} /> Back
                </button>
                <button onClick={handleSubmit} disabled={!step2Valid} className="btn-sand flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                  🚀 Start Learning!
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}