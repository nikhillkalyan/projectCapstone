import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

export default function Sidebar({ navLinks, isMobileOpen, setIsMobileOpen, role }) {
  // Local hover state for desktop auto-expand
  const [isHovered, setIsHovered] = useState(false);

  // Track window width for real-time responsiveness without reloading
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // The 'logical' width that AppShell reserves is always 80px on desktop
  // But the 'visual' width of the Sidebar overlay changes on hover
  const desktopWidth = isHovered ? 280 : 80;
  const isMobile = windowWidth < 1024;

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* 
        Spacing Placeholder
        Because the Sidebar becomes absolutely positioned/floating when expanded,
        we need a rigid 80px block here to prevent the main AppShell content from shifting left.
      */}
      <div className="hidden lg:block w-[80px] shrink-0 h-screen" />

      {/* Main Sidebar (Floats over content on expand) */}
      <motion.aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={false}
        animate={{
          width: isMobileOpen ? 280 : (isMobile ? -280 : desktopWidth),
          x: isMobileOpen ? 0 : (isMobile ? (isMobileOpen ? 0 : -280) : 0)
        }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className="fixed top-0 left-0 flex flex-col h-screen bg-[#0E0E11] border-r border-neutral-800 shadow-2xl z-50 overflow-hidden lg:overflow-visible"
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center px-5 border-b border-neutral-800/50 shrink-0 select-none">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
            <GraduationCap className="text-white h-5 w-5" />
          </div>

          <AnimatePresence>
            {(isHovered || isMobileOpen) && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="ml-4 whitespace-nowrap overflow-hidden"
              >
                <h1 className="text-xl font-bold tracking-tight text-white">EduForge</h1>
                <p className="text-xs text-indigo-400 font-medium tracking-wider uppercase">{role} Portal</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-6 px-4 overflow-y-auto hide-scrollbar flex flex-col gap-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center h-12 rounded-xl transition-all duration-200 group relative select-none cursor-pointer
                ${isActive ? 'bg-indigo-500/10 text-indigo-400' : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200'}`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="w-12 h-12 flex items-center justify-center shrink-0">
                    <link.icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'scale-110 text-indigo-400' : 'group-hover:scale-110'}`} />
                  </div>

                  <AnimatePresence>
                    {(isHovered || isMobileOpen) && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`font-medium text-sm whitespace-nowrap overflow-hidden pr-4 ${isActive ? 'text-indigo-400 font-semibold' : ''}`}
                      >
                        {link.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {isActive && (
                    <motion.div layoutId="activeNav" className="absolute left-0 top-1/4 h-1/2 w-1 bg-indigo-500 rounded-r-md" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </motion.aside>
    </>
  );
}
