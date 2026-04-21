import { NavLink } from 'react-router-dom';
import { BookOpen, Compass, GraduationCap, Heart, LayoutDashboard, LogOut, MessageSquare, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const links = [
  { to: '/student', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/student/explore', icon: Compass, label: 'Explore' },
  { to: '/student/enrolled', icon: BookOpen, label: 'My Courses' },
  { to: '/student/favorites', icon: Heart, label: 'Favorites' },
  { to: '/student/chat', icon: MessageSquare, label: 'Messages' },
  { to: '/student/profile', icon: UserCircle, label: 'Profile' },
];

export default function StudentSidebar() {
  const { logout } = useAuth();

  return (
    <aside className="glass-lg fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-glass-border p-4">
      <div className="mb-8 flex items-center gap-3 px-2 pt-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
          <GraduationCap size={20} className="text-white" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-gradient">EduForge</h2>
          <p className="text-xs font-semibold uppercase tracking-wide text-accent-400">Student Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-semibold transition-all ${
                isActive
                  ? 'border-primary-400/25 bg-primary-500/12 text-primary-200 shadow-glow'
                  : 'border-transparent text-text-secondary hover:border-border-subtle hover:bg-white/[0.05] hover:text-text-primary'
              }`
            }
          >
            <link.icon size={19} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <button onClick={logout} className="mt-auto flex items-center gap-3 rounded-lg px-4 py-3 text-error-400 transition-colors hover:bg-error-500/10">
        <LogOut size={19} />
        Logout
      </button>
    </aside>
  );
}
