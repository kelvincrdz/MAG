// Cliente HTTP para o backend Python

const TOKEN_KEY = 'magPlayerToken';

export function getApiBase() {
  if (typeof window !== 'undefined') {
    const env = process.env.NEXT_PUBLIC_API_URL;
    if (env) return env.replace(/\/$/, '');
  }
  return 'http://localhost:8000';
}

export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token) {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch(path, options = {}) {
  const base = getApiBase();
  const url = `${base}${path.startsWith('/') ? '' : '/'}${path}`;
  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');
  const token = getAuthToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const opts = { ...options, headers };
  const res = await fetch(url, opts);
  const contentType = res.headers.get('content-type') || '';
  const isJSON = contentType.includes('application/json');
  const data = isJSON ? await res.json() : await res.text();
  if (!res.ok) {
    const message = isJSON && data && data.detail ? data.detail : `Erro ${res.status}`;
    throw new Error(message);
  }
  return data;
}

export async function apiUpload(path, formData) {
  const base = getApiBase();
  const url = `${base}${path.startsWith('/') ? '' : '/'}${path}`;
  const headers = new Headers();
  const token = getAuthToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(url, { method: 'POST', headers, body: formData });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.detail || `Erro ${res.status}`);
  }
  return data;
}
