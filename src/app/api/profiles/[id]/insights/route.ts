import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateMockInsights } from '@/lib/insights'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const insight = await prisma.profileInsight.findUnique({
    where: { profileId: params.id },
  })

  if (!insight) return NextResponse.json(null)

  return NextResponse.json({
    ...insight,
    interests: JSON.parse(insight.interests),
    recentActivity: JSON.parse(insight.recentActivity),
    sources: JSON.parse(insight.sources),
  })
}

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await prisma.profile.findUnique({
    where: { id: params.id },
  })
  if (!profile) return NextResponse.json({ error: 'Profile not found.' }, { status: 404 })

  // Check if we have a fresh cached insight (< 24 hours)
  const existing = await prisma.profileInsight.findUnique({
    where: { profileId: params.id },
  })

  if (existing) {
    const ageMs = Date.now() - existing.generatedAt.getTime()
    if (ageMs < 24 * 60 * 60 * 1000) {
      return NextResponse.json({
        ...existing,
        interests: JSON.parse(existing.interests),
        recentActivity: JSON.parse(existing.recentActivity),
        sources: JSON.parse(existing.sources),
        cached: true,
      })
    }
  }

  // Generate new insights
  const insightData = await generateMockInsights({
    fullName: profile.fullName,
    company: profile.company,
    title: profile.title,
    industry: profile.industry,
    description: profile.description,
  })

  // Upsert
  const saved = await prisma.profileInsight.upsert({
    where: { profileId: params.id },
    update: {
      currentThesis: insightData.currentThesis,
      interests: JSON.stringify(insightData.interests),
      recentActivity: JSON.stringify(insightData.recentActivity),
      investmentFocus: insightData.investmentFocus,
      confidence: insightData.confidence,
      sources: JSON.stringify(insightData.sources),
      generatedAt: new Date(),
    },
    create: {
      profileId: params.id,
      currentThesis: insightData.currentThesis,
      interests: JSON.stringify(insightData.interests),
      recentActivity: JSON.stringify(insightData.recentActivity),
      investmentFocus: insightData.investmentFocus,
      confidence: insightData.confidence,
      sources: JSON.stringify(insightData.sources),
    },
  })

  return NextResponse.json({
    ...saved,
    interests: insightData.interests,
    recentActivity: insightData.recentActivity,
    sources: insightData.sources,
    cached: false,
  }, { status: 201 })
}
