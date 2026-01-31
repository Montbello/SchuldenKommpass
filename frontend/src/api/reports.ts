import { handleApiResponse } from './client';
import { getCsrfToken } from '../utils/auth';

export interface GeneratedReport {
  summary: string;
  recommendations: string[];
  statusAssessment: string;
  nextSteps: string[];
  rawContent: string;
}

export interface Report {
  report_id: string;
  type: string;
  period_start: string;
  period_end: string;
  format: string;
  generated_at: string;
  content?: GeneratedReport;
}

export interface GenerateReportInput {
  userStory: string;
  periodStart?: string;
  periodEnd?: string;
}

export async function generateReport(data: GenerateReportInput): Promise<{ report: Report }> {
  const csrfToken = getCsrfToken();
  const res = await fetch('/api/reports/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return handleApiResponse(res);
}

export async function getReports(): Promise<{ reports: Report[] }> {
  const res = await fetch('/api/reports', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleApiResponse(res);
}

export async function getReportById(id: string): Promise<{ report: Report }> {
  const res = await fetch(`/api/reports/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleApiResponse(res);
}
