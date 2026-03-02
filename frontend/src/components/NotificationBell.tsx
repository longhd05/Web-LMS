import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../contexts/AuthContext'

interface Notification {
  id: string
  type: string
  readAt: string | null
  createdAt: string
  payload: Record<string, unknown>
}

export default function NotificationBell({ role }: { role: 'STUDENT' | 'TEACHER' }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    if (!user) return
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data.data)
    } catch {
      // silent
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [user])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const unreadCount = notifications.filter((n) => !n.readAt).length

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.readAt).map((n) => n.id)
    if (unread.length === 0) return
    try {
      await api.post('/notifications/read', { ids: unread })
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })))
    } catch {
      // silent
    }
  }

  const notifPath = role === 'TEACHER' ? '/teacher/notifications' : '/student/notifications'

  const typeLabel: Record<string, string> = {
    STUDENT_JOINED: 'Học sinh tham gia lớp',
    SUBMISSION_RECEIVED: 'Bài nộp mới',
    SUBMISSION_REVIEWED: 'Bài đã được chấm',
    SUBMISSION_PUBLISHED: 'Bài được đăng cộng đồng',
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 text-gray-600 hover:text-green-600 transition-colors"
        aria-label="Thông báo"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="font-semibold text-gray-800">Thông báo</span>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-green-600 hover:underline"
                >
                  Đánh dấu đã đọc
                </button>
              )}
              <Link
                to={notifPath}
                onClick={() => setOpen(false)}
                className="text-xs text-indigo-600 hover:underline"
              >
                Xem tất cả
              </Link>
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-6">Không có thông báo</p>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-gray-50 last:border-0 ${!n.readAt ? 'bg-green-50' : ''}`}
                >
                  <p className="text-sm font-medium text-gray-800">{typeLabel[n.type] ?? n.type}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(n.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
