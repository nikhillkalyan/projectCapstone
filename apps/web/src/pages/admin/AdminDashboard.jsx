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
    <div className="flex bg-slate-950 min-h-screen text-white">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        <h1 className="text-3xl font-bold mb-8">Platform Overview</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center space-x-4">
            <div className="p-4 bg-blue-500/20 text-blue-400 rounded-xl">
              <Users size={32} />
            </div>
            <div>
              <p className="text-slate-400">Total Users</p>
              <h2 className="text-3xl font-bold">{stats.totalUsers}</h2>
            </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center space-x-4">
            <div className="p-4 bg-purple-500/20 text-purple-400 rounded-xl">
              <BookOpen size={32} />
            </div>
            <div>
              <p className="text-slate-400">Total Courses</p>
              <h2 className="text-3xl font-bold">{stats.totalCourses}</h2>
            </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center space-x-4">
            <div className="p-4 bg-amber-500/20 text-amber-400 rounded-xl">
              <Clock size={32} />
            </div>
            <div>
              <p className="text-slate-400">Pending Verification</p>
              <h2 className="text-3xl font-bold">{stats.pendingInstructors}</h2>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-slate-900 border border-slate-800 rounded-2xl p-6">
           <h2 className="text-xl font-bold mb-4">Recent Complaint Resolutions</h2>
           <p className="text-slate-500 italic">No recent complaints found. Module under construction based on API endpoints.</p>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
