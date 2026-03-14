import { Router, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { createNotification } from '../lib/notifications';

const router = Router();

function generateClassCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const createClassSchema = z.object({
  name: z.string().min(1).max(200),
});

const joinClassSchema = z.object({
  code: z.string().length(6),
});

router.post('/', authenticate, requireRole('TEACHER'), async (req: Request, res: Response): Promise<void> => {
  const parsed = createClassSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  let code: string;
  let attempts = 0;
  do {
    code = generateClassCode();
    attempts++;
    if (attempts > 10) {
      res.status(500).json({ error: 'Failed to generate unique class code' });
      return;
    }
  } while (await prisma.class.findUnique({ where: { code } }));

  const newClass = await prisma.class.create({
    data: { name: parsed.data.name, code, teacherId: req.user!.userId },
    include: { teacher: { select: { id: true, name: true, email: true } } },
  });

  res.status(201).json({ data: newClass });
});

router.post('/join', authenticate, requireRole('STUDENT'), async (req: Request, res: Response): Promise<void> => {
  const parsed = joinClassSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const cls = await prisma.class.findUnique({ where: { code: parsed.data.code } });
  if (!cls) {
    res.status(404).json({ error: 'Class not found with this code' });
    return;
  }

  const student = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, role: true },
  });
  if (!student || student.role !== 'STUDENT') {
    res.status(401).json({ error: 'Session is invalid. Please log in again.' });
    return;
  }

  const existing = await prisma.membership.findUnique({
    where: { classId_studentId: { classId: cls.id, studentId: req.user!.userId } },
  });
  if (existing) {
    res.status(409).json({ error: 'Already a member of this class' });
    return;
  }

  let membership;
  try {
    membership = await prisma.membership.create({
      data: { classId: cls.id, studentId: req.user!.userId },
      include: { class: true, student: { select: { id: true, name: true, email: true } } },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      res.status(409).json({ error: 'Cannot join class because account or class data is no longer valid. Please refresh and log in again.' });
      return;
    }
    throw error;
  }

  // Notify teacher that a student joined
  await createNotification(cls.teacherId, 'STUDENT_JOINED', {
    classId: cls.id,
    className: cls.name,
    studentId: req.user!.userId,
  });

  res.status(201).json({ data: membership });
});

router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const role = req.user!.role;

  let classes;
  if (role === 'TEACHER') {
    classes = await prisma.class.findMany({
      where: { teacherId: userId },
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        _count: { select: { memberships: true, assignments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  } else {
    const memberships = await prisma.membership.findMany({
      where: { studentId: userId },
      include: {
        class: {
          include: {
            teacher: { select: { id: true, name: true, email: true } },
            _count: { select: { memberships: true, assignments: true } },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });
    classes = memberships.map((m) => m.class);
  }

  res.json({ data: classes });
});

router.get('/:classId', authenticate, async (req: Request, res: Response): Promise<void> => {
  const cls = await prisma.class.findUnique({
    where: { id: req.params.classId },
    include: {
      teacher: { select: { id: true, name: true, email: true } },
      memberships: {
        include: {
          student: { select: { id: true, name: true, email: true } },
        },
      },
      assignments: {
        include: {
          libraryItem: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
      _count: { select: { memberships: true, assignments: true } },
    },
  });

  if (!cls) {
    res.status(404).json({ error: 'Class not found' });
    return;
  }

  // Check access
  const userId = req.user!.userId;
  const isTeacher = cls.teacherId === userId;
  
  if (!isTeacher) {
    const membership = await prisma.membership.findUnique({
      where: { classId_studentId: { classId: cls.id, studentId: userId } },
    });
    if (!membership) {
      res.status(403).json({ error: 'You are not a member of this class' });
      return;
    }
  }

  res.json({ data: cls });
});

router.get('/:classId/assignments', authenticate, async (req: Request, res: Response): Promise<void> => {
  const cls = await prisma.class.findUnique({ where: { id: req.params.classId } });
  if (!cls) {
    res.status(404).json({ error: 'Class not found' });
    return;
  }

  const userId = req.user!.userId;
  const isTeacher = cls.teacherId === userId;
  const membership = !isTeacher
    ? await prisma.membership.findUnique({
        where: { classId_studentId: { classId: cls.id, studentId: userId } },
      })
    : null;

  if (!isTeacher && !membership) {
    res.status(403).json({ error: 'You are not a member of this class' });
    return;
  }

  const assignments = await prisma.assignment.findMany({
    where: { classId: cls.id },
    include: { libraryItem: true },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ data: assignments });
});

router.get('/:classId/submissions', authenticate, requireRole('TEACHER'), async (req: Request, res: Response): Promise<void> => {
  const cls = await prisma.class.findUnique({ where: { id: req.params.classId } });
  if (!cls) {
    res.status(404).json({ error: 'Class not found' });
    return;
  }
  if (cls.teacherId !== req.user!.userId) {
    res.status(403).json({ error: 'You are not the teacher of this class' });
    return;
  }

  const submissions = await prisma.submission.findMany({
    where: { assignment: { classId: cls.id } },
    include: {
      student: { select: { id: true, name: true, email: true } },
      assignment: { include: { libraryItem: true } },
      review: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ data: submissions });
});

export default router;
