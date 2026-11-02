import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { api, fmtTime } from '../api';
import Alert from '../components/Alert.jsx';
import { useAuth } from '../context/AuthContext.jsx';

// FR7: simple chat between buyer and farmer (refreshes every few seconds)
export default function Messages() {
  const { userId } = useParams();
  const location = useLocation();
  const [convos, setConvos] = useState([]);
  const [thread, setThread] = useState(null);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const bottom = useRef(null);
  const { user } = useAuth();
  const meId = user._id;

  const loadConvos = () => api.get('/messages/conversations').then(setConvos).catch(() => {});
  const loadThread = () => userId && api.get(`/messages/with/${userId}`).then((d) => { setThread(d); setError(''); }).catch((e) => setError(e.message));

  useEffect(() => { setThread(null); setText(location.state?.prefill || ''); loadThread(); loadConvos(); }, [userId]); // eslint-disable-line
  useEffect(() => {
    const t = setInterval(() => { loadThread(); loadConvos(); }, 4000);
    return () => clearInterval(t);
  }, [userId]); // eslint-disable-line
  useEffect(() => { bottom.current?.scrollIntoView({ block: 'end' }); }, [thread?.messages?.length]);

  const send = async (payload) => {
    try { await api.post(`/messages/with/${userId}`, payload); setText(''); await loadThread(); loadConvos(); }
    catch (e) { setError(e.message); }
  };

  return (
    <>
      <h2>Messages</h2>
      <div className="chat">
        <div className="convos">
          {convos.length === 0 && <p className="muted small" style={{ padding: '1rem' }}>No conversations yet. Open a product and choose “Message farmer”.</p>}
          {convos.map((c) => (
            <Link key={c.user._id} to={`/messages/${c.user._id}`} className={`convo ${c.user._id === userId ? 'active' : ''}`}>
              <div className="row between"><strong>{c.user.name}</strong>{c.unread > 0 && <span className="badge">{c.unread}</span>}</div>
              <div className="muted small" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.lastMessage}</div>
            </Link>
          ))}
        </div>
        {!userId ? <div className="empty">Select a conversation.</div> : (
          <div className="thread">
            <div className="thread-head"><strong>{thread?.peer?.name || 'Conversation'}</strong> <span className="muted small">{thread?.peer?.role}{thread?.peer?.city && ` · ${thread.peer.city}`}</span></div>
            <div className="msgs">
              {error && <Alert>{error}</Alert>}
              {thread?.messages.length === 0 && <p className="muted small">Say hello to start the conversation.</p>}
              {thread?.messages.map((m) => (
                <div key={m._id} className={`bubble ${String(m.sender) === String(meId) ? 'me' : ''}`}>{m.text}<time>{fmtTime(m.createdAt)}</time></div>
              ))}
              <div ref={bottom} />
            </div>
            <form className="composer" onSubmit={(e) => { e.preventDefault(); if (text.trim()) send({ text }); }}>
              <input aria-label="Message" placeholder="Type a message" value={text} onChange={(e) => setText(e.target.value)} />
              <button className="btn btn-primary">Send</button>
              <button type="button" className="btn btn-ghost" title="Send your phone and email" onClick={() => send({ shareContact: true })}>Share contact</button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
