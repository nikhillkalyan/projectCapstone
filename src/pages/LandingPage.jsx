import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import { ACCENT, ACCENT2, TEAL, STEEL, CREAM, SAND, GOLD, NAVY, NAVY2, DANGER } from '../theme';

const categories = [
  { name: 'AI & Machine Learning', icon: '🤖', key: 'AIML', color: ACCENT2, bg: 'rgba(108,127,216,0.12)', border: 'rgba(108,127,216,0.25)', courses: 12 },
  { name: 'Cloud Computing', icon: '☁️', key: 'Cloud', color: TEAL, bg: 'rgba(78,205,196,0.12)', border: 'rgba(78,205,196,0.25)', courses: 8 },
  { name: 'Data Science', icon: '📊', key: 'DataScience', color: GOLD, bg: 'rgba(212,168,67,0.12)', border: 'rgba(212,168,67,0.25)', courses: 10 },
  { name: 'Cybersecurity', icon: '🔒', key: 'Cybersecurity', color: DANGER, bg: 'rgba(231,76,111,0.12)', border: 'rgba(231,76,111,0.25)', courses: 7 },
];

const stats = [
  { value: '10,000+', label: 'Students Enrolled', icon: PeopleRoundedIcon, color: ACCENT2 },
  { value: '200+', label: 'Expert Instructors', icon: SchoolRoundedIcon, color: TEAL },
  { value: '500+', label: 'Courses Available', icon: EmojiEventsRoundedIcon, color: GOLD },
  { value: '95%', label: 'Completion Rate', icon: TrendingUpRoundedIcon, color: DANGER },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box className="hero-bg grid-bg" sx={{ minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Nav */}
      <Box component="nav" sx={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        px: { xs: 2, md: 6 }, py: 2,
        background: 'rgba(8,12,20,0.8)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(139,155,180,0.08)',
      }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box className="anim-pulse-glow" sx={{
              width: 36, height: 36, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `linear-gradient(135deg, ${ACCENT} 0%, ${TEAL} 100%)`,
            }}>
              <BoltRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />
            </Box>
            <Typography className="gradient-text" sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '1.15rem' }}>
              Ed Tech
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Button variant="outlined" color="primary" size="small" onClick={() => navigate('/student/login')}
              sx={{ px: 2.2, py: 0.8, fontSize: '0.8rem', display: { xs: 'none', sm: 'flex' } }}>
              Student Login
            </Button>
            <Button variant="outlined" color="primary" size="small" onClick={() => navigate('/instructor/login')}
              sx={{ px: 2.2, py: 0.8, fontSize: '0.8rem', display: { xs: 'none', sm: 'flex' } }}>
              Instructor Login
            </Button>
            <Button variant="contained" color="secondary" size="small" onClick={() => navigate('/student/signup')}
              sx={{ px: 2.5, py: 0.85, fontSize: '0.8rem' }}>
              Get Started
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Hero */}
      <Box component="section" sx={{ pt: { xs: 14, md: 20 }, pb: { xs: 10, md: 16 }, px: { xs: 2, md: 4 }, textAlign: 'center', position: 'relative' }}>
        <Container maxWidth="lg">
          {/* Badge */}
          <Box className="anim-fadeInUp" sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
            <Chip
              icon={<StarRoundedIcon sx={{ color: `${GOLD} !important`, fontSize: '14px !important' }} />}
              label="India's Top Tech Learning Platform"
              sx={{
                background: 'rgba(108,127,216,0.12)', border: '1px solid rgba(108,127,216,0.28)',
                color: ACCENT2, fontFamily: '"Syne",sans-serif', fontWeight: 600, fontSize: '0.78rem',
                py: 2, px: 1,
              }}
            />
          </Box>

          {/* Headline */}
          <Typography className="anim-fadeInUp delay-1" variant="h1"
            sx={{ fontSize: { xs: '2.8rem', sm: '4rem', md: '5.5rem', lg: '6.5rem' }, lineHeight: 1.05, letterSpacing: '-2px', mb: 3 }}>
            <Box component="span" className="gradient-text">Forge Your</Box>
            <br />
            <Box component="span" sx={{ color: CREAM }}>Tech Career</Box>
          </Typography>

          <Typography className="anim-fadeInUp delay-2"
            sx={{ fontSize: { xs: '1rem', md: '1.15rem' }, color: STEEL, maxWidth: 580, mx: 'auto', lineHeight: 1.75, mb: 5.5 }}>
            Learn from industry experts in AI/ML, Cloud, Data Science & Cybersecurity.
            Earn certificates that matter. Build projects that impress.
          </Typography>

          <Box className="anim-fadeInUp delay-3" sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" color="secondary" size="large"
              endIcon={<ArrowForwardRoundedIcon />}
              onClick={() => navigate('/student/signup')}
              sx={{ px: 4, py: 1.6, fontSize: '1rem', borderRadius: 3,
                background: `linear-gradient(135deg, ${SAND} 0%, #D4C9A5 100%)`,
                color: NAVY, '&:hover': { boxShadow: `0 12px 32px rgba(226,217,190,0.35)` } }}>
              Start Learning Free
            </Button>
            <Button variant="outlined" color="primary" size="large"
              onClick={() => navigate('/instructor/signup')}
              sx={{ px: 4, py: 1.6, fontSize: '1rem', borderRadius: 3 }}>
              Become an Instructor
            </Button>
          </Box>

          {/* Floating cards */}
          <Box className="anim-float" sx={{
            display: { xs: 'none', lg: 'block' },
            position: 'absolute', left: 40, top: '55%', transform: 'translateY(-50%)',
            background: 'rgba(22,27,39,0.85)', backdropFilter: 'blur(16px)',
            border: '1px solid rgba(139,155,180,0.12)', borderRadius: 3, p: 2, width: 200,
          }}>
            <Typography sx={{ color: STEEL, fontSize: '0.72rem', mb: 0.5 }}>Course Completed</Typography>
            <Typography sx={{ color: CREAM, fontFamily: '"Syne",sans-serif', fontWeight: 700, fontSize: '0.85rem', mb: 1 }}>
              ML Fundamentals
            </Typography>
            <LinearProgress variant="determinate" value={100} sx={{ borderRadius: 2, height: 5 }} />
            <Typography sx={{ color: TEAL, fontSize: '0.7rem', mt: 0.8, fontWeight: 600 }}>✓ 100% Complete</Typography>
          </Box>

          <Box className="anim-float delay-2" sx={{
            display: { xs: 'none', lg: 'block' },
            position: 'absolute', right: 40, top: '40%',
            background: 'rgba(22,27,39,0.85)', backdropFilter: 'blur(16px)',
            border: '1px solid rgba(212,168,67,0.2)', borderRadius: 3, p: 2, width: 190,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
              <EmojiEventsRoundedIcon sx={{ color: GOLD, fontSize: 18 }} />
              <Typography sx={{ color: GOLD, fontFamily: '"Syne",sans-serif', fontWeight: 700, fontSize: '0.78rem' }}>Certificate Earned!</Typography>
            </Box>
            <Typography sx={{ color: STEEL, fontSize: '0.73rem' }}>AWS Cloud Architect</Typography>
          </Box>
        </Container>
      </Box>

      {/* Stats */}
      <Box component="section" sx={{ py: { xs: 6, md: 10 }, borderTop: '1px solid rgba(139,155,180,0.08)', borderBottom: '1px solid rgba(139,155,180,0.08)' }}>
        <Container maxWidth="lg">
          <Grid container spacing={3} justifyContent="center">
            {stats.map(({ value, label, icon: Icon, color }, i) => (
              <Grid item xs={6} md={3} key={label}>
                <Box className={`anim-fadeInUp delay-${i + 1}`} sx={{ textAlign: 'center', py: 2 }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: 2.5, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5 }}>
                    <Icon sx={{ color, fontSize: 24 }} />
                  </Box>
                  <Typography className="gradient-text" sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: { xs: '1.8rem', md: '2.2rem' }, lineHeight: 1 }}>
                    {value}
                  </Typography>
                  <Typography sx={{ color: STEEL, fontSize: '0.82rem', mt: 0.5 }}>{label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Categories */}
      <Box component="section" sx={{ py: { xs: 8, md: 12 }, px: { xs: 2, md: 4 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 7 }}>
            <Typography variant="h2" sx={{ fontSize: { xs: '1.8rem', md: '2.6rem' }, color: CREAM, mb: 1.5 }}>
              What You'll Learn
            </Typography>
            <Typography sx={{ color: STEEL, fontSize: '1rem' }}>
              Industry-focused courses designed for the future of tech
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {categories.map((cat, i) => (
              <Grid item xs={12} sm={6} lg={3} key={cat.key}>
                <Box
                  className={`anim-fadeInUp delay-${i + 1}`}
                  onClick={() => navigate('/student/signup')}
                  sx={{
                    p: 3.5, borderRadius: 4, textAlign: 'center', cursor: 'pointer',
                    background: cat.bg, border: `1px solid ${cat.border}`,
                    transition: 'all 0.3s cubic-bezier(.22,.68,0,1.2)',
                    '&:hover': { transform: 'translateY(-8px) scale(1.02)', boxShadow: `0 20px 40px ${cat.border}` },
                  }}>
                  <Typography sx={{ fontSize: '2.5rem', mb: 1.5 }}>{cat.icon}</Typography>
                  <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 700, color: CREAM, fontSize: '0.95rem', mb: 1 }}>
                    {cat.name}
                  </Typography>
                  <Chip label={`${cat.courses} Courses`} size="small"
                    sx={{ background: `${cat.color}22`, color: cat.color, border: `1px solid ${cat.border}`, fontSize: '0.68rem', fontFamily: '"Syne",sans-serif', fontWeight: 600 }} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA */}
      <Box component="section" sx={{ py: { xs: 6, md: 10 }, px: { xs: 2, md: 4 } }}>
        <Container maxWidth="md">
          <Box sx={{
            textAlign: 'center', borderRadius: 5, p: { xs: 5, md: 8 },
            background: 'rgba(22,27,39,0.7)', backdropFilter: 'blur(16px)',
            border: '1px solid rgba(139,155,180,0.12)',
            position: 'relative', overflow: 'hidden',
            '&::before': {
              content: '""', position: 'absolute', top: -80, right: -80,
              width: 240, height: 240, borderRadius: '50%',
              background: `radial-gradient(circle, ${ACCENT}22 0%, transparent 70%)`,
            },
          }}>
            <Typography className="anim-float" sx={{ fontSize: '3rem', mb: 2.5 }}>🚀</Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: '1.6rem', md: '2.2rem' }, color: CREAM, mb: 2 }}>
              Ready to Forge Your Future?
            </Typography>
            <Typography sx={{ color: STEEL, mb: 4.5, fontSize: '0.98rem' }}>
              Join thousands of students learning cutting-edge tech skills
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button variant="contained" color="secondary" size="large"
                startIcon={<SchoolRoundedIcon />} onClick={() => navigate('/student/signup')}
                sx={{ px: 3.5, py: 1.4, background: `linear-gradient(135deg, ${SAND} 0%, #D4C9A5 100%)`, color: NAVY }}>
                Join as Student
              </Button>
              <Button variant="contained" color="primary" size="large"
                startIcon={<PeopleRoundedIcon />} onClick={() => navigate('/instructor/signup')}
                sx={{ px: 3.5, py: 1.4 }}>
                Join as Instructor
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{ py: 5, px: 4, borderTop: '1px solid rgba(139,155,180,0.08)', textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 1.5 }}>
          <Box sx={{ width: 28, height: 28, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${ACCENT} 0%, ${TEAL} 100%)` }}>
            <BoltRoundedIcon sx={{ color: '#fff', fontSize: 16 }} />
          </Box>
          <Typography className="gradient-text" sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '0.95rem' }}>Ed Tech</Typography>
        </Box>
      </Box>
    </Box>
  );
}