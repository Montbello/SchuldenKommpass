import { Router } from 'express';
import { usersController } from './users.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

// User profile routes
router.get('/:id', authMiddleware, usersController.getUser);
router.patch('/:id', authMiddleware, usersController.updateUser);
router.get('/:id/skills', authMiddleware, usersController.getUserSkills);

export default router;
