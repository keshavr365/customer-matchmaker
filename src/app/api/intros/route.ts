import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { findBestConnector } from '@/lib/matching'
import { canRequestIntro, spendPoints } from '@/lib/bonus-points'
import { createNotification } from '@/lib/notifications'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const { leadId, bulletPoints } = await req.json()

  if (!leadId) {
    return NextResponse.json({ error: 'Lead ID is required.' }, { status: 400 })
  }

  // Validate bullet points (quality gate)
  if (!bulletPoints || !Array.isArray(bulletPoints) || bulletPoints.length !== 3) {
    return NextResponse.json({ error: 'Please provide 3 bullet points explaining why this intro is valuable for the recipient.' }, { status: 400 })
  }
  const bulletLabels = ['Why this is relevant to them', 'Why it\'s in scope for their role/company', 'What they might find interesting']
  for (let i = 0; i < 3; i++) {
    if (!bulletPoints[i] || bulletPoints[i].trim().length < 20) {
      return NextResponse.json({ error: `"${bulletLabels[i]}" must be at least 20 characters. Write a thoughtful explanation to increase your chances of getting the intro.` }, { status: 400 })
    }
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

  // Format bullet points as the intro context for the connector
  const requester = await prisma.user.findUnique({ where: { id: userId } })
  const draftMessage = `From ${requester?.name || 'the requester'} — why this intro is valuable for ${lead.profile.fullName}:

1. Why this is relevant to them:
${bulletPoints[0].trim()}

2. Why it's in scope for their role/company:
${bulletPoints[1].trim()}

3. What they might find interesting:
${bulletPoints[2].trim()}`

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

  // Return connector info so the UI can show who the request was routed to
  const connectorUser = await prisma.user.findUnique({
    where: { id: connectorResult.connectorId },
    select: { id: true, name: true },
  })

  return NextResponse.json(
    {
      id: introRequest.id,
      connector: connectorUser
        ? { id: connectorUser.id, name: connectorUser.name, connectionType: connectorResult.connectionType }
        : null,
      leadName: lead.profile.fullName,
    },
    { status: 201 }
  )
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
