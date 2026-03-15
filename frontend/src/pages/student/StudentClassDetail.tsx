import { useState, useEffect, ReactNode } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Award } from 'lucide-react'
import StudentLayout from '../../components/student/Layout/StudentLayout'
import AssignmentCard from '../../components/student/Assignment/AssignmentCard'
import LoadingSpinner from '../../components/student/Common/LoadingSpinner'
import ClassDetailHeader from '../../components/student/Class/ClassDetailHeader'
import TaskTypeToggle from '../../components/student/Class/TaskTypeToggle'
import CommunityShortcutGrid from '../../components/student/Class/CommunityShortcutGrid'
import ProductsTabContent, { StudentSubmissionItem } from '../../components/student/Class/ProductsTabContent'
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
  const [submissions, setSubmissions] = useState<StudentSubmissionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('assignments')
  const [taskType, setTaskType] = useState<TaskType>('READING')

  useEffect(() => {
    const fetchData = async () => {
      if (!classId) return
      
      setLoading(true)
      try {
        const [classRes, assignmentsRes, submissionsRes] = await Promise.all([
          api.get(`/classes/${classId}`),
          api.get(`/classes/${classId}/assignments`),
          api.get('/submissions'),
        ])
        setClassInfo(classRes.data.data)
        setAssignments(assignmentsRes.data.data || [])
        setSubmissions(submissionsRes.data.data || [])
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
  const classSubmissions = submissions.filter((submission) => submission.assignment.class.id === classInfo.id)

  return (
    <StudentLayout>
      <div className="space-y-6">
        <ClassDetailHeader
          classLabel={classLabel}
          schoolLabel={schoolLabel}
          classCode={classInfo.code}
          tabs={iconButtons}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as TabType)}
        />

        {/* Content based on tab */}
        {activeTab === 'assignments' && (
          <div className="mt-12">
            {assignments.length === 0 ? (
              <div className="rounded-[20px] bg-[#cbeff2] px-6 py-20 text-center text-lg text-[#1f3f8f]">
                Chưa có bài tập nào.
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment, idx) => {
                  const matchedSub = classSubmissions.find((s) => s.assignment.id === assignment.id)
                  const enrichedAssignment: Assignment = matchedSub
                    ? { ...assignment, submission: { id: matchedSub.id, status: matchedSub.status, createdAt: matchedSub.updatedAt } }
                    : assignment
                  return (
                    <AssignmentCard
                      key={assignment.id}
                      assignment={enrichedAssignment}
                      index={idx}
                      onClick={() => navigate(`/hoc-sinh/lop-hoc/${classId}/bai-tap/${assignment.id}`)}
                    />
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'rubric' && (
          <div>
            <TaskTypeToggle taskType={taskType} onChange={setTaskType} />
            <div className="min-h-[260px] rounded-[20px] bg-[#cbeff2] p-8 text-center text-2xl text-[#1f3f8f]">
              Tiêu chí {taskType === 'READING' ? 'đọc hiểu' : 'tích hợp'}
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <ProductsTabContent submissions={classSubmissions} />
        )}

        {activeTab === 'community' && (
          <CommunityShortcutGrid suGiaHoaBinhImg={suGiaHoaBinhImg} hiepSiXanhImg={hiepSiXanhImg} />
        )}
      </div>
    </StudentLayout>
  )
}
