import { Router } from 'express';
import { usersController } from './users.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

// Skills routes
router.post('/', authMiddleware, usersController.addSkill);
router.delete('/:id', authMiddleware, usersController.deleteSkill);

export default router;
