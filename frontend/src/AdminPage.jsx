import { useEffect, useState } from 'react';
import api from './api';
import { colors } from './theme';

// ─── GLOBAL STYLES — Consistent across whole page ───

const cellStyle = {
  padding: '14px 16px',
  textAlign: 'left',
  borderBottom: `1px solid ${colors.border}`,
  fontSize: '14px',
};

const inputStyle = {
  display: 'block',
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px 14px',
  marginTop: '6px',
  border: `1px solid ${colors.border}`,
  borderRadius: '6px',
  fontSize: '14px',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  outline: 'none',
};

const buttonBase = {
  padding: '10px 18px',
  border: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'opacity 0.2s, transform 0.1s',
};

const cardStyle = {
  background: colors.cardBg,
  borderRadius: '10px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
  border: `1px solid ${colors.border}`,
  padding: '24px',
  marginBottom: '24px',
};

export default function AdminPage({ user }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalOrders: 0, totalRevenue: 0, activeTables: 0, totalUsers: 0,
  });

  const [users, setUsers] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');

  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'customer' });

  const [addingMenuItem, setAddingMenuItem] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [menuForm, setMenuForm] = useState({
    name: '', category: '', description: '', price: '', is_available: true,
  });

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [oRes, uRes, mRes, tRes] = await Promise.all([
        api.get('/orders'), api.get('/users'), api.get('/menu'), api.get('/tables'),
      ]);
      const orders = Array.isArray(oRes.data) ? oRes.data : [];
      const userList = Array.isArray(uRes.data) ? uRes.data : [];
      const menuList = Array.isArray(mRes.data) ? mRes.data : [];
      const tableList = Array.isArray(tRes.data) ? tRes.data : [];

      setStats({
        totalOrders: orders.length,
        totalRevenue: orders.reduce((s, o) => s + Number(o.total_amount || 0), 0),
        activeTables: tableList.filter(t => t.status !== 'free').length,
        totalUsers: userList.length,
      });
      setUsers(userList);
      setMenuItems(menuList);
      setTables(tableList);
    } catch (err) {
      showMessage('Failed to load data. Check API server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'info') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3500);
  };

  // ─── USER MANAGEMENT ───
  const startEditUser = (u) => {
    setEditingUser(u.id);
    setUserForm({ name: u.name || '', email: u.email || '', role: u.role || 'customer' });
  };
 const saveUser = async (id) => {
  try {
    await api.patch(`/users/${id}`, userForm);
    setUsers(list => list.map(i => i.id === id ? { ...i, ...userForm } : i));
    setEditingUser(null);
    showMessage('User updated successfully', 'success');
  } catch (err) {
    showMessage('Failed to update: ' + (err.response?.data?.message || 'Error'), 'error');
  }
};
  const deleteUser = async (id) => {
  if (!window.confirm('Delete this user? This cannot be undone.')) return;
  try {
    // DELETE from database first
    await api.delete(`/users/${id}`);
    // Then remove from frontend list
    setUsers(list => list.filter(i => i.id !== id));
    showMessage('User removed successfully', 'success');
  } catch (err) {
    showMessage('Failed to delete user: ' + (err.response?.data?.message || 'Server error'), 'error');
  }
};

  // ─── MENU MANAGEMENT ───
  const startAddMenuItem = () => {
    setAddingMenuItem(true);
    setEditingMenuItem(null);
    setMenuForm({ name: '', category: '', description: '', price: '', is_available: true });
  };
  const startEditMenuItem = (item) => {
    setEditingMenuItem(item);
    setAddingMenuItem(false);
    setMenuForm({
      name: item.name || '', category: item.category || '',
      description: item.description || '', price: item.price ?? '',
      is_available: Boolean(item.is_available),
    });
  };
  const saveMenuItem = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...menuForm, price: Number(menuForm.price) };
      if (editingMenuItem) {
        await api.patch(`/menu/${editingMenuItem.id}`, payload);
        setMenuItems(list => list.map(i => i.id === editingMenuItem.id ? { ...i, ...payload } : i));
        showMessage('Menu item updated', 'success');
      } else {
        const res = await api.post('/menu', payload);
        setMenuItems(list => [...list, res.data || { id: Date.now(), ...payload }]);
        showMessage('New menu item added', 'success');
      }
      setEditingMenuItem(null);
      setAddingMenuItem(false);
      setMenuForm({ name: '', category: '', description: '', price: '', is_available: true });
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to save', 'error');
    }
  };
  const toggleAvailability = async (item) => {
  try {
    const newStatus = !item.is_available;
    await api.patch(`/menu/${item.id}`, {
      is_available: newStatus
    });
    setMenuItems(list => 
      list.map(i => i.id === item.id ? { ...i, is_available: newStatus } : i)
    );
    showMessage(newStatus ? 'Item shown' : 'Item hidden', 'success');
  } catch {
    showMessage('Failed to update status', 'error');
  }
};

  if (loading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', color: colors.textPrimary, fontFamily: 'inherit',
      }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>Loading...</div>
        <p style={{ color: colors.textSecondary }}>Connecting to dashboard</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
    { id: 'menu', label: 'Menu' },
    { id: 'tables', label: 'Tables' },
    { id: 'reports', label: 'Reports' },
  ];

  const msgBg = messageType === 'success' ? '#E5EDDA'
             : messageType === 'error' ? '#F6E3DE' : '#E2EAF0';
  const msgBorder = messageType === 'success' ? colors.success
                  : messageType === 'error' ? colors.danger : colors.primary;

  return (
    <div style={{ padding: '36px 28px 72px', fontFamily: 'inherit' }}>
      <div style={{ maxWidth: '1124px', margin: '0 auto' }}>
        {/* ─── HEADER ─── */}
        <div style={{ marginBottom: '32px' }}>
          <h1 className="page-title">Dashboard</h1>
          <p style={{ color: colors.textSecondary, margin: '6px 0 0 0', fontSize: '15px' }}>
            Welcome back, <strong style={{ color: colors.primary }}>{user?.first_name || user?.name || 'Administrator'}</strong>
          </p>
        </div>

        {/* ─── ALERT MESSAGE ─── */}
        {message && (
          <div style={{
            padding: '14px 20px', borderRadius: '8px', background: msgBg,
            borderLeft: `4px solid ${msgBorder}`, marginBottom: '24px',
            color: colors.textPrimary, fontWeight: 500,
          }}>
            {message}
          </div>
        )}

        {/* ─── TABS NAV ─── */}
        <div style={{
          display: 'flex', gap: '4px', background: '#FFFFFF', padding: '6px',
          borderRadius: '10px', border: `1px solid ${colors.border}`, marginBottom: '24px',
          flexWrap: 'wrap',
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...buttonBase,
                background: activeTab === tab.id ? colors.primary : 'transparent',
                color: activeTab === tab.id ? '#FFFFFF' : colors.textSecondary,
                padding: '10px 20px',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── OVERVIEW ─── */}
        {activeTab === 'overview' && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: colors.textPrimary, margin: '0 0 20px 0' }}>
              System Overview
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              {[
                { label: 'Total Orders', value: stats.totalOrders, color: '#E2EAF0' },
                { label: 'Total Revenue', value: `₱${stats.totalRevenue.toFixed(2)}`, color: '#E5EDDA' },
                { label: 'Active Tables', value: `${stats.activeTables} / ${tables.length}`, color: '#F6EAD0' },
                { label: 'Staff & Users', value: stats.totalUsers, color: '#EADDE5' },
              ].map((stat, i) => (
                <div key={i} style={{ ...cardStyle, border: 'none', background: stat.color }}>
                  <p style={{ color: colors.textSecondary, margin: 0, fontSize: '14px' }}>{stat.label}</p>
                  <p style={{ fontSize: '26px', fontWeight: 700, color: colors.textPrimary, margin: '4px 0 0 0' }}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── USERS ─── */}
        {activeTab === 'users' && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: colors.textPrimary, margin: '0 0 20px 0' }}>
              Staff & Users ({users.length})
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: colors.bg }}>
                    <th style={{ ...cellStyle, fontWeight: 600, color: colors.textPrimary }}>Name</th>
                    <th style={{ ...cellStyle, fontWeight: 600, color: colors.textPrimary }}>Email</th>
                    <th style={{ ...cellStyle, fontWeight: 600, color: colors.textPrimary }}>Role</th>
                    <th style={{ ...cellStyle, fontWeight: 600, color: colors.textPrimary, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(item => (
                    <tr key={item.id} style={{ transition: 'background 0.2s' }}>
                      {editingUser === item.id ? (
                        <>
                          <td style={cellStyle}>
                            <input value={userForm.name}
                              onChange={e => setUserForm({...userForm, name: e.target.value})}
                              style={inputStyle} />
                          </td>
                          <td style={cellStyle}>
                            <input value={userForm.email} type="email"
                              onChange={e => setUserForm({...userForm, email: e.target.value})}
                              style={inputStyle} />
                          </td>
                          <td style={cellStyle}>
                            <select value={userForm.role}
                              onChange={e => setUserForm({...userForm, role: e.target.value})}
                              style={inputStyle}>
                              <option value="customer">Customer</option>
                              <option value="waitstaff">Wait Staff</option>
                              <option value="kitchen">Kitchen</option>
                              <option value="admin">Administrator</option>
                            </select>
                          </td>
                          <td style={{ ...cellStyle, textAlign: 'right' }}>
                            <button onClick={() => saveUser(item.id)}
                              style={{ ...buttonBase, background: colors.success, color: '#fff', padding: '8px 14px', marginRight: '6px' }}>
                              Save
                            </button>
                            <button onClick={() => setEditingUser(null)}
                              style={{ ...buttonBase, background: colors.neutral, color: '#fff', padding: '8px 14px' }}>
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={cellStyle}><strong>{item.name}</strong></td>
                          <td style={{ ...cellStyle, color: colors.textSecondary }}>{item.email}</td>
                          <td style={cellStyle}>
                            <span style={{
                              padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                              background: item.role === 'admin' ? '#EADDE5' : colors.bg,
                              color: item.role === 'admin' ? '#6B3A57' : colors.textSecondary,
                            }}>
                              {item.role || 'customer'}
                            </span>
                          </td>
                          <td style={{ ...cellStyle, textAlign: 'right' }}>
                            <button onClick={() => startEditUser(item)}
                              style={{ ...buttonBase, background: '#EEEBE4', color: colors.textPrimary, padding: '6px 12px', marginRight: '4px' }}>
                              Edit
                            </button>
                            <button onClick={() => deleteUser(item.id)}
                              style={{ ...buttonBase, background: '#F6E3DE', color: colors.danger, padding: '6px 12px' }}>
                              Delete
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── MENU ─── */}
        {activeTab === 'menu' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: colors.textPrimary, margin: 0 }}>
                Menu Items ({menuItems.length})
              </h2>
              <button type="button" onClick={startAddMenuItem}
                style={{ ...buttonBase, background: colors.primary, color: '#fff' }}>
                Add New Item
              </button>
            </div>

            {(addingMenuItem || editingMenuItem) && (
              <form onSubmit={saveMenuItem} style={{ ...cardStyle, margin: '0 0 24px 0' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: colors.textPrimary }}>
                  {editingMenuItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div>
                    <label style={{ fontWeight: 500, color: colors.textPrimary }}>Name</label>
                    <input required value={menuForm.name}
                      onChange={e => setMenuForm({...menuForm, name: e.target.value})}
                      style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontWeight: 500, color: colors.textPrimary }}>Category</label>
                    <select required value={menuForm.category}
                      onChange={e => setMenuForm({...menuForm, category: e.target.value})}
                      style={inputStyle}>
                      <option value="">Select category</option>
                      <option value="Main Dish">Main Dish</option>
                      <option value="Appetizer">Appetizer</option>
                      <option value="Drink">Drink</option>
                      <option value="Dessert">Dessert</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontWeight: 500, color: colors.textPrimary }}>Description</label>
                    <textarea value={menuForm.description}
                      onChange={e => setMenuForm({...menuForm, description: e.target.value})}
                      rows={2} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontWeight: 500, color: colors.textPrimary }}>Price (₱)</label>
                    <input required type="number" step="0.01" min="0"
                      value={menuForm.price}
                      onChange={e => setMenuForm({...menuForm, price: e.target.value})}
                      style={inputStyle} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '24px' }}>
                    <input type="checkbox" checked={menuForm.is_available}
                      onChange={e => setMenuForm({...menuForm, is_available: e.target.checked})}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                    <label style={{ color: colors.textPrimary, cursor: 'pointer' }}>Available for ordering</label>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                  <button type="submit" style={{ ...buttonBase, background: colors.success, color: '#fff' }}>
                    Save Item
                  </button>
                  <button type="button"
                    onClick={() => { setAddingMenuItem(false); setEditingMenuItem(null); }}
                    style={{ ...buttonBase, background: colors.neutral, color: '#fff' }}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: colors.bg }}>
                    <th style={{ ...cellStyle, fontWeight: 600, color: colors.textPrimary }}>Name</th>
                    <th style={{ ...cellStyle, fontWeight: 600, color: colors.textPrimary }}>Category</th>
                    <th style={{ ...cellStyle, fontWeight: 600, color: colors.textPrimary }}>Price</th>
                    <th style={{ ...cellStyle, fontWeight: 600, color: colors.textPrimary }}>Status</th>
                    <th style={{ ...cellStyle, fontWeight: 600, color: colors.textPrimary, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map(item => (
                    <tr key={item.id} style={{ transition: 'background 0.2s' }}>
                      <td style={{ ...cellStyle, fontWeight: 500 }}>{item.name}</td>
                      <td style={{ ...cellStyle, color: colors.textSecondary }}>{item.category}</td>
                      <td style={{ ...cellStyle, fontWeight: 600 }}>₱{Number(item.price).toFixed(2)}</td>
                      <td style={cellStyle}>
                        <span style={{
                          padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                          background: item.is_available ? '#E5EDDA' : '#F6E3DE',
                          color: item.is_available ? colors.success : colors.danger,
                        }}>
                          {item.is_available ? 'Available' : 'Hidden'}
                        </span>
                      </td>
                      <td style={{ ...cellStyle, textAlign: 'right' }}>
                        <button type="button" onClick={() => startEditMenuItem(item)}
                          style={{ ...buttonBase, background: '#EEEBE4', color: colors.textPrimary, padding: '6px 12px', marginRight: '4px' }}>
                          Edit
                        </button>
                        <button type="button" onClick={() => toggleAvailability(item)}
                          style={{
                            ...buttonBase,
                            background: item.is_available ? '#F6EAD0' : '#E5EDDA',
                            color: item.is_available ? colors.warning : colors.success,
                            padding: '6px 12px',
                          }}>
                          {item.is_available ? 'Hide' : 'Show'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── TABLES ─── */}
        {activeTab === 'tables' && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: colors.textPrimary, margin: '0 0 20px 0' }}>
              Table Status ({tables.length})
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {tables.map(table => {
                const isFree = table.status === 'free';
                return (
                  <div key={table.id} style={{
                    padding: '20px',
                    borderRadius: '10px',
                    border: `2px solid ${isFree ? colors.success : colors.danger}`,
                    background: isFree ? '#E5EDDA' : '#F6E3DE',
                    transition: 'transform 0.2s',
                  }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                     onMouseOut={e => e.currentTarget.style.transform = 'none'}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: colors.textPrimary }}>
                      Table {table.table_number ?? table.id}
                    </h3>
                    <p style={{ margin: '8px 0', color: colors.textSecondary, fontSize: '14px' }}>
                      Seats: {table.capacity ?? '—'}
                    </p>
                    <span style={{
                      display: 'inline-block',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 600,
                      background: isFree ? colors.success : colors.danger,
                      color: '#fff',
                    }}>
                      {(table.status ?? 'unknown').toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── REPORTS ─── */}
        {activeTab === 'reports' && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: colors.textPrimary, margin: '0 0 24px 0' }}>
              Performance Reports
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              {[
                { label: 'Total Orders', value: stats.totalOrders, bg: '#E2EAF0' },
                { label: 'Total Revenue', value: `₱${stats.totalRevenue.toFixed(2)}`, bg: '#E5EDDA' },
                { label: 'Avg Order Value', value: `₱${stats.totalOrders ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}`, bg: '#EADDE5' },
                { label: 'Occupied Tables', value: `${stats.activeTables} / ${tables.length}`, bg: '#F6EAD0' },
                { label: 'Registered Users', value: stats.totalUsers, bg: '#E2EAF0' },
              ].map((item, i) => (
                <div key={i} style={{ padding: '24px', borderRadius: '10px', background: item.bg }}>
                  <p style={{ color: colors.textSecondary, margin: 0, fontSize: '14px' }}>{item.label}</p>
                  <p style={{ fontSize: '22px', fontWeight: 700, color: colors.textPrimary, margin: '4px 0 0 0' }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}