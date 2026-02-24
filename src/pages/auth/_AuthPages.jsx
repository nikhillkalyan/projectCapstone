import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import { ACCENT, ACCENT2, TEAL, STEEL, CREAM, SAND, GOLD, NAVY, DANGER } from '../../theme';

const interestList = [
  { key: 'AIML', label: 'AI & Machine Learning', icon: '🤖', desc: 'Neural networks, deep learning, NLP', color: ACCENT2, bg: 'rgba(108,127,216,0.15)', border: 'rgba(108,127,216,0.4)' },
  { key: 'Cloud', label: 'Cloud Computing', icon: '☁️', desc: 'AWS, Azure, GCP, DevOps', color: TEAL, bg: 'rgba(78,205,196,0.15)', border: 'rgba(78,205,196,0.4)' },
  { key: 'DataScience', label: 'Data Science', icon: '📊', desc: 'Analytics, visualization, statistics', color: GOLD, bg: 'rgba(212,168,67,0.15)', border: 'rgba(212,168,67,0.4)' },
  { key: 'Cybersecurity', label: 'Cybersecurity', icon: '🔒', desc: 'Ethical hacking, network security', color: DANGER, bg: 'rgba(231,76,111,0.15)', border: 'rgba(231,76,111,0.4)' },
];

const specializationList = [
  { key: 'AIML', label: 'AI & ML', icon: '🤖', color: ACCENT2, bg: 'rgba(108,127,216,0.15)', border: 'rgba(108,127,216,0.4)' },
  { key: 'Cloud', label: 'Cloud', icon: '☁️', color: TEAL, bg: 'rgba(78,205,196,0.15)', border: 'rgba(78,205,196,0.4)' },
  { key: 'DataScience', label: 'Data Science', icon: '📊', color: GOLD, bg: 'rgba(212,168,67,0.15)', border: 'rgba(212,168,67,0.4)' },
  { key: 'Cybersecurity', label: 'Security', icon: '🔒', color: DANGER, bg: 'rgba(231,76,111,0.15)', border: 'rgba(231,76,111,0.4)' },
];

const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Post Graduate'];

