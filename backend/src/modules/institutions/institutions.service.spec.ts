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
    progress: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn()
    },
    certificate: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn()
    },
    appointment: {
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




import { InstitutionsService } from './institutions.service';
import prisma from '../../prismaClient';

describe('InstitutionsService', () => {
  let service: InstitutionsService;

  beforeEach(() => {
    vi.clearAllMocks();
service = new InstitutionsService();
    });

  describe('getInstitutionUsers', () => {
    it('returns users with pagination', async () => {
      const mockUsers = [
        {
          user_id: 'user-1',
          name: 'User 1',
          email: 'user1@example.com',
          status: 'ACTIVE',
          onboarding_status: 'APPROVED',
          stability_score: 85,
          level: 3,
          total_points: 150,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers);
      vi.mocked(prisma.user.count).mockResolvedValue(25);

      const result = await service.getInstitutionUsers({
        institutionId: 'inst-1',
        page: 1,
        limit: 20,
      });

      expect(result.users).toEqual(mockUsers);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 25,
        total_pages: 2,
      });
    });

    it('filters users by status', async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValue([]);
      vi.mocked(prisma.user.count).mockResolvedValue(0);

      await service.getInstitutionUsers({
        institutionId: 'inst-1',
        status: 'ACTIVE',
      });

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            institution_id: 'inst-1',
            status: 'ACTIVE',
          }),
        })
      );
    });

    it('filters users by onboarding status', async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValue([]);
      vi.mocked(prisma.user.count).mockResolvedValue(0);

      await service.getInstitutionUsers({
        institutionId: 'inst-1',
        onboarding_status: 'APPROVED',
      });

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            institution_id: 'inst-1',
            onboarding_status: 'APPROVED',
          }),
        })
      );
    });

    it('searches users by name or email', async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValue([]);
      vi.mocked(prisma.user.count).mockResolvedValue(0);

      await service.getInstitutionUsers({
        institutionId: 'inst-1',
        search: 'john',
      });

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            institution_id: 'inst-1',
            OR: [
              { name: { contains: 'john', mode: 'insensitive' } },
              { email: { contains: 'john', mode: 'insensitive' } },
            ],
          }),
        })
      );
    });

    it('handles pagination correctly', async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValue([]);
      vi.mocked(prisma.user.count).mockResolvedValue(0);

      await service.getInstitutionUsers({
        institutionId: 'inst-1',
        page: 3,
        limit: 10,
      });

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20, // (3 - 1) * 10
          take: 10,
        })
      );
    });
  });

  describe('getUserProgress', () => {
    it('returns detailed user progress', async () => {
      const mockUser = {
        user_id: 'user-1',
        name: 'User 1',
        email: 'user1@example.com',
        level: 3,
        total_points: 150,
        onboarding_status: 'APPROVED',
        stability_score: 85,
        created_at: new Date(),
      };

      const mockProgresses = [
        {
          progress_id: 'prog-1',
          task: { title: 'Task 1', description: 'Description' },
          status: 'completed',
          points_earned: 10,
          updated_at: new Date(),
        },
      ];

      const mockCertificates = [
        {
          certificate_id: 'cert-1',
          title: 'Certificate 1',
          issued_date: new Date(),
        },
      ];

      const mockAppointments = [
        {
          appointment_id: 'appt-1',
          start_time: new Date(),
          status: 'scheduled',
          advisor: { name: 'Advisor' },
        },
      ];

      const mockDocuments = [
        {
          document_id: 'doc-1',
          document_category: 'PROOF_FINANCIAL',
          verification_status: 'approved',
          uploaded_at: new Date(),
        },
      ];

      vi.mocked(prisma.user.findFirst).mockResolvedValue(mockUser);
      vi.mocked(prisma.progress.findMany).mockResolvedValue(mockProgresses);
      vi.mocked(prisma.certificate.findMany).mockResolvedValue(mockCertificates);
      vi.mocked(prisma.appointment.findMany).mockResolvedValue(mockAppointments);
      vi.mocked(prisma.document.findMany).mockResolvedValue(mockDocuments);

      const result = await service.getUserProgress('user-1', 'inst-1');

      expect(result).not.toBeNull();
      expect(result?.user).toEqual(mockUser);
      expect(result?.progresses).toEqual(mockProgresses);
      expect(result?.certificates).toEqual(mockCertificates);
      expect(result?.appointments).toEqual(mockAppointments);
      expect(result?.documents).toEqual(mockDocuments);
    });

    it('returns null when user not in institution', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

      const result = await service.getUserProgress('user-1', 'inst-1');

      expect(result).toBeNull();
    });

    it('verifies user belongs to institution', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

      await service.getUserProgress('user-1', 'inst-1');

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          user_id: 'user-1',
          institution_id: 'inst-1',
        },
        select: expect.any(Object),
      });
    });
  });

  describe('getInstitutionStatistics', () => {
    it('calculates institution statistics', async () => {
      const mockUsers = [
        {
          onboarding_status: 'APPROVED',
          level: 3,
          total_points: 150,
        },
        {
          onboarding_status: 'APPROVED',
          level: 2,
          total_points: 80,
        },
        {
          onboarding_status: 'PENDING_REVIEW',
          level: 1,
          total_points: 20,
        },
      ];

      vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers);

      const result = await service.getInstitutionStatistics('inst-1');

      expect(result.total_users).toBe(3);
      expect(result.onboarding_completed).toBe(2);
      expect(result.average_level).toBe(2.0);
      expect(result.total_points).toBe(250);
      expect(result.status_distribution).toEqual({
        APPROVED: 2,
        PENDING_REVIEW: 1,
      });
    });

    it('handles empty institution', async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValue([]);

      const result = await service.getInstitutionStatistics('inst-1');

      expect(result.total_users).toBe(0);
      expect(result.onboarding_completed).toBe(0);
      expect(result.total_points).toBe(0);
    });

    it('rounds average level to one decimal', async () => {
      const mockUsers = [
        { onboarding_status: 'APPROVED', level: 3, total_points: 100 },
        { onboarding_status: 'APPROVED', level: 2, total_points: 50 },
        { onboarding_status: 'APPROVED', level: 2, total_points: 75 },
      ];

      vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers);

      const result = await service.getInstitutionStatistics('inst-1');

      expect(result.average_level).toBe(2.3);
    });
  });

  describe('generateInstitutionReportData', () => {
    it('generates report data for period', async () => {
      const periodStart = new Date('2024-01-01');
      const periodEnd = new Date('2024-12-31');

      const mockUsers = [
        {
          user_id: 'user-1',
          name: 'User 1',
          email: 'user1@example.com',
          level: 3,
          total_points: 150,
          progresses: [
            {
              progress_id: 'prog-1',
              task: { title: 'Task 1' },
              updated_at: new Date('2024-06-01'),
            },
          ],
          certificates: [
            {
              certificate_id: 'cert-1',
              issued_date: new Date('2024-07-01'),
            },
          ],
        },
      ];

      vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers);

      const result = await service.generateInstitutionReportData('inst-1', periodStart, periodEnd);

      expect(result.institution_id).toBe('inst-1');
      expect(result.period.start).toEqual(periodStart);
      expect(result.period.end).toEqual(periodEnd);
      expect(result.summary.total_users).toBe(1);
      expect(result.summary.total_progresses).toBe(1);
      expect(result.summary.total_certificates).toBe(1);
      expect(result.users).toHaveLength(1);
      expect(result.users[0].progresses_count).toBe(1);
      expect(result.users[0].certificates_count).toBe(1);
    });

    it('filters data by period', async () => {
      const periodStart = new Date('2024-01-01');
      const periodEnd = new Date('2024-12-31');

      vi.mocked(prisma.user.findMany).mockResolvedValue([]);

      await service.generateInstitutionReportData('inst-1', periodStart, periodEnd);

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          institution_id: 'inst-1',
          created_at: {
            gte: periodStart,
            lte: periodEnd,
          },
        },
        include: expect.any(Object),
      });
    });
  });
});
