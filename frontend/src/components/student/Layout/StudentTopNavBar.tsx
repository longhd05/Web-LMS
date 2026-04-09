import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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
  const classTargetPath = user?.role === 'TEACHER' ? '/giao-vien' : user?.role === 'STUDENT' ? '/hoc-sinh/trang-chu' : '/dang-nhap'

  const [greetingOpen, setGreetingOpen] = useState(false)
  const greetingRef = useRef<HTMLDivElement | null>(null)
  const greetingButtonRef = useRef<HTMLButtonElement | null>(null)
  const [greetingPos, setGreetingPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 })

  // Close greeting dropdown on outside click
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

  // Position greeting dropdown below the button
  useEffect(() => {
    if (!greetingOpen) return
    const update = () => {
      if (!greetingButtonRef.current) return
      const rect = greetingButtonRef.current.getBoundingClientRect()
      setGreetingPos({ top: rect.bottom + 6, left: rect.left })
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [greetingOpen])

  const handleLogout = async () => {
    await logout()
    navigate('/dang-nhap')
  }

  const greetingDropdownNode = greetingOpen ? (
    <div
      ref={greetingRef}
      style={{ top: greetingPos.top, left: greetingPos.left }}
      className="fixed z-[9999] min-w-[130px] rounded-xl border border-cyan-200 bg-white p-1 shadow-lg"
    >
      <button
        onClick={handleLogout}
        className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-blue-900 hover:bg-blue-50"
      >
        Đăng xuất
      </button>
    </div>
  ) : null

  return (
    <header className="relative sticky top-0 z-[200] bg-[linear-gradient(180deg,#153177_0%,#1f849a_100%)] py-2 shadow-sm">
      <div className="absolute left-0 right-0 top-1 h-[2px] bg-[#1297b0]" />
      <div className="absolute left-0 right-0 bottom-1 h-[2px] bg-[#1297b0]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Left: Logo */}
          <Link to="/trang-chu" className="flex items-center gap-2 text-white transition-opacity hover:opacity-90">
            <img src={thuVienLogo} alt="Logo" className="h-10 w-10 object-contain sm:h-12 sm:w-12" />
            <div className="hidden sm:block">
              <p className="text-base font-bold uppercase tracking-wide text-white/95">
                Thư viện khoa học viễn tưởng
              </p>
            </div>
          </Link>

          {/* Center: Search Bar */}
          <div className="hidden flex-1 justify-start md:flex">
            <div className="flex w-full max-w-[520px] items-center gap-2 rounded-full bg-white px-4 py-2 text-gray-500">
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
          <div className="relative flex items-center gap-2">
            <Link
              to={classTargetPath}
              className="rounded-lg border border-white/50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white/95 transition-colors hover:bg-white/10"
            >
              Lớp học
            </Link>
            {user && (
              <button
                ref={greetingButtonRef}
                onClick={() => setGreetingOpen((v) => !v)}
                className="hidden text-l font-semibold uppercase tracking-wide text-white/95 hover:text-white sm:block"
              >
                Xin chào, {user.name}
              </button>
            )}
            <NotificationBell role="STUDENT" theme="teacher" />
            <AvatarDropdown />
          </div>
        </div>
      </div>
      {greetingOpen && createPortal(greetingDropdownNode, document.body)}
    </header>
  )
}
