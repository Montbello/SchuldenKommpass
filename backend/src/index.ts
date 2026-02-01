import express, { Express, Request, Response } from 'express';
import path from 'path';
import { config } from './config';
import cors from 'cors';
import authRouter from './modules/auth/auth.router';
import usersRouter from './modules/users/users.router';
import skillsRouter from './modules/users/skills.router';
import tasksRouter from './modules/tasks/tasks.router';
import matchesRouter from './modules/matches/matches.router';
import { progressRouter } from './modules/progress/progress.router';
import documentsRouter from './modules/progress/documents.router';
import reportsRouter from './modules/reports/reports.router';
import { onboardingRouter } from './modules/onboarding/onboarding.router';
import appointmentsRouter from './modules/appointments/appointments.router';
import { certificatesRouter } from './modules/certificates/certificates.router';
import { partnerRouter } from './modules/partner/partner.router';
import institutionsRouter from './modules/institutions/institutions.router';
import { errorMiddleware } from './middleware/error.middleware';
import cookieParser from 'cookie-parser';
import { csrfMiddleware } from './middleware/csrf.middleware';
import {
  globalRateLimiter,
  securityHeaders,
  corsOptions,
  requestLogger,
} from './middleware/security.middleware';


const app: Express = express();
const port = config.port;

// Security middleware
app.use(securityHeaders);
app.use(globalRateLimiter);
app.use(requestLogger);

// Core middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(csrfMiddleware);

// API routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/skills', skillsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/matches', matchesRouter);
app.use('/api/progress', progressRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/onboarding', onboardingRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/certificates', certificatesRouter);
app.use('/api/partner', partnerRouter);
app.use('/api/institutions', institutionsRouter);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Schuldenkompass Backend is running!' });
});

// Health check endpoint (for CI/CD and monitoring)
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});
// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendPath));
  
  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req: Request, res: Response) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendPath, 'index.html'));
    }
  });
}

// Centralized error handler
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
