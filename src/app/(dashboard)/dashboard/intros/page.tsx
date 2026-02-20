'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

interface Intro {
  id: string
  status: string
  connectionType: string
  draftMessage: string
  declineReason?: string
  declineComment?: string
  createdAt: string
  expiresAt: string
  respondedAt?: string
  lead: {
    id: string
    matchScore: number
    profile: {
      id: string
      fullName: string
      company: string
      title: string
      industry: string
    }
  }
  requester: { id: string; name: string; email: string }
  connector: { id: string; name: string; email: string }
  feedbacks: { id: string; status: string; comment?: string; connectedOnWhatsapp: boolean }[]
}

interface ActivityItem {
  type: string
  title: string
  source: string
  date: string
}

interface InsightData {
  id: string
  profileId: string
  currentThesis: string
  interests: string[]
  recentActivity: ActivityItem[]
  investmentFocus: string
  confidence: number
  sources: string[]
  generatedAt: string
  cached?: boolean
}

const activityIcons: Record<string, string> = {
  blog: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
  podcast: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z',
  linkedin: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z',
  twitter: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z',
  investment: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
}

const activityColors: Record<string, string> = {
  blog: 'bg-blue-50 text-blue-600',
  podcast: 'bg-purple-50 text-purple-600',
  linkedin: 'bg-sky-50 text-sky-600',
  twitter: 'bg-gray-100 text-gray-600',
  investment: 'bg-emerald-50 text-emerald-600',
}

const declineReasons = [
  "Don't know them well enough",
  'Not a good fit',
  'Too busy right now',
  'Other',
]

