import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { onboardingService } from './onboarding.service';
import { parseOrRespond } from '../../utils/validation';
import { OnboardingStatus } from '@prisma/client';

const startOnboardingSchema = z.object({
  email: z.string().email(),
  invitationToken: z.string().optional(),
  referredBy: z.string().optional(),
});

const basicDataSchema = z.object({
  name: z.string().min(1),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  disabilities: z.any().optional(),
  consentDataProcessing: z.boolean(),
  consentDataSharing: z.boolean(),
  consentPartnerSharing: z.boolean(),
});

const skillsDataSchema = z.object({
  skills: z.array(z.object({
    category: z.string(),
    description: z.string().optional(),
  })),
});

const storyDataSchema = z.object({
  userStory: z.string().min(10),
});

const updateStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'PENDING_REVIEW']),
  notes: z.string().optional(),
});

export const onboardingController = {
  /**
   * POST /api/onboarding/start
   * Start onboarding process
   */
  async start(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = parseOrRespond(startOnboardingSchema, req.body, res);
      if (!body) return;

      const result = await onboardingService.startOnboarding(body);
      res.status(200).json(result);
    } catch (error: any) {
      next(error);
    }
  },

  /**
   * POST /api/onboarding/step/basic
   * Process basic data step
   */
  async stepBasic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.user_id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const body = parseOrRespond(basicDataSchema, req.body, res);
      if (!body) return;

      const result = await onboardingService.processStep({
        userId,
        step: 'basic',
        data: body,
      });

      res.status(200).json(result);
    } catch (error: any) {
      next(error);
    }
  },

  /**
   * POST /api/onboarding/step/documents
   * Process documents step (documents uploaded separately)
   */
  async stepDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.user_id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const result = await onboardingService.processStep({
        userId,
        step: 'documents',
        data: {},
      });

      res.status(200).json(result);
    } catch (error: any) {
      next(error);
    }
  },

  /**
   * POST /api/onboarding/step/skills
   * Process skills data step
   */
  async stepSkills(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.user_id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const body = parseOrRespond(skillsDataSchema, req.body, res);
      if (!body) return;

      const result = await onboardingService.processStep({
        userId,
        step: 'skills',
        data: body,
      });

      res.status(200).json(result);
    } catch (error: any) {
      next(error);
    }
  },

  /**
   * POST /api/onboarding/step/story
   * Process user story step (final)
   */
  async stepStory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.user_id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const body = parseOrRespond(storyDataSchema, req.body, res);
      if (!body) return;

      const result = await onboardingService.processStep({
        userId,
        step: 'story',
        data: body,
      });

      res.status(200).json(result);
    } catch (error: any) {
      next(error);
    }
  },

  /**
   * GET /api/onboarding/status
   * Get current onboarding status for authenticated user
   */
  async getStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.user_id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const result = await onboardingService.getOnboardingStatus(userId);
      res.status(200).json(result);
    } catch (error: any) {
      next(error);
    }
  },

  /**
   * GET /api/onboarding/status/:userId
   * Get onboarding status for specific user (Admin/Advisor only)
   */
  async getUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      
      const result = await onboardingService.getOnboardingStatus(userId);
      res.status(200).json(result);
    } catch (error: any) {
      next(error);
    }
  },

  /**
   * PATCH /api/onboarding/:userId/status
   * Update onboarding status (Admin/Advisor only)
   */
  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const reviewedBy = req.user?.user_id;
      
      if (!reviewedBy) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const body = parseOrRespond(updateStatusSchema, req.body, res);
      if (!body) return;

      const result = await onboardingService.updateOnboardingStatus(
        userId,
        body.status as OnboardingStatus,
        reviewedBy,
        body.notes
      );

      res.status(200).json({
        message: `Onboarding status updated to ${body.status}`,
        user: result,
      });
    } catch (error: any) {
      next(error);
    }
  },
};
