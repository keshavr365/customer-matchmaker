'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Lead {
  id: string
  matchScore: number
  status: string
  profile: {
    id: string
    fullName: string
    company: string
    title: string
    industry: string
    companySize: string
    region: string
    headline: string
  }
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

export default function LeadsPage() {
  const searchParams = useSearchParams()
  const icpId = searchParams.get('icpId')
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [showCount, setShowCount] = useState(3)

  // Deep Research state
  const [researching, setResearching] = useState<string | null>(null)
  const [insights, setInsights] = useState<Record<string, InsightData>>({})
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLeads() {
      try {
        const url = icpId ? `/api/leads?icpId=${icpId}` : '/api/leads'
        const res = await fetch(url)
        if (res.ok) setLeads(await res.json())
      } catch {}
      setLoading(false)
    }
    fetchLeads()
  }, [icpId])

  async function requestIntro(leadId: string) {
    setRequesting(leadId)
    setMessage('')
    try {
      const res = await fetch('/api/intros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId }),
      })
      const data = await res.json()
      if (res.ok) {
        setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: 'INTRO_SENT' } : l)))
        setMessage('Intro request sent successfully!')
      } else {
        setMessage(data.error || 'Failed to request intro.')
      }
    } catch {
      setMessage('Something went wrong.')
    }
    setRequesting(null)
  }

  async function runDeepResearch(profileId: string) {
    if (insights[profileId]) {
      setExpandedInsight(expandedInsight === profileId ? null : profileId)
      return
    }

    setResearching(profileId)
    try {
      const res = await fetch(`/api/profiles/${profileId}/insights`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setInsights((prev) => ({ ...prev, [profileId]: data }))
        setExpandedInsight(profileId)
      }
    } catch {}
    setResearching(null)
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
        <h1 className="text-2xl font-semibold text-gray-900">Lead Suggestions</h1>
        <p className="text-gray-500 mt-1">
          {leads.length > 0
            ? `${leads.length} matches found. Showing top ${Math.min(showCount, leads.length)}.`
            : 'No leads found yet. Submit an ICP to get started.'}
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 p-3 rounded-lg text-sm border ${
            message.includes('success') ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-600'
          }`}
        >
          {message}
        </div>
      )}

      <div className="space-y-4">
        {leads.slice(0, showCount).map((lead) => (
          <div key={lead.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center text-lg font-semibold flex-shrink-0">
                    {lead.profile.fullName[0]}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{lead.profile.fullName}</h3>
                    <p className="text-sm text-gray-600">
                      {lead.profile.title}
                      {lead.profile.company ? ` at ${lead.profile.company}` : ''}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {lead.profile.industry && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{lead.profile.industry}</span>
                      )}
                      {lead.profile.companySize && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{lead.profile.companySize} employees</span>
                      )}
                      {lead.profile.region && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{lead.profile.region}</span>
                      )}
                      {insights[lead.profile.id] && expandedInsight !== lead.profile.id && (
                        <span className="px-2 py-0.5 bg-brand-50 text-brand-600 rounded text-xs font-medium">
                          Insights available
                        </span>
                      )}
                    </div>
                    {lead.profile.headline && (
                      <p className="text-sm text-gray-500 mt-2">{lead.profile.headline}</p>
                    )}
                  </div>
                </div>

                <div className="text-right flex-shrink-0 ml-4">
                  <div className="mb-2">
                    <span className="text-xs text-gray-500">Match Score</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-500 rounded-full"
                          style={{ width: `${lead.matchScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-brand-600">{lead.matchScore}%</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 items-end">
                    {/* Deep Research Button */}
                    <button
                      onClick={() => runDeepResearch(lead.profile.id)}
                      disabled={researching === lead.profile.id}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        insights[lead.profile.id]
                          ? expandedInsight === lead.profile.id
                            ? 'bg-brand-100 text-brand-700'
                            : 'bg-brand-50 text-brand-600 hover:bg-brand-100'
                          : 'border border-brand-200 text-brand-600 hover:bg-brand-50'
                      } disabled:opacity-50`}
                    >
                      {researching === lead.profile.id ? (
                        <div className="animate-spin w-3.5 h-3.5 border-2 border-brand-600 border-t-transparent rounded-full" />
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      )}
                      {researching === lead.profile.id
                        ? 'Researching...'
                        : insights[lead.profile.id]
                        ? expandedInsight === lead.profile.id
                          ? 'Hide Insights'
                          : 'View Insights'
                        : 'Deep Research'}
                    </button>

                    {lead.status === 'SUGGESTED' && (
                      <button
                        onClick={() => requestIntro(lead.id)}
                        disabled={requesting === lead.id}
                        className="bg-brand-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50"
                      >
                        {requesting === lead.id ? 'Requesting...' : 'Request Intro'}
                      </button>
                    )}
                    {lead.status === 'INTRO_SENT' && (
                      <span className="px-3 py-1.5 bg-brand-50 text-brand-700 rounded-lg text-sm font-medium">
                        Intro Requested
                      </span>
                    )}
                    {lead.status === 'FEEDBACK_GIVEN' && (
                      <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Insight Panel */}
            {expandedInsight === lead.profile.id && insights[lead.profile.id] && (
              <InsightPanel insight={insights[lead.profile.id]} />
            )}
          </div>
        ))}
      </div>

      {leads.length > showCount && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowCount((prev) => prev + 3)}
            className="text-brand-600 text-sm font-medium hover:underline"
          >
            Show more leads ({leads.length - showCount} remaining)
          </button>
        </div>
      )}

      {leads.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-1">No leads yet</h3>
          <p className="text-sm text-gray-500">Submit an ICP to find matching leads from the network.</p>
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
