import { useState, useEffect, useCallback } from 'react';
import api from './api';

// Security settings
const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 30; // lockout after too many failures

export default function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Countdown timer for lockout
  useEffect(() => {
    if (lockoutUntil) {
      const timer = setInterval(() => {
        const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
        if (remaining <= 0) {
          setLockoutUntil(null);
          setTimeLeft(0);
          setAttempts(0); // Reset attempts after lockout
          setError('');
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockoutUntil]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');

    // Block if still locked
    if (lockoutUntil && Date.now() < lockoutUntil) {
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.post('/login', form);
      setAttempts(0);
      localStorage.setItem('token', res.data.token);
      onLogin(res.data.user);
    } catch (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        const unlockTime = Date.now() + LOCKOUT_SECONDS * 1000;
        setLockoutUntil(unlockTime);
        setTimeLeft(LOCKOUT_SECONDS);
        setError(`Too many failed attempts. Please wait ${LOCKOUT_SECONDS} seconds before trying again.`);
      } else {
        setError(`Invalid email or password. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [form, attempts, lockoutUntil, onLogin]);

  const isLocked = lockoutUntil && Date.now() < lockoutUntil;

  return (
    <div>
      <h1 className="auth-title">Welcome back</h1>
      <p className="auth-sub">Sign in to reserve a table or place an order.</p>

      {error && (
        <div className={`alert ${isLocked ? 'alert-warn' : 'alert-error'}`} role="alert">
          {error}
          {isLocked && <strong style={{ display: 'block', fontSize: 18, marginTop: 4 }}>{timeLeft}s</strong>}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label className="label" htmlFor="email">Email address</label>
          <input
            id="email"
            className="input"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            placeholder="you@email.com"
            disabled={isLocked || isSubmitting}
            autoComplete="email"
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            className="input"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            placeholder="Enter your password"
            disabled={isLocked || isSubmitting}
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={isLocked || isSubmitting}>
          {isSubmitting ? 'Signing in…' : isLocked ? `Try again in ${timeLeft}s` : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
