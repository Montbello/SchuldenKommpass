import { Router } from 'express';
import { matchesController } from './matches.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, matchesController.getMatches);
router.get('/:id', authMiddleware, matchesController.getMatch);
router.post('/', authMiddleware, matchesController.createMatch);
router.post('/generate', authMiddleware, matchesController.generateMatches);
router.patch('/:id', authMiddleware, matchesController.updateMatch);

export default router;
