import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLibraryShelf } from '../../hooks/useLibraryShelf'
import ShelfHeader from '../../components/library/ShelfHeader'
import ShelfRow from '../../components/library/ShelfRow'

export default function LibraryShelf() {
  const [searchQuery, setSearchQuery] = useState('')
  
  // 👇 Hook luôn load TẤT CẢ sách (không có search query)
  const { categories, loading, error } = useLibraryShelf('') // Empty string = load all
  
  const navigate = useNavigate()

  const handleTextAction = (textId: string, action: 'reading' | 'integrated') => {
    navigate(`/library/${textId}?mode=${action}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-300 via-teal-400 to-teal-600">
      {/* Header - search chỉ cho dropdown */}
      <ShelfHeader 
        searchValue={searchQuery} 
        onSearchChange={setSearchQuery}
        categories={categories} // 👈 Truyền full categories (không filter)
      />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title Card */}
        {/* <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            TÊN CÁC VĂN BẢN + DẠNG BÀI TẬP
          </h1>
          <p className="text-gray-600">
            VD: "Bạch tuộc" – Đọc hiểu =&gt; HS ấn vào sẽ hiện lên Bài tập đọc hiểu "Bạch tuộc" luôn
          </p>
        </div> */}

        {/* Loading state */}
        {loading && categories.length === 0 && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Shelves - LUÔN HIỂN THỊ TẤT CẢ */}
        {!loading && !error && categories.length === 0 && (
          <div className="text-center py-20 text-white text-lg">
            Không tìm thấy danh mục nào.
          </div>
        )}

        {categories.map((category) => (
          <ShelfRow 
            key={category.id} 
            category={category} 
            onTextAction={handleTextAction} 
          />
        ))}
      </div>
    </div>
  )
}