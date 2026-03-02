import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { createNotification } from '../lib/notifications';
import { SubmissionStatus } from '../lib/constants';

const router = Router({ mergeParams: true });

const submitSchema = z.object({
  readingAnswersJson: z.string().optional(),
  integrationFileId: z.string().optional(),
  status: z.enum(['DRAFT', 'SUBMITTED']).default('SUBMITTED'),
});

const reviewSchema = z.object({
  perQuestionMarksJson: z.string().optional(),
  comment: z.string().optional(),
  resultStatus: z.enum(['PASSED', 'FAILED']),
});

const publishSchema = z.object({
  communityKey: z.string().min(1),
});

// POST /assignments/:assignmentId/submissions
router.post('/', authenticate, requireRole('STUDENT'), async (req: Request, res: Response): Promise<void> => {
  const { assignmentId } = req.params;
  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: { class: true },
  });
  if (!assignment) {
    res.status(404).json({ error: 'Assignment not found' });
    return;
  }

  // Verify student is a member
  const membership = await prisma.membership.findUnique({
    where: { classId_studentId: { classId: assignment.classId, studentId: req.user!.userId } },
  });
  if (!membership) {
    res.status(403).json({ error: 'You are not enrolled in this class' });
    return;
  }

  // Upsert submission (allow resubmit if in DRAFT or REJECTED)
  const existing = await prisma.submission.findFirst({
    where: { assignmentId, studentId: req.user!.userId },
  });

  let submission;
  if (existing) {
  const editableStatuses: string[] = [SubmissionStatus.DRAFT, SubmissionStatus.REJECTED];
  if (!editableStatuses.includes(existing.status)) {
      res.status(409).json({ error: 'Submission already exists and cannot be modified' });
      return;
    }
    submission = await prisma.submission.update({
      where: { id: existing.id },
      data: {
        readingAnswersJson: parsed.data.readingAnswersJson,
        integrationFileId: parsed.data.integrationFileId,
        status: parsed.data.status,
      },
    });
  } else {
    submission = await prisma.submission.create({
      data: {
        assignmentId,
        studentId: req.user!.userId,
        readingAnswersJson: parsed.data.readingAnswersJson,
        integrationFileId: parsed.data.integrationFileId,
        status: parsed.data.status,
      },
    });
  }

  // Notify teacher if submitted
  if (parsed.data.status === SubmissionStatus.SUBMITTED) {
    await createNotification(assignment.class.teacherId, 'SUBMISSION_RECEIVED', {
      submissionId: submission.id,
      assignmentId,
      studentId: req.user!.userId,
    });
  }

  res.status(201).json({ data: submission });
});

// GET /submissions (current student's submissions)
export const getMySubmissions = async (req: Request, res: Response): Promise<void> => {
  const submissions = await prisma.submission.findMany({
    where: { studentId: req.user!.userId },
    include: {
      assignment: { include: { libraryItem: true, class: true } },
      review: true,
      communityPost: true,
    },
    orderBy: { updatedAt: 'desc' },
  });
  res.json({ data: submissions });
};

// GET /submissions/:id
export const getSubmissionById = async (req: Request, res: Response): Promise<void> => {
  const submission = await prisma.submission.findUnique({
    where: { id: req.params.id },
    include: {
      assignment: { include: { libraryItem: true, class: true } },
      student: { select: { id: true, name: true, email: true } },
      review: { include: { teacher: { select: { id: true, name: true } } } },
      communityPost: true,
      integrationFile: true,
    },
  });

  if (!submission) {
    res.status(404).json({ error: 'Submission not found' });
    return;
  }

  const userId = req.user!.userId;
  const role = req.user!.role;
  const isOwner = submission.studentId === userId;
  const isTeacher = role === 'TEACHER';

  if (!isOwner && !isTeacher) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  res.json({ data: submission });
};

// POST /submissions/:id/review
export const reviewSubmission = async (req: Request, res: Response): Promise<void> => {
  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const submission = await prisma.submission.findUnique({
    where: { id: req.params.id },
    include: { assignment: { include: { class: true } } },
  });

  if (!submission) {
    res.status(404).json({ error: 'Submission not found' });
    return;
  }
  if (submission.assignment.class.teacherId !== req.user!.userId) {
    res.status(403).json({ error: 'You are not the teacher of this class' });
    return;
  }

  const newStatus = parsed.data.resultStatus === 'PASSED' ? SubmissionStatus.APPROVED : SubmissionStatus.REJECTED;

  const [review] = await prisma.$transaction([
    prisma.review.upsert({
      where: { submissionId: submission.id },
      update: {
        perQuestionMarksJson: parsed.data.perQuestionMarksJson,
        comment: parsed.data.comment,
        resultStatus: parsed.data.resultStatus,
        reviewedAt: new Date(),
      },
      create: {
        submissionId: submission.id,
        teacherId: req.user!.userId,
        perQuestionMarksJson: parsed.data.perQuestionMarksJson,
        comment: parsed.data.comment,
        resultStatus: parsed.data.resultStatus,
      },
    }),
    prisma.submission.update({
      where: { id: submission.id },
      data: { status: newStatus },
    }),
  ]);

  // Notify student
  await createNotification(submission.studentId, 'SUBMISSION_REVIEWED', {
    submissionId: submission.id,
    resultStatus: parsed.data.resultStatus,
    comment: parsed.data.comment,
  });

  res.json({ data: review });
};

// POST /submissions/:id/publish
export const publishSubmission = async (req: Request, res: Response): Promise<void> => {
  const parsed = publishSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const submission = await prisma.submission.findUnique({
    where: { id: req.params.id },
    include: { assignment: { include: { class: true } }, communityPost: true },
  });

  if (!submission) {
    res.status(404).json({ error: 'Submission not found' });
    return;
  }
  if (submission.assignment.class.teacherId !== req.user!.userId) {
    res.status(403).json({ error: 'You are not the teacher of this class' });
    return;
  }
  if (submission.status !== SubmissionStatus.APPROVED) {
    res.status(400).json({ error: 'Only approved submissions can be published' });
    return;
  }
  if (submission.communityPost) {
    res.status(409).json({ error: 'Submission already published' });
    return;
  }

  const post = await prisma.communityPost.create({
    data: {
      communityKey: parsed.data.communityKey,
      submissionId: submission.id,
      publishedBy: req.user!.userId,
    },
  });

  // Notify student
  await createNotification(submission.studentId, 'SUBMISSION_PUBLISHED', {
    submissionId: submission.id,
    communityKey: parsed.data.communityKey,
  });

  res.status(201).json({ data: post });
};

export default router;
