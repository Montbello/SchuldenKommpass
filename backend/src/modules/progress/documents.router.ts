import { Router } from 'express';
import { progressController } from './progress.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { upload } from './progress.router';

const router = Router();

// Document upload route
router.post('/', authMiddleware, upload.single('file'), progressController.uploadDocument);

export default router;
