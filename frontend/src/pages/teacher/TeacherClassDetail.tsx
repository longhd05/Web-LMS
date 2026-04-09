import { BadgeCheck, Trash2 } from 'lucide-react'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useParams } from 'react-router-dom'
import api from '../../api/axios'
import hiepSiXanhImg from '../../img/1x/home-hiep-si-xanh.png'
import suGiaHoaBinhImg from '../../img/1x/home-su-gia-hoa-binh.png'
import CreateAssignment from './CreateAssignment'
import ReviewSubmission from './ReviewSubmission'
import assignmentsIcon from "../../img/SVG/hs-bai-tap.svg"
import studentsIcon from "../../img/SVG/hs-danh-sach.svg"
import criteriaIcon from "../../img/SVG/hs-bai-cho-duyet.svg"
import pendingIcon from "../../img/SVG/hs-tieu-chi.svg"
import communityIcon from "../../img/SVG/hs-cong-dong.svg"

interface Assignment {
  id: string
  type: 'READING' | 'INTEGRATION'
  mode: 'INDIVIDUAL' | 'GROUP'
  dueAt: string | null
  createdAt: string
  title: string | null
  description: string | null
  libraryItem: { id: string; title: string }
}

interface Member {
  student: { id: string; name: string; email: string }
  joinedAt: string
}

interface Submission {
  id: string
  status: string
  createdAt: string
  student: { id: string; name: string; email: string }
  assignment: { id: string; type: 'READING' | 'INTEGRATION'; libraryItem: { title: string } }
  review?: { resultStatus: string } | null
}

interface ClassDetail {
  id: string
  name: string
  code: string
  teacher: { id: string; name: string; email: string }
  memberships: Member[]
  assignments: Assignment[]
}

type MainTab = 'assignments' | 'students' | 'criteria' | 'pending' | 'community'
type TaskType = 'READING' | 'INTEGRATION'
type IconButtonItem = { key: MainTab; label: string; icon: ReactNode }


const iconButtons: IconButtonItem[] = [
  { key: 'assignments', label: 'Bài tập', icon: <img src={assignmentsIcon} className="h-8 w-8" /> },
  { key: 'students', label: 'Danh sách', icon: <img src={studentsIcon} className="h-8 w-8" /> },
  { key: 'pending', label: 'Bài chờ duyệt', icon: <img src={criteriaIcon} className="h-8 w-8" /> },
  { key: 'criteria', label: 'Tiêu chí', icon: <img src={pendingIcon} className="h-8 w-8" /> },
  { key: 'community', label: 'Cộng đồng', icon: <img src={communityIcon} className="h-8 w-8" /> },
]

function parseClassAndSchool(input: string): { className: string; schoolName: string } | null {
  const normalized = input.trim().replace(/\s+/g, ' ')
  const [className, ...schoolParts] = normalized.split('-').map((part) => part.trim())
  const schoolName = schoolParts.join(' - ').trim()

  if (!className || !schoolName) return null
  return { className, schoolName }
}

