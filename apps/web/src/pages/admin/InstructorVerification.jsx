import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import api from '../../lib/api';
import { useApp } from '../../context/AppContext';
import { CheckCircle, ExternalLink, Loader2, XCircle } from 'lucide-react';

function InstructorVerification() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const { showNotification } = useApp();

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = () => {
    setLoading(true);
    api.get('/admin/instructors', { params: { status: 'PENDING' } })
       .then(res => setInstructors(res.data || []))
       .catch((err) => {
         console.error(err);
         showNotification('Failed to load pending instructors', 'error');
       })
       .finally(() => setLoading(false));
  };

  const verifyInstructor = async (id) => {
    try {
      setActionLoadingId(id);
      await api.put(`/admin/instructors/${id}/approve`);
      setInstructors((current) => current.filter(i => i.id !== id));
      showNotification('Instructor approved successfully!');
    } catch (err) {
      console.error(err);
      showNotification(err.response?.data?.error || 'Failed to approve instructor', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const rejectInstructor = async (id) => {
    if (!rejectReason.trim()) {
      showNotification('Add a rejection reason before submitting.', 'warning');
      return;
    }

    try {
      setActionLoadingId(id);
      await api.put(`/admin/instructors/${id}/reject`, { reason: rejectReason.trim() });
      setInstructors((current) => current.filter(i => i.id !== id));
      setRejectingId(null);
      setRejectReason('');
      showNotification('Instructor rejected successfully.');
    } catch (err) {
      console.error(err);
      showNotification(err.response?.data?.error || 'Failed to reject instructor', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const getCertificateUrl = (inst) => inst.ugCertificateUrl || inst.pgCertificateUrl || inst.phdCertificateUrl || '';

  return (
    <div className="mesh-bg flex min-h-screen text-text-primary">
      <AdminSidebar />
      <main className="ml-64 flex-1 p-8">
        <h1 className="heading-2 mb-8 text-gradient">Instructor Verification Flow</h1>
        
        <div className="glass rounded-lg p-6">
          <h2 className="mb-6 border-b border-border-subtle pb-4 font-display text-xl font-semibold">Pending Approvals</h2>
          
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-10 text-text-secondary">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading pending instructors...</span>
            </div>
          ) : instructors.length === 0 ? (
            <p className="py-8 text-center text-text-tertiary">No pending instructors at the moment.</p>
          ) : (
            <div className="space-y-4">
              {instructors.map(inst => (
                 <div key={inst.id} className="glass-sm rounded-lg p-4">
                    <div className="flex items-center justify-between gap-6">
                    <div>
                      <h3 className="text-lg font-bold">{inst.name}</h3>
                      <p className="text-sm text-text-secondary">{inst.email}</p>
                      <div className="mt-2 text-sm text-text-secondary">
                        <span className="mr-2 rounded bg-primary-500/15 px-2 py-1 text-primary-300">{inst.specialization}</span>
                        <span>{inst.qualification} ({inst.experience})</span>
                      </div>
                      {getCertificateUrl(inst) ? (
                        <a
                          href={getCertificateUrl(inst)}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-1 text-sm text-accent-400 underline hover:text-accent-300"
                        >
                          View Uploaded Certificate
                          <ExternalLink size={14} />
                        </a>
                      ) : (
                        <p className="mt-3 text-sm text-text-tertiary">No certificate file available.</p>
                      )}
                    </div>
                    
                    <div className="flex gap-3">
                      <button 
                        onClick={() => verifyInstructor(inst.id)}
                        disabled={actionLoadingId === inst.id}
                        className="flex items-center gap-2 rounded-lg bg-success-500/15 px-4 py-2 text-success-400 transition-colors hover:bg-success-500/25">
                        {actionLoadingId === inst.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => {
                          setRejectingId(inst.id);
                          setRejectReason('');
                        }}
                        disabled={actionLoadingId === inst.id}
                        className="flex items-center gap-2 rounded-lg bg-error-500/15 px-4 py-2 text-error-400 transition-colors hover:bg-error-500/25"
                      >
                        <XCircle size={18} />
                        <span>Reject</span>
                      </button>
                    </div>
                    </div>

                    {rejectingId === inst.id && (
                      <div className="mt-4 rounded-lg border border-error-400/20 bg-error-500/5 p-4">
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-error-300">
                          Rejection Reason
                        </label>
                        <textarea
                          rows={3}
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Explain what needs to be corrected before reapplying..."
                          className="w-full resize-none rounded-lg border border-border-subtle bg-bg-base px-3 py-2 text-sm text-text-primary outline-none transition-all placeholder:text-text-tertiary focus:border-error-400/40"
                        />
                        <div className="mt-3 flex justify-end gap-3">
                          <button
                            onClick={() => {
                              setRejectingId(null);
                              setRejectReason('');
                            }}
                            className="rounded-lg border border-border-subtle px-4 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => rejectInstructor(inst.id)}
                            disabled={actionLoadingId === inst.id}
                            className="flex items-center gap-2 rounded-lg bg-error-500/15 px-4 py-2 text-sm text-error-300 transition-colors hover:bg-error-500/25"
                          >
                            {actionLoadingId === inst.id ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                            Confirm Reject
                          </button>
                        </div>
                      </div>
                    )}
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
