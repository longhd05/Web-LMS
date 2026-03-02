import { useState, useEffect, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'

interface ClassInfo {
  id: string
  name: string
  code: string
  _count: { memberships: number; assignments: number }
}

export default function TeacherDashboard() {
  const [classes, setClasses] = useState<ClassInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [className, setClassName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [newClass, setNewClass] = useState<{ name: string; code: string } | null>(null)
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

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setCreateError('')
    try {
      const res = await api.post('/classes', { name: className })
      const created = res.data.data
      setNewClass({ name: created.name, code: created.code })
      setClassName('')
      await fetchClasses()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setCreateError(msg ?? 'Tạo lớp thất bại.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lớp học của tôi</h1>
          <p className="text-gray-500 mt-1">Quản lý các lớp học và theo dõi tiến độ học sinh</p>
        </div>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tạo lớp mới
        </button>
      </div>

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
          <p className="text-gray-500 text-lg mb-4">Bạn chưa tạo lớp học nào</p>
          <button onClick={() => setShowCreateDialog(true)} className="text-green-600 font-medium hover:underline">
            Tạo lớp học đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div
              key={cls.id}
              onClick={() => navigate(`/teacher/class/${cls.id}`)}
              className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:border-green-300 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-700 font-bold">
                  📚
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-mono font-medium">
                  {cls.code}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-4 group-hover:text-green-600 transition-colors">
                {cls.name}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>👥 {cls._count.memberships} học sinh</span>
                <span>📋 {cls._count.assignments} bài tập</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create class dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Tạo lớp học mới</h2>
            <p className="text-gray-500 text-sm mb-6">Mã lớp sẽ được tạo tự động sau khi tạo lớp.</p>

            {createError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{createError}</div>
            )}

            {newClass ? (
              <div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-5">
                  <p className="text-green-800 font-medium mb-3">✅ Lớp <strong>{newClass.name}</strong> đã được tạo!</p>
                  <p className="text-sm text-gray-600 mb-2">Mã lớp để chia sẻ với học sinh:</p>
                  <div className="bg-white border-2 border-green-300 rounded-lg px-6 py-3 text-center">
                    <span className="text-3xl font-bold tracking-widest text-green-700">{newClass.code}</span>
                  </div>
                </div>
                <button
                  onClick={() => { setShowCreateDialog(false); setNewClass(null) }}
                  className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700"
                >
                  Đóng
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="space-y-4">
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="Tên lớp học"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowCreateDialog(false); setCreateError('') }}
                    className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !className.trim()}
                    className="flex-1 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-60"
                  >
                    {creating ? 'Đang tạo...' : 'Tạo lớp'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
