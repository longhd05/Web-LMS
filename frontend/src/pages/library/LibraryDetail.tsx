import { useState, useEffect, FormEvent } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../contexts/AuthContext'

interface LibraryItem {
  id: string
  title: string
  content: string
  tags: string[]
  level: string
  readingQuestionsJson?: string | null
  integrationPrompt?: string | null
}

interface Assignment {
  id: string
  type: 'READING' | 'INTEGRATION'
  libraryItemId: string
}

interface ReadingQuestion {
  question: string
  options: string[]
  answer?: number
}

export default function LibraryDetail() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const assignmentId = searchParams.get('assignmentId')
  const { user } = useAuth()

  const [item, setItem] = useState<LibraryItem | null>(null)
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Submission state
  const [readingAnswers, setReadingAnswers] = useState<Record<number, number>>({})
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const itemRes = await api.get(`/library/${id}`)
        setItem(itemRes.data.data)

        if (assignmentId) {
          const assignRes = await api.get(`/assignments/${assignmentId}`)
          setAssignment(assignRes.data.data)
        }
      } catch {
        setError('Không thể tải tài liệu.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, assignmentId])

  const readingQuestions: ReadingQuestion[] = (() => {
    if (!item?.readingQuestionsJson) return []
    try {
      return JSON.parse(item.readingQuestionsJson)
    } catch {
      return []
    }
  })()

  const handleSubmitReading = async (e: FormEvent) => {
    e.preventDefault()
    if (!assignmentId) return
    setSubmitting(true)
    setSubmitError('')
    try {
      await api.post(`/assignments/${assignmentId}/submissions`, {
        readingAnswersJson: JSON.stringify(readingAnswers),
        status: 'SUBMITTED',
      })
      setSubmitSuccess(true)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setSubmitError(msg ?? 'Nộp bài thất bại.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitIntegration = async (e: FormEvent) => {
    e.preventDefault()
    if (!assignmentId || !file) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const uploadRes = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const fileId = uploadRes.data.data.id

      await api.post(`/assignments/${assignmentId}/submissions`, {
        integrationFileId: fileId,
        status: 'SUBMITTED',
      })
      setSubmitSuccess(true)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setSubmitError(msg ?? 'Nộp bài thất bại.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-red-600">{error || 'Không tìm thấy tài liệu.'}</p>
        <Link to="/library" className="text-green-600 hover:underline mt-4 inline-block">← Quay lại thư viện</Link>
      </div>
    )
  }

  const levelColor: Record<string, string> = {
    'Cơ bản': 'bg-green-100 text-green-700',
    'Trung cấp': 'bg-yellow-100 text-yellow-700',
    'Nâng cao': 'bg-red-100 text-red-700',
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/library" className="hover:text-green-600">Thư viện</Link>
        <span>/</span>
        <span className="text-gray-800">{item.title}</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{item.title}</h1>
        <div className="flex flex-wrap gap-2 mb-4">
          {item.tags.map((tag) => (
            <span key={tag} className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">{tag}</span>
          ))}
          {item.level && (
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${levelColor[item.level] ?? 'bg-gray-100 text-gray-600'}`}>
              {item.level}
            </span>
          )}
        </div>
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{item.content}</p>
        </div>
      </div>

      {/* Reading Questions Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>📖</span> Bài Đọc hiểu
        </h2>
        {readingQuestions.length === 0 ? (
          <p className="text-gray-500">Không có câu hỏi đọc hiểu cho tài liệu này.</p>
        ) : (
          <div className="space-y-6">
            {readingQuestions.map((q, idx) => (
              <div key={idx} className="border border-gray-100 rounded-xl p-5">
                <p className="font-medium text-gray-800 mb-3">Câu {idx + 1}: {q.question}</p>
                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => (
                    <label key={optIdx} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name={`q-${idx}`}
                        value={optIdx}
                        onChange={() => setReadingAnswers((prev) => ({ ...prev, [idx]: optIdx }))}
                        className="text-green-600 focus:ring-green-500"
                        disabled={!assignmentId || submitSuccess}
                      />
                      <span className="text-gray-700 group-hover:text-gray-900">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Integration Section */}
      {item.integrationPrompt && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>🔗</span> Bài Tích hợp
          </h2>
          <div className="bg-indigo-50 rounded-xl p-5">
            <p className="text-indigo-800 leading-relaxed whitespace-pre-wrap">{item.integrationPrompt}</p>
          </div>
        </div>
      )}

      {/* Submit Section (only if student and has assignmentId) */}
      {user?.role === 'STUDENT' && assignmentId && assignment && (
        <div className="bg-white rounded-2xl border border-green-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>📤</span> Nộp bài
          </h2>

          {submitSuccess ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-xl">
              ✅ Bài nộp thành công! <Link to="/student/submissions" className="underline font-medium">Xem bài đã nộp</Link>
            </div>
          ) : (
            <>
              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                  {submitError}
                </div>
              )}

              {assignment.type === 'READING' && readingQuestions.length > 0 && (
                <form onSubmit={handleSubmitReading}>
                  <p className="text-gray-600 mb-4">Chọn câu trả lời ở phần Đọc hiểu bên trên, sau đó nhấn nộp bài.</p>
                  <button
                    type="submit"
                    disabled={submitting || Object.keys(readingAnswers).length < readingQuestions.length}
                    className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Đang nộp...' : 'Nộp bài'}
                  </button>
                </form>
              )}

              {assignment.type === 'INTEGRATION' && (
                <form onSubmit={handleSubmitIntegration} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tải lên tập tin (Word, ảnh, video MP4 - tối đa 50MB)
                    </label>
                    <input
                      type="file"
                      accept=".doc,.docx,.jpg,.jpeg,.png,.gif,.mp4"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting || !file}
                    className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Đang nộp...' : 'Nộp bài'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
