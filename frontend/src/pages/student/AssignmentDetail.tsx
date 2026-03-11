import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import StudentTopNavBar from '../../components/student/Layout/StudentTopNavBar'
import FullscreenModalShell from '../../components/thu-vien-xanh/FullscreenModalShell'
import LoadingSpinner from '../../components/student/Common/LoadingSpinner'
import api from '../../api/axios'

const thuVienXanhBackground = new URL('../../img/1x/hinh-nen.png', import.meta.url).href

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

  const dirty = useMemo(() => {
    if (!canEdit) return false
    if (assignment?.type === 'READING') {
      return Object.keys(answers).some((k) => answers[k]?.trim())
    }
    return !!uploadedFileId
  }, [assignment, answers, uploadedFileId, canEdit])

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
      <div
        className="min-h-screen bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${thuVienXanhBackground})` }}
      >
        <StudentTopNavBar />
        <div className="mx-auto max-w-3xl p-6">
          <div className="rounded-2xl border border-cyan-200 bg-white p-6 text-slate-700 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    )
  }

  if (error || !assignment || !content) {
    return (
      <div
        className="min-h-screen bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${thuVienXanhBackground})` }}
      >
        <StudentTopNavBar />
        <div className="mx-auto max-w-3xl p-6">
          <div className="rounded-2xl border border-cyan-200 bg-white p-6 text-red-600">
            {error || 'Không tìm thấy bài tập'}
          </div>
          <button
            onClick={() => navigate(`/hoc-sinh/lop-hoc/${classId}`)}
            className="mt-4 font-bold text-[#1f3f8f] hover:underline"
          >
            ← Quay lại
          </button>
        </div>
      </div>
    )
  }

  const leftPanel = (
    <div>
      <p className="font-bold text-blue-900 text-center">Ngữ liệu</p>
      <div className="mt-3 whitespace-pre-wrap text-slate-700 leading-relaxed">{content.text}</div>
      <div className="mt-5 h-48 rounded-2xl border border-dashed border-cyan-300 bg-[#1f3f8f]/80 flex items-center justify-center text-white">
        {content.imageUrl ? (
          <img src={content.imageUrl} alt="Ngữ liệu" className="w-full h-full rounded-2xl object-cover" />
        ) : (
          <span>Ảnh</span>
        )}
      </div>
    </div>
  )

  const rightPanel = (
    <div className="space-y-5 pr-5">
      {isReviewed && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-emerald-800 font-bold">
          ✓ Bài làm đã được chấm
          {existingSub?.review?.comment && (
            <p className="mt-1 text-sm font-normal">{existingSub.review.comment}</p>
          )}
        </div>
      )}

      {isSubmitted && !isReviewed && (
        <div className="rounded-2xl border border-sky-300 bg-sky-50 px-4 py-3 text-sky-800 font-bold">
          Đã nộp bài • Đang chờ chấm
        </div>
      )}

      {assignment.type === 'READING' && (
        <section>
          <h4 className="font-extrabold text-blue-900">Câu hỏi</h4>
          <div className="mt-3 space-y-4">
            {content.questions.map((question, idx) => (
              <article key={question.id} className="rounded-2xl bg-white p-4 border border-cyan-200">
                <p className="font-semibold text-slate-800">
                  Câu {idx + 1}: {question.text}
                  {question.maxMark && (
                    <span className="ml-2 text-sm font-normal text-gray-500">({question.maxMark} điểm)</span>
                  )}
                </p>
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                  disabled={!canEdit}
                  rows={4}
                  placeholder="Nhập câu trả lời của bạn..."
                  className="mt-3 w-full rounded-2xl border border-cyan-200 bg-white px-4 py-3 resize-none outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:text-gray-600"
                />
              </article>
            ))}
          </div>
          {canEdit && (
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => handleSubmit('DRAFT')}
                disabled={submitting}
                className="rounded-full bg-slate-400 hover:bg-slate-500 disabled:opacity-50 px-6 py-3 text-sm font-bold uppercase text-white"
              >
                Lưu nháp
              </button>
              <button
                onClick={() => handleSubmit('SUBMITTED')}
                disabled={submitting}
                className="rounded-full bg-teal-700 hover:bg-teal-800 disabled:opacity-50 px-8 py-3 font-extrabold text-white"
              >
                {submitting ? 'Đang nộp...' : 'NỘP BÀI'}
              </button>
            </div>
          )}
        </section>
      )}

      {assignment.type === 'INTEGRATION' && (
        <section className="space-y-5">
          <div>
            <p className="font-bold text-blue-900">Đề bài:</p>
            <div className="mt-2 whitespace-pre-wrap text-slate-700 leading-relaxed">
              {content.questions[0]?.text || content.text}
            </div>
          </div>

          {canEdit && (
            <div>
              <label className="block font-semibold text-slate-800 mb-2">Tải file bài làm</label>
              {uploadedFileUrl ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3">
                    <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-bold text-emerald-700">✓ {uploadedFileName || 'Đã tải lên file'}</span>
                  </div>
                  <label className="inline-block cursor-pointer rounded-full bg-teal-700 hover:bg-teal-800 px-5 py-2 font-bold text-white">
                    Thay đổi file
                    <input
                      type="file"
                      accept=".doc,.docx,.png,.jpg,.jpeg,.mp4"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-48 rounded-2xl border border-dashed cursor-pointer border-cyan-300 bg-white/80 text-slate-600 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                      <svg className="w-8 h-8 mb-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h3a3 3 0 0 0 0-6h-.025a5.56 5.56 0 0 0 .025-.5A5.5 5.5 0 0 0 7.207 9.021C7.137 9.017 7.071 9 7 9a4 4 0 1 0 0 8h2.167M12 19v-9m0 0-2 2m2-2 2 2" />
                      </svg>
                      <p className="mb-2 text-sm">
                        <span className="font-semibold">{uploading ? 'Đang tải...' : 'Click để tải file'}</span>
                        {!uploading && ' hoặc kéo thả vào đây'}
                      </p>
                      <p className="text-xs">Định dạng: doc, png, jpeg, mp4</p>
                    </div>
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
            </div>
          )}

          {!canEdit && uploadedFileName && (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3">
              <span className="font-bold text-emerald-700">✓ {uploadedFileName}</span>
            </div>
          )}

          {canEdit && (
            <div className="flex justify-end">
              <button
                onClick={() => handleSubmit('SUBMITTED')}
                disabled={submitting}
                className="rounded-full bg-teal-700 hover:bg-teal-800 disabled:opacity-50 px-8 py-3 font-extrabold text-white"
              >
                {submitting ? 'Đang nộp...' : 'NỘP BÀI'}
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  )

  return (
    <div
      className="min-h-screen bg-center bg-cover bg-no-repeat"
      style={{ backgroundImage: `url(${thuVienXanhBackground})` }}
    >
      <StudentTopNavBar />
      <FullscreenModalShell
        titleLeft={assignment.libraryItem.title}
        titleRight={assignment.type === 'READING' ? 'ĐỌC HIỂU' : 'TÍCH HỢP'}
        dirty={dirty}
        onClose={() => navigate(`/hoc-sinh/lop-hoc/${classId}`)}
        leftPanel={leftPanel}
        rightPanel={rightPanel}
      />
    </div>
  )
}
