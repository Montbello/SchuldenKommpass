import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

/**
 * Global Rate Limiter
 * Limits requests per IP to prevent abuse
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.',
    retryAfter: 15,
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/api/health';
  },
});

/**
 * Stricter rate limiter for auth endpoints
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Only 10 auth attempts per 15 minutes
  message: {
    error: 'Too many authentication attempts',
    message: 'Zu viele Anmeldeversuche. Bitte warten Sie 15 Minuten.',
    retryAfter: 15,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * API rate limiter for partner/webhook endpoints
 */
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 requests per hour for API clients
  message: {
    error: 'API rate limit exceeded',
    message: 'API-Limit erreicht. Bitte warten Sie.',
  },
  keyGenerator: (req) => {
    // Use API key or IP for rate limiting
    return (req.headers['x-api-key'] as string) || req.ip || 'unknown';
  },
});

/**
 * Security Headers Middleware
 * Sets various security-related HTTP headers
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://meet.jit.si", // Allow Jitsi for video
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.daily.co https://*.jit.si wss://*.jit.si",
      "frame-src 'self' https://meet.jit.si https://*.daily.co",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests",
    ].join('; ')
  );

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // XSS Protection (legacy but still useful)
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy (formerly Feature-Policy)
  res.setHeader(
    'Permissions-Policy',
    'camera=(self), microphone=(self), geolocation=(), payment=()'
  );

  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');

  // HSTS (HTTP Strict Transport Security) - only in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  next();
}

/**
 * CORS configuration for production
 */
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://app.schuldenkompass.de',
      'https://schuldenkompass.de',
      // Add frontend URL from environment (for Vercel/Netlify)
      ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
      // Allow all Vercel preview URLs
      ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ].filter(Boolean);

    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-API-Key'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
};

/**
 * Request logging middleware (for debugging)
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    
    if (process.env.NODE_ENV !== 'test') {
      console[logLevel](
        `${req.method} ${req.path} ${res.statusCode} ${duration}ms`
      );
    }
  });

  next();
}
