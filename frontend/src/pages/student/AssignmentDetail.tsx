import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import StudentLayout from '../../components/student/Layout/StudentLayout'
import LoadingSpinner from '../../components/student/Common/LoadingSpinner'
import Badge from '../../components/student/Common/Badge'
import Button from '../../components/student/Common/Button'
import api from '../../api/axios'
import { Assignment } from '../../types/student'

export default function AssignmentDetail() {
  const { classId, assignmentId } = useParams<{ classId: string; assignmentId: string }>()
  const navigate = useNavigate()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  
  // Reading assignment state
  const [answers, setAnswers] = useState<Record<number, string>>({})
  
  // Integrated assignment state
  const [fileUrl, setFileUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!assignmentId) return
      
      setLoading(true)
      try {
        const res = await api.get(`/assignments/${assignmentId}`)
        const data = res.data.data
        setAssignment(data)
        
        // Load existing submission if available
        if (data.submission?.answers) {
          setAnswers(data.submission.answers)
        }
        if (data.submission?.fileUrl) {
          setFileUrl(data.submission.fileUrl)
        }
      } catch {
        setError('Không thể tải thông tin bài tập.')
      } finally {
        setLoading(false)
      }
    }
    fetchAssignment()
  }, [assignmentId])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post('/files/upload', formData)
      setFileUrl(res.data.data.url)
    } catch {
      alert('Không thể tải file lên. Vui lòng thử lại.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!assignment || !assignmentId) return
    
    // Validation
    if (assignment.type === 'READING') {
      const allAnswered = assignment.libraryItem.questions?.every((q: any) => answers[q.id]?.trim())
      if (!allAnswered) {
        alert('Vui lòng trả lời tất cả các câu hỏi.')
        return
      }
    } else {
      if (!fileUrl.trim()) {
        alert('Vui lòng tải lên file sản phẩm.')
        return
      }
    }
    
    setSubmitting(true)
    try {
      const payload = assignment.type === 'READING' 
        ? { answers }
        : { fileUrl }
      
      await api.post(`/assignments/${assignmentId}/submit`, payload)
      alert('✓ Nộp bài thành công!')
      navigate(`/student/class/${classId}`)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể nộp bài. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <StudentLayout>
        <LoadingSpinner />
      </StudentLayout>
    )
  }

  if (error || !assignment) {
    return (
      <StudentLayout>
        <div className="rounded-2xl border-2 border-red-300 bg-red-50 px-5 py-4">
          <p className="font-bold text-red-700">{error || 'Không tìm thấy bài tập'}</p>
        </div>
        <button
          onClick={() => navigate(`/student/class/${classId}`)}
          className="mt-4 font-bold text-[#1f3f8f] hover:underline"
        >
          ← Quay lại
        </button>
      </StudentLayout>
    )
  }

  const isSubmitted = !!assignment.submission
  const isReviewed = assignment.submission?.status === 'REVIEWED'
  const canEdit = !isReviewed

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-[#e8f5f7] to-[#c9efdb]">
      {/* Top Navigation */}
      <div className="flex items-center justify-between border-b-4 border-[#31b8ca] bg-gradient-to-r from-[#153177] to-[#1f849a] px-6 py-4 shadow-[inset_0_-2px_0_0_rgba(138,233,160,0.5)]">
        <button
          onClick={() => navigate(`/student/class/${classId}`)}
          className="flex items-center gap-2 text-lg font-bold text-white transition-transform hover:scale-105"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại
        </button>
        <h1 className="text-2xl font-black uppercase text-white">
          {assignment.type === 'READING' ? '📖 Đọc hiểu' : '🎨 Tích hợp'}
        </h1>
        <div className="w-24" />
      </div>

      {/* Main Content - 2 Panel Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL - Content */}
        <div className="w-1/2 overflow-y-auto border-r-4 border-[#31b8ca] bg-white/95 p-8">
          <div className="space-y-6">
            {/* Title & Status */}
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-[#1f3f8f]">
                {assignment.libraryItem.title}
              </h2>
              <div className="flex gap-2">
                {isReviewed && <Badge variant="success">✓ Đã chấm</Badge>}
                {isSubmitted && !isReviewed && <Badge variant="pending">⏱ Chờ duyệt</Badge>}
                {!isSubmitted && <Badge variant="neutral">Chưa nộp</Badge>}
              </div>
            </div>

            {/* Reading Content */}
            {assignment.type === 'READING' && (
              <div className="space-y-4">
                <div className="rounded-xl bg-[#f0f9ff] p-6">
                  <h3 className="mb-3 text-xl font-black text-[#1f3f8f]">NỘI DUNG</h3>
                  <div className="prose prose-lg max-w-none text-gray-800">
                    {assignment.libraryItem.content}
                  </div>
                </div>

                {assignment.libraryItem.fileUrl && (
                  <div className="rounded-xl bg-[#f0f9ff] p-6">
                    <h3 className="mb-3 text-xl font-black text-[#1f3f8f]">TÀI LIỆU</h3>
                    <a
                      href={assignment.libraryItem.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-lg font-bold text-teal-600 hover:underline"
                    >
                      📎 Tải xuống tài liệu
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Integrated Description */}
            {assignment.type === 'INTEGRATION' && (
              <div className="space-y-4">
                <div className="rounded-xl bg-[#f0f9ff] p-6">
                  <h3 className="mb-3 text-xl font-black text-[#1f3f8f]">MÔ TẢ</h3>
                  <div className="text-lg leading-relaxed text-gray-800">
                    {assignment.libraryItem.content}
                  </div>
                </div>

                {assignment.libraryItem.fileUrl && (
                  <div className="rounded-xl bg-[#f0f9ff] p-6">
                    <h3 className="mb-3 text-xl font-black text-[#1f3f8f]">TÀI LIỆU HƯỚNG DẪN</h3>
                    <a
                      href={assignment.libraryItem.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-lg font-bold text-teal-600 hover:underline"
                    >
                      📎 Tải xuống hướng dẫn
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Rubric Criteria */}
            {assignment.rubric && assignment.rubric.criteria.length > 0 && (
              <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-6">
                <h3 className="mb-4 text-xl font-black text-[#1f3f8f]">TIÊU CHÍ ĐÁNH GIÁ</h3>
                <div className="space-y-3">
                  {assignment.rubric.criteria.map((criterion: any, idx: number) => (
                    <div key={criterion.id} className="rounded-lg bg-white p-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1f3f8f] to-[#149fb3] text-sm font-black text-white">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <h4 className="font-bold text-[#1f3f8f]">{criterion.description}</h4>
                          <p className="mt-1 text-sm text-gray-600">
                            Điểm tối đa: <span className="font-bold text-teal-600">{criterion.maxScore}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback (if reviewed) */}
            {isReviewed && assignment.submission?.feedback && (
              <div className="rounded-xl bg-gradient-to-br from-green-50 to-teal-50 p-6">
                <h3 className="mb-3 text-xl font-black text-[#1f3f8f]">NHẬN XÉT CỦA GIÁO VIÊN</h3>
                <p className="text-lg leading-relaxed text-gray-800">
                  {assignment.submission.feedback}
                </p>
                {assignment.submission.score !== undefined && (
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-700">Điểm:</span>
                    <span className="rounded-full bg-gradient-to-r from-green-500 to-teal-500 px-4 py-1 text-xl font-black text-white">
                      {assignment.submission.score}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL - Submission Form */}
        <div className="w-1/2 overflow-y-auto bg-gradient-to-br from-[#cbeff2] to-[#daf5e8] p-8">
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-[#1f3f8f]">
              {isReviewed ? 'BÀI LÀM CỦA BẠN' : 'NỘP BÀI'}
            </h2>

            {/* Reading Questions */}
            {assignment.type === 'READING' && assignment.libraryItem.questions && (
              <div className="space-y-5">
                {assignment.libraryItem.questions.map((question: any, idx: number) => (
                  <div key={question.id} className="rounded-xl bg-white p-6 shadow-md">
                    <label className="mb-3 block">
                      <span className="flex items-start gap-2 text-lg font-bold text-[#1f3f8f]">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1f3f8f] text-sm text-white">
                          {idx + 1}
                        </span>
                        {question.text}
                      </span>
                    </label>
                    <textarea
                      value={answers[question.id] || ''}
                      onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                      disabled={!canEdit}
                      rows={4}
                      placeholder="Nhập câu trả lời của bạn..."
                      className="w-full rounded-lg border-2 border-gray-300 p-4 text-base disabled:bg-gray-100 disabled:text-gray-600 focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Integrated File Upload */}
            {assignment.type === 'INTEGRATION' && (
              <div className="rounded-xl bg-white p-6 shadow-md">
                <h3 className="mb-4 text-xl font-black text-[#1f3f8f]">TẢI LÊN SẢN PHẨM</h3>
                
                {fileUrl ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4">
                      <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-bold text-green-700">✓ Đã tải lên file</span>
                    </div>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-lg font-bold text-teal-600 hover:underline"
                    >
                      📎 Xem file đã tải lên
                    </a>
                    {canEdit && (
                      <div>
                        <label className="inline-block cursor-pointer rounded-lg bg-amber-500 px-4 py-2 font-bold text-white transition-all hover:bg-amber-600">
                          🔄 Thay đổi file
                          <input
                            type="file"
                            onChange={handleFileUpload}
                            disabled={uploading}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-[#1f3f8f] bg-[#f0f9ff] p-8 transition-all hover:border-teal-500 hover:bg-[#e0f7ff]">
                      <svg className="h-12 w-12 text-[#1f3f8f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-lg font-bold text-[#1f3f8f]">
                        {uploading ? 'Đang tải lên...' : 'Nhấn để chọn file'}
                      </span>
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        disabled={!canEdit || uploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            {canEdit && (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                size="lg"
                className="w-full"
              >
                {submitting ? 'Đang nộp bài...' : isSubmitted ? '🔄 Cập nhật bài làm' : '✓ Nộp bài'}
              </Button>
            )}

            {isReviewed && (
              <div className="rounded-xl border-2 border-green-300 bg-green-50 p-4 text-center">
                <p className="font-bold text-green-700">
                  ✓ Bài làm đã được chấm, không thể chỉnh sửa
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
