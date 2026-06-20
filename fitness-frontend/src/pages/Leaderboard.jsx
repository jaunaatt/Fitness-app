import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import LeaderboardRow from '../components/LeaderboardRow.jsx';

// Podium metadata
const PODIUM = [
  { height: 128, accent: '#FFD23D', label: '1st', order: 2 }, // gold, center
  { height: 96,  accent: '#C7CBD1', label: '2nd', order: 1 }, // silver, left
  { height: 76,  accent: '#CD8A4F', label: '3rd', order: 3 }, // bronze, right
];

// Podium rendering order: left=2nd, center=1st, right=3rd
const PODIUM_ORDER = [1, 0, 2]; // indices into top3 array

function PodiumBlock({ user, podium, rank, sortBy, delay }) {
  if (!user) return null;
  const { height, accent } = podium;

  const initials = user.username
    .split(/(?=[A-Z])/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || user.username.slice(0, 2).toUpperCase();

  const displayValue =
    sortBy === 'streak' ? user.currentStreak :
    sortBy === 'workouts' ? (user.workoutsThisWeek ?? 0) :
    user.totalPoints;

  const displayLabel =
    sortBy === 'streak'   ? 'day streak' :
    sortBy === 'workouts' ? 'workouts' : 'pts';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 260, damping: 22 }}
      className="flex flex-col items-center"
    >
      {/* Rank badge above */}
      {rank === 1 && (
        <motion.div
          animate={{ rotate: [-5, 5, -5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-1.5 text-accent-gold"
        >
          <Trophy size={20} />
        </motion.div>
      )}

      {/* Avatar */}
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center font-display font-bold text-white text-base mb-1.5 border-2"
        style={{
          backgroundColor: `${accent}20`,
          borderColor: accent,
          boxShadow: `0 0 16px ${accent}40`,
        }}
      >
        {initials}
      </div>

      {/* Username */}
      <p className="font-body text-xs text-white font-medium mb-2 text-center max-w-[80px] truncate">
        {user.username}
      </p>

      {/* Podium bar */}
      <div
        className="w-20 rounded-t-lg flex flex-col items-center justify-end pb-3 gap-0.5"
        style={{
          height,
          backgroundColor: `${accent}18`,
          border: `1.5px solid ${accent}80`,
        }}
      >
        <span className="font-mono text-lg font-bold" style={{ color: accent }}>
          {displayValue}
        </span>
        <span className="font-body text-[9px] uppercase tracking-wide" style={{ color: `${accent}99` }}>
          {displayLabel}
        </span>
      </div>
    </motion.div>
  );
}

export default function Leaderboard() {
  const { state } = useApp();
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState('streak');

  const sorted = [...state.leaderboard].sort((a, b) => {
    if (sortBy === 'streak')   return b.currentStreak - a.currentStreak;
    if (sortBy === 'workouts') return (b.workoutsThisWeek ?? 0) - (a.workoutsThisWeek ?? 0);
    return b.totalPoints - a.totalPoints;
  });

  const top3 = sorted.slice(0, 3);
  const rest  = sorted.slice(3);

  // Reorder for podium display: [2nd, 1st, 3rd]
  const podiumDisplay = [top3[1], top3[0], top3[2]];
  const podiumRanks   = [2, 1, 3];

  return (
    <div className="px-5 py-6 md:px-8 md:py-8 max-w-3xl mx-auto pb-28 md:pb-10">
      {/* Page header */}
      <p className="font-body text-xs text-accent-ember uppercase tracking-widest mb-1.5">
        Who's showing up every day?
      </p>
      <h1 className="font-display font-extrabold text-2xl md:text-3xl text-white mb-7">
        Leaderboard
      </h1>

      {/* ── Podium ───────────────────────────────────────────────────────────── */}
      <div className="flex items-end justify-center gap-3 mb-10">
        {podiumDisplay.map((user, i) => (
          <PodiumBlock
            key={user?.id ?? i}
            user={user}
            podium={i === 1 ? PODIUM[0] : i === 0 ? PODIUM[1] : PODIUM[2]}
            rank={podiumRanks[i]}
            sortBy={sortBy}
            delay={i * 0.08}
          />
        ))}
      </div>

      {/* ── Sort controls ─────────────────────────────────────────────────────── */}
      <div className="flex gap-1 mb-5 bg-bg-card rounded-xl p-1 w-fit border border-white/[0.05]">
        {[
          { key: 'streak',   label: 'By Streak'   },
          { key: 'workouts', label: 'By Workouts'  },
        ].map((opt) => (
          <button
            key={opt.key}
            id={`leaderboard-sort-${opt.key}`}
            onClick={() => setSortBy(opt.key)}
            className={`px-4 py-1.5 rounded-lg font-body text-sm transition-all ${
              sortBy === opt.key
                ? 'bg-accent-blue text-white'
                : 'text-text-muted hover:text-white'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* ── Ranked list (4th and below) ───────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        {rest.length === 0 ? (
          <p className="font-body text-sm text-text-muted text-center py-6">
            Only the top 3 for now — keep grinding.
          </p>
        ) : (
          rest.map((u, i) => (
            <LeaderboardRow
              key={u.id ?? i}
              rank={i + 4}
              username={u.username}
              streakCount={u.currentStreak}
              points={u.totalPoints}
              isCurrentUser={u.id === user?.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
