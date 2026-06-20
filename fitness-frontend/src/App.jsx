import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import BottomNav from './components/BottomNav.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import Nutrition from './pages/Nutrition.jsx';
import Gym from './pages/Gym.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Confetti from './components/Confetti.jsx';
import { useApp } from './context/AppContext.jsx';

export default function App() {
  const { state } = useApp();

  return (
    <div className="flex bg-bg-deep min-h-screen">
      {/* Confetti fires on streak bump */}
      <Confetti active={state.streakJustBumped} />

      {/* Sidebar — desktop only */}
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 min-w-0 overflow-y-auto h-screen">
        <Routes>
          <Route path="/"             element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"    element={<Dashboard />} />
          <Route path="/nutrition"    element={<Nutrition />} />
          <Route path="/gym"          element={<Gym />} />
          <Route path="/leaderboard"  element={<Leaderboard />} />
          <Route path="/profile"      element={<Profile />} />
        </Routes>
      </main>

      {/* Bottom nav — mobile only */}
      <BottomNav />
    </div>
  );
}
