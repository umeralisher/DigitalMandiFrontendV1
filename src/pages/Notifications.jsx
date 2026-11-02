import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, fmtTime } from '../api';

export default function Notifications() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  const load = () => api.get('/notifications').then(setData).catch(() => setData({ items: [], unread: 0 }));
  useEffect(() => { load(); }, []);

  const open = async (n) => {
    if (!n.read) await api.patch(`/notifications/${n._id}/read`).catch(() => {});
    if (n.link) navigate(n.link); else load();
  };
  const readAll = async () => { await api.patch('/notifications/read-all'); load(); };

  if (!data) return <p className="muted pad">Loading…</p>;
  return (
    <>
      <div className="row between"><h2>Alerts</h2>{data.unread > 0 && <button className="btn btn-ghost btn-sm" onClick={readAll}>Mark all as read</button>}</div>
      {data.items.length === 0 ? <div className="empty">You are all caught up. Order, message and account updates show up here.</div> :
        data.items.map((n) => (
          <a key={n._id} href={n.link || '#'} className={`note-item ${n.read ? '' : 'unread'}`} onClick={(e) => { e.preventDefault(); open(n); }}>
            <strong>{n.title}</strong><div>{n.message}</div><div className="muted small">{fmtTime(n.updatedAt || n.createdAt)}</div>
          </a>))}
    </>
  );
}
