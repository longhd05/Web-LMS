import { useState, useEffect, FormEvent } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'

interface LibraryItem {
  id: string
  title: string
  level: string
  tags: string[]
}

export default function CreateAssignment() {
  const { classId } = useParams<{ classId: string }>()
  const navigate = useNavigate()

  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([])
  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [type, setType] = useState<'READING' | 'INTEGRATION'>('READING')
  const [dueAt, setDueAt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [className, setClassName] = useState('')

  // Fetch class name
  useEffect(() => {
    api.get(`/classes/${classId}`).then((res) => setClassName(res.data.data.name)).catch(() => {})
  }, [classId])

  // Debounced library search
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const res = await api.get('/library', { params: { search: search || undefined, limit: 20 } })
        setLibraryItems(res.data.data)
      } catch {
        // silent
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Initial load
  useEffect(() => {
    api.get('/library', { params: { limit: 20 } }).then((res) => setLibraryItems(res.data.data)).catch(() => {})
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedItem) {
      setError('Vui lòng chọn tài liệu.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await api.post('/assignments', {
        classId,
        libraryItemId: selectedItem.id,
        type,
        mode: 'INDIVIDUAL',
        dueAt: dueAt ? new Date(dueAt).toISOString() : null,
      })
      navigate(`/teacher/class/${classId}`)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(msg ?? 'Tạo bài tập thất bại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/teacher/dashboard" className="hover:text-green-600">Lớp học</Link>
        <span>/</span>
        <Link to={`/teacher/class/${classId}`} className="hover:text-green-600">{className}</Link>
        <span>/</span>
        <span className="text-gray-800">Tạo bài tập</span>
      </nav>

      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tạo bài tập mới</h1>
        <p className="text-gray-500 text-sm mb-8">Chọn tài liệu từ thư viện và cấu hình bài tập.</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Library item selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tài liệu thư viện <span className="text-red-500">*</span>
            </label>

            {selectedItem ? (
              <div className="flex items-center justify-between border border-green-300 bg-green-50 rounded-xl px-4 py-3">
                <div>
                  <p className="font-medium text-gray-900">{selectedItem.title}</p>
                  <div className="flex gap-1.5 mt-1">
                    {selectedItem.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-xs bg-white text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-200">
                        {tag}
                      </span>
                    ))}
                    {selectedItem.level && (
                      <span className="text-xs bg-white text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">
                        {selectedItem.level}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-red-500 ml-3"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setShowDropdown(true) }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Tìm kiếm tài liệu..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {showDropdown && libraryItems.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
                    {libraryItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => { setSelectedItem(item); setShowDropdown(false); setSearch('') }}
                        className="w-full text-left px-4 py-3 hover:bg-green-50 transition-colors border-b border-gray-50 last:border-0"
                      >
                        <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                        {item.level && <p className="text-xs text-gray-500">{item.level}</p>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Assignment type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Loại bài tập <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center gap-3 border-2 rounded-xl px-4 py-3 cursor-pointer transition-colors ${
                type === 'READING' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="type"
                  value="READING"
                  checked={type === 'READING'}
                  onChange={() => setType('READING')}
                  className="text-green-600"
                />
                <div>
                  <p className="font-medium text-gray-900 text-sm">📖 Đọc hiểu</p>
                  <p className="text-xs text-gray-500">Trả lời câu hỏi trắc nghiệm</p>
                </div>
              </label>
              <label className={`flex items-center gap-3 border-2 rounded-xl px-4 py-3 cursor-pointer transition-colors ${
                type === 'INTEGRATION' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="type"
                  value="INTEGRATION"
                  checked={type === 'INTEGRATION'}
                  onChange={() => setType('INTEGRATION')}
                  className="text-green-600"
                />
                <div>
                  <p className="font-medium text-gray-900 text-sm">🔗 Tích hợp</p>
                  <p className="text-xs text-gray-500">Nộp file bài làm</p>
                </div>
              </label>
            </div>
          </div>

          {/* Mode (GROUP disabled) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Hình thức</label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-3 border-2 border-green-500 bg-green-50 rounded-xl px-4 py-3 cursor-pointer">
                <input type="radio" name="mode" value="INDIVIDUAL" defaultChecked className="text-green-600" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">👤 Cá nhân</p>
                </div>
              </label>
              <div className="relative" title="Chức năng sắp ra mắt">
                <label className="flex items-center gap-3 border-2 border-gray-200 rounded-xl px-4 py-3 opacity-50 cursor-not-allowed">
                  <input type="radio" name="mode" value="GROUP" disabled className="text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-600 text-sm">👥 Nhóm</p>
                    <p className="text-xs text-gray-400">Sắp ra mắt</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hạn nộp (không bắt buộc)</label>
            <input
              type="datetime-local"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              to={`/teacher/class/${classId}`}
              className="flex-1 py-3 text-center rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={loading || !selectedItem}
              className="flex-1 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang tạo...' : 'Tạo bài tập'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
