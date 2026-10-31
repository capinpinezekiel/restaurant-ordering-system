import { useState, useEffect } from 'react';
import api from './api';

export default function ReservationPage({ user }) {
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [form, setForm] = useState({
    table_id: '',
    reserved_date_time: '',
    guest_count: 1,
    notes: ''
  });
  const [message, setMessage] = useState('');

  const fetchTables = async () => {
    try {
      const res = await api.get('/tables');
      setTables(res.data);
    } catch (err) {
      console.error('Failed to load tables');
    }
  };

  const fetchReservations = async () => {
    try {
      const res = await api.get('/reservations');
      setReservations(res.data);
    } catch (err) {
      console.error('Failed to load reservations');
    }
  };

  useEffect(() => {
    fetchTables();
    fetchReservations();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/reservations', form);
      setMessage('✅ Reservation successful!');
      setForm({ table_id: '', reserved_date_time: '', guest_count: 1, notes: '' });
      fetchTables();
      fetchReservations();
    } catch (err) {
      setMessage('❌ Error: ' + (err.response?.data?.message || 'Could not reserve table'));
    }
  };

  const updateReservationStatus = async (reservationId, newStatus) => {
    try {
      await api.patch(`/reservations/${reservationId}`, { status: newStatus });
      fetchTables();
      fetchReservations();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ color: '#1a202c', marginBottom: '24px' }}>Table Reservation</h2>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#2d3748', marginBottom: '16px' }}>All Tables</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
          {tables.map(table => (
            <div key={table.id} style={{
              padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0',
              backgroundColor: table.status === 'free' ? '#f0fdf4' : table.status === 'reserved' ? '#fffbeb' : '#fef2f2'
            }}>
              <strong style={{ color: '#1a202c', fontSize: '16px' }}>Table {table.table_number}</strong>
              <p style={{ color: '#4a5568', margin: '6px 0' }}>Capacity: {table.capacity} guests</p>
              <p style={{ margin: '8px 0 0 0', fontWeight: 600, fontSize: '14px', color:
                table.status === 'free' ? '#166534' :
                table.status === 'reserved' ? '#92400e' : '#991b1b'
              }}>
                {table.status === 'free' ? '✅ Free' : table.status === 'reserved' ? '🔒 Reserved' : '🍽️ Occupied'}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '24px', border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '30px', backgroundColor: '#fafafa' }}>
        <h3 style={{ color: '#2d3748', marginTop: 0, marginBottom: '16px' }}>Make a Reservation</h3>
        {message && <p style={{ fontWeight: 600, color: message.startsWith('✅') ? '#166534' : '#dc2626' }}>{message}</p>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontWeight: 500, color: '#2d3748', marginBottom: '4px' }}>Select Table:</label>
            <select value={form.table_id} onChange={(e) => setForm({...form, table_id: e.target.value})} required style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '15px' }}>
              <option value="">-- Choose a table --</option>
              {tables.filter(t => t.status === 'free').map(table => (
                <option key={table.id} value={table.id}>Table {table.table_number} — {table.capacity} guests</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontWeight: 500, color: '#2d3748', marginBottom: '4px' }}>Date & Time:</label>
            <input type="datetime-local" value={form.reserved_date_time} onChange={(e) => setForm({...form, reserved_date_time: e.target.value})} required style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '15px' }} />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontWeight: 500, color: '#2d3748', marginBottom: '4px' }}>Number of Guests:</label>
            <input type="number" min="1" value={form.guest_count} onChange={(e) => setForm({...form, guest_count: parseInt(e.target.value)})} required style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '15px' }} />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontWeight: 500, color: '#2d3748', marginBottom: '4px' }}>Notes (optional):</label>
            <textarea value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '15px' }} rows="3" />
          </div>

          <button type="submit" style={{ padding: '12px 24px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 600 }}>
            Reserve Table
          </button>
        </form>
      </div>

      <div>
        <h3 style={{ color: '#2d3748', marginBottom: '16px' }}>Your Reservations</h3>
        {reservations.length === 0 ? (
          <p style={{ color: '#718096', fontSize: '15px' }}>You have no reservations yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reservations.map(res => (
              <div key={res.id} style={{
                padding: '18px', border: '1px solid #e2e8f0', borderRadius: '8px',
                backgroundColor: res.status === 'confirmed' ? '#fffbeb' : res.status === 'cancelled' ? '#f7fafc' : '#f0fdf4'
              }}>
                <p style={{ margin: '0 0 6px 0', color: '#1a202c', fontWeight: 500, fontSize: '15px' }}>
                  <strong>Table {res.table?.table_number}</strong> — {new Date(res.reserved_date_time).toLocaleString()}
                </p>
                <p style={{ margin: 0, color: '#4a5568' }}>
                  Status: <strong style={{ color: res.status === 'confirmed' ? '#92400e' : res.status === 'cancelled' ? '#718096' : '#166534' }}>
                    {res.status === 'confirmed' ? 'Confirmed' : res.status}
                  </strong>
                </p>
                {res.status === 'confirmed' && (
                  <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                    <button onClick={() => updateReservationStatus(res.id, 'cancelled')}
                      style={{ padding: '8px 16px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
                      Cancel
                    </button>
                    <button onClick={() => updateReservationStatus(res.id, 'completed')}
                      style={{ padding: '8px 16px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
                      Mark Completed
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}