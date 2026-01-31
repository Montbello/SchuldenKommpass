import express, { Express, Request, Response } from 'express';
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
import { errorMiddleware } from './middleware/error.middleware';
import cookieParser from 'cookie-parser';
import { csrfMiddleware } from './middleware/csrf.middleware';


const app: Express = express();
const port = config.port;

app.use(cors());
app.use(express.json());
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

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Schuldenkompass Backend is running!' });
});
// Centralized error handler
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
