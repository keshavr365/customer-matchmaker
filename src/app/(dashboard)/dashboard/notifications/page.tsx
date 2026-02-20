'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  linkUrl?: string
  createdAt: string
}

const typeIcons: Record<string, string> = {
  INTRO_REQUEST: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  INTRO_ACCEPTED: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  INTRO_DECLINED: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  FEEDBACK_DUE: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  POINTS_EARNED: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  ACCOUNT_FROZEN: 'M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
}

const typeColors: Record<string, string> = {
  INTRO_REQUEST: 'bg-brand-50 text-brand-600',
  INTRO_ACCEPTED: 'bg-emerald-50 text-emerald-600',
  INTRO_DECLINED: 'bg-red-50 text-red-600',
  FEEDBACK_DUE: 'bg-amber-50 text-amber-600',
  POINTS_EARNED: 'bg-emerald-50 text-emerald-600',
  ACCOUNT_FROZEN: 'bg-red-50 text-red-600',
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  async function fetchNotifications() {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) setNotifications(await res.json())
    } catch {}
    setLoading(false)
  }

  async function markAllRead() {
    await fetch('/api/notifications', { method: 'PUT' })
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: 'PUT' })
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-sm text-brand-600 font-medium hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-1">No notifications</h3>
          <p className="text-sm text-gray-500">You&apos;re all caught up.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-50">
          {notifications.map((notification) => {
            const icon = typeIcons[notification.type] || typeIcons.INTRO_REQUEST
            const color = typeColors[notification.type] || 'bg-gray-50 text-gray-600'

            const content = (
              <div
                className={`px-6 py-4 flex items-start gap-4 transition-colors ${
                  !notification.isRead ? 'bg-brand-50/30' : ''
                } hover:bg-gray-50`}
                onClick={() => !notification.isRead && markRead(notification.id)}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                    {!notification.isRead && <span className="w-2 h-2 bg-brand-600 rounded-full flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
                </div>
              </div>
            )

            return notification.linkUrl ? (
              <Link key={notification.id} href={notification.linkUrl} className="block">
                {content}
              </Link>
            ) : (
              <div key={notification.id} className="cursor-pointer">
                {content}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
