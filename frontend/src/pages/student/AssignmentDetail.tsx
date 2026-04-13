import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import LoadingSpinner from '../../components/student/Common/LoadingSpinner'
import FullscreenModalShell from '../../components/thu-vien-xanh/FullscreenModalShell'
import api from '../../api/axios'
import { renderSimpleMarkdown } from '../../utils/simpleMarkdown'

const bachTuocImage = new URL('../../img/1x/bach-tuoc.png', import.meta.url).href

interface ParsedContent {
  text: string
  questions: Array<{
    id: string
    text: string
    type?: string
    options?: string[]
    correctAnswer?: string | null
    maxMark?: number
  }>
  integrationPrompt?: string
  imageUrl?: string | null
}

interface AssignmentData {
  id: string
  type: 'READING' | 'INTEGRATION'
  mode: string
  classId: string
  libraryItem: {
    id: string
    title: string
    content: string
  }
  submissions: Array<{
    id: string
    status: string
    readingAnswersJson?: string | null
    integrationFileId?: string | null
    integrationFile?: { id: string; url: string; filename: string } | null
    review?: { comment?: string; resultStatus: string; perQuestionMarksJson?: string } | null
  }>
}

interface BachTuocAnchor {
  id: string
  label: string
  leftPercent: number
  topPercent: number
  targetId: string
  kind: 'word' | 'note'
}

const hasAnsweredQuestion = (value: unknown): boolean => {
  if (typeof value === 'string') return value.trim().length > 0
  if (typeof value === 'number') return Number.isFinite(value)
  return false
}

const QUESTION_PREFIX_REGEX = /^\s*câu\s*\d+\s*[:.)-]\s*/i

function formatQuestionLabel(questionText: string, index: number): string {
  const text = questionText.trim()
  return QUESTION_PREFIX_REGEX.test(text) ? text : `Câu ${index + 1}: ${text}`
}

type ShortAnswerMeta = {
  questionText: string
  suggestedAnswer?: string
  hint?: string
}

function parseShortAnswerMeta(rawQuestion: string): ShortAnswerMeta {
  const markerRegex = /(Đáp án gợi ý|Gợi ý)\s*:\s*/gi
  const matches = Array.from(rawQuestion.matchAll(markerRegex))

  if (matches.length === 0) {
    return { questionText: rawQuestion.trim() }
  }

  const firstMarkerIndex = matches[0].index ?? rawQuestion.length
  const questionText = rawQuestion.slice(0, firstMarkerIndex).trim()
  let suggestedAnswer: string | undefined
  let hint: string | undefined

  matches.forEach((match, index) => {
    const label = (match[1] || '').trim().toLowerCase()
    const start = (match.index ?? 0) + match[0].length
    const end = matches[index + 1]?.index ?? rawQuestion.length
    const value = rawQuestion.slice(start, end).trim()
    if (!value) return

    if (label.includes('đáp án gợi ý')) {
      suggestedAnswer = value
      return
    }
    if (label.includes('gợi ý')) {
      hint = value
    }
  })

  return {
    questionText: questionText || rawQuestion.trim(),
    suggestedAnswer,
    hint,
  }
}

function parseContent(raw: string): ParsedContent {
  try {
    const parsed = JSON.parse(raw)
    return {
      text: parsed.text || raw,
      questions: Array.isArray(parsed.questions) ? parsed.questions : [],
      integrationPrompt: typeof parsed.integrationPrompt === 'string' ? parsed.integrationPrompt : undefined,
      imageUrl: parsed.imageUrl || null,
    }
  } catch {
    return { text: raw, questions: [], imageUrl: null }
  }
}

