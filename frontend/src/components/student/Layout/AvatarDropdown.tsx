import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import api from '../../../api/axios'

export default function AvatarDropdown() {
  const { user, logout, updateUser } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Reset file state when modal closes and revoke object URL
  useEffect(() => {
    if (!isOpen) {
      if (avatarPreview && avatarPreview !== '') {
        URL.revokeObjectURL(avatarPreview)
      }
      setAvatarFile(null)
      setAvatarPreview(null)
    }
  }, [isOpen])

  const handleLogout = async () => {
    await logout()
    navigate('/dang-nhap')
  }

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleRemoveAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview('')
  }

  const handleSaveAvatar = async () => {
    setUploading(true)
    try {
      let newAvatarUrl: string | null = user?.avatarUrl ?? null

      if (avatarPreview === '') {
        await api.put('/auth/profile', { avatarUrl: null })
        newAvatarUrl = null
      } else if (avatarFile) {
        const formData = new FormData()
        formData.append('file', avatarFile)
        const res = await api.post('/files/upload', formData)
        newAvatarUrl = res.data.data.url
        await api.put('/auth/profile', { avatarUrl: newAvatarUrl })
      }

      updateUser({ avatarUrl: newAvatarUrl })
      setIsOpen(false)
    } catch {
      // ignore
    } finally {
      setUploading(false)
    }
  }

  if (!user) return null

  const initials = user.name.charAt(0).toUpperCase()

  const currentAvatarDisplay = avatarPreview === ''
    ? null
    : avatarPreview
      ? avatarPreview
      : user.avatarUrl ?? null

  const avatarSrc = user.avatarUrl
    ? `${user.avatarUrl}${user.avatarUrl.includes('?') ? '&' : '?'}v=${user.avatarVersion ?? 0}`
    : null

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-[#1f3f8f] to-[#149fb3] text-white font-bold text-lg transition-all hover:scale-105 overflow-hidden"
        aria-label="Đổi ảnh đại diện"
      >
        {avatarSrc ? (
          <img src={avatarSrc} alt={user.name} className="h-full w-full rounded-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40" onClick={() => setIsOpen(false)}>
          <div
            ref={dropdownRef}
            className="relative w-[340px] rounded-2xl border-2 border-cyan-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-5 text-center text-lg font-bold uppercase tracking-wider text-[#1f3f8f]">Ảnh Đại Diện</h2>

            {/* Avatar preview */}
            <div className="mb-5 flex justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#1f3f8f] overflow-hidden">
                {currentAvatarDisplay ? (
                  <img src={currentAvatarDisplay} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-white">{initials}</span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="mb-6 flex justify-center gap-4">
              <button
                onClick={handleRemoveAvatar}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Xóa ảnh hiện tại
              </button>
              <label className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Chọn ảnh
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarFileChange} />
              </label>
            </div>

            {/* Footer buttons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full bg-gray-300 px-8 py-2.5 font-bold text-gray-700 hover:bg-gray-400"
              >
                HỦY
              </button>
              <button
                onClick={handleSaveAvatar}
                disabled={uploading}
                className="rounded-full bg-[#1f3f8f] px-8 py-2.5 font-bold text-white hover:bg-[#153177] disabled:opacity-50"
              >
                {uploading ? '...' : 'LƯU'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
