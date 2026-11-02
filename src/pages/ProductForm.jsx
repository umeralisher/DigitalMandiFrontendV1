import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, imgUrl, CATEGORIES, UNITS, getPosition } from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import Alert from '../components/Alert.jsx';

const today = () => new Date().toISOString().slice(0, 10);

export default function ProductForm() {
  const { id } = useParams();
  const editing = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: '', category: CATEGORIES[0], description: '', price: '', unit: 'kg', quantity: '',
    location: user.city || '', harvestDate: today(), lat: user.coords?.lat ?? '', lng: user.coords?.lng ?? '',
  });
  const [existing, setExisting] = useState([]);
  const [removed, setRemoved] = useState([]);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!editing) return;
    api.get(`/products/${id}`).then((p) => {
      setForm({
        name: p.name, category: p.category, description: p.description, price: p.price, unit: p.unit, quantity: p.quantity,
        location: p.location, harvestDate: (p.harvestDate || '').slice(0, 10),
        lat: p.geo?.coordinates?.[1] ?? '', lng: p.geo?.coordinates?.[0] ?? '',
      });
      setExisting(p.images);
    }).catch((e) => setError(e.message));
  }, [id, editing]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const room = 5 - (existing.length - removed.length);

  const pick = (e) => {
    const chosen = [...e.target.files].slice(0, Math.max(room, 0));
    setFiles(chosen);
  };

  const locate = async () => {
    try { const { lat, lng } = await getPosition(); setForm({ ...form, lat: lat.toFixed(5), lng: lng.toFixed(5) }); }
    catch (e) { setError(e.message); }
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      files.forEach((f) => fd.append('images', f));
      if (editing) { fd.append('removeImages', JSON.stringify(removed)); await api.put(`/products/${id}`, fd); }
      else await api.post('/products', fd);
      navigate('/farmer/products');
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <form className="card" style={{ maxWidth: 680, margin: '0 auto' }} onSubmit={submit}>
      <h2>{editing ? 'Edit product' : 'Add a product'}</h2>
      <Alert>{error}</Alert>
      <div className="field"><label htmlFor="name">Product name</label><input id="name" required value={form.name} onChange={set('name')} /></div>
      <div className="grid grid-2">
        <div className="field"><label htmlFor="cat">Category</label><select id="cat" value={form.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div className="field"><label htmlFor="unit">Selling unit</label><select id="unit" value={form.unit} onChange={set('unit')}>{UNITS.map((u) => <option key={u}>{u}</option>)}</select></div>
        <div className="field"><label htmlFor="price">Price per unit (Rs)</label><input id="price" type="number" min="0" step="any" required value={form.price} onChange={set('price')} /></div>
        <div className="field"><label htmlFor="qty">Quantity in stock</label><input id="qty" type="number" min="0" step="any" required value={form.quantity} onChange={set('quantity')} /></div>
        <div className="field"><label htmlFor="loc">Location</label><input id="loc" required placeholder="e.g. Sahiwal, Punjab" value={form.location} onChange={set('location')} /></div>
        <div className="field"><label htmlFor="hd">Harvest date</label><input id="hd" type="date" max={today()} value={form.harvestDate} onChange={set('harvestDate')} /></div>
      </div>
      <div className="field"><label htmlFor="desc">Description</label><textarea id="desc" value={form.description} onChange={set('description')} placeholder="Variety, grade, packing, anything a buyer should know" /></div>
      <div className="field">
        <button type="button" className="btn btn-ghost btn-sm" onClick={locate}>Pin my current location</button>
        <p className="small muted">{form.lat !== '' ? `Pinned at ${form.lat}, ${form.lng}. Buyers searching “near me” will find this listing.` : 'Pin a location so nearby buyers can find you.'}</p>
      </div>
      <div className="field">
        <label htmlFor="imgs">Photos (up to 5, JPG/PNG/WEBP, 5 MB each)</label>
        {existing.length > 0 && (
          <div className="previews">{existing.filter((u) => !removed.includes(u)).map((u) => (
            <figure key={u}><img src={imgUrl(u)} alt="" /><button type="button" aria-label="Remove photo" onClick={() => setRemoved([...removed, u])}>×</button></figure>))}</div>)}
        <input id="imgs" type="file" accept="image/png,image/jpeg,image/webp" multiple disabled={room <= 0} onChange={pick} />
        {files.length > 0 && <div className="previews">{files.map((f) => <figure key={f.name + f.size}><img src={URL.createObjectURL(f)} alt="" /></figure>)}</div>}
      </div>
      <div className="row"><button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Publish listing'}</button>
        <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button></div>
    </form>
  );
}
