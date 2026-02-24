import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Zap, Eye, EyeOff } from 'lucide-react';

export function InstructorLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = login(form.email, form.password, 'instructor');
    if (result.success) navigate('/instructor');
    else setError('Invalid email or password');
  };

  const fillDemo = () => setForm({ email: 'ramesh@instructor.com', password: 'password123' });

  return (
    <div className="min-h-screen hero-gradient grid-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-scaleIn">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D4A843, #E1D9BC)' }}>
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-2xl font-black gradient-text" style={{ fontFamily: 'Syne' }}>EduForge</span>
          </Link>
          <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>Instructor Portal</h1>
          <p style={{ color: 'var(--steel)' }}>Welcome back, educator!</p>
        </div>

        <div className="glass rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--sand)' }}>Email Address</label>
              <input className="input-field" type="email" placeholder="instructor@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div>
              <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--sand)' }}>Password</label>
              <div className="relative">
                <input className="input-field pr-12" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--steel)' }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <div className="p-3 rounded-xl text-sm text-red-400" style={{ background: 'rgba(231, 76, 111, 0.1)', border: '1px solid rgba(231, 76, 111, 0.3)' }}>{error}</div>}

            <button type="submit" className="btn-sand w-full py-4 rounded-2xl text-base font-bold">Sign In</button>
            <button type="button" onClick={fillDemo} className="btn-outline w-full py-3 rounded-2xl text-sm">🧪 Use Demo Account</button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--steel)' }}>
            New instructor?{' '}
            <Link to="/instructor/signup" className="font-semibold" style={{ color: 'var(--accent-light)' }}>Sign Up</Link>
          </p>
          <p className="text-center text-sm mt-2" style={{ color: 'var(--steel)' }}>
            Are you a student?{' '}
            <Link to="/student/login" className="font-semibold" style={{ color: 'var(--accent-light)' }}>Student Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function InstructorSignup() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', qualification: '', experience: '', specialization: '', bio: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const specializations = ['AIML', 'Cloud', 'DataScience', 'Cybersecurity'];
  const step1Valid = form.name && form.email && form.password.length >= 6;
  const step2Valid = form.qualification && form.experience && form.specialization;

  const handleSubmit = () => {
    const result = signup(form, 'instructor');
    if (result.success) navigate('/instructor');
    else setError(result.error);
  };

  return (
    <div className="min-h-screen hero-gradient grid-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg animate-scaleIn">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D4A843, #E1D9BC)' }}>
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-2xl font-black gradient-text" style={{ fontFamily: 'Syne' }}>EduForge</span>
          </Link>
          <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>Become an Instructor</h1>
          <p style={{ color: 'var(--steel)' }}>Step {step} of 2</p>
        </div>

        <div className="flex gap-3 mb-8">
          {[1, 2].map(s => (
            <div key={s} className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(172, 186, 196, 0.2)' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: step >= s ? '100%' : '0%', background: 'linear-gradient(90deg, #D4A843, #E1D9BC)' }} />
            </div>
          ))}
        </div>

        <div className="glass rounded-3xl p-8">
          {step === 1 && (
            <div className="animate-fadeInUp space-y-5">
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--sand)' }}>Full Name *</label>
                <input className="input-field" placeholder="Dr. Ramesh Kumar" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--sand)' }}>Email *</label>
                <input className="input-field" type="email" placeholder="instructor@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--sand)' }}>Password * (min 6 chars)</label>
                <div className="relative">
                  <input className="input-field pr-12" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--steel)' }}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button onClick={() => step1Valid && setStep(2)} disabled={!step1Valid} className="btn-sand w-full py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40">
                Continue →
              </button>
              <p className="text-center text-sm" style={{ color: 'var(--steel)' }}>
                Already registered?{' '}
                <Link to="/instructor/login" className="font-semibold" style={{ color: 'var(--accent-light)' }}>Sign In</Link>
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fadeInUp space-y-5">
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--sand)' }}>Qualification *</label>
                <input className="input-field" placeholder="PhD in Computer Science, IIT Delhi" value={form.qualification} onChange={e => setForm(p => ({ ...p, qualification: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--sand)' }}>Experience *</label>
                <input className="input-field" placeholder="8 years as Cloud Architect at AWS" value={form.experience} onChange={e => setForm(p => ({ ...p, experience: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-semibold mb-3 block" style={{ color: 'var(--sand)' }}>Specialization *</label>
                <div className="grid grid-cols-2 gap-3">
                  {specializations.map(s => {
                    const icons = { AIML: '🤖', Cloud: '☁️', DataScience: '📊', Cybersecurity: '🔒' };
                    return (
                      <button key={s} onClick={() => setForm(p => ({ ...p, specialization: s }))}
                        className="p-3 rounded-2xl text-left transition-all duration-200"
                        style={{
                          background: form.specialization === s ? 'rgba(212, 168, 67, 0.2)' : 'rgba(48, 54, 79, 0.4)',
                          border: `1.5px solid ${form.specialization === s ? 'rgba(212, 168, 67, 0.5)' : 'rgba(172, 186, 196, 0.15)'}`
                        }}>
                        <div className="text-xl mb-1">{icons[s]}</div>
                        <div className="text-xs font-bold" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>{s}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--sand)' }}>Bio (optional)</label>
                <textarea className="input-field resize-none" rows={3} placeholder="Tell students about yourself..." value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-outline py-4 px-6 rounded-2xl">← Back</button>
                <button onClick={handleSubmit} disabled={!step2Valid} className="btn-sand flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40">
                  🎓 Join as Instructor!
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InstructorLogin;