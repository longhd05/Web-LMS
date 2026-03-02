import { prisma } from './prisma';

export async function createNotification(
  userId: string,
  type: string,
  payload: Record<string, unknown>
): Promise<void> {
  await prisma.notification.create({
    data: {
      userId,
      type,
      payloadJson: JSON.stringify(payload),
    },
  });
}