export default function AssignmentDetail() {
  const { classId, assignmentId } = useParams<{ classId: string; assignmentId: string }>()
  const navigate = useNavigate()
  const [assignment, setAssignment] = useState<AssignmentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Reading assignment state
  const [answers, setAnswers] = useState<Record<string, string | number>>({})

  // Integration assignment state
  const [uploadedFileId, setUploadedFileId] = useState('')
  const [uploadedFileUrl, setUploadedFileUrl] = useState('')
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [fileChanged, setFileChanged] = useState(false)
  const bachTuocAnchorRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!assignmentId) return

      setLoading(true)
      try {
        const res = await api.get(`/assignments/${assignmentId}`)
        const data: AssignmentData = res.data.data
        setAssignment(data)

        // Load existing submission if available
        const existingSub = data.submissions?.[0]
        if (existingSub) {
          if (existingSub.readingAnswersJson) {
            try {
              setAnswers(JSON.parse(existingSub.readingAnswersJson))
            } catch (e) {
              console.warn('Failed to parse readingAnswersJson:', e)
            }
          }
          if (existingSub.integrationFile) {
            setUploadedFileId(existingSub.integrationFile.id)
            setUploadedFileUrl(existingSub.integrationFile.url)
            setUploadedFileName(existingSub.integrationFile.filename)
          } else if (existingSub.integrationFileId) {
            setUploadedFileId(existingSub.integrationFileId)
          }
        }
      } catch {
        setError('Không thể tải thông tin bài tập.')
      } finally {
        setLoading(false)
      }
    }
    fetchAssignment()
  }, [assignmentId])

  const content = useMemo<ParsedContent | null>(() => {
    if (!assignment) return null
    return parseContent(assignment.libraryItem.content)
  }, [assignment])

  const existingSub = assignment?.submissions?.[0]
  const isApproved = existingSub?.status === 'APPROVED'
  const isRejected = existingSub?.status === 'REJECTED'
  const isSubmitted = existingSub?.status === 'SUBMITTED' || isApproved
  const isReviewed = isApproved || isRejected
  const canEdit = assignment?.type === 'INTEGRATION' ? !isApproved : !isSubmitted
  const dirty = canEdit && (assignment?.type === 'READING'
    ? Object.values(answers).some((value) => hasAnsweredQuestion(value))
    : fileChanged)

  const mcQuestions = useMemo(() => {
    if (!content) return []
    return content.questions.filter((q) => q.options?.length || q.type === 'multiple-choice')
  }, [content])

  const score = useMemo(() => {
    if (!content) return null
    if (mcQuestions.length === 0) return 0
    let correctCount = 0
    mcQuestions.forEach((q) => {
      if (!q.correctAnswer) return
      if (answers[q.id] === q.correctAnswer) correctCount += 1
    })
    return Math.round((correctCount / mcQuestions.length) * 100)
  }, [content, mcQuestions, answers])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post('/files/upload', formData)
      const uploadedFile = res.data.data
      setUploadedFileId(uploadedFile.id)
      setUploadedFileUrl(uploadedFile.url)
      setUploadedFileName(uploadedFile.filename)
      setFileChanged(true)
    } catch {
      alert('Không thể tải file lên. Vui lòng thử lại.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (status: 'DRAFT' | 'SUBMITTED' = 'SUBMITTED') => {
    if (!assignment || !assignmentId) return

    if (status === 'SUBMITTED') {
      if (assignment.type === 'READING' && content) {
        const allAnswered = content.questions.every((q) => hasAnsweredQuestion(answers[q.id]))
        if (!allAnswered) {
          alert('Vui lòng trả lời tất cả các câu hỏi.')
          return
        }
      } else if (assignment.type === 'INTEGRATION') {
        if (!uploadedFileId) {
          alert('Vui lòng tải lên file sản phẩm.')
          return
        }
      }
    }

    setSubmitting(true)
    try {
      const payload: Record<string, string> = { status }
      if (assignment.type === 'READING') {
        payload.readingAnswersJson = JSON.stringify(answers)
      } else {
        payload.integrationFileId = uploadedFileId
      }

      await api.post(`/assignments/${assignmentId}/submissions`, payload)
      setFileChanged(false)
      if (status === 'SUBMITTED') {
        alert('✓ Nộp bài thành công!')
        navigate(`/hoc-sinh/lop-hoc/${classId}`)
      } else {
        alert('✓ Đã lưu bản nháp!')
      }
    } catch (err: any) {
      const apiError = err?.response?.data?.error
      const fallbackMessage = 'Không thể nộp bài. Vui lòng thử lại.'
      const message =
        typeof apiError === 'string'
          ? apiError
          : typeof err?.response?.data?.message === 'string'
            ? err.response.data.message
            : typeof err?.message === 'string' && err.message.trim().length > 0
              ? err.message
              : fallbackMessage
      alert(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !assignment || !content) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="rounded-2xl border-2 border-red-300 bg-red-50 px-5 py-4">
          <p className="font-bold text-red-700">{error || 'Không tìm thấy bài tập'}</p>
        </div>
        <button
          onClick={() => navigate(`/hoc-sinh/lop-hoc/${classId}`)}
          className="mt-4 font-bold text-[#1f3f8f] hover:underline"
        >
          ← Quay lại
        </button>
      </div>
    )
  }

  const isBachTuoc = assignment.libraryItem.title.toLowerCase().includes('bạch tuộc')
  const fullPageImageUrl = isBachTuoc ? bachTuocImage : null
  const showBachTuocAnchors = Boolean(fullPageImageUrl)

  const bachTuocAnchors: BachTuocAnchor[] = showBachTuocAnchors
    ? [
      { id: 'word-1', label: '(1)', leftPercent: 71.5, topPercent: 27, targetId: 'note-1', kind: 'word' },
      { id: 'word-2', label: '(2)', leftPercent: 62.5, topPercent: 34, targetId: 'note-2', kind: 'word' },
      { id: 'word-3', label: '(3)', leftPercent: 73.9, topPercent: 74, targetId: 'note-3', kind: 'word' },
      { id: 'note-1', label: '(1)', leftPercent: 6.6, topPercent: 94.7, targetId: 'word-1', kind: 'note' },
      { id: 'note-2', label: '(2)', leftPercent: 6.6, topPercent: 95.3, targetId: 'word-2', kind: 'note' },
      { id: 'note-3', label: '(3)', leftPercent: 6.6, topPercent: 95.9, targetId: 'word-3', kind: 'note' },
    ]
    : []

  const scrollToBachTuocAnchor = (anchorId: string) => {
    const target = bachTuocAnchorRefs.current[anchorId]
    if (!target) return
    target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
  }

  const leftPanel = (
    <div>
      <p className="text-center font-bold text-blue-900">Ngữ liệu</p>
      {fullPageImageUrl ? (
        <div className="relative mt-3 rounded-2xl border border-cyan-200 bg-white p-2">
          <img
            src={fullPageImageUrl}
            alt={`${assignment.libraryItem.title} - toàn văn`}
            className="w-full h-auto rounded-xl"
          />
          {bachTuocAnchors.map((anchor) => (
            <button
              key={anchor.id}
              ref={(node) => {
                bachTuocAnchorRefs.current[anchor.id] = node
              }}
              type="button"
              aria-label={anchor.kind === 'word' ? `Từ đánh số ${anchor.label}` : `Chú thích ${anchor.label}`}
              onClick={() => scrollToBachTuocAnchor(anchor.targetId)}
              className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-md border text-[11px] font-bold transition-all ${
                anchor.kind === 'word'
                  ? anchor.id === 'word-2'
                    ? 'px-8 py-1 min-w-[44px]'
                    : anchor.id === 'word-3'
                      ? 'px-4 py-1 min-w-[34px]'
                      : 'px-2.5 py-1'
                  : 'px-2 py-0.5'
              } border-transparent bg-transparent text-transparent hover:border-transparent hover:bg-transparent`}
              style={{
                left: `${anchor.leftPercent}%`,
                top: `${anchor.topPercent}%`,
              }}
            >
              {anchor.label}
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="mt-3 whitespace-pre-wrap text-slate-700 leading-relaxed">
            {renderSimpleMarkdown(content.text)}
          </div>
          <div className="mt-5 h-48 rounded-2xl border border-dashed border-cyan-300 bg-[#1f3f8f]/80 flex items-center justify-center text-white overflow-hidden">
            {content.imageUrl ? (
              <img src={content.imageUrl} alt={assignment.libraryItem.title} className="h-full w-full object-cover" />
            ) : (
              <span>Ảnh</span>
            )}
          </div>
        </>
      )}
    </div>
  )

  const readingPanel = (
    <div className="space-y-5 pr-5">
      <p className="text-center font-bold text-blue-900">Đề bài</p>
      {isSubmitted && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-emerald-800 font-bold">
          Đã nộp bài • Điểm: {score ?? 0}/100
        </div>
      )}
      {content.questions.length === 0 ? (
        <article className="rounded-2xl bg-white p-4 border border-cyan-200">
          <p className="font-semibold text-slate-800">Bài tập chưa có câu hỏi đọc hiểu.</p>
        </article>
      ) : (
        content.questions.map((question, idx) => {
          const isMultipleChoice = Boolean(question.options?.length || question.type === 'multiple-choice')
          const shortAnswerMeta = isMultipleChoice ? null : parseShortAnswerMeta(question.text)
          const questionText = shortAnswerMeta?.questionText ?? question.text

          return (
            <article key={question.id} className="rounded-2xl bg-white p-4 border border-cyan-200">
              <p className="font-semibold text-slate-800 text-lg">
                {formatQuestionLabel(questionText, idx)}
                {question.maxMark && (
                  <span className="ml-2 text-sm font-normal text-slate-500">({question.maxMark} điểm)</span>
                )}
              </p>
              {isMultipleChoice ? (
              <>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {(question.options || []).map((option) => {
                    const selected = answers[question.id] === option
                    const correctAnswer = question.correctAnswer ?? null
                    const showResult = !canEdit && !!correctAnswer
                    const isCorrectOption = showResult && option === correctAnswer
                    const isWrongSelected = showResult && selected && option !== correctAnswer
                    return (
                      <button
                        key={`${question.id}-${option}`}
                        type="button"
                        disabled={!canEdit}
                        onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: option }))}
                        className={`rounded-xl border px-3 py-2 text-left font-medium transition ${
                          showResult
                            ? isCorrectOption
                              ? 'border-emerald-500 bg-emerald-100 text-emerald-900'
                              : isWrongSelected
                                ? 'border-red-500 bg-red-100 text-red-900'
                                : 'border-cyan-200 bg-white text-slate-700'
                            : selected
                              ? 'border-teal-600 bg-teal-50 text-teal-800'
                              : 'border-cyan-200 bg-white text-slate-700 hover:bg-cyan-50'
                        } ${!canEdit ? 'cursor-not-allowed opacity-70' : ''}`}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
                {!canEdit && question.correctAnswer && (
                  <p className={`mt-2 text-sm font-semibold ${answers[question.id] === question.correctAnswer ? 'text-emerald-700' : 'text-red-600'}`}>
                    {answers[question.id] === question.correctAnswer ? '✓ Đúng' : '✕ Sai'} • Đáp án đúng: {question.correctAnswer}
                  </p>
                )}
              </>
            ) : (
              <>
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))}
                  disabled={!canEdit}
                  rows={4}
                  placeholder="Nhập câu trả lời của bạn..."
                  className="mt-3 h-32 w-full resize-none rounded-xl border border-cyan-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-100 disabled:text-slate-500"
                />
                {!canEdit && shortAnswerMeta && (shortAnswerMeta.suggestedAnswer || shortAnswerMeta.hint) && (
                  <div className="mt-2 space-y-1 text-sm font-semibold text-red-600">
                    {shortAnswerMeta.suggestedAnswer && <p>Đáp án gợi ý: {shortAnswerMeta.suggestedAnswer}</p>}
                    {shortAnswerMeta.hint && <p>Gợi ý: {shortAnswerMeta.hint}</p>}
                  </div>
                )}
              </>
            )}
            </article>
          )
        })
      )}

      {isReviewed && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-emerald-800">
          <p className="font-bold">Đã chấm bài</p>
          {existingSub?.review?.comment && (
            <p className="mt-1 text-sm text-slate-700">{existingSub.review.comment}</p>
          )}
        </div>
      )}

      {canEdit && (
        <div className="flex justify-end">
          <button
            onClick={() => handleSubmit('SUBMITTED')}
            disabled={submitting}
            className="rounded-full px-8 py-3 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-400 text-white font-extrabold"
          >
            {submitting ? 'ĐANG NỘP...' : 'NỘP BÀI'}
          </button>
        </div>
      )}
    </div>
  )

  const integrationPrompt = content.integrationPrompt || content.text

  const integrationPanel = (
    <div className="space-y-5 pr-5">
      <section>
        <p className="font-bold text-blue-900">Đề bài:</p>
        <div className="mt-2 text-slate-700 leading-relaxed font-semibold">
          {renderSimpleMarkdown(integrationPrompt)}
        </div>
      </section>

      <section>
        {uploadedFileUrl ? (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3">
            <p className="font-semibold text-emerald-800">✓ Đã tải lên: {uploadedFileName || 'Tệp đính kèm'}</p>
            <a
              href={uploadedFileUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block text-sm font-semibold text-blue-700 hover:underline"
            >
              Mở tệp
            </a>
          </div>
        ) : (
          <div className="flex justify-center">
            <label className="inline-flex cursor-pointer flex-col items-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1f849a] text-3xl font-bold text-white shadow-lg transition-transform hover:scale-110">
                {uploading ? '...' : '+'}
              </span>
              <input
                type="file"
                accept=".doc,.docx,.png,.jpg,.jpeg,.mp4"
                onChange={handleFileUpload}
                disabled={!canEdit || uploading}
                className="hidden"
              />
            </label>
          </div>
        )}
        <p className="mt-2 text-center text-xs text-slate-500">doc, png, jpeg, mp4</p>

        {canEdit && uploadedFileUrl && (
          <div className="mt-3 text-center">
            <label className="inline-block cursor-pointer rounded-full bg-[#1f849a] px-5 py-2 font-bold text-white transition-all hover:bg-[#15607a]">
              {uploading ? 'Đang tải...' : 'Thay đổi file'}
              <input
                type="file"
                accept=".doc,.docx,.png,.jpg,.jpeg,.mp4"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        )}
      </section>

      {isReviewed && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-emerald-800">
          <p className="font-bold">Đã chấm bài</p>
          {existingSub?.review?.comment && (
            <p className="mt-1 text-sm text-slate-700">{existingSub.review.comment}</p>
          )}
        </div>
      )}

      {canEdit && (
        <div className="flex justify-end">
          <button
            onClick={() => handleSubmit('SUBMITTED')}
            disabled={submitting || !uploadedFileId}
            className="rounded-full px-8 py-3 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-400 text-white font-extrabold"
          >
            {submitting ? 'ĐANG NỘP...' : 'NỘP BÀI'}
          </button>
        </div>
      )}
    </div>
  )

  return (
    <FullscreenModalShell
      titleLeft={assignment.libraryItem.title}
      titleRight={assignment.type === 'READING' ? 'VĂN BẢN ĐỌC HIỂU' : 'TÍCH HỢP GIÁO DỤC PHÁT TRIỂN BỀN VỮNG'}
      dirty={dirty}
      onClose={() => navigate(`/hoc-sinh/lop-hoc/${classId}`)}
      leftPanel={leftPanel}
      rightPanel={assignment.type === 'READING' ? readingPanel : integrationPanel}
    />
  )
}
