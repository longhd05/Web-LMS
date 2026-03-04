import { type FormEvent, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { type ThuVienXanhMode } from '../../types/thuVienXanh'

export interface ThuVienXanhSearchResult {
  itemId: string
  title: string
  imageUrl?: string | null
  options: Array<{
    mode: ThuVienXanhMode
    label: string
  }>
}

interface TopNavBarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  onSearchSubmit: () => void
  searchResults?: ThuVienXanhSearchResult[]
  onSelectSearchResult?: (result: { itemId: string; mode: ThuVienXanhMode; imageUrl?: string | null }) => void
  loadingResults?: boolean
}

export default function TopNavBar({
  searchValue,
  onSearchChange,
  onSearchSubmit,
  searchResults = [],
  onSelectSearchResult,
  loadingResults = false,
}: TopNavBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!wrapperRef.current) return
      if (!wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSearchSubmit()
    if (searchValue.trim()) {
      setIsOpen(true)
    }
  }

  const shouldShowResults = isOpen && searchValue.trim().length > 0

  return (
    <header className="relative z-30 bg-[linear-gradient(180deg,#153177_0%,#1f849a_100%)] px-4 sm:px-6 lg:px-8 py-4">
      <div className="absolute left-0 right-0 top-1 h-[2px] bg-[#1297b0]" />
      <div className="absolute left-0 right-0 bottom-1 h-[2px] bg-[#1297b0]" />
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        <Link to="/" className="min-w-0 flex items-center gap-3 text-white hover:opacity-90 transition-opacity">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-extrabold">TVX</div>
          <p className="text-sm sm:text-base md:text-lg font-black tracking-wide">THƯ VIỆN KHOA HỌC VIỄN TƯỞNG</p>
        </Link>

        <form className="flex-1 flex justify-center" onSubmit={handleSubmit}>
          <div ref={wrapperRef} className="w-full max-w-3xl relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3-3" />
              </svg>
            </span>
            <input
              value={searchValue}
              onFocus={() => {
                if (searchValue.trim()) setIsOpen(true)
              }}
              onChange={(event) => {
                onSearchChange(event.target.value)
                setIsOpen(true)
              }}
              placeholder="Nhập tên văn bản + Dạng bài tập (VD: “Bạch tuộc” - Đọc hiểu...)"
              className="w-full h-12 rounded-full bg-white pl-12 pr-4 text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-teal-400"
            />

            {shouldShowResults && (
              <div className="absolute top-[calc(100%+8px)] left-0 right-0 rounded-2xl border border-cyan-200 bg-white shadow-lg z-[70] max-h-80 overflow-y-auto">
                {loadingResults ? (
                  <div className="px-4 py-3 text-sm text-slate-500">Đang tìm kiếm...</div>
                ) : searchResults.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-slate-500">Không có kết quả phù hợp.</div>
                ) : (
                  <ul className="py-2">
                    {searchResults.map((result) => (
                      <li key={result.itemId} className="px-3 py-2 hover:bg-cyan-50">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-slate-800 truncate">{result.title}</p>
                          <div className="flex items-center gap-2 shrink-0">
                            {result.options.map((option) => (
                              <button
                                key={`${result.itemId}-${option.mode}`}
                                type="button"
                                onClick={() => {
                                  onSelectSearchResult?.({
                                    itemId: result.itemId,
                                    mode: option.mode,
                                    imageUrl: result.imageUrl,
                                  })
                                  setIsOpen(false)
                                }}
                                className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                  option.mode === 'doc-hieu'
                                    ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                                    : 'border-sky-300 text-sky-700 bg-sky-50'
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </form>

        <div className="w-8 sm:w-20" />
      </div>
    </header>
  )
}
