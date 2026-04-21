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
    <div className="mesh-bg flex min-h-screen text-text-primary">
      <AdminSidebar />
      <main className="ml-64 flex-1 p-8">
        <h1 className="heading-2 mb-8 text-gradient">Instructor Verification Flow</h1>
        
        <div className="glass rounded-lg p-6">
          <h2 className="mb-6 border-b border-border-subtle pb-4 font-display text-xl font-semibold">Pending Approvals</h2>
          
          {instructors.length === 0 ? (
            <p className="py-8 text-center text-text-tertiary">No pending instructors at the moment.</p>
          ) : (
            <div className="space-y-4">
              {instructors.map(inst => (
                 <div key={inst.id} className="glass-sm flex items-center justify-between rounded-lg p-4">
                    <div>
                      <h3 className="text-lg font-bold">{inst.user?.name}</h3>
                      <p className="text-sm text-text-secondary">{inst.user?.email}</p>
                      <div className="mt-2 text-sm text-text-secondary">
                        <span className="mr-2 rounded bg-primary-500/15 px-2 py-1 text-primary-300">{inst.specialization}</span>
                        <span>{inst.qualification} ({inst.experience})</span>
                      </div>
                      <button className="mt-3 text-sm text-accent-400 underline hover:text-accent-400">
                        View Uploaded Certificate.pdf
                      </button>
                    </div>
                    
                    <div className="flex gap-3">
                      <button 
                        onClick={() => verifyInstructor(inst.id)}
                        className="flex items-center gap-2 rounded-lg bg-success-500/15 px-4 py-2 text-success-400 transition-colors hover:bg-success-500/25">
                        <CheckCircle size={18} />
                        <span>Approve</span>
                      </button>
                      <button className="flex items-center gap-2 rounded-lg bg-error-500/15 px-4 py-2 text-error-400 transition-colors hover:bg-error-500/25">
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
