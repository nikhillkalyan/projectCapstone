// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react';

export default function Sidebar({ navLinks, isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen, role }) {
  const sidebarWidth = isCollapsed ? 80 : 280;

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

      {/* Main Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarWidth,
          x: isMobileOpen ? 0 : (window.innerWidth < 1024 ? -280 : 0)
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed lg:relative flex flex-col h-screen bg-[#0E0E11] border-r border-neutral-800 shadow-2xl z-50 overflow-visible"
        style={{ width: isCollapsed ? 80 : 280 }}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center px-6 border-b border-neutral-800/50 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
            <GraduationCap className="text-white h-5 w-5" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
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
            <NavLink key={link.to} to={link.to} end={link.end} onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center h-12 rounded-xl transition-all duration-200 group relative
                ${isActive ? 'bg-indigo-500/10 text-indigo-400' : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200'}`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="w-12 h-12 flex items-center justify-center shrink-0">
                    <link.icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'scale-110 text-indigo-400' : 'group-hover:scale-110'}`} />
                  </div>
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`font-medium text-sm whitespace-nowrap overflow-hidden ${isActive ? 'text-indigo-400 font-semibold' : ''}`}
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

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3.5 top-24 w-7 h-7 rounded-full bg-neutral-800 border-2 border-[#09090b] items-center justify-center text-neutral-400 hover:text-white transition-colors z-50 hover:scale-110 shadow-md"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </motion.aside>
    </>
  );
}
