import { Bell, Search, Menu } from 'lucide-react';

export default function Topbar({ user, toggleMobile }) {
    return (
        <header className="h-20 w-full flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30 bg-[#09090b]/80 backdrop-blur-md border-b border-neutral-800/40 shrink-0">
            <div className="flex items-center gap-4">
                <button className="lg:hidden text-neutral-400 hover:text-white p-2 -ml-2 rounded-lg hover:bg-neutral-800/50 transition-colors" onClick={toggleMobile}>
                    <Menu size={24} />
                </button>
                {/* Sleek Search Bar */}
                <div className="hidden sm:flex items-center bg-neutral-900 border border-neutral-800 rounded-full px-4 py-2 w-64 md:w-80 group focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all shadow-inner">
                    <Search size={16} className="text-neutral-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        className="bg-transparent border-none outline-none text-sm ml-3 w-full text-white placeholder-neutral-500"
                    />
                </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3 sm:gap-4 pl-4 border-l border-neutral-800/50">
                <button className="w-10 h-10 rounded-full hover:bg-neutral-800/80 flex items-center justify-center text-neutral-400 hover:text-white transition-colors relative">
                    <Bell size={18} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#09090b]"></span>
                </button>

                {/* Profile Element */}
                <div className="flex items-center gap-3 cursor-pointer p-1 pr-3 rounded-full hover:bg-neutral-800/50 transition-colors border border-transparent hover:border-neutral-800/50">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-sm text-white shadow-lg shadow-indigo-500/20">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-semibold text-neutral-200 leading-tight">{user?.name || 'Guest'}</p>
                        <p className="text-xs text-neutral-500 font-medium mt-0.5">{user?.role === 'instructor' ? 'Instructor' : 'Student'}</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
