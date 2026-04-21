import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, BookOpen, PlusCircle, MessageSquare, UserCircle,
    GraduationCap, Bell, Search, ChevronDown, Lock, LogOut,
    Clock, ShieldX, AlertTriangle, CheckCircle2, ArrowRight, Mail,
    Settings, User as UserIcon, Sparkles, PartyPopper, RefreshCw,
} from 'lucide-react';

// Poll every 8s while on waiting room.
// For APPROVED instructors who are active in the dashboard, a separate
// hook (useStatusWatcher) is exported for use in InstructorLayout.
const POLL_INTERVAL_MS = 8000;

const LOCKED_NAV_LINKS = [
    { icon: LayoutDashboard, label: 'Dashboard' },
    { icon: BookOpen, label: 'My Courses' },
    { icon: PlusCircle, label: 'Create Course' },
    { icon: MessageSquare, label: 'Messages' },
];

const UNLOCKED_NAV_LINKS = [
    { icon: UserCircle, label: 'Profile', to: '/instructor/profile' },
];

const STEPS = [
    { label: 'Application submitted', done: true },
    { label: 'Documents received', done: true },
    { label: 'Admin review in progress', done: false, active: true },
    { label: 'Approval decision', done: false },
];

const APPROVED_STEPS = [
    { label: 'Application submitted', done: true },
    { label: 'Documents received', done: true },
    { label: 'Admin review complete', done: true },
    { label: 'Access granted!', done: true },
];

// ─────────────────────────────────────────────
// Exported hook — drop this into InstructorLayout
// so active instructors are kicked out the moment
// admin removes them, without needing a re-login.
// ─────────────────────────────────────────────
export function useStatusWatcher() {
    const { user, refreshUser, updateLocalUser } = useAuth();
    const navigate = useNavigate();
    const intervalRef = useRef(null);

    useEffect(() => {
        // Only watch approved instructors who are actively using the dashboard
        if (!user || user.role !== 'instructor') return;
        if (user.profile?.approvalStatus !== 'APPROVED') return;

        const watch = async () => {
            const fresh = await refreshUser();
            if (!fresh) return;
            const newStatus = fresh.profile?.approvalStatus;
            if (newStatus === 'REMOVED') {
                updateLocalUser(fresh);
                clearInterval(intervalRef.current);
                navigate('/instructor/waiting-hall', { replace: true });
            }
        };

        // Start watching after a 10s grace period
        const timer = setTimeout(() => {
            intervalRef.current = setInterval(watch, POLL_INTERVAL_MS);
        }, 10000);

        return () => {
            clearTimeout(timer);
            clearInterval(intervalRef.current);
        };
    }, [user?.profile?.approvalStatus]);
}

// ─────────────────────────────────────────────
// Confetti
// ─────────────────────────────────────────────
const CONFETTI_COLORS = [
    '#818cf8', '#c084fc', '#34d399', '#fbbf24',
    '#f472b6', '#60a5fa', '#a3e635', '#fb923c',
];

function ConfettiParticle({ delay, x, color, shape }) {
    return (
        <motion.div
            initial={{ y: -20, x, opacity: 1, rotate: 0, scale: 1 }}
            animate={{ y: 750, opacity: 0, rotate: 720, scale: 0.2 }}
            transition={{ duration: 2.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
                position: 'absolute', top: 0, left: '50%',
                width: shape === 'rect' ? 12 : 9,
                height: shape === 'rect' ? 6 : 9,
                borderRadius: shape === 'circle' ? '50%' : shape === 'rect' ? '2px' : '3px',
                background: color,
                pointerEvents: 'none',
            }}
        />
    );
}

function ConfettiBurst() {
    const shapes = ['circle', 'rect', 'square'];
    const particles = Array.from({ length: 70 }, (_, i) => ({
        id: i,
        delay: Math.random() * 0.7,
        x: (Math.random() - 0.5) * 600,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        shape: shapes[i % shapes.length],
    }));
    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 100 }}>
            {particles.map(p => <ConfettiParticle key={p.id} {...p} />)}
        </div>
    );
}

