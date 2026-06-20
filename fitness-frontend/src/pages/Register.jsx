import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Eye, EyeOff, AlertCircle, Loader2, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

// Simple password strength helper
function passwordStrength(pw) {
  if (!pw) return { level: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8)   score++;
  if (pw.length >= 12)  score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { level: score, label: 'Weak',   color: '#FF3D3D' };
  if (score <= 3) return { level: score, label: 'Fair',   color: '#FF6B1A' };
  if (score <= 4) return { level: score, label: 'Good',   color: '#FFD23D' };
  return              { level: score, label: 'Strong', color: '#39FF14' };
}

export default function Register() {
  const navigate    = useNavigate();
  const { register } = useAuth();

  const [form,    setForm]    = useState({ username: '', password: '', confirm: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  const strength = passwordStrength(form.password);
  const passwordsMatch = form.password && form.confirm && form.password === form.confirm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    const result = await register(form.username.trim(), form.password);
    setLoading(false);

    if (result.ok) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-bg-deep flex items-center justify-center px-4">
      {/* Background ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-accent-blue/10 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent-green/8 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative w-full max-w-sm"
      >
        {/* Logo / brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-accent-blue/15 border border-accent-blue/30 flex items-center justify-center mb-4 shadow-glow-blue/20">
            <Dumbbell size={26} className="text-accent-blue" />
          </div>
          <h1 className="font-display font-extrabold text-2xl text-white">ForgeFit</h1>
          <p className="font-body text-sm text-text-muted mt-1">Your transformation starts here.</p>
        </div>

        {/* Card */}
        <div className="bg-bg-card border border-white/[0.07] rounded-2xl p-7 shadow-xl">
          <h2 className="font-display font-bold text-lg text-white mb-6">Create Account</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {/* Username */}
            <div>
              <label
                htmlFor="register-username"
                className="block font-body text-xs text-text-muted uppercase tracking-widest mb-1.5"
              >
                Username
              </label>
              <input
                id="register-username"
                type="text"
                autoComplete="username"
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                className="ff-input"
                placeholder="choose_a_name"
                minLength={3}
                maxLength={30}
                required
              />
              <p className="font-body text-[11px] text-text-faint mt-1">3–30 characters</p>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="register-password"
                className="block font-body text-xs text-text-muted uppercase tracking-widest mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="ff-input pr-11"
                  placeholder="min. 8 characters"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Strength meter */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="flex-1 h-1 rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: i <= strength.level ? strength.color : 'rgba(255,255,255,0.08)',
                        }}
                      />
                    ))}
                  </div>
                  <p className="font-body text-[11px]" style={{ color: strength.color }}>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label
                htmlFor="register-confirm"
                className="block font-body text-xs text-text-muted uppercase tracking-widest mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="register-confirm"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.confirm}
                  onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                  className="ff-input pr-11"
                  placeholder="repeat password"
                  required
                />
                {passwordsMatch && (
                  <Check size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-accent-green" />
                )}
              </div>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400"
                >
                  <AlertCircle size={14} className="shrink-0" />
                  <p className="font-body text-xs">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              id="register-submit"
              type="submit"
              disabled={loading || !form.username || !form.password || !form.confirm}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3.5 mt-1 rounded-xl bg-accent-blue text-white font-display font-bold text-sm hover:bg-accent-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-glow-blue/20"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating account…
                </>
              ) : (
                'Create Account'
              )}
            </motion.button>
          </form>
        </div>

        {/* Login link */}
        <p className="font-body text-sm text-text-muted text-center mt-5">
          Already have an account?{' '}
          <Link
            to="/login"
            id="register-login-link"
            className="text-accent-blue hover:text-accent-blue/80 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
