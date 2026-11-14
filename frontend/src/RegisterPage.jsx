import { useState } from 'react';
import api from './api';
import { colors } from './theme';

// Password Strength Checker
const getPasswordStrength = (password) => {
  if (!password) return { level: 0, text: '', color: colors.neutral };
  
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { level: 1, text: 'Weak', color: colors.danger, percent: 33 };
  if (score <= 4) return { level: 2, text: 'Medium', color: colors.warning, percent: 66 };
  return { level: 3, text: 'Strong', color: colors.success, percent: 100 };
};

export default function RegisterPage({ onRegister }) {
  const [form, setForm] = useState({
    last_name: '',
    first_name: '',
    suffix: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(form.password);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/register', form);
      localStorage.setItem('token', res.data.token);
      onRegister(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="auth-title">Create an account</h1>
      <p className="auth-sub">Join us to reserve a table and order.</p>

      {error && <div className="alert alert-error" role="alert">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="grid-2-1 field">
          <div>
            <label className="label" htmlFor="first_name">First name *</label>
            <input id="first_name" className="input" type="text" name="first_name" value={form.first_name}
              onChange={handleChange} required placeholder="Juan" autoComplete="given-name" />
          </div>
          <div>
            <label className="label" htmlFor="suffix">Suffix</label>
            <input id="suffix" className="input" type="text" name="suffix" value={form.suffix}
              onChange={handleChange} placeholder="Jr./Sr." />
          </div>
        </div>

        <div className="field">
          <label className="label" htmlFor="last_name">Last name *</label>
          <input id="last_name" className="input" type="text" name="last_name" value={form.last_name}
            onChange={handleChange} required placeholder="Dela Cruz" autoComplete="family-name" />
        </div>

        <div className="field">
          <label className="label" htmlFor="reg_email">Email address *</label>
          <input id="reg_email" className="input" type="email" name="email" value={form.email}
            onChange={handleChange} required placeholder="juandelacruz@email.com" autoComplete="email" />
        </div>

        <div className="field">
          <label className="label" htmlFor="reg_password">Password *</label>
          <input id="reg_password" className="input" type="password" name="password" value={form.password}
            onChange={handleChange} required placeholder="At least 6 characters" autoComplete="new-password" />

          {form.password && (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                <span style={{ color: colors.textSecondary }}>Password strength</span>
                <span style={{ fontWeight: 700, color: strength.color }}>{strength.text}</span>
              </div>
              <div style={{ height: 6, background: '#EAE3D3', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${strength.percent}%`,
                  background: strength.color,
                  borderRadius: 3,
                  transition: 'width 0.3s ease',
                }} />
              </div>
              <p className="hint">Use uppercase letters, numbers and symbols for a stronger password.</p>
            </div>
          )}
        </div>

        <div className="field" style={{ marginBottom: 24 }}>
          <label className="label" htmlFor="password_confirmation">Confirm password *</label>
          <input id="password_confirmation" className="input" type="password" name="password_confirmation"
            value={form.password_confirmation} onChange={handleChange} required
            placeholder="Repeat password" autoComplete="new-password" />
        </div>

        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </div>
  );
}
