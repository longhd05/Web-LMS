import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';

import authRouter from './routes/auth';
import libraryRouter from './routes/library';
import classesRouter from './routes/classes';
import assignmentsRouter from './routes/assignments';
import submissionsRouter, {
  getMySubmissions,
  getSubmissionById,
  reviewSubmission,
  publishSubmission,
} from './routes/submissions';
import filesRouter from './routes/files';
import communityRouter from './routes/community';
import notificationsRouter from './routes/notifications';
import { authenticate } from './middleware/auth';
import { requireRole } from './middleware/rbac';

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow serving uploaded files
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Auth routes (register, login, logout at /auth/*)
// GET /me is at root level
app.use('/auth', authRouter);
app.get('/me', authenticate, async (req, res) => {
  // delegate to the auth router handler
  const { prisma } = await import('./lib/prisma');
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, name: true, email: true, role: true, avatarUrl: true, createdAt: true },
  });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ data: user });
});

app.use('/library', libraryRouter);
app.use('/classes', classesRouter);
app.use('/assignments', assignmentsRouter);

// Nested route: POST /assignments/:assignmentId/submissions
app.use('/assignments/:assignmentId/submissions', submissionsRouter);

// Flat submission routes
app.get('/submissions', authenticate, getMySubmissions);
app.get('/submissions/:id', authenticate, getSubmissionById);
app.post('/submissions/:id/review', authenticate, requireRole('TEACHER'), reviewSubmission);
app.post('/submissions/:id/publish', authenticate, requireRole('TEACHER'), publishSubmission);

app.use('/files', filesRouter);
app.use('/community', communityRouter);
app.use('/notifications', notificationsRouter);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// 404 handler
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
