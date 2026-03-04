import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import NotificationBell from './NotificationBell'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [teacherSearch, setTeacherSearch] = useState('')
  const profileMenuRef = useRef<HTMLDivElement | null>(null)
  const MAX_TEACHER_SEARCH_LENGTH = 120

  const isTeacher = (user?.role ?? '').toUpperCase() === 'TEACHER'

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  useEffect(() => {
    if (!profileOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (!profileMenuRef.current) return
      if (!profileMenuRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [profileOpen])

  useEffect(() => {
    setProfileOpen(false)
  }, [user?.id])

  return (
    <header
      className={
        isTeacher
          ? 'relative sticky top-0 z-0 bg-[linear-gradient(180deg,#153177_0%,#1f849a_100%)] shadow-sm'
          : 'sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm'
      }
    >
      {isTeacher && (
        <>
          <div className="absolute left-0 right-0 top-1 h-[2px] bg-[#1297b0]" />
          <div className="absolute left-0 right-0 bottom-1 h-[2px] bg-[#1297b0]" />
        </>
      )}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div
              className={
                isTeacher
                  ? 'flex h-8 w-8 items-center justify-center rounded-lg border border-white/40 bg-white/15'
                  : 'flex h-8 w-8 items-center justify-center rounded-lg bg-green-600'
              }
            >
              <span className="text-sm font-bold text-white">VTX</span>
            </div>
            <span
              className={
                isTeacher
                  ? 'hidden text-sm font-bold uppercase tracking-wide text-white/95 sm:block'
                  : 'hidden text-lg font-bold text-gray-900 sm:block'
              }
            >
              Thế Giới Khoa Học Viễn Tưởng
            </span>
          </Link>

          {isTeacher && (
            <div className="hidden flex-1 justify-center md:flex">
              <div className="flex w-full max-w-2xl items-center gap-2 rounded-full bg-white px-4 py-2 text-gray-500">
                <svg className="h-5 w-5 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={teacherSearch}
                  onChange={(e) => setTeacherSearch(e.target.value)}
                  maxLength={MAX_TEACHER_SEARCH_LENGTH}
                  placeholder='Nhập tên văn bản + Đăng bài tập (VD: "Bạch tuộc" - Đọc hiểu...)'
                  className="w-full bg-transparent text-sm italic text-gray-600 placeholder:text-gray-400 focus:outline-none"
                />
              </div>
            </div>
          )}

          {!isTeacher && (
            <nav className="hidden items-center gap-6 md:flex">
              <Link to="/library" className="font-medium text-gray-600 transition-colors hover:text-green-600">Thư viện</Link>
              <Link to="/community" className="font-medium text-gray-600 transition-colors hover:text-green-600">Cộng đồng</Link>
              {user?.role === 'STUDENT' && (
                <>
                  <Link to="/student/dashboard" className="font-medium text-gray-600 transition-colors hover:text-green-600">Lớp học</Link>
                  <Link to="/student/submissions" className="font-medium text-gray-600 transition-colors hover:text-green-600">Bài đã nộp</Link>
                </>
              )}
              {isTeacher && (
                <Link to="/teacher/dashboard" className="font-medium text-gray-600 transition-colors hover:text-green-600">Lớp học</Link>
              )}
            </nav>
          )}

          <div className="relative flex items-center gap-2">
            {!user ? (
              <>
                <Link to="/login" className="hidden text-sm font-medium text-gray-700 transition-colors hover:text-green-600 sm:block">Đăng nhập</Link>
                <Link to="/register" className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700">Đăng ký</Link>
              </>
            ) : (
              <>
                {isTeacher && <p className="hidden text-sm font-semibold uppercase tracking-wide text-white/95 sm:block">Xin chào, {user.name}</p>}
                <NotificationBell role={user.role} theme={isTeacher ? 'teacher' : 'default'} />
                <div ref={profileMenuRef}>
                  <button
                    onClick={() => setProfileOpen((v) => !v)}
                    className={
                      isTeacher
                        ? 'flex h-9 w-9 items-center justify-center rounded-full border border-white/70 text-white'
                        : 'flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-600'
                    }
                    aria-label="Tài khoản"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1118.88 17.8M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 top-11 z-50 min-w-[130px] rounded-xl border border-gray-200 bg-white p-1 shadow-lg">
                      <button onClick={handleLogout} className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-blue-900 hover:bg-blue-50">
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            <button
              onClick={() => setMenuOpen((v) => !v)}
              className={isTeacher ? 'p-2 text-white md:hidden' : 'p-2 text-gray-600 hover:text-green-600 md:hidden'}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className={isTeacher ? 'mt-2 flex flex-col gap-2 border-t border-white/20 pb-3 pt-3 md:hidden' : 'mt-2 flex flex-col gap-2 border-t border-gray-100 pb-3 pt-3 md:hidden'}>
            <Link to="/library" onClick={() => setMenuOpen(false)} className={isTeacher ? 'px-2 py-1.5 text-white/90' : 'px-2 py-1.5 text-gray-700 hover:text-green-600'}>Thư viện</Link>
            <Link to="/community" onClick={() => setMenuOpen(false)} className={isTeacher ? 'px-2 py-1.5 text-white/90' : 'px-2 py-1.5 text-gray-700 hover:text-green-600'}>Cộng đồng</Link>
            {user?.role === 'STUDENT' && (
              <>
                <Link to="/student/dashboard" onClick={() => setMenuOpen(false)} className={isTeacher ? 'px-2 py-1.5 text-white/90' : 'px-2 py-1.5 text-gray-700 hover:text-green-600'}>Lớp học</Link>
                <Link to="/student/submissions" onClick={() => setMenuOpen(false)} className={isTeacher ? 'px-2 py-1.5 text-white/90' : 'px-2 py-1.5 text-gray-700 hover:text-green-600'}>Bài đã nộp</Link>
              </>
            )}
            {isTeacher && (
              <Link to="/teacher/dashboard" onClick={() => setMenuOpen(false)} className={isTeacher ? 'px-2 py-1.5 text-white/90' : 'px-2 py-1.5 text-gray-700 hover:text-green-600'}>Lớp học</Link>
            )}
            {!user && (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className={isTeacher ? 'px-2 py-1.5 text-white/90' : 'px-2 py-1.5 text-gray-700 hover:text-green-600'}>Đăng nhập</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className={isTeacher ? 'px-2 py-1.5 text-white/90' : 'px-2 py-1.5 text-gray-700 hover:text-green-600'}>Đăng ký</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}




