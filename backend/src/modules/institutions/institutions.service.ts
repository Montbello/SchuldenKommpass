import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface InstitutionUserFilter {
  institutionId: string;
  status?: string;
  onboarding_status?: string;
  search?: string; // Search in name/email
  page?: number;
  limit?: number;
}

export interface UserProgressDetail {
  user: {
    user_id: string;
    name: string | null;
    email: string;
    level: number;
    total_points: number;
    onboarding_status: string;
    stability_score: number | null;
    created_at: Date;
  };
  progresses: Array<{
    progress_id: string;
    task: {
      title: string;
      description: string | null;
    };
    status: string;
    points_earned: number | null;
    updated_at: Date;
  }>;
  certificates: Array<{
    certificate_id: string;
    title: string;
    issued_date: Date;
  }>;
  appointments: Array<{
    appointment_id: string;
    start_time: Date;
    status: string;
    advisor: {
      name: string | null;
    } | null;
  }>;
  documents: Array<{
    document_id: string;
    document_category: string;
    verification_status: string | null;
    uploaded_at: Date;
  }>;
}

export class InstitutionsService {
  /**
   * Holt alle User, die einer Institution zugewiesen sind
   * Mit Filtering und Pagination
   */
  async getInstitutionUsers(filter: InstitutionUserFilter) {
    const { institutionId, status, onboarding_status, search, page = 1, limit = 20 } = filter;

    const where: any = {
      institution_id: institutionId,
    };

    if (status) {
      where.status = status;
    }

    if (onboarding_status) {
      where.onboarding_status = onboarding_status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          user_id: true,
          name: true,
          email: true,
          status: true,
          onboarding_status: true,
          stability_score: true,
          level: true,
          total_points: true,
          created_at: true,
          updated_at: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Holt detaillierte Informationen zu einem User
   * Nur wenn User der Institution zugewiesen ist
   */
  async getUserProgress(userId: string, institutionId: string): Promise<UserProgressDetail | null> {
    // Prüfen, ob User dieser Institution zugewiesen ist
    const user = await prisma.user.findFirst({
      where: {
        user_id: userId,
        institution_id: institutionId,
      },
      select: {
        user_id: true,
        name: true,
        email: true,
        level: true,
        total_points: true,
        onboarding_status: true,
        stability_score: true,
        created_at: true,
      },
    });

    if (!user) {
      return null;
    }

    // Fortschritt, Zertifikate, Termine, Dokumente laden
    const [progresses, certificates, appointments, documents] = await Promise.all([
      prisma.progress.findMany({
        where: { userId },
        include: {
          task: {
            select: {
              title: true,
              description: true,
            },
          },
        },
        orderBy: { updated_at: 'desc' },
        take: 50, // Limit für Performance
      }),
      prisma.certificate.findMany({
        where: { userId },
        select: {
          certificate_id: true,
          title: true,
          issued_date: true,
        },
        orderBy: { issued_date: 'desc' },
      }),
      prisma.appointment.findMany({
        where: { userId },
        include: {
          advisor: {
            select: { name: true },
          },
        },
        orderBy: { start_time: 'desc' },
        take: 20,
      }),
      prisma.document.findMany({
        where: { userId },
        select: {
          document_id: true,
          document_category: true,
          verification_status: true,
          uploaded_at: true,
        },
        orderBy: { uploaded_at: 'desc' },
        take: 50,
      }),
    ]);

    return {
      user,
      progresses,
      certificates,
      appointments,
      documents,
    };
  }

  /**
   * Statistiken für Institution Dashboard
   */
  async getInstitutionStatistics(institutionId: string) {
    const users = await prisma.user.findMany({
      where: { institution_id: institutionId },
      select: {
        onboarding_status: true,
        level: true,
        total_points: true,
      },
    });

    const totalUsers = users.length;
    const onboardingCompleted = users.filter((u) => u.onboarding_status === 'APPROVED').length;
    const averageLevel = users.reduce((sum, u) => sum + u.level, 0) / (totalUsers || 1);
    const totalPoints = users.reduce((sum, u) => sum + u.total_points, 0);

    // Status-Verteilung
    const statusDistribution = users.reduce((acc, u) => {
      acc[u.onboarding_status] = (acc[u.onboarding_status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total_users: totalUsers,
      onboarding_completed: onboardingCompleted,
      average_level: Math.round(averageLevel * 10) / 10,
      total_points: totalPoints,
      status_distribution: statusDistribution,
    };
  }

  /**
   * Generiert Report-Daten für eine Institution
   * (Wird später von reports.service erweitert)
   */
  async generateInstitutionReportData(institutionId: string, periodStart: Date, periodEnd: Date) {
    const users = await prisma.user.findMany({
      where: {
        institution_id: institutionId,
        created_at: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      include: {
        progresses: {
          where: {
            updated_at: {
              gte: periodStart,
              lte: periodEnd,
            },
          },
          include: {
            task: {
              select: { title: true },
            },
          },
        },
        certificates: {
          where: {
            issued_date: {
              gte: periodStart,
              lte: periodEnd,
            },
          },
        },
      },
    });

    return {
      period: { start: periodStart, end: periodEnd },
      institution_id: institutionId,
      summary: {
        total_users: users.length,
        total_progresses: users.reduce((sum, u) => sum + u.progresses.length, 0),
        total_certificates: users.reduce((sum, u) => sum + u.certificates.length, 0),
      },
      users: users.map((u) => ({
        user_id: u.user_id,
        name: u.name,
        email: u.email,
        level: u.level,
        total_points: u.total_points,
        progresses_count: u.progresses.length,
        certificates_count: u.certificates.length,
      })),
    };
  }
}
