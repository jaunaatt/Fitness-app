import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import api from '../services/api.js';

const AppContext = createContext(null);

const DEMO_USER_ID = 1;

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
  userId:  DEMO_USER_ID,
  userProfile: { height: '', weight: '', age: '', gender: 'male', activity: 'light' },
  nutritionTargets: { calories: 2200, protein: 150 },
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

    case 'BUMP_STREAK': {
      const today = new Date().toDateString();
      if (state.streak.lastLogDate === today) return state;
      return {
        ...state,
        streak: { currentStreak: state.streak.currentStreak + 1, lastLogDate: today },
        streakJustBumped: true,
      };
    }

    case 'CLEAR_STREAK_BUMP':
      return { ...state, streakJustBumped: false };

    case 'SET_LEADERBOARD':
      return { ...state, leaderboard: action.payload };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const bumpTimerRef = useRef(null);

  // Initial data fetch
  useEffect(() => {
    (async () => {
      const [profile, leaderboard] = await Promise.all([
        api.getProfile(state.userId),
        api.getLeaderboard(),
      ]);

      // If we have a saved profile, recalculate targets client-side too
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
                dailyLog: {
                  food:      profile.nutritionTracker?.dailyConsumed ?? [],
                  exercises: profile.workoutTracker?.history ?? [],
                },
              }
            : {}),
          leaderboard: leaderboard ?? demoLeaderboard(),
        },
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    dispatch({ type: 'ADD_FOOD', payload: food });
    dispatch({ type: 'BUMP_STREAK' });
    await api.logFood(state.userId, food);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.userId]);

  const addExercise = useCallback(async (session) => {
    dispatch({ type: 'ADD_EXERCISE', payload: session });
    if (!session.isRestDay) dispatch({ type: 'BUMP_STREAK' });
    await api.checkInWorkout(state.userId, session);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.userId]);

  const removeExercise = useCallback((id) => {
    dispatch({ type: 'REMOVE_EXERCISE', payload: id });
  }, []);

  const saveProfile = useCallback(async (profile) => {
    dispatch({ type: 'SET_PROFILE', payload: profile });
    await api.saveProfile({ username: 'You', ...profile });
  }, []);

  const value = { state, dispatch, addFood, addExercise, removeExercise, saveProfile };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

function demoLeaderboard() {
  return [
    { id: 1, username: 'AliceFit',      totalPoints: 980, currentStreak: 42, workoutsThisWeek: 6 },
    { id: 2, username: 'BobLift',        totalPoints: 860, currentStreak: 28, workoutsThisWeek: 5 },
    { id: 3, username: 'CharlieActive',  totalPoints: 710, currentStreak: 15, workoutsThisWeek: 4 },
    { id: 4, username: 'DanaRuns',       totalPoints: 540, currentStreak: 9,  workoutsThisWeek: 3 },
    { id: 5, username: 'You',            totalPoints: 120, currentStreak: 3,  workoutsThisWeek: 2 },
  ];
}
