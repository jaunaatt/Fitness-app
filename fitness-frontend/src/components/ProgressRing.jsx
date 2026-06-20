import React from 'react';
import { motion } from 'framer-motion';

/**
 * ProgressRing — SVG circular progress indicator.
 *
 * Props:
 *   value    — current amount (number)
 *   max      — target amount (number)
 *   label    — display label string
 *   color    — stroke colour (hex/hsl)
 *   unit     — suffix label (e.g. "kcal", "g")
 *   size     — 'sm' | 'md' | 'lg' (default 'lg')
 */
export default function ProgressRing({
  value,
  max,
  label,
  color = '#3D6EFF',
  unit = '',
  size = 'lg',
}) {
  const dims = { sm: 72, md: 96, lg: 120 }[size] ?? 120;
  const stroke = size === 'sm' ? 7 : size === 'md' ? 9 : 11;
  const r = (dims / 2) - stroke / 2;
  const circumference = r * 2 * Math.PI;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const isOver = value > max && max > 0;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: dims, height: dims }}>
        {/* SVG rings */}
        <svg
          width={dims}
          height={dims}
          className="-rotate-90"
          style={{ position: 'absolute', inset: 0 }}
        >
          {/* Track */}
          <circle
            stroke="#26262E"
            fill="transparent"
            strokeWidth={stroke}
            r={r}
            cx={dims / 2}
            cy={dims / 2}
          />
          {/* Animated fill */}
          <motion.circle
            stroke={isOver ? '#FF6B1A' : color}
            fill="transparent"
            strokeWidth={stroke}
            strokeLinecap="round"
            r={r}
            cx={dims / 2}
            cy={dims / 2}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - pct * circumference }}
            transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
          />
        </svg>

        {/* Centered value */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        >
          <span
            className="font-mono font-bold text-white leading-none"
            style={{ fontSize: size === 'sm' ? 13 : size === 'md' ? 16 : 20 }}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          <span
            className="font-mono text-text-dim leading-none mt-0.5"
            style={{ fontSize: size === 'sm' ? 9 : size === 'md' ? 10 : 11 }}
          >
            / {typeof max === 'number' ? max.toLocaleString() : max}
          </span>
          {unit && (
            <span
              className="font-body text-text-faint leading-none mt-0.5"
              style={{ fontSize: 9 }}
            >
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Label below ring */}
      <span className="font-body text-[11px] text-text-muted uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}
