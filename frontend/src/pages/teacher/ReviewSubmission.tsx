import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
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
      content: string
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

interface ParsedContent {
  text: string
  questions: Array<{ id: string; text: string; options?: string[]; maxMark?: number }>
  imageUrl?: string | null
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
  const [communityOpen, setCommunityOpen] = useState(false)
  const communityDropdownRef = useRef<HTMLDivElement | null>(null)

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (communityDropdownRef.current && !communityDropdownRef.current.contains(target)) {
        setCommunityOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const parseContent = (raw: string): ParsedContent => {
    try {
      const parsed = JSON.parse(raw)
      return {
        text: parsed.text || raw,
        questions: Array.isArray(parsed.questions) ? parsed.questions : [],
        imageUrl: parsed.imageUrl || null,
      }
    } catch {
      return { text: raw, questions: [], imageUrl: null }
    }
  }

  const parsedContent = useMemo<ParsedContent | null>(() => {
    if (!submission) return null
    return parseContent(submission.assignment.libraryItem.content)
  }, [submission])

  const readingQuestions = parsedContent?.questions ?? []

  const studentAnswers: Record<string, number | string> = (() => {
    if (!submission?.readingAnswersJson) return {}
    try {
      const parsed = JSON.parse(submission.readingAnswersJson)
      if (Array.isArray(parsed)) {
        return parsed.reduce<Record<string, number | string>>((acc, value, index) => {
          acc[String(index)] = value
          return acc
        }, {})
      }
      return parsed as Record<string, number | string>
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

  const contentView = (
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
          className={`mx-auto rounded-[36px] bg-white p-2 ${embedded ? 'w-full' : 'max-w-4xl'}`}
        >
          <div
            className="rounded-[30px] border-2 border-transparent bg-[#f3fffb]"
            style={{
              background:
                'linear-gradient(#f3fffb, #f3fffb) padding-box, linear-gradient(90deg, #3f72be 0%, #8de8a1 100%) border-box',
            }}
          >
          <div className="max-h-[70vh] overflow-y-auto p-6 sm:p-8">
            <h1 className="mb-5 text-3xl font-black text-[#1f3f8f] sm:text-4xl">{submission.student.name}</h1>

          {submission.assignment.type === 'READING' ? (
            <div className="mb-7 space-y-5 text-[#1f3f8f]">
              {readingQuestions.length > 0 ? (
                readingQuestions.map((q, idx) => (
                  <div key={idx} className="text-base font-semibold leading-relaxed sm:text-lg">
                    <p className="font-bold">
                      Câu {idx + 1}: {q.text} {q.options?.length ? '(câu trắc nghiệm)' : '(câu tự luận ngắn)'}
                    </p>
                    <p className="pl-4 sm:pl-8">
                      {'=> '}Đáp án của học sinh
                      {(() => {
                        const answer = studentAnswers[q.id]
                        if (answer === undefined || answer === null) return ': (chưa trả lời)'
                        if (typeof answer === 'number' && q.options?.length) return `: ${q.options[answer] ?? '(chưa trả lời)'}`
                        return `: ${String(answer)}`
                      })()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-base font-semibold sm:text-lg">
                  Không có câu hỏi từ bài tập để hiển thị. Vui lòng kiểm tra dữ liệu bài tập (readingQuestionsJson).
                </p>
              )}
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
                <div ref={communityDropdownRef} className="relative w-full max-w-[320px]">
                  <button
                    type="button"
                    onClick={() => setCommunityOpen((v) => !v)}
                    className={`flex h-10 w-full items-center justify-between border-2 border-[#6f8ed6] bg-[#c8e4e6] pl-6 pr-4 text-left text-lg font-semibold text-[#1f3f8f] ${communityOpen ? 'rounded-t-[18px] rounded-b-none border-b-0' : 'rounded-full'}`}
                  >
                    <span>{communities.find((c) => c.key === selectedCommunity)?.name}</span>
                    <ChevronDown className={`h-6 w-6 text-[#1f3f8f] transition-transform ${communityOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {communityOpen && (
                    <div className="absolute left-0 right-0 top-10 z-20 overflow-hidden rounded-b-[14px] border-2 border-t-0 border-[#6f8ed6] bg-[#b8dadd]">
                      {communities.map((c) => (
                        <button
                          key={c.key}
                          type="button"
                          onClick={() => {
                            setSelectedCommunity(c.key)
                            setCommunityOpen(false)
                          }}
                          className={`block w-full px-6 py-1.5 text-left text-lg leading-none ${selectedCommunity === c.key ? 'bg-[#25a3b1] text-[#163f8f]' : 'text-[#1f3f8f] hover:bg-[#9dcfd4]'}`}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
        </div>
      </div>
  )

  if (embedded) {
    return (
      <div>
        {contentView}
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#efeff1] px-4 py-8 sm:px-6">
      {contentView}
    </div>
  )
}





