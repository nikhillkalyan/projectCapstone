import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, BookOpen, Plus, Users, MessageSquare, User, LogOut, ChevronRight, Zap } from 'lucide-react';

export default function InstructorSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { to: '/instructor', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/instructor/courses', icon: BookOpen, label: 'My Courses' },
    { to: '/instructor/create-course', icon: Plus, label: 'Create Course' },
    { to: '/instructor/chat', icon: MessageSquare, label: 'Messages' },
    { to: '/instructor/profile', icon: User, label: 'Profile' },
  ];

  const handleLogout = () => { logout(); navigate('/'); };
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'I';

  return (
    <div className="sidebar">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center animate-pulse-glow" style={{ background: 'linear-gradient(135deg, #D4A843, #E1D9BC)' }}>
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-sm gradient-text" style={{ fontFamily: 'Syne, sans-serif' }}>EduForge</div>
            <div className="text-xs" style={{ color: 'var(--steel)', fontSize: '10px' }}>Instructor Hub</div>
          </div>
        </div>
      </div>

      <div className="glass-light rounded-2xl p-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #D4A843, #E1D9BC)', color: 'var(--navy)', fontFamily: 'Syne' }}>
            {initials}
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-semibold truncate" style={{ color: 'var(--cream)', fontFamily: 'Syne' }}>{user?.name}</div>
            <div className="text-xs" style={{ color: 'var(--steel)' }}>Instructor</div>
          </div>
        </div>
        {user?.specialization && (
          <div className="mt-2">
            <span className={`badge badge-${user.specialization.toLowerCase()}`} style={{ fontSize: '9px', padding: '2px 6px' }}>{user.specialization}</span>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1">
        <div className="text-xs font-semibold mb-2 px-2 tracking-widest uppercase" style={{ color: 'var(--steel)', fontSize: '9px' }}>Navigation</div>
        {navLinks.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Icon size={18} />
            <span className="text-sm flex-1">{label}</span>
            <ChevronRight size={14} className="opacity-40" />
          </NavLink>
        ))}
      </nav>

      <button onClick={handleLogout} className="sidebar-link w-full mt-4 text-red-400 hover:text-red-300 hover:bg-red-900/20">
        <LogOut size={18} />
        <span className="text-sm">Logout</span>
      </button>
    </div>
  );
}