export default function IntrosPage() {
  const { data: session } = useSession()
  const [intros, setIntros] = useState<Intro[]>([])
  const [loading, setLoading] = useState(true)
  const [activeDecline, setActiveDecline] = useState<string | null>(null)
  const [declineReason, setDeclineReason] = useState('')
  const [declineComment, setDeclineComment] = useState('')
  const [activeFeedback, setActiveFeedback] = useState<string | null>(null)
  const [feedbackStatus, setFeedbackStatus] = useState('')
  const [feedbackComment, setFeedbackComment] = useState('')
  const [whatsappConnected, setWhatsappConnected] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState('')

  // Deep Research / Insights state
  const [insights, setInsights] = useState<Record<string, InsightData>>({})
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null)
  const [loadingInsight, setLoadingInsight] = useState<string | null>(null)

  const userId = (session?.user as any)?.id

  useEffect(() => {
    fetchIntros()
  }, [])

  async function fetchIntros() {
    try {
      const res = await fetch('/api/intros')
      if (res.ok) setIntros(await res.json())
    } catch {}
    setLoading(false)
  }

  async function fetchInsight(profileId: string) {
    if (insights[profileId]) {
      setExpandedInsight(expandedInsight === profileId ? null : profileId)
      return
    }

    setLoadingInsight(profileId)
    try {
      const res = await fetch(`/api/profiles/${profileId}/insights`)
      if (res.ok) {
        const data = await res.json()
        if (data) {
          setInsights((prev) => ({ ...prev, [profileId]: data }))
          setExpandedInsight(profileId)
        }
      }
    } catch {}
    setLoadingInsight(null)
  }

  async function handleAccept(introId: string) {
    setProcessing(true)
    setMessage('')
    try {
      const res = await fetch(`/api/intros/${introId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      })
      if (res.ok) {
        setMessage('Intro accepted! The introduction will be made.')
        fetchIntros()
      } else {
        const data = await res.json()
        setMessage(data.error || 'Failed to accept.')
      }
    } catch {
      setMessage('Something went wrong.')
    }
    setProcessing(false)
  }

  async function handleDecline(introId: string) {
    if (!declineReason) {
      setMessage('Please select a reason for declining.')
      return
    }
    setProcessing(true)
    setMessage('')
    try {
      const res = await fetch(`/api/intros/${introId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decline', declineReason, declineComment }),
      })
      if (res.ok) {
        setMessage('Intro declined.')
        setActiveDecline(null)
        setDeclineReason('')
        setDeclineComment('')
        fetchIntros()
      } else {
        const data = await res.json()
        setMessage(data.error || 'Failed to decline.')
      }
    } catch {
      setMessage('Something went wrong.')
    }
    setProcessing(false)
  }

  async function handleFeedback(introId: string) {
    if (!feedbackStatus) {
      setMessage('Please select a feedback status.')
      return
    }
    setProcessing(true)
    setMessage('')
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          introRequestId: introId,
          status: feedbackStatus,
          comment: feedbackComment,
          connectedOnWhatsapp: whatsappConnected,
        }),
      })
      if (res.ok) {
        setMessage('Feedback submitted!')
        setActiveFeedback(null)
        setFeedbackStatus('')
        setFeedbackComment('')
        setWhatsappConnected(false)
        fetchIntros()
      } else {
        const data = await res.json()
        setMessage(data.error || 'Failed to submit feedback.')
      }
    } catch {
      setMessage('Something went wrong.')
    }
    setProcessing(false)
  }

  const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-100',
    ACCEPTED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    DECLINED: 'bg-red-50 text-red-700 border-red-100',
    EXPIRED: 'bg-gray-100 text-gray-500 border-gray-200',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Introductions</h1>
        <p className="text-gray-500 mt-1">Manage your intro requests and provide feedback.</p>
      </div>

      {message && (
        <div
          className={`mb-6 p-3 rounded-lg text-sm border ${
            message.includes('success') || message.includes('accepted') || message.includes('submitted')
              ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
              : 'bg-red-50 border-red-100 text-red-600'
          }`}
        >
          {message}
        </div>
      )}

      {intros.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-1">No introductions yet</h3>
          <p className="text-sm text-gray-500">Request intros from your matched leads to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {intros.map((intro) => {
            const isRequester = intro.requester.id === userId
            const isConnector = intro.connector.id === userId
            const needsFeedback =
              isRequester && intro.status === 'ACCEPTED' && intro.feedbacks.length === 0
            const profileId = intro.lead.profile.id
            const hasInsight = !!insights[profileId]
            const isInsightExpanded = expandedInsight === profileId

            return (
              <div key={intro.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center font-semibold">
                        {intro.lead.profile.fullName[0]}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">{intro.lead.profile.fullName}</h3>
                        <p className="text-sm text-gray-500">
                          {intro.lead.profile.title}
                          {intro.lead.profile.company ? ` at ${intro.lead.profile.company}` : ''}
                        </p>
                        {/* View Insights link */}
                        <button
                          onClick={() => fetchInsight(profileId)}
                          disabled={loadingInsight === profileId}
                          className="mt-1 flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors disabled:opacity-50"
                        >
                          {loadingInsight === profileId ? (
                            <>
                              <div className="animate-spin w-3 h-3 border-[1.5px] border-brand-600 border-t-transparent rounded-full" />
                              Loading...
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                              {hasInsight
                                ? isInsightExpanded
                                  ? 'Hide Insights'
                                  : 'View Insights'
                                : 'View Insights'}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[intro.status] || ''}`}>
                      {intro.status}
                    </span>
                  </div>

                  <div className="text-sm text-gray-500 space-y-1 mb-4">
                    <p>
                      <span className="text-gray-700">Requester:</span> {intro.requester.name}
                      {isRequester && ' (you)'}
                    </p>
                    <p>
                      <span className="text-gray-700">Connector:</span> {intro.connector.name}
                      {isConnector && ' (you)'}
                    </p>
                    <p>
                      <span className="text-gray-700">Type:</span> {intro.connectionType === 'DIRECT' ? 'Direct connection' : 'Indirect (via contributor)'}
                    </p>
                    <p>
                      <span className="text-gray-700">Requested:</span> {new Date(intro.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Connector actions */}
                  {isConnector && intro.status === 'PENDING' && (
                    <div className="border-t border-gray-100 pt-4 mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-3">Draft Introduction Message:</p>
                      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 mb-4 whitespace-pre-line">
                        {intro.draftMessage}
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAccept(intro.id)}
                          disabled={processing}
                          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                        >
                          Accept & Send Intro
                        </button>
                        <button
                          onClick={() => setActiveDecline(activeDecline === intro.id ? null : intro.id)}
                          disabled={processing}
                          className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>

                      {activeDecline === intro.id && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                          <p className="text-sm font-medium text-gray-700">Why are you declining?</p>
                          <div className="space-y-2">
                            {declineReasons.map((reason) => (
                              <label key={reason} className="flex items-center gap-2 text-sm text-gray-600">
                                <input
                                  type="radio"
                                  name="declineReason"
                                  value={reason}
                                  checked={declineReason === reason}
                                  onChange={(e) => setDeclineReason(e.target.value)}
                                  className="text-brand-600"
                                />
                                {reason}
                              </label>
                            ))}
                          </div>
                          <textarea
                            value={declineComment}
                            onChange={(e) => setDeclineComment(e.target.value)}
                            placeholder="Additional comments (optional)"
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                          />
                          <button
                            onClick={() => handleDecline(intro.id)}
                            disabled={processing}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            Confirm Decline
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Feedback section */}
                  {needsFeedback && (
                    <div className="border-t border-gray-100 pt-4 mt-4">
                      <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mb-3">
                        <p className="text-sm text-amber-700 font-medium">Feedback needed</p>
                        <p className="text-xs text-amber-600 mt-0.5">Please provide feedback on this introduction to unlock new leads.</p>
                      </div>
                      <button
                        onClick={() => setActiveFeedback(activeFeedback === intro.id ? null : intro.id)}
                        className="text-brand-600 text-sm font-medium hover:underline"
                      >
                        {activeFeedback === intro.id ? 'Cancel' : 'Provide Feedback'}
                      </button>

                      {activeFeedback === intro.id && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                          <p className="text-sm font-medium text-gray-700">How is this introduction going?</p>
                          <div className="space-y-2">
                            {[
                              { value: 'NO_RESPONSE', label: 'No response so far' },
                              { value: 'IN_TALKS', label: 'In talks' },
                              { value: 'STALE', label: 'Stale' },
                              { value: 'NOT_MOVING_FORWARD', label: 'Not moving forward' },
                            ].map((option) => (
                              <label key={option.value} className="flex items-center gap-2 text-sm text-gray-600">
                                <input
                                  type="radio"
                                  name="feedbackStatus"
                                  value={option.value}
                                  checked={feedbackStatus === option.value}
                                  onChange={(e) => setFeedbackStatus(e.target.value)}
                                  className="text-brand-600"
                                />
                                {option.label}
                              </label>
                            ))}
                          </div>

                          <label className="flex items-center gap-2 text-sm text-gray-600 pt-2 border-t border-gray-200">
                            <input
                              type="checkbox"
                              checked={whatsappConnected}
                              onChange={(e) => setWhatsappConnected(e.target.checked)}
                              className="text-brand-600 rounded"
                            />
                            Did you connect on WhatsApp?
                          </label>

                          <textarea
                            value={feedbackComment}
                            onChange={(e) => setFeedbackComment(e.target.value.slice(0, 280))}
                            placeholder="Additional comments (optional, max 280 characters)"
                            rows={2}
                            maxLength={280}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                          />
                          <p className="text-xs text-gray-400">{feedbackComment.length}/280</p>

                          <button
                            onClick={() => handleFeedback(intro.id)}
                            disabled={processing}
                            className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50"
                          >
                            Submit Feedback
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Show existing feedback */}
                  {intro.feedbacks.length > 0 && (
                    <div className="border-t border-gray-100 pt-4 mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Feedback</p>
                      {intro.feedbacks.map((fb) => (
                        <div key={fb.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                          <span className="font-medium text-gray-700">
                            {fb.status.replace(/_/g, ' ').toLowerCase()}
                          </span>
                          {fb.connectedOnWhatsapp && (
                            <span className="ml-2 text-emerald-600">Connected on WhatsApp</span>
                          )}
                          {fb.comment && <p className="text-gray-500 mt-1">{fb.comment}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Decline info */}
                  {intro.status === 'DECLINED' && intro.declineReason && (
                    <div className="border-t border-gray-100 pt-4 mt-4">
                      <p className="text-sm text-gray-500">
                        <span className="font-medium text-gray-700">Declined:</span> {intro.declineReason}
                      </p>
                      {intro.declineComment && (
                        <p className="text-sm text-gray-500 mt-1">{intro.declineComment}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Insight Panel */}
                {isInsightExpanded && hasInsight && (
                  <InsightPanel insight={insights[profileId]} />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function InsightPanel({ insight }: { insight: InsightData }) {
  const [showSources, setShowSources] = useState(false)

  return (
    <div className="border-t border-gray-100 bg-gradient-to-b from-brand-50/30 to-white px-6 py-5">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <h4 className="text-sm font-semibold text-gray-900">Deep Research Insights</h4>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-xs text-gray-400">Confidence</span>
          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full"
              style={{ width: `${insight.confidence}%` }}
            />
          </div>
          <span className="text-xs font-medium text-brand-600">{insight.confidence}%</span>
        </div>
      </div>

      {/* Current Thesis */}
      <div className="mb-4">
        <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Current Thesis</h5>
        <p className="text-sm text-gray-700 leading-relaxed">{insight.currentThesis}</p>
      </div>

      {/* Active Interests */}
      <div className="mb-4">
        <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Active Interests</h5>
        <div className="flex flex-wrap gap-1.5">
          {insight.interests.map((interest, i) => (
            <span
              key={i}
              className="px-2.5 py-1 bg-brand-50 text-brand-700 border border-brand-100 rounded-full text-xs font-medium"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-4">
        <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Recent Activity</h5>
        <div className="space-y-2">
          {insight.recentActivity.map((activity, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${activityColors[activity.type] || 'bg-gray-100 text-gray-500'}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={activityIcons[activity.type] || activityIcons.blog} />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 leading-snug">{activity.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{activity.source} &middot; {activity.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Investment Focus */}
      <div className="mb-4">
        <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Investment Focus</h5>
        <p className="text-sm text-gray-700 leading-relaxed">{insight.investmentFocus}</p>
      </div>

      {/* Sources + Timestamp */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <button
          onClick={() => setShowSources(!showSources)}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showSources ? 'Hide sources' : `${insight.sources.length} sources`}
        </button>
        <span className="text-xs text-gray-400">
          Researched {new Date(insight.generatedAt).toLocaleDateString()}
          {insight.cached && ' (cached)'}
        </span>
      </div>

      {showSources && (
        <div className="mt-2 space-y-1">
          {insight.sources.map((source, i) => (
            <p key={i} className="text-xs text-gray-400 font-mono">{source}</p>
          ))}
        </div>
      )}
    </div>
  )
}
