import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  BookOpen,
  GitBranch,
  CalendarCheck,
  ClipboardList,
  Award,
  History,
  LogOut,
  Building2,
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  {
    section: 'Overview',
    links: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    section: 'University',
    links: [
      { to: '/branches', label: 'Branches & Sections', icon: GitBranch },
      { to: '/instructors', label: 'Instructors', icon: Users },
      { to: '/students', label: 'Students', icon: Users },
    ],
  },
  {
    section: 'Academics',
    links: [
      { to: '/course-pool', label: 'Course Pool', icon: BookOpen },
      { to: '/allocations', label: 'Allocations', icon: CalendarCheck },
    ],
  },
  {
    section: 'Evaluation',
    links: [
      { to: '/marks-review', label: 'Marks Review', icon: ClipboardList },
      { to: '/certificates', label: 'Certificates', icon: Award },
    ],
  },
  {
    section: 'Records',
    links: [
      { to: '/history', label: 'History', icon: History },
    ],
  },
];

const Sidebar = () => {
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'UA';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-logo">
          <GraduationCap />
        </div>
        <div className="sidebar-brand-info">
          <h2>EduForge</h2>
          <span>University Admin</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((section) => (
          <div key={section.section}>
            <div className="sidebar-section-label">{section.section}</div>
            {section.links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <link.icon className="sidebar-link-icon" />
                <span>{link.label}</span>
                {link.badge && (
                  <span className="sidebar-link-badge">{link.badge}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer / User */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {getInitials(user?.name)}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name || 'Admin'}</div>
            <div className="sidebar-user-role">University Admin</div>
          </div>
          <button
            className="sidebar-logout-btn"
            onClick={logout}
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
