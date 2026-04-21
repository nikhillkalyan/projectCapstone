import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, className = '' }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="Close modal"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className={`glass-lg relative w-full max-w-lg rounded-lg p-6 shadow-strong ${className}`}
          >
            <div className="relative z-10">
              <div className="mb-5 flex items-center justify-between gap-4">
                {title && <h2 className="font-display text-xl font-bold text-text-primary">{title}</h2>}
                <button
                  type="button"
                  onClick={onClose}
                  className="ml-auto rounded-lg p-2 text-text-secondary transition hover:bg-white/[0.06] hover:text-text-primary"
                >
                  <X size={18} />
                </button>
              </div>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
