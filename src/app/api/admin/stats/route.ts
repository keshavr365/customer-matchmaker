import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if ((session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [totalUsers, totalProfiles, totalConnections, totalIntros, acceptedIntros, declinedIntros, frozenUsers] =
    await Promise.all([
      prisma.user.count(),
      prisma.profile.count(),
      prisma.connection.count(),
      prisma.introRequest.count(),
      prisma.introRequest.count({ where: { status: 'ACCEPTED' } }),
      prisma.introRequest.count({ where: { status: 'DECLINED' } }),
      prisma.user.count({ where: { isFrozen: true } }),
    ])

  return NextResponse.json({
    totalUsers,
    totalProfiles,
    totalConnections,
    totalIntros,
    acceptedIntros,
    declinedIntros,
    frozenUsers,
  })
}