// ─────────────────────────────────────────────
// Approval celebration
// ─────────────────────────────────────────────
function ApprovalCelebration({ name, onRedirect }) {
    useEffect(() => {
        const t = setTimeout(onRedirect, 4000);
        return () => clearTimeout(t);
    }, [onRedirect]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(4,4,10,0.93)', backdropFilter: 'blur(14px)' }}
        >
            <ConfettiBurst />
            <motion.div
                initial={{ scale: 0.84, opacity: 0, y: 28 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: 'spring', bounce: 0.32, duration: 0.7, delay: 0.1 }}
                className="relative z-10 w-full max-w-md mx-4"
            >
                <div className="bg-bg-surface/95 border border-white/10 rounded-3xl overflow-hidden shadow-[0_40px_120px_rgba(52,211,153,0.18)]">
                    <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
                    <div className="p-10 text-center">
                        {/* Checkmark */}
                        <div className="flex justify-center mb-8">
                            <div className="relative">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', bounce: 0.5, duration: 0.6, delay: 0.2 }}
                                    className="w-24 h-24 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center"
                                >
                                    <motion.div
                                        initial={{ scale: 0, rotate: -90 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: 'spring', bounce: 0.4, duration: 0.5, delay: 0.45 }}
                                    >
                                        <CheckCircle2 className="w-12 h-12 text-emerald-400" strokeWidth={1.5} />
                                    </motion.div>
                                </motion.div>
                                {[0, 0.3, 0.6].map((d, i) => (
                                    <motion.div key={i}
                                        initial={{ scale: 1, opacity: 0.6 }}
                                        animate={{ scale: 2.4 + i * 0.4, opacity: 0 }}
                                        transition={{ duration: 1.8, delay: 0.5 + d, repeat: 1, ease: 'easeOut' }}
                                        className="absolute inset-0 rounded-full border border-emerald-400/40"
                                    />
                                ))}
                                {[{ top: '-8px', right: '-8px' }, { bottom: '-4px', left: '-12px' }, { top: '8px', left: '-16px' }]
                                    .map((pos, i) => (
                                        <motion.div key={i}
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 0.7 + i * 0.15, duration: 0.3 }}
                                            style={{ position: 'absolute', ...pos }}
                                        >
                                            <Sparkles size={16} className="text-amber-400" />
                                        </motion.div>
                                    ))}
                            </div>
                        </div>

                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 mb-4">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.15em]">Application Approved</span>
                            </div>
                            <h2 className="text-3xl font-bold text-white tracking-tight mb-3 leading-tight"
                                style={{ fontFamily: "'Sora', system-ui, sans-serif" }}>
                                Welcome aboard,<br />
                                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                                    {name?.split(' ')[0]}!
                                </span>
                            </h2>
                            <p className="text-sm text-neutral-400 leading-relaxed mb-8">
                                You're now a verified EduForge instructor. Your dashboard is ready — let's build something incredible.
                            </p>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
                            className="space-y-2.5 bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 mb-8"
                        >
                            {APPROVED_STEPS.map((step, i) => (
                                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.7 + i * 0.1 }} className="flex items-center gap-3"
                                >
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-emerald-500/15 border border-emerald-500/35">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    </div>
                                    <span className={`text-sm ${i === APPROVED_STEPS.length - 1 ? 'text-emerald-300 font-semibold' : 'text-neutral-300'}`}>
                                        {step.label}
                                    </span>
                                    {i === APPROVED_STEPS.length - 1 && <PartyPopper size={14} className="text-amber-400 ml-auto" />}
                                </motion.div>
                            ))}
                        </motion.div>

                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                            className="flex items-center justify-center gap-3"
                        >
                            <motion.div className="h-0.5 rounded-full bg-emerald-500/40"
                                initial={{ width: 0 }} animate={{ width: 160 }}
                                transition={{ duration: 4, ease: 'linear' }}
                            />
                            <span className="text-xs text-neutral-600 whitespace-nowrap">Redirecting to dashboard...</span>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─────────────────────────────────────────────
