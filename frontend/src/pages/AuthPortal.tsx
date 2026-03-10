import { FormEvent, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { GraduationCap, UserCircle2 } from 'lucide-react'
import TopNavBar from '../components/thu-vien-xanh/TopNavBarNoSearch'
import { useAuth } from '../contexts/AuthContext'

type AuthMode = 'login' | 'register'
type UserRole = 'STUDENT' | 'TEACHER'

const MODE_CONFIG: Record<AuthMode, { title: string; actionLabel: string; loadingLabel: string }> = {
  login: {
    title: 'Đăng nhập',
    actionLabel: 'Đăng nhập',
    loadingLabel: 'Đang đăng nhập...',
  },
  register: {
    title: 'Đăng ký',
    actionLabel: 'Đăng ký',
    loadingLabel: 'Đang đăng ký...',
  },
}

export default function AuthPortal() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login, register } = useAuth()

  const mode = useMemo<AuthMode>(
    () => (location.pathname === '/dang-ky' || location.pathname === '/register' ? 'register' : 'login'),
    [location.pathname],
  )

  const successMessage = (location.state as { successMessage?: string })?.successMessage ?? ''

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('STUDENT')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'login') {
        const userData = await login(email, password, role)
        if (userData.role === 'TEACHER') {
          navigate('/giao-vien/trang-chu')
        } else {
          navigate('/hoc-sinh/trang-chu')
        }
      } else {
        await register(name, email, password, role)
        const roleLabel = role === 'STUDENT' ? 'Học sinh' : 'Giáo viên'
        navigate('/dang-nhap', { state: { successMessage: `${roleLabel} đã đăng ký thành công` } })
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(msg ?? (mode === 'login' ? 'Đăng nhập thất bại. Vui lòng thử lại.' : 'Đăng ký thất bại. Vui lòng thử lại.'))
    } finally {
      setLoading(false)
    }
  }

  const roleButtonClass = (buttonRole: UserRole) =>
    `flex-1 min-w-0 rounded-[30px] border-2 px-4 py-3 text-center transition-all ${
      role === buttonRole
        ? 'border-[#67dc86] bg-[linear-gradient(180deg,#e2f8ef_0%,#d6f6ec_100%)] text-[#16328f] shadow-[0_2px_0_#1f8ea7]'
        : 'border-[#9ed9e9] bg-[#eff9fb] text-[#31558f] hover:border-[#67dc86]'
    }`

  return (
    <div className="min-h-screen bg-[url('/src/img/1x/hinh-nen.png')] bg-cover bg-center relative overflow-hidden">
      <div className="absolute right-[-120px] top-[35%] h-[450px] w-[450px] rounded-full bg-[rgba(174,241,225,0.35)] blur-3xl" />

      <div className="relative z-10">
        <TopNavBar searchValue="" onSearchChange={() => undefined} onSearchSubmit={() => undefined} searchResults={[]} />

        <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-10 lg:pt-16">
          <div className="flex items-start gap-8">
          <button
            type="button"
            onClick={() => navigate('/trang-chu')}
            className="mt-6 hidden h-16 w-16 shrink-0 items-center justify-center rounded-xl text-white transition hover:scale-105 md:flex"
            aria-label="Quay lại"
          >
            <img
              src="/src/img/SVG/back-button.svg"
              alt="Back"
              className="h-20 w-20 object-contain scale-125"
            />
          </button>

            <div className="mx-auto w-full max-w-3xl rounded-[36px] border-2 border-[#7ddca0] bg-[rgba(244,249,248,0.92)] p-6 shadow-[0_0_0_2px_#1f629b] sm:p-9">
              <div className="mx-auto mb-8 flex w-full max-w-xl rounded-full border-2 border-[#7ddca0] bg-[#e8f4f2] p-1.5">
                <Link
                  to="/dang-nhap"
                  className={`w-1/2 rounded-full px-4 py-3 text-center text-xl font-bold transition  ${
                    mode === 'login'
                      ? 'bg-[linear-gradient(180deg,#1f347f_0%,#1c85a2_100%)] text-white shadow-[inset_0_2px_0_#74d8c8]'
                      : 'text-[#1f347f] hover:bg-[#d8efea]'
                  }`}
                >
                  <span className="relative -top-[2px]">Đăng nhập</span>
                </Link>
                <Link
                  to="/dang-ky"
                  className={`w-1/2 rounded-full px-4 py-3 text-center text-xl font-bold transition ${
                    mode === 'register'
                      ? 'bg-[linear-gradient(180deg,#1f347f_0%,#1c85a2_100%)] text-white shadow-[inset_0_2px_0_#74d8c8]'
                      : 'text-[#1f347f] hover:bg-[#d8efea]'
                  }`}
                >
                  <span className="relative -top-[2px]">Đăng ký</span>
                </Link>
              </div>

              {successMessage && mode === 'login' && (
                <p className="mb-4 rounded-xl bg-green-100 px-4 py-3 text-sm text-green-700">{successMessage}</p>
              )}

              {error && <p className="mb-4 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-700">{error}</p>}

              <form onSubmit={handleSubmit} className="space-y-6 text-[#192f85]">
                {mode === 'register' && (
                  <div>
                    <label className="mb-2 block text-[40px] leading-none sm:text-[30px]">Bạn tên là</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="h-14 w-full rounded-full bg-[#c8e7ec] px-6 text-xl text-[#11337e] outline-none focus:ring-2 focus:ring-[#1c85a2]"
                      placeholder="Nhập họ và tên"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="mb-4 block text-[40px] leading-none sm:text-[30px]">Bạn là</label>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <button type="button" onClick={() => setRole('STUDENT')} className={roleButtonClass('STUDENT')}>
                      <UserCircle2 className="mx-auto mb-2 h-20 w-20" />
                      <p className="text-2xl">Học sinh</p>
                    </button>
                    <button type="button" onClick={() => setRole('TEACHER')} className={roleButtonClass('TEACHER')}>
                      <GraduationCap className="mx-auto mb-2 h-20 w-20" />
                      <p className="text-2xl">Giáo viên</p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[40px] leading-none sm:text-[30px]">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-14 w-full rounded-full bg-[#c8e7ec] px-6 text-xl text-[#11337e] outline-none focus:ring-2 focus:ring-[#1c85a2]"
                    placeholder="Nhập Email"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[40px] leading-none sm:text-[30px]">Mật khẩu</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-14 w-full rounded-full bg-[#c8e7ec] px-6 text-xl text-[#11337e] outline-none focus:ring-2 focus:ring-[#1c85a2]"
                    placeholder="Nhập mật khẩu"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mx-auto block rounded-full border-2 border-[#1e3f97] bg-[linear-gradient(180deg,#1f347f_0%,#1c85a2_100%)] px-6 py-2 text-2xl font-bold text-white shadow-[inset_0_2px_0_#74d8c8] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="relative -top-[2px]">
                    {loading ? MODE_CONFIG[mode].loadingLabel : MODE_CONFIG[mode].actionLabel}
                  </span>
                </button>
              </form>

              <p className="mt-6 text-center text-lg text-[#1f347f]">
                {mode === 'login' ? (
                  <>
                    Chưa có tài khoản?{' '}
                    <Link to="/dang-ky" className="font-bold underline">
                      Đăng ký ngay
                    </Link>
                  </>
                ) : (
                  <>
                    Đã có tài khoản?{' '}
                    <Link to="/dang-nhap" className="font-bold underline">
                      Đăng nhập
                    </Link>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
