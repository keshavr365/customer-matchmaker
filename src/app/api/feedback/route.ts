import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { awardPoints } from '@/lib/bonus-points'
import { createNotification } from '@/lib/notifications'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const { introRequestId, status, comment, connectedOnWhatsapp } = await req.json()

  if (!introRequestId || !status) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  const validStatuses = ['NO_RESPONSE', 'IN_TALKS', 'STALE', 'NOT_MOVING_FORWARD']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 })
  }

  // Verify the intro request belongs to this user
  const introRequest = await prisma.introRequest.findUnique({
    where: { id: introRequestId },
    include: { lead: true },
  })
  if (!introRequest || introRequest.requesterId !== userId) {
    return NextResponse.json({ error: 'Intro request not found.' }, { status: 404 })
  }

  // Check if feedback already given
  const existingFeedback = await prisma.feedback.findFirst({
    where: { introRequestId, userId },
  })
  if (existingFeedback) {
    return NextResponse.json({ error: 'Feedback already submitted for this intro.' }, { status: 409 })
  }

  // Create feedback
  await prisma.feedback.create({
    data: {
      introRequestId,
      userId,
      status,
      comment: comment?.slice(0, 280) || null,
      connectedOnWhatsapp: connectedOnWhatsapp || false,
    },
  })

  // Update lead status
  await prisma.lead.update({
    where: { id: introRequest.leadId },
    data: { status: 'FEEDBACK_GIVEN' },
  })

  // Award points for feedback
  await awardPoints(userId, 'FEEDBACK', introRequestId)

  // Notify user
  await createNotification(
    userId,
    'POINTS_EARNED',
    'Points Earned',
    'You earned 5 bonus points for providing feedback.',
    '/dashboard'
  )

  return NextResponse.json({ success: true }, { status: 201 })
}
