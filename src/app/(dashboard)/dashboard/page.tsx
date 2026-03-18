'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Tooltip from '@/components/Tooltip'

interface Stats {
  activeIntros: number
  pendingFeedback: number
  bonusPoints: number
  openConversations: number
  pendingConnectorRequests: number
  totalConnections: number
  freeIntrosRemaining: number
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<Stats | null>(null)

  const user = session?.user as any

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/dashboard/stats')
        if (res.ok) setStats(await res.json())
      } catch {}
    }
    fetchStats()
  }, [])

  const hasContributed = user?.hasContributedData
  const freeIntrosRemaining = stats?.freeIntrosRemaining ?? 0

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back, {session?.user?.name?.split(' ')[0]}
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening with your account.</p>
      </div>

      {freeIntrosRemaining > 0 && (
        <div className="mb-8 bg-emerald-50 border border-emerald-100 rounded-xl p-6">
          <h2 className="text-base font-semibold text-emerald-900 mb-1">Welcome! You have {freeIntrosRemaining} free intro{freeIntrosRemaining !== 1 ? 's' : ''} remaining</h2>
          <p className="text-sm text-emerald-700">
            New users get their first 3 intro requests for free — no points needed and no connection upload required. Try it out!
          </p>
        </div>
      )}

      {!hasContributed && freeIntrosRemaining === 0 && (
        <div className="mb-8 bg-brand-50 border border-brand-100 rounded-xl p-6">
          <h2 className="text-base font-semibold text-brand-900 mb-1">Upload your connections to get started</h2>
          <p className="text-sm text-brand-700 mb-4">
            You need to contribute your LinkedIn connection data before you can request intros.
          </p>
          <Link
            href="/dashboard/connections"
            className="inline-flex bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            Upload Connections
          </Link>
        </div>
      )}

      {user?.isFrozen && (
        <div className="mb-8 bg-red-50 border border-red-100 rounded-xl p-6">
          <h2 className="text-base font-semibold text-red-900 mb-1">Account Frozen</h2>
          <p className="text-sm text-red-700 mb-4">
            You have unresponded intro requests. Please respond to them to unfreeze your account.
          </p>
          <Link
            href="/dashboard/intros"
            className="inline-flex bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            View Pending Requests
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Active Intros',
            value: stats?.activeIntros ?? '—',
            color: 'text-brand-600',
            tooltip: 'The number of introduction requests you have that are currently pending or accepted. These are active conversations in progress.',
          },
          {
            label: 'Pending Feedback',
            value: stats?.pendingFeedback ?? '—',
            color: 'text-amber-600',
            tooltip: 'Introductions where you were connected but haven\'t yet reported back on how it went. Providing feedback earns you 5 bonus points and is required to keep requesting new intros.',
          },
          {
            label: 'Bonus Points',
            value: stats?.bonusPoints ?? user?.bonusPoints ?? '—',
            color: 'text-emerald-600',
            tooltip: 'Your currency for requesting introductions. Each intro costs 5 points. Earn points by: accepting intros as a connector (+10), providing feedback (+5), or uploading connections (+3). New users start with 10 points plus 3 free intro requests.',
          },
          {
            label: 'Open Conversations',
            value: stats?.openConversations ?? '—',
            color: 'text-purple-600',
            tooltip: 'How many intros you currently have open (pending or accepted). You can have a maximum of 4 open conversations at once. Complete or give feedback on existing ones to free up slots.',
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="flex items-center gap-1.5 mb-1">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <Tooltip content={stat.tooltip}>
                <svg className="w-3.5 h-3.5 text-gray-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Tooltip>
            </div>
            <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {user?.role !== 'CONNECTOR' && (
            <Link
              href="/dashboard/icp/new"
              className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-9 h-9 bg-brand-50 text-brand-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">New ICP Search</p>
                <p className="text-xs text-gray-500">Find matching leads</p>
              </div>
            </Link>
          )}
          <Link
            href="/dashboard/intros"
            className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-9 h-9 bg-brand-50 text-brand-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">View Intros</p>
              <p className="text-xs text-gray-500">
                {stats?.pendingConnectorRequests ? `${stats.pendingConnectorRequests} pending` : 'Manage intros'}
              </p>
            </div>
          </Link>
          <Link
            href="/dashboard/connections"
            className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-9 h-9 bg-brand-50 text-brand-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Connections</p>
              <p className="text-xs text-gray-500">{stats?.totalConnections ? `${stats.totalConnections} uploaded` : 'Upload CSV'}</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
