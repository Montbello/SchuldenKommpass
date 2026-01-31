import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { tasksService } from './tasks.service';
import { parseOrRespond } from '../../utils/validation';

const idParamSchema = z.object({ id: z.string().min(1) });
const getTasksQuerySchema = z.object({
  skill: z.string().min(1).optional(),
});
const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1).optional(),
  required_skill: z.string().min(1).optional(),
  estimated_time: z.number().int().positive().optional(),
  organisationId: z.string().uuid().optional(),  // Link to Organisation
});
const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  required_skill: z.string().min(1).optional(),
  estimated_time: z.number().int().positive().optional(),
  active: z.boolean().optional(),
});

export const tasksController = {
  // GET /api/tasks
  async getTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = parseOrRespond(getTasksQuerySchema, req.query, res);
      if (!query) return;
      const { skill } = query;
      const tasks = await tasksService.getTasks({
        skill: skill as string | undefined,
      });
      res.json(tasks);
    } catch (error: any) {
      next(error);
    }
  },

  // GET /api/tasks/:id
  async getTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = parseOrRespond(idParamSchema, req.params, res);
      if (!params) return;
      const id = params.id;
      const task = await tasksService.getTask(id);
      res.json(task);
    } catch (error: any) {
      next(error);
    }
  },

  // POST /api/tasks (Admin/Advisor only - enforced by authorize middleware)
  async createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!; // Safe: authMiddleware + authorize ensure user exists

      const body = parseOrRespond(createTaskSchema, req.body, res);
      if (!body) return;
      
      const task = await tasksService.createTask({
        ...body,
        createdById: user.user_id,
      });
      res.status(201).json({ success: true, data: task });
    } catch (error: any) {
      next(error);
    }
  },

  // PATCH /api/tasks/:id (Admin only - enforced by authorize middleware)
  async updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = parseOrRespond(idParamSchema, req.params, res);
      if (!params) return;
      const body = parseOrRespond(updateTaskSchema, req.body, res);
      if (!body) return;
      
      const task = await tasksService.updateTask(params.id, body);
      res.json({ success: true, data: task });
    } catch (error: any) {
      next(error);
    }
  },

  // DELETE /api/tasks/:id (soft delete - Admin only - enforced by authorize middleware)
  async deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = parseOrRespond(idParamSchema, req.params, res);
      if (!params) return;
      
      await tasksService.deactivateTask(params.id);
      res.json({ success: true, message: 'Task deactivated' });
    } catch (error: any) {
      next(error);
    }
  },
};
