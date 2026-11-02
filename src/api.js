const BASE = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = 'dm_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

async function request(method, path, body) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (body instanceof FormData) {
    payload = body; // browser sets the multipart boundary
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${BASE}/api${path}`, { method, headers, body: payload });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  get: (p) => request('GET', p),
  post: (p, b) => request('POST', p, b),
  put: (p, b) => request('PUT', p, b),
  patch: (p, b) => request('PATCH', p, b),
  del: (p) => request('DELETE', p),
};

export const imgUrl = (p) => (!p ? null : p.startsWith('http') ? p : `${BASE}${p}`);

export const toQuery = (obj) => {
  const s = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== '' && v !== undefined && v !== null && v !== false) s.append(k, v);
  });
  return s.toString();
};

export const money = (n) => `Rs ${Number(n || 0).toLocaleString('en-PK')}`;
export const fmtDate = (d) => new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
export const fmtTime = (d) => new Date(d).toLocaleString('en-PK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export const CATEGORIES = ['Vegetables', 'Fruits', 'Grains', 'Pulses', 'Dairy', 'Livestock', 'Spices', 'Other'];
export const UNITS = ['kg', 'maund (40 kg)', 'dozen', 'piece', 'liter', 'bag'];
export const CATEGORY_ICON = {
  Vegetables: '🥕', Fruits: '🥭', Grains: '🌾', Pulses: '🫘', Dairy: '🥛', Livestock: '🐐', Spices: '🌶️', Other: '🧺',
};

export function getPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Location is not supported by this browser'));
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => reject(new Error('Could not get your location. Allow location access and try again')),
      { timeout: 10000 }
    );
  });
}
