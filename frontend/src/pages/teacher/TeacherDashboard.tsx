import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'

interface ClassInfo {
  id: string
  name: string
  code: string
  _count: { memberships: number; assignments: number }
}

const MAX_CLASS_NAME_LENGTH = 60
const MAX_SCHOOL_NAME_LENGTH = 120
const MAX_FULL_NAME_LENGTH = MAX_CLASS_NAME_LENGTH + MAX_SCHOOL_NAME_LENGTH + 3

function parseClassAndSchool(input: string): { className: string; schoolName: string } | null {
  const normalized = input.trim().replace(/\s+/g, ' ')
  const [className, ...schoolParts] = normalized.split('-').map((part) => part.trim())
  const schoolName = schoolParts.join(' - ').trim()

  if (!className || !schoolName) return null
  return { className, schoolName }
}

export default function TeacherDashboard() {
  const [classes, setClasses] = useState<ClassInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [className, setClassName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [newClass, setNewClass] = useState<{ name: string; code: string } | null>(null)
  const navigate = useNavigate()

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

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()

    const parsed = parseClassAndSchool(className)
    if (!parsed) {
      setCreateError('Cần nhập cả Lớp và Trường.')
      return
    }
    if (parsed.className.length > MAX_CLASS_NAME_LENGTH) {
      setCreateError(`Tên lớp tối đa ${MAX_CLASS_NAME_LENGTH} ký tự.`)
      return
    }
    if (parsed.schoolName.length > MAX_SCHOOL_NAME_LENGTH) {
      setCreateError(`Tên trường tối đa ${MAX_SCHOOL_NAME_LENGTH} ký tự.`)
      return
    }

    setCreating(true)
    setCreateError('')
    try {
      const normalizedName = `${parsed.className} - ${parsed.schoolName}`
      const res = await api.post('/classes', { name: normalizedName })
      const created = res.data.data
      setNewClass({ name: created.name, code: created.code })
      setClassName('')
      await fetchClasses()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setCreateError(msg ?? 'Tạo lớp thất bại.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#efeff1] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => setShowCreateDialog(true)}
          className="mb-8 inline-flex h-16 items-center gap-3 rounded-[22px] border-2 border-[#1f3f8f] bg-gradient-to-b from-[#1f3f8f] to-[#149fb3] px-6 text-xl font-bold text-white shadow-[inset_0_0_0_1px_rgba(49,184,202,0.9)] transition-all duration-200 hover:-translate-y-0.5"
        >
          <span className="text-3xl leading-none">+</span>
          Tạo lớp mới
        </button>

        {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#1f3f8f]" />
          </div>
        ) : classes.length === 0 ? (
          <button
            type="button"
            onClick={() => setShowCreateDialog(true)}
            className="block w-full rounded-3xl border-2 border-dashed border-[#8be9a0] bg-[#f5fffd] py-16 text-center text-lg font-bold text-[#1f3f8f] transition-colors hover:bg-[#ebf9ff]"
          >
            Tạo lớp học đầu tiên
          </button>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls) => (
              <button
                key={cls.id}
                type="button"
                onClick={() => navigate(`/teacher/class/${cls.id}`)}
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
                    {String(cls._count.memberships).padStart(2, '0')}
                  </span>
                  <span className="px-3 text-lg font-bold text-[#1f3f8f]">Học sinh</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {showCreateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-2xl rounded-[34px] border-2 border-[#8bee9f] bg-gradient-to-b from-white to-[#dff2ea] p-8 shadow-[0_0_0_2px_rgba(63,98,170,0.7)] sm:p-10">
            <h2 className="mb-6 text-center text-4xl font-black uppercase leading-none text-[#1f3f8f] sm:text-5xl">Tạo lớp mới</h2>

            {newClass ? (
              <div>
                <div className="mb-6 rounded-2xl border border-[#96e7a8] bg-white/90 p-5 text-center">
                  <p className="text-lg text-[#1f3f8f]">Đã tạo lớp <strong>{newClass.name}</strong></p>
                  <p className="mt-2 text-sm text-gray-600">Mã lớp:</p>
                  <p className="mt-1 text-4xl font-black tracking-widest text-[#1f3f8f]">{newClass.code}</p>
                </div>
                <button
                  onClick={() => {
                    setShowCreateDialog(false)
                    setNewClass(null)
                  }}
                  className="w-full rounded-[24px] border-2 border-[#1f3f8f] bg-gradient-to-b from-[#1f3f8f] to-[#149fb3] py-3 text-xl font-bold uppercase text-white shadow-[inset_0_0_0_1px_rgba(49,184,202,0.9)]"
                >
                  Đóng
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="space-y-2">
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  maxLength={MAX_FULL_NAME_LENGTH}
                  placeholder="Nhập tên lớp (VD: Lớp 7A1 - Trường THCS Nam Từ Liêm)"
                  className="h-14 w-full rounded-2xl border-2 border-[#89a4dc] bg-white px-5 text-lg text-[#1f3f8f] placeholder:text-gray-400 focus:outline-none"
                />
                {createError && <p className="-mt-3 text-sm font-medium text-red-600">{createError}</p>}

                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateDialog(false)
                      setCreateError('')
                    }}
                    className="rounded-[24px] border-2 border-[#cfd4d9] bg-[#a8aaad] py-3 text-xl font-bold uppercase text-white"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="rounded-[24px] border-2 border-[#1f3f8f] bg-gradient-to-b from-[#1f3f8f] to-[#149fb3] py-3 text-xl font-bold uppercase text-white shadow-[inset_0_0_0_1px_rgba(49,184,202,0.9)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[inset_0_0_0_1px_rgba(49,184,202,0.9),0_8px_14px_rgba(31,63,143,0.25)] active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-[inset_0_0_0_1px_rgba(49,184,202,0.9)]"
                  >
                    {creating ? 'Đang tạo...' : 'Tạo lớp'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
