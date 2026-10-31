import { useState, useEffect } from 'react';
import api from './api';

const statusColors = {
    preparing: '#fff3cd',
    ready: '#d1e7dd',
    served: '#cfe2ff',
    paid: '#e9ecef'
};

export default function KitchenPage() {
    const [orders, setOrders] = useState([]);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders');
            console.log('Orders fetched:', res.data);
            setOrders(res.data.filter(o => o.status !== 'paid'));
        } catch (err) {
            console.error('Failed to fetch orders:', err.response?.data || err.message);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    const updateStatus = async (orderId, newStatus) => {
        await api.patch(`/orders/${orderId}/status`, { status: newStatus });
        fetchOrders();
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h2>🍳 Kitchen Display — Active Orders</h2>
            <p style={{ color: '#666' }}>Auto-refreshes every 5 seconds</p>

            {orders.length === 0 ? (
                <p style={{ fontSize: '18px', color: '#666', textAlign: 'center', marginTop: '50px' }}>
                    No active orders — all caught up! ✅
                </p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
                    {orders.map(order => (
                        <div key={order.id} style={{
                            padding: '15px',
                            borderRadius: '8px',
                            backgroundColor: statusColors[order.status],
                            border: '1px solid #ddd'
                        }}>
                            <h4>Order #{order.id} — Table {order.table?.table_number}</h4>
                            <p style={{ margin: '5px 0', fontWeight: 'bold' }}>
                                Status: {order.status.toUpperCase()}
                            </p>
                            <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                                {order.orderItems?.map((item, idx) => (
                                    <li key={idx}>
                                        {item.quantity}× {item.menuItem?.name}
                                        {item.special_requests && <small style={{ color: '#d63384' }}> ({item.special_requests})</small>}
                                    </li>
                                ))}
                            </ul>
                            <p style={{ fontWeight: 'bold' }}>Total: ₱{order.total_amount}</p>

                            <div style={{ marginTop: '10px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                {order.status === 'preparing' && (
                                    <button onClick={() => updateStatus(order.id, 'ready')}
                                        style={{ padding: '6px 12px', background: '#198754', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                        Mark Ready
                                    </button>
                                )}
                                {order.status === 'ready' && (
                                    <button onClick={() => updateStatus(order.id, 'served')}
                                        style={{ padding: '6px 12px', background: '#0d6efd', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                        Mark Served
                                    </button>
                                )}
                                {order.status === 'served' && (
                                    <span style={{ color: '#666', fontSize: '13px' }}>Awaiting payment...</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}