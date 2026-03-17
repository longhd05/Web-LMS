import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, optionalAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

const syncLibrarySchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  type: z.enum(['READING', 'INTEGRATION']),
  tags: z.array(z.string()).optional(),
  level: z.string().optional(),
});

router.post('/sync', authenticate, requireRole('TEACHER', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
  const parsed = syncLibrarySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { title, content, type, tags, level } = parsed.data;

  const existing = await prisma.libraryItem.findFirst({
    where: { title, type },
  });

  if (existing) {
    res.json({ data: { ...existing, tags: JSON.parse(existing.tags) } });
    return;
  }

  const created = await prisma.libraryItem.create({
    data: {
      title,
      content,
      type,
      level: level ?? '',
      tags: JSON.stringify(tags ?? []),
    },
  });

  res.status(201).json({ data: { ...created, tags: JSON.parse(created.tags) } });
});

router.get('/', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  const { search, page = '1', limit = '10', type } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const conditions: object[] = [];
  if (search) {
    conditions.push({
      OR: [
        { title: { contains: search } },
        { tags: { contains: search } },
        { level: { contains: search } },
      ],
    });
  }
  if (type) {
    conditions.push({ type });
  }
  let where: object = {};
  if (conditions.length === 1) {
    where = conditions[0];
  } else if (conditions.length > 1) {
    where = { AND: conditions };
  }

  const [items, total] = await Promise.all([
    prisma.libraryItem.findMany({ where, skip, take: limitNum, orderBy: { createdAt: 'desc' } }),
    prisma.libraryItem.count({ where }),
  ]);

  res.json({
    data: items.map((item) => ({ ...item, tags: JSON.parse(item.tags) })),
    meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
});

router.get('/:id', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  const item = await prisma.libraryItem.findUnique({ where: { id: req.params.id } });
  if (!item) {
    res.status(404).json({ error: 'Library item not found' });
    return;
  }
  res.json({ data: { ...item, tags: JSON.parse(item.tags) } });
});

export default router;
