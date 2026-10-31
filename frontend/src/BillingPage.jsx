import { useState, useEffect } from 'react';
import api from './api';

export default function BillingPage() {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [payment, setPayment] = useState({ method: 'cash', amount_paid: '' });
    const [message, setMessage] = useState('');

    const fetchOrders = async () => {
        const res = await api.get('/orders');
        setOrders(res.data.filter(o => o.status === 'served'));
    };

    useEffect(() => { fetchOrders(); }, []);

    const handlePay = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const res = await api.post(`/orders/${selectedOrder.id}/pay`, payment);
            setMessage(`✅ Payment recorded! Change: ₱${res.data.change}`);
            setSelectedOrder(null);
            setPayment({ method: 'cash', amount_paid: '' });
            fetchOrders();
        } catch (err) {
            setMessage('❌ Error: ' + (err.response?.data?.message || 'Payment failed'));
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
            <h2>💰 Billing & Payment</h2>
            {message && <p style={{ color: message.startsWith('✅') ? 'green' : 'red', fontSize: '18px' }}>{message}</p>}

            {!selectedOrder ? (
                <>
                    <h3>Orders Awaiting Payment</h3>
                    {orders.length === 0 ? (
                        <p style={{ color: '#666' }}>No orders waiting for payment ✅</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                            <thead>
                                <tr style={{ background: '#f5f5f5' }}>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Order #</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Table</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Total Amount</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(o => (
                                    <tr key={o.id}>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>#{o.id}</td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Table {o.table?.table_number}</td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>₱{o.total_amount}</td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                            <button onClick={() => setSelectedOrder(o)}
                                                style={{ padding: '6px 12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                                Process Payment
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </>
            ) : (
                <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
                    <h3>Payment — Order #{selectedOrder.id}</h3>
                    <p><strong>Table:</strong> {selectedOrder.table?.table_number}</p>
                    <p><strong>Total Due:</strong> ₱{selectedOrder.total_amount}</p>
                    <form onSubmit={handlePay}>
                        <div style={{ marginBottom: '12px' }}>
                            <label>Payment Method:</label>
                            <select value={payment.method} onChange={(e) => setPayment({...payment, method: e.target.value})}
                                style={{ width: '100%', padding: '8px', marginTop: '4px' }}>
                                <option value="cash">Cash</option>
                                <option value="gcash">GCash</option>
                                <option value="card">Card</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label>Amount Received:</label>
                            <input type="number" step="0.01" min={selectedOrder.total_amount} value={payment.amount_paid}
                                onChange={(e) => setPayment({...payment, amount_paid: parseFloat(e.target.value)})} required
                                style={{ width: '100%', padding: '8px', marginTop: '4px' }} />
                            {payment.amount_paid && payment.amount_paid >= selectedOrder.total_amount && (
                                <p style={{ color: 'green', marginTop: '5px' }}>
                                    Change: ₱{(payment.amount_paid - selectedOrder.total_amount).toFixed(2)}
                                </p>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="button" onClick={() => setSelectedOrder(null)}
                                style={{ padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                Cancel
                            </button>
                            <button type="submit"
                                style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                Confirm Payment
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}