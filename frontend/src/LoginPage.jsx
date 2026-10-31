import { useState } from 'react';
import api from './api';

export default function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/login', form);
      localStorage.setItem('token', res.data.token);
      onLogin(res.data.user);
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div style={{ 
      maxWidth: '420px', 
      margin: '60px auto', 
      padding: '32px', 
      background: 'white', 
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ textAlign: 'center', color: '#1a202c', marginBottom: '24px' }}>Login</h2>
      
      {error && <p style={{ color: '#dc2626', textAlign: 'center', marginBottom: '16px' }}>{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: 500, color: '#2d3748', marginBottom: '6px' }}>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({...form, email: e.target.value})}
            required
            style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '15px' }}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 500, color: '#2d3748', marginBottom: '6px' }}>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({...form, password: e.target.value})}
            required
            style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '15px' }}
          />
        </div>
        
        <button
          type="submit"
          style={{ 
            width: '100%', 
            padding: '12px', 
            background: '#16a34a', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
}