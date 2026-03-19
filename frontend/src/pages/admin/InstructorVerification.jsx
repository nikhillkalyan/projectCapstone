import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import api from '../../lib/api';
import { CheckCircle, XCircle } from 'lucide-react';

function InstructorVerification() {
  const [instructors, setInstructors] = useState([]);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = () => {
    api.get('/admin/instructors/pending')
       .then(res => setInstructors(res.data))
       .catch(console.error);
  };

  const verifyInstructor = async (id) => {
    try {
      await api.post(`/admin/instructors/${id}/verify`);
      setInstructors(instructors.filter(i => i.id !== id));
      alert("Instructor verified successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to verify instructor");
    }
  };

  return (
    <div className="flex bg-slate-950 min-h-screen text-white">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        <h1 className="text-3xl font-bold mb-8">Instructor Verification Flow</h1>
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6 border-b border-slate-800 pb-4">Pending Approvals</h2>
          
          {instructors.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No pending instructors at the moment.</p>
          ) : (
            <div className="space-y-4">
              {instructors.map(inst => (
                 <div key={inst.id} className="bg-slate-800 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{inst.user?.name}</h3>
                      <p className="text-slate-400 text-sm">{inst.user?.email}</p>
                      <div className="mt-2 text-sm text-slate-300">
                        <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded mr-2">{inst.specialization}</span>
                        <span>{inst.qualification} ({inst.experience})</span>
                      </div>
                      {/* Fake certificate upload view */}
                      <button className="text-cyan-400 hover:text-cyan-300 mt-3 text-sm underline">
                        View Uploaded Certificate.pdf
                      </button>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => verifyInstructor(inst.id)}
                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                        <CheckCircle size={18} />
                        <span>Approve</span>
                      </button>
                      <button className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                        <XCircle size={18} />
                        <span>Reject</span>
                      </button>
                    </div>
                 </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default InstructorVerification;
