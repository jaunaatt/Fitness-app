import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, ChevronRight, Dumbbell, Apple, Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import StreakFlame from '../components/StreakFlame.jsx';
import ProgressRing from '../components/ProgressRing.jsx';
import ExerciseCard from '../components/ExerciseCard.jsx';
import LeaderboardRow from '../components/LeaderboardRow.jsx';
import { Card, Skeleton, EmptyState, SectionHeader } from '../components/Primitives.jsx';
import { useAuth } from '../context/AuthContext.jsx';

// Staggered card animation
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0 },
};

const containerVariants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
};

function streakCardClass(count) {
  if (count <= 0)  return 'border-white/5';
  if (count < 7)   return 'border-accent-ember/25 streak-card-ember';
  if (count < 30)  return 'border-orange-400/30 streak-card-ember';
  return                  'border-accent-green/40 streak-card-inferno';
}

export default function Dashboard() {
  const { state } = useApp();
  const { user } = useAuth();
  const { loading, streak, nutritionTargets, dailyLog, leaderboard } = state;

  const caloriesConsumed = dailyLog.food.reduce(
    (s, f) => s + (f.calories ?? f.calorie ?? 0), 0
  );
  const proteinConsumed = dailyLog.food.reduce(
    (s, f) => s + (f.proteinGram ?? f.protein ?? 0), 0
  );
  const todayExercises = dailyLog.exercises.slice(-3).reverse();
  const topThree = leaderboard.slice(0, 3);
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <div className="px-5 py-6 md:px-8 md:py-8 max-w-6xl mx-auto pb-28 md:pb-10">
      {/* Page header */}
      <div className="mb-7">
        <p className="font-body text-xs text-text-faint uppercase tracking-widest mb-1">
          {currentDate}
        </p>
        <h1 className="font-display font-extrabold text-2xl md:text-3xl text-white">
          Dashboard
        </h1>
      </div>

      {/* ── Streak Hero Card ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className={`relative overflow-hidden rounded-2xl border bg-bg-card depth-sheen p-6 mb-7 ${streakCardClass(streak.currentStreak)}`}
      >
        {/* Background accent blob */}
        <div
          className="absolute -right-8 -top-8 w-48 h-48 rounded-full opacity-[0.07] pointer-events-none"
          style={{
            background:
              streak.currentStreak >= 30 ? '#39FF14' :
              streak.currentStreak > 0   ? '#FF6B1A' : 'transparent',
            filter: 'blur(40px)',
          }}
        />

        <div className="flex items-center justify-between relative z-10">
          <div>
            <StreakFlame streakCount={streak.currentStreak} size="lg" />
            <p className="font-body text-sm text-text-muted mt-3">
              {streak.currentStreak > 0
                ? `Day ${streak.currentStreak} — you showed up. Keep going.`
                : 'Log food or a workout to start your streak.'}
            </p>
          </div>

          {/* Quick CTA */}
          <Link
            to="/gym"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-blue/15 border border-accent-blue/30 text-accent-blue font-body text-sm font-medium hover:bg-accent-blue/25 transition-colors shrink-0"
          >
            <Plus size={15} />
            Log workout
          </Link>
        </div>
      </motion.div>

      {/* ── Three-column card grid ───────────────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {/* ── Nutrition Summary ───────────────────────── */}
        <motion.div variants={cardVariants}>
          <Card>
            <SectionHeader
              title="Today's Nutrition"
              action={
                <Link
                  to="/nutrition"
                  className="flex items-center gap-1 font-body text-xs text-accent-blue hover:underline"
                >
                  <Apple size={12} />
                  Log food
                </Link>
              }
            />

            {loading ? (
              <div className="flex gap-8 justify-center py-4">
                <Skeleton className="w-[120px] h-[120px] rounded-full" />
                <Skeleton className="w-[120px] h-[120px] rounded-full" />
              </div>
            ) : (
              <div className="flex justify-center gap-8 py-2">
                <ProgressRing
                  value={Math.round(caloriesConsumed)}
                  max={nutritionTargets.calories}
                  label="Calories"
                  color="#3D6EFF"
                  unit="kcal"
                />
                <ProgressRing
                  value={Math.round(proteinConsumed)}
                  max={nutritionTargets.protein}
                  label="Protein"
                  color="#39FF14"
                  unit="g"
                />
              </div>
            )}
          </Card>
        </motion.div>

        {/* ── Today's Workout ─────────────────────────── */}
        <motion.div variants={cardVariants}>
          <Card>
            <SectionHeader
              title="Today's Workout"
              action={
                <Link
                  to="/gym"
                  className="flex items-center gap-1 font-body text-xs text-accent-blue hover:underline"
                >
                  <Plus size={12} />
                  Log
                </Link>
              }
            />

            {loading ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : todayExercises.length === 0 ? (
              <EmptyState
                icon={Dumbbell}
                title="Nothing logged today"
                hint="First rep is the hardest."
              />
            ) : (
              <div className="flex flex-col gap-2">
                {todayExercises.map((ex, i) => (
                  <ExerciseCard
                    key={ex.id ?? i}
                    variationName={ex.variationName ?? ex.muscleGroupFocus ?? 'Session'}
                    sets={ex.sets ?? 1}
                    reps={ex.reps ?? ex.durationMinutes ?? 0}
                    compact
                  />
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* ── Leaderboard Snapshot ────────────────────── */}
        <motion.div variants={cardVariants}>
          <Card>
            <SectionHeader
              title="Leaderboard"
              action={
                <Link
                  to="/leaderboard"
                  className="flex items-center gap-1 font-body text-xs text-accent-blue hover:underline"
                >
                  <Trophy size={12} />
                  View all
                  <ChevronRight size={11} />
                </Link>
              }
            />

            {loading ? (
              <div className="flex flex-col gap-2">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-11 w-full" />
                ))}
              </div>
            ) : topThree.length === 0 ? (
              <EmptyState icon={Trophy} title="No data yet" hint="Be the first on the board." />
            ) : (
              <div className="flex flex-col gap-2">
                {topThree.map((u, i) => (
                  <LeaderboardRow
                    key={u.id ?? i}
                    rank={i + 1}
                    username={u.username}
                    streakCount={u.currentStreak}
                    isCurrentUser={u.id === user?.id}
                  />
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
