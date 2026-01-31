import { Router } from 'express';
import { reportsController } from './reports.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// POST /api/reports/generate - Generate a new report with Gemini
router.post('/generate', reportsController.generate);

// GET /api/reports - List user's reports
router.get('/', reportsController.list);

// GET /api/reports/:id - Get specific report
router.get('/:id', reportsController.getById);

export default router;
