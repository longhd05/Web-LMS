import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StudentLayout from '../../components/student/Layout/StudentLayout'
import JoinClassModal from '../../components/student/Class/JoinClassModal'
import api from '../../api/axios'
import { ClassInfo } from '../../types/student'

export default function StudentDashboard() {
  const navigate = useNavigate()
  const [classes, setClasses] = useState<ClassInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showJoinDialog, setShowJoinDialog] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const fetchClasses = async () => {
    setLoading(true)
    try {
      const res = await api.get('/classes')
      setClasses(res.data.data)
    } catch {
      setError('Không thể tải danh sách lớp học.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    fetchClasses() 
  }, [])

  const handleJoinSuccess = () => {
    fetchClasses()
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 4000)
  }

  return (
    <StudentLayout>
      <div className="space-y-8">
        {/* Header with Join button */}
        <button
          onClick={() => setShowJoinDialog(true)}
          className="inline-flex h-16 items-center gap-3 rounded-[22px] border-2 border-[#1f3f8f] bg-gradient-to-b from-[#1f3f8f] to-[#149fb3] px-6 text-xl font-bold text-white shadow-[inset_0_0_0_1px_rgba(49,184,202,0.9)] transition-all duration-200 hover:-translate-y-0.5"
        >
          <span className="text-3xl leading-none">+</span>
          Tham gia lớp
        </button>

        {/* Success message */}
        {showSuccess && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
            ✅ Đã tham gia lớp học thành công!
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#1f3f8f]" />
          </div>
        ) : classes.length === 0 ? (
          <button
            type="button"
            onClick={() => setShowJoinDialog(true)}
            className="block w-full rounded-3xl border-2 border-dashed border-[#8be9a0] bg-[#f5fffd] py-16 text-center text-lg font-bold text-[#1f3f8f] transition-colors hover:bg-[#ebf9ff]"
          >
            Tham gia lớp học đầu tiên
          </button>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls) => (
              <button
                key={cls.id}
                type="button"
                onClick={() => navigate(`/hoc-sinh/class/${cls.id}`)}
                className="group rounded-[26px] border-2 border-transparent p-6 text-left shadow-[0_8px_16px_rgba(44,96,162,0.24),0_0_10px_rgba(83,145,220,0.28)] transition-transform hover:-translate-y-0.5"
                style={{
                  background:'linear-gradient(#f9ffff, #dbf2ea) padding-box, linear-gradient(90deg, #3f72be 0%, #8de8a1 100%) border-box',
                }}
              >
                <div className="mb-4 flex items-start justify-between gap-2">
                  <h3 className="line-clamp-2 text-3xl font-extrabold uppercase leading-tight text-[#1f3f8f]">{cls.name}</h3>
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#1f3f8f] text-[#13a0b4]">
                    <svg className="h-8 w-8 translate-x-[1px]" viewBox="0 0 28 25" fill="currentColor">
                      <path d="M8.8 6.8c0-.86.94-1.4 1.7-.95l7.9 4.73c.73.44.73 1.49 0 1.93l-7.9 4.73c-.76.46-1.7-.08-1.7-.95z" />
                    </svg>
                  </div>
                </div>

                <div
                  className="mb-2 flex h-10 max-w-[180px] items-center overflow-hidden rounded-full border-2 border-transparent"
                  style={{
                    background:
                      'linear-gradient(#f6ffff, #f6ffff) padding-box, linear-gradient(90deg, #3f72be 0%, #8de8a1 100%) border-box',
                  }}
                >
                  <span className="h-full rounded-full border-r border-[#55bccf] bg-gradient-to-b from-[#1f3f8f] to-[#159eb3] px-4 py-1.5 text-sm font-extrabold uppercase text-white">Mã</span>
                  <span className="px-3 text-lg font-extrabold uppercase text-[#1f3f8f]">{cls.code}</span>
                </div>

                <div
                  className="flex h-10 max-w-[180px] items-center overflow-hidden rounded-full border-2 border-transparent"
                  style={{
                    background:
                      'linear-gradient(#f6ffff, #f6ffff) padding-box, linear-gradient(90deg, #3f72be 0%, #8de8a1 100%) border-box',
                  }}
                >
                  <span className="h-full rounded-full border-r border-[#55bccf] bg-gradient-to-b from-[#1f3f8f] to-[#159eb3] px-4 py-1.5 text-sm font-extrabold text-white">
                    {String(cls._count?.memberships || 0).padStart(2, '0')}
                  </span>
                  <span className="px-3 text-lg font-bold text-[#1f3f8f]">Học sinh</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <JoinClassModal
        open={showJoinDialog}
        onClose={() => setShowJoinDialog(false)}
        onSuccess={handleJoinSuccess}
      />
    </StudentLayout>
  )
}
