import { FormEvent, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
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
  { key: 'su-gia-hoa-binh', name: 'Sứ giả hòa bình và hòa giải' },
  { key: 'none', name: 'Không duyệt' },
]

type ReviewSubmissionProps = {
  embedded?: boolean
  submissionId?: string
}

export default function ReviewSubmission({ embedded, submissionId: submissionIdProp }: ReviewSubmissionProps) {
  const { submissionId: submissionIdParam } = useParams<{ submissionId: string }>()
  const submissionId = submissionIdProp ?? submissionIdParam

  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [comment, setComment] = useState('')
  const [resultStatus, setResultStatus] = useState<'PASSED' | 'FAILED'>('PASSED')
  const [perQuestionMarks, setPerQuestionMarks] = useState<Record<number, boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState(false)

  const [selectedCommunity, setSelectedCommunity] = useState(communities[0].key)

  const fetchSubmission = async () => {
    try {
      if (!submissionId) {
        setError('Không tìm thấy bài nộp.')
        return
      }
      const res = await api.get(`/submissions/${submissionId}`)
      const data: Submission = res.data.data
      setSubmission(data)
      if (data.review) {
        setComment(data.review.comment ?? '')
        setResultStatus(data.review.resultStatus)
        if (data.review.perQuestionMarksJson) {
          try {
            setPerQuestionMarks(JSON.parse(data.review.perQuestionMarksJson))
          } catch {
            // noop
          }
        }
      }
    } catch {
      setError('Không thể tải bài nộp.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubmission()
  }, [submissionId])

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
        perQuestionMarksJson: Object.keys(perQuestionMarks).length > 0 ? JSON.stringify(perQuestionMarks) : undefined,
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


  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#1f3f8f]" />
      </div>
    )
  }

  if (error || !submission) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <p className="text-red-600">{error || 'Không tìm thấy bài nộp.'}</p>
      </div>
    )
  }

  const content = (
    <div className={embedded ? 'mx-auto w-full' : 'mx-auto max-w-6xl'}>
        {!embedded && (
          <nav className="mb-6 flex items-center gap-2 text-sm text-gray-600">
            <Link to="/giao-vien/trang-chu" className="hover:underline">Lớp học</Link>
            <span>/</span>
            <Link to={`/giao-vien/lop-hoc/${submission.assignment.class.id}`} className="hover:underline">
              {submission.assignment.class.name}
            </Link>
            <span>/</span>
            <span>Chấm bài</span>
          </nav>
        )}

        <div
          className={`mx-auto rounded-[32px] border-2 border-transparent bg-gradient-to-b from-white to-[#dff2ea] p-7 shadow-[0_0_0_2px_rgba(63,98,170,0.7)] sm:p-9 ${embedded ? 'w-full' : 'max-w-4xl'}`}
          style={{
            background:
              'linear-gradient(#ffffff, #dff2ea) padding-box, linear-gradient(90deg, #3f72be 0%, #8de8a1 100%) border-box',
          }}
        >
          <h1 className="mb-5 text-3xl font-black text-[#1f3f8f] sm:text-4xl">{submission.student.name}</h1>

          {submission.assignment.type === 'READING' ? (
            <div className="mb-7 space-y-5 text-[#1f3f8f]">
              {readingQuestions.map((q, idx) => (
                <div key={idx} className="text-base font-semibold leading-relaxed sm:text-lg">
                  <p>Câu {idx + 1}: {q.question}</p>
                  <p className="pl-4 sm:pl-8">
                    {'→ '}Đáp án của học sinh: {studentAnswers[idx] !== undefined ? q.options[studentAnswers[idx]] : '(chưa trả lời)'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setPerQuestionMarks((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                    className={`mt-2 rounded-full px-4 py-1 text-sm font-bold ${perQuestionMarks[idx] ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                  >
                    {perQuestionMarks[idx] ? '✓ Đúng' : '✗ Sai'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="mb-7 text-[#1f3f8f]">
              <p className="text-xl font-semibold sm:text-2xl">{submission.assignment.libraryItem.title}</p>
              <p className="mt-1 text-base sm:text-lg">{'→ '}File mà học sinh tải lên (Word / Hình ảnh / Video)</p>
              {submission.integrationFile && (
                <a
                  href={`http://localhost:3000${submission.integrationFile.url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex rounded-xl bg-[#cbeff2] px-4 py-2 text-base font-bold text-[#1f3f8f] sm:text-lg"
                >
                  Tải file: {submission.integrationFile.filename}
                </a>
              )}
            </div>
          )}

          {reviewError && <p className="mb-3 text-red-600">{reviewError}</p>}
          {reviewSuccess && <p className="mb-3 text-green-700">Đã lưu kết quả chấm.</p>}

          <form onSubmit={handleReview} className="space-y-4">
            {submission.assignment.type === 'INTEGRATION' && (
              <div className="grid gap-2 sm:grid-cols-[120px,1fr] sm:items-center">
                <label className="text-lg font-bold text-[#1f3f8f]">Duyệt:</label>
                <select
                  value={selectedCommunity}
                  onChange={(e) => setSelectedCommunity(e.target.value)}
                  className="h-11 w-full max-w-[300px] rounded-xl border-2 border-[#7da3df] bg-[#cbeff2] px-4 text-base font-semibold text-[#1f3f8f] sm:text-lg"
                >
                  {communities.map((c) => (
                    <option key={c.key} value={c.key}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Thêm nhận xét GV"
              className="w-full rounded-xl bg-[#cbeff2] px-5 py-3 text-base italic text-[#1f3f8f] placeholder:text-[#5f82ba] sm:text-lg"
            />

            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 rounded-xl bg-white p-3 text-base font-bold text-[#1f3f8f]">
                <input type="radio" checked={resultStatus === 'PASSED'} onChange={() => setResultStatus('PASSED')} />
                Đạt
              </label>
              <label className="flex items-center gap-2 rounded-xl bg-white p-3 text-base font-bold text-[#1f3f8f]">
                <input type="radio" checked={resultStatus === 'FAILED'} onChange={() => setResultStatus('FAILED')} />
                Chưa đạt
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="ml-auto block w-full max-w-[200px] rounded-[20px] border-2 border-[#1f3f8f] bg-gradient-to-b from-[#1f3f8f] to-[#149fb3] py-2.5 text-lg font-bold uppercase text-white disabled:opacity-60"
            >
              {submitting ? 'Đang lưu...' : 'Lưu kết quả'}
            </button>
          </form>

        </div>
      </div>
  )

  if (embedded) {
    return (
      <div className="bg-[#efeff1] px-0 py-0">
        {content}
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#efeff1] px-4 py-8 sm:px-6">
      {content}
    </div>
  )
}
