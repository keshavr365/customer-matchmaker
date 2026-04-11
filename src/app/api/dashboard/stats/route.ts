import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id

  const [activeIntros, pendingFeedback, openConversations, pendingConnectorRequests, totalConnections, totalRequests, user] =
    await Promise.all([
      prisma.introRequest.count({
        where: { requesterId: userId, status: { in: ['PENDING', 'ACCEPTED'] } },
      }),
      prisma.introRequest.count({
        where: {
          requesterId: userId,
          status: 'ACCEPTED',
          feedbacks: { none: {} },
        },
      }),
      prisma.introRequest.count({
        where: { requesterId: userId, status: { in: ['PENDING', 'ACCEPTED'] } },
      }),
      prisma.introRequest.count({
        where: { connectorId: userId, status: 'PENDING' },
      }),
      prisma.connection.count({
        where: {
          OR: [
            { profileA: { userId } },
            { profileB: { userId } },
          ],
        },
      }),
      prisma.introRequest.count({
        where: { requesterId: userId },
      }),
      prisma.user.findUnique({ where: { id: userId }, select: { bonusPoints: true } }),
    ])

  const freeIntrosRemaining = Math.max(0, 5 - totalRequests)

  return NextResponse.json({
    activeIntros,
    pendingFeedback,
    bonusPoints: user?.bonusPoints ?? 0,
    openConversations,
    pendingConnectorRequests,
    totalConnections,
    freeIntrosRemaining,
  })
}
