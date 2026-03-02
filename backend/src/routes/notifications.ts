import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

const markReadSchema = z.object({
  ids: z.array(z.string()).min(1),
});

router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  res.json({
    data: notifications.map((n) => ({
      ...n,
      payload: JSON.parse(n.payloadJson),
    })),
  });
});

router.post('/read', authenticate, async (req: Request, res: Response): Promise<void> => {
  const parsed = markReadSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  await prisma.notification.updateMany({
    where: {
      id: { in: parsed.data.ids },
      userId: req.user!.userId,
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  res.json({ data: { message: 'Notifications marked as read' } });
});

export default router;
