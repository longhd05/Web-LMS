import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../api/axios'

interface CommunityPost {
  id: string
  communityKey: string
  publishedAt: string
  publisher: { id: string; name: string; avatarUrl?: string | null }
  submission: {
    id: string
    student: { id: string; name: string; avatarUrl?: string | null }
    assignment: {
      type: 'READING' | 'INTEGRATION'
      libraryItem: { id: string; title: string }
    }
    readingAnswersJson?: string | null
    integrationFile?: { url: string; filename: string } | null
    review?: {
      comment?: string | null
      resultStatus: 'PASSED' | 'FAILED'
      teacher: { name: string }
    } | null
  }
}

const communityNames: Record<string, string> = {
  'hieu-si-xanh': 'Hiệp sĩ xanh',
  'su-gia-hoa-binh': 'Sứ giả hòa bình',
  'an-toan-cong-nghe': 'An toàn công nghệ',
}

const communityEmojis: Record<string, string> = {
  'hieu-si-xanh': '🛡️',
  'su-gia-hoa-binh': '☮️',
  'an-toan-cong-nghe': '🔐',
}

export default function CommunityDetail() {
  const { communityKey } = useParams<{ communityKey: string }>()
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null)
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 })

  const fetchPosts = async (page = 1) => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get(`/community/${communityKey}/posts`, { params: { page, limit: 10 } })
      setPosts(res.data.data)
      setMeta(res.data.meta)
    } catch {
      setError('Không thể tải bài viết.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (communityKey) fetchPosts()
  }, [communityKey])

  const name = communityNames[communityKey ?? ''] ?? communityKey
  const emoji = communityEmojis[communityKey ?? ''] ?? '🌐'

  if (selectedPost) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => setSelectedPost(null)}
          className="flex items-center gap-2 text-gray-500 hover:text-green-600 mb-6"
        >
          ← Quay lại danh sách
        </button>

        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">
              {selectedPost.submission.student.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{selectedPost.submission.student.name}</p>
              <p className="text-sm text-gray-500">
                {new Date(selectedPost.publishedAt).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {selectedPost.submission.assignment.libraryItem.title}
          </h2>
          <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium mb-5 ${
            selectedPost.submission.assignment.type === 'READING'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-purple-100 text-purple-700'
          }`}>
            {selectedPost.submission.assignment.type === 'READING' ? 'Đọc hiểu' : 'Tích hợp'}
          </span>

          {selectedPost.submission.assignment.type === 'READING' && selectedPost.submission.readingAnswersJson && (
            <div className="bg-gray-50 rounded-xl p-5 mb-5">
              <p className="text-sm font-medium text-gray-700 mb-2">Câu trả lời:</p>
              <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                {JSON.stringify(JSON.parse(selectedPost.submission.readingAnswersJson), null, 2)}
              </pre>
            </div>
          )}

          {selectedPost.submission.assignment.type === 'INTEGRATION' && selectedPost.submission.integrationFile && (
            <div className="mb-5">
              <a
                href={`http://localhost:3000${selectedPost.submission.integrationFile.url}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                📎 Tải file bài nộp: {selectedPost.submission.integrationFile.filename}
              </a>
            </div>
          )}

          {selectedPost.submission.review && (
            <div className={`rounded-xl p-5 border ${selectedPost.submission.review.resultStatus === 'PASSED' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <p className="font-semibold mb-1">
                {selectedPost.submission.review.resultStatus === 'PASSED' ? '✅ Đạt' : '❌ Chưa đạt'}
                {' '}— {selectedPost.submission.review.teacher.name}
              </p>
              {selectedPost.submission.review.comment && (
                <p className="text-sm text-gray-700">{selectedPost.submission.review.comment}</p>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/community" className="hover:text-green-600">Cộng đồng</Link>
        <span>/</span>
        <span className="text-gray-800">{name}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <span>{emoji}</span> {name}
        </h1>
        <p className="text-gray-500 mt-1">{meta.total} bài viết</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">Chưa có bài viết nào trong cộng đồng này.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedPost(post)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">
                      {post.submission.student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{post.submission.student.name}</p>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {post.submission.assignment.libraryItem.title}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      post.submission.assignment.type === 'READING'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {post.submission.assignment.type === 'READING' ? 'Đọc hiểu' : 'Tích hợp'}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(post.publishedAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={() => fetchPosts(meta.page - 1)}
                disabled={meta.page <= 1}
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Trước
              </button>
              <span className="text-sm text-gray-600">Trang {meta.page} / {meta.totalPages}</span>
              <button
                onClick={() => fetchPosts(meta.page + 1)}
                disabled={meta.page >= meta.totalPages}
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
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
