import { useState, useEffect, FormEvent } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'

interface Submission {
  id: string
  status: string
  readingAnswersJson?: string | null
  integrationFile?: { url: string; filename: string; mimetype: string } | null
  student: { id: string; name: string; email: string }
  assignment: {
    id: string
    type: 'READING' | 'INTEGRATION'
    libraryItem: {
      id: string
      title: string
      readingQuestionsJson?: string | null
    }
    class: { id: string; name: string }
  }
  review?: {
    id: string
    comment?: string | null
    resultStatus: 'PASSED' | 'FAILED'
    perQuestionMarksJson?: string | null
    reviewedAt: string
    teacher?: { id: string; name: string }
  } | null
  communityPost?: { id: string } | null
}

interface ReadingQuestion {
  question: string
  options: string[]
}

const communities = [
  { key: 'hieu-si-xanh', name: 'Hiệp sĩ xanh' },
  { key: 'su-gia-hoa-binh', name: 'Sứ giả hòa bình' },
  { key: 'an-toan-cong-nghe', name: 'An toàn công nghệ' },
]

export default function ReviewSubmission() {
  const { submissionId } = useParams<{ submissionId: string }>()
  const navigate = useNavigate()

  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Review form state
  const [comment, setComment] = useState('')
  const [resultStatus, setResultStatus] = useState<'PASSED' | 'FAILED'>('PASSED')
  const [perQuestionMarks, setPerQuestionMarks] = useState<Record<number, boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState(false)

  // Publish state
  const [selectedCommunity, setSelectedCommunity] = useState(communities[0].key)
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState('')
  const [publishSuccess, setPublishSuccess] = useState(false)

  const fetchSubmission = async () => {
    try {
      const res = await api.get(`/submissions/${submissionId}`)
      const data: Submission = res.data.data
      setSubmission(data)
      if (data.review) {
        setComment(data.review.comment ?? '')
        setResultStatus(data.review.resultStatus)
        if (data.review.perQuestionMarksJson) {
          try {
            setPerQuestionMarks(JSON.parse(data.review.perQuestionMarksJson))
          } catch { /* noop */ }
        }
      }
    } catch {
      setError('Không thể tải bài nộp.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSubmission() }, [submissionId])

  const readingQuestions: ReadingQuestion[] = (() => {
    if (!submission?.assignment.libraryItem.readingQuestionsJson) return []
    try {
      return JSON.parse(submission.assignment.libraryItem.readingQuestionsJson)
    } catch {
      return []
    }
  })()

  const studentAnswers: Record<number, number> = (() => {
    if (!submission?.readingAnswersJson) return {}
    try {
      return JSON.parse(submission.readingAnswersJson)
    } catch {
      return {}
    }
  })()

  const handleReview = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setReviewError('')
    try {
      await api.post(`/submissions/${submissionId}/review`, {
        comment,
        resultStatus,
        perQuestionMarksJson: Object.keys(perQuestionMarks).length > 0
          ? JSON.stringify(perQuestionMarks)
          : undefined,
      })
      setReviewSuccess(true)
      await fetchSubmission()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setReviewError(msg ?? 'Chấm điểm thất bại.')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePublish = async () => {
    setPublishing(true)
    setPublishError('')
    try {
      await api.post(`/submissions/${submissionId}/publish`, { communityKey: selectedCommunity })
      setPublishSuccess(true)
      await fetchSubmission()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setPublishError(msg ?? 'Đăng lên cộng đồng thất bại.')
    } finally {
      setPublishing(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" /></div>
  }

  if (error || !submission) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-red-600">{error || 'Không tìm thấy bài nộp.'}</p>
      </div>
    )
  }

  const isApproved = submission.status === 'APPROVED'
  const alreadyPublished = !!submission.communityPost

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/teacher/dashboard" className="hover:text-green-600">Lớp học</Link>
        <span>/</span>
        <Link to={`/teacher/class/${submission.assignment.class.id}`} className="hover:text-green-600">
          {submission.assignment.class.name}
        </Link>
        <span>/</span>
        <span className="text-gray-800">Chấm bài</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{submission.assignment.libraryItem.title}</h1>
            <p className="text-gray-600">Học sinh: <strong>{submission.student.name}</strong> ({submission.student.email})</p>
          </div>
          <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${
            submission.assignment.type === 'READING' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
          }`}>
            {submission.assignment.type === 'READING' ? '📖 Đọc hiểu' : '🔗 Tích hợp'}
          </span>
        </div>
      </div>

      {/* Student answers */}
      {submission.assignment.type === 'READING' && readingQuestions.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Câu trả lời của học sinh</h2>
          <div className="space-y-5">
            {readingQuestions.map((q, idx) => {
              const studentAns = studentAnswers[idx]
              const isCorrect = perQuestionMarks[idx]

              return (
                <div key={idx} className="border border-gray-100 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <p className="font-medium text-gray-800">Câu {idx + 1}: {q.question}</p>
                    <button
                      type="button"
                      onClick={() => setPerQuestionMarks((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                      className={`flex-shrink-0 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        isCorrect
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {isCorrect ? '✓ Đúng' : '✗ Sai'}
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {q.options.map((opt, optIdx) => (
                      <div
                        key={optIdx}
                        className={`px-4 py-2 rounded-lg text-sm ${
                          optIdx === studentAns
                            ? isCorrect
                              ? 'bg-green-100 text-green-800 font-medium'
                              : 'bg-red-100 text-red-800 font-medium'
                            : 'text-gray-600'
                        }`}
                      >
                        {optIdx === studentAns && (
                          <span className="mr-2">{isCorrect ? '✓' : '✗'}</span>
                        )}
                        {opt}
                      </div>
                    ))}
                  </div>
                  {studentAns === undefined && (
                    <p className="text-xs text-gray-400 mt-2">Học sinh chưa trả lời câu này.</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Integration file */}
      {submission.assignment.type === 'INTEGRATION' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">File bài nộp</h2>
          {submission.integrationFile ? (
            <a
              href={`http://localhost:3000${submission.integrationFile.url}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-5 py-3 rounded-xl font-medium hover:bg-indigo-100 transition-colors"
            >
              📎 Tải xuống: {submission.integrationFile.filename}
            </a>
          ) : (
            <p className="text-gray-500">Không có file bài nộp.</p>
          )}
        </div>
      )}

      {/* Review form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Chấm điểm</h2>

        {reviewSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            ✅ Đã chấm điểm thành công!
          </div>
        )}

        {reviewError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{reviewError}</div>
        )}

        <form onSubmit={handleReview} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kết quả</label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center gap-3 border-2 rounded-xl px-4 py-3 cursor-pointer ${
                resultStatus === 'PASSED' ? 'border-green-500 bg-green-50' : 'border-gray-200'
              }`}>
                <input
                  type="radio"
                  value="PASSED"
                  checked={resultStatus === 'PASSED'}
                  onChange={() => setResultStatus('PASSED')}
                  className="text-green-600"
                />
                <span className="font-medium text-gray-900">✅ Đạt</span>
              </label>
              <label className={`flex items-center gap-3 border-2 rounded-xl px-4 py-3 cursor-pointer ${
                resultStatus === 'FAILED' ? 'border-red-400 bg-red-50' : 'border-gray-200'
              }`}>
                <input
                  type="radio"
                  value="FAILED"
                  checked={resultStatus === 'FAILED'}
                  onChange={() => setResultStatus('FAILED')}
                  className="text-red-500"
                />
                <span className="font-medium text-gray-900">❌ Chưa đạt</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nhận xét (không bắt buộc)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Viết nhận xét cho học sinh..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-60"
          >
            {submitting ? 'Đang lưu...' : 'Lưu kết quả chấm'}
          </button>
        </form>
      </div>

      {/* Publish to community (only if APPROVED integration) */}
      {isApproved && (
        <div className="bg-white rounded-2xl border border-indigo-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">🌐 Đăng lên cộng đồng</h2>
          <p className="text-gray-500 text-sm mb-5">
            Chia sẻ bài làm xuất sắc của học sinh lên một trong ba cộng đồng.
          </p>

          {alreadyPublished ? (
            <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-3 rounded-lg">
              ✅ Bài này đã được đăng lên cộng đồng.
            </div>
          ) : (
            <>
              {publishSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                  ✅ Đã đăng lên cộng đồng thành công!
                </div>
              )}
              {publishError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{publishError}</div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chọn cộng đồng</label>
                  <div className="space-y-2">
                    {communities.map((c) => (
                      <label key={c.key} className={`flex items-center gap-3 border-2 rounded-xl px-4 py-3 cursor-pointer ${
                        selectedCommunity === c.key ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                      }`}>
                        <input
                          type="radio"
                          value={c.key}
                          checked={selectedCommunity === c.key}
                          onChange={() => setSelectedCommunity(c.key)}
                          className="text-indigo-600"
                        />
                        <span className="font-medium text-gray-900">{c.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60"
                >
                  {publishing ? 'Đang đăng...' : 'Đăng lên cộng đồng'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
