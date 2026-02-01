import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../services/unlock.service', () => ({
  unlockService: {
    generateCertificateToken: vi.fn(),
    verifyCertificateToken: vi.fn(),
    getLevelProgress: vi.fn(),
  },
}));

vi.mock('../../prismaClient', () => ({
  default: {
    certificate: {
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
    }
  },
}));






import { certificatesService } from './certificates.service';
import prisma from '../../prismaClient';
import { unlockService } from '../../services/unlock.service';

describe('certificatesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
});

  describe('getUserCertificates', () => {
    it('returns certificates ordered by issue date', async () => {
      const mockCertificates = [
        {
          certificate_id: 'cert-1',
          userId: 'user-1',
          title: 'Certificate 1',
          issued_date: new Date('2024-06-01'),
        },
        {
          certificate_id: 'cert-2',
          userId: 'user-1',
          title: 'Certificate 2',
          issued_date: new Date('2024-01-01'),
        },
      ];

      vi.mocked(prisma.certificate.findMany).mockResolvedValue(mockCertificates);

      const result = await certificatesService.getUserCertificates('user-1');

      expect(result).toEqual(mockCertificates);
      expect(prisma.certificate.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { issued_date: 'desc' },
      });
    });

    it('returns empty array when user has no certificates', async () => {
      vi.mocked(prisma.certificate.findMany).mockResolvedValue([]);

      const result = await certificatesService.getUserCertificates('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('getCertificateById', () => {
    it('returns certificate with user details', async () => {
      const mockCertificate = {
        certificate_id: 'cert-1',
        userId: 'user-1',
        title: 'Certificate 1',
        description: 'Description',
        issued_date: new Date(),
        user: {
          user_id: 'user-1',
          name: 'User 1',
          email: 'user1@example.com',
        },
      };

      vi.mocked(prisma.certificate.findUnique).mockResolvedValue(mockCertificate);

      const result = await certificatesService.getCertificateById('cert-1');

      expect(result).toEqual(mockCertificate);
      expect(prisma.certificate.findUnique).toHaveBeenCalledWith({
        where: { certificate_id: 'cert-1' },
        include: {
          user: {
            select: {
              user_id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });

    it('throws error when certificate not found', async () => {
      vi.mocked(prisma.certificate.findUnique).mockResolvedValue(null);

      await expect(certificatesService.getCertificateById('nonexistent')).rejects.toThrow('Certificate not found');
    });
  });

  describe('issueCertificate', () => {
    it('issues certificate with signed token', async () => {
      const mockCertificate = {
        certificate_id: 'cert-1',
        userId: 'user-1',
        title: 'Completion Certificate',
        description: 'Successfully completed program',
        signed_token: 'signed-token-123',
        issued_by: 'admin-1',
        valid_until: null,
        issued_date: new Date(),
        user: {
          user_id: 'user-1',
          name: 'User 1',
          email: 'user1@example.com',
        },
      };

      vi.mocked(unlockService.generateCertificateToken).mockReturnValue('signed-token-123');
      vi.mocked(prisma.certificate.create).mockResolvedValue(mockCertificate);
      vi.mocked(prisma.auditEvent.create).mockResolvedValue({});

      const result = await certificatesService.issueCertificate({
        userId: 'user-1',
        title: 'Completion Certificate',
        description: 'Successfully completed program',
        issuedBy: 'admin-1',
      });

      expect(result).toEqual(mockCertificate);
      expect(unlockService.generateCertificateToken).toHaveBeenCalledWith('user-1', 0);
      expect(prisma.certificate.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          title: 'Completion Certificate',
          description: 'Successfully completed program',
          signed_token: 'signed-token-123',
          issued_by: 'admin-1',
          valid_until: undefined,
        },
        include: {
          user: {
            select: {
              user_id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });

    it('creates audit log for certificate issuance', async () => {
      const mockCertificate = {
        certificate_id: 'cert-1',
        userId: 'user-1',
        title: 'Completion Certificate',
        signed_token: 'signed-token-123',
        issued_by: 'admin-1',
        user: {
          user_id: 'user-1',
          name: 'User 1',
          email: 'user1@example.com',
        },
      };

      vi.mocked(unlockService.generateCertificateToken).mockReturnValue('signed-token-123');
      vi.mocked(prisma.certificate.create).mockResolvedValue(mockCertificate);
      vi.mocked(prisma.auditEvent.create).mockResolvedValue({});

      await certificatesService.issueCertificate({
        userId: 'user-1',
        title: 'Completion Certificate',
        issuedBy: 'admin-1',
      });

      expect(prisma.auditEvent.create).toHaveBeenCalledWith({
        data: {
          entity: 'Certificate',
          entity_id: 'cert-1',
          action: 'issued',
          payload: {
            issued_to: 'user-1',
            issued_by: 'admin-1',
            title: 'Completion Certificate',
          },
        },
      });
    });

    it('issues certificate with valid until date', async () => {
      const validUntil = new Date('2025-12-31');
      const mockCertificate = {
        certificate_id: 'cert-1',
        userId: 'user-1',
        title: 'Certificate',
        signed_token: 'signed-token-123',
        issued_by: 'admin-1',
        valid_until: validUntil,
        user: {
          user_id: 'user-1',
          name: 'User 1',
          email: 'user1@example.com',
        },
      };

      vi.mocked(unlockService.generateCertificateToken).mockReturnValue('signed-token-123');
      vi.mocked(prisma.certificate.create).mockResolvedValue(mockCertificate);
      vi.mocked(prisma.auditEvent.create).mockResolvedValue({});

      const result = await certificatesService.issueCertificate({
        userId: 'user-1',
        title: 'Certificate',
        issuedBy: 'admin-1',
        validUntil,
      });

      expect(result.valid_until).toEqual(validUntil);
    });
  });

  describe('verifyCertificate', () => {
    it('verifies valid certificate', () => {
      const mockPayload = {
        userId: 'user-1',
        level: 5,
      };

      vi.mocked(unlockService.verifyCertificateToken).mockReturnValue(mockPayload);

      const result = certificatesService.verifyCertificate('cert-1', 'signed-token-123');

      expect(result.valid).toBe(true);
      expect(result.payload).toEqual(mockPayload);
      expect(unlockService.verifyCertificateToken).toHaveBeenCalledWith('signed-token-123');
    });

    it('rejects invalid certificate', () => {
      vi.mocked(unlockService.verifyCertificateToken).mockReturnValue(null);

      const result = certificatesService.verifyCertificate('cert-1', 'invalid-token');

      expect(result.valid).toBe(false);
      expect(result.payload).toBeNull();
    });

    it('rejects expired certificate', () => {
      vi.mocked(unlockService.verifyCertificateToken).mockReturnValue(undefined);

      const result = certificatesService.verifyCertificate('cert-1', 'expired-token');

      expect(result.valid).toBe(false);
    });
  });

  describe('getUserProgress', () => {
    it('returns certificates and level progress', async () => {
      const mockCertificates = [
        {
          certificate_id: 'cert-1',
          userId: 'user-1',
          title: 'Certificate 1',
          issued_date: new Date(),
        },
      ];

      const mockLevelProgress = {
        current_level: 5,
        total_points: 250,
        points_to_next_level: 50,
      };

      vi.mocked(prisma.certificate.findMany).mockResolvedValue(mockCertificates);
      vi.mocked(unlockService.getLevelProgress).mockResolvedValue(mockLevelProgress);

      const result = await certificatesService.getUserProgress('user-1');

      expect(result.certificates).toEqual(mockCertificates);
      expect(result.level).toEqual(mockLevelProgress);
      expect(unlockService.getLevelProgress).toHaveBeenCalledWith('user-1');
    });

    it('handles user with no certificates', async () => {
      const mockLevelProgress = {
        current_level: 1,
        total_points: 0,
        points_to_next_level: 100,
      };

      vi.mocked(prisma.certificate.findMany).mockResolvedValue([]);
      vi.mocked(unlockService.getLevelProgress).mockResolvedValue(mockLevelProgress);

      const result = await certificatesService.getUserProgress('user-1');

      expect(result.certificates).toEqual([]);
      expect(result.level).toEqual(mockLevelProgress);
    });
  });
});
