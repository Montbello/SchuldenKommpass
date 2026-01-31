const USER_KEY = 'sk_user';

export function clearToken() {
  localStorage.removeItem(USER_KEY);
}

export function setUser(user: any) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): any | null {
  const t = localStorage.getItem(USER_KEY);
  return t ? JSON.parse(t) : null;
}
export function getCsrfToken(): string | null {
  const name = 'XSRF-TOKEN=';
  const parts = document.cookie.split(';').map((c) => c.trim());
  const match = parts.find((c) => c.startsWith(name));
  return match ? decodeURIComponent(match.substring(name.length)) : null;
}
