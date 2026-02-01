import type { Task } from '../types';
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

// Get all active tasks
export async function getTasks(filters?: { skill?: string }): Promise<Task[]> {
  const params = new URLSearchParams();
  if (filters?.skill) params.set('skill', filters.skill);
  const query = params.toString();
  return authFetch(`${API_BASE}/tasks${query ? `?${query}` : ''}`);
}

// Get single task
export async function getTask(taskId: string): Promise<Task> {
  return authFetch(`${API_BASE}/tasks/${taskId}`);
}

// Create task (Admin/Partner only)
export async function createTask(data: Omit<Task, 'task_id' | 'created_at' | 'active'>): Promise<Task> {
  return authFetch(`${API_BASE}/tasks`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