// Reinstatement celebration (REMOVED → back to PENDING/APPROVED)
// ─────────────────────────────────────────────
function ReinstateCelebration({ name, targetStatus, onDone }) {
    const goingToApproved = targetStatus === 'APPROVED';

    useEffect(() => {
        const t = setTimeout(onDone, 3500);
        return () => clearTimeout(t);
    }, [onDone]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(4,4,10,0.93)', backdropFilter: 'blur(14px)' }}
        >
            {goingToApproved && <ConfettiBurst />}
            <motion.div
                initial={{ scale: 0.88, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: 'spring', bounce: 0.3, duration: 0.65, delay: 0.1 }}
                className="relative z-10 w-full max-w-md mx-4"
            >
                <div className="bg-bg-surface/95 border border-white/10 rounded-3xl overflow-hidden shadow-[0_40px_120px_rgba(99,102,241,0.2)]">
                    <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />
                    <div className="p-10 text-center">
                        <div className="flex justify-center mb-7">
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', bounce: 0.45, duration: 0.7, delay: 0.2 }}
                                className="w-20 h-20 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center"
                            >
                                <RefreshCw className="w-9 h-9 text-indigo-400" strokeWidth={1.4} />
                            </motion.div>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.15em]">Account Reinstated</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight mb-3 leading-tight"
                            style={{ fontFamily: "'Sora', system-ui, sans-serif" }}>
                            Welcome back, {name?.split(' ')[0]}!
                        </h2>
                        <p className="text-sm text-neutral-400 leading-relaxed mb-6">
                            {goingToApproved
                                ? 'Your instructor account has been reinstated with full access. Redirecting you to the dashboard.'
                                : 'Your account has been reinstated and is now under review again.'}
                        </p>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                            className="flex items-center justify-center gap-3"
                        >
                            <motion.div className="h-0.5 rounded-full bg-indigo-500/40"
                                initial={{ width: 0 }} animate={{ width: 140 }}
                                transition={{ duration: 3.5, ease: 'linear' }}
                            />
                            <span className="text-xs text-neutral-600 whitespace-nowrap">
                                {goingToApproved ? 'Going to dashboard...' : 'Updating status...'}
                            </span>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─────────────────────────────────────────────
// Removal notice (shown when admin removes an active APPROVED instructor)
// ─────────────────────────────────────────────
function RemovalNotice({ onAcknowledge }) {
    useEffect(() => {
        // Auto-dismiss after 5s so the waiting room renders underneath
        const t = setTimeout(onAcknowledge, 5000);
        return () => clearTimeout(t);
    }, [onAcknowledge]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(4,4,10,0.94)', backdropFilter: 'blur(14px)' }}
        >
            <motion.div
                initial={{ scale: 0.88, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: 'spring', bounce: 0.28, duration: 0.65, delay: 0.1 }}
                className="relative z-10 w-full max-w-md mx-4"
            >
                <div className="bg-bg-surface/95 border border-white/10 rounded-3xl overflow-hidden shadow-[0_40px_120px_rgba(239,68,68,0.15)]">
                    <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-red-500 to-transparent" />
                    <div className="p-10 text-center">
                        <div className="flex justify-center mb-7">
                            <div className="relative">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', bounce: 0.4, duration: 0.6, delay: 0.2 }}
                                    className="w-20 h-20 rounded-2xl bg-error-500/10 border border-error-400/25 flex items-center justify-center"
                                >
                                    <ShieldX className="w-9 h-9 text-error-400" strokeWidth={1.4} />
                                </motion.div>
                                <motion.div
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                                    transition={{ duration: 2, repeat: 2, ease: 'easeOut' }}
                                    className="absolute inset-0 rounded-2xl border border-error-400/25"
                                />
                            </div>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-error-500/10 border border-error-400/20 mb-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-error-400" />
                            <span className="text-[10px] font-bold text-error-400 uppercase tracking-[0.15em]">Access Revoked</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight mb-3 leading-tight"
                            style={{ fontFamily: "'Sora', system-ui, sans-serif" }}>
                            Your access has been removed
                        </h2>
                        <p className="text-sm text-neutral-400 leading-relaxed mb-8">
                            An admin has revoked your instructor privileges. Contact support if you believe this was a mistake.
                        </p>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                            className="flex items-center justify-center gap-3 mb-4"
                        >
                            <motion.div className="h-0.5 rounded-full bg-error-500/40"
                                initial={{ width: 0 }} animate={{ width: 140 }}
                                transition={{ duration: 5, ease: 'linear' }}
                            />
                            <span className="text-xs text-neutral-600 whitespace-nowrap">Redirecting...</span>
                        </motion.div>
                        <button onClick={onAcknowledge}
                            className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors underline underline-offset-4"
                        >
                            Continue now
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────
function LockedSidebar({ userName, onLogout, navigate }) {
    const [hovered, setHovered] = useState(false);
    const initials = userName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'IN';

    const lv = {
        hidden: { opacity: 0, transition: { duration: 0.1 } },
        visible: { opacity: 1, transition: { duration: 0.18, delay: 0.18 } },
    };

    return (
        <motion.aside
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            animate={{ width: hovered ? 260 : 80 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.38 }}
            style={{ minWidth: 80 }}
            className="fixed top-0 left-0 h-screen bg-bg-base border-r border-neutral-800 z-50 overflow-hidden flex flex-col"
        >
            <div className="w-[260px] flex flex-col h-full">
                {/* Brand */}
                <div className="h-20 flex items-center px-5 border-b border-neutral-800/50 shrink-0 select-none">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                        <GraduationCap className="text-white h-5 w-5" />
                    </div>
                    <motion.div variants={lv} animate={hovered ? 'visible' : 'hidden'} className="ml-4 overflow-hidden">
                        <h1 className="text-xl font-bold tracking-tight text-white whitespace-nowrap">EduForge</h1>
                        <p className="text-xs text-indigo-400 font-medium tracking-wider uppercase whitespace-nowrap">Instructor Portal</p>
                    </motion.div>
                </div>

                {/* User chip */}
                <motion.div variants={lv} animate={hovered ? 'visible' : 'hidden'}
                    className="mx-4 mt-4 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-center gap-3 shrink-0"
                >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-bold text-bg-base shrink-0">
                        {initials}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-neutral-200 truncate leading-tight whitespace-nowrap">{userName}</p>
                        <p className="text-xs text-amber-400/70 mt-0.5 whitespace-nowrap">Pending approval</p>
                    </div>
                </motion.div>

                {/* Nav */}
                <div className="flex-1 py-5 px-4 flex flex-col gap-1 overflow-y-auto overflow-x-hidden">
                    {LOCKED_NAV_LINKS.map(({ icon: Icon, label }) => (
                        <div key={label} className="flex items-center h-12 rounded-xl relative select-none shrink-0"
                            style={{ opacity: 0.35, cursor: 'not-allowed' }}
                        >
                            <div className="w-12 h-12 flex items-center justify-center shrink-0 relative">
                                <Icon className="h-5 w-5 text-neutral-500" />
                                <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-bg-base flex items-center justify-center">
                                    <Lock className="w-2 h-2 text-neutral-600" />
                                </div>
                            </div>
                            <motion.div variants={lv} animate={hovered ? 'visible' : 'hidden'}
                                className="flex items-center gap-2 pr-4 overflow-hidden"
                            >
                                <span className="text-sm font-medium text-neutral-500 whitespace-nowrap">{label}</span>
                                <Lock className="w-3 h-3 text-neutral-700 shrink-0" />
                            </motion.div>
                        </div>
                    ))}

                    {/* Divider */}
                    <motion.div variants={lv} animate={hovered ? 'visible' : 'hidden'} className="mx-2 my-1.5 shrink-0">
                        <div className="border-t border-neutral-800/60" />
                        <p className="text-[9px] font-semibold text-neutral-600 uppercase tracking-[0.15em] mt-2 mb-0.5 px-2 whitespace-nowrap">
                            Available now
                        </p>
                    </motion.div>

                    {/* Unlocked — Profile */}
                    {UNLOCKED_NAV_LINKS.map(({ icon: Icon, label, to }) => (
                        <button key={label} onClick={() => navigate(to)}
                            className="flex items-center h-12 rounded-xl cursor-pointer group transition-all duration-200 hover:bg-neutral-800/50 text-neutral-400 hover:text-neutral-200 w-full text-left shrink-0 overflow-hidden"
                        >
                            <div className="w-12 h-12 flex items-center justify-center shrink-0">
                                <Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                            </div>
                            <motion.div variants={lv} animate={hovered ? 'visible' : 'hidden'}
                                className="flex items-center gap-2 pr-4 overflow-hidden"
                            >
                                <span className="text-sm font-medium whitespace-nowrap">{label}</span>
                                <span className="text-[9px] font-semibold text-emerald-500/70 uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/15 rounded-full px-1.5 py-0.5 whitespace-nowrap shrink-0">
                                    Unlocked
                                </span>
                            </motion.div>
                        </button>
                    ))}
                </div>

                {/* Bottom */}
                <div className="px-4 pb-5 flex flex-col gap-2 shrink-0">
                    <motion.div variants={lv} animate={hovered ? 'visible' : 'hidden'}
                        className="p-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/15"
                    >
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse shrink-0" />
                            <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest whitespace-nowrap">Awaiting Approval</span>
                        </div>
                        <p className="text-[11px] text-neutral-500 leading-relaxed whitespace-nowrap">
                            Full access unlocks once an admin approves.
                        </p>
                    </motion.div>

                    <button onClick={onLogout}
                        className="flex items-center h-11 rounded-xl w-full group transition-all duration-200 hover:bg-error-500/10 overflow-hidden"
                    >
                        <div className="w-12 h-11 flex items-center justify-center shrink-0">
                            <LogOut size={18} className="text-error-400/70 group-hover:text-error-400 transition-colors" />
                        </div>
                        <motion.span variants={lv} animate={hovered ? 'visible' : 'hidden'}
                            className="text-sm font-medium text-error-400/70 group-hover:text-error-400 whitespace-nowrap transition-colors"
                        >
                            Logout
                        </motion.span>
                    </button>
                </div>
            </div>
        </motion.aside>
    );
}

// ─────────────────────────────────────────────
// Topbar
// ─────────────────────────────────────────────
function LockedTopbar({ user, onLogout, navigate }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const h = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    return (
        <header className="h-16 w-full flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30 bg-bg-base/80 backdrop-blur-md border-b border-neutral-800/60 shrink-0">
            <div className="hidden sm:flex items-center bg-neutral-900 border border-neutral-800 rounded-full px-4 py-2 w-64 md:w-80 opacity-40 cursor-not-allowed">
                <Search size={15} className="text-neutral-600" />
                <span className="ml-3 text-sm text-neutral-600 select-none">Search courses...</span>
            </div>
            <div className="flex items-center gap-4">
                <button className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-600 cursor-not-allowed opacity-40 relative" tabIndex={-1}>
                    <Bell size={18} />
                    <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-neutral-700 ring-2 ring-bg-base" />
                </button>
                <div className="h-6 w-px bg-neutral-800/60 hidden sm:block" />
                <div className="relative" ref={dropdownRef}>
                    <button onClick={() => setDropdownOpen(v => !v)}
                        className="flex items-center gap-2.5 pr-2 py-1 pl-1 rounded-full border border-neutral-800/50 hover:border-neutral-700/60 hover:bg-white/[0.03] transition-all outline-none"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xs text-white shadow-lg shadow-indigo-500/20">
                            {user?.name?.charAt(0)?.toUpperCase() || 'I'}
                        </div>
                        <div className="hidden md:flex items-center gap-2">
                            <div className="text-left">
                                <p className="text-[0.85rem] font-semibold text-neutral-200 leading-tight">{user?.name || 'Instructor'}</p>
                                <p className="text-[0.7rem] text-amber-400/70 font-medium mt-0.5">Pending approval</p>
                            </div>
                            <ChevronDown size={14} className={`text-neutral-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </div>
                    </button>
                    <AnimatePresence>
                        {dropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                                className="absolute right-0 top-full mt-2 w-52 bg-bg-base border border-neutral-800 rounded-2xl shadow-2xl shadow-black/60 py-1.5 z-50 overflow-hidden"
                            >
                                <div className="px-4 py-3 border-b border-neutral-800/60 mb-1">
                                    <p className="text-sm font-semibold text-neutral-200 leading-tight">{user?.name}</p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                        <p className="text-[11px] text-amber-400/70 font-medium">Pending approval</p>
                                    </div>
                                </div>
                                <div className="px-2">
                                    <button onClick={() => { setDropdownOpen(false); navigate('/instructor/profile'); }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-300 hover:text-white hover:bg-white/[0.05] rounded-xl transition-colors"
                                    >
                                        <UserIcon size={15} className="text-neutral-400" />
                                        My Profile
                                        <span className="ml-auto text-[9px] font-bold text-emerald-500/70 uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/15 rounded-full px-1.5 py-0.5">
                                            Unlocked
                                        </span>
                                    </button>
                                    <div className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl opacity-35 cursor-not-allowed select-none">
                                        <Settings size={15} className="text-neutral-500" />
                                        <span className="text-neutral-500">Settings</span>
                                        <Lock size={11} className="ml-auto text-neutral-700" />
                                    </div>
                                </div>
                                <div className="mt-1 px-2 pt-1 border-t border-neutral-800/60">
                                    <button onClick={() => { setDropdownOpen(false); onLogout(); }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-error-400/80 hover:text-error-400 hover:bg-error-500/10 rounded-xl transition-colors"
                                    >
                                        <LogOut size={15} />
                                        Log Out
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}

// ─────────────────────────────────────────────
// Ghost skeleton
// ─────────────────────────────────────────────
function GhostDashboard() {
    return (
        <div className="p-6 lg:p-8 pointer-events-none select-none" aria-hidden="true">
            <div className="flex items-start justify-between mb-8">
                <div>
                    <div className="h-9 w-72 rounded-xl bg-neutral-800/50 mb-3" />
                    <div className="h-4 w-52 rounded-lg bg-neutral-800/35" />
                </div>
                <div className="h-11 w-36 rounded-xl bg-indigo-500/[0.08] border border-indigo-500/[0.08]" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {[0, 1, 2, 3].map(i => (
                    <div key={i} className="rounded-2xl bg-neutral-900/60 border border-neutral-800/40 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-3 w-20 rounded bg-neutral-800/60" />
                            <div className="w-8 h-8 rounded-xl bg-neutral-800/40" />
                        </div>
                        <div className="h-8 w-10 rounded-lg bg-neutral-800/55" />
                    </div>
                ))}
            </div>
            <div className="flex items-center justify-between mb-5">
                <div className="h-5 w-36 rounded-lg bg-neutral-800/55" />
                <div className="h-4 w-20 rounded bg-neutral-800/35" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[0, 1].map(i => (
                    <div key={i} className="rounded-2xl overflow-hidden bg-neutral-900/50 border border-neutral-800/35">
                        <div className="h-44 bg-neutral-800/35" />
                        <div className="p-5">
                            <div className="h-5 w-3/4 rounded-lg bg-neutral-800/55 mb-2.5" />
                            <div className="h-3.5 w-1/2 rounded bg-neutral-800/35 mb-4" />
                            <div className="flex gap-4">
                                {[12, 10, 10].map((w, j) => <div key={j} className={`h-3 w-${w} rounded bg-neutral-800/45`} />)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Status overlays (Pending / Rejected / Flagged / Removed)
// ─────────────────────────────────────────────
function PendingOverlay({ name, lastChecked }) {
    return (
        <motion.div initial={{ opacity: 0, scale: 0.96, y: 14 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', bounce: 0.22, duration: 0.65 }} className="w-full max-w-md"
        >
            <div className="bg-bg-surface/95 border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.75)] backdrop-blur-2xl">
                <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                <Clock className="w-9 h-9 text-indigo-400" strokeWidth={1.3} />
                            </div>
                            <motion.div animate={{ scale: [1, 1.55, 1], opacity: [0.4, 0, 0.4] }}
                                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeOut' }}
                                className="absolute inset-0 rounded-2xl border border-indigo-400/25"
                            />
                        </div>
                    </div>
                    <div className="text-center mb-7">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
                            <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.8, repeat: Infinity }}
                                className="w-1.5 h-1.5 rounded-full bg-indigo-400 block"
                            />
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.15em]">Under Review</span>
                        </div>
                        <h2 className="text-[1.6rem] font-bold text-white tracking-tight mb-2 leading-tight"
                            style={{ fontFamily: "'Sora', system-ui, sans-serif" }}>Application in progress</h2>
                        <p className="text-sm text-neutral-400 leading-relaxed">
                            Hi <span className="text-neutral-200 font-semibold">{name?.split(' ')[0]}</span>! Your documents are being reviewed. You'll get full dashboard access once approved.
                        </p>
                    </div>
                    <div className="space-y-3 mb-6 bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4">
                        {STEPS.map((step, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${step.done ? 'bg-emerald-500/15 border border-emerald-500/35' : step.active ? 'bg-indigo-500/15 border border-indigo-500/35' : 'bg-neutral-800/80 border border-neutral-700/60'}`}>
                                    {step.done ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                        : step.active ? <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.4, repeat: Infinity }} className="w-2 h-2 rounded-full bg-indigo-400 block" />
                                            : <span className="w-1.5 h-1.5 rounded-full bg-neutral-600 block" />}
                                </div>
                                <span className={`text-sm flex-1 ${step.done ? 'text-neutral-300' : step.active ? 'text-indigo-300 font-medium' : 'text-neutral-600'}`}>{step.label}</span>
                                {step.active && <span className="text-[10px] text-indigo-400/60 font-mono">in progress</span>}
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}
                            className="flex items-center gap-1"
                        >
                            {[0, 1, 2].map(i => <span key={i} className="w-1 h-1 rounded-full bg-neutral-700 block" />)}
                        </motion.div>
                        <span className="text-[11px] text-neutral-700 font-mono">
                            checking for updates{lastChecked && <span className="text-neutral-800"> · {lastChecked}</span>}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function RejectedOverlay({ profile }) {
    return (
        <motion.div initial={{ opacity: 0, scale: 0.96, y: 14 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', bounce: 0.22, duration: 0.65 }} className="w-full max-w-md"
        >
            <div className="bg-bg-surface/95 border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.75)] backdrop-blur-2xl">
                <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-rose-500 to-transparent" />
                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 rounded-2xl bg-error-500/10 border border-error-400/20 flex items-center justify-center">
                            <ShieldX className="w-9 h-9 text-error-400" strokeWidth={1.3} />
                        </div>
                    </div>
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-error-500/10 border border-error-400/20 mb-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-error-400" />
                            <span className="text-[10px] font-bold text-error-400 uppercase tracking-[0.15em]">Application Declined</span>
                        </div>
                        <h2 className="text-[1.6rem] font-bold text-white tracking-tight mb-2 leading-tight"
                            style={{ fontFamily: "'Sora', system-ui, sans-serif" }}>Access not granted</h2>
                        <p className="text-sm text-neutral-400 leading-relaxed">We were unable to approve your instructor application at this time.</p>
                    </div>
                    {profile.rejectionReason && (
                        <div className="bg-error-500/8 border border-error-400/15 rounded-2xl p-4 mb-6 relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-rose-500/80 to-transparent rounded-l-2xl" />
                            <p className="text-[10px] font-semibold text-error-400 uppercase tracking-wider mb-2 pl-3">Admin Feedback</p>
                            <p className="text-sm text-error-400/75 leading-relaxed pl-3 italic">"{profile.rejectionReason}"</p>
                        </div>
                    )}
                    <a href="mailto:support@eduforge.com"
                        className="flex items-center justify-center gap-2.5 w-full py-3 rounded-2xl bg-white/[0.04] border border-white/[0.07] text-sm font-medium text-neutral-300 hover:bg-white/[0.07] hover:text-white transition-all"
                    >
                        <Mail size={15} /> Contact support to appeal
                        <ArrowRight size={13} className="text-neutral-500 ml-auto" />
                    </a>
                </div>
            </div>
        </motion.div>
    );
}

function FlaggedOverlay({ profile }) {
    return (
        <motion.div initial={{ opacity: 0, scale: 0.96, y: 14 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', bounce: 0.22, duration: 0.65 }} className="w-full max-w-md"
        >
            <div className="bg-bg-surface/95 border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.75)] backdrop-blur-2xl">
                <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                <AlertTriangle className="w-9 h-9 text-amber-400" strokeWidth={1.3} />
                            </div>
                            <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.35, 0, 0.35] }}
                                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeOut' }}
                                className="absolute inset-0 rounded-2xl border border-amber-400/25"
                            />
                        </div>
                    </div>
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
                            <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                                className="w-1.5 h-1.5 rounded-full bg-amber-400 block"
                            />
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.15em]">Action Required</span>
                        </div>
                        <h2 className="text-[1.6rem] font-bold text-white tracking-tight mb-2 leading-tight"
                            style={{ fontFamily: "'Sora', system-ui, sans-serif" }}>Almost there</h2>
                        <p className="text-sm text-neutral-400 leading-relaxed">A few items need your attention before we can approve your profile.</p>
                    </div>
                    {profile.flagMessage && (
                        <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-5 mb-6 relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-amber-400/80 to-transparent rounded-l-2xl" />
                            <div className="flex items-center gap-2 mb-3 pl-3">
                                <Mail size={11} className="text-amber-400" />
                                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Message from Admin</span>
                            </div>
                            <div className="bg-black/20 rounded-xl p-3.5 border border-white/[0.04] ml-3">
                                <p className="text-sm text-amber-200/80 leading-relaxed italic">"{profile.flagMessage}"</p>
                            </div>
                        </div>
                    )}
                    <a href="mailto:admin@eduforge.com"
                        className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl bg-amber-400 text-bg-base text-sm font-bold hover:bg-amber-300 active:scale-[0.98] transition-all shadow-lg shadow-primary-500/20"
                    >
                        <Mail size={15} /> Resolve via email
                    </a>
                </div>
            </div>
        </motion.div>
    );
}

function RemovedOverlay() {
    const REMOVED_TIMELINE = [
        { label: 'Application submitted', strikethrough: false },
        { label: 'Application approved', strikethrough: false },
        { label: 'Active instructor', strikethrough: false },
        { label: 'Access revoked by admin', revoked: true },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', bounce: 0.22, duration: 0.65 }}
            className="w-full max-w-md"
        >
            <div className="bg-bg-surface/95 border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(239,68,68,0.12),0_0_0_1px_rgba(239,68,68,0.08)] backdrop-blur-2xl relative">
                {/* Shimmer sweep */}
                <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: '250%' }}
                    transition={{ duration: 3.5, ease: 'easeInOut', delay: 0.4 }}
                    className="absolute top-0 left-0 w-1/3 h-full pointer-events-none z-10"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.06), transparent)' }}
                />

                {/* Top accent — animated width */}
                <div className="relative h-[3px] w-full overflow-hidden">
                    <motion.div
                        initial={{ scaleX: 0, originX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500 to-transparent"
                    />
                </div>

                <div className="p-8">
                    {/* Icon with rings */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <motion.div
                                initial={{ scale: 0, rotate: -30 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', bounce: 0.35, duration: 0.6, delay: 0.2 }}
                                className="w-20 h-20 rounded-2xl bg-error-500/10 border border-error-400/25 flex items-center justify-center relative overflow-hidden"
                            >
                                {/* Inner glow sweep */}
                                <motion.div
                                    animate={{ x: ['-120%', '220%'] }}
                                    transition={{ duration: 2.5, ease: 'easeInOut', delay: 0.6, repeat: Infinity, repeatDelay: 4 }}
                                    className="absolute inset-0 pointer-events-none"
                                    style={{ background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.15), transparent)', width: '60%' }}
                                />
                                <ShieldX className="w-9 h-9 text-error-400 relative z-10" strokeWidth={1.3} />
                            </motion.div>

                            {/* Pulsing rings — same pattern as Pending/Flagged */}
                            {[0, 0.4, 0.8].map((delay, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 1, opacity: 0 }}
                                    animate={{ scale: [1, 1.6 + i * 0.3], opacity: [0.5, 0] }}
                                    transition={{ duration: 2.2, delay: 0.6 + delay, repeat: Infinity, ease: 'easeOut' }}
                                    className="absolute inset-0 rounded-2xl border border-error-400/30"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Badge + heading */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35, duration: 0.45 }}
                        className="text-center mb-7"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-error-500/10 border border-error-400/20 mb-4">
                            <motion.span
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-1.5 h-1.5 rounded-full bg-error-400 block"
                            />
                            <span className="text-[10px] font-bold text-error-400 uppercase tracking-[0.15em]">Account Suspended</span>
                        </div>
                        <h2
                            className="text-[1.6rem] font-bold text-white tracking-tight mb-2 leading-tight"
                            style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
                        >
                            Access <span style={{ color: '#f87171' }}>removed</span>
                        </h2>
                        <p className="text-sm text-neutral-400 leading-relaxed max-w-xs mx-auto">
                            An admin has revoked your instructor privileges. Your courses remain intact. Contact support to appeal this decision.
                        </p>
                    </motion.div>

                    {/* Timeline showing the revocation clearly */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                        className="space-y-2.5 mb-7 bg-error-500/[0.04] border border-error-400/10 rounded-2xl p-4"
                    >
                        {REMOVED_TIMELINE.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.55 + i * 0.08 }}
                                className="flex items-center gap-3"
                            >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${item.revoked
                                        ? 'bg-error-500/20 border border-error-400/40'
                                        : 'bg-neutral-800/80 border border-neutral-700/50'
                                    }`}>
                                    {item.revoked ? (
                                        <motion.div
                                            animate={{ rotate: [0, 5, -5, 0] }}
                                            transition={{ duration: 0.4, delay: 0.9 }}
                                        >
                                            <ShieldX className="w-3 h-3 text-error-400" />
                                        </motion.div>
                                    ) : (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-neutral-600" />
                                    )}
                                </div>
                                <span className={`text-sm flex-1 ${item.revoked ? 'text-error-400 font-semibold' : 'text-neutral-600'
                                    }`}>
                                    {item.label}
                                </span>
                                {item.revoked && (
                                    <span className="text-[9px] font-mono text-error-400/60 uppercase tracking-wider">revoked</span>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* CTA */}
                    <motion.a
                        href="mailto:support@eduforge.com"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-3 w-full py-3.5 px-5 rounded-2xl text-sm font-semibold transition-all relative overflow-hidden group"
                        style={{
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.25)',
                            color: '#fca5a5',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)'; }}
                    >
                        <div className="w-8 h-8 rounded-xl bg-error-500/15 flex items-center justify-center shrink-0">
                            <Mail size={14} className="text-error-400" />
                        </div>
                        <div className="text-left">
                            <div className="text-[13px] font-semibold text-error-400 leading-tight">Contact support</div>
                            <div className="text-[11px] text-error-400/60 font-normal">support@eduforge.com</div>
                        </div>
                        <ArrowRight size={14} className="text-error-400/50 ml-auto transition-transform group-hover:translate-x-0.5" />
                    </motion.a>
                </div>
            </div>
        </motion.div>
    );
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export default function InstructorWaitingRoom() {
    const { user, logout, refreshUser, updateLocalUser } = useAuth();
    const navigate = useNavigate();

    // Animation gate states
    const [showApproval, setShowApproval] = useState(false);
    const [showRemovalNotice, setShowRemovalNotice] = useState(false);
    const [showReinstate, setShowReinstate] = useState(false);
    const [reinstateTargetStatus, setReinstateTargetStatus] = useState(null);

    const [lastChecked, setLastChecked] = useState(null);
    const [currentStatus, setCurrentStatus] = useState(null);
    const intervalRef = useRef(null);
    const prevStatusRef = useRef(null);

    if (!user) return <Navigate to="/" />;
    if (user.role !== 'instructor') return <Navigate to="/" />;

    const handleLogout = useCallback(() => { logout(); navigate('/'); }, [logout, navigate]);

    const handleApprovalRedirect = useCallback(() => { navigate('/instructor', { replace: true }); }, [navigate]);

    const handleRemovalAcknowledge = useCallback(() => { setShowRemovalNotice(false); }, []);

    const handleReinstateComplete = useCallback(() => {
        setShowReinstate(false);
        if (reinstateTargetStatus === 'APPROVED') {
            navigate('/instructor', { replace: true });
        }
        // If PENDING, the waiting room just re-renders with the Pending overlay naturally
    }, [reinstateTargetStatus, navigate]);

    // Seed current status from user on mount
    useEffect(() => {
        const initial = user.profile?.approvalStatus || 'PENDING';
        setCurrentStatus(initial);
        prevStatusRef.current = initial;

        // If already approved on mount, redirect immediately (no animation needed)
        if (initial === 'APPROVED') {
            navigate('/instructor', { replace: true });
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const formatTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    useEffect(() => {
        // Don't poll for terminal states that admins can't change
        if (currentStatus === 'REJECTED') return;
        // Don't start polling until we know the initial status
        if (currentStatus === null) return;

        const poll = async () => {
            const fresh = await refreshUser();
            if (!fresh) return;

            const newStatus = fresh.profile?.approvalStatus || 'PENDING';
            const oldStatus = prevStatusRef.current;
            setLastChecked(formatTime());

            if (newStatus === oldStatus) return; // No change, skip

            // Status changed — update everything
            prevStatusRef.current = newStatus;
            setCurrentStatus(newStatus);
            updateLocalUser(fresh);
            clearInterval(intervalRef.current);

            // Decide which animation to show
            if (newStatus === 'APPROVED' && oldStatus !== 'APPROVED') {
                setShowApproval(true);
            } else if (newStatus === 'REMOVED') {
                // Was this a previously-approved instructor or just a pending one?
                // Either way show the removal notice
                setShowRemovalNotice(true);
            } else if (oldStatus === 'REMOVED' && (newStatus === 'PENDING' || newStatus === 'APPROVED')) {
                // Admin reinstated
                setReinstateTargetStatus(newStatus);
                setShowReinstate(true);
            }
            // For FLAGGED or other transitions, the overlay just re-renders naturally
        };

        const delay = setTimeout(() => {
            poll(); // first poll after 5s
            intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
        }, 5000);

        return () => {
            clearTimeout(delay);
            clearInterval(intervalRef.current);
        };
    }, [currentStatus]);

    const displayStatus = currentStatus ?? (user.profile?.approvalStatus || 'PENDING');

    return (
        <div className="flex h-screen w-full bg-bg-base text-neutral-50 overflow-hidden font-sans">
            <LockedSidebar userName={user.name} onLogout={handleLogout} navigate={navigate} />
            <div className="hidden lg:block w-[80px] shrink-0" />

            <div className="flex flex-col flex-1 h-screen w-full overflow-hidden relative">
                <LockedTopbar user={user} onLogout={handleLogout} navigate={navigate} />

                <div className="flex-1 relative overflow-hidden">
                    {/* Ghost dashboard */}
                    <div className="absolute inset-0 overflow-hidden"
                        style={{ filter: 'blur(3.5px)', WebkitFilter: 'blur(3.5px)', pointerEvents: 'none' }}
                    >
                        <GhostDashboard />
                    </div>
                    <div className="absolute inset-0 bg-bg-base/60" />

                    {/* Status card */}
                    <div className="absolute inset-0 flex items-center justify-center p-4 z-10">
                        <div className="w-full max-w-md flex flex-col items-center">
                            <AnimatePresence mode="wait">
                                {displayStatus === 'PENDING' && <PendingOverlay key="pending" name={user.name} lastChecked={lastChecked} />}
                                {displayStatus === 'REJECTED' && <RejectedOverlay key="rejected" profile={user.profile || {}} />}
                                {displayStatus === 'FLAGGED' && <FlaggedOverlay key="flagged" profile={user.profile || {}} />}
                                {displayStatus === 'REMOVED' && <RemovedOverlay key="removed" />}
                            </AnimatePresence>

                            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
                                onClick={handleLogout}
                                className="mt-5 inline-flex items-center gap-1.5 text-xs text-neutral-700 hover:text-neutral-400 transition-colors"
                            >
                                <LogOut size={11} /> Sign out of EduForge
                            </motion.button>
                        </div>
                    </div>

                    {/* Celebration / notice overlays — render above everything */}
                    <AnimatePresence>
                        {showApproval && (
                            <ApprovalCelebration key="approval" name={user.name} onRedirect={handleApprovalRedirect} />
                        )}
                        {showRemovalNotice && !showApproval && (
                            <RemovalNotice key="removal" onAcknowledge={handleRemovalAcknowledge} />
                        )}
                        {showReinstate && !showApproval && !showRemovalNotice && (
                            <ReinstateCelebration key="reinstate" name={user.name}
                                targetStatus={reinstateTargetStatus} onDone={handleReinstateComplete}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}