function AuthLayout({ children, title, subtitle, isStudent = true }) {
  return (
    <Box className="hero-bg grid-bg" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, py: 4 }}>
      <Box sx={{ width: '100%', maxWidth: 480 }} className="anim-scaleIn">
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box component={Link} to="/" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, textDecoration: 'none', mb: 2.5 }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isStudent ? `linear-gradient(135deg, ${ACCENT} 0%, ${TEAL} 100%)` : `linear-gradient(135deg, ${GOLD} 0%, ${SAND} 100%)`,
            }}>
              <BoltRoundedIcon sx={{ color: isStudent ? '#fff' : NAVY, fontSize: 22 }} />
            </Box>
            <Typography className="gradient-text" sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '1.3rem' }}>EduForge</Typography>
          </Box>
          <Typography variant="h4" sx={{ color: CREAM, fontWeight: 800, mb: 0.7, fontSize: '1.7rem' }}>{title}</Typography>
          <Typography sx={{ color: STEEL, fontSize: '0.9rem' }}>{subtitle}</Typography>
        </Box>

        <Box sx={{ background: 'rgba(22,27,39,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(139,155,180,0.12)', borderRadius: 4, p: { xs: 3, sm: 4 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

function StepProgress({ step, total, isStudent }) {
  const color = isStudent ? ACCENT : GOLD;
  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 3.5 }}>
      {Array.from({ length: total }).map((_, i) => (
        <Box key={i} sx={{ flex: 1, height: 4, borderRadius: 2, overflow: 'hidden', background: 'rgba(139,155,180,0.15)' }}>
          <Box sx={{
            height: '100%', borderRadius: 2,
            background: i === 0
              ? `linear-gradient(90deg, ${isStudent ? ACCENT : GOLD}, ${isStudent ? TEAL : SAND})`
              : `linear-gradient(90deg, ${isStudent ? ACCENT : GOLD}, ${isStudent ? TEAL : SAND})`,
            width: step > i ? '100%' : '0%',
            transition: 'width 0.5s ease',
          }} />
        </Box>
      ))}
    </Box>
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
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TextField label="Email Address" type="email" fullWidth required
          value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
          placeholder="arjun@student.com" />
        <TextField label="Password" type={showPass ? 'text' : 'password'} fullWidth required
          value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
          InputProps={{ endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPass(p => !p)} edge="end" sx={{ color: STEEL }}>
                {showPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </IconButton>
            </InputAdornment>
          )}} />

        {error && <Alert severity="error" sx={{ borderRadius: 2.5 }}>{error}</Alert>}

        <Button type="submit" variant="contained" color="primary" size="large" fullWidth disabled={loading}
          sx={{ py: 1.5, fontSize: '0.95rem', mt: 0.5 }}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>

        <Button variant="outlined" color="primary" fullWidth
          startIcon={<ScienceRoundedIcon />}
          onClick={() => setForm({ email: 'arjun@student.com', password: 'password123' })}
          sx={{ py: 1.2, fontSize: '0.85rem' }}>
          Use Demo Account
        </Button>

        <Typography sx={{ textAlign: 'center', color: STEEL, fontSize: '0.83rem' }}>
          Don't have an account?{' '}
          <Box component={Link} to="/student/signup" sx={{ color: ACCENT2, fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Sign Up Free</Box>
        </Typography>
        <Typography sx={{ textAlign: 'center', color: STEEL, fontSize: '0.83rem' }}>
          Are you an instructor?{' '}
          <Box component={Link} to="/instructor/login" sx={{ color: ACCENT2, fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Instructor Login</Box>
        </Typography>
      </Box>
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
    <AuthLayout title="Join as Student" subtitle={`Step ${step} of 2 — ${step === 1 ? 'Account Details' : 'Your Profile'}`} isStudent>
      <StepProgress step={step} total={2} isStudent />

      {step === 1 && (
        <Box className="anim-fadeIn" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField label="Full Name" fullWidth required
            value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Arjun Sharma" />
          <TextField label="Email Address" type="email" fullWidth required
            value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="arjun@example.com" />
          <TextField label="Password (min 6 chars)" type={showPass ? 'text' : 'password'} fullWidth required
            value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            InputProps={{ endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPass(p => !p)} edge="end" sx={{ color: STEEL }}>
                  {showPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              </InputAdornment>
            )}} />
          <Button variant="contained" color="primary" size="large" fullWidth
            disabled={!step1Valid} onClick={() => step1Valid && setStep(2)}
            endIcon={<ArrowForwardRoundedIcon />} sx={{ py: 1.5 }}>
            Continue
          </Button>
          <Typography sx={{ textAlign: 'center', color: STEEL, fontSize: '0.83rem' }}>
            Already have an account?{' '}
            <Box component={Link} to="/student/login" sx={{ color: ACCENT2, fontWeight: 600, textDecoration: 'none' }}>Sign In</Box>
          </Typography>
        </Box>
      )}

      {step === 2 && (
        <Box className="anim-fadeIn" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={7}>
              <TextField label="College *" fullWidth
                value={form.college} onChange={e => setForm(p => ({ ...p, college: e.target.value }))} placeholder="IIT Madras" />
            </Grid>
            <Grid item xs={12} sm={5}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: STEEL }}>Year *</InputLabel>
                <Select value={form.year} label="Year *" onChange={e => setForm(p => ({ ...p, year: e.target.value }))}
                  sx={{ background: 'rgba(30,37,53,0.6)', color: CREAM, borderRadius: 2.5, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(139,155,180,0.2)' } }}>
                  {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box>
            <Typography sx={{ color: STEEL, fontSize: '0.82rem', mb: 1.5, fontWeight: 500 }}>
              Interests * <Box component="span" sx={{ color: '#666', fontWeight: 400 }}>(select all that apply)</Box>
            </Typography>
            <Grid container spacing={1.5}>
              {interestList.map(int => {
                const sel = form.interests.includes(int.key);
                return (
                  <Grid item xs={6} key={int.key}>
                    <Box onClick={() => toggleInterest(int.key)}
                      sx={{
                        p: 1.8, borderRadius: 3, cursor: 'pointer', position: 'relative',
                        background: sel ? int.bg : 'rgba(22,27,39,0.6)',
                        border: `1.5px solid ${sel ? int.border : 'rgba(139,155,180,0.12)'}`,
                        transition: 'all 0.22s cubic-bezier(.22,.68,0,1.2)',
                        '&:hover': { borderColor: int.border, transform: 'translateY(-2px)' },
                        transform: sel ? 'translateY(-2px) scale(1.01)' : 'none',
                      }}>
                      {sel && <CheckCircleRoundedIcon sx={{ position: 'absolute', top: 8, right: 8, fontSize: 16, color: int.color }} />}
                      <Typography sx={{ fontSize: '1.4rem', mb: 0.5 }}>{int.icon}</Typography>
                      <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 700, color: CREAM, fontSize: '0.78rem' }}>{int.label}</Typography>
                      <Typography sx={{ color: STEEL, fontSize: '0.68rem', mt: 0.3 }}>{int.desc}</Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>

          <TextField label="About You (optional)" multiline rows={2} fullWidth
            value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
            placeholder="Tell us about your learning goals..." />

          {error && <Alert severity="error" sx={{ borderRadius: 2.5 }}>{error}</Alert>}

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button variant="outlined" color="primary" onClick={() => setStep(1)} startIcon={<ArrowBackRoundedIcon />} sx={{ px: 3, py: 1.4 }}>Back</Button>
            <Button variant="contained" color="secondary" fullWidth disabled={!step2Valid} onClick={handleSubmit}
              sx={{ py: 1.4, fontSize: '0.92rem', background: `linear-gradient(135deg, ${SAND} 0%, #D4C9A5 100%)`, color: NAVY }}>
              🚀 Start Learning!
            </Button>
          </Box>
        </Box>
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
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TextField label="Email Address" type="email" fullWidth required
          value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
          placeholder="instructor@example.com" />
        <TextField label="Password" type={showPass ? 'text' : 'password'} fullWidth required
          value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
          InputProps={{ endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPass(p => !p)} edge="end" sx={{ color: STEEL }}>
                {showPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </IconButton>
            </InputAdornment>
          )}} />

        {error && <Alert severity="error" sx={{ borderRadius: 2.5 }}>{error}</Alert>}

        <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}
          sx={{ py: 1.5, background: `linear-gradient(135deg, ${GOLD} 0%, ${SAND} 100%)`, color: NAVY, fontWeight: 700, '&:hover': { boxShadow: `0 8px 24px rgba(212,168,67,0.35)` } }}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>

        <Button variant="outlined" color="primary" fullWidth startIcon={<ScienceRoundedIcon />}
          onClick={() => setForm({ email: 'ramesh@instructor.com', password: 'password123' })}
          sx={{ py: 1.2 }}>
          Use Demo Account
        </Button>

        <Typography sx={{ textAlign: 'center', color: STEEL, fontSize: '0.83rem' }}>
          New instructor?{' '}
          <Box component={Link} to="/instructor/signup" sx={{ color: ACCENT2, fontWeight: 600, textDecoration: 'none' }}>Sign Up</Box>
        </Typography>
        <Typography sx={{ textAlign: 'center', color: STEEL, fontSize: '0.83rem' }}>
          Are you a student?{' '}
          <Box component={Link} to="/student/login" sx={{ color: ACCENT2, fontWeight: 600, textDecoration: 'none' }}>Student Login</Box>
        </Typography>
      </Box>
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
        <Box className="anim-fadeIn" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField label="Full Name *" fullWidth value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Dr. Ramesh Kumar" />
          <TextField label="Email *" type="email" fullWidth value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          <TextField label="Password * (min 6 chars)" type={showPass ? 'text' : 'password'} fullWidth value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            InputProps={{ endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPass(p => !p)} edge="end" sx={{ color: STEEL }}>
                  {showPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              </InputAdornment>
            )}} />
          <Button variant="contained" size="large" fullWidth disabled={!step1Valid} onClick={() => step1Valid && setStep(2)}
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{ py: 1.5, background: `linear-gradient(135deg, ${GOLD} 0%, ${SAND} 100%)`, color: NAVY }}>
            Continue
          </Button>
          <Typography sx={{ textAlign: 'center', color: STEEL, fontSize: '0.83rem' }}>
            Already registered?{' '}
            <Box component={Link} to="/instructor/login" sx={{ color: ACCENT2, fontWeight: 600, textDecoration: 'none' }}>Sign In</Box>
          </Typography>
        </Box>
      )}

      {step === 2 && (
        <Box className="anim-fadeIn" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField label="Qualification *" fullWidth value={form.qualification} onChange={e => setForm(p => ({ ...p, qualification: e.target.value }))} placeholder="PhD in Computer Science, IIT Delhi" />
          <TextField label="Experience *" fullWidth value={form.experience} onChange={e => setForm(p => ({ ...p, experience: e.target.value }))} placeholder="8 years as Cloud Architect at AWS" />

          <Box>
            <Typography sx={{ color: STEEL, fontSize: '0.82rem', mb: 1.5, fontWeight: 500 }}>Specialization *</Typography>
            <Grid container spacing={1.5}>
              {specializationList.map(s => {
                const sel = form.specialization === s.key;
                return (
                  <Grid item xs={6} key={s.key}>
                    <Box onClick={() => setForm(p => ({ ...p, specialization: s.key }))}
                      sx={{
                        p: 2, borderRadius: 3, cursor: 'pointer', textAlign: 'center',
                        background: sel ? s.bg : 'rgba(22,27,39,0.6)',
                        border: `1.5px solid ${sel ? s.border : 'rgba(139,155,180,0.12)'}`,
                        transition: 'all 0.22s ease',
                        '&:hover': { borderColor: s.border },
                      }}>
                      <Typography sx={{ fontSize: '1.4rem', mb: 0.5 }}>{s.icon}</Typography>
                      <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 700, color: sel ? s.color : CREAM, fontSize: '0.78rem' }}>{s.label}</Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>

          <TextField label="Bio (optional)" multiline rows={2} fullWidth
            value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="Tell students about yourself..." />

          {error && <Alert severity="error" sx={{ borderRadius: 2.5 }}>{error}</Alert>}

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button variant="outlined" color="primary" onClick={() => setStep(1)} startIcon={<ArrowBackRoundedIcon />} sx={{ px: 3, py: 1.4 }}>Back</Button>
            <Button variant="contained" fullWidth disabled={!step2Valid} onClick={handleSubmit}
              sx={{ py: 1.4, background: `linear-gradient(135deg, ${GOLD} 0%, ${SAND} 100%)`, color: NAVY, fontWeight: 700 }}>
              🎓 Join as Instructor!
            </Button>
          </Box>
        </Box>
      )}
    </AuthLayout>
  );
}