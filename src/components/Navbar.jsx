import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  // FR9: poll for new notifications
  useEffect(() => {
    if (!user) return setUnread(0);
    let stop = false;
    const load = () =>
      api.get('/notifications').then((d) => !stop && setUnread(d.unread)).catch(() => {});
    load();
    const t = setInterval(load, 15000);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, [user]);

  const go = () => setOpen(false);
  const doLogout = () => {
    logout();
    go();
    navigate('/');
  };

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand" onClick={go}>
          <span className="brand-mark">DM</span> Digital Mandi
        </Link>
        <button className="nav-toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
          Menu
        </button>
        <nav className={`nav-links ${open ? 'open' : ''}`} onClick={go}>
          <NavLink to="/products">Market</NavLink>
          {user?.role === 'farmer' && <NavLink to="/farmer/products">My listings</NavLink>}
          {user && user.role !== 'admin' && <NavLink to="/orders">{user.role === 'farmer' ? 'Incoming orders' : 'My orders'}</NavLink>}
          {user && <NavLink to="/messages">Messages</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
          <span className="spacer" />
          {user ? (
            <>
              <NavLink to="/notifications" className="bell">
                Alerts{unread > 0 && <span className="badge">{unread > 99 ? '99+' : unread}</span>}
              </NavLink>
              <NavLink to="/profile">{user.name.split(' ')[0]}</NavLink>
              <button className="btn btn-ghost btn-sm" onClick={doLogout}>Log out</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <Link to="/register" className="btn btn-primary btn-sm">Join free</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
