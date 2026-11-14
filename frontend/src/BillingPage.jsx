import { useState, useEffect } from 'react';
import api from './api';

export default function BillingPage({ user }) {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [payingId, setPayingId] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    payment_method: 'cash',
    amount_paid: 0,
  });

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to load orders');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const flash = (text, type = 'success', ms = 3500) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), ms);
  };

  const startPayment = (order) => {
    setPayingId(order.id);
    setPaymentForm({
      payment_method: 'cash',
      amount_paid: Number(order.total_amount),
    });
  };

  const confirmPayment = async (orderId) => {
    try {
      await api.post(`/orders/${orderId}/pay`, paymentForm);
      flash('Payment recorded. The table is free again.');
      setPayingId(null);
      fetchOrders();
    } catch (err) {
      flash(err.response?.data?.message || 'Payment failed', 'error');
    }
  };

  // Manual "make table available" button
  const makeTableAvailable = async (tableId, tableNumber) => {
    if (!confirm(`Make Table ${tableNumber} AVAILABLE?`)) return;
    try {
      await api.patch(`/tables/${tableId}/status`, { status: 'free' });
      flash(`Table ${tableNumber} is now available.`, 'success', 3000);
      fetchOrders();
    } catch (err) {
      flash(err.response?.data?.message || 'Could not update the table', 'error');
    }
  };

  const cancelPayment = () => {
    setPayingId(null);
  };

  const unpaidOrders = orders.filter(o => o.status !== 'paid');
  const paidOrders = orders.filter(o => o.status === 'paid');
  const totalUnpaid = unpaidOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  return (
    <div className="page page-narrow">
      <div className="page-head">
        <h1 className="page-title">Billing</h1>
        <p className="page-lede">Record payments. Tables are freed automatically once a bill is settled.</p>
      </div>

      {message && (
        <div className={`alert alert-${messageType}`} role="status">{message}</div>
      )}

      <div className="stats">
        <div className="card">
          <p className="stat-label">Waiting for payment</p>
          <p className="stat-num" style={{ color: 'var(--saffron)' }}>₱{totalUnpaid.toFixed(2)}</p>
          <p className="stat-sub">{unpaidOrders.length} open bill{unpaidOrders.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="card">
          <p className="stat-label">Settled</p>
          <p className="stat-num" style={{ color: 'var(--olive)' }}>{paidOrders.length}</p>
          <p className="stat-sub">bills paid</p>
        </div>
      </div>

      <h2 className="section-title">Open bills</h2>

      {unpaidOrders.length === 0 ? (
        <div className="empty">
          <strong>Everything is settled</strong>
          No open bills right now, and every table is free.
        </div>
      ) : (
        <div className="bills">
          {unpaidOrders.map(order => (
            <div key={order.id} className="card receipt">
              <div className="receipt-main">
                <h3 className="receipt-title">Table {order.table?.table_number}</h3>
                <p className="receipt-time">Order #{order.id} · {new Date(order.created_at).toLocaleString()}</p>
                <span className={`badge ${order.status === 'served' ? 'badge-success' : 'badge-warn'}`}>
                  {order.status?.replace('_', ' ')}
                </span>
                <p className="receipt-amt">₱{Number(order.total_amount || 0).toFixed(2)}</p>

                {order.table && (
                  <button
                    className="btn btn-soft-olive btn-sm"
                    onClick={() => makeTableAvailable(order.table.id, order.table.table_number)}
                  >
                    Make Table {order.table.table_number} available
                  </button>
                )}
              </div>

              {payingId === order.id ? (
                <div className="pay-panel">
                  <h3 style={{ fontSize: 18, marginBottom: 14 }}>Take payment</h3>
                  <div className="field" style={{ marginBottom: 14 }}>
                    <label className="label" htmlFor={`method-${order.id}`}>Payment method</label>
                    <select
                      id={`method-${order.id}`}
                      className="input"
                      value={paymentForm.payment_method}
                      onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                    >
                      <option value="cash">Cash</option>
                      <option value="gcash">GCash</option>
                      <option value="card">Card</option>
                    </select>
                  </div>
                  <div className="field" style={{ marginBottom: 18 }}>
                    <label className="label" htmlFor={`amount-${order.id}`}>Amount received</label>
                    <input
                      id={`amount-${order.id}`}
                      className="input"
                      type="number"
                      step="0.01"
                      min={order.total_amount}
                      value={paymentForm.amount_paid}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount_paid: parseFloat(e.target.value) || 0 })}
                    />
                    {paymentForm.amount_paid > Number(order.total_amount) && (
                      <p style={{ marginTop: 8, fontSize: 14, color: 'var(--olive)', fontWeight: 700 }}>
                        Change: ₱{(paymentForm.amount_paid - Number(order.total_amount)).toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div className="pay-actions">
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => confirmPayment(order.id)}>
                      Confirm and free table
                    </button>
                    <button className="btn btn-ghost" onClick={cancelPayment}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button className="btn btn-primary btn-lg" onClick={() => startPayment(order)}>
                  Record payment
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {paidOrders.length > 0 && (
        <div style={{ marginTop: 44 }}>
          <h2 className="section-title">Payment history</h2>
          <div>
            {paidOrders.slice(0, 10).map(order => (
              <div key={order.id} className="history-row">
                <div>
                  <p style={{ fontWeight: 600 }}>Table {order.table?.table_number} · Order #{order.id}</p>
                  <p style={{ fontSize: 13, color: 'var(--ink-3)' }}>{new Date(order.created_at).toLocaleString()}</p>
                </div>
                <p className="history-amt">Paid ₱{Number(order.total_amount || 0).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
