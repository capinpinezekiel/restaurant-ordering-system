import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import ReservationPage from './ReservationPage';
import OrderPage from './OrderPage';
import KitchenPage from './KitchenPage';
import BillingPage from './BillingPage';
import api from './api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/user');
          setUser(res.data);
        } catch (err) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }
if (!user) {
  return (
    <BrowserRouter>
      <div style={{ padding: '40px', maxWidth: '420px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '24px' }}>Restaurant Ordering System</h1>
        <Routes>
          <Route path="/login" element={
            <div>
              <LoginPage onLogin={setUser} />
              <p style={{ textAlign: 'center', marginTop: '20px' }}>
                Don't have an account? <a href="/register" style={{ color: '#2563eb' }}>Register here</a>
              </p>
            </div>
          } />
          <Route path="/register" element={
            <div>
              <RegisterPage onRegister={setUser} />
              <p style={{ textAlign: 'center', marginTop: '20px' }}>
                Already have an account? <a href="/login" style={{ color: '#2563eb' }}>Login here</a>
              </p>
            </div>
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
  return (
    <div style={{ 
      padding: '24px', 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#f5f7fa',
      minHeight: '100vh'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <h1 style={{ margin: 0, fontSize: '28px', color: '#1a202c' }}>Restaurant Ordering System</h1>
        <div style={{ fontSize: '15px', color: '#2d3748' }}>
          Logged in as: <strong>{user.name}</strong> ({user.role})
          <button 
            onClick={handleLogout} 
            style={{ 
              marginLeft: '16px', 
              padding: '8px 16px', 
              background: '#dc2626', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Logout
          </button>
        </div>
      </div>
      
      <div style={{ 
        padding: '24px', 
        background: 'white', 
        borderRadius: '12px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
      }}>
        {user.role === 'customer' && (
          <div>
            <ReservationPage user={user} />
            <hr style={{ margin: '40px 0', border: 'none', borderTop: '2px solid #e2e8f0' }} />
            <OrderPage user={user} />
          </div>
        )}
        {user.role === 'kitchen' && <KitchenPage />}
        {user.role === 'waitstaff' && (
          <div>
            <h2 style={{ color: '#1a202c', marginBottom: '20px' }}>Waitstaff — Orders & Payments</h2>
            <OrderPage user={user} />
            <hr style={{ margin: '40px 0', border: 'none', borderTop: '2px solid #e2e8f0' }} />
            <BillingPage />
          </div>
        )}
        {user.role === 'admin' && (
          <div>
            <h2 style={{ color: '#1a202c' }}>Admin Dashboard</h2>
            <p style={{ color: '#4a5568' }}>Full management panel — coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;