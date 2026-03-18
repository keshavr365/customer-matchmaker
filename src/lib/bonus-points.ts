import { prisma } from './prisma'

const MAX_OPEN_CONVERSATIONS = 4
const INTRO_REQUEST_COST = 5
const ACCEPT_INTRO_REWARD = 10
const FEEDBACK_REWARD = 5
const UPLOAD_REWARD = 3
const PROFILE_COMPLETE_REWARD = 5
const FREE_INTRO_ALLOWANCE = 3

interface CanRequestResult {
  allowed: boolean
  reason?: string
  isFreeRequest?: boolean
}

export async function canRequestIntro(userId: string): Promise<CanRequestResult> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { allowed: false, reason: 'User not found' }

  // Count total past requests to determine if user is in grace period
  const totalRequests = await prisma.introRequest.count({ where: { requesterId: userId } })
  const isInGracePeriod = totalRequests < FREE_INTRO_ALLOWANCE

  // 1. Must have contributed connection data (relaxed during grace period for first request)
  if (!user.hasContributedData && !isInGracePeriod) {
    return { allowed: false, reason: 'You must upload your LinkedIn connections before requesting intros.' }
  }

  // 2. Must not be frozen
  if (user.isFrozen) {
    return { allowed: false, reason: 'Your account is frozen. Please respond to pending intro requests first.' }
  }

  // 3. Check open conversations (< MAX_OPEN_CONVERSATIONS)
  const openConversations = await prisma.introRequest.count({
    where: {
      requesterId: userId,
      status: { in: ['PENDING', 'ACCEPTED'] },
    },
  })
  if (openConversations >= MAX_OPEN_CONVERSATIONS) {
    return {
      allowed: false,
      reason: `You can have at most ${MAX_OPEN_CONVERSATIONS} open conversations. Complete or provide feedback on existing ones first.`,
    }
  }

  // 4. Check pending feedback obligations
  const acceptedWithoutFeedback = await prisma.introRequest.count({
    where: {
      requesterId: userId,
      status: 'ACCEPTED',
      feedbacks: { none: {} },
      createdAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // older than 7 days
    },
  })
  if (acceptedWithoutFeedback > 0) {
    return { allowed: false, reason: 'Please provide feedback on your existing introductions before requesting new ones.' }
  }

  // 5. Course Hero model: must have made at least 1 intro (skip during grace period)
  if (!isInGracePeriod && totalRequests > 0) {
    const introsAcceptedAsConnector = await prisma.introRequest.count({
      where: { connectorId: userId, status: 'ACCEPTED' },
    })
    if (introsAcceptedAsConnector === 0) {
      return { allowed: false, reason: 'You must accept at least one intro request as a connector before requesting more intros.' }
    }
  }

  // 6. Grace period: first 3 intros are free
  if (isInGracePeriod) {
    return { allowed: true, isFreeRequest: true }
  }

  // 7. Must have enough bonus points
  if (user.bonusPoints < INTRO_REQUEST_COST) {
    return { allowed: false, reason: `You need ${INTRO_REQUEST_COST} bonus points to request an intro. You have ${user.bonusPoints}.` }
  }

  return { allowed: true }
}

export async function spendPoints(userId: string, reason: string, introRequestId?: string): Promise<void> {
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { bonusPoints: { decrement: INTRO_REQUEST_COST } },
    }),
    prisma.bonusTransaction.create({
      data: {
        userId,
        amount: -INTRO_REQUEST_COST,
        reason,
        introRequestId,
      },
    }),
  ])
}

export async function awardPoints(
  userId: string,
  type: 'ACCEPT_INTRO' | 'FEEDBACK' | 'UPLOAD' | 'PROFILE_COMPLETE',
  introRequestId?: string
): Promise<void> {
  const amount =
    type === 'ACCEPT_INTRO'
      ? ACCEPT_INTRO_REWARD
      : type === 'FEEDBACK'
      ? FEEDBACK_REWARD
      : type === 'PROFILE_COMPLETE'
      ? PROFILE_COMPLETE_REWARD
      : UPLOAD_REWARD

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { bonusPoints: { increment: amount } },
    }),
    prisma.bonusTransaction.create({
      data: {
        userId,
        amount,
        reason: type,
        introRequestId,
      },
    }),
  ])
}

export async function freezeUser(userId: string): Promise<void> {
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { isFrozen: true },
    }),
    prisma.notification.create({
      data: {
        userId,
        type: 'ACCOUNT_FROZEN',
        title: 'Account Frozen',
        message: 'Your account has been frozen due to unresponded intro requests. Please respond to unlock.',
        linkUrl: '/intros',
      },
    }),
  ])
}

export async function unfreezeUser(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { isFrozen: false },
  })
}
