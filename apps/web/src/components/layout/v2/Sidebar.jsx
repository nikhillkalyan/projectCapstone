import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

export default function Sidebar({ navLinks, isMobileOpen, setIsMobileOpen, role }) {
  const [isHovered, setIsHovered] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className="hidden lg:block w-[80px] shrink-0 h-screen" />

      <motion.aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={false}
        animate={{
          width: isMobileOpen ? 280 : (isMobile ? -280 : desktopWidth),
          x: isMobileOpen ? 0 : (isMobile ? (isMobileOpen ? 0 : -280) : 0)
        }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className="glass-lg fixed left-0 top-0 z-50 flex h-screen flex-col overflow-hidden border-r border-glass-border shadow-glass lg:overflow-visible"
      >
        <div className="relative z-10 flex h-20 shrink-0 select-none items-center border-b border-border-subtle px-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
            <GraduationCap className="text-white h-5 w-5" />
          </div>

          <AnimatePresence>
            {(isHovered || isMobileOpen) && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="ml-4 overflow-hidden whitespace-nowrap"
              >
                <h1 className="font-display text-xl font-bold tracking-normal text-gradient">EduForge</h1>
                <p className="text-xs font-semibold uppercase tracking-wide text-accent-400">{role} Portal</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative z-10 flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-6 hide-scrollbar">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                `group relative flex h-12 cursor-pointer select-none items-center rounded-lg border transition-all duration-200
                ${isActive ? 'border-primary-400/20 bg-primary-500/12 text-primary-300 shadow-glow' : 'border-transparent text-text-secondary hover:border-border-subtle hover:bg-white/[0.05] hover:text-text-primary'}`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="w-12 h-12 flex items-center justify-center shrink-0">
                    <link.icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'scale-110 text-primary-300' : 'group-hover:scale-110'}`} />
                  </div>

                  <AnimatePresence>
                    {(isHovered || isMobileOpen) && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`overflow-hidden whitespace-nowrap pr-4 text-sm font-semibold ${isActive ? 'text-primary-200' : ''}`}
                      >
                        {link.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {isActive && (
                    <motion.div layoutId="activeNav" className="absolute left-0 top-1/4 h-1/2 w-1 rounded-r-md bg-gradient-primary" />
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
