import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import StudentSidebar from '../../components/layout/StudentSidebar';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import LibraryBooksRoundedIcon from '@mui/icons-material/LibraryBooksRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { ACCENT, ACCENT2, TEAL, STEEL, CREAM, SAND, GOLD, DANGER, NAVY } from '../../theme';

const SIDEBAR_W = 248;
const interestList = [
  { key: 'AIML', label: 'AI & ML', icon: '🤖', color: ACCENT2, bg: 'rgba(108,127,216,0.15)', border: 'rgba(108,127,216,0.4)' },
  { key: 'Cloud', label: 'Cloud', icon: '☁️', color: TEAL, bg: 'rgba(78,205,196,0.15)', border: 'rgba(78,205,196,0.4)' },
  { key: 'DataScience', label: 'Data Science', icon: '📊', color: GOLD, bg: 'rgba(212,168,67,0.15)', border: 'rgba(212,168,67,0.4)' },
  { key: 'Cybersecurity', label: 'Security', icon: '🔒', color: DANGER, bg: 'rgba(231,76,111,0.15)', border: 'rgba(231,76,111,0.4)' },
];
const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Post Graduate'];

export default function StudentProfile() {
  const { user, updateUser } = useAuth();
  const { db, getCourseProgress } = useApp();
  const [form, setForm] = useState({ name: user?.name || '', college: user?.college || '', year: user?.year || '', bio: user?.bio || '', interests: user?.interests || [] });
  const [saved, setSaved] = useState(false);

  const toggleInterest = (key) => {
    setForm(p => ({ ...p, interests: p.interests.includes(key) ? p.interests.filter(i => i !== key) : [...p.interests, key] }));
  };

  const handleSave = () => {
    updateUser(form);
    setSaved(true);
  };

  const enrolled = db.courses.filter(c => user?.enrolledCourses?.includes(c.id));
  const completed = user?.completedCourses || [];
  const avgProgress = enrolled.length > 0 ? Math.round(enrolled.reduce((s, c) => s + getCourseProgress(c.id), 0) / enrolled.length) : 0;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'S';

  const stats = [
    { icon: LibraryBooksRoundedIcon, label: 'Enrolled', value: enrolled.length, color: ACCENT2 },
    { icon: EmojiEventsRoundedIcon, label: 'Completed', value: completed.length, color: TEAL },
    { icon: TrendingUpRoundedIcon, label: 'Avg. Progress', value: `${avgProgress}%`, color: GOLD },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0D1117' }}>
      <StudentSidebar />
      <Box sx={{ ml: { md: `${SIDEBAR_W}px` }, flex: 1, p: { xs: 2, sm: 3, md: 4 }, pt: { xs: 7, md: 4 } }}>
        <Box sx={{ maxWidth: 760, mx: 'auto' }}>
          <Typography variant="h4" className="anim-fadeInUp" sx={{ fontWeight: 800, color: CREAM, mb: 4, fontSize: { xs: '1.6rem', md: '2rem' } }}>My Profile</Typography>

          {/* Stats */}
          <Grid container spacing={2} sx={{ mb: 4 }} className="anim-fadeInUp delay-1">
            {stats.map(({ icon: Icon, label, value, color }) => (
              <Grid item xs={4} key={label}>
                <Card sx={{ background: 'rgba(22,27,39,0.85)', border: '1px solid rgba(139,155,180,0.1)', textAlign: 'center' }}>
                  <CardContent sx={{ py: 2.5, '&:last-child': { pb: 2.5 } }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.2 }}>
                      <Icon sx={{ color, fontSize: 20 }} />
                    </Box>
                    <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '1.6rem', color: CREAM, lineHeight: 1 }}>{value}</Typography>
                    <Typography sx={{ color: STEEL, fontSize: '0.75rem', mt: 0.5 }}>{label}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Profile form */}
          <Card className="anim-fadeInUp delay-2" sx={{ background: 'rgba(22,27,39,0.85)', border: '1px solid rgba(139,155,180,0.1)' }}>
            <CardContent sx={{ p: { xs: 3, sm: 4 }, '&:last-child': { pb: { xs: 3, sm: 4 } } }}>
              {/* Avatar + info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 4 }}>
                <Avatar sx={{
                  width: 72, height: 72, borderRadius: 3, fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '1.6rem',
                  background: `linear-gradient(135deg, ${ACCENT} 0%, #8FA4E8 100%)`, color: '#fff',
                }}>
                  {initials}
                </Avatar>
                <Box>
                  <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 700, color: CREAM, fontSize: '1.1rem' }}>{user?.name}</Typography>
                  <Typography sx={{ color: STEEL, fontSize: '0.82rem' }}>{user?.email}</Typography>
                  <Typography sx={{ color: ACCENT2, fontSize: '0.78rem', mt: 0.4 }}>{user?.college} • {user?.year}</Typography>
                </Box>
              </Box>

              <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
                <Grid item xs={12} sm={6}>
                  <TextField label="Full Name" fullWidth value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="College" fullWidth value={form.college} onChange={e => setForm(p => ({ ...p, college: e.target.value }))} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: STEEL }}>Year</InputLabel>
                    <Select value={form.year} label="Year" onChange={e => setForm(p => ({ ...p, year: e.target.value }))}
                      sx={{ color: CREAM, borderRadius: 2.5, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(139,155,180,0.2)' } }}>
                      {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <TextField label="About You" multiline rows={3} fullWidth value={form.bio}
                onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                placeholder="Tell us about your learning goals..." sx={{ mb: 3 }} />

              {/* Interests */}
              <Typography sx={{ color: STEEL, fontSize: '0.83rem', fontWeight: 600, mb: 1.8 }}>Interests</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 4 }}>
                {interestList.map(int => {
                  const sel = form.interests.includes(int.key);
                  return (
                    <Box key={int.key} onClick={() => toggleInterest(int.key)}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 1, px: 2.2, py: 1.1, borderRadius: 2.5, cursor: 'pointer',
                        background: sel ? int.bg : 'rgba(22,27,39,0.6)',
                        border: `1.5px solid ${sel ? int.border : 'rgba(139,155,180,0.12)'}`,
                        transition: 'all 0.22s ease',
                        '&:hover': { borderColor: int.border, transform: 'translateY(-2px)' },
                      }}>
                      {sel && <CheckCircleRoundedIcon sx={{ fontSize: 14, color: int.color }} />}
                      <Typography sx={{ fontSize: '1rem' }}>{int.icon}</Typography>
                      <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 600, color: sel ? int.color : CREAM, fontSize: '0.82rem' }}>
                        {int.label}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>

              <Button variant="contained" color="primary" startIcon={<SaveRoundedIcon />} onClick={handleSave} sx={{ px: 4, py: 1.3 }}>
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Snackbar open={saved} autoHideDuration={2500} onClose={() => setSaved(false)} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity="success" sx={{ borderRadius: 2.5 }}>Profile saved successfully!</Alert>
      </Snackbar>
    </Box>
  );
}