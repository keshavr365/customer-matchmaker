import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { awardPoints } from '@/lib/bonus-points'

function parseCSV(csv: string): Record<string, string>[] {
  const lines = csv.split('\n').filter((l) => l.trim())
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase())
  const rows: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''))
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => {
      row[h] = values[idx] || ''
    })
    rows.push(row)
  }

  return rows
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const { csv } = await req.json()

  if (!csv) {
    return NextResponse.json({ error: 'CSV data is required.' }, { status: 400 })
  }

  const rows = parseCSV(csv)
  if (rows.length === 0) {
    return NextResponse.json({ error: 'No valid data found in CSV.' }, { status: 400 })
  }

  // Get or create user's profile
  let userProfile = await prisma.profile.findUnique({ where: { userId } })
  if (!userProfile) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    userProfile = await prisma.profile.create({
      data: { userId, fullName: user?.name || 'Unknown' },
    })
  }

  let count = 0

  for (const row of rows) {
    const firstName = row['first name'] || row['firstname'] || ''
    const lastName = row['last name'] || row['lastname'] || ''
    const fullName = `${firstName} ${lastName}`.trim()

    if (!fullName) continue

    const company = row['company'] || row['organization'] || ''
    const title = row['position'] || row['title'] || row['job title'] || ''
    const industry = row['industry'] || ''
    const region = row['region'] || row['location'] || ''

    // Create profile
    const profile = await prisma.profile.create({
      data: {
        fullName,
        company,
        title,
        industry,
        region,
        headline: title ? `${title}${company ? ' at ' + company : ''}` : '',
      },
    })

    // Create connection edge
    await prisma.connection.create({
      data: {
        profileAId: userProfile.id,
        profileBId: profile.id,
      },
    })

    count++
  }

  // Mark user as having contributed data
  if (count > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: { hasContributedData: true },
    })

    // Award bonus points
    await awardPoints(userId, 'UPLOAD')
  }

  return NextResponse.json({ count })
}
