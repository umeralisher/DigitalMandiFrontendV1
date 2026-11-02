import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api, getPosition } from '../api';
import Alert from '../components/Alert.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user.name, phone: user.phone, address: user.address || '', city: user.city || '',
    coords: user.coords || null,
    farm: { name: user.farm?.name || '', size: user.farm?.size || '', crops: (user.farm?.crops || []).join(', '), description: user.farm?.description || '' },
  });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setFarm = (k) => (e) => setForm({ ...form, farm: { ...form.farm, [k]: e.target.value } });

  const save = async (e) => {
    e.preventDefault();
    try {
      const body = { ...form };
      if (user.role !== 'farmer') delete body.farm;
      const { user: u } = await api.put('/users/me', body);
      setUser(u);
      setMsg({ type: 'success', text: 'Profile saved.' });
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
  };

  const locate = async () => {
    try { setForm({ ...form, coords: await getPosition() }); setMsg({ type: 'info', text: 'Location captured. Save to keep it.' }); }
    catch (err) { setMsg({ type: 'error', text: err.message }); }
  };

  const changePw = async (e) => {
    e.preventDefault();
    try { await api.put('/users/me/password', pw); setPw({ currentPassword: '', newPassword: '' }); setPwMsg({ type: 'success', text: 'Password changed.' }); }
    catch (err) { setPwMsg({ type: 'error', text: err.message }); }
  };

  return (
    <>
      <div className="row between"><h2>My profile</h2><span className="row"><span className="muted">{user.role}</span><StatusBadge status={user.status} /></span></div>
      {user.status === 'pending' && <Alert type="info">Your farmer account is waiting for admin approval. You can complete your profile now and list produce once approved.</Alert>}
      <div className="grid grid-2">
        <form className="card" onSubmit={save}>
          <h3>Personal details</h3>
          <Alert type={msg.type}>{msg.text}</Alert>
          <div className="field"><label htmlFor="n">Name</label><input id="n" required value={form.name} onChange={set('name')} /></div>
          <div className="field"><label>Email</label><input value={user.email} disabled /></div>
          <div className="field"><label htmlFor="p">Phone</label><input id="p" required value={form.phone} onChange={set('phone')} /></div>
          <div className="field"><label htmlFor="c">City</label><input id="c" value={form.city} onChange={set('city')} /></div>
          <div className="field"><label htmlFor="a">Address</label><textarea id="a" value={form.address} onChange={set('address')} /></div>
          <div className="field">
            <button type="button" className="btn btn-ghost btn-sm" onClick={locate}>Use my current location</button>
            <p className="small muted">{form.coords ? `Saved coordinates: ${Number(form.coords.lat).toFixed(4)}, ${Number(form.coords.lng).toFixed(4)}` : 'No location saved yet.'}</p>
          </div>
          {user.role === 'farmer' && (
            <>
              <h3>Farm information</h3>
              <div className="field"><label htmlFor="fn">Farm name</label><input id="fn" value={form.farm.name} onChange={setFarm('name')} /></div>
              <div className="field"><label htmlFor="fs">Farm size</label><input id="fs" placeholder="e.g. 12 acres" value={form.farm.size} onChange={setFarm('size')} /></div>
              <div className="field"><label htmlFor="fc">Crops you grow (comma separated)</label><input id="fc" value={form.farm.crops} onChange={setFarm('crops')} /></div>
              <div className="field"><label htmlFor="fd">About your farm</label><textarea id="fd" value={form.farm.description} onChange={setFarm('description')} /></div>
            </>
          )}
          <button className="btn btn-primary">Save changes</button>
        </form>
        <form className="card" onSubmit={changePw} style={{ alignSelf: 'start' }}>
          <h3>Change password</h3>
          <Alert type={pwMsg.type}>{pwMsg.text}</Alert>
          <div className="field"><label htmlFor="cp">Current password</label><input id="cp" type="password" required value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></div>
          <div className="field"><label htmlFor="np">New password</label><input id="np" type="password" minLength={6} required value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></div>
          <button className="btn btn-primary">Update password</button>
        </form>
      </div>
    </>
  );
}
