import { useState, useEffect } from 'react';
import api from './api';

export default function OrderPage({ user }) {
  const [menu, setMenu] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [menuRes, tableRes] = await Promise.all([
        api.get('/menu'),
        api.get('/tables')
      ]);
      // Handle both is_available = true and cases where field might not exist
      setMenu(menuRes.data.filter(item => item.is_available !== false));
      setTables(tableRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
      showMessage('Failed to load menu or tables', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showMessage = (text, type = 'info') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  const addToCart = (item) => {
    setCart(prev => {
      const exist = prev.find(c => c.menu_item_id === item.id);
      if (exist) {
        return prev.map(c =>
          c.menu_item_id === item.id
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      }
      return [...prev, {
        menu_item_id: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: 1
      }];
    });
  };

  // Immutable update — mutating the item in place made "+" count twice in dev (StrictMode)
  const updateQuantity = (index, delta) => {
    setCart(prev =>
      prev
        .map((c, i) => (i === index ? { ...c, quantity: c.quantity + delta } : c))
        .filter(c => c.quantity > 0)
    );
  };

  const totalAmount = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!selectedTable) {
      showMessage('Please select a table first', 'error');
      return;
    }
    if (cart.length === 0) {
      showMessage('Please add items to your order', 'error');
      return;
    }

    try {
      await api.post('/orders', {
        table_id: selectedTable,
        items: cart,
        total_amount: totalAmount
      });

      showMessage('Order placed. The kitchen has it.', 'success');
      setCart([]);
      setSelectedTable('');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to place order';
      showMessage(errorMsg, 'error');
    }
  };

  const groupedMenu = menu.reduce((groups, item) => {
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push(item);
    return groups;
  }, {});

  const inCart = (id) => cart.find(c => c.menu_item_id === id)?.quantity || 0;

  return (
    <div className="page">
      <div className="page-head">
        <h1 className="page-title">Menu</h1>
        <p className="page-lede">Choose a table, then add dishes to the order.</p>
      </div>

      {message && (
        <div className={`alert alert-${messageType}`} role="status">{message}</div>
      )}

      {loading ? (
        <p className="empty">Loading the menu…</p>
      ) : (
        <div className="order-grid">
          {/* ─── MENU ─── */}
          <div className="menu-card">
            {Object.keys(groupedMenu).length === 0 ? (
              <div className="empty" style={{ border: 0 }}>
                <strong>The menu is empty</strong>
                Dishes will appear here once they are available.
              </div>
            ) : (
              Object.entries(groupedMenu).map(([category, items]) => (
                <section key={category} className="menu-cat">
                  <h2 className="menu-cat-title">{category}</h2>
                  <div className="menu-cat-rule" />
                  {items.map(item => (
                    <div key={item.id} className="dish">
                      <div className="dish-body">
                        <div className="dish-top">
                          <span className="dish-name">{item.name}</span>
                          <span className="dish-leader" aria-hidden="true" />
                          <span className="dish-price">₱{Number(item.price).toFixed(2)}</span>
                        </div>
                        {item.description && <p className="dish-desc">{item.description}</p>}
                        {inCart(item.id) > 0 && (
                          <p className="dish-count">{inCart(item.id)} in this order</p>
                        )}
                      </div>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => addToCart(item)}
                        aria-label={`Add ${item.name} to the order`}
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </section>
              ))
            )}
          </div>

          {/* ─── ORDER TICKET ─── */}
          <form className="ticket" onSubmit={handleSubmit}>
            <h2 className="ticket-title">Your order</h2>

            <div className="field">
              <label className="label" htmlFor="table">Table</label>
              <select
                id="table"
                className="input"
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                required
              >
                <option value="">Choose a table</option>
                {tables.map(t => (
                  <option key={t.id} value={t.id} disabled={t.status !== 'free'}>
                    Table {t.table_number}, seats {t.capacity}{t.status !== 'free' ? ` (${t.status})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {cart.length === 0 ? (
              <p className="ticket-empty">Nothing here yet. Add a dish from the menu.</p>
            ) : (
              <div>
                {cart.map((item, index) => (
                  <div key={item.menu_item_id} className="line">
                    <div>
                      <div className="line-name">{item.name}</div>
                      <div className="line-sub">₱{Number(item.price).toFixed(2)} each</div>
                    </div>
                    <div className="stepper">
                      <button type="button" onClick={() => updateQuantity(index, -1)} aria-label={`Remove one ${item.name}`}>−</button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(index, 1)} aria-label={`Add one ${item.name}`}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="total">
              <span style={{ fontWeight: 600 }}>Total</span>
              <span className="total-amt">₱{totalAmount.toFixed(2)}</span>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg btn-block"
              disabled={cart.length === 0 || !selectedTable}
            >
              Place order
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
