import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { matchesService } from './matches.service';
import { parseOrRespond } from '../../utils/validation';

const idParamSchema = z.object({ id: z.string().min(1) });
const getMatchesQuerySchema = z.object({ userId: z.string().min(1).optional() });
const createMatchSchema = z.object({
  taskId: z.string().min(1),
  userId: z.string().min(1),
  score: z.number().min(0).max(1).default(0.5),
});
const updateMatchSchema = z.object({
  status: z.string().min(1),
});

export const matchesController = {
  // GET /api/matches?userId=
  async getMatches(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const query = parseOrRespond(getMatchesQuerySchema, req.query, res);
      if (!query) return;
      const { userId } = query;

      // Users can only see their own matches (unless admin)
      const targetUserId = userId as string || currentUser.user_id;
      if (targetUserId !== currentUser.user_id && currentUser.role !== 'ADMIN') {
        res.status(403).json({ message: 'Not authorized' });
        return;
      }

      const matches = await matchesService.getMatches(targetUserId);
      res.json(matches);
    } catch (error: any) {
      next(error);
    }
  },

  // GET /api/matches/:id
  async getMatch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = parseOrRespond(idParamSchema, req.params, res);
      if (!params) return;
      const id = params.id;
      const match = await matchesService.getMatch(id);
      res.json(match);
    } catch (error: any) {
      next(error);
    }
  },

  // POST /api/matches (Admin/System creates matches)
  async createMatch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // Only admin can manually create matches
      if (user.role !== 'ADMIN' && user.role !== 'ADVISOR') {
        res.status(403).json({ message: 'Not authorized' });
        return;
      }

      const body = parseOrRespond(createMatchSchema, req.body, res);
      if (!body) return;
      const match = await matchesService.createMatch(body);
      res.status(201).json(match);
    } catch (error: any) {
      next(error);
    }
  },

  // PATCH /api/matches/:id (User accepts/rejects)
  async updateMatch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = parseOrRespond(idParamSchema, req.params, res);
      if (!params) return;
      const body = parseOrRespond(updateMatchSchema, req.body, res);
      if (!body) return;
      const id = params.id;
      const { status } = body;
      const userId = req.user?.user_id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const match = await matchesService.updateMatchStatus(id, userId, status);
      res.json(match);
    } catch (error: any) {
      next(error);
    }
  },

  // POST /api/matches/generate (Generate matches for current user)
  async generateMatches(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.user_id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const matches = await matchesService.generateMatches(userId);
      res.json({ generated: matches.length, matches });
    } catch (error: any) {
      next(error);
    }
  },
};
