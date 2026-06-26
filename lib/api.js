/** Helper de fetch autenticado para o frontend. */
export function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(path, { ...options, headers });
}
