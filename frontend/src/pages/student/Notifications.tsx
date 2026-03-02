import { useState, useEffect } from 'react'
import api from '../../api/axios'

interface Notification {
  id: string
  type: string
  readAt: string | null
  createdAt: string
  payload: Record<string, unknown>
}

const typeLabel: Record<string, string> = {
  STUDENT_JOINED: '👥 Học sinh tham gia lớp',
  SUBMISSION_RECEIVED: '📥 Bài nộp mới',
  SUBMISSION_REVIEWED: '📝 Bài đã được chấm',
  SUBMISSION_PUBLISHED: '🌐 Bài được đăng cộng đồng',
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingRead, setMarkingRead] = useState(false)

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data.data)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchNotifications() }, [])

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.readAt).map((n) => n.id)
    if (unread.length === 0) return
    setMarkingRead(true)
    try {
      await api.post('/notifications/read', { ids: unread })
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })))
    } finally {
      setMarkingRead(false)
    }
  }

  const unreadCount = notifications.filter((n) => !n.readAt).length

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" /></div>
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thông báo</h1>
          {unreadCount > 0 && (
            <p className="text-gray-500 mt-1">{unreadCount} thông báo chưa đọc</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={markingRead}
            className="text-sm text-green-600 font-medium hover:underline disabled:opacity-50"
          >
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="text-5xl mb-4">🔔</div>
          <p className="text-gray-500 text-lg">Không có thông báo nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`rounded-xl border p-5 transition-colors ${
                !n.readAt ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900">
                    {typeLabel[n.type] ?? n.type}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(n.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
                {!n.readAt && (
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full flex-shrink-0 mt-1.5" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
