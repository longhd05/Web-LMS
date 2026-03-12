import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { createNotification } from '../lib/notifications';

const router = Router();

const createAssignmentSchema = z.object({
  classId: z.string().min(1),
  libraryItemId: z.string().min(1),
  type: z.enum(['READING', 'INTEGRATION']),
  mode: z.enum(['INDIVIDUAL', 'GROUP']).default('INDIVIDUAL'),
  dueAt: z.string().datetime().optional().nullable(),
  title: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
});

router.post('/', authenticate, requireRole('TEACHER'), async (req: Request, res: Response): Promise<void> => {
  const parsed = createAssignmentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { classId, libraryItemId, type, mode, dueAt, title, description } = parsed.data;

  const cls = await prisma.class.findUnique({ where: { id: classId } });
  if (!cls) {
    res.status(404).json({ error: 'Class not found' });
    return;
  }
  if (cls.teacherId !== req.user!.userId) {
    res.status(403).json({ error: 'You are not the teacher of this class' });
    return;
  }

  const libraryItem = await prisma.libraryItem.findUnique({ where: { id: libraryItemId } });
  if (!libraryItem) {
    res.status(404).json({ error: 'Library item not found' });
    return;
  }

  const assignment = await prisma.assignment.create({
    data: {
      classId,
      libraryItemId,
      type,
      mode,
      dueAt: dueAt ? new Date(dueAt) : null,
      createdBy: req.user!.userId,
      title,
      description,
    },
    include: { libraryItem: true, class: true },
  });

  // Notify all students in the class about the new assignment
  const memberships = await prisma.membership.findMany({
    where: { classId },
    select: { studentId: true },
  });
  await Promise.all(
    memberships.map((m) =>
      createNotification(m.studentId, 'ASSIGNMENT_CREATED', {
        assignmentId: assignment.id,
        classId,
        className: cls!.name,
        libraryItemTitle: assignment.libraryItem.title,
      })
    )
  );

  res.status(201).json({ data: assignment });
});

router.get('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  const assignment = await prisma.assignment.findUnique({
    where: { id: req.params.id },
    include: {
      libraryItem: true,
      class: { include: { teacher: { select: { id: true, name: true, email: true } } } },
      submissions: req.user!.role === 'TEACHER'
        ? { include: { student: { select: { id: true, name: true, email: true } }, review: true, integrationFile: true } }
        : { where: { studentId: req.user!.userId }, include: { review: true, integrationFile: true } },
    },
  });

  if (!assignment) {
    res.status(404).json({ error: 'Assignment not found' });
    return;
  }

  res.json({ data: assignment });
});

export default router;
