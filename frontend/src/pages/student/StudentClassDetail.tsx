import { useState, useEffect, ReactNode } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { BookOpen, CheckSquare, Award, Leaf } from 'lucide-react'
import StudentLayout from '../../components/student/Layout/StudentLayout'
import AssignmentCard from '../../components/student/Assignment/AssignmentCard'
import LoadingSpinner from '../../components/student/Common/LoadingSpinner'
import api from '../../api/axios'
import { ClassInfo, Assignment } from '../../types/student'
import hiepSiXanhImg from '../../img/1x/home-hiep-si-xanh.png'
import suGiaHoaBinhImg from '../../img/1x/home-su-gia-hoa-binh.png'

import assignmentsIcon from "../../../../SVG/hs-bai-tap.svg"
import rubricIcon from "../../../../SVG/hs-tieu-chi.svg"
import communityIcon from "../../../../SVG/hs-cong-dong.svg"

type TaskType = 'READING' | 'INTEGRATION'
type TabType = 'assignments' | 'rubric' | 'products' | 'community'
type IconButtonItem = { key: TabType; label: string; icon: ReactNode }

const iconButtons: IconButtonItem[] = [
  { key: 'assignments', label: 'Bài tập', icon: <img src={assignmentsIcon} className="h-8 w-8" /> },
  { key: 'rubric', label: 'Tiêu chí', icon: <img src={rubricIcon} className="h-8 w-8" /> },
  { key: 'products', label: 'Sản phẩm', icon: <Award className="h-8 w-8" /> },
  { key: 'community', label: 'Cộng đồng', icon: <img src={communityIcon} className="h-8 w-8" /> },
]

function parseClassAndSchool(input: string): { className: string; schoolName: string } | null {
  const normalized = input.trim().replace(/\s+/g, ' ')
  const [className, ...schoolParts] = normalized.split('-').map((part) => part.trim())
  const schoolName = schoolParts.join(' - ').trim()

  if (!className || !schoolName) return null
  return { className, schoolName }
}

export default function ClassDetail() {
  const { classId } = useParams<{ classId: string }>()
  const navigate = useNavigate()
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('assignments')
  const [taskType, setTaskType] = useState<TaskType>('READING')

  useEffect(() => {
    const fetchData = async () => {
      if (!classId) return
      
      setLoading(true)
      try {
        const [classRes, assignmentsRes] = await Promise.all([
          api.get(`/classes/${classId}`),
          api.get(`/classes/${classId}/assignments`)
        ])
        setClassInfo(classRes.data.data)
        setAssignments(assignmentsRes.data.data || [])
      } catch {
        setError('Không thể tải thông tin lớp học.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [classId])

  if (loading) {
    return (
      <StudentLayout>
        <LoadingSpinner />
      </StudentLayout>
    )
  }

  if (error || !classInfo) {
    return (
      <StudentLayout>
        <div className="rounded-2xl border-2 border-red-300 bg-red-50 px-5 py-4">
          <p className="font-bold text-red-700">{error || 'Không tìm thấy lớp học'}</p>
        </div>
        <button
          onClick={() => navigate('/hoc-sinh/trang-chu')}
          className="mt-4 text-[#1f3f8f] font-bold hover:underline"
        >
          ← Quay lại
        </button>
      </StudentLayout>
    )
  }

  const parsed = parseClassAndSchool(classInfo.name)
  const classLabel = parsed?.className ?? classInfo.name
  const schoolLabel = parsed?.schoolName ?? 'Chưa có'

  return (
    <StudentLayout>
      <div className="space-y-6">
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
                    className={`group p-1 sm:p-2 transition-opacity ${
                      isActive ? "opacity-100" : "opacity-80 hover:opacity-100"
                    }`}
                    aria-label={item.label}
                  >
                    <span className="text-[#1f3f8f] [&_svg]:h-8 [&_svg]:w-8 sm:[&_svg]:h-9 sm:[&_svg]:w-9">
                      {item.icon}
                    </span>

                    {/* Tooltip: chỉ hiện từ sm trở lên */}
                    <span className="pointer-events-none absolute -top-10 left-1/2 z-1 hidden -translate-x-1/2 whitespace-nowrap rounded-full border border-[#9dc7de] bg-[#f4f8fc] px-4 py-1.5 text-sm font-extrabold text-[#1f3f8f] shadow-[0_2px_8px_rgba(31,63,143,0.18)] sm:group-hover:block">
                      {item.label}
                      <span className="absolute -bottom-[6px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-[#9dc7de] bg-[#f4f8fc]"/>
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
            {classInfo.code}
          </span>
        </div>

        {/* Content based on tab */}
        {activeTab === 'assignments' && (
          <div className="mt-12">
            {assignments.length === 0 ? (
              <div className="rounded-[20px] bg-[#cbeff2] px-6 py-20 text-center text-lg text-[#1f3f8f]">
                Chưa có bài tập nào.
              </div>
            ) : (
              <div className="grid grid-cols-1">
                {assignments.map((assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    onClick={() => navigate(`/hoc-sinh/lop-hoc/${classId}/bai-tap/${assignment.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'rubric' && (
          <div>
            <div className="mx-auto mb-6 flex w-full max-w-[380px] overflow-hidden rounded-full border-2 border-[#8be9a0] bg-[#f5fffd]">
              <button
                onClick={() => setTaskType('READING')}
                className={`w-1/2 py-2 text-xl font-extrabold ${
                  taskType === 'READING'
                    ? 'rounded-full border border-cyan-300 bg-gradient-to-b from-[#1f3f8f] to-[#149fb3] text-white'
                    : 'text-[#1f3f8f]'
                }`}
              >
                Đọc hiểu
              </button>
              <button
                onClick={() => setTaskType('INTEGRATION')}
                className={`w-1/2 py-2 text-xl font-extrabold ${
                  taskType === 'INTEGRATION'
                    ? 'rounded-full border border-cyan-300 bg-gradient-to-b from-[#1f3f8f] to-[#149fb3] text-white'
                    : 'text-[#1f3f8f]'
                }`}
              >
                Tích hợp
              </button>
            </div>
            <div className="min-h-[260px] rounded-[20px] bg-[#cbeff2] p-8 text-center text-2xl text-[#1f3f8f]">
              Tiêu chí {taskType === 'READING' ? 'đọc hiểu' : 'tích hợp'}
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="min-h-[260px] rounded-[20px] bg-[#cbeff2] p-8 text-center text-2xl text-[#1f3f8f]">
            <h3 className="text-2xl font-black text-[#1f3f8f]">SẢN PHẨM CỦA TÔI</h3>
            <p className="mt-4 text-lg text-[#1f3f8f]">
              Hoặc xem tất cả sản phẩm tại{' '}
              <button
                onClick={() => navigate('/hoc-sinh/san-pham')}
                className="font-extrabold text-teal-600 hover:underline"
              >
                trang Sản phẩm
              </button>
            </p>
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
      </div>
    </StudentLayout>
  )
}
