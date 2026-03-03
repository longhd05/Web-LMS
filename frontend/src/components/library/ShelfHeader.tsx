import { useAuth } from '../../contexts/AuthContext'
import { Bell, User } from 'lucide-react'
import SearchBarWithDropdown from './SearchBarWithDropdown'
import { useNavigate } from 'react-router-dom'
import { CategoryWithTexts } from '../../types/libraryShelf'

interface ShelfHeaderProps {
  searchValue: string
  onSearchChange: (value: string) => void
  categories?: CategoryWithTexts[] // 👈 Thêm prop
}

export default function ShelfHeader({ 
  searchValue, 
  onSearchChange,
  categories = [] // 👈 Default empty array
}: ShelfHeaderProps) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleSelectText = (textId: string) => {
    navigate(`/library/${textId}?mode=reading`)
  }

  return (
    <div className="bg-gradient-to-r from-teal-400 to-teal-700 border-b border-teal-600 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4 py-4">
          {/* Logo + Title */}
          <div className="flex items-center gap-3 min-w-[200px]">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
              <span className="text-teal-600 font-bold text-lg">📚</span>
            </div>
            <span className="font-bold text-lg text-white hidden lg:block whitespace-nowrap">
              Thư viện khoa học viễn tưởng
            </span>
          </div>

          {/* Search Bar with Dropdown */}
          <div className="flex-1 max-w-2xl">
            <SearchBarWithDropdown
              value={searchValue}
              onChange={onSearchChange}
              placeholder="Nhập tên tác phẩm bạn cần..."
              onSelectText={handleSelectText}
              categories={categories} // 👈 Truyền categories từ parent
            />
          </div>

          {/* Right: User info */}
          <div className="flex items-center gap-3 min-w-[200px] justify-end">
            <span className="text-white text-sm font-medium hidden md:block">
              Xin chào, {user?.name || 'tên'}
            </span>
            <button className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors">
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}