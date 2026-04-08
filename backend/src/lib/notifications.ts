import { prisma } from './prisma';

export async function createNotification(
  userId: string,
  type: string,
  payload: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        payloadJson: JSON.stringify(payload),
      },
    });
  } catch (error) {
    // Notification is non-critical; core flows (submit/review/create assignment) must not fail because of it.
    console.warn('[notifications] create failed:', { userId, type, error });
  }
}
