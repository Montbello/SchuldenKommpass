import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { certificatesService } from './certificates.service';
import { parseOrRespond } from '../../utils/validation';

const issueCertificateSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  validUntil: z.string().datetime().optional(),
});

const verifyCertificateSchema = z.object({
  certificateId: z.string().uuid(),
  signedToken: z.string().min(1),
});

export const certificatesController = {
  /**
   * GET /api/certificates?userId=
   * Get certificates for a user
   */
  async getCertificates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // Allow users to get their own certificates, admins/advisors can get any
      const userId = req.query.userId as string || currentUser.user_id;

      if (userId !== currentUser.user_id && currentUser.role !== 'ADMIN' && currentUser.role !== 'ADVISOR') {
        res.status(403).json({ message: 'Not authorized' });
        return;
      }

      const certificates = await certificatesService.getUserCertificates(userId);
      res.json(certificates);
    } catch (error: any) {
      next(error);
    }
  },

  /**
   * GET /api/certificates/:id
   * Get a specific certificate
   */
  async getCertificate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const certificate = await certificatesService.getCertificateById(id);
      res.json(certificate);
    } catch (error: any) {
      next(error);
    }
  },

  /**
   * POST /api/certificates
   * Issue a certificate (Admin/Advisor only)
   */
  async issueCertificate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const body = parseOrRespond(issueCertificateSchema, req.body, res);
      if (!body) return;

      const certificate = await certificatesService.issueCertificate({
        userId: body.userId,
        title: body.title,
        description: body.description,
        issuedBy: currentUser.user_id,
        validUntil: body.validUntil ? new Date(body.validUntil) : undefined,
      });

      res.status(201).json({ success: true, data: certificate });
    } catch (error: any) {
      next(error);
    }
  },

  /**
   * POST /api/certificates/verify
   * Verify a certificate's authenticity
   */
  async verifyCertificate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = parseOrRespond(verifyCertificateSchema, req.body, res);
      if (!body) return;

      const result = certificatesService.verifyCertificate(
        body.certificateId,
        body.signedToken
      );

      res.json(result);
    } catch (error: any) {
      next(error);
    }
  },

  /**
   * GET /api/certificates/progress/:userId
   * Get user's level progress and certificates
   */
  async getUserProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { userId } = req.params;

      // Allow users to get their own progress, admins/advisors can get any
      if (userId !== currentUser.user_id && currentUser.role !== 'ADMIN' && currentUser.role !== 'ADVISOR') {
        res.status(403).json({ message: 'Not authorized' });
        return;
      }

      const progress = await certificatesService.getUserProgress(userId);
      res.json(progress);
    } catch (error: any) {
      next(error);
    }
  },
};
