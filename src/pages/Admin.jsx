import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money, fmtDate } from '../api';
import Alert from '../components/Alert.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

function Overview() {
  const [s, setS] = useState(null);
  useEffect(() => { api.get('/admin/stats').then(setS).catch(() => {}); }, []);
  if (!s) return <p className="muted">Loading…</p>;
  const cards = [
    ['Farmers', s.farmers], ['Awaiting approval', s.pendingFarmers], ['Buyers', s.buyers], ['Listings', s.products],
    ['Orders', s.orders], ['Open complaints', s.openComplaints], ['Delivered value', money(s.deliveredValue)],
  ];
  return (
    <>
      <div className="stat-grid">{cards.map(([l, v]) => <div className="stat" key={l}><b>{v}</b><span className="muted">{l}</span></div>)}</div>
      <h3 style={{ marginTop: '1.5rem' }}>Orders by status</h3>
      <div className="row">{Object.entries(s.ordersByStatus).map(([k, v]) => <span key={k}><StatusBadge status={k} /> {v}</span>)}</div>
    </>
  );
}

function Users() {
  const [list, setList] = useState(null);
  const [f, setF] = useState({ role: '', status: '', q: '' });
  const [error, setError] = useState('');
  const load = () => api.get(`/admin/users?${new URLSearchParams(Object.entries(f).filter(([, v]) => v))}`).then(setList).catch((e) => setError(e.message));
  useEffect(() => { load(); }, [f.role, f.status]); // eslint-disable-line
  const setStatus = async (u, status) => { try { await api.patch(`/admin/users/${u._id}/status`, { status }); load(); } catch (e) { setError(e.message); } };
  return (
    <>
      <form className="row" onSubmit={(e) => { e.preventDefault(); load(); }}>
        <input style={{ maxWidth: 240 }} placeholder="Search name, email, phone" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
        <select style={{ maxWidth: 140 }} value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}><option value="">All roles</option><option value="farmer">Farmers</option><option value="buyer">Buyers</option></select>
        <select style={{ maxWidth: 160 }} value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}><option value="">Any status</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="blocked">Blocked</option></select>
        <button className="btn btn-ghost btn-sm">Search</button>
      </form>
      <Alert>{error}</Alert>
      {!list ? <p className="muted">Loading…</p> : list.length === 0 ? <div className="empty">No users match.</div> : (
        <div className="table-wrap" style={{ marginTop: '.75rem' }}><table className="t">
          <thead><tr><th>Name</th><th>Role</th><th>Contact</th><th>City</th><th>Joined</th><th>Status</th><th></th></tr></thead>
          <tbody>{list.map((u) => (
            <tr key={u._id}><td>{u.role === 'farmer' ? <Link to={`/farmers/${u._id}`}>{u.name}</Link> : u.name}</td><td>{u.role}</td><td>{u.email}<div className="muted small">{u.phone}</div></td><td>{u.city}</td><td>{fmtDate(u.createdAt)}</td><td><StatusBadge status={u.status} /></td>
              <td><div className="row">
                {u.status !== 'approved' && <button className="btn btn-primary btn-sm" onClick={() => setStatus(u, 'approved')}>{u.status === 'blocked' ? 'Unblock' : 'Approve'}</button>}
                {u.status !== 'blocked' && <button className="btn btn-danger btn-sm" onClick={() => window.confirm(`Block ${u.name}?`) && setStatus(u, 'blocked')}>Block</button>}
              </div></td></tr>))}
          </tbody></table></div>)}
    </>
  );
}

