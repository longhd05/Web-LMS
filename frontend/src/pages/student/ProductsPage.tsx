import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StudentLayout from '../../components/student/Layout/StudentLayout'
import LoadingSpinner from '../../components/student/Common/LoadingSpinner'
import Badge from '../../components/student/Common/Badge'
import Modal from '../../components/student/Common/Modal'
import api from '../../api/axios'
import { Assignment } from '../../types/student'

type FilterType = 'all' | 'reviewed' | 'pending'

export default function ProductsPage() {
  const navigate = useNavigate()
  const [submissions, setSubmissions] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [selectedSubmission, setSelectedSubmission] = useState<Assignment | null>(null)

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true)
      try {
        const res = await api.get('/submissions/my-submissions')
        setSubmissions(res.data.data || [])
      } catch {
        // Silent fail - show empty state
      } finally {
        setLoading(false)
      }
    }
    fetchSubmissions()
  }, [])

  const filteredSubmissions = submissions.filter(item => {
    if (filter === 'all') return true
    if (filter === 'reviewed') return item.submission?.status === 'REVIEWED'
    if (filter === 'pending') return item.submission?.status === 'PENDING'
    return true
  })

  if (loading) {
    return (
      <StudentLayout>
        <LoadingSpinner />
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-black uppercase text-[#1f3f8f]">
            🎯 SẢN PHẨM CỦA TÔI
          </h1>
          <p className="mt-2 text-lg text-gray-700">
            Tất cả bài làm và sản phẩm đã nộp
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-full px-5 py-2.5 text-lg font-bold transition-all ${
              filter === 'all'
                ? 'border-2 border-[#1f3f8f] bg-gradient-to-b from-[#1f3f8f] to-[#149fb3] text-white shadow-[inset_0_0_0_1px_rgba(49,184,202,0.9)]'
                : 'border-2 border-[#7aa3df] bg-white text-[#1f3f8f] hover:bg-[#eef5ff]'
            }`}
          >
            Tất cả ({submissions.length})
          </button>
          <button
            onClick={() => setFilter('reviewed')}
            className={`rounded-full px-5 py-2.5 text-lg font-bold transition-all ${
              filter === 'reviewed'
                ? 'border-2 border-[#1f3f8f] bg-gradient-to-b from-[#1f3f8f] to-[#149fb3] text-white shadow-[inset_0_0_0_1px_rgba(49,184,202,0.9)]'
                : 'border-2 border-[#7aa3df] bg-white text-[#1f3f8f] hover:bg-[#eef5ff]'
            }`}
          >
            ✓ Đã chấm ({submissions.filter(s => s.submission?.status === 'REVIEWED').length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`rounded-full px-5 py-2.5 text-lg font-bold transition-all ${
              filter === 'pending'
                ? 'border-2 border-[#1f3f8f] bg-gradient-to-b from-[#1f3f8f] to-[#149fb3] text-white shadow-[inset_0_0_0_1px_rgba(49,184,202,0.9)]'
                : 'border-2 border-[#7aa3df] bg-white text-[#1f3f8f] hover:bg-[#eef5ff]'
            }`}
          >
            ⏱ Chờ duyệt ({submissions.filter(s => s.submission?.status === 'PENDING').length})
          </button>
        </div>

        {/* Submissions Grid */}
        {filteredSubmissions.length === 0 ? (
          <div className="rounded-[20px] bg-[#cbeff2] px-6 py-20 text-center text-lg text-[#1f3f8f]">
            {filter === 'all' 
              ? 'Bạn chưa nộp sản phẩm nào.'
              : `Không có sản phẩm ${filter === 'reviewed' ? 'đã chấm' : 'chờ duyệt'}.`
            }
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSubmissions.map((item) => (
              <div
                key={item.id}
                className="group cursor-pointer rounded-[20px] bg-[#cbeff2] p-5 text-[#1f3f8f] transition-all hover:-translate-y-0.5 hover:shadow-lg"
                onClick={() => setSelectedSubmission(item)}
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h3 className="flex-1 text-lg font-extrabold line-clamp-2">
                    {item.libraryItem.title}
                  </h3>
                  <Badge variant={item.submission?.status === 'REVIEWED' ? 'success' : 'pending'}>
                    {item.submission?.status === 'REVIEWED' ? '✓ Đã chấm' : '⏱ Chờ'}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-white px-3 py-1 font-bold">
                      {item.type === 'READING' ? '📖 Đọc hiểu' : '🎨 Tích hợp'}
                    </span>
                  </div>

                  {item.submission?.createdAt && (
                    <div className="text-xs text-gray-600">
                      Nộp: {new Date(item.submission.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  )}

                  {item.submission?.status === 'REVIEWED' && item.submission.score !== undefined && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold">Điểm:</span>
                      <span className="rounded-full bg-gradient-to-r from-green-500 to-teal-500 px-3 py-0.5 text-sm font-black text-white">
                        {item.submission.score}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Feedback Modal */}
        {selectedSubmission && (
          <Modal
            open={!!selectedSubmission}
            onClose={() => setSelectedSubmission(null)}
            title={selectedSubmission.libraryItem.title}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-[#cbeff2] px-4 py-2 font-bold text-[#1f3f8f]">
                  {selectedSubmission.type === 'READING' ? '📖 Đọc hiểu' : '🎨 Tích hợp'}
                </span>
                <Badge variant={selectedSubmission.submission?.status === 'REVIEWED' ? 'success' : 'pending'}>
                  {selectedSubmission.submission?.status === 'REVIEWED' ? '✓ Đã chấm' : '⏱ Chờ duyệt'}
                </Badge>
              </div>

              {selectedSubmission.submission?.createdAt && (
                <p className="text-sm text-gray-600">
                  Nộp bài: {new Date(selectedSubmission.submission.createdAt).toLocaleString('vi-VN')}
                </p>
              )}

              {selectedSubmission.submission?.status === 'REVIEWED' ? (
                <div className="space-y-3">
                  {selectedSubmission.submission.score !== undefined && (
                    <div className="rounded-lg bg-gradient-to-br from-green-50 to-teal-50 p-4">
                      <p className="mb-2 text-sm font-bold text-gray-700">Điểm số</p>
                      <p className="text-3xl font-black text-teal-600">
                        {selectedSubmission.submission.score}
                      </p>
                    </div>
                  )}

                  {selectedSubmission.submission.feedback && (
                    <div className="rounded-lg bg-[#f0f9ff] p-4">
                      <p className="mb-2 text-sm font-bold text-[#1f3f8f]">Nhận xét của giáo viên</p>
                      <p className="text-base leading-relaxed text-gray-800">
                        {selectedSubmission.submission.feedback}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      navigate(`/hoc-sinh/class/${selectedSubmission.classId}/assignment/${selectedSubmission.id}`)
                      setSelectedSubmission(null)
                    }}
                    className="w-full rounded-lg bg-gradient-to-b from-[#1f3f8f] to-[#149fb3] px-4 py-3 font-bold text-white transition-all hover:shadow-lg"
                  >
                    Xem chi tiết bài làm
                  </button>
                </div>
              ) : (
                <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4">
                  <p className="font-bold text-amber-700">
                    ⏱ Bài làm đang chờ giáo viên chấm
                  </p>
                </div>
              )}
            </div>
          </Modal>
        )}
      </div>
    </StudentLayout>
  )
}
