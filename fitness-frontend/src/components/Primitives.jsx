import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', noPad = false }) {
  return (
    <div
      className={`bg-bg-card rounded-2xl border border-white/5 depth-sheen relative overflow-hidden ${
        noPad ? '' : 'p-5'
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────
export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-white/[0.06] rounded-lg ${className}`}
    />
  );
}

// ─── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ title, hint, icon: Icon }) {
  return (
    <div className="text-center py-12 px-4">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
          <Icon size={22} className="text-text-faint" />
        </div>
      )}
      <p className="font-display font-bold text-white text-base">{title}</p>
      {hint && (
        <p className="font-body text-sm text-text-muted mt-1.5">{hint}</p>
      )}
    </div>
  );
}

// ─── SectionHeader ─────────────────────────────────────────────────────────────
export function SectionHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-display font-bold text-white text-sm uppercase tracking-widest">
        {title}
      </h2>
      {action}
    </div>
  );
}

// ─── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ children, color = 'blue' }) {
  const colors = {
    blue:  'bg-accent-blue/15 text-accent-blue border-accent-blue/30',
    green: 'bg-accent-green/10 text-accent-green border-accent-green/30',
    ember: 'bg-accent-ember/15 text-accent-ember border-accent-ember/30',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-body text-[11px] font-medium border ${colors[color]}`}
    >
      {children}
    </span>
  );
}

// ─── Toast ─────────────────────────────────────────────────────────────────────
export function Toast({ message, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.95 }}
          className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 bg-bg-elevated border border-white/10 px-5 py-3 rounded-xl shadow-glow-blue text-white font-body text-sm"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
