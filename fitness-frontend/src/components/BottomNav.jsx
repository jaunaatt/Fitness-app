import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, Apple, Dumbbell, Trophy, User } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const navItems = [
  { to: '/dashboard',   label: 'Home',    icon: LayoutGrid },
  { to: '/nutrition',   label: 'Food',    icon: Apple      },
  { to: '/gym',         label: 'Gym',     icon: Dumbbell   },
  { to: '/leaderboard', label: 'Ranks',   icon: Trophy     },
  { to: '/profile',     label: 'Me',      icon: User       },
];

export default function BottomNav() {
  const { state } = useApp();
  const streak = state.streak.currentStreak;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-panel/90 backdrop-blur-md border-t border-white/[0.07]">
      <div className="flex justify-around items-center px-1 py-1.5 safe-area-bottom">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl flex-1 max-w-[64px] transition-all ${
                isActive ? 'text-accent-blue' : 'text-text-faint'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon
                    size={21}
                    strokeWidth={isActive ? 2.4 : 1.8}
                  />
                  {/* Streak dot on Home tab */}
                  {to === '/dashboard' && streak > 0 && (
                    <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-accent-ember rounded-full flex items-center justify-center">
                      <span className="font-mono text-[7px] text-white font-bold leading-none">
                        {streak > 99 ? '!' : streak}
                      </span>
                    </span>
                  )}
                </div>
                <span className="font-body text-[10px] leading-none">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
