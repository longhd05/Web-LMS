import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

interface Submission {
  id: string
  status: 'DRAFT' | 'SUBMITTED' | 'NEEDS_REVIEW' | 'APPROVED' | 'REJECTED'
  createdAt: string
  updatedAt: string
  assignment: {
    id: string
    type: 'READING' | 'INTEGRATION'
    libraryItem: { id: string; title: string }
    class: { id: string; name: string }
  }
  review?: {
    comment?: string | null
    resultStatus: 'PASSED' | 'FAILED'
    reviewedAt: string
    teacher?: { name: string }
  } | null
}

const statusConfig: Record<string, { label: string; className: string }> = {
  DRAFT: { label: 'Nháp', className: 'bg-gray-100 text-gray-600' },
  SUBMITTED: { label: 'Đã nộp', className: 'bg-blue-100 text-blue-700' },
  NEEDS_REVIEW: { label: 'Chờ chấm', className: 'bg-yellow-100 text-yellow-700' },
  APPROVED: { label: 'Đạt', className: 'bg-green-100 text-green-700' },
  REJECTED: { label: 'Chưa đạt', className: 'bg-red-100 text-red-700' },
}

export default function Submissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/submissions')
        setSubmissions(res.data.data)
      } catch {
        setError('Không thể tải danh sách bài nộp.')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const toggle = (id: string) => setExpandedId((prev) => (prev === id ? null : id))

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" /></div>
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bài đã nộp</h1>
        <p className="text-gray-500 mt-1">Danh sách tất cả bài nộp của bạn</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
      )}

      {submissions.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-gray-500 text-lg">Bạn chưa nộp bài tập nào</p>
          <Link to="/student/dashboard" className="text-green-600 hover:underline mt-3 inline-block">
            Xem lớp học của bạn
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => {
            const status = statusConfig[sub.status] ?? { label: sub.status, className: 'bg-gray-100 text-gray-600' }
            const isExpanded = expandedId === sub.id

            return (
              <div key={sub.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggle(sub.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status.className}`}>
                          {status.label}
                        </span>
                        <span className={`text-xs px-2.5 py-1 rounded-full ${
                          sub.assignment.type === 'READING' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                        }`}>
                          {sub.assignment.type === 'READING' ? 'Đọc hiểu' : 'Tích hợp'}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900">{sub.assignment.libraryItem.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Lớp: {sub.assignment.class.name} • Nộp lúc: {new Date(sub.updatedAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 px-6 py-5 bg-gray-50">
                    {sub.review ? (
                      <div className={`rounded-xl p-5 border ${
                        sub.review.resultStatus === 'PASSED'
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-gray-900">
                            {sub.review.resultStatus === 'PASSED' ? '✅ Đạt' : '❌ Chưa đạt'}
                          </span>
                          {sub.review.teacher && (
                            <span className="text-sm text-gray-500">— {sub.review.teacher.name}</span>
                          )}
                        </div>
                        {sub.review.comment && (
                          <p className="text-sm text-gray-700">{sub.review.comment}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          Chấm lúc: {new Date(sub.review.reviewedAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">Bài chưa được chấm điểm.</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
