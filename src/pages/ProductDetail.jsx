import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, imgUrl, money, fmtDate, CATEGORY_ICON } from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import Stars from '../components/Stars.jsx';
import Alert from '../components/Alert.jsx';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [p, setP] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [img, setImg] = useState(0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ quantity: 1, deliveryAddress: '', buyerPhone: '', note: '', paymentMethod: 'COD' });

  useEffect(() => {
    api.get(`/products/${id}`).then(setP).catch((e) => setError(e.message));
    api.get(`/reviews/product/${id}`).then(setReviews).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (user?.role === 'buyer') setForm((f) => ({ ...f, deliveryAddress: f.deliveryAddress || [user.address, user.city].filter(Boolean).join(', '), buyerPhone: f.buyerPhone || user.phone }));
  }, [user]);

  if (error && !p) return <Alert>{error}</Alert>;
  if (!p) return <p className="muted pad">Loading…</p>;

  const total = (Number(form.quantity) || 0) * p.price;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const order = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const o = await api.post('/orders', { ...form, productId: p._id, quantity: Number(form.quantity) });
      navigate(`/orders/${o._id}`, { state: { placed: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="detail">
        <div>
          <div className="gallery-main">
            {p.images[img] ? <img src={imgUrl(p.images[img])} alt={p.name} /> : <span className="ph" style={{ fontSize: '5rem' }}>{CATEGORY_ICON[p.category]}</span>}
          </div>
          {p.images.length > 1 && (
            <div className="thumbs">
              {p.images.map((u, i) => (
                <button key={u} className={i === img ? 'active' : ''} onClick={() => setImg(i)} aria-label={`Photo ${i + 1}`}><img src={imgUrl(u)} alt="" /></button>
              ))}
            </div>
          )}
        </div>

        <div className="stack">
          <div>
            <h1 style={{ fontSize: '2rem' }}>{p.name}</h1>
            {!p.isActive && <Alert type="info">This listing is hidden from buyers.</Alert>}
            <p className="price" style={{ fontSize: '1.6rem' }}>{money(p.price)} <small>per {p.unit}</small></p>
            <Stars value={p.ratingAvg} count={p.ratingCount} />
          </div>
          <p>{p.description || 'No description added.'}</p>
          <dl className="facts">
            <dt>Category</dt><dd>{p.category}</dd>
            <dt>In stock</dt><dd>{p.quantity > 0 ? `${p.quantity} ${p.unit}` : 'Sold out'}</dd>
            <dt>Location</dt><dd>{p.location}</dd>
            <dt>Harvested</dt><dd>{fmtDate(p.harvestDate)}</dd>
            <dt>Farmer</dt><dd><Link to={`/farmers/${p.farmer._id}`}>{p.farmer.name}</Link>{p.farmer.farm?.name && ` · ${p.farmer.farm.name}`}</dd>
          </dl>

          {user?.role === 'buyer' && (
            <>
              <form className="card" onSubmit={order}>
                <h3>Order this</h3>
                <Alert>{error}</Alert>
                <div className="field"><label htmlFor="qty">Quantity ({p.unit})</label>
                  <input id="qty" type="number" min="1" max={p.quantity} step="any" required value={form.quantity} onChange={set('quantity')} disabled={p.quantity <= 0} /></div>
                <div className="field"><label htmlFor="addr">Delivery address</label><textarea id="addr" required value={form.deliveryAddress} onChange={set('deliveryAddress')} /></div>
                <div className="field"><label htmlFor="ph">Phone for delivery</label><input id="ph" required value={form.buyerPhone} onChange={set('buyerPhone')} /></div>
                <div className="field"><label htmlFor="pay">Payment</label>
                  <select id="pay" value={form.paymentMethod} onChange={set('paymentMethod')}>
                    <option value="COD">Cash on delivery</option><option value="ONLINE">Pay online (demo gateway)</option></select></div>
                <div className="field"><label htmlFor="note">Note to farmer (optional)</label><input id="note" value={form.note} onChange={set('note')} /></div>
                <p className="row between"><span>Total</span><strong style={{ fontSize: '1.25rem' }}>{money(total)}</strong></p>
                <button className="btn btn-primary" disabled={busy || p.quantity <= 0}>{busy ? 'Placing order…' : 'Place order'}</button>
              </form>
              <Link className="btn btn-ghost" to={`/messages/${p.farmer._id}`} state={{ prefill: `Hello, I am interested in your ${p.name}.` }}>Message farmer</Link>
            </>
          )}
          {!user && <Alert type="info"><Link to="/login" state={{ from: `/products/${p._id}` }}>Log in</Link> or <Link to="/register">register</Link> as a buyer to order or message the farmer.</Alert>}
          {user?.role === 'farmer' && String(user._id) === String(p.farmer._id) && <Link className="btn btn-ghost" to={`/farmer/products/${p._id}/edit`}>Edit this listing</Link>}
        </div>
      </div>

      <section className="block">
        <h2>Reviews</h2>
        {reviews.length === 0 ? <div className="empty">No reviews yet. Buyers can review after delivery.</div> : reviews.map((r) => (
          <div className="review" key={r._id}>
            <Stars value={r.rating} count={1} /> <strong>{r.buyer?.name}</strong> <span className="muted small">{fmtDate(r.createdAt)}</span>
            {r.comment && <p style={{ margin: '.25rem 0 0' }}>{r.comment}</p>}
          </div>
        ))}
      </section>
    </>
  );
}
