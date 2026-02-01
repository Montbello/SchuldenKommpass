import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { partnerService } from './partner.service';
import { parseOrRespond } from '../../utils/validation';

interface PartnerRequest extends Request {
  partner?: {
    org_id: string;
    name: string;
    type: string;
  };
}

const jobOfferSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  required_skill: z.string().optional(),
  estimated_time: z.number().int().positive().optional(),
  partner_ref_id: z.string().optional(),
});

const matchConfirmSchema = z.object({
  match_id: z.string().uuid(),
  accepted: z.boolean(),
  notes: z.string().optional(),
});

export const partnerController = {
  /**
   * POST /partner/webhook/job-offer
   * Partner submits a new job offer
   */
  async handleJobOffer(req: PartnerRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const partnerId = req.partner?.org_id;
      if (!partnerId) {
        res.status(401).json({ error: 'Partner not authenticated' });
        return;
      }

      const body = parseOrRespond(jobOfferSchema, req.body, res);
      if (!body) return;

      const result = await partnerService.handleJobOffer(partnerId, body);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      next(error);
    }
  },

  /**
   * POST /partner/webhook/match-confirm
   * Partner confirms or rejects a match
   */
  async handleMatchConfirm(req: PartnerRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const partnerId = req.partner?.org_id;
      if (!partnerId) {
        res.status(401).json({ error: 'Partner not authenticated' });
        return;
      }

      const body = parseOrRespond(matchConfirmSchema, req.body, res);
      if (!body) return;

      const result = await partnerService.handleMatchConfirm(partnerId, body);
      res.json({ success: true, data: result });
    } catch (error: any) {
      next(error);
    }
  },

  /**
   * GET /partner/tasks
   * Get partner's submitted tasks
   */
  async getTasks(req: PartnerRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const partnerId = req.partner?.org_id;
      if (!partnerId) {
        res.status(401).json({ error: 'Partner not authenticated' });
        return;
      }

      const tasks = await partnerService.getPartnerTasks(partnerId);
      res.json({ success: true, data: tasks });
    } catch (error: any) {
      next(error);
    }
  },
};
