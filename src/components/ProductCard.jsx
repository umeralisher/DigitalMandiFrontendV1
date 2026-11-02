import { Link } from 'react-router-dom';
import { imgUrl, money, CATEGORY_ICON } from '../api';
import Stars from './Stars.jsx';

export default function ProductCard({ p }) {
  const out = p.quantity <= 0;
  return (
    <Link to={`/products/${p._id}`} className="pcard">
      <div className="pcard-img">
        {p.images?.[0] ? <img src={imgUrl(p.images[0])} alt={p.name} loading="lazy" /> : <span className="ph">{CATEGORY_ICON[p.category] || '🧺'}</span>}
        {out && <span className="tag tag-out">Sold out</span>}
      </div>
      <div className="pcard-body">
        <h3>{p.name}</h3>
        <p className="price">
          {money(p.price)} <small>per {p.unit}</small>
        </p>
        <p className="muted small">
          {p.location}
          {p.distanceKm !== undefined && ` · ${p.distanceKm} km away`}
        </p>
        <p className="small">
          {p.farmer?.name} <Stars value={p.ratingAvg} count={p.ratingCount} />
        </p>
      </div>
    </Link>
  );
}
