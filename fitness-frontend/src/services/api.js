import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 6000,
});

/**
 * Wraps any promise so a missing/offline backend degrades gracefully to null.
 * Pages handle null with empty states — the UI never crashes due to network issues.
 */
async function safe(promise) {
  try {
    const res = await promise;
    return res.data;
  } catch (err) {
    console.warn('[api] request failed:', err?.message || err);
    return null;
  }
}

const api = {
  // ── Profile ────────────────────────────────────────────────────────────────
  getProfile:  (userId)  => safe(client.get(`/users/${userId}`)),
  saveProfile: (profile) => safe(client.post('/users', profile)),

  // ── Nutrition ───────────────────────────────────────────────────────────────
  getNutritionTargets: (userId) => safe(client.get('/nutrition/targets',  { params: { userId } })),
  getTodayNutrition:   (userId) => safe(client.get('/nutrition/today',    { params: { userId } })),
  logFood:             (userId, food)    => safe(client.post(`/users/${userId}/log-food`, food)),
  resetNutrition:      (userId) => safe(client.post(`/users/${userId}/reset-nutrition`)),

  // ── Gym ─────────────────────────────────────────────────────────────────────
  checkInWorkout: (userId, session) => safe(client.post(`/users/${userId}/check-in-workout`, session)),
  getGymHistory:  ()               => safe(client.get('/workout-sessions')),

  // ── Streak ──────────────────────────────────────────────────────────────────
  getStreak: (userId) => safe(client.get(`/users/${userId}`)),

  // ── Leaderboard ─────────────────────────────────────────────────────────────
  getLeaderboard: ()               => safe(client.get('/leaderboard')),
  getTopPlayers:  (limit = 3)      => safe(client.get('/leaderboard/top', { params: { limit } })),
};

export default api;
