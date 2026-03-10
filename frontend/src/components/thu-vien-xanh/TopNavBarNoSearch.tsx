import { type FormEvent, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { type ThuVienXanhMode } from '../../types/thuVienXanh'
import thuVienLogo from '../../img/1x/logo-thu-vien.png'

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


  return (
    <header className="relative z-30 bg-[linear-gradient(180deg,#153177_0%,#1f849a_100%)] px-4 sm:px-6 lg:px-8 py-4">
        <div className="absolute left-0 right-0 top-1 h-[2px] bg-[#1297b0]" />
        <div className="absolute left-0 right-0 bottom-1 h-[2px] bg-[#1297b0]" />
        <div className="max-w-7xl mx-auto relative flex items-center h-16">

            <Link
                to="/trang-chu"
                className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3 text-white hover:opacity-90 transition-opacity"
            >
                <img src={thuVienLogo} alt="Thư viện" className="w-14 h-14 object-contain" />
                <p className="text-sm sm:text-base md:text-lg font-black tracking-wide">
                THƯ VIỆN KHOA HỌC VIỄN TƯỞNG
                </p>
            </Link>

        </div>
    </header>
  )
}
