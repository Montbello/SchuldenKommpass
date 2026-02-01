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
    }
  },
}));




import { stabilityService } from './stability.service';
import prisma from '../../prismaClient';

describe('stabilityService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
});

  describe('checkStability', () => {
    it('approves user with high score', async () => {
      const mockUser = {
        user_id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        date_of_birth: new Date('1990-01-01'),
        consent_data_processing: true,
        consent_data_sharing: true,
        user_story: 'This is my story with enough text',
        disabilities: null,
        skills: [
          { skill_id: 'skill-1', category: 'Programming', description: 'TypeScript' },
        ],
        documents: [
          { document_id: 'doc-1', document_category: 'PROOF_FINANCIAL' },
        ],
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      const result = await stabilityService.checkStability('user-1');

      expect(result.status).toBe('APPROVED');
      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(result.requiresManualReview).toBe(false);
      expect(result.reasons).toContain('Alle erforderlichen Einwilligungen erteilt');
    });

    it('rejects user with low score', async () => {
      const mockUser = {
        user_id: 'user-1',
        name: '',
        email: 'test@example.com',
        date_of_birth: null,
        consent_data_processing: false,
        consent_data_sharing: false,
        user_story: '',
        disabilities: null,
        skills: [],
        documents: [],
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      const result = await stabilityService.checkStability('user-1');

      expect(result.status).toBe('REJECTED');
      expect(result.score).toBeLessThan(30);
      expect(result.missingRequirements.length).toBeGreaterThan(0);
    });

    it('requires manual review for medium score', async () => {
      const mockUser = {
        user_id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        date_of_birth: new Date('1990-01-01'),
        consent_data_processing: true,
        consent_data_sharing: true,
        user_story: 'Short story',
        disabilities: null,
        skills: [],
        documents: [
          { document_id: 'doc-1', document_category: 'PROOF_FINANCIAL' },
        ],
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      const result = await stabilityService.checkStability('user-1');

      expect(result.status).toBe('PENDING_REVIEW');
      expect(result.requiresManualReview).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(30);
      expect(result.score).toBeLessThan(80);
    });

    it('flags high-risk users for manual review', async () => {
      const mockUser = {
        user_id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        date_of_birth: new Date('1990-01-01'),
        consent_data_processing: true,
        consent_data_sharing: true,
        user_story: 'Ich habe Probleme mit Alkohol und Spielsucht',
        disabilities: null,
        skills: [{ skill_id: 'skill-1', category: 'Programming' }],
        documents: [
          { document_id: 'doc-1', document_category: 'PROOF_FINANCIAL' },
        ],
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      const result = await stabilityService.checkStability('user-1');

      expect(result.status).toBe('PENDING_REVIEW');
      expect(result.requiresManualReview).toBe(true);
      expect(result.reasons.some(r => r.includes('Hochrisiko'))).toBe(true);
    });

    it('requires medical proof when disabilities are present', async () => {
      const mockUser = {
        user_id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        date_of_birth: new Date('1990-01-01'),
        consent_data_processing: true,
        consent_data_sharing: true,
        user_story: 'My story',
        disabilities: { type: 'physical' },
        skills: [{ skill_id: 'skill-1', category: 'Programming' }],
        documents: [
          { document_id: 'doc-1', document_category: 'PROOF_FINANCIAL' },
        ],
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      const result = await stabilityService.checkStability('user-1');

      expect(result.missingRequirements).toContain('Ärztlicher Nachweis (PROOF_MEDICAL) erforderlich bei Einschränkungen');
    });
  });

  describe('checkConsents', () => {
    it('validates required consents', () => {
      const user = {
        consent_data_processing: true,
        consent_data_sharing: true,
      };
      const reasons: string[] = [];
      const missing: string[] = [];
      const rules = {
        minDocuments: 1,
        requiredConsents: ['consent_data_processing', 'consent_data_sharing'],
        autoApproveThreshold: 80,
        autoRejectThreshold: 30,
      };

      const result = stabilityService.checkConsents(user, rules, reasons, missing);

      expect(result).toBe(true);
      expect(missing).toHaveLength(0);
    });

    it('detects missing consents', () => {
      const user = {
        consent_data_processing: true,
        consent_data_sharing: false,
      };
      const reasons: string[] = [];
      const missing: string[] = [];
      const rules = {
        minDocuments: 1,
        requiredConsents: ['consent_data_processing', 'consent_data_sharing'],
        autoApproveThreshold: 80,
        autoRejectThreshold: 30,
      };

      const result = stabilityService.checkConsents(user, rules, reasons, missing);

      expect(result).toBe(false);
      expect(missing.length).toBeGreaterThan(0);
    });
  });

  describe('checkDocuments', () => {
    it('validates minimum document requirements', () => {
      const user = {
        documents: [
          { document_category: 'PROOF_FINANCIAL' },
        ],
      };
      const reasons: string[] = [];
      const missing: string[] = [];
      const rules = {
        minDocuments: 1,
        requiredConsents: [],
        autoApproveThreshold: 80,
        autoRejectThreshold: 30,
      };

      const result = stabilityService.checkDocuments(user, rules, reasons, missing);

      expect(result).toBe(true);
    });

    it('detects missing financial proof', () => {
      const user = {
        documents: [
          { document_category: 'PROOF_IDENTITY' },
        ],
      };
      const reasons: string[] = [];
      const missing: string[] = [];
      const rules = {
        minDocuments: 1,
        requiredConsents: [],
        autoApproveThreshold: 80,
        autoRejectThreshold: 30,
      };

      const result = stabilityService.checkDocuments(user, rules, reasons, missing);

      expect(result).toBe(false);
      expect(missing).toContain('Finanzieller Nachweis (PROOF_FINANCIAL) fehlt');
    });
  });

  describe('checkProfileCompleteness', () => {
    it('validates complete profile', () => {
      const user = {
        name: 'Test User',
        date_of_birth: new Date('1990-01-01'),
      };
      const reasons: string[] = [];
      const missing: string[] = [];

      const result = stabilityService.checkProfileCompleteness(user, reasons, missing);

      expect(result).toBe(true);
      expect(missing).toHaveLength(0);
    });

    it('detects missing name', () => {
      const user = {
        name: '',
        date_of_birth: new Date('1990-01-01'),
      };
      const reasons: string[] = [];
      const missing: string[] = [];

      const result = stabilityService.checkProfileCompleteness(user, reasons, missing);

      expect(result).toBe(false);
      expect(missing).toContain('Name fehlt');
    });

    it('detects users under 18', () => {
      const user = {
        name: 'Test User',
        date_of_birth: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000 * 16), // 16 years old
      };
      const reasons: string[] = [];
      const missing: string[] = [];

      const result = stabilityService.checkProfileCompleteness(user, reasons, missing);

      expect(result).toBe(false);
      expect(missing).toContain('Nutzer ist unter 18 Jahren');
    });

    it('flags users over 67', () => {
      const user = {
        name: 'Test User',
        date_of_birth: new Date('1950-01-01'),
      };
      const reasons: string[] = [];
      const missing: string[] = [];

      const result = stabilityService.checkProfileCompleteness(user, reasons, missing);

      expect(reasons.some(r => r.includes('über 67 Jahre'))).toBe(true);
    });
  });

  describe('calculateAge', () => {
    it('calculates age correctly', () => {
      const birthDate = new Date('1990-01-01');
      const age = stabilityService.calculateAge(birthDate);

      expect(age).toBeGreaterThanOrEqual(33);
      expect(age).toBeLessThanOrEqual(36);
    });
  });

  describe('runAndUpdateStatus', () => {
    it('updates user status and creates audit log', async () => {
      const mockUser = {
        user_id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        date_of_birth: new Date('1990-01-01'),
        consent_data_processing: true,
        consent_data_sharing: true,
        user_story: 'This is my story with enough text',
        disabilities: null,
        skills: [{ skill_id: 'skill-1', category: 'Programming' }],
        documents: [
          { document_id: 'doc-1', document_category: 'PROOF_FINANCIAL' },
        ],
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(prisma.user.update).mockResolvedValue(mockUser);
      vi.mocked(prisma.audit.eventCreate).mockResolvedValue({});

      const result = await stabilityService.runAndUpdateStatus('user-1');

      expect(result.status).toBe('APPROVED');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { user_id: 'user-1' },
        data: {
          stability_score: result.score,
          onboarding_status: result.status,
        },
      });
      expect(prisma.audit.eventCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          entity: 'User',
          entity_id: 'user-1',
          action: 'stability_check',
        }),
      });
    });
  });
});
