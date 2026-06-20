import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

const SESSION_TOKEN_KEY = 'forgefit_token';
const SESSION_USER_KEY  = 'forgefit_user';

/**
 * AuthProvider — manages authentication state for the entire app.
 *
 * JWT Storage: we use sessionStorage (cleared when the browser tab closes).
 * This is an accepted tradeoff for this project's scope. A more secure approach
 * would be an httpOnly cookie set by the backend, which is invisible to JavaScript
 * and therefore immune to XSS. If the team wants to harden further, implement a
 * /auth/refresh flow with httpOnly cookies. See api.js for more detail.
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem(SESSION_TOKEN_KEY));
  const [user,  setUser]  = useState(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Keep sessionStorage in sync whenever token/user change
  useEffect(() => {
    if (token && user) {
      sessionStorage.setItem(SESSION_TOKEN_KEY, token);
      sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
      sessionStorage.removeItem(SESSION_USER_KEY);
    }
  }, [token, user]);

  /**
   * Register a new account.
   * On success, stores the JWT and user info and returns { ok: true }.
   * On failure, returns { ok: false, message: '...' }.
   */
  const register = useCallback(async (username, password) => {
    try {
      const data = await api.register(username, password);
      setToken(data.token);
      setUser({ id: data.userId, username: data.username });
      return { ok: true };
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Registration failed. Please try again.';
      return { ok: false, message };
    }
  }, []);

  /**
   * Log in with existing credentials.
   * On success, stores the JWT and user info and returns { ok: true }.
   * On failure, returns { ok: false, message: '...' }.
   */
  const login = useCallback(async (username, password) => {
    try {
      const data = await api.login(username, password);
      setToken(data.token);
      setUser({ id: data.userId, username: data.username });
      return { ok: true };
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Login failed. Please check your credentials.';
      return { ok: false, message };
    }
  }, []);

  /**
   * Log out the current user.
   * Clears JWT from sessionStorage and resets auth state.
   * The api.js 401 interceptor also calls this pattern automatically.
   */
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
