# ForgeFit — Gamified Fitness Tracker

Dark athletic-themed ReactJS frontend: nutrition + gym tracking with a
Duolingo-style streak/leaderboard layer, built per the design spec
(charcoal/neon palette, Syne/Inter/JetBrains Mono, streak flame signature).

## Setup

```bash
npm install
npm run dev      # http://localhost:5173
```

Network access was unavailable in the build environment this was created in,
so `npm install` has not been run/verified here — running it locally will
pull all listed dependencies cleanly (they're all stable, widely-used
packages).

## Connecting a backend

By default the app falls back to in-memory demo state when no API responds
(see `src/services/api.js`). To point it at a real backend, set:

```bash
# .env.local
VITE_API_URL=http://localhost:8080/api
```

This maps to the endpoints in the spec: `/users`, `/nutrition/*`,
`/gym` (via `/users/:id/check-in-workout`), `/leaderboard`.

## Structure

```
src/
  components/   StreakFlame, ProgressRing, ExerciseCard, LeaderboardRow,
                Sidebar, BottomNav, Sheet, Primitives (Card/Skeleton/EmptyState)
  context/      AppContext — React Context + useReducer for global state
  services/     api.js — axios layer, fails gracefully to null
  pages/        Dashboard, Profile, Nutrition, Gym, Leaderboard
```

## Notes on what's mocked vs wired

- All five pages are functional against local state immediately (no backend
  required to click around).
- `addFood` / `addExercise` / `saveProfile` write to local state immediately
  (optimistic) *and* fire the matching API call in the background.
- Leaderboard and profile hydrate from the API on load if reachable, else
  fall back to demo data.
- The 7-day nutrition history chart uses static demo data — wire it to
  `/nutrition/history` if/when that endpoint exists.
