import type { Match, MatchStatus } from '../types';
import { getCsrfToken } from '../utils/auth';
import { handleApiResponse, API_BASE } from './client';

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

// Get user's matches
export async function getMatches(userId: string): Promise<Match[]> {
  return authFetch(`${API_BASE}/matches?userId=${userId}`);
}

// Get single match
export async function getMatch(matchId: string): Promise<Match> {
  return authFetch(`${API_BASE}/matches/${matchId}`);
}

// Update match status (accept/reject)
export async function updateMatchStatus(matchId: string, status: MatchStatus): Promise<Match> {
  return authFetch(`${API_BASE}/matches/${matchId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// Create match (Admin/System)
export async function createMatch(data: { userId: string; taskId: string; score: number }): Promise<Match> {
  return authFetch(`${API_BASE}/matches`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
