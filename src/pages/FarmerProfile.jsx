import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, fmtDate } from '../api';
import ProductCard from '../components/ProductCard.jsx';
import Stars from '../components/Stars.jsx';
import Alert from '../components/Alert.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function FarmerProfile() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const [data, setData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/users/${id}/public`).then(setData).catch((e) => setError(e.message));
    api.get(`/reviews/farmer/${id}`).then(setReviews).catch(() => {});
  }, [id]);

  if (error) return <Alert>{error}</Alert>;
  if (!data) return <p className="muted pad">Loading…</p>;
  const { user, products } = data;
  const f = user.farm || {};

  return (
    <>
      <div className="card">
        <h1 style={{ fontSize: '2rem' }}>{f.name || user.name}</h1>
        <p className="muted">{user.name}{user.city && ` · ${user.city}`} · Member since {fmtDate(user.createdAt)}</p>
        <Stars value={user.ratingAvg} count={user.ratingCount} />
        {f.size && <p><strong>Farm size:</strong> {f.size}</p>}
        {f.crops?.length > 0 && <p><strong>Grows:</strong> {f.crops.join(', ')}</p>}
        {f.description && <p>{f.description}</p>}
        {me?.role === 'buyer' && <Link className="btn btn-primary" to={`/messages/${user._id}`}>Message this farmer</Link>}
      </div>
      <section className="block">
        <h2>Listings</h2>
        {products.length === 0 ? <div className="empty">No active listings.</div> : <div className="grid grid-cards">{products.map((p) => <ProductCard key={p._id} p={{ ...p, farmer: user }} />)}</div>}
      </section>
      <section className="block">
        <h2>Buyer reviews</h2>
        {reviews.length === 0 ? <div className="empty">No reviews yet.</div> : reviews.map((r) => (
          <div className="review" key={r._id}><Stars value={r.rating} count={1} /> <strong>{r.buyer?.name}</strong> on {r.product?.name}
            {r.comment && <p style={{ margin: '.25rem 0 0' }}>{r.comment}</p>}</div>
        ))}
      </section>
    </>
  );
}
