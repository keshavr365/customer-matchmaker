import { prisma } from './prisma'

interface ICP {
  industry: string
  role: string
  companySize: string
  region: string
  description: string
}

interface ProfileData {
  id: string
  fullName: string
  company: string
  title: string
  industry: string
  companySize: string
  region: string
  description: string
  userId: string | null
}

export function scoreProfile(profile: ProfileData, icp: ICP): number {
  let score = 0

  // Industry match (30 points)
  if (profile.industry && icp.industry) {
    const pInd = profile.industry.toLowerCase()
    const iInd = icp.industry.toLowerCase()
    if (pInd === iInd) score += 30
    else if (pInd.includes(iInd) || iInd.includes(pInd)) score += 20
  }

  // Role/title match (25 points)
  if (profile.title && icp.role) {
    const pTitle = profile.title.toLowerCase()
    const iRole = icp.role.toLowerCase()
    if (pTitle === iRole) score += 25
    else if (pTitle.includes(iRole) || iRole.includes(pTitle)) score += 18
    else {
      const roleWords = iRole.split(/\s+/)
      const matchCount = roleWords.filter((w) => pTitle.includes(w)).length
      score += Math.round((matchCount / roleWords.length) * 15)
    }
  }

  // Company size match (20 points)
  if (profile.companySize && icp.companySize) {
    if (profile.companySize === icp.companySize) score += 20
  }

  // Region match (15 points)
  if (profile.region && icp.region) {
    const pReg = profile.region.toLowerCase()
    const iReg = icp.region.toLowerCase()
    if (pReg === iReg) score += 15
    else if (pReg.includes(iReg) || iReg.includes(pReg)) score += 10
  }

  // Description keyword overlap (10 points)
  if (profile.description && icp.description) {
    const descWords = icp.description.toLowerCase().split(/\s+/).filter((w) => w.length > 3)
    const profileDesc = profile.description.toLowerCase()
    if (descWords.length > 0) {
      const matchCount = descWords.filter((w) => profileDesc.includes(w)).length
      score += Math.round((matchCount / descWords.length) * 10)
    }
  }

  return score
}

export async function findLeads(icpRequestId: string): Promise<void> {
  const icpRequest = await prisma.iCPRequest.findUnique({
    where: { id: icpRequestId },
  })
  if (!icpRequest) throw new Error('ICP request not found')

  const icp: ICP = {
    industry: icpRequest.industry,
    role: icpRequest.role,
    companySize: icpRequest.companySize,
    region: icpRequest.region,
    description: icpRequest.description,
  }

  // Get all profiles that don't belong to the requester
  const profiles = await prisma.profile.findMany({
    where: {
      userId: { not: icpRequest.userId },
    },
  })

  // Score and sort
  const scored = profiles
    .map((p) => ({ profile: p, score: scoreProfile(p, icp) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20) // Top 20

  // Create lead records
  for (const { profile, score } of scored) {
    await prisma.lead.create({
      data: {
        icpRequestId,
        profileId: profile.id,
        matchScore: score,
        status: 'SUGGESTED',
      },
    })
  }

  await prisma.iCPRequest.update({
    where: { id: icpRequestId },
    data: { status: 'MATCHED' },
  })
}

export async function findBestConnector(
  leadProfileId: string,
  requesterId: string
): Promise<{ connectorId: string; connectionType: string; contributorProfileId?: string } | null> {
  // Find all profiles directly connected to the lead
  const directConnections = await prisma.connection.findMany({
    where: {
      OR: [{ profileAId: leadProfileId }, { profileBId: leadProfileId }],
    },
    include: {
      profileA: { include: { user: true } },
      profileB: { include: { user: true } },
    },
  })

  // Find direct connectors (registered users connected to the lead, not the requester)
  const directConnectors: { userId: string; lastActiveAt: Date }[] = []
  for (const conn of directConnections) {
    const otherProfile = conn.profileAId === leadProfileId ? conn.profileB : conn.profileA
    if (otherProfile.user && otherProfile.user.id !== requesterId && !otherProfile.user.isFrozen) {
      directConnectors.push({
        userId: otherProfile.user.id,
        lastActiveAt: otherProfile.user.lastActiveAt,
      })
    }
  }

  if (directConnectors.length > 0) {
    // Pick the one with most recent activity
    directConnectors.sort((a, b) => b.lastActiveAt.getTime() - a.lastActiveAt.getTime())
    return { connectorId: directConnectors[0].userId, connectionType: 'DIRECT' }
  }

  // Look for indirect connectors: Connector -> Contributor -> Lead
  const connectedProfileIds = directConnections.map((c) =>
    c.profileAId === leadProfileId ? c.profileBId : c.profileAId
  )

  for (const contributorProfileId of connectedProfileIds) {
    const contributorConnections = await prisma.connection.findMany({
      where: {
        OR: [{ profileAId: contributorProfileId }, { profileBId: contributorProfileId }],
      },
      include: {
        profileA: { include: { user: true } },
        profileB: { include: { user: true } },
      },
    })

    const indirectConnectors: { userId: string; lastActiveAt: Date; contributorId: string }[] = []
    for (const conn of contributorConnections) {
      const otherProfile = conn.profileAId === contributorProfileId ? conn.profileB : conn.profileA
      if (otherProfile.user && otherProfile.user.id !== requesterId && !otherProfile.user.isFrozen) {
        indirectConnectors.push({
          userId: otherProfile.user.id,
          lastActiveAt: otherProfile.user.lastActiveAt,
          contributorId: contributorProfileId,
        })
      }
    }

    if (indirectConnectors.length > 0) {
      indirectConnectors.sort((a, b) => b.lastActiveAt.getTime() - a.lastActiveAt.getTime())
      return {
        connectorId: indirectConnectors[0].userId,
        connectionType: 'INDIRECT',
        contributorProfileId: indirectConnectors[0].contributorId,
      }
    }
  }

  return null
}

