import { useEffect, useRef, useState } from 'react'
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

interface NotificationBellProps {
  role: 'STUDENT' | 'TEACHER'
  theme?: 'default' | 'teacher'
}

export default function NotificationBell({ role, theme = 'default' }: NotificationBellProps) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isTeacherTheme = theme === 'teacher'

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
    SUBMISSION_RECEIVED: 'Bài làm mới',
    SUBMISSION_REVIEWED: 'Bài đã được chấm',
    SUBMISSION_PUBLISHED: 'Bài được đăng cộng đồng',
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={isTeacherTheme ? 'relative p-2 text-white transition-colors hover:text-cyan-100' : 'relative p-2 text-gray-600 transition-colors hover:text-green-600'}
        aria-label="Thông báo"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className={isTeacherTheme ? 'absolute right-0 z-50 mt-2 w-[300px] overflow-hidden rounded-2xl border border-cyan-200 bg-white shadow-xl' : 'absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl'}>
          <div className={isTeacherTheme ? 'border-b border-cyan-100 bg-slate-50 px-4 py-3' : 'border-b border-gray-100 px-4 py-3'}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-lg font-bold text-[#1f3f8f]">Thông báo</span>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-cyan-700 hover:underline">Đánh dấu đã đọc</button>
              )}
            </div>
            <Link to={notifPath} onClick={() => setOpen(false)} className="text-xs text-blue-700 hover:underline">Xem tất cả</Link>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500">Không có thông báo</p>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div key={n.id} className={`border-b border-gray-50 px-4 py-3 last:border-0 ${!n.readAt ? 'bg-cyan-50' : ''}`}>
                  <p className="text-sm font-semibold text-[#1f3f8f]">{typeLabel[n.type] ?? n.type}</p>
                  <p className="mt-1 text-xs text-[#37558e]">{new Date(n.createdAt).toLocaleString('vi-VN')}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
