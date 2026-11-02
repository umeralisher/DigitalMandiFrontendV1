import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money, fmtDate } from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function Transactions() {
  const { user } = useAuth();
  const [list, setList] = useState(null);
  useEffect(() => { api.get('/transactions').then(setList).catch(() => setList([])); }, []);
  if (!list) return <p className="muted pad">Loading…</p>;
  const completed = list.filter((t) => t.status === 'completed').reduce((s, t) => s + t.amount, 0);

  return (
    <>
      <h2>Transaction records</h2>
      <p className="muted">{user.role === 'farmer' ? 'Total earned from delivered orders' : 'Total spent on delivered orders'}: <strong>{money(completed)}</strong></p>
      {list.length === 0 ? <div className="empty">No transactions yet.</div> : (
        <div className="table-wrap"><table className="t">
          <thead><tr><th>Date</th><th>Order</th><th>Item</th><th>{user.role === 'farmer' ? 'Buyer' : 'Farmer'}</th><th>Method</th><th>Reference</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>{list.map((t) => (
            <tr key={t._id}><td>{fmtDate(t.createdAt)}</td>
              <td>{t.order ? <Link to={`/orders/${t.order._id}`}>{t.order.orderNumber}</Link> : '—'}</td>
              <td>{t.order?.productName}</td><td>{user.role === 'farmer' ? t.buyer?.name : t.farmer?.name}</td>
              <td>{t.method}</td><td>{t.reference || '—'}</td><td>{money(t.amount)}</td><td><StatusBadge status={t.status} /></td></tr>))}
          </tbody></table></div>)}
    </>
  );
}
