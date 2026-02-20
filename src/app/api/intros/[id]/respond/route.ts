import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { awardPoints, unfreezeUser } from '@/lib/bonus-points'
import { createNotification } from '@/lib/notifications'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const introId = params.id
  const { action, declineReason, declineComment } = await req.json()

  const intro = await prisma.introRequest.findUnique({
    where: { id: introId },
    include: {
      lead: { include: { profile: true } },
      requester: true,
    },
  })

  if (!intro) return NextResponse.json({ error: 'Intro request not found.' }, { status: 404 })
  if (intro.connectorId !== userId) return NextResponse.json({ error: 'Not authorized.' }, { status: 403 })
  if (intro.status !== 'PENDING') return NextResponse.json({ error: 'This request has already been responded to.' }, { status: 400 })

  if (action === 'accept') {
    await prisma.introRequest.update({
      where: { id: introId },
      data: { status: 'ACCEPTED', respondedAt: new Date() },
    })

    // Award points to connector
    await awardPoints(userId, 'ACCEPT_INTRO', introId)

    // Unfreeze if was frozen
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (user?.isFrozen) {
      const pendingCount = await prisma.introRequest.count({
        where: { connectorId: userId, status: 'PENDING' },
      })
      if (pendingCount === 0) await unfreezeUser(userId)
    }

    // Notify requester
    await createNotification(
      intro.requesterId,
      'INTRO_ACCEPTED',
      'Intro Accepted!',
      `${session.user.name} accepted your intro request to ${intro.lead.profile.fullName}. The introduction is being made.`,
      '/dashboard/intros'
    )

    return NextResponse.json({ status: 'accepted' })
  }

  if (action === 'decline') {
    if (!declineReason) {
      return NextResponse.json({ error: 'A reason for declining is required.' }, { status: 400 })
    }

    await prisma.introRequest.update({
      where: { id: introId },
      data: {
        status: 'DECLINED',
        respondedAt: new Date(),
        declineReason,
        declineComment: declineComment || null,
      },
    })

    // Notify requester
    await createNotification(
      intro.requesterId,
      'INTRO_DECLINED',
      'Intro Declined',
      `The connector declined your intro request to ${intro.lead.profile.fullName}.`,
      '/dashboard/intros'
    )

    return NextResponse.json({ status: 'declined' })
  }

  return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })
}
