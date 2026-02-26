import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import InstructorSidebar from '../../components/layout/InstructorSidebar';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import LibraryBooksRoundedIcon from '@mui/icons-material/LibraryBooksRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { ACCENT2, TEAL, STEEL, CREAM, SAND, GOLD, DANGER, NAVY } from '../../theme';

const SIDEBAR_W = 248;

const specializationList = [
  { key: 'AIML',         label: 'AI & Machine Learning', icon: '🤖', color: ACCENT2, bg: 'rgba(108,127,216,0.15)', border: 'rgba(108,127,216,0.4)' },
  { key: 'Cloud',        label: 'Cloud Computing',       icon: '☁️', color: TEAL,    bg: 'rgba(78,205,196,0.15)',  border: 'rgba(78,205,196,0.4)'  },
  { key: 'DataScience',  label: 'Data Science',          icon: '📊', color: GOLD,    bg: 'rgba(212,168,67,0.15)',  border: 'rgba(212,168,67,0.4)'  },
  { key: 'Cybersecurity',label: 'Cybersecurity',         icon: '🔒', color: DANGER,  bg: 'rgba(231,76,111,0.15)', border: 'rgba(231,76,111,0.4)'  },
];

export default function InstructorProfile() {
  const { user, updateUser } = useAuth();
  const { db } = useApp();
  const [form, setForm] = useState({
    name:          user?.name          || '',
    qualification: user?.qualification || '',
    experience:    user?.experience    || '',
    bio:           user?.bio           || '',
    specialization:user?.specialization|| '',
  });
  const [saved, setSaved] = useState(false);

  const myCourses = db.courses.filter(c => c.instructorId === user?.id);
  const totalStudents = myCourses.reduce((s, c) => s + (c.enrolledCount || 0), 0);
  const avgRating = myCourses.length > 0
    ? (myCourses.reduce((s, c) => s + (c.rating || 0), 0) / myCourses.length).toFixed(1)
    : '—';

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'I';

  const handleSave = () => {
    updateUser(form);
    setSaved(true);
  };

  const stats = [
    { icon: LibraryBooksRoundedIcon, label: 'Courses',  value: myCourses.length, color: ACCENT2 },
    { icon: PeopleRoundedIcon,       label: 'Students', value: totalStudents,    color: TEAL    },
    { icon: StarRoundedIcon,         label: 'Avg Rating',value: avgRating,       color: GOLD    },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0D1117' }}>
      <InstructorSidebar />
      <Box sx={{ ml: { md: `${SIDEBAR_W}px` }, flex: 1, p: { xs: 2, sm: 3, md: 4 }, pt: { xs: 7, md: 4 } }}>
        <Box sx={{ maxWidth: 720, mx: 'auto' }}>

          <Typography variant="h4" className="anim-fadeInUp"
            sx={{ fontWeight: 800, color: CREAM, mb: 4, fontSize: { xs: '1.6rem', md: '2rem' } }}>
            My Profile
          </Typography>

          {/* Stats */}
          <Grid container spacing={2} sx={{ mb: 4 }} className="anim-fadeInUp delay-1">
            {stats.map(({ icon: Icon, label, value, color }) => (
              <Grid item xs={4} key={label}>
                <Card sx={{ background: 'rgba(22,27,39,0.85)', border: '1px solid rgba(139,155,180,0.1)', textAlign: 'center' }}>
                  <CardContent sx={{ py: 2.5, '&:last-child': { pb: 2.5 } }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, background: `${color}18`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.2 }}>
                      <Icon sx={{ color, fontSize: 20 }} />
                    </Box>
                    <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '1.6rem', color: CREAM, lineHeight: 1 }}>
                      {value}
                    </Typography>
                    <Typography sx={{ color: STEEL, fontSize: '0.75rem', mt: 0.5 }}>{label}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Form */}
          <Card className="anim-fadeInUp delay-2"
            sx={{ background: 'rgba(22,27,39,0.85)', border: '1px solid rgba(139,155,180,0.1)', borderRadius: 4 }}>
            <CardContent sx={{ p: { xs: 3, sm: 4 }, '&:last-child': { pb: { xs: 3, sm: 4 } } }}>

              {/* Avatar header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 4 }}>
                <Avatar sx={{
                  width: 72, height: 72, borderRadius: 3, fontFamily: '"Syne",sans-serif', fontWeight: 800,
                  fontSize: '1.6rem', background: `linear-gradient(135deg, ${GOLD} 0%, ${SAND} 100%)`, color: NAVY,
                }}>
                  {initials}
                </Avatar>
                <Box>
                  <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 700, color: CREAM, fontSize: '1.1rem' }}>
                    {user?.name}
                  </Typography>
                  <Typography sx={{ color: STEEL, fontSize: '0.82rem' }}>{user?.email}</Typography>
                  {user?.specialization && (
                    <Chip label={user.specialization} size="small" sx={{ mt: 0.8,
                      background: specializationList.find(s => s.key === user.specialization)?.bg || 'rgba(108,127,216,0.15)',
                      color: specializationList.find(s => s.key === user.specialization)?.color || ACCENT2,
                      fontSize: '0.65rem', height: 20 }} />
                  )}
                </Box>
              </Box>

              <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
                <Grid item xs={12}>
                  <TextField label="Full Name" fullWidth value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Qualification" fullWidth value={form.qualification}
                    onChange={e => setForm(p => ({ ...p, qualification: e.target.value }))}
                    placeholder="PhD in Computer Science, IIT Delhi" />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Experience" fullWidth value={form.experience}
                    onChange={e => setForm(p => ({ ...p, experience: e.target.value }))}
                    placeholder="8 years as Cloud Architect at AWS" />
                </Grid>
              </Grid>

              <TextField label="Bio" multiline rows={3} fullWidth value={form.bio}
                onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                placeholder="Tell students about your expertise and teaching style..."
                sx={{ mb: 3 }} />

              {/* Specialization */}
              <Typography sx={{ color: STEEL, fontSize: '0.83rem', fontWeight: 600, mb: 1.8 }}>
                Specialization
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 4 }}>
                {specializationList.map(spec => {
                  const sel = form.specialization === spec.key;
                  return (
                    <Box key={spec.key} onClick={() => setForm(p => ({ ...p, specialization: spec.key }))}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 1, px: 2.2, py: 1.1,
                        borderRadius: 2.5, cursor: 'pointer',
                        background: sel ? spec.bg : 'rgba(22,27,39,0.6)',
                        border: `1.5px solid ${sel ? spec.border : 'rgba(139,155,180,0.12)'}`,
                        transition: 'all 0.22s ease',
                        '&:hover': { borderColor: spec.border, transform: 'translateY(-2px)' },
                      }}>
                      {sel && <CheckCircleRoundedIcon sx={{ fontSize: 14, color: spec.color }} />}
                      <Typography sx={{ fontSize: '1rem' }}>{spec.icon}</Typography>
                      <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 600,
                        color: sel ? spec.color : CREAM, fontSize: '0.82rem' }}>
                        {spec.label}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>

              <Button variant="contained" color="primary" startIcon={<SaveRoundedIcon />}
                onClick={handleSave} sx={{ px: 4, py: 1.3 }}>
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Snackbar open={saved} autoHideDuration={2500} onClose={() => setSaved(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity="success" sx={{ borderRadius: 2.5 }}>Profile saved successfully!</Alert>
      </Snackbar>
    </Box>
  );
}