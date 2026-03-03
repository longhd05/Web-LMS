import { useState, useRef, useEffect } from 'react'
import { BookOpen, FileText, Search } from 'lucide-react'

interface SearchBarWithDropdownProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onSelectText?: (textId: string) => void
  categories?: Array<{
    id: string
    name: string
    color: string
    loading?: boolean
    texts: Array<{
      id: string
      title: string
      type: string
      difficulty: string | null
      hasReadingQuiz: boolean
      hasIntegratedTask: boolean
    }>
  }>
}

// Helper functions
function normalizeVietnamese(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
}

function vietnameseIncludes(text: string, search: string): boolean {
  return normalizeVietnamese(text).includes(normalizeVietnamese(search))
}

export default function SearchBarWithDropdown({
  value,
  onChange,
  placeholder = 'Nhập tên tác phẩm bạn cần...',
  onSelectText,
  categories = [],
}: SearchBarWithDropdownProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 👇 Flatten texts từ TẤT CẢ categories (đã load đầy đủ)
  // Chỉ filter khi có search query
  const allTexts = categories
    .filter((cat) => !cat.loading) // Bỏ qua category đang loading
    .flatMap((cat) =>
      cat.texts
        .filter((text) => !value || vietnameseIncludes(text.title, value)) // 👈 Filter chỉ trong dropdown
        .map((text) => ({
          ...text,
          categoryName: cat.name,
          categoryColor: cat.color,
        }))
    )

  useEffect(() => {
    setShowDropdown(value.length > 0)
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectText = (textId: string) => {
    setShowDropdown(false)
    onSelectText?.(textId)
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-4 inset-y-0 flex items-center pointer-events-none z-10">
          <Search className="block w-5 h-5" strokeWidth={2.5} style={{ color: '#6b7280' }} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            if (value.length > 0) {
              setShowDropdown(true)
            }
          }}
          placeholder={placeholder}
          className="relative z-0 w-full pl-12 pr-4 py-3 rounded-xl border-2 border-white/30 bg-white/95 backdrop-blur-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent shadow-sm"
        />
      </div>

      {/* Dropdown Suggestions */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-[60]"
        >
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              TÊN CÁC VĂN BẢN + DẠNG BÀI TẬP
            </h3>
            <p className="text-sm text-gray-600">
              VD: <span className="font-medium">"Bạch tuộc"</span> – Đọc hiểu
              =&gt; HS ấn vào sẽ hiện lên Bài tập đọc hiểu "Bạch tuộc" luôn
            </p>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {allTexts.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Không tìm thấy văn bản "{value}"</p>
              </div>
            ) : (
              <div className="py-2">
                {allTexts.map((text) => (
                  <button
                    key={text.id}
                    onClick={() => handleSelectText(text.id)}
                    className="w-full px-6 py-3 hover:bg-gray-50 flex items-start gap-3 text-left transition-colors group"
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      <BookOpen className="w-5 h-5 text-gray-400 group-hover:text-teal-600" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 group-hover:text-teal-600">
                          {text.title}
                        </h4>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: text.categoryColor }}
                        >
                          {text.categoryName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{text.type}</span>
                        {text.difficulty && (
                          <>
                            <span>•</span>
                            <span>{text.difficulty}</span>
                          </>
                        )}
                        {text.hasReadingQuiz && (
                          <>
                            <span>•</span>
                            <span className="text-green-600">📖 Đọc hiểu</span>
                          </>
                        )}
                        {text.hasIntegratedTask && (
                          <>
                            <span>•</span>
                            <span className="text-blue-600">🔗 Tích hợp</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}