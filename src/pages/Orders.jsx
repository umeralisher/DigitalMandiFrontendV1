import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money, fmtDate } from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Alert from '../components/Alert.jsx';

const FILTERS = ['', 'pending', 'confirmed', 'delivered', 'rejected', 'cancelled'];

export default function Orders() {
  const { user } = useAuth();
  const [status, setStatus] = useState('');
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  const farmer = user.role === 'farmer';

  const load = () => api.get(`/orders${status ? `?status=${status}` : ''}`).then(setOrders).catch((e) => setError(e.message));
  useEffect(() => { setOrders(null); load(); }, [status]); // eslint-disable-line

  const act = async (o, s) => {
    try { await api.patch(`/orders/${o._id}/status`, { status: s }); load(); } catch (e) { setError(e.message); }
  };

  return (
    <>
      <div className="row between"><h2>{farmer ? 'Incoming orders' : 'My orders'}</h2><Link to="/transactions" className="btn btn-ghost btn-sm">Transaction records</Link></div>
      <div className="tabs">{FILTERS.map((f) => <button key={f} className={`tab ${status === f ? 'active' : ''}`} onClick={() => setStatus(f)}>{f || 'All'}</button>)}</div>
      <Alert>{error}</Alert>
      {!orders ? <p className="muted">Loading…</p> : orders.length === 0 ? (
        <div className="empty">{farmer ? 'No orders yet. They will appear here as buyers order your produce.' : <>You have not placed any orders. <Link to="/products">Browse the market</Link>.</>}</div>
      ) : (
        <div className="table-wrap"><table className="t">
          <thead><tr><th>Order</th><th>Product</th><th>{farmer ? 'Buyer' : 'Farmer'}</th><th>Total</th><th>Payment</th><th>Status</th><th></th></tr></thead>
          <tbody>{orders.map((o) => (
            <tr key={o._id}>
              <td><Link to={`/orders/${o._id}`}>{o.orderNumber}</Link><div className="muted small">{fmtDate(o.createdAt)}</div></td>
              <td>{o.productName}<div className="muted small">{o.quantity} {o.unit}</div></td>
              <td>{farmer ? o.buyer?.name : o.farmer?.name}</td>
              <td>{money(o.totalAmount)}</td>
              <td>{o.paymentMethod} <StatusBadge status={o.paymentStatus} /></td>
              <td><StatusBadge status={o.status} /></td>
              <td><div className="row">
                {farmer && o.status === 'pending' && <><button className="btn btn-primary btn-sm" onClick={() => act(o, 'confirmed')}>Accept</button><button className="btn btn-danger btn-sm" onClick={() => act(o, 'rejected')}>Reject</button></>}
                {farmer && o.status === 'confirmed' && <button className="btn btn-accent btn-sm" onClick={() => act(o, 'delivered')}>Mark delivered</button>}
                {!farmer && o.status === 'pending' && <button className="btn btn-ghost btn-sm" onClick={() => act(o, 'cancelled')}>Cancel</button>}
              </div></td>
            </tr>))}
          </tbody></table></div>
      )}
    </>
  );
}
