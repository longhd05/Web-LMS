import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { useAuth } from '../contexts/AuthContext'
import NotificationBell from './NotificationBell'
import logoThuVien from '../img/1x/logo-thu-vien.png'
import api from '../api/axios'

export default function Header() {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [teacherSearch, setTeacherSearch] = useState('')

  // Greeting dropdown (logout)
  const [greetingOpen, setGreetingOpen] = useState(false)
  const greetingRef = useRef<HTMLDivElement | null>(null)
  const greetingButtonRef = useRef<HTMLButtonElement | null>(null)
  const [greetingPos, setGreetingPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 })

  // Avatar popup (change avatar)
  const [avatarModalOpen, setAvatarModalOpen] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const MAX_TEACHER_SEARCH_LENGTH = 120

  const isTeacher = (user?.role ?? '').toUpperCase() === 'TEACHER'

  const handleLogout = async () => {
    await logout()
    navigate('/trang-chu')
  }

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

  // Reset avatar modal state when it closes and revoke object URL
  useEffect(() => {
    if (!avatarModalOpen) {
      if (avatarPreview && avatarPreview !== '') {
        URL.revokeObjectURL(avatarPreview)
      }
      setAvatarFile(null)
      setAvatarPreview(null)
    }
  }, [avatarModalOpen])

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
        // Remove avatar
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
      setAvatarModalOpen(false)
    } catch {
      // ignore
    } finally {
      setUploading(false)
    }
  }

  const currentAvatarDisplay = avatarPreview === ''
    ? null
    : avatarPreview
      ? avatarPreview
      : user?.avatarUrl ?? null

  const avatarSrc = user?.avatarUrl
    ? `${user.avatarUrl}${user.avatarUrl.includes('?') ? '&' : '?'}v=${user.avatarVersion ?? 0}`
    : null

  const greetingDropdownNode = greetingOpen ? (
    <div
      ref={greetingRef}
      style={{ top: greetingPos.top, left: greetingPos.left }}
      className="fixed z-[9999] min-w-[130px] rounded-xl border border-white/30 bg-white p-1 shadow-lg"
    >
      <button onClick={handleLogout} className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-blue-900 hover:bg-blue-50">
        Đăng xuất
      </button>
    </div>
  ) : null

  const avatarModalNode = avatarModalOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40" onClick={() => setAvatarModalOpen(false)}>
      <div
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
              <span className="text-3xl font-bold text-white">{user?.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>
        </div>

        {/* Actions */}
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

        {/* Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setAvatarModalOpen(false)}
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
  ) : null

  return (
    <header
      className={
        isTeacher
          ? 'relative sticky top-0 z-[200] bg-[linear-gradient(180deg,#153177_0%,#1f849a_100%)] shadow-sm py-2'
          : 'sticky top-0 z-[200] border-b border-gray-200 bg-white shadow-sm'
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
          <Link to="/trang-chu" className="flex items-center gap-2">
            <img src={logoThuVien} alt="Logo thư viện" className="h-12 w-12 object-contain" />
            <span
              className={
                isTeacher
                  ? 'hidden text-l font-bold uppercase tracking-wide text-white/95 sm:block'
                  : 'hidden text-base font-bold text-gray-900 sm:block'
              }
            >
              Thế Giới Khoa Học Viễn Tưởng
            </span>
          </Link>

          {isTeacher && (
            <div className="hidden flex-1 justify-start md:flex">
              <div className="flex w-full max-w-[520px] items-center gap-2 rounded-full bg-white px-4 py-2 text-gray-500">
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
              <Link to="/thu-vien-xanh" className="font-medium text-gray-600 transition-colors hover:text-green-600">Thư viện</Link>
              <Link to="/cong-dong/hiep-si-xanh" className="font-medium text-gray-600 transition-colors hover:text-green-600">Cộng đồng</Link>
              {user?.role === 'STUDENT' && (
                <>
                  <Link to="/hoc-sinh/trang-chu" className="font-medium text-gray-600 transition-colors hover:text-green-600">Lớp học</Link>
                  <Link to="/hoc-sinh/bai-nop" className="font-medium text-gray-600 transition-colors hover:text-green-600">Bài đã nộp</Link>
                </>
              )}
              {isTeacher && (
                <Link to="/giao-vien/trang-chu" className="font-medium text-gray-600 transition-colors hover:text-green-600">Lớp học</Link>
              )}
            </nav>
          )}

          <div className="relative flex items-center gap-2">
            {!user ? (
              <>
                <Link to="/dang-nhap" className="hidden text-sm font-medium text-gray-700 transition-colors hover:text-green-600 sm:block">Đăng nhập</Link>
                <Link to="/dang-ky" className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700">Đăng ký</Link>
              </>
            ) : (
              <>
                {isTeacher && (
                  <button
                    ref={greetingButtonRef}
                    onClick={() => setGreetingOpen((v) => !v)}
                    className="hidden text-xs font-semibold uppercase tracking-wide text-white/95 hover:text-white sm:block"
                  >
                    Xin chào, {user.name}
                  </button>
                )}
                <NotificationBell role={user.role} theme={isTeacher ? 'teacher' : 'default'} />
                <button
                  onClick={() => setAvatarModalOpen(true)}
                  className={
                    isTeacher
                      ? 'relative flex h-9 w-9 items-center justify-center rounded-full border border-white/70 text-white overflow-hidden'
                      : 'relative flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-600 overflow-hidden'
                  }
                  aria-label="Đổi ảnh đại diện"
                >
                  {avatarSrc ? (
                    <img src={avatarSrc} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
                    </svg>
                  )}
                </button>
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
            <Link to="/thu-vien-xanh" onClick={() => setMenuOpen(false)} className={isTeacher ? 'px-2 py-1.5 text-white/90' : 'px-2 py-1.5 text-gray-700 hover:text-green-600'}>Thư viện</Link>
            <Link to="/cong-dong/hiep-si-xanh" onClick={() => setMenuOpen(false)} className={isTeacher ? 'px-2 py-1.5 text-white/90' : 'px-2 py-1.5 text-gray-700 hover:text-green-600'}>Cộng đồng</Link>
            {user?.role === 'STUDENT' && (
              <>
                <Link to="/hoc-sinh/trang-chu" onClick={() => setMenuOpen(false)} className={isTeacher ? 'px-2 py-1.5 text-white/90' : 'px-2 py-1.5 text-gray-700 hover:text-green-600'}>Lớp học</Link>
                <Link to="/hoc-sinh/bai-nop" onClick={() => setMenuOpen(false)} className={isTeacher ? 'px-2 py-1.5 text-white/90' : 'px-2 py-1.5 text-gray-700 hover:text-green-600'}>Bài đã nộp</Link>
              </>
            )}
            {isTeacher && (
              <Link to="/giao-vien/trang-chu" onClick={() => setMenuOpen(false)} className={isTeacher ? 'px-2 py-1.5 text-white/90' : 'px-2 py-1.5 text-gray-700 hover:text-green-600'}>Lớp học</Link>
            )}
            {!user && (
              <>
                <Link to="/dang-nhap" onClick={() => setMenuOpen(false)} className={isTeacher ? 'px-2 py-1.5 text-white/90' : 'px-2 py-1.5 text-gray-700 hover:text-green-600'}>Đăng nhập</Link>
                <Link to="/dang-ky" onClick={() => setMenuOpen(false)} className={isTeacher ? 'px-2 py-1.5 text-white/90' : 'px-2 py-1.5 text-gray-700 hover:text-green-600'}>Đăng ký</Link>
              </>
            )}
            {user && (
              <button onClick={handleLogout} className={isTeacher ? 'px-2 py-1.5 text-left text-white/90' : 'px-2 py-1.5 text-left text-gray-700 hover:text-green-600'}>
                Đăng xuất
              </button>
            )}
          </div>
        )}
      </div>
      {greetingOpen && createPortal(greetingDropdownNode, document.body)}
      {avatarModalOpen && createPortal(avatarModalNode, document.body)}
    </header>
  )
}
