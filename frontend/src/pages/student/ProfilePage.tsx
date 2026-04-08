import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import StudentLayout from '../../components/student/Layout/StudentLayout'
import LoadingSpinner from '../../components/student/Common/LoadingSpinner'
import Button from '../../components/student/Common/Button'
import api from '../../api/axios'
import { normalizeAvatarUrl } from '../../utils/avatarUrl'

interface UserProfile {
  id: string
  email: string
  name: string
  avatarUrl?: string | null
  role: string
  createdAt: string
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        const res = await api.get('/auth/me')
        const data = res.data.data
        const normalized = { ...data, avatarUrl: normalizeAvatarUrl(data.avatarUrl) }
        setProfile(normalized)
        setName(normalized.name)
      } catch {
        setMessage('Không thể tải thông tin cá nhân.')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post('/files/upload', formData)
      const avatarUrl = normalizeAvatarUrl(res.data.data.url)
      
      // Update profile with new avatar
      await api.put('/auth/profile', { avatarUrl })
      
      setProfile(prev => prev ? { ...prev, avatarUrl } : null)
      
      updateUser({ avatarUrl })
      
      setMessage('✓ Cập nhật ảnh đại diện thành công!')
    } catch {
      setMessage('Không thể tải ảnh lên. Vui lòng thử lại.')
    } finally {
      setUploading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      setMessage('Vui lòng điền đầy đủ thông tin.')
      return
    }
    
    setSaving(true)
    try {
      const res = await api.put('/auth/profile', { name })
      const updated = res.data.data
      setProfile(updated)
      
      updateUser({ name: updated.name })
      
      setEditing(false)
      setMessage('✓ Cập nhật thông tin thành công!')
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Không thể cập nhật. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <StudentLayout>
        <LoadingSpinner />
      </StudentLayout>
    )
  }

  if (!profile) {
    return (
      <StudentLayout>
        <div className="rounded-2xl border-2 border-red-300 bg-red-50 px-5 py-4">
          <p className="font-bold text-red-700">Không thể tải thông tin cá nhân</p>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header */}
        <h1 className="text-4xl font-black uppercase text-[#1f3f8f]">
          👤 HỒ SƠ CÁ NHÂN
        </h1>

        {/* Message */}
        {message && (
          <div className={`rounded-lg px-5 py-3 font-bold ${
            message.startsWith('✓') 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Avatar Section */}
          <div className="lg:col-span-1">
            <div className="rounded-[20px] bg-gradient-to-br from-[#cbeff2] to-[#daf5e8] p-6">
              <h2 className="mb-4 text-xl font-black text-[#1f3f8f]">ẢNH ĐẠI DIỆN</h2>
              
              <div className="flex flex-col items-center gap-4">
                <div className="h-40 w-40 overflow-hidden rounded-full border-4 border-white shadow-lg">
                  <img
                    src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&size=200&background=1f3f8f&color=fff&bold=true`}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                
                <label className="cursor-pointer rounded-lg bg-gradient-to-b from-[#1f3f8f] to-[#149fb3] px-5 py-2.5 text-base font-bold text-white transition-all hover:shadow-lg disabled:opacity-50">
                  {uploading ? '⏳ Đang tải...' : '📷 Thay đổi ảnh'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="lg:col-span-2">
            <div className="rounded-[20px] bg-gradient-to-br from-[#cbeff2] to-[#daf5e8] p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-black text-[#1f3f8f]">THÔNG TIN</h2>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="rounded-lg bg-white px-4 py-2 font-bold text-[#1f3f8f] transition-all hover:bg-[#eef5ff]"
                  >
                    ✏️ Chỉnh sửa
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#1f3f8f]">Họ và tên</label>
                  {editing ? (
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-base focus:border-teal-500 focus:outline-none"
                    />
                  ) : (
                    <p className="rounded-lg bg-white px-4 py-3 text-base font-semibold text-gray-800">
                      {profile.name}
                    </p>
                  )}
                </div>

                {/* Email (readonly) */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#1f3f8f]">Email</label>
                  <p className="rounded-lg bg-gray-100 px-4 py-3 text-base font-semibold text-gray-600">
                    {profile.email}
                  </p>
                </div>

                {/* Role (readonly) */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#1f3f8f]">Vai trò</label>
                  <p className="rounded-lg bg-gray-100 px-4 py-3 text-base font-semibold text-gray-600">
                    {profile.role === 'STUDENT' ? '🎓 Học sinh' : profile.role === 'TEACHER' ? '👨‍🏫 Giáo viên' : profile.role}
                  </p>
                </div>

                {/* Member Since */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#1f3f8f]">Tham gia từ</label>
                  <p className="rounded-lg bg-gray-100 px-4 py-3 text-base font-semibold text-gray-600">
                    {new Date(profile.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>

                {/* Action Buttons */}
                {editing && (
                  <div className="flex gap-3">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex-1"
                    >
                      {saving ? 'Đang lưu...' : '✓ Lưu thay đổi'}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setEditing(false)
                        setName(profile.name)
                        setMessage('')
                      }}
                      className="flex-1"
                    >
                      Hủy
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}
