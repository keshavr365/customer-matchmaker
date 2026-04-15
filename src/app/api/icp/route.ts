import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { findLeads } from '@/lib/matching'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const body = await req.json()
  const { industry, role, description } = body

  // companySize / region can arrive as a string (single) or array (multi).
  // Normalize to a comma-separated string for storage in the existing String column.
  const normalize = (v: unknown): string => {
    if (Array.isArray(v)) return v.filter((x): x is string => typeof x === 'string' && x.trim().length > 0).join(',')
    if (typeof v === 'string') return v.trim()
    return ''
  }
  const companySize = normalize(body.companySize)
  const region = normalize(body.region)

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
