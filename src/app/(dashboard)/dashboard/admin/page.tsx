'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Tooltip from '@/components/Tooltip'

interface AdminStats {
  totalUsers: number
  totalProfiles: number
  totalConnections: number
  totalIntros: number
  acceptedIntros: number
  declinedIntros: number
  frozenUsers: number
}

interface UserRow {
  id: string
  name: string
  email: string
  role: string
  bonusPoints: number
  isFrozen: boolean
  hasContributedData: boolean
  createdAt: string
  lastActiveAt: string
}

export default function AdminPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)

  const role = (session?.user as any)?.role

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, usersRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/users'),
        ])
        if (statsRes.ok) setStats(await statsRes.json())
        if (usersRes.ok) setUsers(await usersRes.json())
      } catch {}
      setLoading(false)
    }
    fetchData()
  }, [])

  async function toggleFreeze(userId: string, frozen: boolean) {
    await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, isFrozen: !frozen }),
    })
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isFrozen: !frozen } : u)))
  }

  if (role !== 'ADMIN') {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-sm text-gray-500">This page is only accessible to administrators.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  const successRate = stats && stats.totalIntros > 0
    ? Math.round((stats.acceptedIntros / stats.totalIntros) * 100)
    : 0

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Admin Panel</h1>
        <p className="text-gray-500 mt-1">Manage users and view network statistics.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users', value: stats?.totalUsers ?? '—', tooltip: 'Total number of registered users across all roles (requesters, connectors, and admins).' },
          { label: 'Total Connections', value: stats?.totalConnections ?? '—', tooltip: 'Total number of connections uploaded across the entire network. Each connection represents a relationship between two profiles.' },
          { label: 'Total Intros', value: stats?.totalIntros ?? '—', tooltip: 'Total number of introduction requests ever made on the platform, including pending, accepted, declined, and expired.' },
          { label: 'Success Rate', value: `${successRate}%`, tooltip: 'Percentage of introduction requests that were accepted by connectors. Calculated as accepted intros divided by total intros.' },
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
            <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
          <div className="flex items-center gap-1.5 mb-1">
            <p className="text-sm text-emerald-700">Accepted</p>
            <Tooltip content="Number of intro requests that connectors agreed to facilitate. Connectors earn 10 bonus points for each accepted intro.">
              <svg className="w-3.5 h-3.5 text-emerald-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Tooltip>
          </div>
          <p className="text-2xl font-semibold text-emerald-800">{stats?.acceptedIntros ?? 0}</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-5">
          <div className="flex items-center gap-1.5 mb-1">
            <p className="text-sm text-red-700">Declined</p>
            <Tooltip content="Number of intro requests that connectors declined. Common reasons include not knowing the lead well enough or the match not being a good fit.">
              <svg className="w-3.5 h-3.5 text-red-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Tooltip>
          </div>
          <p className="text-2xl font-semibold text-red-800">{stats?.declinedIntros ?? 0}</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
          <div className="flex items-center gap-1.5 mb-1">
            <p className="text-sm text-amber-700">Frozen Users</p>
            <Tooltip content="Users whose accounts are frozen due to unresponded intro requests. Frozen users cannot make new requests until they respond to pending ones.">
              <svg className="w-3.5 h-3.5 text-amber-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Tooltip>
          </div>
          <p className="text-2xl font-semibold text-amber-800">{stats?.frozenUsers ?? 0}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Users ({users.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Points</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Data</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-3">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </td>
                  <td className="px-6 py-3">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{user.role}</span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-900">{user.bonusPoints}</td>
                  <td className="px-6 py-3">
                    {user.isFrozen ? (
                      <span className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded text-xs">Frozen</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-xs">Active</span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    {user.hasContributedData ? (
                      <span className="text-emerald-600 text-xs">Contributed</span>
                    ) : (
                      <span className="text-gray-400 text-xs">None</span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => toggleFreeze(user.id, user.isFrozen)}
                      className="text-sm text-brand-600 hover:underline"
                    >
                      {user.isFrozen ? 'Unfreeze' : 'Freeze'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
