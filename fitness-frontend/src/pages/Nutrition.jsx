import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Cell,
} from 'recharts';
import { Apple, Plus, Trash2, Pencil } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import Sheet from '../components/Sheet.jsx';
import { Card, EmptyState, SectionHeader, Toast } from '../components/Primitives.jsx';

// Demo history for chart when backend is not available
const DEMO_HISTORY = [
  { day: 'Mon', calories: 1980 },
  { day: 'Tue', calories: 2100 },
  { day: 'Wed', calories: 1750 },
  { day: 'Thu', calories: 2250 },
  { day: 'Fri', calories: 1900 },
  { day: 'Sat', calories: 2400 },
  { day: 'Sun', calories: 1840 },
];

const FOOD_SUGGESTIONS = [
  'Chicken Breast', 'Brown Rice', 'Broccoli', 'Greek Yogurt', 'Eggs',
  'Oats', 'Salmon', 'Sweet Potato', 'Banana', 'Almonds', 'Tuna',
  'Cottage Cheese', 'Protein Shake', 'Black Beans', 'Avocado',
];

// ─── ProgressBar ──────────────────────────────────────────────────────────────
function ProgressBar({ label, value, max, color, unit, className = '' }) {
  const pct   = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const isOver = value > max && max > 0;

  return (
    <div className={className}>
      <div className="flex justify-between items-baseline mb-2">
        <span className="font-body text-xs text-text-muted uppercase tracking-widest">{label}</span>
        <span className="font-mono text-sm text-white">
          <span className={isOver ? 'text-accent-ember' : ''}>{Math.round(value).toLocaleString()}</span>
          <span className="text-text-faint">
            {' '}/ {max.toLocaleString()} {unit}
          </span>
        </span>
      </div>

      <div className="h-3 w-full bg-white/[0.05] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: isOver ? '#FF6B1A' : color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </div>

      {isOver && (
        <p className="font-body text-[11px] text-accent-ember mt-1">
          Over target by {Math.round(value - max).toLocaleString()} {unit}
        </p>
      )}
    </div>
  );
}

