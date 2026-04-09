import { type FormEvent, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { type ThuVienXanhMode } from '../../types/thuVienXanh'
import thuVienLogo from '../../img/1x/logo-thu-vien.png'
import { useAuth } from '../../contexts/AuthContext'
import NotificationBell from '../NotificationBell'

export interface ThuVienXanhSearchResult {
  itemId: string
  title: string
  imageUrl?: string | null
  options: Array<{
    mode: ThuVienXanhMode
    label: string
  }>
}

interface TopNavBarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  onSearchSubmit: () => void
  searchResults?: ThuVienXanhSearchResult[]
  onSelectSearchResult?: (result: { itemId: string; mode: ThuVienXanhMode; imageUrl?: string | null }) => void
  loadingResults?: boolean
}

export default function TopNavBar({
  searchValue,
  onSearchChange,
  onSearchSubmit,
  searchResults = [],
  onSelectSearchResult,
  loadingResults = false,
}: TopNavBarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const classTargetPath = user?.role === 'TEACHER' ? '/giao-vien' : user?.role === 'STUDENT' ? '/hoc-sinh' : '/dang-nhap'
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const [isAvatarOpen, setIsAvatarOpen] = useState(false)
  const avatarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
      if (avatarRef.current && !avatarRef.current.contains(event.target as Node)) {
        setIsAvatarOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/dang-nhap')
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSearchSubmit()
    if (searchValue.trim()) {
      setIsOpen(true)
    }
  }

  const shouldShowResults = isOpen && searchValue.trim().length > 0

  return (
    <header className="relative z-30 bg-[linear-gradient(180deg,#153177_0%,#1f849a_100%)] px-4 sm:px-6 lg:px-8 py-4">
      <div className="absolute left-0 right-0 top-1 h-[2px] bg-[#1297b0]" />
      <div className="absolute left-0 right-0 bottom-1 h-[2px] bg-[#1297b0]" />
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        <Link to="/trang-chu" className="min-w-0 flex items-center gap-3 text-white hover:opacity-90 transition-opacity">
          <img src={thuVienLogo} alt="Thư viện" className="w-15 h-15 object-contain" />
          <p className="text-sm sm:text-base md:text-lg font-black tracking-wide">THƯ VIỆN KHOA HỌC VIỄN TƯỞNG</p>
        </Link>

        <form className="flex-1 flex justify-center" onSubmit={handleSubmit}>
          <div ref={wrapperRef} className="w-full max-w-3xl relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3-3" />
              </svg>
            </span>
            <input
              value={searchValue}
              onFocus={() => {
                if (searchValue.trim()) setIsOpen(true)
              }}
              onChange={(event) => {
                onSearchChange(event.target.value)
                setIsOpen(true)
              }}
              placeholder="Nhập tên văn bản + Dạng bài tập (VD: “Bạch tuộc” - Đọc hiểu...)"
              className="w-full h-12 rounded-full bg-white pl-12 pr-4 text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-teal-400"
            />

            {shouldShowResults && (
              <div className="absolute top-[calc(100%+8px)] left-0 right-0 rounded-2xl border border-cyan-200 bg-white shadow-lg z-[70] max-h-80 overflow-y-auto">
                {loadingResults ? (
                  <div className="px-4 py-3 text-sm text-slate-500">Đang tìm kiếm...</div>
                ) : searchResults.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-slate-500">Không có kết quả phù hợp.</div>
                ) : (
                  <ul className="py-2">
                    {searchResults.map((result) => (
                      <li key={result.itemId} className="px-3 py-2 hover:bg-cyan-50">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-slate-800 truncate">{result.title}</p>
                          <div className="flex items-center gap-2 shrink-0">
                            {result.options.map((option) => (
                              <button
                                key={`${result.itemId}-${option.mode}`}
                                type="button"
                                onClick={() => {
                                  onSelectSearchResult?.({
                                    itemId: result.itemId,
                                    mode: option.mode,
                                    imageUrl: result.imageUrl,
                                  })
                                  setIsOpen(false)
                                }}
                                className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                  option.mode === 'doc-hieu'
                                    ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                                    : 'border-sky-300 text-sky-700 bg-sky-50'
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </form>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to={classTargetPath}
            className="hidden md:block text-lg font-semibold text-white rounded-full transition-all duration-300"
            style={{
              background: 'transparent',
              padding: '6px 18px',
              letterSpacing: '0.03em',
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background = 'transparent'
            }}
          >
            LỚP HỌC
          </Link>
          {user && (
            <span className="hidden sm:block text-sm font-bold uppercase tracking-wide text-white whitespace-nowrap">
              Xin chào, {user.name}
            </span>
          )}
          {user && <NotificationBell role={user.role} />}
          {user && (
            <div className="relative" ref={avatarRef}>
              <button
                onClick={() => setIsAvatarOpen(!isAvatarOpen)}
                aria-label="User menu"
                aria-expanded={isAvatarOpen}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white font-bold text-sm transition-all hover:scale-105 hover:bg-white/30"
              >
                {user.avatarUrl ? (
                  <img
                    src={`${user.avatarUrl}${user.avatarUrl.includes('?') ? '&' : '?'}v=${user.avatarVersion ?? 0}`}
                    alt={user.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span>{user.name.charAt(0).toUpperCase()}</span>
                )}
              </button>
              {isAvatarOpen && (
                <div className="absolute right-0 top-full mt-2 w-40 rounded-2xl border border-cyan-200 bg-white shadow-lg z-50" role="menu">
                  <div className="py-2">
                    <button
                      onClick={handleLogout}
                      role="menuitem"
                      className="w-full px-4 py-2 text-left text-red-600 font-semibold hover:bg-red-50 transition"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
