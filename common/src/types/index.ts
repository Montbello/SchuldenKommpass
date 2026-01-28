// common/src/types/index.ts

export type UUID = string;

export enum UserRole {
  USER = 'Nutzer',
  ADVISOR = 'Berater',
  ADMIN = 'Admin',
}

export enum UserStatus {
  ACTIVE = 'aktiv',
  INACTIVE = 'inaktiv',
  SUSPENDED = 'gesperrt',
  PENDING_REVIEW = 'Prüfung ausstehend',
}

export interface User {
  user_id: UUID;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
  status: UserStatus;
  date_of_birth?: Date;
  disabilities?: any; // JSONB field
  carer_id?: UUID; // Link to a carer/guardian User
}

export interface Skill {
  skill_id: UUID;
  user_id: UUID;
  category: string;
  description: string;
  verified: boolean;
  created_at: Date;
}

export interface Task {
  task_id: UUID;
  title: string;
  description: string;
  required_skill?: string;
  estimated_time?: number; // in minutes
  created_by: UUID; // User ID of an institution member/advisor
  created_at: Date;
  active: boolean;
}

export enum ProgressStatus {
  PENDING = 'ausstehend',
  IN_PROGRESS = 'in Arbeit',
  COMPLETED = 'erledigt',
}

export interface Progress {
  progress_id: UUID;
  user_id: UUID;
  task_id: UUID;
  status: ProgressStatus;
  proof_document_id?: UUID;
  points_earned?: number;
  updated_at: Date;
}

export enum AppointmentStatus {
  PLANNED = 'geplant',
  COMPLETED = 'durchgeführt',
  CANCELLED = 'abgesagt',
}

export interface Appointment {
  appointment_id: UUID;
  user_id: UUID;
  advisor_id: UUID;
  start_time: Date;
  end_time: Date;
  status: AppointmentStatus;
  video_link?: string;
}

export interface Certificate {
  certificate_id: UUID;
  user_id: UUID;
  title: string;
  description: string;
  issued_date: Date;
  valid_until?: Date;
}

export interface Document {
  document_id: UUID;
  user_id: UUID;
  file_path: string;
  file_type: string; // e.g., 'pdf', 'jpg', 'png'
  uploaded_at: Date;
  description?: string;
}
