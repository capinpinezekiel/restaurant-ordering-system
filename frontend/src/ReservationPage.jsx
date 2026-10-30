import { useState, useEffect } from 'react';
import api from './api';

export default function ReservationPage({ user }) {
  const [tables, setTables] = useState([]);
  const [form, setForm] = useState({
    table_id: '',
    reserved_date_time: '',
    guest_count: 1,
    notes: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const res = await api.get('/tables');
      setTables(res.data);
    } catch (err) {
      console.error('Failed to load tables');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/reservations', form);
      setMessage('✅ Reservation successful!');
      setForm({ table_id: '', reserved_date_time: '', guest_count: 1, notes: '' });
      fetchTables();
    } catch (err) {
      setMessage('❌ Error: ' + (err.response?.data?.message || 'Could not reserve table'));
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Table Reservation</h2>

      <div style={{ marginBottom: '30px' }}>
        <h3>All Tables</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
          {tables.map(table => (
            <div key={table.id} style={{
              padding: '15px', borderRadius: '8px', border: '1px solid #ddd',
              backgroundColor: table.status === 'free' ? '#e6ffea' : table.status === 'reserved' ? '#fff3cd' : '#f8d7da'
            }}>
              <strong>Table {table.table_number}</strong>
              <p>Capacity: {table.capacity} guests</p>
              <p style={{ margin: 0, fontWeight: 'bold' }}>
                {table.status === 'free' ? '✅ Free' : table.status === 'reserved' ? '🔒 Reserved' : '🍽️ Occupied'}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>Make a Reservation</h3>
        {message && <p style={{ color: message.startsWith('✅') ? 'green' : 'red' }}>{message}</p>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <label>Select Table:</label>
            <select value={form.table_id} onChange={(e) => setForm({...form, table_id: e.target.value})} required style={{ width: '100%', padding: '8px', marginTop: '4px' }}>
              <option value="">-- Choose a table --</option>
              {tables.filter(t => t.status === 'free').map(table => (
                <option key={table.id} value={table.id}>Table {table.table_number} — {table.capacity} guests</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label>Date & Time:</label>
            <input type="datetime-local" value={form.reserved_date_time} onChange={(e) => setForm({...form, reserved_date_time: e.target.value})} required style={{ width: '100%', padding: '8px', marginTop: '4px' }} />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label>Number of Guests:</label>
            <input type="number" min="1" value={form.guest_count} onChange={(e) => setForm({...form, guest_count: parseInt(e.target.value)})} required style={{ width: '100%', padding: '8px', marginTop: '4px' }} />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Notes (optional):</label>
            <textarea value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '4px' }} rows="3" />
          </div>

          <button type="submit" style={{ padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>
            Reserve Table
          </button>
        </form>
      </div>
    </div>
  );
}