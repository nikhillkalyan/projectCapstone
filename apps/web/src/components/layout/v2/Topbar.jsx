import { useState, useRef, useEffect } from 'react';
import { Bell, Search, Menu, LogOut, User as UserIcon, Settings, ChevronDown } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ user, toggleMobile, onLogout }) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNavigation = (path) => {
        setIsProfileOpen(false);
        navigate(path);
    };

    return (
        <header className="glass-sm sticky top-0 z-30 flex h-[var(--topbar-height)] w-full shrink-0 items-center justify-between border-b border-glass-border px-4 transition-all sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
                <button
                    className="-ml-2 rounded-lg p-2 text-text-secondary transition-colors hover:bg-white/[0.06] hover:text-text-primary lg:hidden"
                    onClick={toggleMobile}
                >
                    <Menu size={20} />
                </button>

                <div className="glass-input hidden h-11 w-64 items-center rounded-full px-4 md:w-80 sm:flex">
                    <Search size={16} className="text-text-secondary group-focus-within:text-primary-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        className="ml-3 w-full border-none bg-transparent text-[0.85rem] text-text-primary outline-none placeholder:text-text-secondary"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-5">
                <button className="relative flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-white/[0.06] hover:text-text-primary">
                    <Bell size={18} />
                    <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-error-500 ring-2 ring-bg-base"></span>
                </button>

                <div className="h-6 w-px bg-border-subtle hidden sm:block"></div>

                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="group flex items-center gap-2.5 rounded-full border border-transparent py-1 pl-1 pr-2 outline-none transition-colors hover:border-border-subtle hover:bg-white/[0.05]"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-accent text-xs font-bold text-white shadow-glow ring-2 ring-bg-surface transition-all group-hover:ring-border-subtle">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="hidden md:flex items-center gap-2">
                            <div className="text-left">
                                <p className="font-display text-[0.85rem] font-semibold leading-tight text-text-primary">{user?.name || 'Guest'}</p>
                                <p className="mt-0.5 text-[0.7rem] font-medium capitalize text-text-secondary">{user?.role || 'User'}</p>
                            </div>
                            <ChevronDown size={14} className={`text-text-secondary transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                        </div>
                    </button>

                    <AnimatePresence>
                        {isProfileOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                className="glass-lg absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-lg border border-glass-border py-1.5 shadow-strong"
                            >
                                <div className="px-4 py-3 border-b border-border-subtle/50 mb-1 md:hidden">
                                    <p className="font-display text-[0.85rem] font-semibold leading-tight text-text-primary">{user?.name || 'Guest'}</p>
                                    <p className="mt-0.5 text-[0.7rem] font-medium capitalize text-text-secondary">{user?.role || 'User'}</p>
                                </div>

                                <div className="px-2">
                                    <button
                                        onClick={() => handleNavigation(`/${user?.role}/profile`)}
                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[0.85rem] text-text-secondary transition-colors hover:bg-white/[0.06] hover:text-text-primary"
                                    >
                                        <UserIcon size={16} />
                                        My Profile
                                    </button>
                                    <button
                                        onClick={() => handleNavigation(`/${user?.role}/settings`)}
                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[0.85rem] text-text-secondary transition-colors hover:bg-white/[0.06] hover:text-text-primary"
                                    >
                                        <Settings size={16} />
                                        Settings
                                    </button>
                                </div>

                                <div className="mt-1 px-2 pt-1 border-t border-border-subtle/50">
                                    <button
                                        onClick={() => {
                                            setIsProfileOpen(false);
                                            onLogout && onLogout();
                                        }}
                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[0.85rem] text-error-400 transition-colors hover:bg-error-500/10 hover:text-error-400"
                                    >
                                        <LogOut size={16} />
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
