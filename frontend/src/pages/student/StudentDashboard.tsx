import { useState, useEffect, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'

interface ClassInfo {
  id: string
  name: string
  code: string
  teacher: { id: string; name: string; email: string }
  _count: { memberships: number; assignments: number }
}

export default function StudentDashboard() {
  const [classes, setClasses] = useState<ClassInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showJoinDialog, setShowJoinDialog] = useState(false)
  const [classCode, setClassCode] = useState('')
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState('')
  const [showCreateSuccess, setShowCreateSuccess] = useState<{ name: string; code: string } | null>(null)
  const navigate = useNavigate()

  const fetchClasses = async () => {
    setLoading(true)
    try {
      const res = await api.get('/classes')
      setClasses(res.data.data)
    } catch {
      setError('Không thể tải danh sách lớp học.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchClasses() }, [])

  const handleJoin = async (e: FormEvent) => {
    e.preventDefault()
    setJoining(true)
    setJoinError('')
    try {
      const res = await api.post('/classes/join', { code: classCode.toUpperCase() })
      setShowJoinDialog(false)
      setClassCode('')
      // Show success and navigate
      const cls = res.data.data.class
      setShowCreateSuccess({ name: cls.name, code: cls.code })
      await fetchClasses()
      setTimeout(() => setShowCreateSuccess(null), 4000)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setJoinError(msg ?? 'Tham gia lớp thất bại.')
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lớp học của tôi</h1>
          <p className="text-gray-500 mt-1">Quản lý và truy cập các lớp học đã tham gia</p>
        </div>
        <button
          onClick={() => setShowJoinDialog(true)}
          className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tham gia lớp
        </button>
      </div>

      {showCreateSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-5 py-4 rounded-xl mb-6 flex items-center gap-3">
          ✅ Đã tham gia lớp <strong>{showCreateSuccess.name}</strong> thành công!
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
        </div>
      ) : classes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="text-5xl mb-4">🏫</div>
          <p className="text-gray-500 text-lg mb-4">Bạn chưa tham gia lớp học nào</p>
          <button
            onClick={() => setShowJoinDialog(true)}
            className="text-green-600 font-medium hover:underline"
          >
            Tham gia lớp học ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div
              key={cls.id}
              onClick={() => navigate(`/student/class/${cls.id}`)}
              className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:border-green-300 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-green-700 font-bold">📚</span>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-green-600 transition-colors">
                {cls.name}
              </h3>
              <p className="text-sm text-gray-500 mb-4">Giáo viên: {cls.teacher.name}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  👥 {cls._count.memberships} học sinh
                </span>
                <span className="flex items-center gap-1">
                  📋 {cls._count.assignments} bài tập
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Join class dialog */}
      {showJoinDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Tham gia lớp học</h2>
            <p className="text-gray-500 text-sm mb-6">Nhập mã lớp gồm 6 ký tự do giáo viên cung cấp</p>

            {joinError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{joinError}</div>
            )}

            <form onSubmit={handleJoin} className="space-y-4">
              <input
                type="text"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                placeholder="Ví dụ: ABC123"
                maxLength={6}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center text-2xl font-bold tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowJoinDialog(false); setJoinError(''); setClassCode('') }}
                  className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={joining || classCode.length !== 6}
                  className="flex-1 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {joining ? 'Đang tham gia...' : 'Tham gia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
