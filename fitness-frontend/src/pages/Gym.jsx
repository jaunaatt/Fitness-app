import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Dumbbell, Plus, ChevronDown, ChevronRight, Calendar, Loader2 } from 'lucide-react';
import api from '../services/api.js';
import { useApp } from '../context/AppContext.jsx';
import Sheet from '../components/Sheet.jsx';
import ExerciseCard from '../components/ExerciseCard.jsx';
import { Card, EmptyState, SectionHeader, Toast } from '../components/Primitives.jsx';

// Exercise autocomplete suggestions
const EXERCISE_SUGGESTIONS = [
  'Bench Press — Wide Grip', 'Bench Press — Close Grip', 'Incline Dumbbell Press',
  'Squat — High Bar', 'Squat — Low Bar', 'Romanian Deadlift',
  'Deadlift — Conventional', 'Deadlift — Sumo',
  'Pull-Up', 'Chin-Up', 'Lat Pulldown',
  'Barbell Row — Overhand', 'Seated Cable Row',
  'Overhead Press', 'Arnold Press', 'Lateral Raise',
  'Tricep Pushdown', 'Skull Crushers', 'Bicep Curl',
  'Leg Press', 'Leg Curl', 'Calf Raise',
  'Plank', 'Hip Thrust', 'Face Pull',
];

// Stepper component for sets/reps
function Stepper({ label, value, onChange, min = 0 }) {
  return (
    <div className="flex-1">
      <label className="block font-body text-xs text-text-muted uppercase tracking-widest mb-2">
        {label}
      </label>
      <div className="flex items-center bg-bg-deep border border-white/10 rounded-xl overflow-hidden">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          aria-label={`Decrease ${label}`}
          className="w-11 h-11 flex items-center justify-center text-text-muted hover:text-white hover:bg-white/[0.05] transition-colors text-lg"
        >
          −
        </button>
        <span className="flex-1 text-center font-mono font-bold text-white text-lg">
          {value}
        </span>
        <button
          onClick={() => onChange(value + 1)}
          aria-label={`Increase ${label}`}
          className="w-11 h-11 flex items-center justify-center text-text-muted hover:text-white hover:bg-white/[0.05] transition-colors text-lg"
        >
          +
        </button>
      </div>
    </div>
  );
}



