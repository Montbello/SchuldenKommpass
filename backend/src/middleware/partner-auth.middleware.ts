import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { prisma } from '../prismaClient';
import rateLimit from 'express-rate-limit';

interface PartnerRequest extends Request {
  partner?: {
    org_id: string;
    name: string;
    type: string;
  };
}

/**
 * Verify HMAC signature from partner webhook
 */
export async function verifyPartnerWebhook(
  req: PartnerRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const signature = req.headers['x-webhook-signature'] as string;
    const partnerId = req.headers['x-partner-id'] as string;

    if (!signature || !partnerId) {
      res.status(401).json({ error: 'Missing authentication headers' });
      return;
    }

    // Get partner from database
    const partner = await prisma.organisation.findUnique({
      where: { org_id: partnerId },
      select: {
        org_id: true,
        name: true,
        type: true,
        webhook_secret: true,
        active: true,
      },
    });

    if (!partner || !partner.active) {
      res.status(401).json({ error: 'Invalid or inactive partner' });
      return;
    }

    if (!partner.webhook_secret) {
      res.status(401).json({ error: 'Webhook secret not configured for partner' });
      return;
    }

    // Verify HMAC signature
    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', partner.webhook_secret)
      .update(payload)
      .digest('hex');

    if (signature !== expectedSignature) {
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }

    // Attach partner to request
    req.partner = {
      org_id: partner.org_id,
      name: partner.name,
      type: partner.type,
    };

    next();
  } catch (error: any) {
    console.error('Partner auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

/**
 * Verify API token for partner API calls
 */
export async function verifyPartnerToken(
  req: PartnerRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.headers['authorization']?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ error: 'Missing API token' });
      return;
    }

    // Hash the provided token to compare with stored hash
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find partner with this token
    const partner = await prisma.organisation.findFirst({
      where: {
        api_token_hash: tokenHash,
        active: true,
      },
      select: {
        org_id: true,
        name: true,
        type: true,
        rate_limit_per_hour: true,
      },
    });

    if (!partner) {
      res.status(401).json({ error: 'Invalid API token' });
      return;
    }

    // Attach partner to request
    req.partner = {
      org_id: partner.org_id,
      name: partner.name,
      type: partner.type,
    };

    next();
  } catch (error: any) {
    console.error('Partner token auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

/**
 * Rate limiter for partner API
 * Dynamic rate limiting based on partner's configured limit
 */
export const partnerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: async (req: PartnerRequest) => {
    // Get partner's rate limit from database
    if (req.partner?.org_id) {
      const partner = await prisma.organisation.findUnique({
        where: { org_id: req.partner.org_id },
        select: { rate_limit_per_hour: true },
      });
      return partner?.rate_limit_per_hour || 100;
    }
    return 100; // Default
  },
  message: { error: 'Too many requests. Rate limit exceeded.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: PartnerRequest) => {
    return req.partner?.org_id || req.ip || 'unknown';
  },
});

/**
 * Generate API token for a partner
 */
export function generatePartnerApiToken(): { token: string; hash: string } {
  const token = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, hash };
}

/**
 * Generate webhook secret for a partner
 */
export function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}
