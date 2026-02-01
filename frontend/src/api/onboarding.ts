import { handleApiResponse, API_BASE } from './client';

const ONBOARDING_BASE = `${API_BASE}/api/onboarding`;

export interface OnboardingStatus {
  user: {
    user_id: string;
    name: string | null;
    email: string;
    onboarding_status: string;
    stability_score: number | null;
    consent_data_processing: boolean;
    consent_data_sharing: boolean;
    consent_partner_sharing: boolean;
    date_of_birth: string | null;
    disabilities: Record<string, unknown> | null;
    user_story: string | null;
    skills: Array<{
      skill_id: string;
      category: string;
      description?: string;
      verified: boolean;
    }>;
    documents: Array<{
      document_id: string;
      document_category: string;
      verification_status: string | null;
      uploaded_at: string;
    }>;
  };
  currentStep: string;
  requiredDocuments: string[];
  isComplete: boolean;
}

export interface OnboardingBasicData {
  name: string;
  dateOfBirth: string;
  disabilities?: Record<string, unknown>;
  consentDataProcessing: boolean;
  consentDataSharing: boolean;
  consentPartnerSharing: boolean;
}

export interface OnboardingSkillsData {
  skills: Array<{ category: string; description?: string }>;
}

export interface OnboardingStoryData {
  userStory: string;
}

export interface StepResult {
  success: boolean;
  nextStep?: string;
  message?: string;
  status?: string;
  stabilityScore?: number;
  requiresManualReview?: boolean;
  reasons?: string[];
  missingRequirements?: string[];
}

// Start onboarding
export async function startOnboarding(email: string, invitationToken?: string, referredBy?: string) {
  const res = await fetch(`${ONBOARDING_BASE}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, invitationToken, referredBy }),
  });
  return handleApiResponse<{ userId: string; currentStep: string; status: string }>(res);
}

// Get current onboarding status
export async function getOnboardingStatus(userId: string): Promise<OnboardingStatus> {
  const res = await fetch(`${ONBOARDING_BASE}/status/${userId}`, {
    method: 'GET',
    credentials: 'include',
  });
  return handleApiResponse<OnboardingStatus>(res);
}

// Process basic data step (Step 1)
export async function processBasicData(userId: string, data: OnboardingBasicData): Promise<StepResult> {
  const res = await fetch(`${ONBOARDING_BASE}/step/basic`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ userId, data }),
  });
  return handleApiResponse<StepResult>(res);
}

// Process documents step (Step 2) - documents uploaded separately
export async function processDocumentsStep(userId: string): Promise<StepResult> {
  const res = await fetch(`${ONBOARDING_BASE}/step/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ userId, data: {} }),
  });
  return handleApiResponse<StepResult>(res);
}

// Process skills step (Step 3)
export async function processSkillsStep(userId: string, data: OnboardingSkillsData): Promise<StepResult> {
  const res = await fetch(`${ONBOARDING_BASE}/step/skills`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ userId, data }),
  });
  return handleApiResponse<StepResult>(res);
}

// Process story step (Step 4 - Final)
export async function processStoryStep(userId: string, data: OnboardingStoryData): Promise<StepResult> {
  const res = await fetch(`${ONBOARDING_BASE}/step/story`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ userId, data }),
  });
  return handleApiResponse<StepResult>(res);
}
