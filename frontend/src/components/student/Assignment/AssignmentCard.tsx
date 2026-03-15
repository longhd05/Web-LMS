import { Assignment } from '../../../types/student'
import Badge from '../Common/Badge'

interface AssignmentCardProps {
  assignment: Assignment
  index: number
  onClick: () => void
}

type AssignmentCardDisplayStatus = 'NOT_STARTED' | 'PENDING_REVIEW' | 'REVIEWED'

function getSubmissionStatus(assignment: Assignment): {
  status: AssignmentCardDisplayStatus
  label: string
  variant: 'success' | 'pending' | 'warning' | 'info' | 'neutral'
} {
  if (!assignment.submission || assignment.submission.status === 'DRAFT') {
    // Check if overdue
    if (assignment.dueAt && new Date(assignment.dueAt) < new Date()) {
      return { status: 'NOT_STARTED', label: '✕ Quá hạn', variant: 'warning' }
    }
    return { status: 'NOT_STARTED', label: 'Chưa làm', variant: 'neutral' }
  }

  return { status: 'REVIEWED', label: '✓ Đã hoàn thành', variant: 'success' }
}

export default function AssignmentCard({ assignment, index, onClick }: AssignmentCardProps) {
  const { label, variant } = getSubmissionStatus(assignment)
  const isOverdue = assignment.dueAt && new Date(assignment.dueAt) < new Date() && !assignment.submission
  const isCompleted = !!assignment.submission && assignment.submission.status !== 'DRAFT'
  const displayTitle = (assignment.title ?? '').trim() || `Bài tập ${index + 1}`
  const assignmentTypeLabel = assignment.type === 'READING' ? 'đọc hiểu' : 'tích hợp'
  const modeLabel = assignment.mode === 'INDIVIDUAL' ? 'Cá nhân' : 'Nhóm'

  return (
    <div className="rounded-[20px] px-6 py-5 text-[#1f3f8f] transition-all hover:shadow-lg bg-[#cbeff2]">
      {/* Left Content */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-3">
            <h3 className="truncate text-lg font-extrabold">{displayTitle}:</h3>
            <Badge variant={variant}>{label}</Badge>
          </div>

          <p className="mb-1 pl-10 text-sm font-semibold text-[#1f3f8f]">
            {modeLabel}: Đọc văn bản “{assignment.libraryItem.title}” và thực hiện bài tập {assignmentTypeLabel}
          </p>

          {assignment.description && (
            <p className="pl-10 text-sm font-semibold text-[#1f3f8f]">{assignment.description}</p>
          )}

          {assignment.dueAt && (
            <p className={`pl-10 text-sm font-semibold ${isOverdue ? 'text-red-600' : 'text-[#1f3f8f]'}`}>
              Hạn nộp: {new Date(assignment.dueAt).toLocaleDateString('vi-VN')}
            </p>
          )}

          {assignment.submission && (
            <p className="pl-10 text-sm font-semibold text-[#1f3f8f]">
              Đã nộp: {new Date(assignment.submission.createdAt).toLocaleDateString('vi-VN')}
            </p>
          )}
        </div>

        {/* Right Button */}
        <button
          onClick={onClick}
          className="mt-0.5 shrink-0 rounded-full bg-gradient-to-r from-[#1E3A8A] to-[#0EA5E9] px-6 py-2 text-base font-bold text-white shadow-md transition-all hover:shadow-lg"
        >
          LÀM BÀI
        </button>
      </div>
    </div>
  )
}
