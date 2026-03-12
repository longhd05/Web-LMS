import { useState } from 'react'
import { Link } from 'react-router-dom'
import AvatarDropdownSimple from './AvatarDropdownSimple'
import NotificationBell from '../../NotificationBell'
import { useAuth } from '../../../contexts/AuthContext'

const thuVienLogo = new URL('../../../img/1x/logo-thu-vien.png', import.meta.url).href
const MAX_SEARCH_LENGTH = 120

export default function CongDongTopNavBar() {
  const [search, setSearch] = useState('')
  const { user } = useAuth()

  return (
    <header className="relative z-30 bg-[linear-gradient(180deg,#153177_0%,#1f849a_100%)] px-4 py-4 sm:px-6 lg:px-8">
      {/* Top border line */}
      <div className="absolute left-0 right-0 top-1 h-[2px] bg-[#1297b0]" />
      <div className="absolute left-0 right-0 bottom-1 h-[2px] bg-[#1297b0]" />
      
      <div className="mx-auto flex max-w-7xl items-center gap-4">
        {/* Left: Logo */}
        <Link 
          to="/student/dashboard" 
          className="flex items-center gap-3 text-white transition-opacity hover:opacity-90"
        >
          <img src={thuVienLogo} alt="Logo" className="h-12 w-12 object-contain sm:h-15 sm:w-15" />
          <div className="hidden sm:block">
            <p className="text-base font-black tracking-wide sm:text-lg md:text-xl">
              Thư Viện Khoa Học Viễn Tưởng
            </p>
          </div>
        </Link>
        
        {/* Center: Search Bar */}
        <div className="hidden flex-1 justify-center md:flex">
          <div className="flex w-full max-w-2xl items-center gap-2 rounded-full bg-white px-4 py-2 text-gray-500">
            <svg className="h-5 w-5 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              maxLength={MAX_SEARCH_LENGTH}
              placeholder='Tìm kiếm bài tập, lớp học... (VD: "Bạch tuộc")'
              className="w-full bg-transparent text-sm italic text-gray-600 placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        </div>
        
        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <NotificationBell role={user?.role ?? 'STUDENT'} />
          <AvatarDropdownSimple />
        </div>
      </div>
    </header>
  )
}
