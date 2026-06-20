import React from 'react';
import { motion } from 'framer-motion';

/**
 * Determines visual intensity of the flame based on streak count.
 *   0 days   → grey, no animation
 *   1–6 days → amber ember, slow pulse
 *   7–29     → orange fire, medium glow
 *   30+      → neon inferno, fast intense pulse
 */
function flameStage(count) {
  if (count <= 0)  return { color: '#3A3A44', glow: null,                               speed: null };
  if (count < 7)   return { color: '#FF6B1A', glow: '0 0 12px rgba(255,107,26,0.5)',  speed: 2.0 };
  if (count < 30)  return { color: '#FF8A3D', glow: '0 0 22px rgba(255,138,61,0.65)', speed: 1.2 };
  return               { color: '#39FF14', glow: '0 0 36px rgba(57,255,20,0.8)',   speed: 0.6 };
}

/** Flame SVG path — hand-drawn for organic look */
const FLAME_PATH =
  'M12 2C12 2 6 8 6 13.5C6 17.6421 8.91015 21 12 21C15.0899 21 18 17.6421 18 13.5C18 11.5 17 9.5 16 8.5C16 10 15 11 14 11C14 11 14.5 9 13 6.5C12.5 8.5 11 9.5 9.5 11.5C9 12 9 13 9.5 13.8C9.5 13.8 8.5 13.2 8.5 11.8C8.5 9.5 10 7 12 2Z';

const INNER_PATH =
  'M12 10C12 10 10 13 10 15C10 16.6569 10.8954 18 12 18C13.1046 18 14 16.6569 14 15C14 13 12 10 12 10Z';

export default function StreakFlame({ streakCount = 0, size = 'lg' }) {
  const stage = flameStage(streakCount);
  const dims  = size === 'sm' ? 26 : size === 'md' ? 40 : 68;
  const isActive = streakCount > 0;

  return (
    <div className="flex items-center gap-3">
      {/* Animated flame icon */}
      <motion.div
        style={{ filter: isActive ? `drop-shadow(${stage.glow})` : 'none' }}
        animate={isActive ? { scale: [1, 1.1, 1], rotate: [0, 2, -2, 0] } : { scale: 1 }}
        transition={
          isActive
            ? { duration: stage.speed, repeat: Infinity, ease: 'easeInOut' }
            : {}
        }
      >
        <svg width={dims} height={dims} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer flame */}
          <path d={FLAME_PATH} fill={stage.color} opacity={isActive ? 1 : 0.35} />
          {/* Inner core (brighter when active) */}
          {isActive && (
            <path
              d={INNER_PATH}
              fill={streakCount >= 30 ? '#FFFFFF' : '#FFE0B2'}
              opacity={0.55}
            />
          )}
        </svg>
      </motion.div>

      {/* Text content — hidden on 'sm' size variant */}
      {size === 'lg' && (
        <div className="leading-tight">
          <div className="font-mono font-bold text-3xl text-white leading-none">
            {streakCount}
          </div>
          <div className="font-body text-xs text-text-muted uppercase tracking-widest mt-0.5">
            day streak
          </div>
        </div>
      )}

      {size === 'md' && (
        <div className="leading-tight">
          <div className="font-mono font-bold text-xl text-white leading-none">
            {streakCount}
          </div>
          <div className="font-body text-[10px] text-text-muted uppercase tracking-wider mt-0.5">
            day streak
          </div>
        </div>
      )}

      {size === 'sm' && (
        <span className="font-mono text-sm font-semibold text-white">{streakCount}</span>
      )}
    </div>
  );
}
