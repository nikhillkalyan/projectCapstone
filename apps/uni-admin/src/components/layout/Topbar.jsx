import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, Bell, Settings } from 'lucide-react';
import './Topbar.css';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/branches': 'Branches & Sections',
  '/instructors': 'Instructors',
  '/students': 'Students',
  '/course-pool': 'Course Pool',
  '/allocations': 'Allocations',
  '/marks-review': 'Marks Review',
  '/certificates': 'Certificates',
  '/history': 'History',
};

const Topbar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const currentTitle = pageTitles[location.pathname] || 'Dashboard';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <header className="topbar">
      {/* Left — Page Title */}
      <div className="topbar-left">
        <span className="topbar-greeting">
          {getGreeting()}, {user?.name?.split(' ')[0] || 'Admin'}
        </span>
        <h1 className="topbar-title">{currentTitle}</h1>
      </div>

      {/* Center — Search */}
      <div className="topbar-center">
        <div className="topbar-search">
          <Search className="topbar-search-icon" />
          <input
            id="topbar-search"
            className="topbar-search-input"
            type="text"
            placeholder="Search students, instructors, courses..."
          />
          <span className="topbar-search-shortcut">⌘K</span>
        </div>
      </div>

      {/* Right — Actions */}
      <div className="topbar-right">
        <button className="topbar-action-btn" title="Notifications" aria-label="Notifications">
          <Bell size={20} />
          <span className="notification-dot" />
        </button>
        <button className="topbar-action-btn" title="Settings" aria-label="Settings">
          <Settings size={20} />
        </button>

        {/* University Badge */}
        <div className="topbar-uni-badge">
          <span className="uni-dot" />
          <span>{user?.universityName || 'University'}</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
