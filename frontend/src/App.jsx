import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import ReservationPage from './ReservationPage';
import OrderPage from './OrderPage';
import KitchenPage from './KitchenPage';
import BillingPage from './BillingPage';
import AdminPage from './AdminPage';
import api from './api';
import { RESTAURANT_NAME } from './theme';

// Serving cloche — the restaurant's mark
function BrandMark({ size = 30 }) {
  return (
    <svg className="brand-mark" width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="6.5" r="2" fill="currentColor" />
      <path d="M4 22a12 12 0 0 1 24 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M2.5 25.5h27" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const roleSubtitle = {
  admin: 'Admin dashboard',
  kitchen: 'Kitchen station',
  waitstaff: 'Service staff',
  customer: 'Guest',
};

function AppContent({ user, onLogout }) {
  const location = useLocation();

  // Role-based navigation links
  const navLinks = {
    customer: [
      { label: 'Reservations', path: '/reservations' },
      { label: 'Order Now', path: '/order' },
    ],
    waitstaff: [
      { label: 'Orders', path: '/order' },
      { label: 'Billing', path: '/billing' },
    ],
    kitchen: [
      { label: 'Kitchen Display', path: '/kitchen' },
    ],
    admin: [
      { label: 'Dashboard', path: '/admin' },
    ],
  };

  const links = navLinks[user.role] || [];

  return (
    <div>
      <header className="topbar">
        <div className="topbar-in">
          <div className="brand">
            <BrandMark />
            <div>
              <div className="brand-name">{RESTAURANT_NAME}</div>
              <div className="brand-sub">{roleSubtitle[user.role] || 'Guest'}</div>
            </div>
          </div>

          <div className="who">
            <div className="who-text">
              <div className="who-name">
                {user?.first_name} {user?.last_name}
                {user?.suffix ? ` ${user.suffix}` : ''}
              </div>
              <div className="who-role">{user.role}</div>
            </div>
            <button className="btn btn-on-dark btn-sm" onClick={onLogout}>Log out</button>
          </div>
        </div>

        {links.length > 1 && (
          <nav className="nav" aria-label="Main">
            {links.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={location.pathname === link.path ? 'active' : ''}
                aria-current={location.pathname === link.path ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main>
        <Routes>
          <Route path="/reservations" element={<ReservationPage user={user} />} />
          <Route path="/order" element={<OrderPage user={user} />} />
          <Route path="/kitchen" element={<KitchenPage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/admin" element={<AdminPage user={user} />} />
          <Route path="*" element={
            <Navigate to={
              user.role === 'customer' ? '/reservations' :
              user.role === 'kitchen' ? '/kitchen' :
              user.role === 'waitstaff' ? '/order' : '/admin'
            } replace />
          } />
        </Routes>
      </main>
    </div>
  );
}

function AuthPage({ children }) {
  return (
    <div className="auth">
      <aside className="auth-side">
        <div>
          <BrandMark size={36} />
          <div className="auth-rule" />
          <div className="auth-wordmark">{RESTAURANT_NAME}</div>
          <p className="auth-lede" style={{ marginTop: 16 }}>
            Reservations, ordering, kitchen and billing for the whole house.
          </p>
        </div>
        <ul className="auth-list">
          <li><span>Guests reserve and order</span></li>
          <li><span>Waitstaff take orders and bills</span></li>
          <li><span>The kitchen sees every ticket</span></li>
        </ul>
      </aside>
      <div className="auth-main">
        <div className="auth-form">{children}</div>
      </div>
    </div>
  );
}

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
    return (
      <div className="loading-screen">
        <div className="brand-name">{RESTAURANT_NAME}</div>
        <p>Loading…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={
            <AuthPage>
              <LoginPage onLogin={setUser} />
              <p className="auth-switch">
                New here? <Link to="/register">Create an account</Link>
              </p>
            </AuthPage>
          } />
          <Route path="/register" element={
            <AuthPage>
              <RegisterPage onRegister={setUser} />
              <p className="auth-switch">
                Already have an account? <Link to="/login">Sign in</Link>
              </p>
            </AuthPage>
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <AppContent user={user} onLogout={handleLogout} />
    </BrowserRouter>
  );
}

export default App;
