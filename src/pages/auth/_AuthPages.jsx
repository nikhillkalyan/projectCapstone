import { useState, useLayoutEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Zap,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Beaker,
  AlertCircle
} from 'lucide-react';

const interestList = [
  { key: 'AIML', label: 'AI & Machine Learning', icon: '🤖', desc: 'Neural networks, deep learning, NLP', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  { key: 'Cloud', label: 'Cloud Computing', icon: '☁️', desc: 'AWS, Azure, GCP, DevOps', color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
  { key: 'DataScience', label: 'Data Science', icon: '📊', desc: 'Analytics, visualization, statistics', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { key: 'Cybersecurity', label: 'Cybersecurity', icon: '🔒', desc: 'Ethical hacking, network security', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
];

const specializationList = [
  { key: 'AIML', label: 'AI & ML', icon: '🤖', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  { key: 'Cloud', label: 'Cloud', icon: '☁️', color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
  { key: 'DataScience', label: 'Data Science', icon: '📊', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { key: 'Cybersecurity', label: 'Security', icon: '🔒', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
];

const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Post Graduate'];

// Custom Input Field Wrapper
const InputField = ({ label, type = "text", value, onChange, placeholder, required = false, endAdornment, multiline = false, autoFocus = false }) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider font-syne ml-1">
      {label} {required && <span className="text-rose-400">*</span>}
    </label>
    <div className="relative">
      {multiline ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={3}
          className="w-full bg-bg-surface/50 border border-border-subtle rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all resize-none placeholder:text-text-secondary/50"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoFocus={autoFocus}
          className="w-full h-12 bg-bg-surface/50 border border-border-subtle rounded-xl pl-4 pr-12 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all placeholder:text-text-secondary/50"
        />
      )}
      {endAdornment && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
          {endAdornment}
        </div>
      )}
    </div>
  </div>
);

// Unified Split Layout Container
function AuthLayout({ children, title, subtitle, isStudent = true }) {
  // Lock body scroll while in auth pages
  useLayoutEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="min-h-screen w-full flex bg-bg-base overflow-hidden selection:bg-primary-500/30">

      {/* LEFT PANEL - Decorative Info (Hidden on mobile) */}
      <div className={`hidden lg:flex lg:w-[45%] xl:w-1/2 flex-col justify-between p-12 relative overflow-hidden bg-gradient-to-br ${isStudent ? 'from-bg-surface to-bg-base' : 'from-bg-surface to-bg-elevated'}`}>

        {/* Background ambient glows */}
        <div className="absolute inset-0 z-0">
          <div className={`absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-30 blur-[100px] pointer-events-none transition-colors duration-1000 ${isStudent ? 'bg-primary-600/40' : 'bg-amber-600/30'}`} />
          <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-20 blur-[100px] pointer-events-none transition-colors duration-1000 ${isStudent ? 'bg-teal-600/40' : 'bg-indigo-600/30'}`} />
        </div>

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${isStudent ? 'bg-gradient-to-br from-primary-500 to-teal-400 shadow-primary-500/20' : 'bg-gradient-to-br from-amber-500 to-rose-400 shadow-amber-500/20'}`}>
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-syne font-bold text-xl tracking-tight text-white">
              EduForge
            </span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="font-syne font-extrabold text-4xl xl:text-5xl text-white mb-6 leading-tight">
            {isStudent ? "Master the tools defining tomorrow." : "Equip the next generation of builders."}
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed mb-12">
            {isStudent
              ? "Join thousands of students learning from elite industry professionals. Build real projects and earn certifications."
              : "Share your expertise with an eager community. Build courses, track progress, and shape careers."}
          </p>

          <div className="flex items-center gap-4 text-sm font-bold text-text-muted">
            <CheckCircle2 className={`w-5 h-5 ${isStudent ? 'text-teal-400' : 'text-amber-400'}`} />
            <span>Trusted by top universities & tech companies</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Actual Form Area */}
      <div className="w-full lg:w-[55%] xl:w-1/2 flex items-center justify-center p-6 sm:p-12 h-screen overflow-y-auto relative no-scrollbar">
        {/* The Glass Container */}
        <div className="w-full max-w-[480px] animate-fade-in-up">

          <div className="text-center lg:text-left mb-8">
            <h2 className="font-syne font-bold text-3xl text-white mb-2">{title}</h2>
            <p className="text-text-secondary">{subtitle}</p>
          </div>

          <div className="bg-bg-surface/50 border border-border-subtle rounded-[2rem] p-6 sm:p-8 md:p-10 shadow-2xl backdrop-blur-xl">
            {children}
          </div>

        </div>
      </div>
    </div>
  );
}

// Reusable Step Progress Indicator
function StepProgress({ step, total, isStudent }) {
  return (
    <div className="flex gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex-1 h-1.5 rounded-full bg-border-subtle overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isStudent ? 'bg-gradient-to-r from-primary-500 to-teal-400' : 'bg-gradient-to-r from-amber-500 to-rose-400'}`}
            style={{ width: step > i ? '100%' : '0%' }}
          />
        </div>
      ))}
    </div>
  );
}

