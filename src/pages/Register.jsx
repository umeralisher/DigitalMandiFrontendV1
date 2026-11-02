import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Alert from '../components/Alert.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ role: 'buyer', name: '', email: '', phone: '', city: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const u = await register(form);
      navigate(u.role === 'farmer' ? '/profile' : '/products', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card form-card">
      <h2>Create your account</h2>
      <Alert>{error}</Alert>
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="role">I want to</label>
          <select id="role" value={form.role} onChange={set('role')}>
            <option value="buyer">Buy produce</option>
            <option value="farmer">Sell my produce (farmer)</option>
          </select>
        </div>
        <div className="field"><label htmlFor="name">Full name</label><input id="name" required value={form.name} onChange={set('name')} /></div>
        <div className="field"><label htmlFor="email">Email</label><input id="email" type="email" required value={form.email} onChange={set('email')} /></div>
        <div className="field"><label htmlFor="phone">Mobile number</label><input id="phone" required placeholder="03xx xxxxxxx" value={form.phone} onChange={set('phone')} /></div>
        <div className="field"><label htmlFor="city">City or village</label><input id="city" value={form.city} onChange={set('city')} /></div>
        <div className="field"><label htmlFor="password">Password (6+ characters)</label><input id="password" type="password" minLength={6} required value={form.password} onChange={set('password')} /></div>
        {form.role === 'farmer' && <Alert type="info">Farmer accounts are checked by an admin before you can list produce.</Alert>}
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
      </form>
      <p className="muted small">Already registered? <Link to="/login">Log in</Link></p>
    </div>
  );
}
