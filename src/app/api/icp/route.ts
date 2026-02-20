import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { findLeads } from '@/lib/matching'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const { industry, role, companySize, region, description } = await req.json()

  if (!industry || !role || !companySize || !region) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
  }

  const icpRequest = await prisma.iCPRequest.create({
    data: {
      userId,
      industry,
      role,
      companySize,
      region,
      description: description || '',
    },
  })

  // Run matching
  await findLeads(icpRequest.id)

  return NextResponse.json({ id: icpRequest.id }, { status: 201 })
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id

  const requests = await prisma.iCPRequest.findMany({
    where: { userId },
    include: { leads: { include: { profile: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(requests)
}
