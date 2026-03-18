import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { findBestConnector, generateDraftMessage } from '@/lib/matching'
import { canRequestIntro, spendPoints } from '@/lib/bonus-points'
import { createNotification } from '@/lib/notifications'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const { leadId } = await req.json()

  if (!leadId) {
    return NextResponse.json({ error: 'Lead ID is required.' }, { status: 400 })
  }

  // Check if user can request an intro
  const check = await canRequestIntro(userId)
  if (!check.allowed) {
    return NextResponse.json({ error: check.reason }, { status: 403 })
  }

  // Get the lead
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: { profile: true, icpRequest: true },
  })
  if (!lead) return NextResponse.json({ error: 'Lead not found.' }, { status: 404 })

  // Check if intro already requested for this lead
  const existing = await prisma.introRequest.findFirst({
    where: { leadId, requesterId: userId },
  })
  if (existing) return NextResponse.json({ error: 'Intro already requested for this lead.' }, { status: 409 })

  // Find best connector
  const connectorResult = await findBestConnector(lead.profileId, userId)
  if (!connectorResult) {
    return NextResponse.json({ error: 'No connector found for this lead. No one in the network can make this introduction.' }, { status: 404 })
  }

  // Generate draft message
  const requester = await prisma.user.findUnique({ where: { id: userId } })
  const draftMessage = generateDraftMessage(
    requester?.name || 'A founder',
    lead.profile.fullName,
    lead.profile.company,
    lead.profile.title,
    lead.icpRequest.description
  )

  // Create intro request
  const introRequest = await prisma.introRequest.create({
    data: {
      leadId,
      requesterId: userId,
      connectorId: connectorResult.connectorId,
      connectionType: connectorResult.connectionType,
      contributorProfileId: connectorResult.contributorProfileId,
      draftMessage,
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
    },
  })

  // Update lead status
  await prisma.lead.update({
    where: { id: leadId },
    data: { status: 'INTRO_SENT' },
  })

  // Spend bonus points (free during grace period)
  if (!check.isFreeRequest) {
    await spendPoints(userId, 'Intro request', introRequest.id)
  }

  // Notify connector
  await createNotification(
    connectorResult.connectorId,
    'INTRO_REQUEST',
    'New Intro Request',
    `${requester?.name || 'Someone'} is requesting an introduction to ${lead.profile.fullName}.`,
    `/dashboard/intros`
  )

  return NextResponse.json({ id: introRequest.id }, { status: 201 })
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id

  const intros = await prisma.introRequest.findMany({
    where: {
      OR: [{ requesterId: userId }, { connectorId: userId }],
    },
    include: {
      lead: { include: { profile: true } },
      requester: { select: { id: true, name: true, email: true } },
      connector: { select: { id: true, name: true, email: true } },
      feedbacks: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(intros)
}
