import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, BookOpen, PlusCircle, MessageSquare, UserCircle,
    GraduationCap, Bell, Search, ChevronDown, Lock, LogOut,
    Clock, ShieldX, AlertTriangle, CheckCircle2, ArrowRight, Mail,
    Settings, User as UserIcon,
} from 'lucide-react';

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

function LockedSidebar({ userName, onLogout, navigate }) {
    const [hovered, setHovered] = useState(false);
    const initials = userName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'IN';

    // Label opacity — delayed on enter, instant on leave so no bleed during collapse
    const labelVariants = {
        hidden: { opacity: 0, transition: { duration: 0.1 } },
        visible: { opacity: 1, transition: { duration: 0.18, delay: 0.18 } },
    };

    return (
        <>
            {/* Outer clip shell — only this animates width */}
            <motion.aside
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                animate={{ width: hovered ? 260 : 80 }}
                transition={{ type: 'spring', bounce: 0, duration: 0.38 }}
                style={{ minWidth: 80 }}
                className="fixed top-0 left-0 h-screen bg-[#0E0E11] border-r border-neutral-800 z-50 overflow-hidden flex flex-col"
            >
                {/* Inner content — always 260px wide, clipped by parent */}
                <div className="w-[260px] flex flex-col h-full">

                    {/* Brand */}
                    <div className="h-20 flex items-center px-5 border-b border-neutral-800/50 shrink-0 select-none">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                            <GraduationCap className="text-white h-5 w-5" />
                        </div>
                        <motion.div
                            variants={labelVariants}
                            animate={hovered ? 'visible' : 'hidden'}
                            className="ml-4 overflow-hidden"
                        >
                            <h1 className="text-xl font-bold tracking-tight text-white whitespace-nowrap">EduForge</h1>
                            <p className="text-xs text-indigo-400 font-medium tracking-wider uppercase whitespace-nowrap">Instructor Portal</p>
                        </motion.div>
                    </div>

                    {/* User chip */}
                    <motion.div
                        variants={labelVariants}
                        animate={hovered ? 'visible' : 'hidden'}
                        className="mx-4 mt-4 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-center gap-3 shrink-0"
                    >
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-bold text-[#0a0800] shrink-0">
                            {initials}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold text-neutral-200 truncate leading-tight whitespace-nowrap">{userName}</p>
                            <p className="text-xs text-amber-400/70 mt-0.5 whitespace-nowrap">Pending approval</p>
                        </div>
                    </motion.div>

                    {/* Nav items */}
                    <div className="flex-1 py-5 px-4 flex flex-col gap-1 overflow-y-auto overflow-x-hidden">

                        {/* Locked items */}
                        {LOCKED_NAV_LINKS.map(({ icon: Icon, label }) => (
                            <div
                                key={label}
                                className="flex items-center h-12 rounded-xl relative select-none shrink-0"
                                style={{ opacity: 0.35, cursor: 'not-allowed' }}
                            >
                                <div className="w-12 h-12 flex items-center justify-center shrink-0 relative">
                                    <Icon className="h-5 w-5 text-neutral-500" />
                                    <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-[#0E0E11] flex items-center justify-center">
                                        <Lock className="w-2 h-2 text-neutral-600" />
                                    </div>
                                </div>
                                <motion.div
                                    variants={labelVariants}
                                    animate={hovered ? 'visible' : 'hidden'}
                                    className="flex items-center gap-2 pr-4 overflow-hidden"
                                >
                                    <span className="text-sm font-medium text-neutral-500 whitespace-nowrap">{label}</span>
                                    <Lock className="w-3 h-3 text-neutral-700 shrink-0" />
                                </motion.div>
                            </div>
                        ))}

                        {/* Divider */}
                        <motion.div
                            variants={labelVariants}
                            animate={hovered ? 'visible' : 'hidden'}
                            className="mx-2 my-1.5 shrink-0"
                        >
                            <div className="border-t border-neutral-800/60" />
                            <p className="text-[9px] font-semibold text-neutral-600 uppercase tracking-[0.15em] mt-2 mb-0.5 px-2 whitespace-nowrap">
                                Available now
                            </p>
                        </motion.div>

                        {/* Unlocked — Profile */}
                        {UNLOCKED_NAV_LINKS.map(({ icon: Icon, label, to }) => (
                            <button
                                key={label}
                                onClick={() => navigate(to)}
                                className="flex items-center h-12 rounded-xl cursor-pointer group transition-all duration-200 hover:bg-neutral-800/50 text-neutral-400 hover:text-neutral-200 w-full text-left shrink-0 overflow-hidden"
                            >
                                <div className="w-12 h-12 flex items-center justify-center shrink-0">
                                    <Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                                </div>
                                <motion.div
                                    variants={labelVariants}
                                    animate={hovered ? 'visible' : 'hidden'}
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

                    {/* Bottom: status hint + logout */}
                    <div className="px-4 pb-5 flex flex-col gap-2 shrink-0">
                        <motion.div
                            variants={labelVariants}
                            animate={hovered ? 'visible' : 'hidden'}
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

                        {/* Logout — icon always visible, label fades in */}
                        <button
                            onClick={onLogout}
                            className="flex items-center h-11 rounded-xl w-full group transition-all duration-200 hover:bg-rose-500/10 overflow-hidden"
                        >
                            <div className="w-12 h-11 flex items-center justify-center shrink-0">
                                <LogOut size={18} className="text-rose-500/70 group-hover:text-rose-400 transition-colors" />
                            </div>
                            <motion.span
                                variants={labelVariants}
                                animate={hovered ? 'visible' : 'hidden'}
                                className="text-sm font-medium text-rose-500/70 group-hover:text-rose-400 whitespace-nowrap transition-colors"
                            >
                                Logout
                            </motion.span>
                        </button>
                    </div>

                </div>
            </motion.aside>
        </>
    );
}

function LockedTopbar({ user, onLogout, navigate }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <header className="h-16 w-full flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30 bg-[#09090b]/80 backdrop-blur-md border-b border-neutral-800/60 shrink-0">
            <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center bg-neutral-900 border border-neutral-800 rounded-full px-4 py-2 w-64 md:w-80 opacity-40 cursor-not-allowed">
                    <Search size={15} className="text-neutral-600" />
                    <span className="ml-3 text-sm text-neutral-600 select-none">Search courses...</span>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-600 cursor-not-allowed opacity-40 relative" tabIndex={-1}>
                    <Bell size={18} />
                    <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-neutral-700 ring-2 ring-[#09090b]" />
                </button>
                <div className="h-6 w-px bg-neutral-800/60 hidden sm:block" />

                {/* Profile dropdown — fully interactive */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(v => !v)}
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
                                className="absolute right-0 top-full mt-2 w-52 bg-[#0E0E11] border border-neutral-800 rounded-2xl shadow-2xl shadow-black/60 py-1.5 z-50 overflow-hidden"
                            >
                                {/* User info header */}
                                <div className="px-4 py-3 border-b border-neutral-800/60 mb-1">
                                    <p className="text-sm font-semibold text-neutral-200 leading-tight">{user?.name}</p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                        <p className="text-[11px] text-amber-400/70 font-medium">Pending approval</p>
                                    </div>
                                </div>

                                <div className="px-2">
                                    {/* Profile — unlocked */}
                                    <button
                                        onClick={() => { setDropdownOpen(false); navigate('/instructor/profile'); }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-300 hover:text-white hover:bg-white/[0.05] rounded-xl transition-colors"
                                    >
                                        <UserIcon size={15} className="text-neutral-400" />
                                        My Profile
                                        <span className="ml-auto text-[9px] font-bold text-emerald-500/70 uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/15 rounded-full px-1.5 py-0.5">
                                            Unlocked
                                        </span>
                                    </button>

                                    {/* Settings — locked */}
                                    <div className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl opacity-35 cursor-not-allowed select-none">
                                        <Settings size={15} className="text-neutral-500" />
                                        <span className="text-neutral-500">Settings</span>
                                        <Lock size={11} className="ml-auto text-neutral-700" />
                                    </div>
                                </div>

                                <div className="mt-1 px-2 pt-1 border-t border-neutral-800/60">
                                    <button
                                        onClick={() => { setDropdownOpen(false); onLogout(); }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors"
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

function GhostDashboard() {
    return (
        <div className="p-6 lg:p-8 pointer-events-none select-none" aria-hidden="true">
            <div className="flex items-start justify-between mb-8">
                <div>
                    <div className="h-9 w-72 rounded-xl bg-neutral-800/50 mb-3" />
                    <div className="h-4 w-52 rounded-lg bg-neutral-800/35" />
                </div>
                <div className="h-11 w-36 rounded-xl bg-indigo-500/8 border border-indigo-500/8" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {['Total Courses', 'Total Students', 'Avg Rating', 'Total Reviews'].map((_, i) => (
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
                {[1, 2].map(i => (
                    <div key={i} className="rounded-2xl overflow-hidden bg-neutral-900/50 border border-neutral-800/35">
                        <div className="h-44 bg-neutral-800/35" />
                        <div className="p-5">
                            <div className="h-5 w-3/4 rounded-lg bg-neutral-800/55 mb-2.5" />
                            <div className="h-3.5 w-1/2 rounded bg-neutral-800/35 mb-4" />
                            <div className="flex gap-4">
                                <div className="h-3 w-12 rounded bg-neutral-800/45" />
                                <div className="h-3 w-10 rounded bg-neutral-800/45" />
                                <div className="h-3 w-10 rounded bg-neutral-800/45" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function PendingOverlay({ name }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', bounce: 0.22, duration: 0.65 }}
            className="w-full max-w-md"
        >
            <div className="bg-[#0d0d12]/96 border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.75)] backdrop-blur-2xl">
                <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                <Clock className="w-9 h-9 text-indigo-400" strokeWidth={1.3} />
                            </div>
                            <motion.div
                                animate={{ scale: [1, 1.55, 1], opacity: [0.4, 0, 0.4] }}
                                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeOut' }}
                                className="absolute inset-0 rounded-2xl border border-indigo-400/25"
                            />
                        </div>
                    </div>
                    <div className="text-center mb-7">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
                            <motion.span
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ duration: 1.8, repeat: Infinity }}
                                className="w-1.5 h-1.5 rounded-full bg-indigo-400 block"
                            />
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.15em]">Under Review</span>
                        </div>
                        <h2 className="text-[1.6rem] font-bold text-white tracking-tight mb-2 leading-tight" style={{ fontFamily: "'Sora', system-ui, sans-serif" }}>
                            Application in progress
                        </h2>
                        <p className="text-sm text-neutral-400 leading-relaxed">
                            Hi <span className="text-neutral-200 font-semibold">{name?.split(' ')[0]}</span>! Your documents are being reviewed. You'll get full dashboard access once approved.
                        </p>
                    </div>
                    <div className="space-y-3 mb-7 bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4">
                        {STEPS.map((step, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${step.done ? 'bg-emerald-500/15 border border-emerald-500/35' :
                                        step.active ? 'bg-indigo-500/15 border border-indigo-500/35' :
                                            'bg-neutral-800/80 border border-neutral-700/60'
                                    }`}>
                                    {step.done ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : step.active ? (
                                        <motion.span
                                            animate={{ opacity: [1, 0.2, 1] }}
                                            transition={{ duration: 1.4, repeat: Infinity }}
                                            className="w-2 h-2 rounded-full bg-indigo-400 block"
                                        />
                                    ) : (
                                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-600 block" />
                                    )}
                                </div>
                                <span className={`text-sm flex-1 ${step.done ? 'text-neutral-300' :
                                        step.active ? 'text-indigo-300 font-medium' :
                                            'text-neutral-600'
                                    }`}>{step.label}</span>
                                {step.active && (
                                    <span className="text-[10px] text-indigo-400/60 font-mono tracking-tight">in progress</span>
                                )}
                            </div>
                        ))}
                    </div>
                    <p className="text-center text-[11px] text-neutral-600 tracking-wide">
                        We'll notify you via email when a decision is made
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

function RejectedOverlay({ profile }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', bounce: 0.22, duration: 0.65 }}
            className="w-full max-w-md"
        >
            <div className="bg-[#0d0d12]/96 border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.75)] backdrop-blur-2xl">
                <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-rose-500 to-transparent" />
                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                            <ShieldX className="w-9 h-9 text-rose-400" strokeWidth={1.3} />
                        </div>
                    </div>
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 mb-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-[0.15em]">Application Declined</span>
                        </div>
                        <h2 className="text-[1.6rem] font-bold text-white tracking-tight mb-2 leading-tight" style={{ fontFamily: "'Sora', system-ui, sans-serif" }}>
                            Access not granted
                        </h2>
                        <p className="text-sm text-neutral-400 leading-relaxed">
                            We were unable to approve your instructor application at this time.
                        </p>
                    </div>
                    {profile.rejectionReason && (
                        <div className="bg-rose-500/5 border border-rose-500/15 rounded-2xl p-4 mb-6 relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-rose-500/80 to-transparent rounded-l-2xl" />
                            <p className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider mb-2 pl-3">Admin Feedback</p>
                            <p className="text-sm text-rose-200/70 leading-relaxed pl-3 italic">"{profile.rejectionReason}"</p>
                        </div>
                    )}
                    <a
                        href="mailto:support@eduforge.com"
                        className="flex items-center justify-center gap-2.5 w-full py-3 rounded-2xl bg-white/[0.04] border border-white/[0.07] text-sm font-medium text-neutral-300 hover:bg-white/[0.07] hover:text-white transition-all"
                    >
                        <Mail size={15} />
                        Contact support to appeal
                        <ArrowRight size={13} className="text-neutral-500 ml-auto" />
                    </a>
                </div>
            </div>
        </motion.div>
    );
}

function FlaggedOverlay({ profile }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', bounce: 0.22, duration: 0.65 }}
            className="w-full max-w-md"
        >
            <div className="bg-[#0d0d12]/96 border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.75)] backdrop-blur-2xl">
                <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                <AlertTriangle className="w-9 h-9 text-amber-400" strokeWidth={1.3} />
                            </div>
                            <motion.div
                                animate={{ scale: [1, 1.5, 1], opacity: [0.35, 0, 0.35] }}
                                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeOut' }}
                                className="absolute inset-0 rounded-2xl border border-amber-400/25"
                            />
                        </div>
                    </div>
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
                            <motion.span
                                animate={{ opacity: [1, 0.2, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="w-1.5 h-1.5 rounded-full bg-amber-400 block"
                            />
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.15em]">Action Required</span>
                        </div>
                        <h2 className="text-[1.6rem] font-bold text-white tracking-tight mb-2 leading-tight" style={{ fontFamily: "'Sora', system-ui, sans-serif" }}>
                            Almost there
                        </h2>
                        <p className="text-sm text-neutral-400 leading-relaxed">
                            A few items need your attention before we can approve your profile.
                        </p>
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
                    <a
                        href="mailto:admin@eduforge.com"
                        className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl bg-amber-400 text-[#1c1000] text-sm font-bold hover:bg-amber-300 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/20"
                    >
                        <Mail size={15} />
                        Resolve via email
                    </a>
                </div>
            </div>
        </motion.div>
    );
}

export default function InstructorWaitingRoom() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user) return <Navigate to="/" />;
    if (user.role !== 'instructor') return <Navigate to="/" />;

    const profile = user.profile || {};
    const status = profile.approvalStatus || 'PENDING';

    if (status === 'APPROVED') return <Navigate to="/instructor" />;

    const handleLogout = () => { logout(); navigate('/'); };

    return (
        <div className="flex h-screen w-full bg-[#09090b] text-neutral-50 overflow-hidden font-sans">

            {/* Locked sidebar — hover to expand, all items locked except Profile */}
            <LockedSidebar userName={user.name} onLogout={handleLogout} navigate={navigate} />

            {/* Rigid 80px spacer so content doesn't collapse under sidebar */}
            <div className="hidden lg:block w-[80px] shrink-0" />

            {/* Main panel */}
            <div className="flex flex-col flex-1 h-screen w-full overflow-hidden relative">

                {/* Locked topbar */}
                <LockedTopbar user={user} onLogout={handleLogout} navigate={navigate} />

                {/* Content area */}
                <div className="flex-1 relative overflow-hidden">

                    {/* Ghost dashboard skeleton blurred behind */}
                    <div
                        className="absolute inset-0 overflow-hidden"
                        style={{ filter: 'blur(3.5px)', WebkitFilter: 'blur(3.5px)', pointerEvents: 'none' }}
                    >
                        <GhostDashboard />
                    </div>

                    {/* Dark scrim over ghost */}
                    <div className="absolute inset-0 bg-[#09090b]/60" />

                    {/* Floating status card */}
                    <div className="absolute inset-0 flex items-center justify-center p-4 z-10">
                        <div className="w-full max-w-md flex flex-col items-center">
                            {status === 'PENDING' && <PendingOverlay name={user.name} />}
                            {status === 'REJECTED' && <RejectedOverlay profile={profile} />}
                            {status === 'FLAGGED' && <FlaggedOverlay profile={profile} />}

                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.55 }}
                                onClick={handleLogout}
                                className="mt-5 inline-flex items-center gap-1.5 text-xs text-neutral-700 hover:text-neutral-400 transition-colors"
                            >
                                <LogOut size={11} />
                                Sign out of EduForge
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}