import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, Apple, Dumbbell, Trophy, User, Flame, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import StreakFlame from './StreakFlame.jsx';

const navItems = [
  { to: '/dashboard',   label: 'Dashboard',   icon: LayoutGrid },
  { to: '/nutrition',   label: 'Nutrition',   icon: Apple      },
  { to: '/gym',         label: 'Gym Log',     icon: Dumbbell   },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy     },
  { to: '/profile',     label: 'Profile',     icon: User       },
];

export default function Sidebar() {
  const { state } = useApp();
  const streak = state.streak.currentStreak;

  return (
    <aside className="hidden md:flex md:flex-col w-62 shrink-0 h-screen sticky top-0 bg-bg-panel border-r border-white/[0.06] py-6">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 mb-8">
        <div className="w-8 h-8 rounded-lg bg-accent-ember/15 border border-accent-ember/30 flex items-center justify-center">
          <Flame size={18} className="text-accent-ember" />
        </div>
        <span className="font-display font-extrabold text-[18px] text-white tracking-tight">
          ForgeFit
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 px-3 flex-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl font-body text-sm transition-all border-l-2 ${
                isActive
                  ? 'border-accent-blue bg-accent-blue/[0.08] text-white font-medium'
                  : 'border-transparent text-text-muted hover:text-white hover:bg-white/[0.03]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={isActive ? 'text-accent-blue' : 'text-current'}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Streak display at bottom */}
      <div className="px-6 pt-5 mt-auto border-t border-white/[0.06]">
        <div className="flex items-center justify-between mb-1">
          <span className="font-body text-[11px] text-text-faint uppercase tracking-widest">Your Streak</span>
          <Zap size={11} className="text-text-faint" />
        </div>
        <StreakFlame streakCount={streak} size="sm" />
      </div>
    </aside>
  );
}
