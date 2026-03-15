import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import LoadingSpinner from '../../components/student/Common/LoadingSpinner'
import FullscreenModalShell from '../../components/thu-vien-xanh/FullscreenModalShell'
import api from '../../api/axios'

interface ParsedContent {
  text: string
  questions: Array<{ id: string; text: string; maxMark?: number }>
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
  const [answers, setAnswers] = useState<Record<string, string>>({})

  // Integration assignment state
  const [uploadedFileId, setUploadedFileId] = useState('')
  const [uploadedFileUrl, setUploadedFileUrl] = useState('')
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [uploading, setUploading] = useState(false)

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
  const isSubmitted = existingSub?.status === 'SUBMITTED' || existingSub?.status === 'APPROVED'
  const isReviewed = existingSub?.status === 'APPROVED' || existingSub?.status === 'REJECTED'
  const canEdit = !isSubmitted && !isReviewed
  const dirty = canEdit && (assignment?.type === 'READING'
    ? Object.values(answers).some((value) => value.trim().length > 0)
    : Boolean(uploadedFileId))

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
        const allAnswered = content.questions.every((q) => answers[q.id]?.trim())
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
      if (status === 'SUBMITTED') {
        alert('✓ Nộp bài thành công!')
        navigate(`/hoc-sinh/lop-hoc/${classId}`)
      } else {
        alert('✓ Đã lưu bản nháp!')
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Không thể nộp bài. Vui lòng thử lại.')
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

  const leftPanel = (
    <div>
      <p className="text-center font-bold text-blue-900">Ngữ liệu</p>
      <div className="mt-3 whitespace-pre-wrap text-slate-700 leading-relaxed">
        {content.text}
      </div>
      <div className="mt-5 h-48 rounded-2xl border border-dashed border-cyan-300 bg-[#1f3f8f]/80 flex items-center justify-center text-white overflow-hidden">
        {content.imageUrl ? (
          <img src={content.imageUrl} alt={assignment.libraryItem.title} className="h-full w-full object-cover" />
        ) : (
          <span>Ảnh</span>
        )}
      </div>
    </div>
  )

  const readingPanel = (
    <div className="space-y-5 pr-5">
      {content.questions.length === 0 ? (
        <article className="rounded-2xl bg-white p-4 border border-cyan-200">
          <p className="font-semibold text-slate-800">Bài tập chưa có câu hỏi đọc hiểu.</p>
        </article>
      ) : (
        content.questions.map((question, idx) => (
          <article key={question.id} className="rounded-2xl bg-white p-4 border border-cyan-200">
            <p className="font-semibold text-slate-800 text-lg">
              Câu {idx + 1}: {question.text}
              {question.maxMark && (
                <span className="ml-2 text-sm font-normal text-slate-500">({question.maxMark} điểm)</span>
              )}
            </p>
            <textarea
              value={answers[question.id] || ''}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))}
              disabled={!canEdit}
              rows={4}
              placeholder="Nhập câu trả lời của bạn..."
              className="mt-3 h-32 w-full resize-none rounded-xl border border-cyan-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-100 disabled:text-slate-500"
            />
          </article>
        ))
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
        <div className="mt-2 whitespace-pre-wrap text-slate-700 leading-relaxed font-semibold">{integrationPrompt}</div>
      </section>

      <section>
        {uploadedFileUrl ? (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3">
            <p className="font-semibold text-emerald-800">✓ Đã tải lên: {uploadedFileName || 'Tệp đính kèm'}</p>
            <a
              href={`http://localhost:3000${uploadedFileUrl}`}
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
      titleRight={assignment.type === 'READING' ? 'ĐỌC HIỂU' : 'TÍCH HỢP'}
      dirty={dirty}
      onClose={() => navigate(`/hoc-sinh/lop-hoc/${classId}`)}
      leftPanel={leftPanel}
      rightPanel={assignment.type === 'READING' ? readingPanel : integrationPanel}
    />
  )
}
