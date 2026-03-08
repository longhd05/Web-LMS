import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logoThuVien from '../img/1x/logo-thu-vien.png'
import hinhNen from '../img/1x/hinh-nen.png'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/trang-chu')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(msg ?? 'Đăng nhập thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-center bg-cover bg-no-repeat flex flex-col"
      style={{ backgroundImage: `url(${hinhNen})` }}
    >
      {/* Header without search */}
      <header className="relative z-30 bg-[linear-gradient(180deg,#153177_0%,#1f849a_100%)] px-4 py-4 sm:px-6 lg:px-8">
        <div className="absolute left-0 right-0 top-1 h-[2px] bg-[#1297b0]" />
        <div className="absolute left-0 right-0 bottom-1 h-[2px] bg-[#1297b0]" />
        <div className="mx-auto flex max-w-7xl items-center">
          <Link to="/trang-chu" className="flex items-center gap-3 text-white transition-opacity hover:opacity-90">
            <img src={logoThuVien} alt="Logo" className="h-12 w-12 object-contain" />
            <div className="hidden sm:block">
              <p className="text-base font-black tracking-wide sm:text-lg md:text-xl">
                Thư Viện Khoa Học Viễn Tưởng
              </p>
            </div>
          </Link>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg">VTX</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Đăng nhập</h1>
            <p className="text-gray-500 mt-1">Chào mừng trở lại Viễn Tưởng Xanh</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="email@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Chưa có tài khoản?{' '}
            <Link to="/dang-ky" className="text-green-600 font-medium hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
