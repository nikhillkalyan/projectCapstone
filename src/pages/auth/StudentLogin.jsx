import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Zap, Eye, EyeOff } from 'lucide-react';

export default function StudentLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const result = login(form.email, form.password, 'student');
    if (result.success) navigate('/student');
    else setError('Invalid email or password');
  };

  const fillDemo = () => setForm({ email: 'arjun@student.com', password: 'password123' });

  return (
    <div className="min-h-screen hero-gradient grid-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-scaleIn">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6B7FD4, #4ECDC4)' }}>
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-2xl font-black gradient-text" style={{ fontFamily: 'Syne' }}>EduForge</span>
          </Link>
          <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>Welcome Back!</h1>
          <p style={{ color: 'var(--steel)' }}>Sign in to continue your learning journey</p>
        </div>

        <div className="glass rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--sand)' }}>Email Address</label>
              <input className="input-field" type="email" placeholder="arjun@student.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
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

            <button type="button" onClick={fillDemo} className="btn-outline w-full py-3 rounded-2xl text-sm">
              🧪 Use Demo Account
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--steel)' }}>
            Don't have an account?{' '}
            <Link to="/student/signup" className="font-semibold" style={{ color: 'var(--accent-light)' }}>Sign Up Free</Link>
          </p>
          <p className="text-center text-sm mt-2" style={{ color: 'var(--steel)' }}>
            Are you an instructor?{' '}
            <Link to="/instructor/login" className="font-semibold" style={{ color: 'var(--accent-light)' }}>Instructor Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}