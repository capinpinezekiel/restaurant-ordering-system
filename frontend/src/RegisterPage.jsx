import { useState } from 'react';
import api from './api';

export default function RegisterPage({ onRegister }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/register', form);
      localStorage.setItem('token', res.data.token);
      onRegister(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
      <h2 style={{ textAlign: 'center', color: '#1a202c', marginBottom: '24px' }}>Create Account</h2>
      
      {error && <p style={{ color: '#dc2626', textAlign: 'center', marginBottom: '16px' }}>{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: 500, color: '#2d3748', marginBottom: '6px' }}>Full Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({...form, name: e.target.value})}
            required
            style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '15px' }}
          />
        </div>
        
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
            background: '#2563eb', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Register
        </button>
      </form>
    </div>
  );
}