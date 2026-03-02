import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'

interface Assignment {
  id: string
  type: 'READING' | 'INTEGRATION'
  mode: 'INDIVIDUAL' | 'GROUP'
  dueAt: string | null
  createdAt: string
  libraryItem: { id: string; title: string }
}

interface Member {
  student: { id: string; name: string; email: string }
  joinedAt: string
}

interface Submission {
  id: string
  status: string
  createdAt: string
  student: { id: string; name: string; email: string }
  assignment: { id: string; type: string; libraryItem: { title: string } }
  review?: { resultStatus: string } | null
}

interface ClassDetail {
  id: string
  name: string
  code: string
  teacher: { id: string; name: string; email: string }
  memberships: Member[]
  assignments: Assignment[]
}

const statusConfig: Record<string, { label: string; className: string }> = {
  DRAFT: { label: 'Nháp', className: 'bg-gray-100 text-gray-600' },
  SUBMITTED: { label: 'Đã nộp', className: 'bg-blue-100 text-blue-700' },
  NEEDS_REVIEW: { label: 'Chờ chấm', className: 'bg-yellow-100 text-yellow-700' },
  APPROVED: { label: 'Đạt', className: 'bg-green-100 text-green-700' },
  REJECTED: { label: 'Chưa đạt', className: 'bg-red-100 text-red-700' },
}

export default function TeacherClassDetail() {
  const { classId } = useParams<{ classId: string }>()
  const navigate = useNavigate()
  const [cls, setCls] = useState<ClassDetail | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'assignments' | 'submissions'>('assignments')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clsRes, subRes] = await Promise.all([
          api.get(`/classes/${classId}`),
          api.get(`/classes/${classId}/submissions`),
        ])
        setCls(clsRes.data.data)
        setSubmissions(subRes.data.data)
      } catch {
        setError('Không thể tải thông tin lớp học.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [classId])

  const copyCode = () => {
    if (cls) {
      navigator.clipboard.writeText(cls.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" /></div>
  }

  if (error || !cls) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-red-600">{error}</p>
        <Link to="/teacher/dashboard" className="text-green-600 hover:underline mt-4 inline-block">← Quay lại</Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/teacher/dashboard" className="hover:text-green-600">Lớp học</Link>
        <span>/</span>
        <span className="text-gray-800">{cls.name}</span>
      </nav>

      {/* Class header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl p-8 mb-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{cls.name}</h1>
            <p className="opacity-80">👥 {cls.memberships.length} học sinh</p>
          </div>
          <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-4 py-3 rounded-xl">
            <div>
              <p className="text-xs opacity-70">Mã lớp</p>
              <span className="font-bold tracking-widest text-xl">{cls.code}</span>
            </div>
            <button
              onClick={copyCode}
              className="ml-2 bg-white/30 hover:bg-white/40 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              {copied ? '✓ Đã sao chép' : 'Sao chép'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'assignments'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          📋 Bài tập ({cls.assignments.length})
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'submissions'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          📥 Bài nộp ({submissions.length})
        </button>
      </div>

      {activeTab === 'assignments' && (
        <div>
          <div className="flex justify-end mb-5">
            <Link
              to={`/teacher/create-assignment/${classId}`}
              className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tạo bài tập
            </Link>
          </div>

          {cls.assignments.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-500">
              Chưa có bài tập nào. Hãy tạo bài tập đầu tiên!
            </div>
          ) : (
            <div className="space-y-4">
              {cls.assignments.map((a) => (
                <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          a.type === 'READING' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {a.type === 'READING' ? '📖 Đọc hiểu' : '🔗 Tích hợp'}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
                          {a.mode === 'INDIVIDUAL' ? 'Cá nhân' : 'Nhóm'}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900">{a.libraryItem.title}</h3>
                      {a.dueAt && (
                        <p className="text-sm text-gray-500 mt-1">
                          📅 Hạn: {new Date(a.dueAt).toLocaleString('vi-VN')}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Tạo lúc: {new Date(a.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'submissions' && (
        <div>
          {submissions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-500">
              Chưa có bài nộp nào.
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((sub) => {
                const status = statusConfig[sub.status] ?? { label: sub.status, className: 'bg-gray-100 text-gray-600' }
                return (
                  <div
                    key={sub.id}
                    className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow cursor-pointer"
                    onClick={() => navigate(`/teacher/review/${sub.id}`)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status.className}`}>
                            {status.label}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            sub.assignment.type === 'READING' ? 'text-blue-600' : 'text-purple-600'
                          }`}>
                            {sub.assignment.type === 'READING' ? 'Đọc hiểu' : 'Tích hợp'}
                          </span>
                        </div>
                        <p className="font-medium text-gray-900">{sub.student.name}</p>
                        <p className="text-sm text-gray-500">{sub.assignment.libraryItem.title}</p>
                      </div>
                      <p className="text-xs text-gray-400 flex-shrink-0">
                        {new Date(sub.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