// ─── FoodEntry ────────────────────────────────────────────────────────────────
function FoodEntry({ entry, onEdit, onDelete, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12, height: 0 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 26 }}
      className="flex items-center justify-between py-3 border-b border-white/[0.05] last:border-0 group"
    >
      <div>
        <p className="font-body text-sm text-white">{entry.name}</p>
        <p className="font-mono text-[11px] text-text-muted mt-0.5">
          {(entry.calories ?? 0).toLocaleString()} kcal · {(entry.proteinGram ?? entry.protein ?? 0)}g protein
        </p>
      </div>
      <div className="flex items-center gap-1">
        {onEdit && (
          <button
            onClick={() => onEdit(entry)}
            aria-label="Edit food entry"
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-text-dim hover:text-accent-blue hover:bg-accent-blue/10 transition-all"
          >
            <Pencil size={14} />
          </button>
        )}
        {onDelete && (
        <button
          onClick={() => onDelete(entry)}
          aria-label="Remove food entry"
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-text-dim hover:text-accent-ember hover:bg-accent-ember/10 transition-all"
        >
          <Trash2 size={14} />
        </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Custom tooltip for chart ─────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-elevated border border-white/10 rounded-lg px-3 py-2">
      <p className="font-body text-xs text-text-muted mb-0.5">{label}</p>
      <p className="font-mono text-sm text-white">{payload[0].value.toLocaleString()} kcal</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Nutrition() {
  const { state, addFood, removeFood, editFood } = useApp();
  const [tab,   setTab]    = useState('today');
  const [open,  setOpen]   = useState(false);
  const [toast, setToast]  = useState(false);
  const [toastMsg, setToastMsg] = useState('Food logged ✓');
  const [editingId, setEditingId] = useState(null);
  const [form,  setForm]   = useState({ name: '', calories: '', protein: '' });
  const [suggestion, setSuggestion] = useState(null);

  const consumedCalories = state.dailyLog.food.reduce((s, f) => s + (f.calories ?? 0), 0);
  const consumedProtein  = state.dailyLog.food.reduce((s, f) => s + (f.proteinGram ?? f.protein ?? 0), 0);
  const targetCalories   = state.nutritionTargets.calories;
  const targetProtein    = state.nutritionTargets.protein;

  const filteredSuggestions = form.name.length > 1
    ? FOOD_SUGGESTIONS.filter((s) =>
        s.toLowerCase().startsWith(form.name.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleEditClick = (f) => {
    setForm({ name: f.name, calories: f.calories ?? '', protein: f.proteinGram ?? f.protein ?? '' });
    setEditingId(f.id);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.calories) return;
    if (editingId) {
      await editFood(editingId, {
        name:       form.name,
        calories:   +form.calories,
        proteinGram:+form.protein || 0,
      });
      setToastMsg('Food updated ✓');
    } else {
      await addFood({
        name:       form.name,
        calories:   +form.calories,
        proteinGram:+form.protein || 0,
      });
      setToastMsg('Food logged ✓');
    }
    setForm({ name: '', calories: '', protein: '' });
    setEditingId(null);
    setOpen(false);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  return (
    <div className="px-5 py-6 md:px-8 md:py-8 max-w-3xl mx-auto pb-28 md:pb-10">
      <Toast message={toastMsg} visible={toast} />

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-extrabold text-2xl md:text-3xl text-white">
            Nutrition Log
          </h1>
          <p className="font-body text-sm text-text-muted mt-0.5">
            Track your calories and protein daily.
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => { setForm({ name: '', calories: '', protein: '' }); setEditingId(null); setOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-blue text-white font-body text-sm font-medium hover:bg-accent-blue/90 transition-colors shadow-glow-blue/30"
        >
          <Plus size={16} />
          Add Food
        </motion.button>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-6 bg-bg-card rounded-xl p-1 w-fit border border-white/[0.05]">
        {['today', 'history'].map((t) => (
          <button
            key={t}
            id={`nutrition-tab-${t}`}
            onClick={() => setTab(t)}
            className={`px-5 py-1.5 rounded-lg font-body text-sm capitalize transition-all ${
              tab === t
                ? 'bg-accent-blue text-white shadow-glow-blue/20'
                : 'text-text-muted hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'today' ? (
        <>
          {/* Progress bars */}
          <Card className="mb-5">
            <ProgressBar
              label="Calories"
              value={consumedCalories}
              max={targetCalories}
              color="#3D6EFF"
              unit="kcal"
            />
            <ProgressBar
              label="Protein"
              value={consumedProtein}
              max={targetProtein}
              color="#39FF14"
              unit="g"
              className="mt-5"
            />
          </Card>

          {/* Food log entries */}
          <Card>
            <SectionHeader title="Today's Entries" />
            {state.dailyLog.food.length === 0 ? (
              <EmptyState
                icon={Apple}
                title="Nothing logged today"
                hint="First rep is the hardest."
              />
            ) : (
              <AnimatePresence>
                {state.dailyLog.food.map((f, i) => (
                  <FoodEntry key={i} entry={f} index={i} onEdit={handleEditClick} onDelete={() => removeFood(f.id)} />
                ))}
              </AnimatePresence>
            )}
          </Card>
        </>
      ) : (
        /* History chart */
        <Card>
          <SectionHeader title="Calories — Last 7 Days" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={DEMO_HISTORY} barCategoryGap="35%">
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="day"
                stroke="#6B6B73"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                fontFamily="Inter"
              />
              <YAxis
                stroke="#6B6B73"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                fontFamily="JetBrains Mono"
                tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="calories" radius={[5, 5, 0, 0]}>
                {DEMO_HISTORY.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={entry.calories > targetCalories ? '#FF6B1A' : '#3D6EFF'}
                    opacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="font-body text-[11px] text-text-faint text-center mt-2">
            Bars above target shown in orange
          </p>
        </Card>
      )}

      {/* ── Add Food Sheet ────────────────────────────────────────────────────── */}
      <Sheet open={open} onClose={() => { setOpen(false); setSuggestion(null); setEditingId(null); }} title={editingId ? "Edit Food" : "Log Food"}>
        <div className="flex flex-col gap-3">
          {/* Name field with autocomplete */}
          <div className="relative">
            <label className="block font-body text-xs text-text-muted uppercase tracking-widest mb-1.5">
              Food Name
            </label>
            <input
              id="nutrition-food-name"
              placeholder="e.g. Chicken Breast"
              value={form.name}
              onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setSuggestion(null); }}
              className="ff-input"
              autoComplete="off"
            />
            {/* Autocomplete dropdown */}
            <AnimatePresence>
              {filteredSuggestions.length > 0 && (
                <motion.ul
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute z-10 top-full left-0 right-0 mt-1 bg-bg-elevated border border-white/10 rounded-xl overflow-hidden shadow-xl"
                >
                  {filteredSuggestions.map((s) => (
                    <li key={s}>
                      <button
                        className="w-full text-left px-4 py-2.5 font-body text-sm text-white hover:bg-white/[0.05] transition-colors"
                        onClick={() => { setForm((f) => ({ ...f, name: s })); setSuggestion(s); }}
                      >
                        {s}
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* Calories */}
          <div>
            <label className="block font-body text-xs text-text-muted uppercase tracking-widest mb-1.5">
              Calories (kcal)
            </label>
            <input
              id="nutrition-calories"
              type="number"
              placeholder="0"
              value={form.calories}
              onChange={(e) => setForm((f) => ({ ...f, calories: e.target.value }))}
              className="ff-input ff-input-mono"
              min="0"
            />
          </div>

          {/* Protein */}
          <div>
            <label className="block font-body text-xs text-text-muted uppercase tracking-widest mb-1.5">
              Protein (g)
            </label>
            <input
              id="nutrition-protein"
              type="number"
              placeholder="0"
              value={form.protein}
              onChange={(e) => setForm((f) => ({ ...f, protein: e.target.value }))}
              className="ff-input ff-input-mono"
              min="0"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={!form.name || !form.calories}
            className="mt-2 w-full py-3.5 rounded-xl bg-accent-blue text-white font-display font-bold text-sm hover:bg-accent-blue/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-glow-blue/20"
          >
            {editingId ? "Save Changes" : "Add to Log"}
          </motion.button>
        </div>
      </Sheet>
    </div>
  );
}
