import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import AvatarDropdown from './AvatarDropdown'
import NotificationBell from '../../NotificationBell'

const thuVienLogo = new URL('../../../img/1x/logo-thu-vien.png', import.meta.url).href
const MAX_SEARCH_LENGTH = 120

export default function StudentTopNavBar() {
  const [search, setSearch] = useState('')
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [greetingOpen, setGreetingOpen] = useState(false)
  const greetingRef = useRef<HTMLDivElement | null>(null)
  const greetingButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!greetingOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const isInsideButton = greetingButtonRef.current?.contains(target)
      const isInsideDropdown = greetingRef.current?.contains(target)
      if (!isInsideButton && !isInsideDropdown) {
        setGreetingOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [greetingOpen])

  const handleLogout = async () => {
    await logout()
    navigate('/dang-nhap')
  }

  return (
    <header className="relative z-30 bg-[linear-gradient(180deg,#153177_0%,#1f849a_100%)] px-4 py-3 sm:px-6 lg:px-8">
      {/* Top border line */}
      <div className="absolute left-0 right-0 top-0 h-[3px] bg-[#4dd9c0]" />
      <div className="absolute left-0 right-0 bottom-0 h-[3px] bg-[#4dd9c0]" />
      
      <div className="mx-auto flex max-w-7xl items-center gap-4">
        {/* Left: Logo */}
        <Link 
          to="/trang-chu" 
          className="flex items-center gap-3 text-white transition-opacity hover:opacity-90"
        >
          <img src={thuVienLogo} alt="Logo" className="h-10 w-10 object-contain sm:h-12 sm:w-12" />
          <div className="hidden sm:block">
            <p className="text-sm font-black uppercase tracking-wide sm:text-base">
              Thế Giới Khoa Học Viễn Tưởng
            </p>
          </div>
        </Link>
        
        {/* Center: Search Bar */}
        <div className="hidden flex-1 justify-center md:flex">
          <div className="flex w-full max-w-xl items-center gap-2 rounded-full bg-white px-4 py-2 text-gray-500">
            <svg className="h-5 w-5 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              maxLength={MAX_SEARCH_LENGTH}
              placeholder='Nhập tên văn bản + Dạng bài tập (VD: "Bạch tuộc" - Đọc hiểu...)'
              className="w-full bg-transparent text-sm italic text-gray-600 placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        </div>
        
        {/* Right: Greeting + Actions */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="relative hidden sm:block">
              <button
                ref={greetingButtonRef}
                onClick={() => setGreetingOpen((v) => !v)}
                className="text-sm font-semibold uppercase tracking-wide text-white hover:text-white/80"
              >
                Xin chào, {user.name}
              </button>
              {greetingOpen && (
                <div
                  ref={greetingRef}
                  className="absolute left-0 top-full mt-2 min-w-[130px] rounded-xl border border-cyan-200 bg-white p-1 shadow-lg z-50"
                >
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-blue-900 hover:bg-blue-50"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          )}
          <NotificationBell role="STUDENT" />
          <AvatarDropdown />
        </div>
      </div>
    </header>
  )
}
