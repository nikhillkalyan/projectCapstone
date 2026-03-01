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
        <header className="h-16 w-full flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30 bg-bg-base/80 backdrop-blur-md border-b border-border-subtle shrink-0 transition-all">
            <div className="flex items-center gap-4">
                {/* Mobile Menu Toggle */}
                <button
                    className="lg:hidden text-text-secondary hover:text-white p-2 -ml-2 rounded-lg hover:bg-white/[0.05] transition-colors"
                    onClick={toggleMobile}
                >
                    <Menu size={20} />
                </button>

                {/* Sleek Search Bar */}
                <div className="hidden sm:flex items-center bg-bg-surface border border-border-subtle rounded-full px-4 py-2 w-64 md:w-80 group focus-within:border-primary-500/50 focus-within:ring-1 focus-within:ring-primary-500/20 transition-all shadow-inner">
                    <Search size={16} className="text-text-secondary group-focus-within:text-primary-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        className="bg-transparent border-none outline-none text-[0.85rem] ml-3 w-full text-text-primary placeholder-text-secondary font-dmsans"
                    />
                </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3 sm:gap-5">
                {/* Notification Bell */}
                <button className="w-9 h-9 rounded-full hover:bg-white/[0.05] flex items-center justify-center text-text-secondary hover:text-white transition-colors relative">
                    <Bell size={18} />
                    <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-rose-500 ring-2 ring-bg-base"></span>
                </button>

                {/* Vertical Divider */}
                <div className="h-6 w-px bg-border-subtle hidden sm:block"></div>

                {/* Profile Element Container */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2.5 pr-2 py-1 pl-1 rounded-full hover:bg-white/[0.03] transition-colors border border-transparent hover:border-border-subtle group outline-none"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-teal-400 flex items-center justify-center font-bold text-xs text-white shadow-lg shadow-primary-500/20 ring-2 ring-bg-surface group-hover:ring-border-subtle transition-all">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="hidden md:flex items-center gap-2">
                            <div className="text-left">
                                <p className="text-[0.85rem] font-semibold text-text-primary leading-tight font-syne">{user?.name || 'Guest'}</p>
                                <p className="text-[0.7rem] text-text-secondary font-medium mt-0.5 capitalize font-dmsans">{user?.role || 'User'}</p>
                            </div>
                            <ChevronDown size={14} className={`text-text-secondary transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                        </div>
                    </button>

                    {/* Animated Dropdown Menu */}
                    <AnimatePresence>
                        {isProfileOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                className="absolute right-0 top-full mt-2 w-56 bg-bg-surface border border-border-subtle rounded-xl shadow-xl py-1.5 z-50 overflow-hidden"
                            >
                                {/* Mobile-only User Info Header */}
                                <div className="px-4 py-3 border-b border-border-subtle/50 mb-1 md:hidden">
                                    <p className="text-[0.85rem] font-semibold text-text-primary leading-tight font-syne">{user?.name || 'Guest'}</p>
                                    <p className="text-[0.7rem] text-text-secondary font-medium mt-0.5 capitalize font-dmsans">{user?.role || 'User'}</p>
                                </div>

                                <div className="px-2">
                                    <button
                                        onClick={() => handleNavigation(`/${user?.role}/profile`)}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-[0.85rem] text-text-secondary hover:text-text-primary hover:bg-white/[0.05] rounded-lg transition-colors font-dmsans"
                                    >
                                        <UserIcon size={16} />
                                        My Profile
                                    </button>
                                    <button
                                        onClick={() => handleNavigation(`/${user?.role}/settings`)}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-[0.85rem] text-text-secondary hover:text-text-primary hover:bg-white/[0.05] rounded-lg transition-colors font-dmsans"
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
                                        className="w-full flex items-center gap-3 px-3 py-2 text-[0.85rem] text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors font-dmsans"
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
