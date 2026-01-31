import { Router } from 'express';
import { tasksController } from './tasks.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/authorize.middleware';

const router = Router();

// Public-ish routes (still need auth)
router.get('/', authMiddleware, tasksController.getTasks);
router.get('/:id', authMiddleware, tasksController.getTask);

// Admin/Advisor only
router.post('/', authMiddleware, authorize('ADMIN', 'ADVISOR'), tasksController.createTask);
router.patch('/:id', authMiddleware, authorize('ADMIN'), tasksController.updateTask);
router.delete('/:id', authMiddleware, authorize('ADMIN'), tasksController.deleteTask);

export default router;
