import prisma from '../../prismaClient';
import { OnboardingStatus } from '@prisma/client';
import { stabilityService } from './stability.service';

export interface OnboardingStartInput {
  email: string;
  invitationToken?: string;
  referredBy?: string;
}

export interface OnboardingStepInput {
  userId: string;
  step: 'basic' | 'documents' | 'skills' | 'story';
  data: any;
}

export interface OnboardingBasicData {
  name: string;
  dateOfBirth: string;
  disabilities?: any;
  consentDataProcessing: boolean;
  consentDataSharing: boolean;
  consentPartnerSharing: boolean;
}

export interface OnboardingStoryData {
  userStory: string;
}

export const onboardingService = {
  /**
   * Start onboarding process
   * Validates invitation token and creates/updates user
   */
  async startOnboarding(input: OnboardingStartInput) {
    // TODO: Validate invitation token if provided
    
    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new Error('User not found. Please register first.');
    }

    // Update onboarding status if not started
    if (user.onboarding_status === 'NOT_STARTED') {
      user = await prisma.user.update({
        where: { user_id: user.user_id },
        data: {
          onboarding_status: OnboardingStatus.IN_PROGRESS,
          referred_by: input.referredBy,
        },
      });
    }

    return {
      userId: user.user_id,
      currentStep: this.getCurrentStep(user.onboarding_status),
      status: user.onboarding_status,
    };
  },

  /**
   * Process a specific onboarding step
   */
  async processStep(input: OnboardingStepInput) {
    const user = await prisma.user.findUnique({
      where: { user_id: input.userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    switch (input.step) {
      case 'basic':
        return await this.processBasicData(input.userId, input.data as OnboardingBasicData);
      
      case 'documents':
        // Documents are uploaded separately via documents API
        return { success: true, message: 'Documents step completed' };
      
      case 'skills':
        return await this.processSkillsData(input.userId, input.data);
      
      case 'story':
        return await this.processStoryData(input.userId, input.data as OnboardingStoryData);
      
      default:
        throw new Error(`Unknown step: ${input.step}`);
    }
  },

  /**
   * Process basic user data (Step 1)
   */
  async processBasicData(userId: string, data: OnboardingBasicData) {
    const updated = await prisma.user.update({
      where: { user_id: userId },
      data: {
        name: data.name,
        date_of_birth: new Date(data.dateOfBirth),
        disabilities: data.disabilities,
        consent_data_processing: data.consentDataProcessing,
        consent_data_sharing: data.consentDataSharing,
        consent_partner_sharing: data.consentPartnerSharing,
      },
    });

    return {
      success: true,
      nextStep: 'documents',
      user: {
        user_id: updated.user_id,
        name: updated.name,
        onboarding_status: updated.onboarding_status,
      },
    };
  },

  /**
   * Process skills data (Step 3)
   */
  async processSkillsData(userId: string, data: { skills: { category: string; description?: string }[] }) {
    // Delete existing skills
    await prisma.skill.deleteMany({
      where: { userId },
    });

    // Create new skills
    if (data.skills && data.skills.length > 0) {
      await prisma.skill.createMany({
        data: data.skills.map(skill => ({
          userId,
          category: skill.category,
          description: skill.description,
        })),
      });
    }

    return {
      success: true,
      nextStep: 'story',
    };
  },

  /**
   * Process user story (Step 4 - Final)
   * Triggers automatic stability check
   */
  async processStoryData(userId: string, data: OnboardingStoryData) {
    // Update user story
    await prisma.user.update({
      where: { user_id: userId },
      data: {
        user_story: data.userStory,
        onboarding_status: OnboardingStatus.IN_PROGRESS, // Temporarily, will be updated by stability check
      },
    });

    // Run automatic stability check
    const stabilityResult = await stabilityService.runAndUpdateStatus(userId);

    return {
      success: true,
      message: this.getStatusMessage(stabilityResult.status),
      status: stabilityResult.status,
      stabilityScore: stabilityResult.score,
      requiresManualReview: stabilityResult.requiresManualReview,
      reasons: stabilityResult.reasons,
      missingRequirements: stabilityResult.missingRequirements,
    };
  },

  /**
   * Get current onboarding status
   */
  async getOnboardingStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        name: true,
        email: true,
        onboarding_status: true,
        stability_score: true,
        referred_by: true,
        consent_data_processing: true,
        consent_data_sharing: true,
        consent_partner_sharing: true,
        date_of_birth: true,
        disabilities: true,
        user_story: true,
        skills: {
          select: {
            skill_id: true,
            category: true,
            description: true,
            verified: true,
          },
        },
        documents: {
          where: {
            document_category: {
              in: ['PROOF_MEDICAL', 'PROOF_FINANCIAL', 'PROOF_IDENTITY'],
            },
          },
          select: {
            document_id: true,
            document_category: true,
            verification_status: true,
            uploaded_at: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      user,
      currentStep: this.getCurrentStep(user.onboarding_status),
      requiredDocuments: this.getRequiredDocuments(user),
      isComplete: user.onboarding_status !== 'NOT_STARTED' && user.onboarding_status !== 'IN_PROGRESS',
    };
  },

  /**
   * Helper: Get current step based on onboarding status
   */
  getCurrentStep(status: OnboardingStatus): string {
    switch (status) {
      case 'NOT_STARTED':
        return 'basic';
      case 'IN_PROGRESS':
        return 'documents'; // Assume they've done basic
      case 'PENDING_REVIEW':
      case 'APPROVED':
      case 'REJECTED':
        return 'complete';
      default:
        return 'basic';
    }
  },

  /**
   * Helper: Get required documents based on user profile
   */
  getRequiredDocuments(user: any): string[] {
    const required = ['PROOF_FINANCIAL'];
    
    if (user.disabilities) {
      required.push('PROOF_MEDICAL');
    }

    return required;
  },

  /**
   * Helper: Get user-friendly status message
   */
  getStatusMessage(status: OnboardingStatus): string {
    switch (status) {
      case OnboardingStatus.APPROVED:
        return '🎉 Onboarding erfolgreich abgeschlossen! Ihr Profil wurde genehmigt.';
      case OnboardingStatus.PENDING_REVIEW:
        return '🔍 Onboarding abgeschlossen. Ihr Profil wird geprüft.';
      case OnboardingStatus.REJECTED:
        return '❌ Ihr Profil konnte nicht genehmigt werden. Bitte kontaktieren Sie uns.';
      default:
        return 'Onboarding in Bearbeitung.';
    }
  },

  /**
   * Manually approve/reject onboarding (Admin/Advisor only)
   */
  async updateOnboardingStatus(
    userId: string,
    status: OnboardingStatus,
    reviewedBy: string,
    notes?: string
  ) {
    const updated = await prisma.user.update({
      where: { user_id: userId },
      data: {
        onboarding_status: status,
      },
    });

    // Log the review in audit events
    await prisma.auditEvent.create({
      data: {
        entity: 'User',
        entity_id: userId,
        action: `onboarding_${status.toLowerCase()}`,
        payload: {
          reviewed_by: reviewedBy,
          notes,
          previous_status: 'PENDING_REVIEW',
          new_status: status,
        },
      },
    });

    return updated;
  },
};
