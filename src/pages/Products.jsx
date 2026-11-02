import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, toQuery, CATEGORIES, getPosition } from '../api';
import ProductCard from '../components/ProductCard.jsx';
import Alert from '../components/Alert.jsx';

const EMPTY = { q: '', category: '', location: '', minPrice: '', maxPrice: '', inStock: '', freshDays: '', sort: 'newest', lat: '', lng: '', radius: '50' };

export default function Products() {
  const [params, setParams] = useSearchParams();
  const applied = { ...EMPTY, ...Object.fromEntries(params) };
  const [form, setForm] = useState(applied);
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const page = Number(params.get('page') || 1);

  useEffect(() => setForm({ ...EMPTY, ...Object.fromEntries(params) }), [params]); // eslint-disable-line

  useEffect(() => {
    setLoading(true);
    setError('');
    const q = toQuery({ ...applied, page, limit: 12, radius: applied.lat ? applied.radius : '' });
    api.get(`/products?${q}`).then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [params]); // eslint-disable-line

  const set = (k) => (e) => setForm({ ...form, [k]: e.type === 'change' && e.target.type === 'checkbox' ? (e.target.checked ? 'true' : '') : e.target.value });
  const apply = (e) => { e?.preventDefault(); setParams(toQuery({ ...form, radius: form.lat ? form.radius : '', sort: form.sort === 'newest' ? '' : form.sort })); };
  const reset = () => setParams({});
  const goPage = (p) => { const n = new URLSearchParams(params); n.set('page', p); setParams(n); window.scrollTo({ top: 0 }); };

  const nearMe = async () => {
    try {
      const { lat, lng } = await getPosition();
      setParams(toQuery({ ...form, lat: lat.toFixed(5), lng: lng.toFixed(5), radius: form.radius || '50', sort: '' }));
    } catch (e) { setError(e.message); }
  };

  return (
    <>
      <h2>Market</h2>
      <div className="market">
        <form className="card filters" onSubmit={apply}>
          <div className="field"><label htmlFor="q">Search</label><input id="q" placeholder="Potato, mango, wheat…" value={form.q} onChange={set('q')} /></div>
          <div className="field"><label htmlFor="cat">Category</label>
            <select id="cat" value={form.category} onChange={set('category')}><option value="">All categories</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div className="field"><label htmlFor="loc">Location</label><input id="loc" placeholder="City or area" value={form.location} onChange={set('location')} /></div>
          <div className="row" style={{ flexWrap: 'nowrap' }}>
            <div className="field"><label htmlFor="minp">Min price</label><input id="minp" type="number" min="0" value={form.minPrice} onChange={set('minPrice')} /></div>
            <div className="field"><label htmlFor="maxp">Max price</label><input id="maxp" type="number" min="0" value={form.maxPrice} onChange={set('maxPrice')} /></div>
          </div>
          <div className="field"><label htmlFor="fresh">Freshness</label>
            <select id="fresh" value={form.freshDays} onChange={set('freshDays')}>
              <option value="">Any harvest date</option><option value="2">Harvested in last 2 days</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option></select></div>
          <div className="field"><label className="check"><input type="checkbox" checked={form.inStock === 'true'} onChange={set('inStock')} /> In stock only</label></div>
          <div className="field"><label htmlFor="sort">Sort by</label>
            <select id="sort" value={form.sort} onChange={set('sort')} disabled={!!applied.lat}>
              <option value="newest">Newest</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option><option value="rating">Best rated</option></select></div>
          <div className="row"><button className="btn btn-primary btn-sm">Apply</button><button type="button" className="btn btn-ghost btn-sm" onClick={reset}>Clear</button></div>
          <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: '1rem 0' }} />
          <button type="button" className="btn btn-accent btn-sm" onClick={nearMe}>Find produce near me</button>
          {applied.lat && (
            <div className="field" style={{ marginTop: '.75rem' }}>
              <label htmlFor="rad">Within (km)</label>
              <select id="rad" value={form.radius} onChange={(e) => setParams(toQuery({ ...applied, radius: e.target.value }))}>
                {[10, 25, 50, 100, 200].map((r) => <option key={r} value={r}>{r} km</option>)}</select>
              <p className="small muted">Showing nearest first.</p>
            </div>
          )}
        </form>

        <div>
          <Alert>{error}</Alert>
          <p className="muted small">{loading ? 'Loading…' : `${data.total} result${data.total === 1 ? '' : 's'}`}</p>
          {!loading && data.items.length === 0 ? (
            <div className="empty">No produce matches these filters. Try a wider price range or clear the filters.</div>
          ) : (
            <div className="grid grid-cards">{data.items.map((p) => <ProductCard key={p._id} p={p} />)}</div>
          )}
          {data.pages > 1 && (
            <div className="pager">
              <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => goPage(page - 1)}>Previous</button>
              <span className="small">Page {page} of {data.pages}</span>
              <button className="btn btn-ghost btn-sm" disabled={page >= data.pages} onClick={() => goPage(page + 1)}>Next</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
