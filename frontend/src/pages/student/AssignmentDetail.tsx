import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import StudentTopNavBar from '../../components/student/Layout/StudentTopNavBar'
import LoadingSpinner from '../../components/student/Common/LoadingSpinner'
import api from '../../api/axios'

interface ParsedContent {
  text: string
  questions: Array<{ id: string; text: string; maxMark?: number }>
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
            } catch { /* ignore parse errors */ }
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
        navigate(`/hoc-sinh/class/${classId}`)
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
      <div className="min-h-screen bg-[#e0f5f5]">
        <StudentTopNavBar />
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (error || !assignment || !content) {
    return (
      <div className="min-h-screen bg-[#e0f5f5]">
        <StudentTopNavBar />
        <div className="mx-auto max-w-2xl px-6 py-12">
          <div className="rounded-2xl border-2 border-red-300 bg-red-50 px-5 py-4">
            <p className="font-bold text-red-700">{error || 'Không tìm thấy bài tập'}</p>
          </div>
          <button
            onClick={() => navigate(`/hoc-sinh/class/${classId}`)}
            className="mt-4 font-bold text-[#1f3f8f] hover:underline"
          >
            ← Quay lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#e0f5f5]">
      {/* Header */}
      <StudentTopNavBar />

      {/* Sub-header: Back arrow + Title + Type label */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/hoc-sinh/class/${classId}`)}
            className="text-[#1f3f8f] transition-transform hover:scale-110"
            title="Quay lại"
          >
            <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 7l-5 5 5 5V7z" />
              <rect x="4" y="4" width="2" height="16" rx="1" />
            </svg>
          </button>
          <h1 className="text-2xl font-black text-[#1f3f8f]">
            {assignment.libraryItem.title}
          </h1>
        </div>
        <h2 className="text-2xl font-black uppercase text-[#1f3f8f]">
          {assignment.type === 'READING' ? 'Đọc hiểu' : 'Tích hợp'}
        </h2>
      </div>

      {/* Main Content - Two Panel Layout */}
      <div className="flex flex-1 gap-0 overflow-hidden px-4 pb-4">
        {/* LEFT PANEL - Ngữ liệu (Material) */}
        <div className="relative flex w-1/2 flex-col overflow-y-auto rounded-l-2xl bg-[#dff5f5] p-6">
          {/* Decorative circle */}
          <div className="absolute right-0 top-1/4 h-5 w-5 translate-x-1/2 rounded-full bg-[#3bbfb2]" />

          {/* Exit without saving button */}
          <button
            onClick={() => {
              if (window.confirm('Bạn có chắc muốn thoát? Dữ liệu chưa lưu sẽ bị mất.')) {
                navigate(`/hoc-sinh/class/${classId}`)
              }
            }}
            className="mb-6 self-start rounded-lg bg-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 shadow transition-colors hover:bg-gray-400"
          >
            Thoát mà chưa lưu
          </button>

          {/* Ngữ liệu heading */}
          <div className="flex flex-1 flex-col items-center justify-center">
            <h3 className="mb-6 text-center text-2xl font-bold text-[#1f3f8f]">Ngữ liệu</h3>

            {/* Reading text content */}
            <div className="mb-6 w-full rounded-xl bg-white/70 p-5 text-base leading-relaxed text-gray-800">
              {content.text}
            </div>

            {/* Image area */}
            {content.imageUrl ? (
              <div className="w-full overflow-hidden rounded-xl">
                <img
                  src={content.imageUrl}
                  alt="Ngữ liệu"
                  className="h-auto w-full rounded-xl object-cover"
                />
              </div>
            ) : (
              <div className="flex h-48 w-full items-center justify-center rounded-xl bg-[#1a2a5e] text-lg font-semibold text-white/80">
                Ảnh
              </div>
            )}
          </div>
        </div>

        {/* Divider with circle */}
        <div className="relative w-1 bg-[#3bbfb2]">
          <div className="absolute bottom-8 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full bg-[#3bbfb2]" />
        </div>

        {/* RIGHT PANEL - Đề bài / Submission */}
        <div className="relative flex w-1/2 flex-col overflow-y-auto rounded-r-2xl bg-[#dff5f5] p-6">
          {/* Decorative circle */}
          <div className="absolute right-4 top-1/4 h-5 w-5 rounded-full bg-[#3bbfb2]" />

          {/* READING type: Show questions */}
          {assignment.type === 'READING' && content.questions.length > 0 && (
            <div className="space-y-5">
              {content.questions.map((question, idx) => (
                <div key={question.id} className="space-y-2">
                  <p className="text-lg font-bold text-[#1f3f8f]">
                    Câu {idx + 1}: {question.text}
                    {question.maxMark && (
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        ({question.maxMark} điểm)
                      </span>
                    )}
                  </p>
                  <textarea
                    value={answers[question.id] || ''}
                    onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                    disabled={!canEdit}
                    rows={4}
                    placeholder="Nhập câu trả lời của bạn..."
                    className="w-full rounded-lg border-2 border-gray-300 bg-white p-4 text-base disabled:bg-gray-100 disabled:text-gray-600 focus:border-[#3bbfb2] focus:outline-none"
                  />
                </div>
              ))}
            </div>
          )}

          {/* INTEGRATION type: Show question + file upload */}
          {assignment.type === 'INTEGRATION' && (
            <div className="flex flex-1 flex-col items-center justify-center space-y-6">
              {/* Đề bài */}
              <p className="text-xl font-bold text-[#1f3f8f]">
                Đề bài: {content.questions[0]?.text || content.text}
              </p>

              {/* File upload area */}
              {uploadedFileUrl ? (
                <div className="space-y-3 text-center">
                  <div className="flex items-center justify-center gap-2 rounded-lg bg-green-50 px-4 py-3">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-bold text-green-700">✓ {uploadedFileName || 'Đã tải lên file'}</span>
                  </div>
                  {canEdit && (
                    <label className="inline-block cursor-pointer rounded-full bg-[#1f849a] px-5 py-2 font-bold text-white transition-all hover:bg-[#15607a]">
                      Thay đổi file
                      <input
                        type="file"
                        accept=".doc,.docx,.png,.jpg,.jpeg,.mp4"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              ) : (
                <div className="text-center">
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
                  <p className="mt-3 rounded-lg bg-gray-200 px-4 py-1 text-sm text-gray-600">
                    doc, png, jpeg, mp4
                  </p>
                </div>
              )}

              {/* Submit button */}
              {canEdit && (
                <button
                  onClick={() => handleSubmit('SUBMITTED')}
                  disabled={submitting}
                  className="mt-auto self-end rounded-full bg-[#1a2a5e] px-10 py-3 text-lg font-black uppercase text-white shadow-lg transition-all hover:bg-[#0f1d45] disabled:opacity-50"
                >
                  {submitting ? 'Đang nộp...' : 'Nộp bài'}
                </button>
              )}
            </div>
          )}

          {/* READING Submit button */}
          {assignment.type === 'READING' && canEdit && (
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => handleSubmit('DRAFT')}
                disabled={submitting}
                className="rounded-full bg-gray-400 px-6 py-3 text-sm font-bold uppercase text-white shadow transition-all hover:bg-gray-500 disabled:opacity-50"
              >
                Lưu nháp
              </button>
              <button
                onClick={() => handleSubmit('SUBMITTED')}
                disabled={submitting}
                className="rounded-full bg-[#1a2a5e] px-10 py-3 text-lg font-black uppercase text-white shadow-lg transition-all hover:bg-[#0f1d45] disabled:opacity-50"
              >
                {submitting ? 'Đang nộp...' : 'Nộp bài'}
              </button>
            </div>
          )}

          {/* Reviewed status */}
          {isReviewed && (
            <div className="mt-6 rounded-xl border-2 border-green-300 bg-green-50 p-4 text-center">
              <p className="font-bold text-green-700">
                ✓ Bài làm đã được chấm
              </p>
              {existingSub?.review?.comment && (
                <p className="mt-2 text-gray-700">{existingSub.review.comment}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
