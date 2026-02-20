import { prisma } from './prisma'

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  linkUrl?: string
): Promise<void> {
  await prisma.notification.create({
    data: { userId, type, title, message, linkUrl },
  })
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, isRead: false },
  })
}

export async function markAsRead(notificationId: string): Promise<void> {
  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  })
}

export async function markAllAsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  })
}
