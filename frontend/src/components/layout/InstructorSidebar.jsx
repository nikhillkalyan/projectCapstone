import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Drawer from '@mui/material/Drawer';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import LibraryBooksRoundedIcon from '@mui/icons-material/LibraryBooksRounded';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import ChatBubbleRoundedIcon from '@mui/icons-material/ChatBubbleRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { ACCENT, ACCENT2, TEAL, STEEL, CREAM, SAND, GOLD, DANGER, NAVY } from '../../theme';

const DRAWER_WIDTH = 248;

const categoryColors = {
  AIML: { bg: 'rgba(108,127,216,0.18)', color: ACCENT2, border: 'rgba(108,127,216,0.3)' },
  Cloud: { bg: 'rgba(78,205,196,0.18)', color: TEAL, border: 'rgba(78,205,196,0.3)' },
  DataScience: { bg: 'rgba(212,168,67,0.18)', color: GOLD, border: 'rgba(212,168,67,0.3)' },
  Cybersecurity: { bg: 'rgba(231,76,111,0.18)', color: '#E74C6F', border: 'rgba(231,76,111,0.3)' },
};

const navLinks = [
  { to: '/instructor', icon: DashboardRoundedIcon, label: 'Dashboard', end: true },
  { to: '/instructor/courses', icon: LibraryBooksRoundedIcon, label: 'My Courses' },
  { to: '/instructor/create-course', icon: AddCircleRoundedIcon, label: 'Create Course' },
  { to: '/instructor/chat', icon: ChatBubbleRoundedIcon, label: 'Messages' },
  { to: '/instructor/profile', icon: PersonRoundedIcon, label: 'Profile' },
];

function SidebarContent({ user, onLogout }) {
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'I';
  const specColor = categoryColors[user?.specialization] || categoryColors.AIML;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2, overflowY: 'auto' }}>
      {/* Logo */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3.5, px: 1 }}>
        <Box className="anim-pulse-glow" sx={{
          width: 36, height: 36, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `linear-gradient(135deg, ${GOLD} 0%, ${SAND} 100%)`,
        }}>
          <BoltRoundedIcon sx={{ color: NAVY, fontSize: 20 }} />
        </Box>
        <Box>
          <Typography className="gradient-text" sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '1rem', lineHeight: 1 }}>
            EduForge
          </Typography>
          <Typography sx={{ color: STEEL, fontSize: '0.6rem', letterSpacing: 1, textTransform: 'uppercase', mt: 0.2 }}>
            Instructor Hub
          </Typography>
        </Box>
      </Box>

      {/* User card */}
      <Box sx={{
        background: 'rgba(212,168,67,0.06)', border: '1px solid rgba(212,168,67,0.12)',
        borderRadius: 3, p: 1.8, mb: 3,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{
            width: 40, height: 40, borderRadius: 2.5, fontFamily: '"Syne",sans-serif', fontWeight: 700,
            background: `linear-gradient(135deg, ${GOLD} 0%, ${SAND} 100%)`,
            color: NAVY, fontSize: '0.85rem',
          }}>
            {initials}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography sx={{ color: CREAM, fontFamily: '"Syne",sans-serif', fontWeight: 600, fontSize: '0.85rem', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </Typography>
            <Typography sx={{ color: STEEL, fontSize: '0.7rem' }}>Instructor</Typography>
          </Box>
        </Box>
        {user?.specialization && (
          <Box sx={{ mt: 1.2 }}>
            <Chip label={user.specialization} size="small" sx={{ background: specColor.bg, color: specColor.color, border: `1px solid ${specColor.border}`, fontSize: '0.6rem', height: 20 }} />
          </Box>
        )}
      </Box>

      <Typography sx={{ color: STEEL, fontSize: '0.6rem', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', px: 1, mb: 1 }}>
        Navigation
      </Typography>

      <List sx={{ flex: 1, '& .MuiListItemButton-root': { mb: 0.5 } }}>
        {navLinks.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <ListItemButton selected={isActive} sx={{
                borderRadius: 2.5, px: 1.5, py: 1.1,
                '&.Mui-selected': { background: 'rgba(212,168,67,0.15)', border: '1px solid rgba(212,168,67,0.2)', '&:hover': { background: 'rgba(212,168,67,0.2)' } },
                '&:hover': { background: 'rgba(212,168,67,0.08)' },
              }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Icon sx={{ fontSize: 19, color: isActive ? GOLD : STEEL }} />
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{ fontSize: '0.83rem', fontFamily: '"DM Sans",sans-serif', fontWeight: isActive ? 600 : 400, color: isActive ? CREAM : STEEL }}
                />
              </ListItemButton>
            )}
          </NavLink>
        ))}
      </List>

      <Divider sx={{ borderColor: 'rgba(139,155,180,0.1)', my: 1 }} />

      <ListItemButton onClick={onLogout} sx={{ borderRadius: 2.5, px: 1.5, py: 1.1, '&:hover': { background: 'rgba(231,76,111,0.1)' } }}>
        <ListItemIcon sx={{ minWidth: 36 }}>
          <LogoutRoundedIcon sx={{ fontSize: 19, color: DANGER }} />
        </ListItemIcon>
        <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.83rem', color: DANGER, fontWeight: 500 }} />
      </ListItemButton>
    </Box>
  );
}

export default function InstructorSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <>
      {isMobile && (
        <IconButton onClick={() => setMobileOpen(true)} sx={{ position: 'fixed', top: 12, left: 12, zIndex: 1300, color: CREAM, background: 'rgba(22,27,39,0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(139,155,180,0.15)' }}>
          <MenuRoundedIcon />
        </IconButton>
      )}
      {isMobile && (
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, background: 'rgba(8,12,20,0.98)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(139,155,180,0.1)' } }}>
          <SidebarContent user={user} onLogout={handleLogout} />
        </Drawer>
      )}
      {!isMobile && (
        <Box sx={{ width: DRAWER_WIDTH, flexShrink: 0 }}>
          <Box sx={{ width: DRAWER_WIDTH, position: 'fixed', top: 0, left: 0, height: '100vh', background: 'rgba(8,12,20,0.97)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(139,155,180,0.1)', zIndex: 100 }}>
            <SidebarContent user={user} onLogout={handleLogout} />
          </Box>
        </Box>
      )}
    </>
  );
}