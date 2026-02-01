import prisma from '../../prismaClient';
import { unlockService } from '../../services/unlock.service';

export const certificatesService = {
  /**
   * Get all certificates for a user
   */
  async getUserCertificates(userId: string) {
    const certificates = await prisma.certificate.findMany({
      where: { userId },
      orderBy: { issued_date: 'desc' },
    });

    return certificates;
  },

  /**
   * Get a specific certificate by ID
   */
  async getCertificateById(certificateId: string) {
    const certificate = await prisma.certificate.findUnique({
      where: { certificate_id: certificateId },
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

    if (!certificate) {
      throw new Error('Certificate not found');
    }

    return certificate;
  },

  /**
   * Manually issue a certificate (Admin/Advisor only)
   */
  async issueCertificate(data: {
    userId: string;
    title: string;
    description?: string;
    issuedBy: string;
    validUntil?: Date;
  }) {
    const signedToken = unlockService.generateCertificateToken(data.userId, 0);

    const certificate = await prisma.certificate.create({
      data: {
        userId: data.userId,
        title: data.title,
        description: data.description,
        signed_token: signedToken,
        issued_by: data.issuedBy,
        valid_until: data.validUntil,
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

    // Log certificate issuance
    await prisma.auditEvent.create({
      data: {
        entity: 'Certificate',
        entity_id: certificate.certificate_id,
        action: 'issued',
        payload: {
          issued_to: data.userId,
          issued_by: data.issuedBy,
          title: data.title,
        },
      },
    });

    return certificate;
  },

  /**
   * Verify a certificate's authenticity
   */
  verifyCertificate(certificateId: string, signedToken: string) {
    const verified = unlockService.verifyCertificateToken(signedToken);
    
    return {
      valid: !!verified,
      payload: verified,
    };
  },

  /**
   * Get user's level progress and certificates
   */
  async getUserProgress(userId: string) {
    const [certificates, levelProgress] = await Promise.all([
      this.getUserCertificates(userId),
      unlockService.getLevelProgress(userId),
    ]);

    return {
      certificates,
      level: levelProgress,
    };
  },
};
