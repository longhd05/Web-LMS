import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../api/axios'

interface Assignment {
  id: string
  type: 'READING' | 'INTEGRATION'
  mode: 'INDIVIDUAL' | 'GROUP'
  dueAt: string | null
  libraryItem: { id: string; title: string; level: string; tags: string[] }
}

interface ClassInfo {
  id: string
  name: string
  code: string
  teacher: { id: string; name: string; email: string }
  assignments: Assignment[]
}

export default function ClassDetail() {
  const { classId } = useParams<{ classId: string }>()
  const [cls, setCls] = useState<ClassInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const res = await api.get(`/classes/${classId}`)
        setCls(res.data.data)
      } catch {
        setError('Không thể tải thông tin lớp học.')
      } finally {
        setLoading(false)
      }
    }
    fetchClass()
  }, [classId])

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" /></div>
  }

  if (error || !cls) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-red-600">{error}</p>
        <Link to="/student/dashboard" className="text-green-600 hover:underline mt-4 inline-block">← Quay lại</Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/student/dashboard" className="hover:text-green-600">Lớp học</Link>
        <span>/</span>
        <span className="text-gray-800">{cls.name}</span>
      </nav>

      {/* Class header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl p-8 mb-8 text-white">
        <h1 className="text-3xl font-bold mb-2">{cls.name}</h1>
        <p className="opacity-80 mb-4">Giáo viên: {cls.teacher.name}</p>
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
          <span className="text-sm font-medium">Mã lớp:</span>
          <span className="font-bold tracking-widest">{cls.code}</span>
        </div>
      </div>

      {/* Assignments */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-5">
          Danh sách bài tập ({cls.assignments.length})
        </h2>

        {cls.assignments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-500">
            Chưa có bài tập nào trong lớp này.
          </div>
        ) : (
          <div className="space-y-4">
            {cls.assignments.map((a) => (
              <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        a.type === 'READING' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {a.type === 'READING' ? '📖 Đọc hiểu' : '🔗 Tích hợp'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg">{a.libraryItem.title}</h3>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {a.libraryItem.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                    {a.dueAt && (
                      <p className="text-sm text-gray-500 mt-2">
                        📅 Hạn nộp: {new Date(a.dueAt).toLocaleString('vi-VN')}
                      </p>
                    )}
                  </div>
                  <Link
                    to={`/library/${a.libraryItem.id}?assignmentId=${a.id}`}
                    className="flex-shrink-0 bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-colors text-sm"
                  >
                    Làm bài
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
