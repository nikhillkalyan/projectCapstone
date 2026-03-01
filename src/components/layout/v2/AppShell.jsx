import { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppShell({ children, role, navLinks, user, onLogout }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div className="flex h-screen w-full bg-[#09090b] text-neutral-50 overflow-hidden font-sans">
            <Sidebar
                navLinks={navLinks}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
                role={role}
            />

            {/* Main Content Area */}
            <motion.div
                layout
                className="flex flex-col flex-1 h-screen relative w-full overflow-hidden"
            >
                <Topbar
                    user={user}
                    onLogout={onLogout}
                    toggleMobile={() => setIsMobileOpen(true)}
                />
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 hide-scrollbar bg-gradient-to-br from-[#09090b] via-[#0E0E11] to-[#121217]">
                    {children}
                </main>
            </motion.div>
        </div>
    );
}
