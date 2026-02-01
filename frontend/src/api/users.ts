import type { User, Skill } from '../types';
import { getCsrfToken } from '../utils/auth';
import { handleApiResponse } from './client';

const API_BASE = '/api';

async function authFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const csrfToken = getCsrfToken();
  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(csrfToken && options.method && options.method !== 'GET' ? { 'X-CSRF-Token': csrfToken } : {}),
      ...options.headers,
    },
  });
  return handleApiResponse<T>(res);
}

// Get user profile
export async function getUser(userId: string): Promise<User> {
  return authFetch(`${API_BASE}/users/${userId}`);
}

// Update user profile
export async function updateUser(userId: string, data: Partial<User>): Promise<User> {
  return authFetch(`${API_BASE}/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Get user skills
export async function getUserSkills(userId: string): Promise<Skill[]> {
  return authFetch(`${API_BASE}/users/${userId}/skills`);
}

// Add a skill
export async function addSkill(data: { category: string; description?: string }): Promise<Skill> {
  return authFetch(`${API_BASE}/skills`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Delete a skill
export async function deleteSkill(skillId: string): Promise<void> {
  return authFetch(`${API_BASE}/skills/${skillId}`, {
    method: 'DELETE',
  });
}

// Update consent
export async function updateConsent(userId: string, consent: boolean): Promise<User> {
  return authFetch(`${API_BASE}/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ consent_data_sharing: consent }),
  });
}
