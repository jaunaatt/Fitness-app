# ForgeFit — Gamified Fitness Tracker

Dark athletic-themed ReactJS frontend: nutrition + gym tracking with a
Duolingo-style streak/leaderboard layer, built per the design spec
(charcoal/neon palette, Syne/Inter/JetBrains Mono, streak flame signature).

## Setup

```bash
npm install
npm run dev      # http://localhost:5173
```

## Backend Connection & Authentication

This app is wired to a Spring Boot backend with **JWT Authentication**.

1. Start the backend (`mvnw spring-boot:run` in `fitness-backend/`).
2. The frontend defaults to `http://localhost:8080/api` for API calls. If you deploy it, set:
   ```bash
   # .env.local or Netlify Environment Variables
   VITE_API_URL=https://your-backend-url/api
   ```
3. Use the `/register` page to create an account, or `/login` if you have one.
4. JWT tokens are stored in `sessionStorage` and sent with all requests via an Axios interceptor.

## Structure

```
src/
  components/   StreakFlame, ProgressRing, ExerciseCard, LeaderboardRow,
                Sidebar, BottomNav, Sheet, Primitives (Card/Skeleton/EmptyState),
                PrivateRoute (Route guard)
  context/      AuthContext (JWT management), AppContext (global state + API syncing)
  services/     api.js — axios layer with JWT interceptor + 401 redirect
  pages/        Login, Register, Dashboard, Profile, Nutrition, Gym, Leaderboard
```

## Features

- **Full Auth Flow**: Register, Login, Logout, and Protected Routes.
- **Gym Logging**: Real-time logging of exercise variations, sets, and reps with full backend history syncing.
- **Nutrition**: Calorie and protein tracking with daily reset capability and item deletion.
- **Leaderboard**: Real-time ranking based on points, streaks, and workouts.
