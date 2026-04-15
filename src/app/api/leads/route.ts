import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { findBestConnector } from '@/lib/matching'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const icpId = req.nextUrl.searchParams.get('icpId')

  const where: any = {}
  if (icpId) {
    where.icpRequestId = icpId
    where.icpRequest = { userId }
  } else {
    where.icpRequest = { userId }
  }

  const leads = await prisma.lead.findMany({
    where,
    include: {
      profile: {
        select: {
          id: true,
          fullName: true,
          company: true,
          title: true,
          industry: true,
          companySize: true,
          region: true,
          headline: true,
        },
      },
    },
    orderBy: { matchScore: 'desc' },
  })

  // For each lead, find the best connector so the UI can clearly show
  // who the intro request will be routed to (the connector, not the lead).
  const enriched = await Promise.all(
    leads.map(async (lead) => {
      try {
        const connectorResult = await findBestConnector(lead.profileId, userId)
        if (!connectorResult) return { ...lead, connector: null }
        const connectorUser = await prisma.user.findUnique({
          where: { id: connectorResult.connectorId },
          select: { id: true, name: true },
        })
        return {
          ...lead,
          connector: connectorUser
            ? {
                id: connectorUser.id,
                name: connectorUser.name,
                connectionType: connectorResult.connectionType,
              }
            : null,
        }
      } catch {
        return { ...lead, connector: null }
      }
    })
  )

  return NextResponse.json(enriched)
}
