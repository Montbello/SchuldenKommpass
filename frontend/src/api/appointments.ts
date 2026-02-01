import { handleApiResponse, API_BASE } from './client';

const APPOINTMENTS_BASE = `${API_BASE}/api/appointments`;

export interface Appointment {
  appointment_id: string;
  userId: string;
  advisorId?: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  video_link?: string;
  user?: { user_id: string; name: string; email: string };
  advisor?: { user_id: string; name: string; email: string };
}

export interface CreateAppointmentInput {
  advisorId?: string;
  start_time: string;
  end_time: string;
  status?: string;
}

// Get user's appointments
export async function getAppointments(userId: string): Promise<Appointment[]> {
  const res = await fetch(`${APPOINTMENTS_BASE}?userId=${userId}`, {
    method: 'GET',
    credentials: 'include',
  });
  return handleApiResponse<Appointment[]>(res);
}

// Get single appointment
export async function getAppointment(appointmentId: string): Promise<Appointment> {
  const res = await fetch(`${APPOINTMENTS_BASE}/${appointmentId}`, {
    method: 'GET',
    credentials: 'include',
  });
  return handleApiResponse<Appointment>(res);
}

// Create new appointment
export async function createAppointment(data: CreateAppointmentInput): Promise<Appointment> {
  const res = await fetch(APPOINTMENTS_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return handleApiResponse<Appointment>(res);
}

// Update appointment
export async function updateAppointment(
  appointmentId: string,
  data: Partial<CreateAppointmentInput>
): Promise<Appointment> {
  const res = await fetch(`${APPOINTMENTS_BASE}/${appointmentId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return handleApiResponse<Appointment>(res);
}

// Cancel appointment
export async function cancelAppointment(appointmentId: string): Promise<Appointment> {
  return updateAppointment(appointmentId, { status: 'cancelled' });
}

// Delete appointment
export async function deleteAppointment(appointmentId: string): Promise<void> {
  const res = await fetch(`${APPOINTMENTS_BASE}/${appointmentId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleApiResponse<void>(res);
}

// Generate video link for appointment
export async function generateVideoLink(appointmentId: string): Promise<{ video_link: string }> {
  const res = await fetch(`${APPOINTMENTS_BASE}/${appointmentId}/video`, {
    method: 'POST',
    credentials: 'include',
  });
  return handleApiResponse<{ video_link: string }>(res);
}

// Get available time slots (for booking)
export async function getAvailableSlots(
  advisorId: string,
  date: string
): Promise<Array<{ start: string; end: string }>> {
  const res = await fetch(`${APPOINTMENTS_BASE}/available-slots?advisorId=${advisorId}&date=${date}`, {
    method: 'GET',
    credentials: 'include',
  });
  return handleApiResponse<Array<{ start: string; end: string }>>(res);
}
