import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import StatusBadge from '../../components/shared/StatusBadge';
import {
    getInstructor,
    approveInstructor,
    rejectInstructor,
    flagInstructor,
} from '../../services/instructorService';

const DocumentCard = ({ label, url, onPreview }) => {
    if (!url) return null;
    return (
        <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <span className="text-white/70 text-sm">{label}</span>
            </div>
            <button
                onClick={() => onPreview(url, label)}
                className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
            >
                Preview
            </button>
        </div>
    );
};

const InstructorReview = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [instructor, setInstructor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showFlagModal, setShowFlagModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [flagMessage, setFlagMessage] = useState('');
    const [toast, setToast] = useState(null);
    const [previewData, setPreviewData] = useState({ url: null, label: '' });

    useEffect(() => {
        fetchInstructor();
    }, [id]);

    const fetchInstructor = async () => {
        try {
            setLoading(true);
            const data = await getInstructor(id);
            setInstructor(data);
        } catch (err) {
            showToast('Failed to load instructor', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleApprove = async () => {
        setActionLoading(true);
        try {
            await approveInstructor(id);
            showToast('Instructor approved successfully!');
            fetchInstructor();
        } catch {
            showToast('Failed to approve instructor', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) return;
        setActionLoading(true);
        try {
            await rejectInstructor(id, rejectReason);
            showToast('Instructor rejected.');
            setShowRejectModal(false);
            setRejectReason('');
            fetchInstructor();
        } catch {
            showToast('Failed to reject instructor', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleFlag = async () => {
        if (!flagMessage.trim()) return;
        setActionLoading(true);
        try {
            await flagInstructor(id, flagMessage, []);
            showToast('Instructor flagged for more info.');
            setShowFlagModal(false);
            setFlagMessage('');
            fetchInstructor();
        } catch {
            showToast('Failed to flag instructor', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
        });
    };

    if (loading) {
        return (
            <AdminLayout title="Review Instructor">
                <div className="flex items-center justify-center py-40">
                    <div className="w-8 h-8 border-2 border-white/10 border-t-indigo-500 rounded-full animate-spin" />
                </div>
            </AdminLayout>
        );
    }

    if (!instructor) {
        return (
            <AdminLayout title="Review Instructor">
                <div className="text-center py-40 text-white/20">Instructor not found</div>
            </AdminLayout>
        );
    }

    const hasNoDocs = !instructor.ugCertificateUrl && !instructor.pgCertificateUrl && !instructor.phdCertificateUrl;

    return (
        <AdminLayout title="Review Instructor">

            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-xl border transition-all ${toast.type === 'error'
                        ? 'bg-red-500/10 border-red-500/20 text-red-400'
                        : 'bg-green-500/10 border-green-500/20 text-green-400'
                    }`}>
                    {toast.message}
                </div>
            )}

            {/* Back */}
            <button
                onClick={() => navigate('/instructors')}
                className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-6 transition-colors"
            >
                ← Back to Instructors
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Profile */}
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 text-2xl font-bold">
                                    {instructor.name?.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-white text-lg font-semibold">{instructor.name}</h2>
                                    <p className="text-white/40 text-sm">{instructor.email}</p>
                                </div>
                            </div>
                            <StatusBadge status={instructor.approvalStatus} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/[0.02] rounded-xl p-3">
                                <p className="text-white/30 text-xs mb-1">Qualification</p>
                                <p className="text-white/80 text-sm">{instructor.qualification || '—'}</p>
                            </div>
                            <div className="bg-white/[0.02] rounded-xl p-3">
                                <p className="text-white/30 text-xs mb-1">Experience</p>
                                <p className="text-white/80 text-sm">{instructor.experience || '—'}</p>
                            </div>
                            <div className="bg-white/[0.02] rounded-xl p-3">
                                <p className="text-white/30 text-xs mb-1">Specialization</p>
                                <p className="text-white/80 text-sm">{instructor.specialization || '—'}</p>
                            </div>
                            <div className="bg-white/[0.02] rounded-xl p-3">
                                <p className="text-white/30 text-xs mb-1">Registered</p>
                                <p className="text-white/80 text-sm">{formatDate(instructor.registeredAt)}</p>
                            </div>
                        </div>

                        {instructor.bio && (
                            <div className="mt-4 bg-white/[0.02] rounded-xl p-3">
                                <p className="text-white/30 text-xs mb-1">Bio</p>
                                <p className="text-white/70 text-sm leading-relaxed">{instructor.bio}</p>
                            </div>
                        )}
                    </div>

                    {/* Documents */}
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
                        <h3 className="text-white font-semibold mb-4">Verification Documents</h3>
                        <div className="space-y-3">
                            <DocumentCard label="UG Certificate" url={instructor.ugCertificateUrl} onPreview={(url, label) => setPreviewData({ url, label })} />
                            <DocumentCard label="PG Certificate" url={instructor.pgCertificateUrl} onPreview={(url, label) => setPreviewData({ url, label })} />
                            <DocumentCard label="PhD Certificate" url={instructor.phdCertificateUrl} onPreview={(url, label) => setPreviewData({ url, label })} />
                            {hasNoDocs && (
                                <p className="text-white/20 text-sm text-center py-4">No documents uploaded</p>
                            )}
                        </div>
                    </div>

                    {/* Flag message */}
                    {instructor.approvalStatus === 'FLAGGED' && instructor.flagMessage && (
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4">
                            <p className="text-orange-400 text-xs font-medium uppercase tracking-wider mb-1">
                                Flagged — Admin Note
                            </p>
                            <p className="text-orange-300/80 text-sm">{instructor.flagMessage}</p>
                        </div>
                    )}

                    {/* Rejection reason */}
                    {instructor.approvalStatus === 'REJECTED' && instructor.rejectionReason && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                            <p className="text-red-400 text-xs font-medium uppercase tracking-wider mb-1">
                                Rejection Reason
                            </p>
                            <p className="text-red-300/80 text-sm">{instructor.rejectionReason}</p>
                        </div>
                    )}
                </div>

                {/* Right */}
                <div className="space-y-4">

                    {/* Actions */}
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
                        <h3 className="text-white font-semibold mb-4">Admin Actions</h3>
                        <div className="space-y-3">
                            <button
                                onClick={handleApprove}
                                disabled={actionLoading || instructor.approvalStatus === 'APPROVED'}
                                className="w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-all bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                ✓ Approve Instructor
                            </button>
                            <button
                                onClick={() => setShowFlagModal(true)}
                                disabled={actionLoading || instructor.approvalStatus === 'APPROVED'}
                                className="w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-all bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                ⚑ Flag for More Info
                            </button>
                            <button
                                onClick={() => setShowRejectModal(true)}
                                disabled={actionLoading || instructor.approvalStatus === 'APPROVED'}
                                className="w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-all bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                ✕ Reject Application
                            </button>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
                        <h3 className="text-white font-semibold mb-4">Timeline</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
                                <div>
                                    <p className="text-white/70 text-sm">Registered</p>
                                    <p className="text-white/30 text-xs">{formatDate(instructor.registeredAt)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${instructor.approvalStatus !== 'PENDING' ? 'bg-indigo-400' : 'bg-white/10'
                                    }`} />
                                <p className={`text-sm ${instructor.approvalStatus !== 'PENDING' ? 'text-white/70' : 'text-white/20'
                                    }`}>
                                    Under Review
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${instructor.approvalStatus === 'APPROVED' ? 'bg-indigo-400' : 'bg-white/10'
                                    }`} />
                                <div>
                                    <p className={`text-sm ${instructor.approvalStatus === 'APPROVED' ? 'text-white/70' : 'text-white/20'
                                        }`}>
                                        Approved
                                    </p>
                                    {instructor.approvedAt && (
                                        <p className="text-white/30 text-xs">{formatDate(instructor.approvedAt)}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0d0d14] border border-white/[0.08] rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-white font-semibold mb-2">Reject Application</h3>
                        <p className="text-white/40 text-sm mb-4">
                            Provide a reason for rejection. This will be shown to the instructor.
                        </p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Enter rejection reason..."
                            rows={4}
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 resize-none mb-4"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="flex-1 py-2.5 rounded-xl text-sm text-white/40 hover:text-white/70 border border-white/[0.06] transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectReason.trim() || actionLoading}
                                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                Confirm Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Flag Modal */}
            {showFlagModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0d0d14] border border-white/[0.08] rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-white font-semibold mb-2">Flag for More Info</h3>
                        <p className="text-white/40 text-sm mb-4">
                            Explain what additional information or documents you need from the instructor.
                        </p>
                        <textarea
                            value={flagMessage}
                            onChange={(e) => setFlagMessage(e.target.value)}
                            placeholder="e.g. Please re-upload a clearer version of your degree certificate..."
                            rows={4}
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-orange-500/50 resize-none mb-4"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowFlagModal(false)}
                                className="flex-1 py-2.5 rounded-xl text-sm text-white/40 hover:text-white/70 border border-white/[0.06] transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleFlag}
                                disabled={!flagMessage.trim() || actionLoading}
                                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                Confirm Flag
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {previewData.url && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 md:p-8">
                    <div className="bg-[#0d0d14] border border-white/[0.08] rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
                        <div className="flex items-center justify-between p-4 border-b border-white/[0.08] bg-white/[0.02]">
                            <h3 className="text-white font-medium">{previewData.label}</h3>
                            <div className="flex items-center gap-3">
                                <a
                                    href={previewData.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                                >
                                    Open in New Tab ↗
                                </a>
                                <button
                                    onClick={() => setPreviewData({ url: null, label: '' })}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 p-4 bg-black/40">
                            <iframe
                                src={previewData.url}
                                className="w-full h-full rounded-xl bg-white"
                                title="Document Preview"
                            />
                        </div>
                    </div>
                </div>
            )}

        </AdminLayout>
    );
};

export default InstructorReview;