export default function TeacherClassDetail() {
  const { classId } = useParams<{ classId: string }>()
  const [cls, setCls] = useState<ClassDetail | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<MainTab>('assignments')
  const [taskType, setTaskType] = useState<TaskType>('READING')
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null)
  const [openAssignmentMenuId, setOpenAssignmentMenuId] = useState<string | null>(null)
  const [popupMessage, setPopupMessage] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [openReviewSubmissionId, setOpenReviewSubmissionId] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<{ label: string; x: number; y: number } | null>(null)

  const studentSubmissionByStudentAndAssignment = useMemo(() => {
    const byStudent: Record<string, Record<string, Submission>> = {}
    submissions.forEach((submission) => {
      const studentId = submission.student?.id
      const assignmentId = submission.assignment?.id
      if (!studentId || !assignmentId) return
      if (!byStudent[studentId]) byStudent[studentId] = {}
      const current = byStudent[studentId][assignmentId]
      if (!current || new Date(submission.createdAt).getTime() > new Date(current.createdAt).getTime()) {
        byStudent[studentId][assignmentId] = submission
      }
    })
    return byStudent
  }, [submissions])

  const getStudentStatus = (studentId: string, assignmentId: string) => {
    const submission = studentSubmissionByStudentAndAssignment[studentId]?.[assignmentId]
    if (!submission) return 'NONE'
    if (submission.review?.resultStatus === 'PASSED') return 'PASSED'
    if (submission.review?.resultStatus === 'FAILED') return 'FAILED'
    return 'PENDING'
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clsRes, subRes] = await Promise.all([
          api.get(`/classes/${classId}`),
          api.get(`/classes/${classId}/submissions`),
        ])
        setCls(clsRes.data.data)
        setSubmissions(subRes.data.data)
      } catch {
        setError('Không thể tải thông tin lớp học.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [classId])

  const typedAssignments = useMemo(() => {
    if (!cls || !cls.assignments) return []
    return cls.assignments.filter((a) => a.type === taskType)
  }, [cls, taskType])

  useEffect(() => {
    if (typedAssignments.length === 0) {
      setSelectedAssignmentId(null)
      return
    }
    if (!selectedAssignmentId || !typedAssignments.some((a) => a.id === selectedAssignmentId)) {
      setSelectedAssignmentId(typedAssignments[0].id)
    }
  }, [typedAssignments, selectedAssignmentId])

  useEffect(() => {
    if (!openAssignmentMenuId) return
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest('[data-assignment-menu]')) return
      setOpenAssignmentMenuId(null)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openAssignmentMenuId])

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      await api.delete(`/assignments/${assignmentId}`)
      setCls((prev) => {
        if (!prev) return prev
        return { ...prev, assignments: prev.assignments.filter((a) => a.id !== assignmentId) }
      })
      setSubmissions((prev) => prev.filter((s) => s.assignment?.id !== assignmentId))
      setOpenAssignmentMenuId((prev) => (prev === assignmentId ? null : prev))
    } catch {
      setPopupMessage('Không thể xóa bài tập. Vui lòng thử lại.')
    }
  }

  const pendingByTaskType = useMemo(() => submissions.filter((s) => s.assignment && s.assignment.type === taskType), [submissions, taskType])

  const selectedPending = useMemo(() => {
    if (!selectedAssignmentId) return []
    return pendingByTaskType.filter((s) => s.assignment && s.assignment.id === selectedAssignmentId)
  }, [pendingByTaskType, selectedAssignmentId])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#1f3f8f]" />
      </div>
    )
  }

  if (error || !cls) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <p className="text-red-600">{error}</p>
        <Link to="/giao-vien/trang-chu" className="mt-4 inline-block text-[#1f3f8f] hover:underline">← Quay lại</Link>
      </div>
    )
  }
  const students = cls.memberships.map((m) => m.student)
  const parsedClass = parseClassAndSchool(cls.name)
  const classLabel = parsedClass?.className ?? cls.name
  const schoolLabel = parsedClass?.schoolName ?? 'Chưa có'


  return (
    <>
      <div className="min-h-[calc(100vh-64px)] bg-[#efeff1] px-4 py-8 sm:px-6" z-index={-1}>
        <div className="mx-auto max-w-6xl">
        {popupMessage && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30 px-4">
            <div className="w-full max-w-sm rounded-2xl border border-[#9dc7de] bg-white p-5 text-[#1f3f8f] shadow-[0_12px_30px_rgba(31,63,143,0.25)]">
              <p className="text-base font-semibold">{popupMessage}</p>
              <div className="mt-4 flex justify-end">
                <button
                  className="rounded-full border-2 border-[#1f3f8f] px-4 py-1.5 text-sm font-bold text-[#1f3f8f] hover:bg-[#eef5ff]"
                  onClick={() => setPopupMessage(null)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
        {confirmDelete && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-sm rounded-2xl border border-[#9dc7de] bg-white p-5 text-[#1f3f8f] shadow-[0_12px_30px_rgba(31,63,143,0.25)]">
              <p className="text-base font-semibold">
                Bạn có chắc muốn xóa {confirmDelete.title}?
              </p>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  className="rounded-full border-2 border-[#1f3f8f] px-4 py-1.5 text-sm font-bold text-[#1f3f8f] hover:bg-[#eef5ff]"
                  onClick={() => setConfirmDelete(null)}
                >
                  Hủy
                </button>
                <button
                  className="rounded-full border-2 border-[#1f3f8f] bg-gradient-to-b from-[#1f3f8f] to-[#149fb3] px-4 py-1.5 text-sm font-bold text-white shadow-[inset_0_0_0_1px_#39bfd0]"
                  onClick={() => {
                    const id = confirmDelete.id
                    setConfirmDelete(null)
                    handleDeleteAssignment(id)
                  }}
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}
        {isCreateModalOpen && (
          <div
            className="fixed inset-0 z-[1800] flex items-center justify-center bg-black/40 px-4"
            onClick={() => setIsCreateModalOpen(false)}
          >
            <div
              className="relative w-full max-w-5xl rounded-[28px]"
              onClick={(e) => e.stopPropagation()}
            >
              <CreateAssignment
                embedded
                onCancel={() => setIsCreateModalOpen(false)}
                onCreated={(assignment) => {
                  setCls((prev) => {
                    if (!prev) return prev
                    return { ...prev, assignments: [...prev.assignments, assignment] }
                  })
                  setIsCreateModalOpen(false)
                }}
              />
            </div>
          </div>
        )}
        {openReviewSubmissionId && (
          <div
            className="fixed inset-0 z-[1800] flex items-center justify-center bg-black/40 px-4"
            onClick={() => setOpenReviewSubmissionId(null)}
          >
            <div
              className="relative max-h-[85vh] w-full max-w-[720px] overflow-y-auto rounded-[28px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* <button
                type="button"
                onClick={() => setOpenReviewSubmissionId(null)}
                className="absolute right-6 top-3 z-10 text-3xl font-bold text-[#1f3f8f]"
                aria-label="Đóng"
              >
                ×
              </button> */}
              <ReviewSubmission embedded submissionId={openReviewSubmissionId} />
            </div>
          </div>
        )}
        <div className="space-y-4">
          {/* ROW 1: LỚP + TRƯỜNG + ICON */}
          <div className="flex items-center justify-between">

            {/* LEFT: LỚP + TRƯỜNG */}
            <div className="flex items-center gap-10">

              {/* LỚP */}
              <div
                className="flex h-[40px] w-[260px] items-center rounded-full border-2 border-transparent px-2"
                style={{
                  background:
                    'linear-gradient(#f3fffb, #f3fffb) padding-box, linear-gradient(90deg, #3f72be 0%, #8de8a1 100%) border-box',
                }}
              >
                <span className="flex h-[30px] items-center rounded-full bg-gradient-to-b from-[#1f3f8f] to-[#149fb3] px-4 text-[14px] font-black uppercase text-white">
                  Lớp
                </span>
                <span className="ml-4 text-[20px] font-extrabold text-[#1f3f8f]">
                  {classLabel}
                </span>
              </div>

              {/* TRƯỜNG */}
              <div
                className="flex h-[40px] w-[520px] items-center rounded-full border-2 border-transparent px-2"
                style={{
                  background:
                    'linear-gradient(#f3fffb, #f3fffb) padding-box, linear-gradient(90deg, #3f72be 0%, #8de8a1 100%) border-box',
                }}
              >
                <span className="flex h-[30px] items-center rounded-full bg-gradient-to-b from-[#1f3f8f] to-[#149fb3] px-4 text-[14px] font-black uppercase text-white">
                  Trường
                </span>
                <span className="ml-4 text-[20px] font-extrabold text-[#1f3f8f]">
                  {schoolLabel}
                </span>
              </div>

            </div>

            {/* RIGHT: ICON */}
            <div className="flex items-center gap-1 text-[#1f3f8f]">
              {iconButtons.map((item, index) => {
                const isActive = activeTab === item.key

                return (
                  <div key={item.key} className="relative flex items-center gap-1">
                    <button
                      onClick={() => setActiveTab(item.key)}
                      onMouseEnter={(e) => {
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                        setTooltip({ label: item.label, x: rect.left + rect.width / 2, y: rect.top })
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      className={`group p-1 sm:p-2 transition-opacity ${
                        isActive ? "opacity-100" : "opacity-80 hover:opacity-100"
                      }`}
                      aria-label={item.label}
                    >
                      <span className="text-[#1f3f8f] [&_svg]:h-8 [&_svg]:w-8 sm:[&_svg]:h-9 sm:[&_svg]:w-9">
                        {item.icon}
                      </span>

                    </button>

                    {/* Divider: mảnh hơn trên mobile */}
                    {index !== iconButtons.length - 1 && (
                      <div className="h-6 w-[2px] bg-[#1f3f8f] opacity-60 sm:h-8" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* ROW 2: MÃ */}
          <div
            className="flex h-[40px] w-[260px] items-center rounded-full border-2 border-transparent px-2"
            style={{
              background:
                'linear-gradient(#f3fffb, #f3fffb) padding-box, linear-gradient(90deg, #3f72be 0%, #8de8a1 100%) border-box',
            }}
          >
            <span className="flex h-[30px] items-center rounded-full bg-gradient-to-b from-[#1f3f8f] to-[#149fb3] px-4 text-[14px] font-black uppercase text-white">
              Mã
            </span>
            <span className="ml-4 text-[20px] font-extrabold uppercase text-[#1f3f8f]">
              {cls.code}
            </span>
          </div>

        </div>

        {activeTab === 'assignments' && (
          <div>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="mb-10 mt-12 inline-flex h-16 items-center gap-3 rounded-[20px] border-2 border-[#1f3f8f] bg-gradient-to-b from-[#1f3f8f] to-[#149fb3] px-5 text-lg font-bold text-white shadow-[inset_0_0_0_1px_#39bfd0] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[inset_0_0_0_1px_#39bfd0,0_8px_14px_rgba(31,63,143,0.25)] active:translate-y-0 active:scale-[0.98]"
            >
              <span className="text-2xl leading-none">+</span>
              Tải bài tập mới lên
            </button>

            {cls.assignments.length === 0 ? (
              <div className="rounded-[20px] bg-[#cbeff2] px-6 py-20 text-center text-lg text-[#1f3f8f]">Chưa có bài tập nào.</div>
            ) : (
              <div className="space-y-4">
                {cls.assignments.map((a, idx) => (
                  <div key={a.id} className="rounded-[20px] bg-[#cbeff2] px-6 py-5 text-[#1f3f8f]">
                    <div className="mb-0 flex items-center justify-between gap-3">
                      <h3 className="text-lg font-extrabold">{a.title || `Bài tập ${idx + 1}`}:</h3>
                      <div className="relative" data-assignment-menu>
                        <button
                          className="rounded p-2 text-3xl leading-none"
                          onClick={() => setOpenAssignmentMenuId((prev) => (prev === a.id ? null : a.id))}
                          aria-label="Mở menu bài tập"
                          title="Tùy chọn"
                        >
                          ⋮
                        </button>
                        {openAssignmentMenuId === a.id && (
                          <div className="absolute right-2 top-10 z-10 min-w-[140px] rounded-md border border-[#9dc7de] bg-white p-1 shadow-[0_6px_20px_rgba(31,63,143,0.15)]">
                            <button
                              className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm font-semibold text-[#1f3f8f] hover:bg-[#eef5ff]"
                              onClick={() => {
                                const displayTitle = (a.title ?? `Bài tập ${idx + 1}`).trim()
                                setConfirmDelete({ id: a.id, title: displayTitle })
                                setOpenAssignmentMenuId(null)
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-[#1f3f8f]" />
                              Xóa bài
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="mb-1 pl-10 text-sm font-semibold text-[#1f3f8f]">
                      {a.mode === 'INDIVIDUAL' ? 'Cá nhân' : 'Nhóm'}: Đọc văn bản “{a.libraryItem.title}” và thực hiện bài tập {a.type === 'READING' ? 'đọc hiểu' : 'tích hợp'}
                    </p>
                    {a.description && <p className="pl-10 text-sm font-semibold text-[#1f3f8f]">{a.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'students' && (
          <div className="overflow-hidden">
            <h2 className="pb-5 text-center text-3xl font-black uppercase text-[#1f3f8f]">Danh sách học sinh</h2>
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-[18px] border border-[#7ea2e0] bg-[#f7fbff] px-4 py-3 text-sm font-semibold text-[#1f3f8f]">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#7bd85e] text-[11px] font-black leading-none text-white">✓</span>
                Hoàn thành
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#ef4444] text-[11px] font-black leading-none text-white">✕</span>
                Chưa hoàn thành
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm">
                <span className="inline-block h-4 w-4 rounded-full border-2 border-[#e6d335] bg-[#fff9cf]" />
                Chưa duyệt
              </span>
            </div>
            <div className="rounded-[20px] bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] border-separate border-spacing-0 text-center text-[#1f3f8f]">
                  <thead>
                    <tr className="text-lg font-bold">
                      <th className="rounded-tl-[20px] border border-[#7ea2e0] bg-[#cbeff2] px-3 py-2">STT</th>
                      <th className="border border-[#7ea2e0] bg-[#cbeff2] px-3 py-2 text-left">Họ và tên</th>
                      {Array.from({ length: 10 }).map((_, i) => (
                        <th key={i} className={`${i === 9 ? 'rounded-tr-[20px] ' : ''}border border-[#7ea2e0] bg-[#cbeff2] px-3 py-2`}>{i + 1}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                  {Array.from({ length: Math.max(10, students.length) }).map((_, rowIdx) => {
                    const student = students[rowIdx]
                    const assignmentSlots = cls.assignments.slice(0, 10)
                    const isLastRow = rowIdx === Math.max(10, students.length) - 1
                    return (
                      <tr key={student?.id ?? `empty-row-${rowIdx}`} className="text-sm font-semibold">
                        <td className={`${isLastRow ? 'rounded-bl-[20px] ' : ''}border border-[#7ea2e0] px-2 py-2`}>{rowIdx + 1}</td>
                        <td className="border border-[#7ea2e0] px-3 py-2 text-left">{student?.name ?? ''}</td>
                        {Array.from({ length: 10 }).map((__, colIdx) => {
                          const assignment = assignmentSlots[colIdx]
                          const status = student && assignment ? getStudentStatus(student.id, assignment.id) : 'NONE'
                          return (
                            <td key={colIdx} className={`${isLastRow && colIdx === 9 ? 'rounded-br-[20px] ' : ''}border border-[#7ea2e0] px-2 py-2`}>
                              {student && assignment && status === 'PASSED' && (
                                <span className="mx-auto inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#7bd85e] text-[11px] font-black leading-none text-white">✓</span>
                              )}
                              {student && assignment && status === 'FAILED' && (
                                <span className="mx-auto inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#ef4444] text-[11px] font-black leading-none text-white">✕</span>
                              )}
                              {student && assignment && status === 'PENDING' && (
                                <span className="mx-auto inline-block h-3.5 w-3.5 rounded-full border-2 border-[#e6d335] bg-[#fff9cf]" />
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'community' && (
          <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-14 px-64">
            <div className="flex items-center justify-center">
              <Link to="/cong-dong/su-gia-hoa-binh">
                <img src={suGiaHoaBinhImg} alt="Sư giả hòa bình" className="h-[350px] w-[350px] object-contain" />
              </Link>
            </div>

            <div className="flex items-center justify-center">
              <Link to="/cong-dong/hiep-si-xanh">
                <img src={hiepSiXanhImg} alt="Hiệp sĩ xanh" className="h-[370px] w-[370px] object-contain" />
              </Link>
            </div>
          </div>
        )}

        {(activeTab === 'criteria' || activeTab === 'pending') && (
          <div>
            <div className="mx-auto mb-6 flex w-full max-w-[380px] overflow-hidden rounded-full border-2 border-[#8be9a0] bg-[#f5fffd]">
              <button
                onClick={() => setTaskType('READING')}
                className={`w-1/2 py-2 text-xl font-extrabold ${taskType === 'READING' ? 'rounded-full border border-cyan-300 bg-gradient-to-b from-[#1f3f8f] to-[#149fb3] text-white' : 'text-[#1f3f8f]'}`}
              >
                Đọc hiểu
              </button>
              <button
                onClick={() => setTaskType('INTEGRATION')}
                className={`w-1/2 py-2 text-xl font-extrabold ${taskType === 'INTEGRATION' ? 'rounded-full border border-cyan-300 bg-gradient-to-b from-[#1f3f8f] to-[#149fb3] text-white' : 'text-[#1f3f8f]'}`}
              >
                Tích hợp
              </button>
            </div>

            {activeTab === 'criteria' && (
              <div className="min-h-[260px] rounded-[20px] bg-[#cbeff2] p-8 text-center text-2xl text-[#1f3f8f]">
                Tiêu chí {taskType === 'READING' ? 'đọc hiểu' : 'tích hợp'}
              </div>
            )}

            {activeTab === 'pending' && (
              <>
                <div className="mb-6 flex flex-wrap gap-3">
                  {typedAssignments.map((a, idx) => (
                    <button
                      key={a.id}
                      onClick={() => setSelectedAssignmentId(a.id)}
                      className={`rounded-full border-2 px-5 py-2 text-lg font-bold transition-all duration-200 hover:-translate-y-0.5 ${selectedAssignmentId === a.id ? 'border-[#1f3f8f] bg-gradient-to-b from-[#1f3f8f] to-[#149fb3] text-white shadow-[inset_0_0_0_1px_#39bfd0]' : 'border-[#7aa3df] bg-white text-[#1f3f8f] hover:bg-[#eef5ff]'}`}
                    >
                      Bài tập {idx + 1}
                    </button>
                  ))}
                </div>

                {selectedPending.length === 0 ? (
                  <div className="rounded-[20px] bg-[#cbeff2] px-6 py-8 text-lg text-[#1f3f8f]">Không có bài chờ duyệt.</div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {selectedPending.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setOpenReviewSubmissionId(s.id)}
                        className="relative rounded-full bg-[#cbeff2] px-6 py-3 text-base font-bold text-[#1f3f8f]"
                      >
                        {s.student.name}
                        {s.review?.resultStatus === 'PASSED' && <BadgeCheck className="absolute -right-1 -top-1 h-5 w-5 text-green-600" />}
                        {s.review?.resultStatus === 'FAILED' && <span className="absolute -right-1 -top-1 text-red-500">✕</span>}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
        </div>
      </div>
    {tooltip &&
      createPortal(
        <div
          className="pointer-events-none z-[9999] rounded-full border border-[#9dc7de] bg-[#f4f8fc] px-4 py-1.5 text-sm font-extrabold text-[#1f3f8f] shadow-[0_2px_8px_rgba(31,63,143,0.18)]"
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y - 8,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {tooltip.label}
          <span className="absolute -bottom-[6px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-[#9dc7de] bg-[#f4f8fc]" />
        </div>,
        document.body
      )}
    </>
  )
}





