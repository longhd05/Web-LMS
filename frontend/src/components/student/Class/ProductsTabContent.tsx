import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Badge from '../Common/Badge'
import Modal from '../Common/Modal'
import { useAuth } from '../../../contexts/AuthContext'

type FilterType = 'all' | 'reviewed' | 'pending'

export interface StudentSubmissionItem {
  id: string
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  updatedAt: string
  readingAnswersJson?: string | null
  integrationFileId?: string | null
  assignment: {
    id: string
    type: 'READING' | 'INTEGRATION'
    title?: string | null
    description?: string | null
    mode?: 'INDIVIDUAL' | 'GROUP'
    libraryItem: { title: string; content: string }
    class: { id: string; name: string }
  }
  review?: {
    comment?: string | null
    resultStatus: 'PASSED' | 'FAILED'
    perQuestionMarksJson?: string | null
  } | null
  communityPost?: {
    communityKey?: string
  } | null
}

interface ProductsTabContentProps {
  submissions: StudentSubmissionItem[]
}

interface ParsedQuestion {
  id: string
  text: string
  options?: string[]
}

interface ParsedLibraryContent {
  text: string
  integrationPrompt?: string
  questions: ParsedQuestion[]
}

function isReviewedStatus(status: StudentSubmissionItem['status']): boolean {
  return status === 'APPROVED' || status === 'REJECTED'
}

function isPendingStatus(status: StudentSubmissionItem['status']): boolean {
  return status === 'SUBMITTED'
}

function parseLibraryContent(raw: string): ParsedLibraryContent {
  try {
    const parsed = JSON.parse(raw)
    const questions = Array.isArray(parsed.questions)
      ? parsed.questions.map((q: any, idx: number) => ({
          id: String(q?.id ?? idx),
          text: String(q?.text ?? ''),
          options: Array.isArray(q?.options) ? q.options.map((op: any) => String(op)) : undefined,
        }))
      : []

    return {
      text: typeof parsed.text === 'string' ? parsed.text : raw,
      integrationPrompt: typeof parsed.integrationPrompt === 'string' ? parsed.integrationPrompt : undefined,
      questions,
    }
  } catch {
    return { text: raw, questions: [] }
  }
}

function parseReadingAnswers(raw: string | null | undefined): Record<string, string | number> {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed.reduce<Record<string, string | number>>((acc, value, idx) => {
        acc[String(idx)] = typeof value === 'number' ? value : String(value)
        return acc
      }, {})
    }
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as Record<string, string | number>
    }
    return {}
  } catch {
    return {}
  }
}

function parseMarkStats(raw: string | null | undefined): { passed: number; failed: number } {
  if (!raw) return { passed: 0, failed: 0 }
  try {
    const parsed = JSON.parse(raw) as Record<string, boolean>
    const values = Object.values(parsed)
    return {
      passed: values.filter((value) => value === true).length,
      failed: values.filter((value) => value === false).length,
    }
  } catch {
    return { passed: 0, failed: 0 }
  }
}

function getCommunityLabel(key?: string): string {
  if (key === 'hieu-si-xanh' || key === 'hiep-si-xanh') return 'Hiệp sĩ xanh'
  if (key === 'su-gia-hoa-binh') return 'Sứ giả hòa bình và hòa giải'
  return 'Không duyệt'
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('vi-VN')
}

function getSubmissionStateLabel(item: StudentSubmissionItem): string {
  if (item.status === 'APPROVED') return '✓ Đã duyệt'
  if (item.status === 'REJECTED') return '✕ Chưa đạt'
  if (item.status === 'SUBMITTED') return '⏱ Chờ duyệt'
  return 'Bản nháp'
}

