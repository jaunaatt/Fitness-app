import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Check, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { Card, Toast } from '../components/Primitives.jsx';

const ACTIVITY_OPTIONS = [
  { value: 'sedentary',  label: 'Sedentary',      sub: 'Little or no exercise'           },
  { value: 'light',      label: 'Lightly Active',  sub: '1–3 days/week'                   },
  { value: 'active',     label: 'Active',           sub: '3–5 days/week'                   },
  { value: 'very_active',label: 'Very Active',      sub: '6–7 days/week or physical job'   },
];

function Field({ label, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block font-body text-xs text-text-muted uppercase tracking-widest mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function StatCard({ label, value, unit, sub, color }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-bg-card border border-white/[0.06] rounded-2xl p-5 text-center relative overflow-hidden"
    >
      {/* Top accent line */}
      {color && (
        <div
          className="absolute top-0 left-6 right-6 h-[2px] rounded-full"
          style={{ backgroundColor: color, opacity: 0.6 }}
        />
      )}
      <p className="font-mono text-2xl font-bold text-white mt-1">
        {value ?? '—'}
        {unit && (
          <span className="font-mono text-sm text-text-dim ml-1.5">{unit}</span>
        )}
      </p>
      <p className="font-body text-[11px] text-text-faint mt-1.5 uppercase tracking-widest">
        {label}
      </p>
      {sub && (
        <p className="font-body text-xs text-text-muted mt-0.5">{sub}</p>
      )}
    </motion.div>
  );
}

function bmiColor(bmiLabel) {
  return bmiLabel === 'Normal'      ? '#39FF14' :
         bmiLabel === 'Underweight' ? '#3D6EFF' :
         bmiLabel === 'Overweight'  ? '#FF6B1A' :
         bmiLabel === 'Obese'       ? '#FF3D3D' : '#8A8A92';
}

export default function Profile() {
  const { state, saveProfile } = useApp();
  const [form,  setForm]  = useState(state.userProfile);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState(false);

  // Sync form if state.userProfile changes externally (e.g. hydration)
  useEffect(() => {
    setForm(state.userProfile);
  }, [state.userProfile]);

  const update = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    await saveProfile(form);
    setSaved(true);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  const calories  = state.nutritionTargets.calories;
  const protein   = state.nutritionTargets.protein;
  const bmi       = state.bmi;
  const bmiLabel  = state.bmiLabel;

  return (
    <div className="px-5 py-6 md:px-8 md:py-8 max-w-3xl mx-auto pb-28 md:pb-10">
      <Toast message="Profile saved ✓" visible={toast} />

      {/* Page header */}
      <div className="flex items-center gap-3 mb-7">
        <div className="w-10 h-10 rounded-xl bg-accent-blue/15 border border-accent-blue/30 flex items-center justify-center">
          <User size={20} className="text-accent-blue" />
        </div>
        <div>
          <h1 className="font-display font-extrabold text-2xl md:text-3xl text-white leading-none">
            Profile
          </h1>
          <p className="font-body text-sm text-text-muted mt-0.5">
            Tell us about yourself — we'll set your daily targets.
          </p>
        </div>
      </div>

      {/* ── Input form ─────────────────────────────────────────────────────────── */}
      <Card className="mb-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Height */}
          <Field label="Height (cm)">
            <input
              id="profile-height"
              type="number"
              value={form.height}
              onChange={(e) => update('height', +e.target.value)}
              className="ff-input ff-input-mono"
              placeholder="175"
              min="100"
              max="250"
            />
          </Field>

          {/* Weight */}
          <Field label="Weight (kg)">
            <input
              id="profile-weight"
              type="number"
              value={form.weight}
              onChange={(e) => update('weight', +e.target.value)}
              className="ff-input ff-input-mono"
              placeholder="75"
              min="30"
              max="300"
            />
          </Field>

          {/* Age */}
          <Field label="Age">
            <input
              id="profile-age"
              type="number"
              value={form.age}
              onChange={(e) => update('age', +e.target.value)}
              className="ff-input ff-input-mono"
              placeholder="25"
              min="10"
              max="100"
            />
          </Field>

          {/* Gender */}
          <Field label="Gender">
            <div className="flex gap-2">
              {['male', 'female'].map((g) => (
                <button
                  key={g}
                  id={`profile-gender-${g}`}
                  onClick={() => update('gender', g)}
                  className={`flex-1 py-2.5 rounded-xl font-body text-sm capitalize border transition-all ${
                    form.gender === g
                      ? 'bg-accent-blue/15 border-accent-blue text-white'
                      : 'border-white/10 text-text-muted hover:text-white hover:border-white/20'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </Field>
        </div>

        {/* Activity level */}
        <Field label="Activity Level" className="mt-5">
          <div className="grid grid-cols-2 gap-2">
            {ACTIVITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                id={`profile-activity-${opt.value}`}
                onClick={() => update('activity', opt.value)}
                className={`py-3 px-3 rounded-xl border text-left transition-all ${
                  form.activity === opt.value
                    ? 'bg-accent-blue/12 border-accent-blue text-white'
                    : 'border-white/10 text-text-muted hover:text-white hover:border-white/20'
                }`}
              >
                <p className="font-body text-sm font-medium">{opt.label}</p>
                <p className="font-body text-[11px] text-text-faint mt-0.5">{opt.sub}</p>
              </button>
            ))}
          </div>
        </Field>
      </Card>

      {/* ── Output stats ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {(calories || protein || bmi) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-3 mb-6"
          >
            <StatCard
              label="Daily Calories"
              value={calories?.toLocaleString()}
              unit="kcal"
              color="#3D6EFF"
            />
            <StatCard
              label="Daily Protein"
              value={protein}
              unit="g"
              color="#39FF14"
            />
            <StatCard
              label="BMI"
              value={bmi}
              sub={bmiLabel}
              color={bmiColor(bmiLabel)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Save button ──────────────────────────────────────────────────────── */}
      <motion.button
        id="profile-save"
        whileTap={{ scale: 0.97 }}
        onClick={handleSave}
        className={`w-full py-3.5 rounded-xl font-display font-bold text-sm transition-all flex items-center justify-center gap-2 ${
          saved
            ? 'bg-accent-green/15 border border-accent-green/40 text-accent-green'
            : 'bg-accent-blue text-white hover:bg-accent-blue/90 shadow-glow-blue/20'
        }`}
      >
        {saved ? (
          <>
            <Check size={16} />
            Saved
          </>
        ) : (
          <>
            <Zap size={16} />
            Save Profile
          </>
        )}
      </motion.button>

      {/* Formula note */}
      <p className="font-body text-[11px] text-text-faint text-center mt-4">
        Targets calculated with Mifflin-St Jeor BMR × activity multiplier.
      </p>
    </div>
  );
}
