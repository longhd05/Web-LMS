import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { createPortal } from 'react-dom'
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
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 })

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
      const target = e.target as Node
      const isInsideButtonWrap = dropdownRef.current?.contains(target)
      const isInsidePanel = panelRef.current?.contains(target)

      if (!isInsideButtonWrap && !isInsidePanel) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (!open) return

    const updatePosition = () => {
      if (!buttonRef.current) return
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPos({
        top: rect.bottom + 8,
        right: Math.max(4, window.innerWidth - rect.right - 10),
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open])

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

  const notifPath = role === 'TEACHER' ? '/giao-vien/thong-bao' : '/hoc-sinh/thong-bao'

  const typeLabel: Record<string, string> = {
    STUDENT_JOINED: 'Học sinh tham gia lớp',
    SUBMISSION_RECEIVED: 'Bài làm mới',
    SUBMISSION_REVIEWED: 'Bài đã được chấm',
    SUBMISSION_PUBLISHED: 'Bài được đăng cộng đồng',
  }

  const dropdownNode = open ? (
    <div
      ref={panelRef}
      style={{ top: dropdownPos.top, right: dropdownPos.right }}
      className={
        isTeacherTheme
          ? 'fixed z-[9999] w-[220px] overflow-hidden rounded-[12px] border border-[#9dc7de] bg-white shadow-[0_6px_14px_rgba(29,90,136,0.24)]'
          : 'fixed z-[9999] w-80 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl'
      }
    >
      <div className={isTeacherTheme ? 'border-b border-[#d6e2ea] bg-[#f1f3f5] px-5 py-3' : 'border-b border-gray-100 px-4 py-3'}>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-lg font-bold text-[#1f3f8f]">Thông báo</span>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-cyan-700 hover:underline">
              Đánh dấu đã đọc
            </button>
          )}
        </div>
        {/* {!isTeacherTheme && (
          <Link to={notifPath} onClick={() => setOpen(false)} className="text-xs text-blue-700 hover:underline">
            Xem tất cả
          </Link>
        )} */}
      </div>
      <div className={isTeacherTheme ? 'max-h-72 overflow-y-auto bg-[#c5e5ec]' : 'max-h-72 overflow-y-auto'}>
        {notifications.length === 0 ? (
          <p className={isTeacherTheme ? 'px-4 py-5 text-[12px] font-semibold text-[#2a4f85]' : 'py-6 text-center text-sm text-gray-500'}>
            Chưa có thông báo mới
          </p>
        ) : (
          notifications.slice(0, 10).map((n) => (
            <div
              key={n.id}
              className={`border-b px-4 py-3 last:border-0 ${isTeacherTheme ? 'border-[#b6dbe4] bg-[#c5e5ec]' : 'border-gray-50'} ${!n.readAt ? 'bg-cyan-50' : ''}`}
            >
              <p className="text-sm font-semibold text-[#1f3f8f]">{typeLabel[n.type] ?? n.type}</p>
              <p className="mt-1 text-xs text-[#37558e]">{new Date(n.createdAt).toLocaleString('vi-VN')}</p>
            </div>
          ))
        )}
      </div>
    </div>
  ) : null

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        className="relative z-10 p-2 text-white transition-colors hover:text-gray-200"
        aria-label="Thông báo"
      >
        <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2a4 4 0 00-4 4v1.1A7 7 0 004 13v4l-2 2h20l-2-2v-4a7 7 0 00-4-5.9V6a4 4 0 00-4-4zm0 20a3 3 0 002.83-2H9.17A3 3 0 0012 22z" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && createPortal(dropdownNode, document.body)}
    </div>
  )
}
