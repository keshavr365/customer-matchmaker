import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id

  // Find the user's profile
  const userProfile = await prisma.profile.findUnique({ where: { userId } })
  if (!userProfile) return NextResponse.json([])

  // Find all connections where user's profile is either side
  const connections = await prisma.connection.findMany({
    where: {
      OR: [{ profileAId: userProfile.id }, { profileBId: userProfile.id }],
    },
    include: {
      profileA: { select: { id: true, fullName: true, company: true, title: true, industry: true } },
      profileB: { select: { id: true, fullName: true, company: true, title: true, industry: true } },
    },
  })

  // Return the "other" profile in each connection
  const profiles = connections.map((c) =>
    c.profileAId === userProfile.id ? c.profileB : c.profileA
  )

  return NextResponse.json(profiles)
}
