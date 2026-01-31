import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { progressService } from './progress.service';
import { ProgressStatusCode } from './progress.types';
import path from 'path';
import fs from 'fs';
import { parseOrRespond } from '../../utils/validation';

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export const progressController = {
  // GET /api/progress?userId=
  async getProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const querySchema = z.object({ userId: z.string().min(1).optional() });
      const query = parseOrRespond(querySchema, req.query, res);
      if (!query) return;
      const { userId } = query;

      const targetUserId = userId as string || currentUser.user_id;
      if (targetUserId !== currentUser.user_id && currentUser.role !== 'ADMIN' && currentUser.role !== 'ADVISOR') {
        res.status(403).json({ message: 'Not authorized' });
        return;
      }

      const progress = await progressService.getProgress(targetUserId);
      res.json(progress);
    } catch (error: any) {
      next(error);
    }
  },

  // GET /api/progress/:id
  async getProgressById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const paramsSchema = z.object({ id: z.string().min(1) });
      const params = parseOrRespond(paramsSchema, req.params, res);
      if (!params) return;
      const id = params.id;
      const progress = await progressService.getProgressById(id);
      res.json(progress);
    } catch (error: any) {
      next(error);
    }
  },

  // POST /api/progress
  async createProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.user_id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const bodySchema = z.object({ taskId: z.string().min(1) });
      const body = parseOrRespond(bodySchema, req.body, res);
      if (!body) return;
      const progress = await progressService.createProgress(userId, body);
      res.status(201).json(progress);
    } catch (error: any) {
      next(error);
    }
  },

  // PATCH /api/progress/:id
  async updateProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const paramsSchema = z.object({ id: z.string().min(1) });
      const params = parseOrRespond(paramsSchema, req.params, res);
      if (!params) return;
      const id = params.id;
      const userId = req.user?.user_id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const bodySchema = z.object({
        status: z.nativeEnum(ProgressStatusCode).optional(),
        proofDocumentId: z.string().min(1).optional(),
      });
      const body = parseOrRespond(bodySchema, req.body, res);
      if (!body) return;
      const progress = await progressService.updateProgress(id, userId, body);
      res.json(progress);
    } catch (error: any) {
      next(error);
    }
  },

  // PATCH /api/progress/:id/verify (Advisor/Admin only)
  async verifyProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      if (user.role !== 'ADMIN' && user.role !== 'ADVISOR') {
        res.status(403).json({ message: 'Not authorized' });
        return;
      }

      const paramsSchema = z.object({ id: z.string().min(1) });
      const params = parseOrRespond(paramsSchema, req.params, res);
      if (!params) return;
      const id = params.id;
      const bodySchema = z.object({
        verified: z.boolean(),
        points: z.number().int().nonnegative().optional(),
      });
      const body = parseOrRespond(bodySchema, req.body, res);
      if (!body) return;
      const { verified, points } = body;
      const progress = await progressService.verifyProgress(id, verified, points);
      res.json(progress);
    } catch (error: any) {
      next(error);
    }
  },

  // POST /api/documents (File upload)
  async uploadDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.user_id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const file = req.file;

      if (!file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.mimetype)) {
        // Delete uploaded file
        fs.unlinkSync(file.path);
        res.status(400).json({ message: 'Invalid file type. Only PDF, JPG, PNG allowed.' });
        return;
      }

      // Validate file size (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        fs.unlinkSync(file.path);
        res.status(400).json({ message: 'File too large. Max 5MB.' });
        return;
      }

      // Generate hash
      const fileBuffer = fs.readFileSync(file.path);
      const fileHash = progressService.generateFileHash(fileBuffer);

      const document = await progressService.createDocument(userId, {
        file_path: file.path,
        file_type: file.mimetype,
        description: req.body.description,
        file_hash: fileHash,
      });

      res.status(201).json(document);
    } catch (error: any) {
      next(error);
    }
  },
};
