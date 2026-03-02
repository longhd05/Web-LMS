import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import NotificationBell from './NotificationBell'
import { useState } from 'react'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">VTX</span>
            </div>
            <span className="font-bold text-lg text-gray-900 hidden sm:block">Viễn Tưởng Xanh</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/library" className="text-gray-600 hover:text-green-600 font-medium transition-colors">
              Thư viện
            </Link>
            <Link to="/community" className="text-gray-600 hover:text-green-600 font-medium transition-colors">
              Cộng đồng
            </Link>
            {user?.role === 'STUDENT' && (
              <>
                <Link to="/student/dashboard" className="text-gray-600 hover:text-green-600 font-medium transition-colors">
                  Lớp học
                </Link>
                <Link to="/student/submissions" className="text-gray-600 hover:text-green-600 font-medium transition-colors">
                  Bài đã nộp
                </Link>
              </>
            )}
            {user?.role === 'TEACHER' && (
              <Link to="/teacher/dashboard" className="text-gray-600 hover:text-green-600 font-medium transition-colors">
                Lớp học
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors hidden sm:block"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Đăng ký
                </Link>
              </>
            ) : (
              <>
                <NotificationBell role={user.role} />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-gray-500 hover:text-red-500 transition-colors"
                  >
                    Đăng xuất
                  </button>
                </div>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden p-2 text-gray-600 hover:text-green-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-3 border-t border-gray-100 mt-2 pt-3 flex flex-col gap-2">
            <Link to="/library" onClick={() => setMenuOpen(false)} className="px-2 py-1.5 text-gray-700 hover:text-green-600">Thư viện</Link>
            <Link to="/community" onClick={() => setMenuOpen(false)} className="px-2 py-1.5 text-gray-700 hover:text-green-600">Cộng đồng</Link>
            {user?.role === 'STUDENT' && (
              <>
                <Link to="/student/dashboard" onClick={() => setMenuOpen(false)} className="px-2 py-1.5 text-gray-700 hover:text-green-600">Lớp học</Link>
                <Link to="/student/submissions" onClick={() => setMenuOpen(false)} className="px-2 py-1.5 text-gray-700 hover:text-green-600">Bài đã nộp</Link>
              </>
            )}
            {user?.role === 'TEACHER' && (
              <Link to="/teacher/dashboard" onClick={() => setMenuOpen(false)} className="px-2 py-1.5 text-gray-700 hover:text-green-600">Lớp học</Link>
            )}
            {!user && (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="px-2 py-1.5 text-gray-700 hover:text-green-600">Đăng nhập</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="px-2 py-1.5 text-gray-700 hover:text-green-600">Đăng ký</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
