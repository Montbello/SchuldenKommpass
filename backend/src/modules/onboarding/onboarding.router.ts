import { Router } from 'express';
import { onboardingController } from './onboarding.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/authorize.middleware';

const router = Router();

// Public routes
router.post('/start', onboardingController.start);

// Authenticated user routes
router.post('/step/basic', authenticate, onboardingController.stepBasic);
router.post('/step/documents', authenticate, onboardingController.stepDocuments);
router.post('/step/skills', authenticate, onboardingController.stepSkills);
router.post('/step/story', authenticate, onboardingController.stepStory);
router.get('/status', authenticate, onboardingController.getStatus);

// Admin/Advisor routes
router.get(
  '/status/:userId',
  authenticate,
  authorize(['ADMIN', 'ADVISOR']),
  onboardingController.getUserStatus
);

router.patch(
  '/:userId/status',
  authenticate,
  authorize(['ADMIN', 'ADVISOR']),
  onboardingController.updateStatus
);

export { router as onboardingRouter };
