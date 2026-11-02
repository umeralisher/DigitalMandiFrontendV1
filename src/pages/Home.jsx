import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money, CATEGORIES, CATEGORY_ICON } from '../api';
import ProductCard from '../components/ProductCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Home() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get('/products?limit=8').then((d) => setItems(d.items)).catch(() => {});
  }, []);

  return (
    <>
      <section className="hero">
        <div>
          <h1>Sell straight from the field. Buy straight from the farmer.</h1>
          <p className="lead">
            Digital Mandi lets farmers list produce at their own price and lets buyers order it directly. No arhti, no
            commission, no trip to the mandi.
          </p>
          <div className="row">
            <Link to="/products" className="btn btn-primary">Browse produce</Link>
            {!user && <Link to="/register" className="btn btn-accent">Start selling</Link>}
          </div>
        </div>
        <div className="board" aria-label="Latest rates from farmers">
          <h2>Today’s rates from farmers</h2>
          {items.length === 0 ? (
            <p className="muted">No listings yet. Be the first farmer to post a rate.</p>
          ) : (
            <table>
              <tbody>
                {items.slice(0, 6).map((p) => (
                  <tr key={p._id}>
                    <td>
                      <Link to={`/products/${p._id}`}>{p.name}</Link>
                      <div className="small" style={{ color: '#9fb3a5' }}>{p.location}</div>
                    </td>
                    <td>{money(p.price)}<span className="small" style={{ color: '#9fb3a5', fontWeight: 400 }}> /{p.unit.split(' ')[0]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className="block">
        <h2>Shop by category</h2>
        <div className="chips">
          {CATEGORIES.map((c) => (
            <Link key={c} className="chip" to={`/products?category=${c}`}>{CATEGORY_ICON[c]} {c}</Link>
          ))}
        </div>
      </section>

      <section className="block">
        <div className="row between"><h2>Fresh listings</h2><Link to="/products">See all</Link></div>
        {items.length === 0 ? <div className="empty">Nothing listed yet.</div> : (
          <div className="grid grid-cards">{items.map((p) => <ProductCard key={p._id} p={p} />)}</div>
        )}
      </section>

      <section className="block">
        <h2>How it works</h2>
        <ol className="steps">
          <li><h3>Farmers list produce</h3><p className="muted">Add photos, your price, stock and harvest date.</p></li>
          <li><h3>Buyers search and order</h3><p className="muted">Filter by price, freshness or distance, then order in a minute.</p></li>
          <li><h3>Agree, deliver, pay</h3><p className="muted">Chat to settle details. Pay cash on delivery or online.</p></li>
        </ol>
      </section>
    </>
  );
}
