import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/:communityKey/posts', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  const { communityKey } = req.params;
  const { page = '1', limit = '10' } = req.query as Record<string, string>;
  const currentUserId = req.user?.userId;
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [posts, total] = await Promise.all([
    prisma.communityPost.findMany({
      where: { communityKey },
      include: {
        publisher: { select: { id: true, name: true, avatarUrl: true } },
        submission: {
          include: {
            student: { select: { id: true, name: true, avatarUrl: true } },
            assignment: { include: { libraryItem: true, class: { select: { id: true, name: true } } } },
            review: true,
            integrationFile: true,
          },
        },
        likes: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { id: true },
              take: 1,
            }
          : false,
      },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.communityPost.count({ where: { communityKey } }),
  ]);

  const normalizedPosts = posts.map((post) => {
    const { likes, ...rest } = post as typeof post & { likes?: Array<{ id: string }> };
    return {
      ...rest,
      likedByMe: Boolean(currentUserId && likes && likes.length > 0),
    };
  });

  res.json({
    data: normalizedPosts,
    meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
});

router.get('/:communityKey/posts/:postId', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  const { communityKey, postId } = req.params;

  const post = await prisma.communityPost.findFirst({
    where: { id: postId, communityKey },
    include: {
      publisher: { select: { id: true, name: true, avatarUrl: true } },
      submission: {
        include: {
          student: { select: { id: true, name: true, avatarUrl: true } },
          assignment: { include: { libraryItem: true } },
          review: { include: { teacher: { select: { id: true, name: true } } } },
          integrationFile: true,
        },
      },
    },
  });

  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  res.json({ data: post });
});

router.post('/:communityKey/posts/:postId/like', authenticate, async (req: Request, res: Response): Promise<void> => {
  const { communityKey, postId } = req.params;

  const post = await prisma.communityPost.findFirst({
    where: { id: postId, communityKey },
    select: { id: true },
  });

  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  await prisma.communityPostLike.upsert({
    where: {
      communityPostId_userId: {
        communityPostId: postId,
        userId: req.user!.userId,
      },
    },
    update: {},
    create: {
      communityPostId: postId,
      userId: req.user!.userId,
    },
  });

  res.json({ data: { postId, liked: true } });
});

router.delete('/:communityKey/posts/:postId/like', authenticate, async (req: Request, res: Response): Promise<void> => {
  const { communityKey, postId } = req.params;

  const post = await prisma.communityPost.findFirst({
    where: { id: postId, communityKey },
    select: { id: true },
  });

  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  await prisma.communityPostLike.deleteMany({
    where: {
      communityPostId: postId,
      userId: req.user!.userId,
    },
  });

  res.json({ data: { postId, liked: false } });
});

export default router;
