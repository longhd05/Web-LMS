import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { optionalAuth } from '../middleware/auth';

const router = Router();

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