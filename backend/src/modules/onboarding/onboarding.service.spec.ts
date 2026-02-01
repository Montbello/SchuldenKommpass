import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../prismaClient', () => ({
  default: {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn()
    },
    auditEvent: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn()
    },
    document: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn()
    }
  },
}));






import { onboardingService } from './onboarding.service';
import prisma from '../../prismaClient';

describe('onboardingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
});

  describe('startOnboarding', () => {
    it('starts onboarding for existing user', async () => {
      const mockUser = {
        user_id: 'user-1',
        email: 'test@example.com',
        onboarding_status: 'NOT_STARTED',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(prisma.user.update).mockResolvedValue({
        ...mockUser,
        onboarding_status: 'IN_PROGRESS',
      });

      const result = await onboardingService.startOnboarding({
        email: 'test@example.com',
      });

      expect(result.userId).toBe('user-1');
      expect(result.status).toBe('IN_PROGRESS');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { user_id: 'user-1' },
        data: {
          onboarding_status: 'IN_PROGRESS',
          referred_by: undefined,
        },
      });
    });

    it('throws error when user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(
        onboardingService.startOnboarding({ email: 'nonexistent@example.com' })
      ).rejects.toThrow('User not found. Please register first.');
    });

    it('does not update status if already in progress', async () => {
      const mockUser = {
        user_id: 'user-1',
        email: 'test@example.com',
        onboarding_status: 'IN_PROGRESS',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      const result = await onboardingService.startOnboarding({
        email: 'test@example.com',
      });

      expect(result.userId).toBe('user-1');
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('processBasicData', () => {
    it('updates user with basic data', async () => {
      const mockUser = {
        user_id: 'user-1',
        name: 'Test User',
        date_of_birth: new Date('1990-01-01'),
        onboarding_status: 'IN_PROGRESS',
      };

      vi.mocked(prisma.user.update).mockResolvedValue(mockUser);

      const result = await onboardingService.processBasicData('user-1', {
        name: 'Test User',
        dateOfBirth: '1990-01-01',
        consentDataProcessing: true,
        consentDataSharing: true,
        consentPartnerSharing: false,
      });

      expect(result.success).toBe(true);
      expect(result.nextStep).toBe('documents');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { user_id: 'user-1' },
        data: expect.objectContaining({
          name: 'Test User',
          consent_data_processing: true,
          consent_data_sharing: true,
          consent_partner_sharing: false,
        }),
      });
    });
  });

  describe('processSkillsData', () => {
    it('creates new skills for user', async () => {
      const skills = [
        { category: 'Programming', description: 'TypeScript' },
        { category: 'Communication', description: 'Presentation' },
      ];

      vi.mocked(prisma.skill.deleteMany).mockResolvedValue({ count: 0 });
      vi.mocked(prisma.skill.createMany).mockResolvedValue({ count: 2 });

      const result = await onboardingService.processSkillsData('user-1', { skills });

      expect(result.success).toBe(true);
      expect(result.nextStep).toBe('story');
      expect(prisma.skill.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
      expect(prisma.skill.createMany).toHaveBeenCalledWith({
        data: [
          { userId: 'user-1', category: 'Programming', description: 'TypeScript' },
          { userId: 'user-1', category: 'Communication', description: 'Presentation' },
        ],
      });
    });

    it('handles empty skills array', async () => {
      vi.mocked(prisma.skill.deleteMany).mockResolvedValue({ count: 0 });

      const result = await onboardingService.processSkillsData('user-1', { skills: [] });

      expect(result.success).toBe(true);
      expect(prisma.skill.deleteMany).toHaveBeenCalled();
      expect(prisma.skill.createMany).not.toHaveBeenCalled();
    });
  });

  describe('processStoryData', () => {
    it('processes story and triggers stability check', async () => {
      const mockUser = {
        user_id: 'user-1',
        user_story: 'My personal story',
        onboarding_status: 'IN_PROGRESS',
      };

      const stabilityResult = {
        status: 'APPROVED',
        score: 85,
        requiresManualReview: false,
        reasons: ['Approved'],
        missingRequirements: [],
      };

      vi.mocked(prisma.user.update).mockResolvedValue(mockUser);
      vi.mocked(prisma.run.andUpdateStatus).mockResolvedValue(stabilityResult);

      const result = await onboardingService.processStoryData('user-1', {
        userStory: 'My personal story',
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe('APPROVED');
      expect(result.stabilityScore).toBe(85);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { user_id: 'user-1' },
        data: {
          user_story: 'My personal story',
          onboarding_status: 'IN_PROGRESS',
        },
      });
      expect(prisma.run.andUpdateStatus).toHaveBeenCalledWith('user-1');
    });
  });

  describe('processStep', () => {
    it('routes to basic data step', async () => {
      const mockUser = {
        user_id: 'user-1',
        email: 'test@example.com',
        onboarding_status: 'IN_PROGRESS',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(prisma.user.update).mockResolvedValue(mockUser);

      await onboardingService.processStep({
        userId: 'user-1',
        step: 'basic',
        data: {
          name: 'Test User',
          dateOfBirth: '1990-01-01',
          consentDataProcessing: true,
          consentDataSharing: true,
          consentPartnerSharing: false,
        },
      });

      expect(prisma.user.update).toHaveBeenCalled();
    });

    it('routes to documents step', async () => {
      const mockUser = {
        user_id: 'user-1',
        email: 'test@example.com',
        onboarding_status: 'IN_PROGRESS',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      const result = await onboardingService.processStep({
        userId: 'user-1',
        step: 'documents',
        data: {},
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Documents step completed');
    });

    it('throws error for unknown step', async () => {
      const mockUser = {
        user_id: 'user-1',
        email: 'test@example.com',
        onboarding_status: 'IN_PROGRESS',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      await expect(
        onboardingService.processStep({
          userId: 'user-1',
          step: 'unknown' as any,
          data: {},
        })
      ).rejects.toThrow('Unknown step: unknown');
    });

    it('throws error when user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(
        onboardingService.processStep({
          userId: 'nonexistent',
          step: 'basic',
          data: {},
        })
      ).rejects.toThrow('User not found');
    });
  });

  describe('getOnboardingStatus', () => {
    it('returns complete onboarding status', async () => {
      const mockUser = {
        user_id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        onboarding_status: 'IN_PROGRESS',
        stability_score: 75,
        referred_by: null,
        consent_data_processing: true,
        consent_data_sharing: true,
        consent_partner_sharing: false,
        date_of_birth: new Date('1990-01-01'),
        disabilities: null,
        user_story: 'My story',
        skills: [
          { skill_id: 'skill-1', category: 'Programming', description: 'TypeScript', verified: false },
        ],
        documents: [
          { document_id: 'doc-1', document_category: 'PROOF_FINANCIAL', verification_status: 'PENDING', uploaded_at: new Date() },
        ],
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      const result = await onboardingService.getOnboardingStatus('user-1');

      expect(result.user).toEqual(mockUser);
      expect(result.isComplete).toBe(false);
      expect(result.requiredDocuments).toContain('PROOF_FINANCIAL');
    });

    it('includes medical proof in required documents for users with disabilities', async () => {
      const mockUser = {
        user_id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        onboarding_status: 'IN_PROGRESS',
        disabilities: { type: 'physical' },
        skills: [],
        documents: [],
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      const result = await onboardingService.getOnboardingStatus('user-1');

      expect(result.requiredDocuments).toContain('PROOF_MEDICAL');
      expect(result.requiredDocuments).toContain('PROOF_FINANCIAL');
    });

    it('throws error when user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(onboardingService.getOnboardingStatus('nonexistent')).rejects.toThrow('User not found');
    });
  });

  describe('updateOnboardingStatus', () => {
    it('updates status and creates audit log', async () => {
      const mockUser = {
        user_id: 'user-1',
        onboarding_status: 'APPROVED',
      };

      vi.mocked(prisma.user.update).mockResolvedValue(mockUser);
      vi.mocked(prisma.audit.eventCreate).mockResolvedValue({});

      const result = await onboardingService.updateOnboardingStatus(
        'user-1',
        'APPROVED',
        'admin-1',
        'All requirements met'
      );

      expect(result.onboarding_status).toBe('APPROVED');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { user_id: 'user-1' },
        data: {
          onboarding_status: 'APPROVED',
        },
      });
      expect(prisma.audit.eventCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          entity: 'User',
          entity_id: 'user-1',
          action: 'onboarding_approved',
        }),
      });
    });
  });

  describe('getCurrentStep', () => {
    it('returns basic for NOT_STARTED', () => {
      expect(onboardingService.getCurrentStep('NOT_STARTED')).toBe('basic');
    });

    it('returns documents for IN_PROGRESS', () => {
      expect(onboardingService.getCurrentStep('IN_PROGRESS')).toBe('documents');
    });

    it('returns complete for APPROVED', () => {
      expect(onboardingService.getCurrentStep('APPROVED')).toBe('complete');
    });
  });

  describe('getRequiredDocuments', () => {
    it('returns only financial proof for users without disabilities', () => {
      const user = { disabilities: null };
      const required = onboardingService.getRequiredDocuments(user);

      expect(required).toEqual(['PROOF_FINANCIAL']);
    });

    it('includes medical proof for users with disabilities', () => {
      const user = { disabilities: { type: 'physical' } };
      const required = onboardingService.getRequiredDocuments(user);

      expect(required).toContain('PROOF_FINANCIAL');
      expect(required).toContain('PROOF_MEDICAL');
    });
  });
});