export default function ProductsTabContent({ submissions }: ProductsTabContentProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [filter, setFilter] = useState<FilterType>('all')
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmissionItem | null>(null)

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((item) => {
      if (filter === 'all') return true
      if (filter === 'reviewed') return isReviewedStatus(item.status)
      if (filter === 'pending') return isPendingStatus(item.status)
      return true
    })
  }, [submissions, filter])

  const reviewedCount = submissions.filter((s) => isReviewedStatus(s.status)).length
  const pendingCount = submissions.filter((s) => isPendingStatus(s.status)).length

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-black text-[#1f3f8f]">SẢN PHẨM CỦA TÔI</h3>
        <p className="mt-2 text-sm text-gray-600">Tất cả bài làm đã nộp ngay trong lớp học này.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-full px-5 py-2.5 text-lg font-bold transition-all ${
            filter === 'all'
              ? 'border-2 border-[#1f3f8f] bg-gradient-to-b from-[#1f3f8f] to-[#149fb3] text-white shadow-[inset_0_0_0_1px_rgba(49,184,202,0.9)]'
              : 'border-2 border-[#7aa3df] bg-white text-[#1f3f8f] hover:bg-[#eef5ff]'
          }`}
        >
          Tất cả ({submissions.length})
        </button>
        <button
          onClick={() => setFilter('reviewed')}
          className={`rounded-full px-5 py-2.5 text-lg font-bold transition-all ${
            filter === 'reviewed'
              ? 'border-2 border-[#1f3f8f] bg-gradient-to-b from-[#1f3f8f] to-[#149fb3] text-white shadow-[inset_0_0_0_1px_rgba(49,184,202,0.9)]'
              : 'border-2 border-[#7aa3df] bg-white text-[#1f3f8f] hover:bg-[#eef5ff]'
          }`}
        >
          ✓ Đã chấm ({reviewedCount})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`rounded-full px-5 py-2.5 text-lg font-bold transition-all ${
            filter === 'pending'
              ? 'border-2 border-[#1f3f8f] bg-gradient-to-b from-[#1f3f8f] to-[#149fb3] text-white shadow-[inset_0_0_0_1px_rgba(49,184,202,0.9)]'
              : 'border-2 border-[#7aa3df] bg-white text-[#1f3f8f] hover:bg-[#eef5ff]'
          }`}
        >
          ⏱ Chờ duyệt ({pendingCount})
        </button>
      </div>

      {filteredSubmissions.length === 0 ? (
        <div className="rounded-[20px] bg-[#cbeff2] px-6 py-20 text-center text-lg text-[#1f3f8f]">
          {filter === 'all'
            ? 'Bạn chưa nộp sản phẩm nào.'
            : `Không có sản phẩm ${filter === 'reviewed' ? 'đã chấm' : 'chờ duyệt'}.`}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((item, idx) => {
            const reviewed = isReviewedStatus(item.status)
            const stats = parseMarkStats(item.review?.perQuestionMarksJson)
            const displayTitle = (item.assignment.title ?? '').trim() || `Bài tập ${idx + 1}`
            const modeLabel = item.assignment.mode === 'GROUP' ? 'Nhóm' : 'Cá nhân'
            const taskLabel = item.assignment.type === 'READING' ? 'đọc hiểu' : 'tích hợp'

            return (
              <div key={item.id} className="rounded-[20px] bg-[#cbeff2] px-6 py-5 text-[#1f3f8f]">
                <div className="mb-0 flex items-center justify-between gap-3">
                  <h3 className="text-lg font-extrabold">{displayTitle}:</h3>
                  <div className="flex items-center gap-4">
                    {stats.passed > 0 && (
                      <span className="inline-flex items-center gap-1 text-2xl font-black">
                        <span className="text-lg">{stats.passed}</span>
                        <span className="inline-block h-5 w-5 rounded-full bg-[#7ed957]" />
                      </span>
                    )}
                    {stats.failed > 0 && (
                      <span className="inline-flex items-center gap-1 text-2xl font-black">
                        <span className="text-lg">{stats.failed}</span>
                        <span className="inline-block h-5 w-5 rounded-full bg-[#ef4444]" />
                      </span>
                    )}
                    {stats.passed === 0 && stats.failed === 0 && (
                      <Badge variant={item.status === 'REJECTED' ? 'warning' : (reviewed ? 'success' : 'pending')}>{getSubmissionStateLabel(item)}</Badge>
                    )}
                  </div>
                </div>

                <p className="mb-1 pl-10 text-sm font-semibold text-[#1f3f8f]">
                  {modeLabel}: Đọc văn bản “{item.assignment.libraryItem.title}” và thực hiện bài tập {taskLabel}
                </p>

                {item.assignment.description && (
                  <p className="pl-10 text-sm font-semibold italic text-[#1f3f8f]">{item.assignment.description}</p>
                )}

                <div className="mt-2 flex items-end justify-between gap-3">
                  <p className="text-sm font-semibold text-[#1f3f8f]">Ngày hoàn thành: {formatDate(item.updatedAt)}</p>
                  <button
                    onClick={() => setSelectedSubmission(item)}
                    className="min-w-[96px] rounded-full border-2 border-[#1f3f8f] bg-gradient-to-b from-[#1f3f8f] to-[#149fb3] px-6 py-1.5 text-lg font-bold text-white shadow-[inset_0_0_0_1px_#39bfd0] transition-all hover:-translate-y-0.5"
                  >
                    XEM
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selectedSubmission && (
        <Modal open={!!selectedSubmission} onClose={() => setSelectedSubmission(null)} maxWidth="xl">
          {(() => {
            const content = parseLibraryContent(selectedSubmission.assignment.libraryItem.content)
            const answers = parseReadingAnswers(selectedSubmission.readingAnswersJson)
            const markStats = parseMarkStats(selectedSubmission.review?.perQuestionMarksJson)
            const displayName = user?.name || 'Học sinh'

            return (
              <div
                className="mx-auto w-full rounded-[30px] border-2 border-transparent bg-[#f3fffb] p-6 text-[#1f3f8f]"
                style={{
                  background:
                    'linear-gradient(#f3fffb, #f3fffb) padding-box, linear-gradient(90deg, #3f72be 0%, #8de8a1 100%) border-box',
                }}
              >
                <div className="max-h-[70vh] overflow-y-auto pr-2">
                  <h2 className="mb-4 text-5xl font-black">{displayName}</h2>

                  {selectedSubmission.assignment.type === 'READING' ? (
                    <div className="space-y-6 text-2xl font-semibold">
                      {content.questions.length > 0 ? (
                        content.questions.map((question, idx) => {
                          const rawAnswer = answers[question.id]
                          const answerText = (() => {
                            if (rawAnswer === undefined || rawAnswer === null || String(rawAnswer).trim() === '') {
                              return '(chưa trả lời)'
                            }
                            if (typeof rawAnswer === 'number' && question.options?.length) {
                              return question.options[rawAnswer] ?? '(chưa trả lời)'
                            }
                            if (/^\d+$/.test(String(rawAnswer)) && question.options?.length) {
                              const optionByIndex = question.options[Number(rawAnswer)]
                              return optionByIndex ?? String(rawAnswer)
                            }
                            return String(rawAnswer)
                          })()

                          return (
                            <div key={`${question.id}-${idx}`}>
                              <p className="font-bold">
                                Câu {idx + 1}: {question.text} {question.options?.length ? '(câu trắc nghiệm)' : '(câu tự luận ngắn)'}
                              </p>
                              <p className="pl-8 italic">{'=> '}Đáp án của học sinh ({answerText})</p>
                            </div>
                          )
                        })
                      ) : (
                        <p>Không có dữ liệu câu hỏi từ văn bản.</p>
                      )}

                      <div className="flex items-center justify-end gap-4">
                        {(markStats.passed > 0 || selectedSubmission.review?.resultStatus === 'PASSED') && (
                          <span className="inline-block h-8 w-8 rounded-full bg-[#7ed957]" />
                        )}
                        {(markStats.failed > 0 || selectedSubmission.review?.resultStatus === 'FAILED') && (
                          <span className="inline-block h-8 w-8 rounded-full bg-[#ef4444]" />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 text-2xl font-semibold">
                      <p>{content.integrationPrompt || content.text}</p>
                      <p className="italic">{'=> '}File mà học sinh tải lên (Word / Hình ảnh / Video)</p>
                      <div className="grid gap-3 sm:grid-cols-[120px,1fr] sm:items-center">
                        <p className="font-bold">Duyệt:</p>
                        <div className="h-14 w-full max-w-[420px] rounded-full border-2 border-[#6f8ed6] bg-[#c8e4e6] px-6 py-2">
                          {getCommunityLabel(selectedSubmission.communityPost?.communityKey)}
                        </div>
                      </div>
                    </div>
                  )}

                  <h3 className="mt-8 text-5xl font-black">Nhận xét của giáo viên</h3>
                  <div className="mt-4 min-h-[110px] rounded-[20px] bg-[#cbeff2] p-6 text-2xl font-semibold">
                    {selectedSubmission.review?.comment || 'Hiển thị nhận xét GV đã gửi'}
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => setSelectedSubmission(null)}
                      className="rounded-full border-2 border-[#cfd4d9] bg-[#a8aaad] px-8 py-2 text-lg font-bold uppercase text-white"
                    >
                      Đóng
                    </button>
                    <button
                      onClick={() => {
                        navigate(`/hoc-sinh/lop-hoc/${selectedSubmission.assignment.class.id}/bai-tap/${selectedSubmission.assignment.id}`)
                        setSelectedSubmission(null)
                      }}
                      className="rounded-full border-2 border-[#1f3f8f] bg-gradient-to-b from-[#1f3f8f] to-[#149fb3] px-8 py-2 text-lg font-bold uppercase text-white"
                    >
                      Xem bài làm
                    </button>
                  </div>
                </div>
              </div>
            )
          })()}
        </Modal>
      )}
    </div>
  )
}
