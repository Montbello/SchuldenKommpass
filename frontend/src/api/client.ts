// API Base URL - use environment variable in production, proxy in development
export const API_BASE = import.meta.env.VITE_API_URL || '';

export type ApiErrorPayload = {
  message?: string;
  code?: string;
  issues?: unknown;
};

export class ApiError extends Error {
  status: number;
  code?: string;
  issues?: unknown;

  constructor(status: number, payload: ApiErrorPayload, fallbackMessage: string) {
    super(payload.message || fallbackMessage);
    this.name = 'ApiError';
    this.status = status;
    this.code = payload.code;
    this.issues = payload.issues;
  }
}

async function parseJsonSafe(res: Response): Promise<any> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export async function handleApiResponse<T>(res: Response): Promise<T> {
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw new ApiError(res.status, data || {}, res.statusText);
  }
  return data as T;
}
