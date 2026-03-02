export const SubmissionStatus = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  NEEDS_REVIEW: 'NEEDS_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type SubmissionStatusValue = (typeof SubmissionStatus)[keyof typeof SubmissionStatus];

export const ReviewResult = {
  PASSED: 'PASSED',
  FAILED: 'FAILED',
} as const;

export type ReviewResultValue = (typeof ReviewResult)[keyof typeof ReviewResult];

export const Role = {
  STUDENT: 'STUDENT',
  TEACHER: 'TEACHER',
} as const;
