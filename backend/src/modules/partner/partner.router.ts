import { Router } from 'express';
import { partnerController } from './partner.controller';
import { verifyPartnerWebhook, verifyPartnerToken, partnerRateLimiter } from '../../middleware/partner-auth.middleware';

const router = Router();

// Webhook endpoints (use HMAC signature verification)
router.post('/webhook/job-offer', verifyPartnerWebhook, partnerRateLimiter, partnerController.handleJobOffer);
router.post('/webhook/match-confirm', verifyPartnerWebhook, partnerRateLimiter, partnerController.handleMatchConfirm);

// API endpoints (use Bearer token authentication)
router.get('/tasks', verifyPartnerToken, partnerRateLimiter, partnerController.getTasks);

export { router as partnerRouter };
