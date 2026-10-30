import { useState } from 'react';
import api from './api';

export default function LoginPage({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isRegister ? '/register' : '/login';
      const res = await api.post(url, form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onLogin(res.data.user);
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>{isRegister ? 'Register' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        {isRegister && (
          <div style={{ marginBottom: '10px' }}>
            <label>Name:</label>
            <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required style={{ width: '100%', padding: '8px', marginTop: '4px' }} />
          </div>
        )}
        <div style={{ marginBottom: '10px' }}>
          <label>Email:</label>
          <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required style={{ width: '100%', padding: '8px', marginTop: '4px' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Password:</label>
          <input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required style={{ width: '100%', padding: '8px', marginTop: '4px' }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {isRegister ? 'Register' : 'Login'}
        </button>
        <p style={{ marginTop: '15px', textAlign: 'center' }}>
          {isRegister ? 'Already have account?' : "Don't have account?"}{' '}
          <button type="button" onClick={() => setIsRegister(!isRegister)} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}>
            {isRegister ? 'Login here' : 'Register here'}
          </button>
        </p>
      </form>
    </div>
  );
}