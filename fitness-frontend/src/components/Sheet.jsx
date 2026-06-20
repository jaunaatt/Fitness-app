import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Sheet — A bottom sheet / modal drawer with backdrop.
 * On mobile: slides up from bottom.
 * On sm+: centered modal overlay.
 *
 * Props:
 *   open     — boolean visibility
 *   onClose  — function
 *   title    — string header text
 *   children — React node
 */
export default function Sheet({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Sheet panel */}
          <motion.div
            key="sheet-panel"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 sm:max-w-lg sm:mx-auto sm:bottom-8 sm:rounded-2xl bg-bg-panel border border-white/10 rounded-t-2xl z-50 p-6 shadow-2xl"
          >
            {/* Handle bar (mobile) */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-white/20 rounded-full sm:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-white text-lg">{title}</h3>
              <button
                onClick={onClose}
                aria-label="Close sheet"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-dim hover:text-white hover:bg-white/[0.06] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div>{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
