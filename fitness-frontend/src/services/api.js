import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// ── Request interceptor: attach JWT from sessionStorage ───────────────────────
// NOTE: Storing JWT in sessionStorage is an accepted tradeoff for this project's
// scope. A more secure approach would be an httpOnly cookie set by the backend,
// which is immune to XSS. If the team wants to harden further later, implement
// a /auth/refresh endpoint that issues a short-lived access token via httpOnly cookie.
client.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('forgefit_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle 401 globally ────────────────────────────────
// On any 401, clear stored auth state and redirect to /login so the user
// is never stuck in a broken authenticated-but-rejected state.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('forgefit_token');
      sessionStorage.removeItem('forgefit_user');
      // Redirect to login (works even without React Router access here)
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Wraps any promise so a missing/offline backend degrades gracefully to null.
 * Pages handle null with empty states — the UI never crashes due to network issues.
 */
async function safe(promise) {
  try {
    const res = await promise;
    return res.data;
  } catch (err) {
    console.warn('[api] request failed:', err?.response?.data || err?.message || err);
    return null;
  }
}

/**
 * Like `safe`, but throws on error instead of returning null.
 * Used for auth actions where the caller needs to handle the error (e.g. show a message).
 */
async function strictCall(promise) {
  const res = await promise;
  return res.data;
}

const api = {
  // ── Auth ────────────────────────────────────────────────────────────────────
  /**
   * Register a new user. Returns { token, userId, username } or throws with
   * a descriptive error message from the backend.
   */
  register: (username, password) =>
    strictCall(client.post('/auth/register', { username, password })),

  /**
   * Login with existing credentials. Returns { token, userId, username } or throws.
   */
  login: (username, password) =>
    strictCall(client.post('/auth/login', { username, password })),

  // ── Profile ─────────────────────────────────────────────────────────────────
  // Returns the full User entity (includes nutritionTracker, workoutTracker nested)
  getProfile: (userId) => safe(client.get(`/users/${userId}`)),

  /**
   * Persist physical profile (height, weight, age, gender, activity) to backend.
   * Returns updated User entity on success, null on network error.
   */
  updateProfile: (userId, profileData) =>
    safe(client.put(`/users/${userId}/profile`, profileData)),

  /**
   * Override daily nutrition targets (calories & protein) manually.
   * Returns the updated User entity.
   */
  updateNutritionTarget: (userId, { dailyCalorieTarget, dailyProteinTarget }) =>
    safe(client.put(`/users/${userId}/nutrition-target`, { dailyCalorieTarget, dailyProteinTarget })),

  /**
   * Update the user's weekly workout target (number of days per week).
   */
  updateWorkoutTarget: (userId, weeklyTargetDays) =>
    safe(client.put(`/users/${userId}/workout-target`, { weeklyTargetDays })),

  /**
   * Change the authenticated user's password.
   * Uses strictCall so the caller can handle errors (e.g. wrong current password).
   */
  changePassword: (userId, currentPassword, newPassword) =>
    strictCall(client.put(`/users/${userId}/password`, { currentPassword, newPassword })),

  // ── Nutrition ───────────────────────────────────────────────────────────────
  /**
   * Log a food item for the authenticated user.
   * Sends optional clientDate (ISO date string) for correct streak calculation.
   */
  logFood: (userId, food, clientDate) => {
    const params = clientDate ? { clientDate } : {};
    return safe(client.post(`/users/${userId}/log-food`, food, { params }));
  },

  resetNutrition: (userId) => safe(client.post(`/users/${userId}/reset-nutrition`)),

  // ── Food Items ──────────────────────────────────────────────────────────────
  /**
   * Delete a food item by its backend-assigned id.
   * Backend enforces ownership — only the owning user can delete their own items.
   */
  deleteFoodItem: (id) => safe(client.delete(`/food-items/${id}`)),

  /**
   * Update an existing food item. Backend enforces ownership.
   */
  updateFoodItem: (id, data) => safe(client.put(`/food-items/${id}`, data)),

  // ── Gym ─────────────────────────────────────────────────────────────────────
  /**
   * Check in a workout session. Sends optional clientDate for streak tracking.
   */
  checkInWorkout: (userId, session, clientDate) => {
    const params = clientDate ? { clientDate } : {};
    return safe(client.post(`/users/${userId}/check-in-workout`, session, { params }));
  },

  /**
   * Fetch the authenticated user's full workout session history.
   * Backend scopes this to the current principal — no userId needed.
   */
  getGymHistory: () => safe(client.get('/workout-sessions')),

  /**
   * Update an existing workout session (edit). Backend enforces ownership.
   */
  updateWorkoutSession: (id, data) => safe(client.put(`/workout-sessions/${id}`, data)),

  // ── Account ──────────────────────────────────────────────────────────────────
  /**
   * Permanently delete the authenticated user's account (cascade deletes all data).
   * Uses strictCall so the caller can handle errors.
   */
  deleteAccount: (userId) => strictCall(client.delete(`/users/${userId}`)),

  // ── Leaderboard ─────────────────────────────────────────────────────────────
  getLeaderboard: () => safe(client.get('/leaderboard')),
  getTopPlayers:  (limit = 3) => safe(client.get('/leaderboard/top', { params: { limit } })),
};

export default api;