function Listings() {
  const [list, setList] = useState(null);
  const [q, setQ] = useState('');
  const [error, setError] = useState('');
  const load = () => api.get(`/admin/products?q=${encodeURIComponent(q)}`).then(setList).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []); // eslint-disable-line
  const toggle = async (p) => { try { await api.patch(`/admin/products/${p._id}/active`, { isActive: !p.isActive }); load(); } catch (e) { setError(e.message); } };
  const remove = async (p) => { if (window.confirm(`Delete "${p.name}" permanently?`)) { try { await api.del(`/products/${p._id}`); load(); } catch (e) { setError(e.message); } } };
  return (
    <>
      <form className="row" onSubmit={(e) => { e.preventDefault(); load(); }}><input style={{ maxWidth: 260 }} placeholder="Search listings" value={q} onChange={(e) => setQ(e.target.value)} /><button className="btn btn-ghost btn-sm">Search</button></form>
      <Alert>{error}</Alert>
      {!list ? <p className="muted">Loading…</p> : list.length === 0 ? <div className="empty">No listings.</div> : (
        <div className="table-wrap" style={{ marginTop: '.75rem' }}><table className="t">
          <thead><tr><th>Product</th><th>Farmer</th><th>Price</th><th>Stock</th><th>Visible</th><th></th></tr></thead>
          <tbody>{list.map((p) => (
            <tr key={p._id}><td><Link to={`/products/${p._id}`}>{p.name}</Link><div className="muted small">{p.category} · {p.location}</div></td><td>{p.farmer?.name}</td><td>{money(p.price)}/{p.unit}</td><td>{p.quantity}</td><td>{p.isActive ? 'Yes' : 'Hidden'}</td>
              <td><div className="row"><button className="btn btn-ghost btn-sm" onClick={() => toggle(p)}>{p.isActive ? 'Hide' : 'Show'}</button><button className="btn btn-danger btn-sm" onClick={() => remove(p)}>Delete</button></div></td></tr>))}
          </tbody></table></div>)}
    </>
  );
}

function ComplaintsAdmin() {
  const [list, setList] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [error, setError] = useState('');
  const load = () => api.get('/admin/complaints').then(setList).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);
  const update = async (c, status) => {
    try { await api.patch(`/admin/complaints/${c._id}`, { status, adminResponse: drafts[c._id] ?? c.adminResponse }); load(); } catch (e) { setError(e.message); }
  };
  if (!list) return <p className="muted">Loading…</p>;
  if (list.length === 0) return <div className="empty">No complaints or disputes.</div>;
  return (
    <>
      <Alert>{error}</Alert>
      {list.map((c) => (
        <div className="card" key={c._id} style={{ marginBottom: '.75rem' }}>
          <div className="row between"><strong>{c.subject}</strong><StatusBadge status={c.status} /></div>
          <p className="muted small">{c.type} · from {c.user?.name} ({c.user?.role}){c.against && ` · against ${c.against.name}`}{c.order && ` · ${c.order.orderNumber}`} · {fmtDate(c.createdAt)}</p>
          <p>{c.description}</p>
          <div className="field"><label htmlFor={`r${c._id}`}>Response to user</label>
            <textarea id={`r${c._id}`} value={drafts[c._id] ?? c.adminResponse} onChange={(e) => setDrafts({ ...drafts, [c._id]: e.target.value })} /></div>
          <div className="row">
            <button className="btn btn-ghost btn-sm" onClick={() => update(c, 'in_review')}>Mark in review</button>
            <button className="btn btn-primary btn-sm" onClick={() => update(c, 'resolved')}>Resolve</button>
            <button className="btn btn-danger btn-sm" onClick={() => update(c, 'rejected')}>Reject</button>
          </div>
        </div>))}
    </>
  );
}

export default function Admin() {
  const [tab, setTab] = useState('overview');
  const tabs = { overview: <Overview />, users: <Users />, listings: <Listings />, complaints: <ComplaintsAdmin /> };
  return (
    <>
      <h2>Admin dashboard</h2>
      <div className="tabs">{Object.keys(tabs).map((t) => <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} style={{ textTransform: 'capitalize' }}>{t}</button>)}</div>
      {tabs[tab]}
    </>
  );
}
