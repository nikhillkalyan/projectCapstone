import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppShell({ children, role, navLinks, user, onLogout }) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div className="flex h-screen w-full bg-[#09090b] text-neutral-50 overflow-hidden font-sans">
            <Sidebar
                navLinks={navLinks}
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
                role={role}
            />

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 h-screen relative w-full overflow-hidden">
                <Topbar
                    user={user}
                    onLogout={onLogout}
                    toggleMobile={() => setIsMobileOpen(true)}
                />
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 hide-scrollbar bg-gradient-to-br from-[#09090b] via-[#0E0E11] to-[#121217]">
                    {children}
                </main>
            </div>
        </div>
    );
}
