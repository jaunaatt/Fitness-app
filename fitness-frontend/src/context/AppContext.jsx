import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import api from '../services/api.js';
import { useAuth } from './AuthContext.jsx';

const AppContext = createContext(null);

/** Mifflin-St Jeor + activity multiplier */
function calcTargets({ height, weight, age, gender, activity }) {
  if (!height || !weight || !age) return { calories: null, protein: null, bmi: null, bmiLabel: null };
  const bmr =
    gender === 'female'
      ? 10 * weight + 6.25 * height - 5 * age - 161
      : 10 * weight + 6.25 * height - 5 * age + 5;
  const mult = { sedentary: 1.2, light: 1.375, active: 1.55, very_active: 1.725 }[activity] ?? 1.4;
  const calories = Math.round(bmr * mult);
  const protein  = Math.round(weight * 1.8);
  const bmi      = +(weight / (height / 100) ** 2).toFixed(1);
  const bmiLabel =
    bmi < 18.5 ? 'Underweight' :
    bmi < 25   ? 'Normal'      :
    bmi < 30   ? 'Overweight'  : 'Obese';
  return { calories, protein, bmi, bmiLabel };
}

const initialState = {
  loading: true,
  userProfile: { height: '', weight: '', age: '', gender: 'male', activity: 'light', leaderboardVisible: true },
  nutritionTargets: { calories: 2200, protein: 150 },
  useManualTarget: false,         // if true, backend targets override Mifflin-St Jeor
  weeklyWorkoutTarget: 4,         // mirrors WorkoutTracker.weeklyTargetDays
  dailyLog:  { food: [], exercises: [] },
  streak:    { currentStreak: 0, lastLogDate: null },
  leaderboard: [],
  bmi: null,
  bmiLabel: null,
  streakJustBumped: false, // for triggering confetti
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'HYDRATE':
      return { ...state, ...action.payload };

    case 'RESET':
      return { ...initialState, loading: false };

    case 'SET_PROFILE': {
      const userProfile = { ...state.userProfile, ...action.payload };
      const targets = calcTargets(userProfile);
      return {
        ...state,
        userProfile,
        nutritionTargets: {
          calories: targets.calories ?? state.nutritionTargets.calories,
          protein:  targets.protein  ?? state.nutritionTargets.protein,
        },
        bmi:      targets.bmi,
        bmiLabel: targets.bmiLabel,
      };
    }

    case 'ADD_FOOD':
      return {
        ...state,
        dailyLog: { ...state.dailyLog, food: [...state.dailyLog.food, action.payload] },
      };

    case 'REMOVE_FOOD':
      return {
        ...state,
        dailyLog: {
          ...state.dailyLog,
          food: state.dailyLog.food.filter((f) => f.id !== action.payload),
        },
      };

    case 'ADD_EXERCISE':
      return {
        ...state,
        dailyLog: { ...state.dailyLog, exercises: [...state.dailyLog.exercises, action.payload] },
      };

    case 'REMOVE_EXERCISE':
      return {
        ...state,
        dailyLog: {
          ...state.dailyLog,
          exercises: state.dailyLog.exercises.filter((e) => e.id !== action.payload),
        },
      };

    case 'UPDATE_FOOD':
      return {
        ...state,
        dailyLog: {
          ...state.dailyLog,
          food: state.dailyLog.food.map((f) => f.id === action.payload.id ? { ...f, ...action.payload } : f),
        },
      };

    case 'UPDATE_EXERCISE':
      return {
        ...state,
        dailyLog: {
          ...state.dailyLog,
          exercises: state.dailyLog.exercises.map((e) => e.id === action.payload.id ? { ...e, ...action.payload } : e),
        },
      };

    case 'BUMP_STREAK': {
      const today = new Date().toISOString().slice(0, 10);
      if (state.streak.lastLogDate === today) return state;
      return {
        ...state,
        streak: { currentStreak: state.streak.currentStreak + 1, lastLogDate: today },
        streakJustBumped: true,
      };
    }

    case 'CLEAR_STREAK_BUMP':
      return { ...state, streakJustBumped: false };

    case 'SET_MANUAL_TARGET':
      return {
        ...state,
        useManualTarget: true,
        nutritionTargets: {
          calories: action.payload.calories ?? state.nutritionTargets.calories,
          protein:  action.payload.protein  ?? state.nutritionTargets.protein,
        },
      };

    case 'SET_AUTO_TARGET':
      return { ...state, useManualTarget: false };

    case 'SET_WEEKLY_TARGET':
      return { ...state, weeklyWorkoutTarget: action.payload };

    case 'SET_LEADERBOARD':
      return { ...state, leaderboard: action.payload };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);
  const bumpTimerRef = useRef(null);

  // Re-fetch profile data whenever the authenticated user changes.
  // On logout (isAuthenticated → false), reset to empty state.
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      dispatch({ type: 'RESET' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    (async () => {
      const [profile, leaderboard] = await Promise.all([
        api.getProfile(user.id),
        api.getLeaderboard(),
      ]);

      let profileTargets = {};
      if (profile?.userProfile) {
        const t = calcTargets(profile.userProfile);
        if (t.calories) profileTargets = { bmi: t.bmi, bmiLabel: t.bmiLabel };
      }

      dispatch({
        type: 'HYDRATE',
        payload: {
          loading: false,
          ...profileTargets,
          ...(profile
            ? {
                userProfile: profile.userProfile ?? initialState.userProfile,
                streak: {
                  currentStreak: profile.currentStreak ?? 0,
                  lastLogDate:   profile.lastLogDate ?? null,
                },
                nutritionTargets: {
                  calories: profile.nutritionTracker?.dailyCalorieTarget ?? initialState.nutritionTargets.calories,
                  protein:  profile.nutritionTracker?.dailyProteinTarget ?? initialState.nutritionTargets.protein,
                },
                weeklyWorkoutTarget: profile.workoutTracker?.weeklyTargetDays ?? 4,
                dailyLog: {
                  food:      profile.nutritionTracker?.dailyConsumed ?? [],
                  exercises: profile.workoutTracker?.history ?? [],
                },
              }
            : {}),
          leaderboard: leaderboard ?? [],
        },
      });
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  // Auto-clear streak bump flag after 2.5s
  useEffect(() => {
    if (state.streakJustBumped) {
      bumpTimerRef.current = setTimeout(() => {
        dispatch({ type: 'CLEAR_STREAK_BUMP' });
      }, 2500);
    }
    return () => clearTimeout(bumpTimerRef.current);
  }, [state.streakJustBumped]);

  const addFood = useCallback(async (food) => {
    if (!user?.id) return;
    // Optimistic update — add food to local state immediately for snappy UI
    dispatch({ type: 'ADD_FOOD', payload: food });
    dispatch({ type: 'BUMP_STREAK' });

    // Pass client's local date so streak is calculated in the user's timezone
    const clientDate = new Date().toISOString().slice(0, 10);
    const updated = await api.logFood(user.id, food, clientDate);

    // If the backend returns the updated user, sync the food list (which now
    if (updated?.nutritionTracker?.dailyConsumed) {
      dispatch({
        type: 'HYDRATE',
        payload: {
          dailyLog: {
            ...state.dailyLog,
            food: updated.nutritionTracker.dailyConsumed,
          },
        },
      });
    }

    const leaderboard = await api.getLeaderboard();
    if (leaderboard) {
      dispatch({ type: 'SET_LEADERBOARD', payload: leaderboard });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, state.dailyLog]);

  const removeFood = useCallback(async (foodId) => {
    // Optimistic update
    dispatch({ type: 'REMOVE_FOOD', payload: foodId });
    await api.deleteFoodItem(foodId);
  }, []);

  const addExercise = useCallback(async (session) => {
    if (!user?.id) return;
    dispatch({ type: 'ADD_EXERCISE', payload: session });
    if (!session.isRestDay) dispatch({ type: 'BUMP_STREAK' });

    const clientDate = new Date().toISOString().slice(0, 10);
    const updated = await api.checkInWorkout(user.id, session, clientDate);

    if (updated?.workoutTracker?.history) {
      dispatch({
        type: 'HYDRATE',
        payload: {
          dailyLog: {
            ...state.dailyLog,
            exercises: updated.workoutTracker.history,
          },
        },
      });
    }

    const leaderboard = await api.getLeaderboard();
    if (leaderboard) {
      dispatch({ type: 'SET_LEADERBOARD', payload: leaderboard });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, state.dailyLog]);

  const removeExercise = useCallback((id) => {
    dispatch({ type: 'REMOVE_EXERCISE', payload: id });
  }, []);

  const editFood = useCallback(async (id, foodData) => {
    dispatch({ type: 'UPDATE_FOOD', payload: { id, ...foodData } });
    await api.updateFoodItem(id, foodData);
  }, []);

  const editExercise = useCallback(async (id, exerciseData) => {
    dispatch({ type: 'UPDATE_EXERCISE', payload: { id, ...exerciseData } });
    await api.updateWorkoutSession(id, exerciseData);
  }, []);

  const saveProfile = useCallback(async (profile) => {
    // 1. Optimistic local update — recalculates BMI & targets immediately
    dispatch({ type: 'SET_PROFILE', payload: profile });

    // 2. Persist to backend
    if (!user?.id) return;
    const updated = await api.updateProfile(user.id, profile);
    // If backend echoes back updated userProfile, re-sync to stay consistent
    if (updated?.userProfile) {
      dispatch({ type: 'SET_PROFILE', payload: updated.userProfile });
    }
  }, [user?.id]);

  /**
   * Save manual nutrition targets (calories + protein) to the backend.
   * Switches the context into "manual target" mode.
   */
  const saveNutritionTarget = useCallback(async (calories, protein) => {
    // Optimistic update first
    dispatch({ type: 'SET_MANUAL_TARGET', payload: { calories, protein } });

    if (!user?.id) return;
    const updated = await api.updateNutritionTarget(user.id, {
      dailyCalorieTarget: calories,
      dailyProteinTarget: protein,
    });
    // Sync from backend response to ensure consistency
    if (updated?.nutritionTracker) {
      dispatch({
        type: 'SET_MANUAL_TARGET',
        payload: {
          calories: updated.nutritionTracker.dailyCalorieTarget,
          protein:  updated.nutritionTracker.dailyProteinTarget,
        },
      });
    }
  }, [user?.id]);

  /**
   * Update the weekly workout target.
   */
  const saveWorkoutTarget = useCallback(async (weeklyTargetDays) => {
    // Optimistic update
    dispatch({ type: 'SET_WEEKLY_TARGET', payload: weeklyTargetDays });

    if (!user?.id) return;
    await api.updateWorkoutTarget(user.id, weeklyTargetDays);
  }, [user?.id]);

  const value = {
    state,
    dispatch,
    addFood,
    removeFood,
    addExercise,
    removeExercise,
    saveProfile,
    saveNutritionTarget,
    saveWorkoutTarget,
    editFood,
    editExercise,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
