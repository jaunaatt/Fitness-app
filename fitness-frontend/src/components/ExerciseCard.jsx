import React from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';

/**
 * ExerciseCard
 *
 * Props:
 *   variationName  — exercise name string
 *   sets           — number of sets
 *   reps           — number of reps
 *   onEdit         — optional callback
 *   onDelete       — optional callback
 *   compact        — renders a more minimal card (for dashboard snapshot)
 */
export default function ExerciseCard({
  variationName,
  sets,
  reps,
  onEdit,
  onDelete,
  compact = false,
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className={`bg-bg-card rounded-xl border border-white/5 flex items-center justify-between ${
        compact ? 'px-3 py-2.5' : 'px-4 py-4'
      } group hover:border-white/10 transition-colors`}
    >
      <div>
        <p
          className={`font-display font-bold text-white ${
            compact ? 'text-sm' : 'text-base'
          }`}
        >
          {variationName}
        </p>
        <p className={`font-mono text-text-muted mt-0.5 ${compact ? 'text-[11px]' : 'text-sm'}`}>
          {sets} sets × {reps} reps
        </p>
      </div>

      {/* Action buttons — shown on hover for desktop, always on mobile */}
      {(onEdit || onDelete) && (
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 md:transition-opacity">
          {onEdit && (
            <button
              onClick={onEdit}
              aria-label="Edit exercise"
              className="p-1.5 rounded-lg text-text-dim hover:text-accent-blue hover:bg-accent-blue/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
            >
              <Pencil size={15} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              aria-label="Delete exercise"
              className="p-1.5 rounded-lg text-text-dim hover:text-accent-ember hover:bg-accent-ember/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-ember"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
