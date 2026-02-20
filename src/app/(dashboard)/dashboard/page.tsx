'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Stats {
  activeIntros: number
  pendingFeedback: number
  bonusPoints: number
  openConversations: number
  pendingConnectorRequests: number
  totalConnections: number
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back, {session?.user?.name?.split(' ')[0]}
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening with your account.</p>
      </div>

      {!hasContributed && (
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
          { label: 'Active Intros', value: stats?.activeIntros ?? '—', color: 'text-brand-600' },
          { label: 'Pending Feedback', value: stats?.pendingFeedback ?? '—', color: 'text-amber-600' },
          { label: 'Bonus Points', value: stats?.bonusPoints ?? user?.bonusPoints ?? '—', color: 'text-emerald-600' },
          { label: 'Open Conversations', value: stats?.openConversations ?? '—', color: 'text-purple-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-100 rounded-xl p-5">
            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
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
