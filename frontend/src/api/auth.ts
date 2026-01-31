import { handleApiResponse } from './client';

export type User = {
  user_id: string;
  email: string;
  name?: string;
  role?: string;
  status?: string;
};


export async function logout() {
  const res = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
  return handleApiResponse(res);
}

export async function register(data: { name: string; email: string; password: string }) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return handleApiResponse(res) as Promise<{ user: User }>;
}
export async function getMe() {
  const res = await fetch('/api/auth/me', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleApiResponse(res) as Promise<{ user: User }>;
}
export async function login(data: { email: string; password: string }) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return handleApiResponse(res) as Promise<{ user: User }>;
}