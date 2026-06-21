import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Check, Zap, Target, Dumbbell, Lock, Trash2, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
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

// ── Stepper component ──────────────────────────────────────────────────────────
function Stepper({ value, onChange, min = 1, max = 7 }) {
  return (
    <div className="flex items-center bg-bg-deep border border-white/10 rounded-xl overflow-hidden w-36">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-10 h-10 flex items-center justify-center text-text-muted hover:text-white hover:bg-white/[0.05] transition-colors text-lg"
      >
        −
      </button>
      <span className="flex-1 text-center font-mono font-bold text-white">{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-10 h-10 flex items-center justify-center text-text-muted hover:text-white hover:bg-white/[0.05] transition-colors text-lg"
      >
        +
      </button>
    </div>
  );
}

// ── SectionTitle component ─────────────────────────────────────────────────────
function SectionTitle({ icon: Icon, label, color = 'text-accent-blue' }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={16} className={color} />
      <span className={`font-display font-bold text-sm uppercase tracking-widest ${color}`}>{label}</span>
    </div>
  );
}

export default function Profile() {
  const { state, saveProfile, saveNutritionTarget, saveWorkoutTarget } = useApp();
  const { user, logout } = useAuth();

  // ── Physical profile form ─────────────────────────────────────────────────
  const [form,  setForm]  = useState(state.userProfile);
  const [saved, setSaved] = useState(false);
  const [profileToast, setProfileToast] = useState(false);

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
    setProfileToast(true);
    setTimeout(() => setProfileToast(false), 2500);
  };

  // ── Nutrition targets ─────────────────────────────────────────────────────
  const [useManual, setUseManual]     = useState(state.useManualTarget);
  const [manualCal, setManualCal]     = useState(state.nutritionTargets.calories);
  const [manualProt, setManualProt]   = useState(state.nutritionTargets.protein);
  const [targetToast, setTargetToast] = useState(false);

  const handleSaveTargets = async () => {
    await saveNutritionTarget(Number(manualCal), Number(manualProt));
    setTargetToast(true);
    setTimeout(() => setTargetToast(false), 2500);
  };

  // ── Weekly workout target ─────────────────────────────────────────────────
  const [weeklyTarget, setWeeklyTarget]   = useState(state.weeklyWorkoutTarget);
  const [workoutToast, setWorkoutToast]   = useState(false);

  useEffect(() => {
    setWeeklyTarget(state.weeklyWorkoutTarget);
  }, [state.weeklyWorkoutTarget]);

  const handleSaveWorkout = async () => {
    await saveWorkoutTarget(weeklyTarget);
    setWorkoutToast(true);
    setTimeout(() => setWorkoutToast(false), 2500);
  };

  // ── Change password ───────────────────────────────────────────────────────
  const [pwForm, setPwForm]           = useState({ current: '', newPw: '', confirm: '' });
  const [pwVisible, setPwVisible]     = useState(false);
  const [pwError, setPwError]         = useState('');
  const [pwSuccess, setPwSuccess]     = useState(false);
  const [pwLoading, setPwLoading]     = useState(false);

  const handleChangePassword = async () => {
    setPwError('');
    if (pwForm.newPw.length < 8) {
      setPwError('New password must be at least 8 characters.');
      return;
    }
    if (pwForm.newPw !== pwForm.confirm) {
      setPwError('Passwords do not match.');
      return;
    }
    setPwLoading(true);
    try {
      await api.changePassword(user.id, pwForm.current, pwForm.newPw);
      setPwSuccess(true);
      setPwForm({ current: '', newPw: '', confirm: '' });
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Failed to change password.';
      setPwError(msg);
    } finally {
      setPwLoading(false);
    }
  };

  // ── Delete account ────────────────────────────────────────────────────────
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteAccount = async () => {
    if (!deleteConfirm) { setDeleteConfirm(true); return; }
    setDeleteLoading(true);
    try {
      await api.deleteAccount(user.id);
      logout();
    } catch (err) {
      setDeleteLoading(false);
      setDeleteConfirm(false);
    }
  };

  const calories  = state.nutritionTargets.calories;
  const protein   = state.nutritionTargets.protein;
  const bmi       = state.bmi;
  const bmiLabel  = state.bmiLabel;

  return (
    <div className="px-5 py-6 md:px-8 md:py-8 max-w-3xl mx-auto pb-28 md:pb-10">
      <Toast message="Profile saved ✓" visible={profileToast} />
      <Toast message="Targets saved ✓" visible={targetToast} />
      <Toast message="Workout target saved ✓" visible={workoutToast} />

      {/* Page header */}
      <div className="flex items-center gap-3 mb-7">
        <div className="w-10 h-10 rounded-xl bg-accent-blue/15 border border-accent-blue/30 flex items-center justify-center">
          <User size={20} className="text-accent-blue" />
        </div>
        <div>
          <h1 className="font-display font-extrabold text-2xl md:text-3xl text-white leading-none">
            Profile & Settings
          </h1>
          <p className="font-body text-sm text-text-muted mt-0.5">
            Manage your body stats, targets, and account.
          </p>
        </div>
      </div>

      {/* ── Section 1: Physical Profile ─────────────────────────────────────────── */}
      <Card className="mb-6">
        <SectionTitle icon={User} label="Physical Profile" />
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

        {/* Leaderboard visibility */}
        <Field label="Privacy" className="mt-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={form.leaderboardVisible ?? true}
                onChange={(e) => update('leaderboardVisible', e.target.checked)}
              />
              <div className="w-10 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/20 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-blue transition-colors"></div>
            </div>
            <span className="font-body text-sm text-text-muted select-none">
              Show my points on the public leaderboard
            </span>
          </label>
        </Field>

        {/* Save profile button */}
        <motion.button
          id="profile-save"
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          className={`mt-5 w-full py-3.5 rounded-xl font-display font-bold text-sm transition-all flex items-center justify-center gap-2 ${
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

      {/* ── Section 2: Nutrition Targets ──────────────────────────────────────── */}
      <Card className="mb-6">
        <SectionTitle icon={Target} label="Nutrition Targets" color="text-accent-green" />

        {/* Toggle: Auto vs Manual */}
        <div className="flex gap-2 mb-4">
          <button
            id="target-mode-auto"
            onClick={() => setUseManual(false)}
            className={`flex-1 py-2.5 rounded-xl font-body text-sm border transition-all ${
              !useManual
                ? 'bg-accent-green/15 border-accent-green text-white'
                : 'border-white/10 text-text-muted hover:text-white'
            }`}
          >
            Auto (Mifflin-St Jeor)
          </button>
          <button
            id="target-mode-manual"
            onClick={() => setUseManual(true)}
            className={`flex-1 py-2.5 rounded-xl font-body text-sm border transition-all ${
              useManual
                ? 'bg-accent-green/15 border-accent-green text-white'
                : 'border-white/10 text-text-muted hover:text-white'
            }`}
          >
            Manual Override
          </button>
        </div>

        <AnimatePresence>
          {useManual && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Field label="Calorie Target (kcal)">
                  <input
                    id="target-calories"
                    type="number"
                    value={manualCal}
                    onChange={(e) => setManualCal(e.target.value)}
                    className="ff-input ff-input-mono"
                    min="500"
                    max="10000"
                  />
                </Field>
                <Field label="Protein Target (g)">
                  <input
                    id="target-protein"
                    type="number"
                    value={manualProt}
                    onChange={(e) => setManualProt(e.target.value)}
                    className="ff-input ff-input-mono"
                    min="10"
                    max="500"
                  />
                </Field>
              </div>
              <motion.button
                id="target-save"
                whileTap={{ scale: 0.97 }}
                onClick={handleSaveTargets}
                className="w-full py-3 rounded-xl bg-accent-green/15 border border-accent-green/40 text-accent-green font-display font-bold text-sm hover:bg-accent-green/20 transition-colors"
              >
                <Check size={14} className="inline mr-2" />
                Save Targets
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {!useManual && (
          <p className="font-body text-xs text-text-faint">
            Targets are calculated automatically using Mifflin-St Jeor BMR × activity multiplier. Fill in your physical profile above to enable this.
          </p>
        )}
      </Card>

      {/* ── Section 3: Weekly Workout Target ──────────────────────────────────── */}
      <Card className="mb-6">
        <SectionTitle icon={Dumbbell} label="Weekly Workout Goal" color="text-accent-blue" />
        <div className="flex items-center justify-between">
          <div>
            <p className="font-body text-sm text-white">
              Target days per week
            </p>
            <p className="font-body text-xs text-text-muted mt-0.5">
              Currently: {weeklyTarget} day{weeklyTarget !== 1 ? 's' : ''}/week
            </p>
          </div>
          <Stepper value={weeklyTarget} onChange={setWeeklyTarget} />
        </div>
        <motion.button
          id="workout-target-save"
          whileTap={{ scale: 0.97 }}
          onClick={handleSaveWorkout}
          className="mt-4 w-full py-3 rounded-xl bg-accent-blue/10 border border-accent-blue/30 text-accent-blue font-display font-bold text-sm hover:bg-accent-blue/15 transition-colors"
        >
          Save Workout Target
        </motion.button>
      </Card>

      {/* ── Section 4: Change Password ─────────────────────────────────────────── */}
      <Card className="mb-6">
        <SectionTitle icon={Lock} label="Security" color="text-text-muted" />

        <div className="flex flex-col gap-3">
          <Field label="Current Password">
            <div className="relative">
              <input
                id="pw-current"
                type={pwVisible ? 'text' : 'password'}
                value={pwForm.current}
                onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))}
                className="ff-input pr-10"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setPwVisible((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-faint hover:text-white transition-colors"
              >
                {pwVisible ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Field>

          <Field label="New Password">
            <input
              id="pw-new"
              type={pwVisible ? 'text' : 'password'}
              value={pwForm.newPw}
              onChange={(e) => setPwForm((f) => ({ ...f, newPw: e.target.value }))}
              className="ff-input"
              placeholder="Min 8 characters"
              autoComplete="new-password"
            />
          </Field>

          <Field label="Confirm New Password">
            <input
              id="pw-confirm"
              type={pwVisible ? 'text' : 'password'}
              value={pwForm.confirm}
              onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
              className="ff-input"
              placeholder="Repeat new password"
              autoComplete="new-password"
            />
          </Field>

          <AnimatePresence>
            {pwError && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-body text-sm text-red-400"
              >
                {pwError}
              </motion.p>
            )}
            {pwSuccess && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-body text-sm text-accent-green"
              >
                ✓ Password changed successfully.
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            id="pw-save"
            whileTap={{ scale: 0.97 }}
            onClick={handleChangePassword}
            disabled={pwLoading || !pwForm.current || !pwForm.newPw || !pwForm.confirm}
            className="w-full py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white font-display font-bold text-sm hover:bg-white/[0.09] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {pwLoading ? 'Changing…' : 'Change Password'}
          </motion.button>
        </div>
      </Card>

      {/* ── Danger Zone ───────────────────────────────────────────────────────── */}
      <div className="border border-red-500/20 rounded-2xl p-5 bg-red-500/[0.04]">
        <p className="font-display font-bold text-sm text-red-400 mb-1 uppercase tracking-widest">Danger Zone</p>
        <p className="font-body text-xs text-text-muted mb-4">
          Deleting your account is permanent and cannot be undone. All your data will be lost.
        </p>
        {deleteConfirm ? (
          <div className="flex gap-2">
            <button
              id="delete-confirm-yes"
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
              className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-display font-bold text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {deleteLoading ? 'Deleting…' : 'Yes, delete my account'}
            </button>
            <button
              id="delete-confirm-no"
              onClick={() => setDeleteConfirm(false)}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-text-muted font-body text-sm hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            id="delete-account"
            onClick={handleDeleteAccount}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400 font-body text-sm hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={14} />
            Delete Account
          </button>
        )}
      </div>

      {/* Formula note */}
      <p className="font-body text-[11px] text-text-faint text-center mt-4">
        Targets calculated with Mifflin-St Jeor BMR × activity multiplier.
      </p>
    </div>
  );
}
