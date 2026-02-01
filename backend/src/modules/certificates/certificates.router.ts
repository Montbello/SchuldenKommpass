import { Router } from 'express';
import { certificatesController } from './certificates.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/authorize.middleware';

const router = Router();

// All certificate routes require authentication
router.get('/', authenticate, certificatesController.getCertificates);
router.get('/progress/:userId', authenticate, certificatesController.getUserProgress);
router.get('/:id', authenticate, certificatesController.getCertificate);

// Issuing certificates - Admin/Advisor only
router.post(
  '/',
  authenticate,
  authorize(['ADMIN', 'ADVISOR']),
  certificatesController.issueCertificate
);

// Verify certificate - Public (no auth required)
router.post('/verify', certificatesController.verifyCertificate);

export { router as certificatesRouter };
