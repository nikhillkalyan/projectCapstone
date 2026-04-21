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
    <div className="mesh-bg flex min-h-screen text-text-primary">
      <AdminSidebar />
      <main className="ml-64 flex-1 p-8">
        <h1 className="heading-2 mb-8 text-gradient">User Management</h1>
        
        <div className="glass rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-xl font-semibold">Registered Users</h2>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-text-secondary" size={20} />
              <input 
                type="text" 
                placeholder="Search users..." 
                className="glass-input w-64 rounded-lg py-2 pl-10 pr-4 text-text-primary outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-subtle text-text-secondary">
                  <th className="pb-3 font-semibold">Name</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="border-b border-border-subtle/60 transition-colors hover:bg-white/[0.04]">
                    <td className="py-4 font-medium">{user.name}</td>
                    <td className="py-4 text-text-secondary">{user.email}</td>
                    <td className="py-4">
                      <span className={`rounded px-2 py-1 text-xs ${user.role === 'INSTRUCTOR' ? 'bg-primary-500/15 text-primary-300' : 'bg-accent-500/15 text-accent-400'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`flex items-center gap-1 text-sm ${user.active ? 'text-success-400' : 'text-error-400'}`}>
                        {user.active ? <UserCheck size={16} /> : <UserX size={16} />}
                        <span>{user.active ? 'Active' : 'Suspended'}</span>
                      </span>
                    </td>
                    <td className="py-4">
                      <button className="text-sm text-text-secondary underline transition-colors hover:text-text-primary">
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
