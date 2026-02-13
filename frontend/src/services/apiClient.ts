const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('accessToken');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
    return Promise.reject(new Error('Unauthorized'));
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    return Promise.reject({ status: res.status, ...error });
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export default { request };
