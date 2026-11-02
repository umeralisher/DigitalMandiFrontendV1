import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api, fmtDate } from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import Alert from '../components/Alert.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function Complaints() {
  const { user } = useAuth();
  const location = useLocation();
  const [list, setList] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ type: 'complaint', subject: '', description: '', orderId: location.state?.orderId || '' });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const load = () => api.get('/complaints/mine').then(setList).catch(() => {});

  useEffect(() => {
    load();
    if (user.role !== 'admin') api.get('/orders').then(setOrders).catch(() => {});
  }, []); // eslint-disable-line

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/complaints', form);
      setForm({ type: 'complaint', subject: '', description: '', orderId: '' });
      setMsg({ type: 'success', text: 'Sent to the admin team. You will get an alert when they respond.' });
      load();
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
  };

  return (
    <>
      <h2>Complaints and feedback</h2>
      <div className="grid grid-2">
        <form className="card" onSubmit={submit}>
          <Alert type={msg.type}>{msg.text}</Alert>
          <div className="field"><label htmlFor="t">Type</label>
            <select id="t" value={form.type} onChange={set('type')}><option value="complaint">Complaint</option><option value="dispute">Order dispute</option><option value="feedback">Feedback about the service</option></select></div>
          <div className="field"><label htmlFor="o">Related order (optional)</label>
            <select id="o" value={form.orderId} onChange={set('orderId')}><option value="">None</option>{orders.map((o) => <option key={o._id} value={o._id}>{o.orderNumber} · {o.productName}</option>)}</select></div>
          <div className="field"><label htmlFor="s">Subject</label><input id="s" required value={form.subject} onChange={set('subject')} /></div>
          <div className="field"><label htmlFor="d">What happened?</label><textarea id="d" required value={form.description} onChange={set('description')} /></div>
          <button className="btn btn-primary">Send to admin</button>
        </form>
        <div>
          <h3>Your submissions</h3>
          {list.length === 0 ? <div className="empty">Nothing submitted yet.</div> : list.map((c) => (
            <div className="card" key={c._id} style={{ marginBottom: '.75rem' }}>
              <div className="row between"><strong>{c.subject}</strong><StatusBadge status={c.status} /></div>
              <p className="muted small">{c.type} · {fmtDate(c.createdAt)}{c.order && ` · ${c.order.orderNumber}`}</p>
              <p>{c.description}</p>
              {c.adminResponse && <Alert type="info"><strong>Admin:</strong> {c.adminResponse}</Alert>}
            </div>))}
        </div>
      </div>
    </>
  );
}
