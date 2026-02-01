import { Request, Response } from 'express';
import { InstitutionsService } from './institutions.service';
import { reportsService } from '../reports/reports.service';

const institutionsService = new InstitutionsService();

export class InstitutionsController {
  /**
   * GET /institutions/users
   * Holt alle User der Institution (gefiltert nach institution_id des angemeldeten Users)
   */
  async getUsers(req: Request, res: Response) {
    try {
      const institutionUser = (req as any).user; // Authentifizierter User (aus JWT Middleware)

      // Prüfen ob User INSTITUTION-Rolle hat
      if (institutionUser.role !== 'INSTITUTION') {
        return res.status(403).json({
          error: 'Access denied. INSTITUTION role required.',
        });
      }

      // Institution-ID aus dem User-Profil des angemeldeten Users holen
      const institutionId = institutionUser.institution_id;

      if (!institutionId) {
        return res.status(400).json({
          error: 'Institution ID not assigned to user.',
        });
      }

      const { status, onboarding_status, search, page, limit } = req.query;

      const result = await institutionsService.getInstitutionUsers({
        institutionId,
        status: status as string,
        onboarding_status: onboarding_status as string,
        search: search as string,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });

      res.json(result);
    } catch (error: any) {
      console.error('[InstitutionsController] getUsers error:', error);
      res.status(500).json({ error: 'Failed to fetch users', details: error.message });
    }
  }

  /**
   * GET /institutions/users/:userId/progress
   * Holt detaillierten Fortschritt eines Users
   */
  async getUserProgress(req: Request, res: Response) {
    try {
      const institutionUser = (req as any).user;

      if (institutionUser.role !== 'INSTITUTION') {
        return res.status(403).json({
          error: 'Access denied. INSTITUTION role required.',
        });
      }

      const institutionId = institutionUser.institution_id;
      const { userId } = req.params;

      if (!institutionId) {
        return res.status(400).json({
          error: 'Institution ID not assigned to user.',
        });
      }

      const progress = await institutionsService.getUserProgress(userId, institutionId);

      if (!progress) {
        return res.status(404).json({
          error: 'User not found or not assigned to this institution.',
        });
      }

      res.json(progress);
    } catch (error: any) {
      console.error('[InstitutionsController] getUserProgress error:', error);
      res.status(500).json({ error: 'Failed to fetch user progress', details: error.message });
    }
  }

  /**
   * GET /institutions/statistics
   * Statistiken für Institution-Dashboard
   */
  async getStatistics(req: Request, res: Response) {
    try {
      const institutionUser = (req as any).user;

      if (institutionUser.role !== 'INSTITUTION') {
        return res.status(403).json({
          error: 'Access denied. INSTITUTION role required.',
        });
      }

      const institutionId = institutionUser.institution_id;

      if (!institutionId) {
        return res.status(400).json({
          error: 'Institution ID not assigned to user.',
        });
      }

      const stats = await institutionsService.getInstitutionStatistics(institutionId);

      res.json(stats);
    } catch (error: any) {
      console.error('[InstitutionsController] getStatistics error:', error);
      res.status(500).json({ error: 'Failed to fetch statistics', details: error.message });
    }
  }

  /**
   * POST /institutions/reports
   * Generiert einen Report für eine Institution
   */
  async generateReport(req: Request, res: Response) {
    try {
      const institutionUser = (req as any).user;

      if (institutionUser.role !== 'INSTITUTION') {
        return res.status(403).json({
          error: 'Access denied. INSTITUTION role required.',
        });
      }

      const institutionId = institutionUser.institution_id;

      if (!institutionId) {
        return res.status(400).json({
          error: 'Institution ID not assigned to user.',
        });
      }

      const { period_start, period_end } = req.body;

      if (!period_start || !period_end) {
        return res.status(400).json({
          error: 'period_start and period_end are required.',
        });
      }

      const reportData = await institutionsService.generateInstitutionReportData(
        institutionId,
        new Date(period_start),
        new Date(period_end)
      );

      res.json(reportData);
    } catch (error: any) {
      console.error('[InstitutionsController] generateReport error:', error);
      res.status(500).json({ error: 'Failed to generate report', details: error.message });
    }
  }

  /**
   * GET /institutions/users/:userId/report/pdf
   * Downloads PDF report for a specific user
   */
  async downloadUserPDF(req: Request, res: Response) {
    try {
      const institutionUser = (req as any).user;

      if (institutionUser.role !== 'INSTITUTION') {
        return res.status(403).json({
          error: 'Access denied. INSTITUTION role required.',
        });
      }

      const institutionId = institutionUser.institution_id;
      const { userId } = req.params;
      const { period_start, period_end } = req.query;

      if (!institutionId) {
        return res.status(400).json({
          error: 'Institution ID not assigned to user.',
        });
      }

      if (!period_start || !period_end) {
        return res.status(400).json({
          error: 'period_start and period_end query parameters are required.',
        });
      }

      const pdfBuffer = await reportsService.generateInstitutionPDF(
        institutionId,
        userId,
        new Date(period_start as string),
        new Date(period_end as string)
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="report_${userId}.pdf"`);
      res.send(pdfBuffer);
    } catch (error: any) {
      console.error('[InstitutionsController] downloadUserPDF error:', error);
      res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
    }
  }
}
