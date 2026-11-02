import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { api, money, fmtTime } from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Alert from '../components/Alert.jsx';

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const [o, setO] = useState(null);
  const [error, setError] = useState('');
  const [rev, setRev] = useState({ rating: 5, comment: '' });
  const [done, setDone] = useState('');

  const load = () => api.get(`/orders/${id}`).then(setO).catch((e) => setError(e.message));
  useEffect(() => { load(); }, [id]); // eslint-disable-line

  if (error && !o) return <Alert>{error}</Alert>;
  if (!o) return <p className="muted pad">Loading…</p>;

  const isFarmer = user.role === 'farmer';
  const isBuyer = user.role === 'buyer';
  const other = isFarmer ? o.buyer : o.farmer;
  const act = async (s) => { try { await api.patch(`/orders/${o._id}/status`, { status: s }); load(); } catch (e) { setError(e.message); } };
  const review = async (e) => {
    e.preventDefault();
    try { await api.post('/reviews', { orderId: o._id, ...rev }); setDone('Thank you. Your review was posted.'); load(); } catch (err) { setError(err.message); }
  };

  return (
    <>
      {location.state?.placed && <Alert type="success">Order placed. The farmer has been notified and will confirm shortly.</Alert>}
      <Alert>{error}</Alert>
      <div className="row between"><h2>Order {o.orderNumber}</h2><StatusBadge status={o.status} /></div>
      <div className="grid grid-2">
        <div className="card">
          <h3>Order summary</h3>
          <dl className="facts">
            <dt>Product</dt><dd><Link to={`/products/${o.product}`}>{o.productName}</Link></dd>
            <dt>Quantity</dt><dd>{o.quantity} {o.unit}</dd>
            <dt>Unit price</dt><dd>{money(o.unitPrice)}</dd>
            <dt>Total</dt><dd><strong>{money(o.totalAmount)}</strong></dd>
            <dt>Payment</dt><dd>{o.paymentMethod === 'COD' ? 'Cash on delivery' : 'Online (demo)'} <StatusBadge status={o.paymentStatus} /></dd>
            <dt>Placed</dt><dd>{fmtTime(o.createdAt)}</dd>
            <dt>Deliver to</dt><dd>{o.deliveryAddress}</dd>
            <dt>Buyer phone</dt><dd>{isFarmer || user.role === 'admin' ? o.buyerPhone : 'Shared with the farmer'}</dd>
            {o.note && <><dt>Note</dt><dd>{o.note}</dd></>}
            <dt>{isFarmer ? 'Buyer' : 'Farmer'}</dt><dd>{user.role === 'admin' ? `${o.buyer?.name} → ${o.farmer?.name}` : other?.name}</dd>
          </dl>
          <div className="row">
            {isFarmer && o.status === 'pending' && <><button className="btn btn-primary" onClick={() => act('confirmed')}>Accept order</button><button className="btn btn-danger" onClick={() => act('rejected')}>Reject</button></>}
            {isFarmer && o.status === 'confirmed' && <button className="btn btn-accent" onClick={() => act('delivered')}>Mark as delivered</button>}
            {isBuyer && o.status === 'pending' && <button className="btn btn-ghost" onClick={() => act('cancelled')}>Cancel order</button>}
            {user.role !== 'admin' && <Link className="btn btn-ghost" to={`/messages/${other?._id}`}>Message {isFarmer ? 'buyer' : 'farmer'}</Link>}
            {user.role !== 'admin' && <Link className="btn btn-ghost" to="/complaints" state={{ orderId: o._id }}>Report a problem</Link>}
          </div>
        </div>
        <div className="card" style={{ alignSelf: 'start' }}>
          <h3>Progress</h3>
          <ul className="timeline">{o.statusHistory.map((h, i) => <li key={i}><StatusBadge status={h.status} /> <span className="muted small">{fmtTime(h.at)}</span></li>)}</ul>
        </div>
      </div>

      {isBuyer && o.status === 'delivered' && !o.reviewed && (
        <form className="card" style={{ marginTop: '1rem', maxWidth: 520 }} onSubmit={review}>
          <h3>Rate this order</h3>
          <div className="field"><label htmlFor="r">Rating</label>
            <select id="r" value={rev.rating} onChange={(e) => setRev({ ...rev, rating: e.target.value })}>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} {'★'.repeat(n)}</option>)}</select></div>
          <div className="field"><label htmlFor="c">Your feedback</label><textarea id="c" value={rev.comment} onChange={(e) => setRev({ ...rev, comment: e.target.value })} placeholder="Quality, packing, delivery, how the farmer behaved" /></div>
          <button className="btn btn-primary">Post review</button>
        </form>
      )}
      {done && <Alert type="success">{done}</Alert>}
      {isBuyer && o.reviewed && !done && <p className="muted">You have reviewed this order.</p>}
    </>
  );
}
