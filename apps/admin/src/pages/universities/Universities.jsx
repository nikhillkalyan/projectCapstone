import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../services/api';

const Universities = () => {
    const [universities, setUniversities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showCredentials, setShowCredentials] = useState(null);
    const [form, setForm] = useState({ universityName: '', adminName: '', adminEmail: '', adminPassword: '' });
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');
    const [togglingId, setTogglingId] = useState(null);

    const fetchUniversities = async () => {
        try {
            const res = await api.get('/admin/universities');
            setUniversities(res.data);
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUniversities(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        setCreating(true);
        try {
            const res = await api.post('/admin/universities', form);
            setShowModal(false);
            setShowCredentials(res.data);
            setForm({ universityName: '', adminName: '', adminEmail: '', adminPassword: '' });
            fetchUniversities();
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Failed to create university.');
        } finally {
            setCreating(false);
        }
    };

    const handleToggle = async (id) => {
        setTogglingId(id);
        try {
            const res = await api.put(`/admin/universities/${id}/toggle-status`);
            setUniversities(prev => prev.map(u => u.id === id ? res.data : u));
        } catch { /* silent */ } finally {
            setTogglingId(null);
        }
    };

    const getInitials = (name) => name
        ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : 'UN';

    const formatDate = (dateStr) => dateStr
        ? new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : '—';

    return (
        <AdminLayout title="Universities">

            {/* ── Page Header ── */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-white/40 text-sm mt-0.5">
                        {universities.length} {universities.length === 1 ? 'university' : 'universities'} registered
                    </p>
                </div>
                <button
                    id="register-university-btn"
                    onClick={() => { setError(''); setShowModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Register University
                </button>
            </div>

            {/* ── Loading ── */}
            {loading ? (
                <div className="flex items-center justify-center py-32">
                    <div className="w-8 h-8 border-2 border-white/10 border-t-indigo-500 rounded-full animate-spin" />
                </div>

            /* ── Empty State ── */
            ) : universities.length === 0 ? (
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 flex items-center justify-center mb-4">
                        <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h3 className="text-white/60 font-semibold text-sm mb-1">No universities yet</h3>
                    <p className="text-white/20 text-xs">Register the first university to get started.</p>
                </div>

            /* ── Universities Grid ── */
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {universities.map((u) => (
                        <div
                            key={u.id}
                            className={`relative bg-white/[0.02] border rounded-2xl p-5 transition-all duration-200 hover:bg-white/[0.04] group ${
                                u.isActive
                                    ? 'border-white/[0.06] hover:border-indigo-500/20'
                                    : 'border-white/[0.03] opacity-50'
                            }`}
                        >
                            {/* Top accent line */}
                            <div className={`absolute top-0 left-6 right-6 h-px rounded-full ${u.isActive ? 'bg-gradient-to-r from-indigo-500/60 via-purple-500/40 to-transparent' : 'bg-white/10'}`} />

                            {/* Card Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 font-bold text-sm flex-shrink-0">
                                        {getInitials(u.name)}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2">
                                            {u.name}
                                        </h3>
                                        <p className="text-white/30 text-xs mt-0.5">{formatDate(u.createdAt)}</p>
                                    </div>
                                </div>
                                <span className={`flex-shrink-0 ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                    u.isActive
                                        ? 'bg-emerald-500/10 text-emerald-400'
                                        : 'bg-white/5 text-white/30'
                                }`}>
                                    {u.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            {/* Join Code */}
                            <div className="flex items-center justify-between bg-indigo-500/[0.06] border border-indigo-500/10 rounded-xl px-3 py-2 mb-3">
                                <span className="text-white/30 text-xs font-medium uppercase tracking-widest">Join Code</span>
                                <span className="font-mono font-bold text-indigo-300 tracking-widest text-sm">{u.joinCode}</span>
                            </div>

                            {/* Admin Info */}
                            <div className="border border-white/[0.04] rounded-xl px-3 py-2.5 mb-4">
                                <p className="text-white/20 text-xs font-semibold uppercase tracking-wider mb-1.5">University Admin</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-purple-600/20 flex items-center justify-center text-purple-400 text-xs font-bold flex-shrink-0">
                                        {u.adminName ? u.adminName.charAt(0) : '?'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-white/70 text-xs font-medium truncate">{u.adminName || '—'}</p>
                                        <p className="text-white/30 text-xs truncate">{u.adminEmail || '—'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <button
                                onClick={() => handleToggle(u.id)}
                                disabled={togglingId === u.id}
                                className={`w-full py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                                    u.isActive
                                        ? 'bg-red-500/5 border border-red-500/10 text-red-400 hover:bg-red-500/10 hover:border-red-500/20'
                                        : 'bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/20'
                                } disabled:opacity-40 disabled:cursor-not-allowed`}
                            >
                                {togglingId === u.id
                                    ? 'Updating...'
                                    : u.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* ══════════════════════════════════════════════
                CREATE UNIVERSITY MODAL
            ══════════════════════════════════════════════ */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="bg-[#0d0d14] border border-white/[0.08] rounded-2xl w-full max-w-lg shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-indigo-600/20 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <h2 className="text-white font-semibold">Register University</h2>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white/70 transition-all text-sm"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-5">
                            <p className="text-white/30 text-sm mb-5 leading-relaxed">
                                Creates the university workspace and generates a unique join code.
                                The admin credentials you set here are handed directly to the university.
                            </p>

                            {/* Error */}
                            {error && (
                                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
                                    <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-red-400 text-sm">{error}</p>
                                </div>
                            )}

                            <form id="create-university-form" onSubmit={handleCreate} className="space-y-4">
                                {/* University Name */}
                                <div>
                                    <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-1.5">
                                        University Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. SRM Institute of Science and Technology"
                                        value={form.universityName}
                                        onChange={e => setForm({ ...form, universityName: e.target.value })}
                                        required
                                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all"
                                    />
                                </div>

                                {/* Divider */}
                                <div className="flex items-center gap-3 py-1">
                                    <div className="flex-1 h-px bg-white/[0.06]" />
                                    <span className="text-xs font-semibold text-indigo-400/70 uppercase tracking-widest">Admin Credentials</span>
                                    <div className="flex-1 h-px bg-white/[0.06]" />
                                </div>

                                {/* Admin Name */}
                                <div>
                                    <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-1.5">
                                        Admin Full Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Dr. Ramesh Kumar"
                                        value={form.adminName}
                                        onChange={e => setForm({ ...form, adminName: e.target.value })}
                                        required
                                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all"
                                    />
                                </div>

                                {/* Admin Email */}
                                <div>
                                    <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-1.5">
                                        Admin Email
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="e.g. admin@university.edu.in"
                                        value={form.adminEmail}
                                        onChange={e => setForm({ ...form, adminEmail: e.target.value })}
                                        required
                                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all"
                                    />
                                </div>

                                {/* Admin Password */}
                                <div>
                                    <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-1.5">
                                        Admin Password
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="Minimum 6 characters"
                                        value={form.adminPassword}
                                        onChange={e => setForm({ ...form, adminPassword: e.target.value })}
                                        minLength={6}
                                        required
                                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all"
                                    />
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.06]">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-sm text-white/40 hover:text-white/70 bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.06] rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="create-university-form"
                                disabled={creating}
                                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/20"
                            >
                                {creating && (
                                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                )}
                                {creating ? 'Creating...' : 'Create University'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════
                SUCCESS — CREDENTIALS MODAL
            ══════════════════════════════════════════════ */}
            {showCredentials && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setShowCredentials(null)}
                >
                    <div
                        className="bg-[#0d0d14] border border-white/[0.08] rounded-2xl w-full max-w-md shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Success Header */}
                        <div className="flex flex-col items-center pt-8 pb-5 px-6 border-b border-white/[0.06]">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-white font-semibold text-base">University Created!</h2>
                            <p className="text-white/30 text-xs mt-1 text-center leading-relaxed">
                                Share these credentials with the university admin. Save the join code — it cannot be regenerated.
                            </p>
                        </div>

                        {/* Credentials */}
                        <div className="px-6 py-5 space-y-3">
                            {[
                                { label: 'University', value: showCredentials.name, mono: false },
                                { label: 'Join Code', value: showCredentials.joinCode, mono: true },
                                { label: 'Admin Name', value: showCredentials.adminName, mono: false },
                                { label: 'Admin Email', value: showCredentials.adminEmail, mono: false },
                            ].map(item => (
                                <div key={item.label} className="flex items-center justify-between bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-2.5">
                                    <span className="text-white/30 text-xs font-semibold uppercase tracking-wider">{item.label}</span>
                                    <span className={`text-sm font-semibold text-white/80 text-right max-w-[60%] truncate ${item.mono ? 'font-mono text-indigo-300 tracking-widest' : ''}`}>
                                        {item.value}
                                    </span>
                                </div>
                            ))}

                            {/* Warning */}
                            <div className="flex items-start gap-2 bg-amber-500/[0.06] border border-amber-500/10 rounded-xl px-4 py-3">
                                <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <p className="text-amber-400/80 text-xs leading-relaxed">
                                    The password is hashed and cannot be retrieved. Make sure the admin saves it now.
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 pb-6">
                            <button
                                onClick={() => setShowCredentials(null)}
                                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/20"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </AdminLayout>
    );
};

export default Universities;
