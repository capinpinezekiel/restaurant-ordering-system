import ReservationPage from './ReservationPage';
import { useState, useEffect } from 'react';
import LoginPage from './LoginPage';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  if (!user) return <LoginPage onLogin={setUser} />;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Restaurant Ordering System</h1>
        <div>
          Logged in as: <strong>{user.name}</strong> ({user.role})
          <button onClick={handleLogout} style={{ marginLeft: '15px', padding: '6px 12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
        </div>
      </div>
      
          <div style={{ padding: '20px', background: '#3772ae', borderRadius: '8px' }}>
        {user.role === 'customer' && <ReservationPage user={user} />}
        {user.role === 'waitstaff' && <h2>Waitstaff Dashboard — Order Entry & Table Status</h2>}
        {user.role === 'kitchen' && <h2>Kitchen Display — Active Orders</h2>}
        {user.role === 'admin' && <h2>Admin Panel — Menu, Users & Reports</h2>}
      </div>
    </div>
  );
}

export default App;