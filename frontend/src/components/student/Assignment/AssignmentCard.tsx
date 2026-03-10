import { Assignment, SubmissionStatus } from '../../../types/student'
import Badge from '../Common/Badge'

interface AssignmentCardProps {
  assignment: Assignment
  onClick: () => void
}

function getSubmissionStatus(assignment: Assignment): { status: SubmissionStatus; label: string; variant: 'success' | 'pending' | 'warning' | 'info' | 'neutral' } {
  if (!assignment.submission) {
    // Check if overdue
    if (assignment.dueAt && new Date(assignment.dueAt) < new Date()) {
      return { status: 'NOT_STARTED', label: '✕ Quá hạn', variant: 'warning' }
    }
    return { status: 'NOT_STARTED', label: 'Chưa làm', variant: 'neutral' }
  }
  
  if (assignment.submission.status === 'REVIEWED') {
    return { status: 'REVIEWED', label: '✓ Đã chấm', variant: 'success' }
  }
  
  return { status: 'PENDING_REVIEW', label: '⏱ Chờ duyệt', variant: 'pending' }
}

export default function AssignmentCard({ assignment, onClick }: AssignmentCardProps) {
  const { label, variant } = getSubmissionStatus(assignment)
  const isOverdue = assignment.dueAt && new Date(assignment.dueAt) < new Date() && !assignment.submission

  return (
    <div className="flex items-center justify-between rounded-[28px] bg-[#DFF3F7] p-10 text-[#1f3f8f] transition-all hover:shadow-lg">
      {/* Left Content */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-3">
          <h3 className="text-2xl font-extrabold">
            {assignment.libraryItem.title}
          </h3>
          <Badge variant={variant}>{label}</Badge>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-white px-5 py-2 text-base font-bold">
            {assignment.type === 'READING' ? '📖 Đọc hiểu' : '🎨 Tích hợp'}
          </span>
          <span className="rounded-full bg-white px-5 py-2 text-base font-bold">
            {assignment.mode === 'INDIVIDUAL' ? '👤 Cá nhân' : '👥 Nhóm'}
          </span>
        </div>

        {assignment.dueAt && (
          <div className="flex items-center gap-2 text-base font-semibold">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className={isOverdue ? 'text-red-600' : ''}>
              Hạn nộp: {new Date(assignment.dueAt).toLocaleDateString('vi-VN')}
            </span>
          </div>
        )}

        {assignment.submission && (
          <div className="text-sm text-gray-600">
            Đã nộp: {new Date(assignment.submission.createdAt).toLocaleDateString('vi-VN')}
          </div>
        )}
      </div>

      {/* Right Button */}
      <button
        onClick={onClick}
        className="ml-8 h-14 shrink-0 rounded-full bg-gradient-to-r from-[#1E3A8A] to-[#0EA5E9] px-10 text-lg font-semibold text-white shadow-md transition-all hover:shadow-lg"
      >
        LÀM BÀI
      </button>
    </div>
  )
}