// ─── StudentLogin ───────────────────────────────────────────────────────
export function StudentLoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const result = login(form.email, form.password, 'student');
    setLoading(false);
    if (result.success) navigate('/student');
    else setError('Invalid email or password. Try the demo account!');
  };

  return (
    <AuthLayout title="Welcome Back!" subtitle="Sign in to continue your learning journey" isStudent>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        <InputField
          label="Email Address"
          type="email"
          required
          autoFocus
          value={form.email}
          onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
          placeholder="arjun@student.com"
        />

        <InputField
          label="Password"
          type={showPass ? 'text' : 'password'}
          required
          value={form.password}
          onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
          placeholder="••••••••"
          endAdornment={
            <button type="button" onClick={() => setShowPass(!showPass)} className="text-text-muted hover:text-text-primary transition-colors p-1">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2 animate-fade-in-up">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 mt-2 bg-gradient-to-r from-primary-600 to-indigo-600 hover:to-indigo-500 text-white rounded-xl font-bold tracking-wide shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : 'Sign In'}
        </button>

        <button
          type="button"
          onClick={() => setForm({ email: 'arjun@student.com', password: 'password123' })}
          className="w-full h-12 bg-bg-base border border-border-subtle text-text-primary rounded-xl font-bold tracking-wide hover:bg-bg-elevated transition-colors flex items-center justify-center gap-2"
        >
          <Beaker className="w-4 h-4 text-teal-400" />
          Use Demo Account
        </button>

        <div className="mt-4 pt-5 border-t border-border-subtle/50 text-center text-sm text-text-secondary flex flex-col gap-2">
          <p>
            Don't have an account?{' '}
            <Link to="/student/signup" className="text-primary-400 font-bold hover:underline">Sign Up Free</Link>
          </p>
          <p>
            Are you an instructor?{' '}
            <Link to="/instructor/login" className="text-amber-400 font-bold hover:underline">Instructor Login</Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}

// ─── StudentSignup ───────────────────────────────────────────────────────
export function StudentSignupPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', college: '', year: '', bio: '', interests: [] });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const toggleInterest = (key) => {
    setForm(p => ({ ...p, interests: p.interests.includes(key) ? p.interests.filter(i => i !== key) : [...p.interests, key] }));
  };

  const step1Valid = form.name && form.email && form.password.length >= 6;
  const step2Valid = form.college && form.year && form.interests.length > 0;

  const handleSubmit = () => {
    const result = signup(form, 'student');
    if (result.success) navigate('/student');
    else setError(result.error);
  };

  return (
    <AuthLayout title="Join as Student" subtitle={step === 1 ? 'Step 1: Account Details' : 'Step 2: Profile Settings'} isStudent>
      <StepProgress step={step} total={2} isStudent />

      {step === 1 && (
        <div className="animate-fade-in-up flex flex-col gap-5">
          <InputField
            label="Full Name" required autoFocus
            value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Arjun Sharma"
          />
          <InputField
            label="Email Address" type="email" required
            value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="arjun@example.com"
          />
          <InputField
            label="Password (min 6 chars)" type={showPass ? 'text' : 'password'} required
            value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••"
            endAdornment={
              <button onClick={() => setShowPass(!showPass)} className="text-text-muted hover:text-text-primary p-1 transition-colors">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          <button
            disabled={!step1Valid} onClick={() => step1Valid && setStep(2)}
            className="w-full h-12 mt-2 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-center text-sm text-text-secondary mt-2">
            Already have an account? <Link to="/student/login" className="text-primary-400 font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in flex flex-col gap-5">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="College" required
              value={form.college} onChange={e => setForm(p => ({ ...p, college: e.target.value }))} placeholder="e.g. IIT Madras"
            />
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider font-syne ml-1">Year <span className="text-rose-400">*</span></label>
              <select
                value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))}
                className="w-full h-12 bg-bg-surface/50 border border-border-subtle rounded-xl px-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all appearance-none"
              >
                <option value="" disabled hidden>Select Year</option>
                {years.map(y => <option key={y} value={y} className="bg-bg-elevated">{y}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider font-syne ml-1 block mb-2">
              Interests <span className="text-rose-400">*</span> <span className="text-text-muted font-normal normal-case">(select all that apply)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {interestList.map(int => {
                const sel = form.interests.includes(int.key);
                return (
                  <button
                    key={int.key}
                    type="button"
                    onClick={() => toggleInterest(int.key)}
                    className={`relative p-3 rounded-xl border flex flex-col items-center text-center transition-all ${sel ? `${int.bg} ${int.border} ring-1 ring-inset ${int.color.replace('text-', 'ring-')}/50 transform -translate-y-0.5` : 'bg-bg-base border-border-subtle hover:border-border-strong text-text-secondary'}`}
                  >
                    {sel && <CheckCircle2 className={`absolute top-2 right-2 w-4 h-4 ${int.color}`} />}
                    <span className="text-3xl mb-1">{int.icon}</span>
                    <span className={`text-xs font-bold font-syne ${sel ? 'text-white' : 'text-text-primary'}`}>{int.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <InputField
            label="About You (Optional)" multiline
            value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="Tell us about your learning goals..."
          />

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-3 rounded-xl border border-border-subtle hover:bg-bg-base flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              disabled={!step2Valid} onClick={handleSubmit}
              className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-teal-500 text-white rounded-xl font-bold shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              🚀 Start Learning!
            </button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}

// ─── InstructorLogin ───────────────────────────────────────────────────────
export function InstructorLoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const result = login(form.email, form.password, 'instructor');
    setLoading(false);
    if (result.success) navigate('/instructor');
    else setError('Invalid email or password. Try the demo account!');
  };

  return (
    <AuthLayout title="Instructor Portal" subtitle="Welcome back, educator!" isStudent={false}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        <InputField
          label="Email Address" type="email" required autoFocus
          value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="instructor@example.com"
        />

        <InputField
          label="Password" type={showPass ? 'text' : 'password'} required
          value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••"
          endAdornment={
            <button type="button" onClick={() => setShowPass(!showPass)} className="text-text-muted hover:text-text-primary p-1">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
          </div>
        )}

        <button
          type="submit" disabled={loading}
          className="w-full h-12 mt-2 bg-gradient-to-r from-amber-500 to-rose-400 text-white rounded-xl font-bold tracking-wide shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sign In'}
        </button>

        <button
          type="button" onClick={() => setForm({ email: 'ramesh@instructor.com', password: 'password123' })}
          className="w-full h-12 bg-bg-base border border-border-subtle text-text-primary rounded-xl font-bold tracking-wide hover:bg-bg-elevated transition-colors flex items-center justify-center gap-2"
        >
          <Beaker className="w-4 h-4 text-amber-400" /> Use Demo Account
        </button>

        <div className="mt-4 pt-5 border-t border-border-subtle/50 text-center text-sm text-text-secondary flex flex-col gap-2">
          <p>New instructor? <Link to="/instructor/signup" className="text-amber-400 font-bold hover:underline">Sign Up</Link></p>
          <p>Are you a student? <Link to="/student/login" className="text-primary-400 font-bold hover:underline">Student Login</Link></p>
        </div>
      </form>
    </AuthLayout>
  );
}

// ─── InstructorSignup ───────────────────────────────────────────────────────
export function InstructorSignupPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', qualification: '', experience: '', specialization: '', bio: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const step1Valid = form.name && form.email && form.password.length >= 6;
  const step2Valid = form.qualification && form.experience && form.specialization;

  const handleSubmit = () => {
    const result = signup(form, 'instructor');
    if (result.success) navigate('/instructor');
    else setError(result.error);
  };

  return (
    <AuthLayout title="Become an Instructor" subtitle={`Step ${step} of 2`} isStudent={false}>
      <StepProgress step={step} total={2} isStudent={false} />

      {step === 1 && (
        <div className="animate-fade-in-up flex flex-col gap-5">
          <InputField label="Full Name" required autoFocus value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Dr. Ramesh Kumar" />
          <InputField label="Email Address" type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="ramesh@example.com" />
          <InputField label="Password (min 6 chars)" type={showPass ? 'text' : 'password'} required value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••"
            endAdornment={
              <button onClick={() => setShowPass(!showPass)} className="text-text-muted hover:text-text-primary p-1">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          <button
            disabled={!step1Valid} onClick={() => step1Valid && setStep(2)}
            className="w-full h-12 mt-2 bg-gradient-to-r from-amber-500 to-rose-400 text-white rounded-xl font-bold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-center text-sm text-text-secondary mt-2">
            Already registered? <Link to="/instructor/login" className="text-amber-400 font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in flex flex-col gap-5">
          <InputField label="Qualification" required value={form.qualification} onChange={e => setForm(p => ({ ...p, qualification: e.target.value }))} placeholder="e.g. PhD in Computer Science" />
          <InputField label="Experience" required value={form.experience} onChange={e => setForm(p => ({ ...p, experience: e.target.value }))} placeholder="e.g. 8 years as Cloud Architect" />

          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider font-syne ml-1 block mb-2">
              Primary Specialization <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {specializationList.map(s => {
                const sel = form.specialization === s.key;
                return (
                  <button
                    key={s.key} type="button" onClick={() => setForm(p => ({ ...p, specialization: s.key }))}
                    className={`p-3 rounded-xl border flex flex-col items-center transition-all ${sel ? `${s.bg} ${s.border} ring-1 ring-inset ${s.color.replace('text-', 'ring-')}/50 transform -translate-y-0.5` : 'bg-bg-base border-border-subtle hover:border-border-strong text-text-secondary'}`}
                  >
                    <span className="text-3xl mb-1">{s.icon}</span>
                    <span className={`text-xs font-bold font-syne ${sel ? 'text-white' : 'text-text-primary'}`}>{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <InputField label="Bio (Optional)" multiline value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="Tell students about your expertise..." />

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 mt-2">
            <button onClick={() => setStep(1)} className="px-5 py-3 rounded-xl border border-border-subtle hover:bg-bg-base flex items-center justify-center text-text-secondary">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              disabled={!step2Valid} onClick={handleSubmit}
              className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-rose-400 text-white rounded-xl font-bold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              🎓 Join as Instructor!
            </button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}