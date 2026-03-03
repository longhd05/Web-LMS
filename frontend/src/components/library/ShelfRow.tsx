import { useState } from 'react'
import { CategoryWithTexts } from '../../types/libraryShelf'
import TextCard from './TextCard'
import { ChevronRight, X } from 'lucide-react'

interface ShelfRowProps {
  category: CategoryWithTexts
  onTextAction: (textId: string, action: 'reading' | 'integrated') => void
}

export default function ShelfRow({ category, onTextAction }: ShelfRowProps) {
  const textColor = getContrastColor(category.color)
  const [showModal, setShowModal] = useState(false)
  
  const MAX_VISIBLE = 6
  const hasMore = category.texts.length > MAX_VISIBLE
  const visibleTexts = category.texts.slice(0, MAX_VISIBLE)

  return (
    <>
      <div className="mb-12">
        {/* Shelf container */}
        <div className="flex gap-6">
          {/* Left meta */}
          <div className="flex-shrink-0 w-64 flex flex-col gap-3">
            <div
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-semibold text-sm shadow-md w-fit"
              style={{ backgroundColor: category.color, color: textColor }}
            >
              {category.name}
            </div>
            <div className="text-gray-700 font-medium text-sm">
              {category.textCount} văn bản
            </div>
          </div>

          {/* Right: Bookshelf + "Xem thêm" */}
          <div className="flex-1 flex gap-4 items-end">
            {/* Bookshelf - chiều dài cố định */}
            <div className="flex-1">
              {category.loading && (
                <div className="relative">
                  <div className="flex gap-3 pb-0 items-end">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-56 w-36 bg-gray-200 rounded-t-lg animate-pulse flex-shrink-0"
                      />
                    ))}
                  </div>
                  {/* Shelf */}
                  <div className="h-4 bg-gradient-to-b from-amber-100 via-amber-200 to-amber-300 shadow-md relative -mt-1">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                  </div>
                </div>
              )}

              {category.error && (
                <div className="text-red-600 text-sm">
                  {category.error}{' '}
                  <button className="underline hover:no-underline">Thử lại</button>
                </div>
              )}

              {!category.loading && !category.error && category.texts.length === 0 && (
                <div className="relative">
                  <div className="text-gray-400 text-sm py-16 text-center">
                    Chưa có văn bản
                  </div>
                  {/* Empty shelf */}
                  <div className="h-4 bg-gradient-to-b from-amber-100 via-amber-200 to-amber-300 shadow-md relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                  </div>
                </div>
              )}

              {!category.loading && !category.error && category.texts.length > 0 && (
                <div className="relative">
                  {/* Books - tối đa 6 cuốn */}
                  <div className="flex items-end gap-3 pb-0">
                    {visibleTexts.map((text) => (
                      <TextCard key={text.id} text={text} onAction={onTextAction} />
                    ))}
                    
                    {/* Empty slots nếu ít hơn 6 cuốn */}
                    {visibleTexts.length < MAX_VISIBLE && (
                      <>
                        {Array.from({ length: MAX_VISIBLE - visibleTexts.length }).map((_, i) => (
                          <div key={`empty-${i}`} className="h-56 w-36 flex-shrink-0" />
                        ))}
                      </>
                    )}
                  </div>
                  
                  {/* Wooden shelf - chiều dài cố định */}
                  <div className="h-4 bg-gradient-to-b from-amber-100 via-amber-200 to-amber-300 shadow-md relative -mt-1">
                    {/* Wood grain effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                    {/* Top highlight */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-white/50"></div>
                    {/* Bottom shadow */}
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-amber-400/50"></div>
                  </div>
                </div>
              )}
            </div>

            {/* "Xem thêm" button - NGOÀI kệ sách */}
            {!category.loading && !category.error && hasMore && (
              <button
                onClick={() => setShowModal(true)}
                className="flex-shrink-0 mb-4 px-6 py-4 bg-white/90 hover:bg-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-3 group"
              >
                <div className="flex flex-col items-start">
                  <span className="text-sm font-semibold text-gray-900">Xem thêm</span>
                  <span className="text-xs text-gray-600">+{category.texts.length - MAX_VISIBLE} văn bản</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-1.5 bg-white/60 rounded-full mt-6 shadow-sm" />
      </div>

      {/* Modal - Xem tất cả sách */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div 
              className="px-6 py-4 flex items-center justify-between border-b"
              style={{ backgroundColor: category.color }}
            >
              <h2 className="text-xl font-bold" style={{ color: textColor }}>
                {category.name} ({category.texts.length} văn bản)
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-black/10 rounded-lg transition-colors"
                style={{ color: textColor }}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content - Grid of books */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {category.texts.map((text) => (
                  <TextCard key={text.id} text={text} onAction={onTextAction} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function getContrastColor(hexColor: string): string {
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 155 ? '#000000' : '#FFFFFF'
}