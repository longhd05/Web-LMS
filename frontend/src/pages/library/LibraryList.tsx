import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

interface LibraryItem {
  id: string
  title: string
  tags: string[]
  level: string
  content: string
  createdAt: string
}

interface Meta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function LibraryList() {
  const [items, setItems] = useState<LibraryItem[]>([])
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 12, totalPages: 1 })
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  const fetchItems = useCallback(async (page: number, searchTerm: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/library', {
        params: { page, limit: 12, search: searchTerm || undefined },
      })
      setItems(res.data.data)
      setMeta(res.data.meta)
    } catch {
      setError('Không thể tải thư viện. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems(1, debouncedSearch)
  }, [debouncedSearch, fetchItems])

  const goToPage = (page: number) => {
    fetchItems(page, debouncedSearch)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const levelColor: Record<string, string> = {
    'Cơ bản': 'bg-green-100 text-green-700',
    'Trung cấp': 'bg-yellow-100 text-yellow-700',
    'Nâng cao': 'bg-red-100 text-red-700',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Thư viện học liệu</h1>
        <p className="text-gray-500">Khám phá kho tài liệu đa dạng theo nhiều chủ đề và cấp độ</p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-lg">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm tài liệu, thẻ, cấp độ..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">Không tìm thấy tài liệu nào</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            Hiển thị {items.length} / {meta.total} tài liệu
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <Link
                key={item.id}
                to={`/library/${item.id}`}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-green-300 transition-all group"
              >
                <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-green-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-3">{item.content}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {item.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                {item.level && (
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${levelColor[item.level] ?? 'bg-gray-100 text-gray-600'}`}>
                    {item.level}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10">
              <button
                onClick={() => goToPage(meta.page - 1)}
                disabled={meta.page <= 1}
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Trước
              </button>
              <span className="text-sm text-gray-600">
                Trang {meta.page} / {meta.totalPages}
              </span>
              <button
                onClick={() => goToPage(meta.page + 1)}
                disabled={meta.page >= meta.totalPages}
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Tiếp →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
