import { useState, useLayoutEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../lib/api';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Zap,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Beaker,
  AlertCircle,
  UploadCloud,
  FileText,
  X,
  Building2,
  Loader2,
  KeyRound,
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

// ── Custom Input Field ─────────────────────────────────────────────────────
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

// ── Custom File Upload Box ─────────────────────────────────────────────────
const UploadBox = ({ label, required, type, uploading, error, fileUrl, fileName, onUpload, onRemove }) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider font-syne ml-1">
      {label} {required && <span className="text-rose-400">*</span>}
    </label>
    
    {!fileUrl ? (
      <div className={`relative w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all ${error ? 'border-rose-500/50 bg-rose-500/5 text-rose-400' : 'border-border-subtle hover:border-amber-500/50 bg-bg-surface/50 text-text-secondary'}`}>
        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => onUpload(e, type)} disabled={uploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" />
        {uploading ? (
           <div className="flex flex-col items-center gap-2">
             <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
             <span className="text-sm font-bold text-amber-400">Uploading...</span>
           </div>
        ) : (
           <div className="flex flex-col items-center gap-2 pointer-events-none text-center">
             <UploadCloud className="w-8 h-8 opacity-50" />
             <span className="text-sm font-bold">Click to upload or drag & drop</span>
             <span className="text-xs opacity-70">PDF, JPG, PNG (Max 5MB)</span>
           </div>
        )}
      </div>
    ) : (
      <div className="w-full bg-bg-surface/50 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
         <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
             <FileText className="w-5 h-5 text-emerald-400" />
           </div>
           <div>
             <p className="text-sm font-bold text-text-primary line-clamp-1">{fileName || 'Document uploaded'}</p>
             <div className="flex items-center gap-1 mt-0.5">
               <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
               <span className="text-xs text-emerald-400 font-bold">Uploaded successfully</span>
             </div>
           </div>
         </div>
         <button type="button" onClick={() => onRemove(type)} className="p-2 text-text-muted hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
           <X className="w-4 h-4" />
         </button>
      </div>
    )}
    {error && <span className="text-xs text-rose-400 font-bold ml-1">{error}</span>}
  </div>
);

