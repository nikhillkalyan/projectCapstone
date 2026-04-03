import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import api from '../../lib/api';
import { Search, UserX, UserCheck } from 'lucide-react';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // In a real scenario, this would fetch all users
    api.get('/admin/users')
       .then(res => setUsers(res.data))
       .catch(() => {
         // Mock fallback
         setUsers([
           { id: '1', name: 'Arjun', email: 'arjun@student.com', role: 'STUDENT', active: true },
           { id: '2', name: 'Ramesh', email: 'ramesh@instructor.com', role: 'INSTRUCTOR', active: true }
         ]);
       });
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex bg-slate-950 min-h-screen text-white">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        <h1 className="text-3xl font-bold mb-8">User Management</h1>
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Registered Users</h2>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Search users..." 
                className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 text-white w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Name</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 font-medium">{user.name}</td>
                    <td className="py-4 text-slate-300">{user.email}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-xs ${user.role === 'INSTRUCTOR' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`flex items-center space-x-1 text-sm ${user.active ? 'text-green-400' : 'text-red-400'}`}>
                        {user.active ? <UserCheck size={16} /> : <UserX size={16} />}
                        <span>{user.active ? 'Active' : 'Suspended'}</span>
                      </span>
                    </td>
                    <td className="py-4">
                      <button className="text-slate-400 hover:text-white underline text-sm transition-colors">
                        {user.active ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default UserManagement;
