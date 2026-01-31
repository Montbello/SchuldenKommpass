// Advisor Types
export type AdvisorType = 'structured' | 'empathetic' | 'motivator';

// Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'advisor';
  content: string;
  timestamp: string;
}

// User Types
export interface User {
  user_id: string;
  email: string;
  name?: string;
  role: 'USER' | 'ADVISOR' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  date_of_birth?: string;
  disabilities?: Record<string, unknown>;
  consent_data_sharing?: boolean;
  selected_advisor?: AdvisorType;
  created_at: string;
  updated_at: string;
  skills?: Skill[];
}

export interface Skill {
  skill_id: string;
  userId: string;
  category: string;
  description?: string;
  verified: boolean;
  created_at: string;
}

// Task Types
export interface Task {
  task_id: string;
  title: string;
  description?: string;
  required_skill?: string;
  estimated_time?: number;
  createdById?: string;
  created_at: string;
  active: boolean;
}

// Match Types
export type MatchStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

export interface Match {
  match_id: string;
  userId: string;
  taskId: string;
  score: number;
  assigned_at: string;
  status: MatchStatus;
  task?: Task;
  user?: User;
}

// Progress Types
export type ProgressStatus = 'in_progress' | 'submitted' | 'verified' | 'rejected';

export interface Progress {
  progress_id: string;
  userId: string;
  taskId: string;
  status: ProgressStatus;
  proofDocumentId?: string;
  points_earned: number;
  updated_at: string;
  task?: Task;
  proof_document?: Document;
}

// Document Types
export interface Document {
  document_id: string;
  userId: string;
  file_path: string;
  file_type: string;
  file_hash?: string;
  storage_provider?: string;
  encrypted: boolean;
  retention_expiry?: string;
  uploaded_at: string;
  description?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