function HistoryAccordion({ session }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-bg-card border border-white/[0.05] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <Calendar size={15} className="text-text-faint" />
          <span className="font-body text-sm text-white font-medium">{session.date}</span>
          <span className="font-mono text-xs text-text-faint">
            {session.exercises.length} exercise{session.exercises.length !== 1 ? 's' : ''}
          </span>
        </div>
        <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronRight size={16} className="text-text-faint" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 flex flex-col gap-2 border-t border-white/[0.05] pt-3">
              {session.exercises.map((ex) => (
                <ExerciseCard
                  key={ex.id}
                  variationName={ex.variationName}
                  sets={ex.sets}
                  reps={ex.reps}
                  compact
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Gym() {
  const { state, addExercise, removeExercise } = useApp();
  const [open,  setOpen]  = useState(false);
  const [tab,   setTab]   = useState('today');
  const [toast, setToast] = useState(false);
  const [form,  setForm]  = useState({ variationName: '', sets: 3, reps: 10 });
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (tab === 'history') {
      setLoadingHistory(true);
      api.getGymHistory().then((data) => {
        if (data && data.length > 0) {
          // Since the backend doesn't return dates for individual exercises yet,
          // we group all history into a single block for now.
          setHistory([{ date: 'All Recorded Exercises', exercises: data.reverse() }]);
        } else {
          setHistory([]);
        }
        setLoadingHistory(false);
      });
    }
  }, [tab]);

  const filtered = form.variationName.length > 1
    ? EXERCISE_SUGGESTIONS.filter((s) =>
        s.toLowerCase().includes(form.variationName.toLowerCase())
      ).slice(0, 6)
    : [];

  const handleSave = async () => {
    if (!form.variationName) return;
    await addExercise({
      id:               Date.now(),
      variationName:    form.variationName,
      muscleGroupFocus: form.variationName,
      sets:             form.sets,
      reps:             form.reps,
      durationMinutes:  form.sets * form.reps,
      isRestDay:        false,
    });
    setForm({ variationName: '', sets: 3, reps: 10 });
    setOpen(false);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  return (
    <div className="px-5 py-6 md:px-8 md:py-8 max-w-3xl mx-auto pb-28 md:pb-10">
      <Toast message="Exercise logged ✓" visible={toast} />

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-extrabold text-2xl md:text-3xl text-white">
            Gym Log
          </h1>
          <p className="font-body text-sm text-text-muted mt-0.5">
            Log your lifts. Build the habit.
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => { setOpen(true); setShowSuggestions(false); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-blue text-white font-body text-sm font-medium hover:bg-accent-blue/90 transition-colors shadow-glow-blue/30"
        >
          <Plus size={16} />
          Log Exercise
        </motion.button>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-6 bg-bg-card rounded-xl p-1 w-fit border border-white/[0.05]">
        {['today', 'history'].map((t) => (
          <button
            key={t}
            id={`gym-tab-${t}`}
            onClick={() => setTab(t)}
            className={`px-5 py-1.5 rounded-lg font-body text-sm capitalize transition-all ${
              tab === t
                ? 'bg-accent-blue text-white'
                : 'text-text-muted hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'today' ? (
        <Card>
          <SectionHeader title="Today's Session" />
          {state.dailyLog.exercises.length === 0 ? (
            <EmptyState
              icon={Dumbbell}
              title="Nothing logged today"
              hint="First rep is the hardest."
            />
          ) : (
            <AnimatePresence>
              <div className="flex flex-col gap-2.5">
                {state.dailyLog.exercises.map((ex) => (
                  <ExerciseCard
                    key={ex.id}
                    variationName={ex.variationName ?? ex.muscleGroupFocus}
                    sets={ex.sets ?? '—'}
                    reps={ex.reps ?? '—'}
                    onDelete={() => removeExercise(ex.id)}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}
        </Card>
      ) : (
        /* History tab */
        <div className="flex flex-col gap-3">
          {loadingHistory ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="animate-spin text-text-faint" size={24} />
            </div>
          ) : history.length === 0 ? (
            <Card>
              <EmptyState
                icon={Calendar}
                title="No workout history yet"
                hint="Complete your first session to see it here."
              />
            </Card>
          ) : (
            history.map((session, i) => (
              <HistoryAccordion key={i} session={session} />
            ))
          )}
        </div>
      )}

      {/* ── Log Exercise Sheet ──────────────────────────────────────────────── */}
      <Sheet open={open} onClose={() => setOpen(false)} title="Log Exercise">
        <div className="flex flex-col gap-4">
          {/* Exercise name with autocomplete */}
          <div className="relative">
            <label className="block font-body text-xs text-text-muted uppercase tracking-widest mb-1.5">
              Exercise Name
            </label>
            <input
              id="gym-exercise-name"
              placeholder="e.g. Bench Press — Wide Grip"
              value={form.variationName}
              onChange={(e) => {
                setForm((f) => ({ ...f, variationName: e.target.value }));
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="ff-input"
              autoComplete="off"
            />
            <AnimatePresence>
              {showSuggestions && filtered.length > 0 && (
                <motion.ul
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute z-10 top-full left-0 right-0 mt-1 bg-bg-elevated border border-white/10 rounded-xl overflow-hidden shadow-xl"
                >
                  {filtered.map((s) => (
                    <li key={s}>
                      <button
                        className="w-full text-left px-4 py-2.5 font-body text-sm text-white hover:bg-white/[0.05] transition-colors"
                        onClick={() => {
                          setForm((f) => ({ ...f, variationName: s }));
                          setShowSuggestions(false);
                        }}
                      >
                        {s}
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* Sets & Reps steppers */}
          <div className="flex gap-4">
            <Stepper
              label="Sets"
              value={form.sets}
              onChange={(v) => setForm((f) => ({ ...f, sets: v }))}
              min={1}
            />
            <Stepper
              label="Reps"
              value={form.reps}
              onChange={(v) => setForm((f) => ({ ...f, reps: v }))}
              min={1}
            />
          </div>

          {/* Set/rep summary */}
          <div className="bg-bg-deep rounded-xl px-4 py-3 border border-white/[0.05]">
            <p className="font-body text-xs text-text-muted uppercase tracking-widest mb-0.5">Summary</p>
            <p className="font-mono text-white font-semibold">
              {form.variationName || '—'}{' '}
              <span className="text-text-muted">·</span>{' '}
              {form.sets} × {form.reps}
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={!form.variationName}
            className="w-full py-3.5 rounded-xl bg-accent-blue text-white font-display font-bold text-sm hover:bg-accent-blue/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save Exercise
          </motion.button>
        </div>
      </Sheet>
    </div>
  );
}
