import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { prisma } from '../lib/prisma';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();
const commentCreateLimiter = rateLimit({
  windowMs: 60_000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Quá nhiều bình luận. Vui lòng thử lại sau.' },
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
        likes: {
          where: currentUserId ? { userId: currentUserId } : { userId: '__none__' },
          select: { id: true },
        },
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
      },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.communityPost.count({ where: { communityKey } }),
  ]);

  const serializedPosts = posts.map((post) => {
    const { likes, ...postWithoutLikes } = post;
    return {
      ...postWithoutLikes,
      likedByMe: likes.length > 0,
    };
  });

  res.json({
    data: serializedPosts,
    meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
});

router.get('/:communityKey/posts/:postId', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  const { communityKey, postId } = req.params;

  const post = await prisma.communityPost.findFirst({
    where: { id: postId, communityKey },
    include: {
      publisher: { select: { id: true, name: true, avatarUrl: true } },
      likes: {
        where: req.user?.userId ? { userId: req.user.userId } : { userId: '__none__' },
        select: { id: true },
      },
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

  const { likes, ...postWithoutLikes } = post;
  res.json({ data: { ...postWithoutLikes, likedByMe: likes.length > 0 } });
});

router.post('/:communityKey/posts/:postId/like', authenticate, async (req: Request, res: Response): Promise<void> => {
  const { communityKey, postId } = req.params;
  const userId = req.user!.userId;

  const post = await prisma.communityPost.findFirst({
    where: { id: postId, communityKey },
    select: { id: true },
  });

  if (!post) {
    res.status(404).json({ error: 'Không tìm thấy bài viết' });
    return;
  }

  await prisma.communityPostLike.upsert({
    where: { postId_userId: { postId: post.id, userId } },
    update: {},
    create: { postId: post.id, userId },
  });

  res.status(200).json({ data: { likedByMe: true } });
});

router.delete('/:communityKey/posts/:postId/like', authenticate, async (req: Request, res: Response): Promise<void> => {
  const { communityKey, postId } = req.params;
  const userId = req.user!.userId;

  const post = await prisma.communityPost.findFirst({
    where: { id: postId, communityKey },
    select: { id: true },
  });

  if (!post) {
    res.status(404).json({ error: 'Không tìm thấy bài viết' });
    return;
  }

  await prisma.communityPostLike.deleteMany({
    where: { postId: post.id, userId },
  });

  res.status(200).json({ data: { likedByMe: false } });
});

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

  const post = await prisma.communityPost.findFirst({
    where: { id: postId, communityKey },
    select: { id: true },
  });

  if (!post) {
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
});

export default router;
