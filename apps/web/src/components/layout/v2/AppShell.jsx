import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppShell({ children, role, navLinks, user, onLogout }) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div className="mesh-bg flex h-screen w-full overflow-hidden font-sans text-text-primary">
            <Sidebar
                navLinks={navLinks}
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
                role={role}
            />

            <div className="flex flex-col flex-1 h-screen relative w-full overflow-hidden">
                <Topbar
                    user={user}
                    onLogout={onLogout}
                    toggleMobile={() => setIsMobileOpen(true)}
                />
                <main className="relative flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 hide-scrollbar">
                    <div className="pointer-events-none fixed inset-0 bg-gradient-glow opacity-80" />
                    <div className="page-shell relative z-[var(--z-base)]">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
