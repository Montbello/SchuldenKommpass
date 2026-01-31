import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { usersService } from './users.service';
import { parseOrRespond } from '../../utils/validation';

const idParamSchema = z.object({ id: z.string().min(1) });
const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  date_of_birth: z.string().datetime().optional(),
  disabilities: z.any().optional(),
  consent_data_sharing: z.boolean().optional(),
});
const addSkillSchema = z.object({
  category: z.string().min(1),
  description: z.string().min(1).optional(),
});

export const usersController = {
  // GET /api/users/:id
  async getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = parseOrRespond(idParamSchema, req.params, res);
      if (!params) return;
      const id = params.id;
      const user = await usersService.getUser(id);
      res.json(user);
    } catch (error: any) {
      next(error);
    }
  },

  // PATCH /api/users/:id
  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = parseOrRespond(idParamSchema, req.params, res);
      if (!params) return;
      const body = parseOrRespond(updateUserSchema, req.body, res);
      if (!body) return;
      const updateData = {
        ...body,
        date_of_birth: body.date_of_birth ? new Date(body.date_of_birth) : undefined,
      };
      const id = params.id;
      const currentUser = req.user;
      if (!currentUser) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      
      // Only allow users to update their own profile (or admins)
      if (currentUser.user_id !== id && currentUser.role !== 'ADMIN') {
        res.status(403).json({ message: 'Not authorized' });
        return;
      }

      const user = await usersService.updateUser(id, updateData);
      res.json(user);
    } catch (error: any) {
      next(error);
    }
  },

  // GET /api/users/:id/skills
  async getUserSkills(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = parseOrRespond(idParamSchema, req.params, res);
      if (!params) return;
      const id = params.id;
      const skills = await usersService.getUserSkills(id);
      res.json(skills);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  // POST /api/skills
  async addSkill(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.user_id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const body = parseOrRespond(addSkillSchema, req.body, res);
      if (!body) return;
      const skill = await usersService.addSkill(userId, body);
      res.status(201).json(skill);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  // DELETE /api/skills/:id
  async deleteSkill(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = parseOrRespond(idParamSchema, req.params, res);
      if (!params) return;
      const id = params.id;
      const userId = req.user?.user_id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      await usersService.deleteSkill(id, userId);
      res.json({ message: 'Skill deleted' });
    } catch (error: any) {
      next(error);
    }
  },
};
