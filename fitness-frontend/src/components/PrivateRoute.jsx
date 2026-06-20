import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * PrivateRoute — wraps protected pages.
 *
 * If the user is not authenticated, redirects to /login and preserves the
 * original path in `state.from` so we can return to it after login.
 * If authenticated, renders children directly.
 */
export default function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
