import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import BottomNav from './components/BottomNav.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import Nutrition from './pages/Nutrition.jsx';
import Gym from './pages/Gym.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import Confetti from './components/Confetti.jsx';
import { useApp } from './context/AppContext.jsx';
import { useAuth } from './context/AuthContext.jsx';

/**
 * Layout shell for authenticated pages (sidebar + bottom nav).
 */
function AppShell({ children }) {
  const { state } = useApp();
  return (
    <div className="flex bg-bg-deep min-h-screen">
      <Confetti active={state.streakJustBumped} />
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto h-screen">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* ── Public routes ──────────────────────────────────────────── */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
      />

      {/* Leaderboard is publicly accessible (read-only rankings) */}
      <Route
        path="/leaderboard"
        element={
          <AppShell>
            <Leaderboard />
          </AppShell>
        }
      />

      {/* ── Protected routes ───────────────────────────────────────── */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <AppShell>
              <Dashboard />
            </AppShell>
          </PrivateRoute>
        }
      />
      <Route
        path="/nutrition"
        element={
          <PrivateRoute>
            <AppShell>
              <Nutrition />
            </AppShell>
          </PrivateRoute>
        }
      />
      <Route
        path="/gym"
        element={
          <PrivateRoute>
            <AppShell>
              <Gym />
            </AppShell>
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <AppShell>
              <Profile />
            </AppShell>
          </PrivateRoute>
        }
      />

      {/* Default redirect */}
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
      />
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
      />
    </Routes>
  );
}
