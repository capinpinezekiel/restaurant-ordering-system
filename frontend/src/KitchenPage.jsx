import { useState, useEffect } from 'react';
import api from './api';

// Status track: how many of the four steps are lit for each status
const progressConfig = {
  pending: { steps: 1, label: 'Pending' },
  preparing: { steps: 2, label: 'Preparing' },
  ready: { steps: 3, label: 'Ready to serve' },
  served: { steps: 4, label: 'Served' },
};

const getProgressInfo = (status) => progressConfig[status] || { steps: 0, label: status };

const minutesAgo = (iso) => {
  if (!iso) return null;
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (Number.isNaN(mins)) return null;
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  return `${Math.floor(mins / 60)} h ${mins % 60} min ago`;
};

export default function KitchenPage() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data.filter(o => o.status !== 'paid'));
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      fetchOrders();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="page">
      <div className="page-head">
        <h1 className="page-title">Kitchen tickets</h1>
        <p className="page-lede">Active orders, refreshed every 10 seconds.</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty">
          <strong>The rail is clear</strong>
          New orders will show up here as soon as they are placed.
        </div>
      ) : (
        <div className="rail">
          {orders.map(order => {
            const progress = getProgressInfo(order.status);
            const placed = minutesAgo(order.created_at);

            return (
              <article key={order.id} className={`kt ${order.status}`}>
                <div className="kt-head">
                  <div className="kt-table">Table {order.table?.table_number}</div>
                  <div className="kt-meta">
                    <div>Order #{order.id}</div>
                    {placed && <div>{placed}</div>}
                  </div>
                </div>

                <div className="kt-steps" aria-hidden="true">
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} className={`kt-step ${n <= progress.steps ? 'on' : ''}`} />
                  ))}
                </div>
                <div className="kt-status">{progress.label}</div>

                <ul className="kt-items">
                  {order.order_items?.map(item => (
                    <li key={item.id}>
                      <span className="kt-qty">{item.quantity}×</span>
                      <span>
                        {item.menu_item?.name}
                        {item.special_requests && (
                          <span className="kt-note">Note: {item.special_requests}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="kt-actions">
                  {order.status === 'pending' && (
                    <button className="btn btn-primary btn-lg btn-block" onClick={() => updateStatus(order.id, 'preparing')}>
                      Start preparing
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button className="btn btn-primary btn-lg btn-block" onClick={() => updateStatus(order.id, 'ready')}>
                      Mark as ready
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button className="btn btn-brass btn-lg btn-block" onClick={() => updateStatus(order.id, 'served')}>
                      Mark as served
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
