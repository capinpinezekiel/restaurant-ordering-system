import { useState, useEffect } from 'react';
import api from './api';

export default function OrderPage({ user }) {
  const [menu, setMenu] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState('');

 useEffect(() => {
  let mounted = true;  // ✅ Prevent duplicate fetch

  const fetchData = async () => {
    try {
      const [menuRes, tableRes] = await Promise.all([
        api.get('/menu'),
        api.get('/tables')
      ]);
      if (mounted) {
        setMenu(menuRes.data);
        setTables(tableRes.data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  fetchData();
  return () => { mounted = false; };  // ✅ Cleanup
}, []);


 const addToCart = (item) => {
  setCart(prev => {
    const exist = prev.find(c => c.menu_item_id === item.id);
    if (exist) {
      // ✅ Increase quantity — NO new row
      return prev.map(c => 
        c.menu_item_id === item.id 
          ? {...c, quantity: c.quantity + 1} 
          : c
      );
    }
    // ✅ Only add if truly new
    return [...prev, { 
      menu_item_id: item.id, 
      name: item.name, 
      price: item.price, 
      quantity: 1, 
      special_requests: '' 
    }];
  });
};

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(c => c.menu_item_id !== id));
  };

  const updateQty = (id, qty) => {
    if (qty < 1) return removeFromCart(id);
    setCart(prev => prev.map(c => c.menu_item_id === id ? {...c, quantity: qty} : c));
  };

  const total = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

  const submitOrder = async () => {
    if (!selectedTable) return alert('Please select a table');
    if (cart.length === 0) return alert('Cart is empty');
    setMessage('');
    try {
      await api.post('/orders', {
        table_id: selectedTable,
        items: cart.map(c => ({
          menu_item_id: c.menu_item_id,
          quantity: c.quantity,
          special_requests: c.special_requests
        }))
      });
      setMessage('✅ Order submitted! Kitchen notified.');
      setCart([]);
      setSelectedTable('');
    } catch (err) {
      setMessage('❌ Error: ' + (err.response?.data?.message || 'Failed to place order'));
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      <h2>Place Order</h2>
      {message && <p style={{ color: message.startsWith('✅') ? 'green' : 'red', fontSize: '18px' }}>{message}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Menu */}
        <div>
          <h3>Menu</h3>
          {['Main Dish', 'Rice', 'Dessert', 'Drink'].map(cat => (
            <div key={cat} style={{ marginBottom: '20px' }}>
              <h4 style={{ borderBottom: '2px solid #eee', paddingBottom: '5px' }}>{cat}</h4>
              {menu.filter(m => m.category === cat).map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                  <div>
                    <strong>{item.name}</strong> — ₱{item.price}
                    <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{item.description}</p>
                  </div>
                  <button onClick={() => addToCart(item)} style={{ padding: '6px 12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Add</button>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Cart */}
        <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h3>Your Order</h3>
          <div style={{ marginBottom: '15px' }}>
            <label>Select Table:</label>
            <select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '4px' }}>
              <option value="">-- Choose table --</option>
              {tables.filter(t => t.status !== 'occupied').map(t => (
                <option key={t.id} value={t.id}>Table {t.table_number}</option>
              ))}
            </select>
          </div>

          {cart.length === 0 ? <p>Cart is empty</p> : (
            <>
              {cart.map(c => (
                <div key={c.menu_item_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #ddd' }}>
                  <span>{c.name}</span>
                  <div>
                    <button onClick={() => updateQty(c.menu_item_id, c.quantity - 1)}>-</button>
                    <span style={{ margin: '0 8px' }}>{c.quantity}</span>
                    <button onClick={() => updateQty(c.menu_item_id, c.quantity + 1)}>+</button>
                    <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>₱{c.price * c.quantity}</span>
                  </div>
                </div>
              ))}
              <h4 style={{ textAlign: 'right', marginTop: '15px' }}>Total: ₱{total}</h4>
              <button onClick={submitOrder} style={{ width: '100%', padding: '12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', marginTop: '10px', cursor: 'pointer' }}>
                Submit Order
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}