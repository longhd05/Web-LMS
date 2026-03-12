import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'

interface LibraryItem {
  id: string
  title: string
  level: string
  tags: string[]
}

export default function CreateAssignment() {
  const { classId } = useParams<{ classId: string }>()
  const navigate = useNavigate()

  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([])
  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [type, setType] = useState<'READING' | 'INTEGRATION'>('READING')
  const [typeOpen, setTypeOpen] = useState(false)
  const [mode, setMode] = useState<'INDIVIDUAL' | 'GROUP'>('INDIVIDUAL')
  const [modeOpen, setModeOpen] = useState(false)
  const [dueAt, setDueAt] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [className, setClassName] = useState('')
  const typeDropdownRef = useRef<HTMLDivElement | null>(null)
  const modeDropdownRef = useRef<HTMLDivElement | null>(null)
  const textDropdownRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    api
      .get(`/classes/${classId}`)
      .then((res) => setClassName(res.data.data.name))
      .catch(() => {})
  }, [classId])

  useEffect(() => {
    api
      .get('/library', { params: { limit: 200 } })
      .then((res) => setLibraryItems(res.data.data))
      .catch(() => {})
  }, [])

  const filteredLibraryItems = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return libraryItems
    return libraryItems.filter((item) => item.title.toLowerCase().includes(keyword))
  }, [libraryItems, search])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(target)) {
        setTypeOpen(false)
      }
      if (modeDropdownRef.current && !modeDropdownRef.current.contains(target)) {
        setModeOpen(false)
      }
      if (textDropdownRef.current && !textDropdownRef.current.contains(target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (loading) return

    if (!classId) {
      setError('Không tìm thấy lớp học.')
      return
    }

    if (!selectedItem) {
      setError('Vui lòng chọn văn bản.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await api.post('/assignments', {
        classId,
        libraryItemId: selectedItem.id,
        type,
        mode,
        dueAt: dueAt ? new Date(dueAt).toISOString() : null,
        title: title.trim() || undefined,
        description: description.trim() || undefined,
      })
      navigate(`/giao-vien/class/${classId}`)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(msg ?? 'Tạo bài tập thất bại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#efeff1] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex w-fit items-center overflow-hidden rounded-full border-2 border-[#8be9a0] bg-[#f5fffd]">
          <span className="rounded-full border-r border-cyan-300 bg-gradient-to-b from-[#1f3f8f] to-[#149fb3] px-4 py-1.5 text-sm font-bold uppercase text-white sm:text-base">
            Lớp
          </span>
          <span className="px-4 text-lg font-bold text-[#1f3f8f] sm:text-xl">{className || '...'}</span>
        </div>

        <div className="relative mx-auto max-w-4xl rounded-[28px] border-2 border-[#8bee9f] bg-gradient-to-b from-white to-[#dff2ea] p-6 shadow-[0_0_0_2px_rgba(63,98,170,0.7)] sm:p-8">
          <h1 className="mb-6 text-3xl font-black text-[#1f3f8f] sm:text-4xl">Tạo bài tập mới</h1>

          {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-2 sm:grid-cols-[220px,320px] sm:items-center">
              <label className="flex items-center text-lg font-bold text-[#1f3f8f] sm:text-xl">
                <span className="mr-2 text-[#365aac]">•</span>
                Chọn loại bài tập:
              </label>
              <div ref={typeDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setTypeOpen((v) => !v)}
                  className={`flex h-10 w-full items-center justify-between border-2 border-[#6f8ed6] bg-[#c8e4e6] pl-6 pr-4 text-left text-lg font-semibold text-[#1f3f8f] ${
                    typeOpen ? 'rounded-t-[18px] rounded-b-none border-b-0' : 'rounded-full'
                  }`}
                >
                  <span>{type === 'READING' ? 'Đọc hiểu' : 'Tích hợp'}</span>
                  <ChevronDown className={`size-8 text-[#1f3f8f] transition-transform ${typeOpen ? 'rotate-180' : ''}`} />
                </button>

                {typeOpen && (
                  <div className="absolute left-0 right-0 top-10 z-20 overflow-hidden rounded-b-[14px] border-2 border-t-0 border-[#6f8ed6] bg-[#b8dadd]">
                    <button
                      type="button"
                      onClick={() => {
                        setType('READING')
                        setTypeOpen(false)
                      }}
                      className={`block w-full pl-6 py-1.5 text-left text-xl leading-none ${
                        type === 'READING' ? 'bg-[#25a3b1] text-[#163f8f]' : 'text-[#1f3f8f] hover:bg-[#9dcfd4]'
                      }`}
                    >
                      Đọc hiểu
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setType('INTEGRATION')
                        setTypeOpen(false)
                      }}
                      className={`block w-full pl-6 py-1.5 text-left text-xl leading-none ${
                        type === 'INTEGRATION' ? 'bg-[#25a3b1] text-[#163f8f]' : 'text-[#1f3f8f] hover:bg-[#9dcfd4]'
                      }`}
                    >
                      Tích hợp
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-[220px,320px] sm:items-center">
              <label className="flex items-center text-lg font-bold text-[#1f3f8f] sm:text-xl">
                <span className="mr-2 text-[#365aac]">•</span>
                Hình thức:
              </label>
              <div ref={modeDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setModeOpen((v) => !v)}
                  className={`flex h-10 w-full items-center justify-between border-2 border-[#6f8ed6] bg-[#c8e4e6] pl-6 pr-4 text-left text-lg font-semibold text-[#1f3f8f] ${
                    modeOpen ? 'rounded-t-[18px] rounded-b-none border-b-0' : 'rounded-full'
                  }`}
                >
                  <span>{mode === 'INDIVIDUAL' ? 'Cá nhân' : 'Nhóm'}</span>
                  <ChevronDown className={`size-8 text-[#1f3f8f] transition-transform ${modeOpen ? 'rotate-180' : ''}`} />
                </button>

                {modeOpen && (
                  <div className="absolute left-0 right-0 top-10 z-20 overflow-hidden rounded-b-[14px] border-2 border-t-0 border-[#6f8ed6] bg-[#b8dadd]">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('INDIVIDUAL')
                        setModeOpen(false)
                      }}
                      className={`block w-full pl-6 py-1.5 text-left text-xl leading-none ${
                        mode === 'INDIVIDUAL' ? 'bg-[#25a3b1] text-[#163f8f]' : 'text-[#1f3f8f] hover:bg-[#9dcfd4]'
                      }`}
                    >
                      Cá nhân
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('GROUP')
                        setModeOpen(false)
                      }}
                      className={`block w-full pl-6 py-1.5 text-left text-xl leading-none ${
                        mode === 'GROUP' ? 'bg-[#25a3b1] text-[#163f8f]' : 'text-[#1f3f8f] hover:bg-[#9dcfd4]'
                      }`}
                    >
                      Nhóm
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-[220px,320px] sm:items-center">
              <label className="flex items-center text-lg font-bold text-[#1f3f8f] sm:text-xl">
                <span className="mr-2 text-[#365aac]">•</span>
                Văn bản:
              </label>
              <div ref={textDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    if (!showDropdown) setSearch('')
                    setShowDropdown((v) => !v)
                  }}
                  className={`flex h-10 w-full items-center justify-between border-2 border-[#6f8ed6] bg-[#c8e4e6] pl-6 pr-4 text-left text-lg font-semibold text-[#1f3f8f] ${
                    showDropdown ? 'rounded-t-[18px] rounded-b-none border-b-0' : 'rounded-full'
                  }`}
                >
                  <span className={`truncate pr-2 ${selectedItem ? '' : 'text-[#4f6fa8]'}`}>{selectedItem?.title || 'Tên văn bản'}</span>
                  <ChevronDown className={`size-8 text-[#1f3f8f] transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showDropdown && (
                  <div className="absolute left-0 right-0 top-10 z-20 overflow-hidden rounded-b-[14px] border-2 border-t-0 border-[#6f8ed6] bg-[#b8dadd]">
                    <div className="border-b border-[#7da3df] bg-[#c8e4e6] px-3 py-2">
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm tên văn bản..."
                        className="h-9 w-full rounded-full border border-[#6f8ed6] bg-white px-4 text-base font-semibold text-[#1f3f8f] placeholder:text-[#4f6fa8] outline-none"
                      />
                    </div>
                    <div className="max-h-64 overflow-y-auto bg-white">
                      {filteredLibraryItems.length > 0 ? (
                        filteredLibraryItems.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setSelectedItem(item)
                              setSearch('')
                              setShowDropdown(false)
                            }}
                            className={`block w-full border-b border-gray-100 px-5 py-3 text-left text-base font-semibold ${
                              selectedItem?.id === item.id ? 'bg-cyan-100 text-[#163f8f]' : 'text-[#1f3f8f] hover:bg-cyan-50'
                            }`}
                          >
                            {item.title}
                          </button>
                        ))
                      ) : (
                        <p className="px-5 py-3 text-sm font-semibold text-[#4f6fa8]">Không tìm thấy văn bản phù hợp.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center text-lg font-bold text-[#1f3f8f] sm:text-xl">
                <span className="mr-2 text-[#365aac]">•</span>
                Tiêu đề bài tập:
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Bài tập 1..."
                className="h-12 w-full rounded-xl bg-[#cbeff2] px-5 text-lg italic text-[#1f3f8f] placeholder:text-[#6f8dbc]"
              />
            </div>

            <div>
              <label className="mb-2 block text-lg font-bold text-[#1f3f8f] sm:text-xl">Mô tả chi tiết:</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="VD: Hạn nộp, lưu ý, yêu cầu thêm..."
                rows={4}
                className="w-full resize-none rounded-xl bg-[#cbeff2] px-5 py-4 text-lg italic text-[#1f3f8f] placeholder:text-[#6f8dbc]"
              />
            </div>

            {/* <div>
              <label className="mb-2 block text-base font-semibold text-[#1f3f8f] sm:text-lg">Hạn nộp</label>
              <input
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                className="h-12 w-full rounded-xl border-2 border-[#7da3df] bg-white px-4 text-base text-[#1f3f8f]"
              />
            </div> */}

            <div className="grid grid-cols-2 gap-4 pt-2 sm:gap-6">
              <Link
                to={`/giao-vien/class/${classId}`}
                className="mx-auto w-full max-w-[190px] rounded-[18px] border-2 border-[#cfd4d9] bg-[#a8aaad] py-2.5 text-center text-base font-bold uppercase text-white transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105 hover:shadow-md active:translate-y-0 active:scale-[0.98]"
              >
                Hủy
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="mx-auto w-full max-w-[190px] rounded-[18px] border-2 border-[#1f3f8f] bg-gradient-to-b from-[#1f3f8f] to-[#149fb3] py-2.5 text-base font-bold uppercase text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_16px_rgba(31,63,143,0.28)] active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {loading ? 'Đang tạo...' : 'Tạo bài tập'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
