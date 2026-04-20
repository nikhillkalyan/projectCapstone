import { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  UserPlus,
  GitBranch,
  CalendarCheck,
  ClipboardList,
  Award,
  UserCheck,
  FileText,
  Loader2,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import './Dashboard.css';



const recentActivity = [
  {
    type: 'student',
    title: '<strong>Rahul Sharma</strong> joined CSE — Section A',
    time: '2 minutes ago',
  },
  {
    type: 'instructor',
    title: '<strong>Dr. Priya Verma</strong> submitted a new course for review',
    time: '15 minutes ago',
  },
  {
    type: 'course',
    title: '<strong>Data Structures</strong> was allocated to ECE — Section B',
    time: '1 hour ago',
  },
  {
    type: 'alert',
    title: 'Marks sheet for <strong>DBMS</strong> is pending approval',
    time: '3 hours ago',
  },
  {
    type: 'student',
    title: '<strong>Ananya Reddy</strong> joined MECH — Section C',
    time: '5 hours ago',
  },
];

const semesterCourses = [
  { title: 'Data Structures & Algorithms', branch: 'CSE', year: '2nd Year', status: 'active', instructor: 'Dr. Priya Verma' },
  { title: 'Digital Electronics', branch: 'ECE', year: '2nd Year', status: 'active', instructor: 'Prof. K. Ramesh' },
  { title: 'Engineering Mechanics', branch: 'MECH', year: '1st Year', status: 'pending', instructor: 'Dr. S. Kumar' },
  { title: 'Database Management Systems', branch: 'CSE', year: '3rd Year', status: 'completed', instructor: 'Dr. A. Patel' },
];

const Dashboard = () => {
  const [dbStats, setDbStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/uni-admin/users/dashboard');
        setDbStats(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const stats = [
    {
      label: 'Total Students',
      value: dbStats?.totalStudents || 0,
      trend: 'Registered',
      trendDir: 'up',
      icon: Users,
      variant: 'stat-primary',
    },
    {
      label: 'Total Instructors',
      value: dbStats?.totalInstructors || 0,
      trend: dbStats?.pendingInstructors ? `${dbStats.pendingInstructors} pending` : 'All approved',
      trendDir: dbStats?.pendingInstructors ? 'down' : 'up',
      icon: GraduationCap,
      variant: 'stat-accent',
    },
    {
      label: 'Total Branches',
      value: dbStats?.totalBranches || 0,
      trend: 'Active',
      trendDir: 'up',
      icon: GitBranch,
      variant: 'stat-success',
    },
    {
      label: 'Total Sections',
      value: dbStats?.totalSections || 0,
      trend: 'Configured',
      trendDir: 'up',
      icon: BookOpen,
      variant: 'stat-warm',
    },
  ];

  if (loading) {
    return (
      <div className="loader-center">
        <Loader2 size={28} className="spin" />
        <span>Loading dashboard data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="form-error-banner" style={{ margin: 'var(--space-6)' }}>
        <AlertCircle size={15} /> <span>{error}</span>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Grid */}
      <div className="stats-grid stagger-children">
        {stats.map((stat, i) => (
          <div key={i} className={`stat-card ${stat.variant}`}>
            <div className="stat-card-header">
              <div className="stat-card-icon">
                <stat.icon size={22} />
              </div>
              <div className={`stat-card-trend ${stat.trendDir}`}>
                {stat.trendDir === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {stat.trend}
              </div>
            </div>
            <div className="stat-card-value">{stat.value}</div>
            <div className="stat-card-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Left — Semester Overview */}
        <div className="glass-panel" style={{ animationDelay: '200ms' }}>
          <div className="glass-panel-header">
            <h3>Semester Overview</h3>
            <span className="view-all">View All Courses →</span>
          </div>
          <table className="semester-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Branch</th>
                <th>Year</th>
                <th>Instructor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {semesterCourses.map((course, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {course.title}
                  </td>
                  <td>
                    <span className="font-mono" style={{ fontSize: 'var(--text-xs)' }}>
                      {course.branch}
                    </span>
                  </td>
                  <td>{course.year}</td>
                  <td>{course.instructor}</td>
                  <td>
                    <span className={`badge badge-${course.status}`}>
                      {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Quick Actions */}
          <div className="glass-panel" style={{ animationDelay: '300ms' }}>
            <div className="glass-panel-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="quick-actions">
              <button className="quick-action-btn">
                <UserPlus size={22} />
                <span>Add Branch</span>
              </button>
              <button className="quick-action-btn">
                <CalendarCheck size={22} />
                <span>Allocate Course</span>
              </button>
              <button className="quick-action-btn">
                <ClipboardList size={22} />
                <span>Review Marks</span>
              </button>
              <button className="quick-action-btn">
                <Award size={22} />
                <span>Issue Certs</span>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass-panel" style={{ animationDelay: '400ms', flex: 1 }}>
            <div className="glass-panel-header">
              <h3>Recent Activity</h3>
              <span className="view-all">View All →</span>
            </div>
            <div className="activity-list">
              {recentActivity.map((item, i) => (
                <div key={i} className="activity-item">
                  <div className={`activity-icon ${item.type}`}>
                    {item.type === 'student' && <UserCheck size={16} />}
                    {item.type === 'instructor' && <FileText size={16} />}
                    {item.type === 'course' && <BookOpen size={16} />}
                    {item.type === 'alert' && <ClipboardList size={16} />}
                  </div>
                  <div className="activity-details">
                    <div
                      className="activity-title"
                      dangerouslySetInnerHTML={{ __html: item.title }}
                    />
                    <div className="activity-time">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
