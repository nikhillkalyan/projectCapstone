import { NavLink } from 'react-router-dom';
import { Home, Users, CheckCircle, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function AdminSidebar() {
  const { logout } = useAuth();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-white min-h-screen p-4 flex flex-col fixed left-0 top-0">
      <div className="mb-8 px-4">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
          EduForge Admin
        </h2>
      </div>

      <nav className="flex-1 space-y-2">
        <NavLink 
          to="/admin/dashboard" 
          className={({ isActive }) => 
            `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
              isActive ? 'bg-blue-600 shadow-lg shadow-blue-500/30' : 'hover:bg-slate-800'
            }`
          }
        >
          <Home size={20} />
          <span>Dashboard Stats</span>
        </NavLink>

        <NavLink 
          to="/admin/verify-instructors" 
          className={({ isActive }) => 
            `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
              isActive ? 'bg-blue-600 shadow-lg shadow-blue-500/30' : 'hover:bg-slate-800'
            }`
          }
        >
          <CheckCircle size={20} />
          <span>Verify Instructors</span>
        </NavLink>
        
        <NavLink 
          to="/admin/users" 
          className={({ isActive }) => 
            `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
              isActive ? 'bg-blue-600 shadow-lg shadow-blue-500/30' : 'hover:bg-slate-800'
            }`
          }
        >
          <Users size={20} />
          <span>Manage Users</span>
        </NavLink>
      </nav>

      <button
        onClick={logout}
        className="flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors mt-auto"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </aside>
  );
}

export default AdminSidebar;
