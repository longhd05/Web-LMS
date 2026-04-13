import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
<<<<<<< HEAD
=======
import { Prisma } from '@prisma/client';
>>>>>>> 759f0102f7546983aade42047c05371718f6ab3c
import { prisma } from '../lib/prisma';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();
<<<<<<< HEAD
const commentCreateLimiter = rateLimit({
  windowMs: 60_000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Quá nhiều bình luận. Vui lòng thử lại sau.' },
=======
const likeActionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip ?? 'unknown',
>>>>>>> 759f0102f7546983aade42047c05371718f6ab3c
});

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
        comments: {
          include: { user: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'desc' },
        },
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
      comments: {
        include: { user: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: 'desc' },
      },
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

<<<<<<< HEAD
router.post('/:communityKey/posts/:postId/comments', commentCreateLimiter, authenticate, async (req: Request, res: Response): Promise<void> => {
  const { communityKey, postId } = req.params;
  const userId = req.user!.userId;
  const content = typeof req.body?.content === 'string' ? req.body.content.trim() : '';

  if (!content) {
    res.status(400).json({ error: 'Nội dung bình luận là bắt buộc' });
    return;
  }

  if (content.length > 5000) {
    res.status(400).json({ error: 'Bình luận quá dài' });
    return;
  }
=======
router.post('/:communityKey/posts/:postId/like', likeActionLimiter, authenticate, async (req: Request, res: Response): Promise<void> => {
  const { communityKey, postId } = req.params;
>>>>>>> 759f0102f7546983aade42047c05371718f6ab3c

  const post = await prisma.communityPost.findFirst({
    where: { id: postId, communityKey },
    select: { id: true },
  });

  if (!post) {
<<<<<<< HEAD
    res.status(404).json({ error: 'Không tìm thấy bài viết' });
    return;
  }

  const comment = await prisma.communityPostComment.create({
    data: {
      postId: post.id,
      userId,
      content,
    },
    include: { user: { select: { id: true, name: true, role: true } } },
  });

  res.status(201).json({ data: comment });
=======
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  try {
    await prisma.communityPostLike.create({
      data: {
        communityPostId: postId,
        userId: req.user!.userId,
      },
    });
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') {
      throw error;
    }
  }

  res.json({ data: { postId, liked: true } });
});

router.delete('/:communityKey/posts/:postId/like', likeActionLimiter, authenticate, async (req: Request, res: Response): Promise<void> => {
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
>>>>>>> 759f0102f7546983aade42047c05371718f6ab3c
});

export default router;
