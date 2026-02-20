import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

  return NextResponse.json(leads)
}
