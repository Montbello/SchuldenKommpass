import type { Progress, ProgressStatus, Document } from '../types';
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

// Get user's progress entries
export async function getProgress(userId: string): Promise<Progress[]> {
  return authFetch(`${API_BASE}/progress?userId=${userId}`);
}

// Get single progress
export async function getProgressById(progressId: string): Promise<Progress> {
  return authFetch(`${API_BASE}/progress/${progressId}`);
}

// Create progress (when accepting a match)
export async function createProgress(data: { taskId: string }): Promise<Progress> {
  return authFetch(`${API_BASE}/progress`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Update progress status
export async function updateProgress(progressId: string, data: { status?: ProgressStatus; proofDocumentId?: string }): Promise<Progress> {
  return authFetch(`${API_BASE}/progress/${progressId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Upload document (proof)
export async function uploadDocument(file: File, description?: string): Promise<Document> {
  const csrfToken = getCsrfToken();
  const formData = new FormData();
  formData.append('file', file);
  if (description) formData.append('description', description);

  const res = await fetch(`${API_BASE}/documents`, {
    method: 'POST',
    headers: {
      ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
    },
    credentials: 'include',
    body: formData,
  });

  return handleApiResponse<Document>(res);
}

// Verify progress (Advisor/Admin only)
export async function verifyProgress(progressId: string, verified: boolean): Promise<Progress> {
  return authFetch(`${API_BASE}/progress/${progressId}/verify`, {
    method: 'PATCH',
    body: JSON.stringify({ verified }),
  });
}
