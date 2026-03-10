import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'

export default function AvatarDropdown() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/dang-nhap')
  }

  if (!user) return null

  const initials = user.name.charAt(0).toUpperCase()

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-[#1f3f8f] to-[#149fb3] text-white font-bold text-lg transition-all hover:scale-105"
      >
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name} className="h-full w-full rounded-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-cyan-200 bg-white shadow-lg z-50">
          <div className="p-4 border-b border-cyan-200">
            <p className="font-bold text-[#1f3f8f] truncate">{user.name}</p>
            <p className="text-sm text-gray-600 truncate">{user.email}</p>
          </div>
          
          <div className="py-2">
            <button
              onClick={() => {
                navigate('/student/profile')
                setIsOpen(false)
              }}
              className="w-full px-4 py-2 text-left text-[#1f3f8f] font-semibold hover:bg-cyan-50 transition"
            >
              Thông tin cá nhân
            </button>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-red-600 font-semibold hover:bg-red-50 transition"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
