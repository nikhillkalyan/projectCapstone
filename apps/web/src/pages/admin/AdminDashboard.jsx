import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import api from '../../lib/api';
import { Users, BookOpen, Clock } from 'lucide-react';

function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalCourses: 0, pendingInstructors: 0 });

  useEffect(() => {
    // Fetch stats from backend
    api.get('/admin/stats').then(res => setStats(res.data)).catch(console.error);
  }, []);

  return (
    <div className="mesh-bg flex min-h-screen text-text-primary">
      <AdminSidebar />
      <main className="ml-64 flex-1 p-8">
        <h1 className="heading-2 mb-8 text-gradient">Platform Overview</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card flex items-center gap-4 rounded-lg p-6">
            <div className="rounded-lg bg-primary-500/15 p-4 text-primary-300">
              <Users size={32} />
            </div>
            <div>
              <p className="text-text-secondary">Total Users</p>
              <h2 className="font-display text-3xl font-bold">{stats.totalUsers}</h2>
            </div>
          </div>
          
          <div className="glass-card flex items-center gap-4 rounded-lg p-6">
            <div className="rounded-lg bg-accent-500/15 p-4 text-accent-400">
              <BookOpen size={32} />
            </div>
            <div>
              <p className="text-text-secondary">Total Courses</p>
              <h2 className="font-display text-3xl font-bold">{stats.totalCourses}</h2>
            </div>
          </div>
          
          <div className="glass-card flex items-center gap-4 rounded-lg p-6">
            <div className="rounded-lg bg-warning-500/15 p-4 text-warning-400">
              <Clock size={32} />
            </div>
            <div>
              <p className="text-text-secondary">Pending Verification</p>
              <h2 className="font-display text-3xl font-bold">{stats.pendingInstructors}</h2>
            </div>
          </div>
        </div>

        <div className="glass mt-12 rounded-lg p-6">
           <h2 className="font-display mb-4 text-xl font-bold">Recent Complaint Resolutions</h2>
           <p className="text-text-tertiary italic">No recent complaints found. Module under construction based on API endpoints.</p>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