// ── Join Code Step (shared by Student + Instructor signup) ─────────────────
function JoinCodeStep({ isStudent, joinCode, setJoinCode, university, setUniversity, onSkip, onVerified }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = useCallback(async () => {
    if (!joinCode.trim()) { setError('Please enter a join code'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.get(`/auth/university/lookup?joinCode=${joinCode.trim().toUpperCase()}`);
      setUniversity(res.data);
      onVerified(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid join code. Please check with your university admin.');
      setUniversity(null);
    } finally {
      setLoading(false);
    }
  }, [joinCode, setUniversity, onVerified]);

  const accentGradient = isStudent
    ? 'from-primary-600 to-indigo-600'
    : 'from-amber-500 to-rose-400';

  return (
    <div className="animate-fade-in-up flex flex-col gap-6">
      {/* Info Card */}
      <div className="bg-bg-base border border-border-subtle rounded-2xl p-5 flex gap-4">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accentGradient} flex items-center justify-center shrink-0 mt-0.5`}>
          <KeyRound className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-text-primary mb-1">University Registration</p>
          <p className="text-xs text-text-secondary leading-relaxed">
            If your university uses EduForge, enter the join code provided by your university admin to link your account automatically. Otherwise, skip this step.
          </p>
        </div>
      </div>

      {/* Join Code Input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider font-syne ml-1">
          University Join Code
        </label>
        <div className="flex gap-2">
          <input
            id="join-code-input"
            type="text"
            value={joinCode}
            onChange={e => { setJoinCode(e.target.value.toUpperCase()); setUniversity(null); setError(''); }}
            placeholder="e.g. UNI-A3K7X"
            maxLength={10}
            className="flex-1 h-12 bg-bg-surface/50 border border-border-subtle rounded-xl px-4 text-sm font-mono text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all placeholder:text-text-secondary/50 tracking-widest"
          />
          <button
            type="button"
            onClick={handleVerify}
            disabled={loading || !joinCode.trim()}
            className={`h-12 px-5 bg-gradient-to-r ${accentGradient} text-white rounded-xl font-bold text-sm shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2 mt-1">
            <AlertCircle className="w-4 h-4 shrink-0" /> <span>{error}</span>
          </div>
        )}

        {/* Success — university verified */}
        {university && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2 mt-1">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <div>
              <span className="font-bold">{university.name}</span>
              <span className="text-emerald-400/70 ml-2">· {university.branches?.length || 0} branches found</span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => university && onVerified(university)}
          disabled={!university}
          className={`w-full h-12 bg-gradient-to-r ${accentGradient} text-white rounded-xl font-bold shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
        >
          Continue with {university?.name || 'University'} <ArrowRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="w-full h-12 bg-bg-base border border-border-subtle text-text-secondary rounded-xl font-bold hover:text-text-primary hover:bg-bg-elevated transition-colors"
        >
          Skip — I'm registering independently
        </button>
      </div>
    </div>
  );
}

// ── Unified Split Layout Container ─────────────────────────────────────────
function AuthLayout({ children, title, subtitle, isStudent = true }) {
  useLayoutEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="min-h-screen w-full flex bg-bg-base overflow-hidden selection:bg-primary-500/30">

      {/* LEFT PANEL */}
      <div className={`hidden lg:flex lg:w-[45%] xl:w-1/2 flex-col justify-between p-12 relative overflow-hidden bg-gradient-to-br ${isStudent ? 'from-bg-surface to-bg-base' : 'from-bg-surface to-bg-elevated'}`}>

        <div className="absolute inset-0 z-0">
          <div className={`absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-30 blur-[100px] pointer-events-none ${isStudent ? 'bg-primary-600/40' : 'bg-amber-600/30'}`} />
          <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-20 blur-[100px] pointer-events-none ${isStudent ? 'bg-teal-600/40' : 'bg-indigo-600/30'}`} />
        </div>

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${isStudent ? 'bg-gradient-to-br from-primary-500 to-teal-400 shadow-primary-500/20' : 'bg-gradient-to-br from-amber-500 to-rose-400 shadow-amber-500/20'}`}>
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-syne font-bold text-xl tracking-tight text-white">EduForge</span>
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

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-[55%] xl:w-1/2 flex items-center justify-center p-6 sm:p-12 h-screen overflow-y-auto relative no-scrollbar">
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

// ── Step Progress Indicator ────────────────────────────────────────────────
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

// ─── StudentLogin ────────────────────────────────────────────────────────────
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
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) navigate('/student');
    else setError(result.error || 'Invalid email or password');
  };

  return (
    <AuthLayout title="Welcome Back!" subtitle="Sign in to continue your learning journey" isStudent>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        <InputField
          label="Email Address" type="email" required autoFocus
          value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="arjun@student.com"
        />

        <InputField
          label="Password" type={showPass ? 'text' : 'password'} required
          value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••"
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
          type="submit" disabled={loading}
          className="w-full h-12 mt-2 bg-gradient-to-r from-primary-600 to-indigo-600 hover:to-indigo-500 text-white rounded-xl font-bold tracking-wide shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sign In'}
        </button>

        <button
          type="button"
          onClick={() => setForm({ email: 'john@example.com', password: 'password123' })}
          className="w-full h-12 bg-bg-base border border-border-subtle text-text-primary rounded-xl font-bold tracking-wide hover:bg-bg-elevated transition-colors flex items-center justify-center gap-2"
        >
          <Beaker className="w-4 h-4 text-teal-400" />
          Use Demo Account
        </button>

        <div className="mt-4 pt-5 border-t border-border-subtle/50 text-center text-sm text-text-secondary flex flex-col gap-2">
          <p>Don't have an account?{' '}<Link to="/student/signup" className="text-primary-400 font-bold hover:underline">Sign Up Free</Link></p>
          <p>Are you an instructor?{' '}<Link to="/instructor/login" className="text-amber-400 font-bold hover:underline">Instructor Login</Link></p>
        </div>
      </form>
    </AuthLayout>
  );
}

// ─── StudentSignup ────────────────────────────────────────────────────────────
export function StudentSignupPage() {
  // step 1 = join code, step 2 = account details, step 3 = profile
  const [step, setStep] = useState(1);
  const [joinCode, setJoinCode] = useState('');
  const [university, setUniversity] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', year: '', bio: '', interests: [] });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const toggleInterest = (key) => {
    setForm(p => ({ ...p, interests: p.interests.includes(key) ? p.interests.filter(i => i !== key) : [...p.interests, key] }));
  };

  const step2Valid = form.name && form.email && form.password.length >= 6;
  const step3Valid = form.interests.length > 0;

  const handleSubmit = async () => {
    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      yearOfStudy: form.year,
      bio: form.bio,
      interests: form.interests,
      joinCode: university ? joinCode : undefined,
      sectionId: selectedSection?.id || undefined,
    };
    const result = await signup(payload, 'student');
    if (result.success) navigate('/student');
    else setError(result.error || 'Signup failed');
  };

  // All sections flat from all branches
  const allSections = university?.branches?.flatMap(b => b.sections || []) || [];

  return (
    <AuthLayout
      title="Join as Student"
      subtitle={step === 1 ? 'Step 1: University Setup' : step === 2 ? 'Step 2: Account Details' : 'Step 3: Profile Settings'}
      isStudent
    >
      <StepProgress step={step} total={3} isStudent />

      {/* ── Step 1: Join Code ── */}
      {step === 1 && (
        <JoinCodeStep
          isStudent
          joinCode={joinCode}
          setJoinCode={setJoinCode}
          university={university}
          setUniversity={setUniversity}
          onSkip={() => setStep(2)}
          onVerified={() => setStep(2)}
        />
      )}

      {/* ── Step 2: Account Details ── */}
      {step === 2 && (
        <div className="animate-fade-in-up flex flex-col gap-5">

          {/* University banner */}
          {university && (
            <div className="flex items-center gap-3 px-4 py-3 bg-primary-500/10 border border-primary-500/20 rounded-xl">
              <Building2 className="w-4 h-4 text-primary-400 shrink-0" />
              <span className="text-sm font-bold text-primary-300">{university.name}</span>
            </div>
          )}

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

          <div className="flex gap-3 mt-2">
            <button onClick={() => setStep(1)} className="px-5 py-3 rounded-xl border border-border-subtle hover:bg-bg-base flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              disabled={!step2Valid} onClick={() => step2Valid && setStep(3)}
              className="flex-1 h-12 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-center text-sm text-text-secondary">
            Already have an account? <Link to="/student/login" className="text-primary-400 font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      )}

      {/* ── Step 3: Profile ── */}
      {step === 3 && (
        <div className="animate-fade-in flex flex-col gap-5">

          {/* Section selector — only if university was chosen */}
          {university && allSections.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider font-syne ml-1">
                Your Section <span className="text-text-muted font-normal normal-case">(optional)</span>
              </label>
              <select
                id="section-select"
                value={selectedSection?.id || ''}
                onChange={e => {
                  const sec = allSections.find(s => s.id === e.target.value);
                  setSelectedSection(sec || null);
                }}
                className="w-full h-12 bg-bg-surface/50 border border-border-subtle rounded-xl px-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all appearance-none"
              >
                <option value="">Select your section</option>
                {university.branches?.map(branch => (
                  <optgroup key={branch.id} label={branch.name}>
                    {(branch.sections || []).map(sec => (
                      <option key={sec.id} value={sec.id} className="bg-bg-elevated">
                        {sec.year} — {sec.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider font-syne ml-1">Year of Study</label>
            <select
              value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))}
              className="w-full h-12 bg-bg-surface/50 border border-border-subtle rounded-xl px-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all appearance-none"
            >
              <option value="" disabled hidden>Select Year</option>
              {years.map(y => <option key={y} value={y} className="bg-bg-elevated">{y}</option>)}
            </select>
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
                    key={int.key} type="button" onClick={() => toggleInterest(int.key)}
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
            <button onClick={() => setStep(2)} className="px-5 py-3 rounded-xl border border-border-subtle hover:bg-bg-base flex items-center justify-center text-text-secondary">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              disabled={!step3Valid} onClick={handleSubmit}
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

// ─── InstructorLogin ──────────────────────────────────────────────────────────
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
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) navigate('/instructor');
    else setError(result.error || 'Invalid email or password');
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
          type="button" onClick={() => setForm({ email: 'smith@example.com', password: 'password123' })}
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

// ─── InstructorSignup ─────────────────────────────────────────────────────────
export function InstructorSignupPage() {
  // step 1 = join code, step 2 = account details, step 3 = expertise, step 4 = certificates
  const [step, setStep] = useState(1);
  const [joinCode, setJoinCode] = useState('');
  const [university, setUniversity] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    qualification: '', experience: '', specialization: '', bio: '',
    ugCertificateUrl: '', pgCertificateUrl: '', phdCertificateUrl: ''
  });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState({ ug: false, pg: false, phd: false });
  const [uploadErrors, setUploadErrors] = useState({ ug: '', pg: '', phd: '' });
  const [files, setFiles] = useState({ ug: null, pg: null, phd: null });
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setUploadErrors(p => ({ ...p, [type]: 'Invalid file type. Only PDF, JPG, PNG allowed.' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadErrors(p => ({ ...p, [type]: 'File too large. Maximum size is 5MB.' }));
      return;
    }

    setUploadErrors(p => ({ ...p, [type]: '' }));
    setUploading(p => ({ ...p, [type]: true }));

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'capstone/certificates');

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setForm(p => ({ ...p, [`${type}CertificateUrl`]: data.secure_url }));
      setFiles(p => ({ ...p, [type]: file.name }));
    } catch {
      setUploadErrors(p => ({ ...p, [type]: 'Upload failed. Please try again.' }));
    } finally {
      setUploading(p => ({ ...p, [type]: false }));
    }
  };

  const handleRemove = (type) => {
    setForm(p => ({ ...p, [`${type}CertificateUrl`]: '' }));
    setFiles(p => ({ ...p, [type]: null }));
    setUploadErrors(p => ({ ...p, [type]: '' }));
  };

  const step2Valid = form.name && form.email && form.password.length >= 6;
  const step3Valid = form.qualification && form.experience && form.specialization;
  const step4Valid = !!form.ugCertificateUrl;

  const handleSubmit = async () => {
    if (!step4Valid) { setError('UG Certificate is required.'); return; }
    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      qualification: form.qualification,
      experience: form.experience,
      specialization: form.specialization,
      bio: form.bio,
      ugCertificateUrl: form.ugCertificateUrl,
      pgCertificateUrl: form.pgCertificateUrl,
      phdCertificateUrl: form.phdCertificateUrl,
      joinCode: university ? joinCode : undefined,
      branchId: selectedBranch?.id || undefined,
    };
    const result = await signup(payload, 'instructor');
    if (result.success) navigate('/instructor');
    else setError(result.error || 'Signup failed');
  };

  const stepLabels = ['University Setup', 'Account Details', 'Your Expertise', 'Certificates'];

  return (
    <AuthLayout title="Become an Instructor" subtitle={`Step ${step} of 4: ${stepLabels[step - 1]}`} isStudent={false}>
      <StepProgress step={step} total={4} isStudent={false} />

      {/* ── Step 1: Join Code ── */}
      {step === 1 && (
        <JoinCodeStep
          isStudent={false}
          joinCode={joinCode}
          setJoinCode={setJoinCode}
          university={university}
          setUniversity={setUniversity}
          onSkip={() => setStep(2)}
          onVerified={() => setStep(2)}
        />
      )}

      {/* ── Step 2: Account Details ── */}
      {step === 2 && (
        <div className="animate-fade-in-up flex flex-col gap-5">
          {university && (
            <div className="flex items-center gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-sm font-bold text-amber-300">{university.name}</span>
            </div>
          )}
          <InputField label="Full Name" required autoFocus value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Dr. Ramesh Kumar" />
          <InputField label="Email Address" type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="ramesh@example.com" />
          <InputField
            label="Password (min 6 chars)" type={showPass ? 'text' : 'password'} required
            value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••"
            endAdornment={
              <button onClick={() => setShowPass(!showPass)} className="text-text-muted hover:text-text-primary p-1">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
          <div className="flex gap-3 mt-2">
            <button onClick={() => setStep(1)} className="px-5 py-3 rounded-xl border border-border-subtle hover:bg-bg-base flex items-center justify-center text-text-secondary"><ArrowLeft className="w-5 h-5" /></button>
            <button
              disabled={!step2Valid} onClick={() => step2Valid && setStep(3)}
              className="flex-1 h-12 bg-gradient-to-r from-amber-500 to-rose-400 text-white rounded-xl font-bold shadow-lg shadow-amber-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <p className="text-center text-sm text-text-secondary">Already registered? <Link to="/instructor/login" className="text-amber-400 font-bold hover:underline">Sign In</Link></p>
        </div>
      )}

      {/* ── Step 3: Expertise + Branch ── */}
      {step === 3 && (
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

          {/* Branch selector for university instructors */}
          {university && university.branches?.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider font-syne ml-1">
                Your Branch <span className="text-text-muted font-normal normal-case">(optional)</span>
              </label>
              <select
                id="branch-select"
                value={selectedBranch?.id || ''}
                onChange={e => {
                  const br = university.branches.find(b => b.id === e.target.value);
                  setSelectedBranch(br || null);
                }}
                className="w-full h-12 bg-bg-surface/50 border border-border-subtle rounded-xl px-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all appearance-none"
              >
                <option value="">Select your branch</option>
                {university.branches.map(b => (
                  <option key={b.id} value={b.id} className="bg-bg-elevated">{b.name}</option>
                ))}
              </select>
            </div>
          )}

          <InputField label="Bio (Optional)" multiline value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="Tell students about your expertise..." />

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 mt-2">
            <button onClick={() => setStep(2)} className="px-5 py-3 rounded-xl border border-border-subtle hover:bg-bg-base flex items-center justify-center text-text-secondary"><ArrowLeft className="w-5 h-5" /></button>
            <button
              disabled={!step3Valid} onClick={() => step3Valid && setStep(4)}
              className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-rose-400 text-white rounded-xl font-bold shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Step 4: Certificates ── */}
      {step === 4 && (
        <div className="animate-fade-in flex flex-col gap-5">
          <div className="text-sm text-text-secondary mb-2">Upload your professional certificates to verify your expertise.</div>

          <UploadBox label="Undergraduate Certificate" required type="ug" uploading={uploading.ug} error={uploadErrors.ug} fileUrl={form.ugCertificateUrl} fileName={files.ug} onUpload={handleUpload} onRemove={handleRemove} />
          <UploadBox label="Postgraduate Certificate" type="pg" uploading={uploading.pg} error={uploadErrors.pg} fileUrl={form.pgCertificateUrl} fileName={files.pg} onUpload={handleUpload} onRemove={handleRemove} />

          {form.qualification.toLowerCase().includes('phd') && (
            <UploadBox label="PhD Certificate" type="phd" uploading={uploading.phd} error={uploadErrors.phd} fileUrl={form.phdCertificateUrl} fileName={files.phd} onUpload={handleUpload} onRemove={handleRemove} />
          )}

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button onClick={() => setStep(3)} className="px-5 py-3 rounded-xl border border-border-subtle hover:bg-bg-base flex items-center justify-center text-text-secondary"><ArrowLeft className="w-5 h-5" /></button>
            <button
              disabled={!step4Valid} onClick={handleSubmit}
              className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-rose-400 text-white rounded-xl font-bold shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              🎓 Join as Instructor!
            </button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}