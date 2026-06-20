import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

/**
 * LeaderboardRow
 *
 * Props:
 *   rank          — integer rank (1-based)
 *   username      — string
 *   streakCount   — integer
 *   points        — integer (optional)
 *   isCurrentUser — boolean — applies blue highlight border + glow
 *   compact       — renders slightly smaller (for dashboard snapshot)
 */
export default function LeaderboardRow({
  rank,
  username,
  streakCount,
  points,
  isCurrentUser,
  compact = false,
}) {
  const initials = username
    .split(/(?=[A-Z])/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || username.slice(0, 2).toUpperCase();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      className={`flex items-center justify-between rounded-xl border transition-all ${
        compact ? 'px-3 py-2.5' : 'px-4 py-3.5'
      } ${
        isCurrentUser
          ? 'bg-accent-blue/[0.08] border-accent-blue/50 shadow-glow-blue'
          : 'bg-bg-card/60 border-white/5 hover:border-white/10'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Rank number */}
        <span
          className={`font-mono w-5 text-center font-semibold ${
            compact ? 'text-xs' : 'text-sm'
          } ${
            rank === 1 ? 'text-accent-gold'   :
            rank === 2 ? 'text-accent-silver' :
            rank === 3 ? 'text-accent-bronze' :
                         'text-text-faint'
          }`}
        >
          {rank}
        </span>

        {/* Avatar initials */}
        <div
          className={`rounded-full flex items-center justify-center font-display font-bold text-white shrink-0 ${
            compact ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-xs'
          } ${
            isCurrentUser
              ? 'bg-accent-blue/20 border border-accent-blue/50'
              : 'bg-bg-elevated border border-white/10'
          }`}
        >
          {initials}
        </div>

        {/* Username */}
        <span
          className={`font-body text-white ${
            compact ? 'text-xs' : 'text-sm'
          } ${isCurrentUser ? 'font-semibold' : ''}`}
        >
          {username}
          {isCurrentUser && (
            <span className="ml-2 font-body text-[10px] text-accent-blue bg-accent-blue/15 px-1.5 py-0.5 rounded-full">
              You
            </span>
          )}
        </span>
      </div>

      {/* Streak badge */}
      <div className="flex items-center gap-1.5">
        <Flame
          size={compact ? 12 : 14}
          className={`${
            streakCount >= 30 ? 'text-accent-green' :
            streakCount >= 7  ? 'text-orange-400'   :
                                'text-accent-ember'
          }`}
        />
        <span className={`font-mono font-semibold text-white ${compact ? 'text-xs' : 'text-sm'}`}>
          {streakCount}
        </span>
        {points !== undefined && !compact && (
          <span className="font-mono text-xs text-text-faint ml-1">· {points} pts</span>
        )}
      </div>
    </motion.div>
  );
}
