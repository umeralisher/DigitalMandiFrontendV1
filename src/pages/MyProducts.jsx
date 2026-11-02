import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, imgUrl, money, CATEGORY_ICON } from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import Alert from '../components/Alert.jsx';

export default function MyProducts() {
  const { user } = useAuth();
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  const load = () => api.get('/products/mine').then(setItems).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try { await api.del(`/products/${p._id}`); load(); } catch (e) { setError(e.message); }
  };

  return (
    <>
      <div className="row between"><h2>My listings</h2>
        {user.status === 'approved' && <Link to="/farmer/products/new" className="btn btn-primary">Add product</Link>}</div>
      {user.status !== 'approved' && <Alert type="info">Your account is waiting for admin approval. You can add listings once it is approved.</Alert>}
      <Alert>{error}</Alert>
      {!items ? <p className="muted">Loading…</p> : items.length === 0 ? (
        <div className="empty">You have no listings yet. Add your first product to start receiving orders.</div>
      ) : (
        <div className="table-wrap"><table className="t">
          <thead><tr><th></th><th>Product</th><th>Price</th><th>Stock</th><th>Location</th><th>Visibility</th><th></th></tr></thead>
          <tbody>{items.map((p) => (
            <tr key={p._id}>
              <td style={{ width: 70 }}>{p.images[0] ? <img src={imgUrl(p.images[0])} alt="" style={{ width: 60, height: 46, objectFit: 'cover', borderRadius: 6 }} /> : <span style={{ fontSize: '1.8rem' }}>{CATEGORY_ICON[p.category]}</span>}</td>
              <td><Link to={`/products/${p._id}`}>{p.name}</Link><div className="muted small">{p.category}</div></td>
              <td>{money(p.price)} / {p.unit}</td>
              <td>{p.quantity > 0 ? `${p.quantity} ${p.unit}` : <span className="status status-rejected">Sold out</span>}</td>
              <td>{p.location}</td>
              <td>{p.isActive ? 'Visible' : <span className="status status-rejected">Hidden by admin</span>}</td>
              <td><div className="row"><Link to={`/farmer/products/${p._id}/edit`} className="btn btn-ghost btn-sm">Edit</Link><button className="btn btn-danger btn-sm" onClick={() => remove(p)}>Delete</button></div></td>
            </tr>))}
          </tbody></table></div>
      )}
    </>
  );
}
