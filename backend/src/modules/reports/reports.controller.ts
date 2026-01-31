import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { reportsService } from './reports.service';
import { parseOrRespond } from '../../utils/validation';

const generateReportSchema = z.object({
  userStory: z.string().min(10, 'Bitte beschreiben Sie Ihre Situation ausführlicher'),
  periodStart: z.string().datetime().optional(),
  periodEnd: z.string().datetime().optional(),
});

export const reportsController = {
  async generate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = parseOrRespond(generateReportSchema, req.body, res);
      if (!body) return;

      const userId = req.user?.user_id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const report = await reportsService.generateReport({
        userId,
        userStory: body.userStory,
        periodStart: body.periodStart ? new Date(body.periodStart) : undefined,
        periodEnd: body.periodEnd ? new Date(body.periodEnd) : undefined,
      });

      res.status(201).json({ 
        message: 'Report erfolgreich generiert',
        report,
      });
    } catch (error: any) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.user_id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const reports = await reportsService.getUserReports(userId);
      res.status(200).json({ reports });
    } catch (error: any) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.user_id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const id = req.params.id as string;
      const report = await reportsService.getReportById(id, userId);
      res.status(200).json({ report });
    } catch (error: any) {
      if (error.message === 'Report not found') {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error.message === 'Not authorized') {
        res.status(403).json({ message: error.message });
        return;
      }
      next(error);
    }
  },
};
