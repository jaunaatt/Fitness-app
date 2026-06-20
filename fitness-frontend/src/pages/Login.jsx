import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const navigate  = useNavigate();
  const { login } = useAuth();

  const [form,    setForm]    = useState({ username: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(form.username.trim(), form.password);

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
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-accent-blue/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-accent-ember/8 blur-[120px]" />
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
          <p className="font-body text-sm text-text-muted mt-1">Welcome back. Keep forging.</p>
        </div>

        {/* Card */}
        <div className="bg-bg-card border border-white/[0.07] rounded-2xl p-7 shadow-xl">
          <h2 className="font-display font-bold text-lg text-white mb-6">Sign In</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {/* Username */}
            <div>
              <label
                htmlFor="login-username"
                className="block font-body text-xs text-text-muted uppercase tracking-widest mb-1.5"
              >
                Username
              </label>
              <input
                id="login-username"
                type="text"
                autoComplete="username"
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                className="ff-input"
                placeholder="your_username"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="block font-body text-xs text-text-muted uppercase tracking-widest mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="ff-input pr-11"
                  placeholder="••••••••"
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
              id="login-submit"
              type="submit"
              disabled={loading || !form.username || !form.password}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3.5 mt-1 rounded-xl bg-accent-blue text-white font-display font-bold text-sm hover:bg-accent-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-glow-blue/20"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>
        </div>

        {/* Register link */}
        <p className="font-body text-sm text-text-muted text-center mt-5">
          New here?{' '}
          <Link
            to="/register"
            id="login-register-link"
            className="text-accent-blue hover:text-accent-blue/80 font-medium transition-colors"
          >
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
