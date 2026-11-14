import { useState, useEffect } from 'react';
import api from './api';

export default function ReservationPage({ user }) {
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [form, setForm] = useState({
    table_id: '',
    reserved_date_time: '',
    guest_count: 1,
    notes: '',
  });
  const [selectedTableInfo, setSelectedTableInfo] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [loading, setLoading] = useState(false);

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const fetchTables = async () => {
    try {
      const res = await api.get('/tables');
      setTables(res.data);
    } catch (err) {
      showMessage('Failed to load tables', 'error');
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

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  useEffect(() => {
    fetchTables();
    fetchReservations();
  }, []);

  const handleTableChange = (e) => {
    const tableId = e.target.value;
    const table = tables.find(t => t.id === parseInt(tableId));
    setSelectedTableInfo(table || null);
    setForm({ ...form, table_id: tableId, guest_count: 1 });
  };

  const handleGuestCountChange = (e) => {
    let value = parseInt(e.target.value) || 1;

    if (selectedTableInfo) {
      if (value < 1) value = 1;
      if (value > selectedTableInfo.capacity) {
        showMessage(`This table seats ${selectedTableInfo.capacity} at most`, 'error');
        value = selectedTableInfo.capacity;
      }
    }

    setForm({ ...form, guest_count: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    if (!form.table_id) {
      showMessage('Please select a table', 'error');
      setLoading(false);
      return;
    }
    if (!form.reserved_date_time) {
      showMessage('Please select a date and time', 'error');
      setLoading(false);
      return;
    }
    if (new Date(form.reserved_date_time) < new Date()) {
      showMessage('You can’t reserve a date or time in the past', 'error');
      setLoading(false);
      return;
    }
    if (selectedTableInfo && form.guest_count > selectedTableInfo.capacity) {
      showMessage(`This table seats ${selectedTableInfo.capacity} at most`, 'error');
      setLoading(false);
      return;
    }

    try {
      await api.post('/reservations', form);
      showMessage('Reservation submitted');
      setForm({ table_id: '', reserved_date_time: '', guest_count: 1, notes: '' });
      setSelectedTableInfo(null);
      fetchReservations();
      fetchTables();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create reservation';
      showMessage(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status) =>
    status === 'confirmed' ? 'badge-success' : status === 'cancelled' ? 'badge-error' : 'badge-warn';

  return (
    <div className="page page-narrow">
      <div className="page-head">
        <h1 className="page-title">Reserve a table</h1>
        <p className="page-lede">Pick a free table in the dining room, then tell us when you are coming.</p>
      </div>

      {/* ─── DINING ROOM ─── */}
      <h2 className="section-title">The dining room</h2>
      <div className="floor">
        {tables.map(table => {
          const free = table.status === 'free';
          const selected = String(form.table_id) === String(table.id);
          return (
            <button
              key={table.id}
              type="button"
              className={`tile ${free ? 'free' : 'taken'} ${selected ? 'selected' : ''}`}
              disabled={!free}
              aria-pressed={selected}
              onClick={() => handleTableChange({ target: { value: String(table.id) } })}
            >
              <span className="tile-num">{table.table_number}</span>
              <span className="seats" aria-hidden="true">
                {Array.from({ length: Math.min(Number(table.capacity) || 0, 12) }).map((_, i) => (
                  <span key={i} className="seat" />
                ))}
              </span>
              <span className="tile-meta">Seats {table.capacity}</span>
              <span className="tile-status">{free ? 'Free' : 'Reserved'}</span>
            </button>
          );
        })}
      </div>

      {message && (
        <div className={`alert alert-${messageType}`} role="status">{message}</div>
      )}

      {/* ─── FORM ─── */}
      <form className="card" onSubmit={handleSubmit} style={{ marginBottom: 40 }}>
        <h2 className="section-title" style={{ border: 0, paddingBottom: 0, marginBottom: 20 }}>Your reservation</h2>

        <div className="field">
          <label className="label" htmlFor="table_id">Table *</label>
          <select id="table_id" name="table_id" className="input" value={form.table_id} onChange={handleTableChange} required>
            <option value="">Choose a table</option>
            {tables.map(table => (
              <option key={table.id} value={table.id}>
                Table {table.table_number}, seats {table.capacity}
              </option>
            ))}
          </select>
        </div>

        {selectedTableInfo && (
          <div className="alert alert-info">
            Table {selectedTableInfo.table_number} seats up to {selectedTableInfo.capacity} guests.
          </div>
        )}

        <div className="field">
          <label className="label" htmlFor="reserved_date_time">Date and time *</label>
          <input
            id="reserved_date_time"
            className="input"
            type="datetime-local"
            name="reserved_date_time"
            value={form.reserved_date_time}
            onChange={(e) => setForm({ ...form, reserved_date_time: e.target.value })}
            min={getMinDateTime()}
            required
          />
          <p className="hint">Only future dates and times can be booked.</p>
        </div>

        <div className="field">
          <label className="label" htmlFor="guest_count">Number of guests *</label>
          <input
            id="guest_count"
            className="input"
            type="number"
            name="guest_count"
            value={form.guest_count}
            onChange={handleGuestCountChange}
            min={1}
            max={selectedTableInfo?.capacity || 20}
            required
          />
          {selectedTableInfo && (
            <p className="hint">This table seats {selectedTableInfo.capacity} at most.</p>
          )}
        </div>

        <div className="field" style={{ marginBottom: 24 }}>
          <label className="label" htmlFor="notes">Special requests (optional)</label>
          <textarea
            id="notes"
            className="input"
            name="notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Allergies, a celebration, a high chair…"
          />
        </div>

        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
          {loading ? 'Submitting…' : 'Confirm reservation'}
        </button>
      </form>

      {/* ─── MY RESERVATIONS ─── */}
      <h2 className="section-title">My reservations</h2>
      {reservations.length === 0 ? (
        <div className="empty">
          <strong>No reservations yet</strong>
          Choose a table above to book your first one.
        </div>
      ) : (
        <div className="res-list">
          {reservations.map(res => (
            <div key={res.id} className={`card res ${res.status}`}>
              <div>
                <h3 className="res-title">
                  Table {res.table?.table_number}, {res.guest_count} guest{res.guest_count !== 1 ? 's' : ''}
                </h3>
                <p className="res-when">{new Date(res.reserved_date_time).toLocaleString()}</p>
                {res.notes && <p className="res-note">“{res.notes}”</p>}
              </div>
              <span className={`badge ${statusBadge(res.status)}`}>{res.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
