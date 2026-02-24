import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, Compass, BookOpen, Heart, User, MessageSquare, LogOut, 
  Award, ChevronRight, Zap
} from 'lucide-react';

export default function StudentSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { to: '/student', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/student/explore', icon: Compass, label: 'Explore Courses' },
    { to: '/student/enrolled', icon: BookOpen, label: 'My Courses' },
    { to: '/student/favorites', icon: Heart, label: 'Favorites' },
    { to: '/student/chat', icon: MessageSquare, label: 'Messages' },
    { to: '/student/profile', icon: User, label: 'Profile' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'S';

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center animate-pulse-glow" style={{ background: 'linear-gradient(135deg, #6B7FD4, #4ECDC4)' }}>
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-sm gradient-text" style={{ fontFamily: 'Syne, sans-serif' }}>EduForge</div>
            <div className="text-xs" style={{ color: 'var(--steel)', fontSize: '10px' }}>Learning Platform</div>
          </div>
        </div>
      </div>

      {/* User card */}
      <div className="glass-light rounded-2xl p-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #6B7FD4, #8FA4E8)', fontFamily: 'Syne' }}>
            {initials}
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-semibold truncate" style={{ color: 'var(--cream)', fontFamily: 'Syne' }}>{user?.name}</div>
            <div className="text-xs" style={{ color: 'var(--steel)' }}>{user?.year || 'Student'}</div>
          </div>
        </div>
        {user?.interests?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {user.interests.slice(0, 2).map(i => (
              <span key={i} className={`badge badge-${i.toLowerCase()}`} style={{ fontSize: '9px', padding: '2px 6px' }}>{i}</span>
            ))}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        <div className="text-xs font-semibold mb-2 px-2 tracking-widest uppercase" style={{ color: 'var(--steel)', fontSize: '9px' }}>Navigation</div>
        {navLinks.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} />
            <span className="text-sm flex-1">{label}</span>
            <ChevronRight size={14} className="opacity-40" />
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="sidebar-link w-full mt-4 text-red-400 hover:text-red-300 hover:bg-red-900/20"
      >
        <LogOut size={18} />
        <span className="text-sm">Logout</span>
      </button>
    </div>
  );
}