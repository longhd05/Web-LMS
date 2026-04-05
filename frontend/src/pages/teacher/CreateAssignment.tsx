import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import { useThuVienXanhLibrary } from '../../hooks/useThuVienXanhLibrary'
import { fetchTextDetail } from '../../api/readingComprehension'
import { fetchIntegratedTask } from '../../api/integratedTask'

interface LibraryItem {
  id: string
  title: string
  categoryId: string
  coverUrl?: string | null
  difficulty?: string | null
  hasDocHieu: boolean
  hasTichHop: boolean
}

const toStrictBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value === 1
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'true' || normalized === '1') return true
    if (normalized === 'false' || normalized === '0' || normalized === '') return false
  }
  return false
}

// Dong bo voi hanh vi trang Thu Vien Xanh: hien tai chi mo item Bach tuoc.
const selectableLibraryItemIds = new Set(['t_env_01'])

type CreatedAssignment = {
  id: string
  type: 'READING' | 'INTEGRATION'
  mode: 'INDIVIDUAL' | 'GROUP'
  dueAt: string | null
  createdAt: string
  title: string | null
  description: string | null
  libraryItem: { id: string; title: string }
}

type CreateAssignmentProps = {
  embedded?: boolean
  onCancel?: () => void
  onCreated?: (assignment: CreatedAssignment) => void
}

export default function CreateAssignment({ embedded, onCancel, onCreated }: CreateAssignmentProps) {
  const { classId } = useParams<{ classId: string }>()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null)
  const [type, setType] = useState<'READING' | 'INTEGRATION'>('READING')
  const [typeOpen, setTypeOpen] = useState(false)
  const [mode, setMode] = useState<'INDIVIDUAL' | 'GROUP'>('INDIVIDUAL')
  const [modeOpen, setModeOpen] = useState(false)
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [dueAt, setDueAt] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [className, setClassName] = useState('')
  const typeDropdownRef = useRef<HTMLDivElement | null>(null)
  const modeDropdownRef = useRef<HTMLDivElement | null>(null)
  const libraryDropdownRef = useRef<HTMLDivElement | null>(null)
  const { categories: thuVienCategories } = useThuVienXanhLibrary(search)

  useEffect(() => {
    api
      .get(`/classes/${classId}`)
      .then((res) => setClassName(res.data.data.name))
      .catch(() => {})
  }, [classId])

  useEffect(() => {
    if (!selectedItem) return
    const supportsType = type === 'READING' ? selectedItem.hasDocHieu : selectedItem.hasTichHop
    if (!supportsType) {
      setSelectedItem(null)
    }
  }, [type, selectedItem])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(target)) {
        setTypeOpen(false)
      }
      if (modeDropdownRef.current && !modeDropdownRef.current.contains(target)) {
        setModeOpen(false)
      }
      if (libraryDropdownRef.current && !libraryDropdownRef.current.contains(target)) {
        setLibraryOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredLibraryItems = useMemo(() => {
    const items = thuVienCategories.flatMap((category) =>
      category.texts.map<LibraryItem>((text) => ({
        id: text.id,
        title: text.title,
        categoryId: text.categoryId,
        coverUrl: text.coverUrl,
        difficulty: text.difficulty,
        hasDocHieu: toStrictBoolean(text.hasReadingQuiz),
        hasTichHop: toStrictBoolean(text.hasIntegratedTask),
      }))
    )
    return items
  }, [thuVienCategories])

  const itemSupportsCurrentType = (item: LibraryItem) =>
    (type === 'READING' ? item.hasDocHieu : item.hasTichHop) && selectableLibraryItemIds.has(item.id)

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
    if (!itemSupportsCurrentType(selectedItem)) {
      setError(type === 'READING' ? 'Văn bản này chưa có dữ liệu đọc hiểu.' : 'Văn bản này chưa có dữ liệu tích hợp.')
      return
    }

    try {
      setLoading(true)
      setError('')

      const contentPayload =
        type === 'READING'
          ? await (async () => {
              const detail = await fetchTextDetail(selectedItem.id)
              const questions = (detail.readingQuestions || []).map((q) => ({
                id: q.id,
                text: q.question,
                type: q.type,
                options: q.options ?? [],
                correctAnswer: q.correctAnswer ?? null,
              }))
              return {
                text: detail.content,
                questions,
                imageUrl: selectedItem.coverUrl || null,
              }
            })()
          : await (async () => {
              const { task, textContent } = await fetchIntegratedTask(selectedItem.id)
              return {
                text: textContent,
                integrationPrompt: task.prompt,
                imageUrl: selectedItem.coverUrl || null,
              }
            })()

      const syncRes = await api.post('/library/sync', {
        title: selectedItem.title,
        content: JSON.stringify(contentPayload),
        type,
        tags: ['thu-vien-xanh', selectedItem.categoryId],
        level: selectedItem.difficulty ?? '',
      })

      const libraryItemId: string = syncRes.data.data.id

      const res = await api.post('/assignments', {
        classId,
        libraryItemId,
        type,
        mode,
        dueAt: dueAt ? new Date(dueAt).toISOString() : null,
        title: title.trim() || undefined,
        description: description.trim() || undefined,
      })
      if (embedded) {
        onCreated?.(res.data.data)
        return
      }
      navigate(`/giao-vien/lop-hoc/${classId}`)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(msg ?? 'Tạo bài tập thất bại.')
    } finally {
      setLoading(false)
    }
  }

  const content = (
    <div>
        {!embedded && (
          <div className="mb-6 flex w-fit items-center overflow-hidden rounded-full border-2 border-[#8be9a0] bg-[#f5fffd]">
            <span className="rounded-full border-r border-cyan-300 bg-gradient-to-b from-[#1f3f8f] to-[#149fb3] px-4 py-1.5 text-sm font-bold uppercase text-white sm:text-base">
              Lớp
            </span>
            <span className="px-4 text-lg font-bold text-[#1f3f8f] sm:text-xl">{className || '...'}</span>
          </div>
        )}

        <div className="mx-auto max-w-4xl rounded-[36px] bg-white p-2">
          <div
            className="relative rounded-[30px] border-2 border-transparent bg-gradient-to-b from-white to-[#dff2ea] p-6 sm:p-8"
            style={{
              background:
                'linear-gradient(#f3fffb, #f3fffb) padding-box, linear-gradient(90deg, #3f72be 0%, #8de8a1 100%) border-box',
            }}
          >
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
              <div ref={libraryDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setLibraryOpen((v) => !v)}
                  className={`flex h-10 w-full items-center justify-between border-2 border-[#6f8ed6] bg-[#c8e4e6] pl-6 pr-4 text-left text-lg font-semibold text-[#1f3f8f] ${
                    libraryOpen ? 'rounded-t-[18px] rounded-b-none border-b-0' : 'rounded-full'
                  }`}
                >
                  <span className="truncate pr-2">
                    {selectedItem ? selectedItem.title : 'Chọn văn bản'}
                  </span>
                  <ChevronDown className={`size-8 shrink-0 text-[#1f3f8f] transition-transform ${libraryOpen ? 'rotate-180' : ''}`} />
                </button>

                {libraryOpen && (
                  <div className="absolute left-0 right-0 top-10 z-20 overflow-hidden rounded-b-[14px] border-2 border-t-0 border-[#6f8ed6] bg-white">
                    <div className="border-b border-[#7da3df] bg-[#b8dadd] px-4 py-2">
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm văn bản"
                        className="h-9 w-full rounded-full border-2 border-[#6f8ed6] bg-white px-4 text-base font-semibold text-[#1f3f8f] placeholder:text-[#4f6fa8] outline-none"
                      />
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {filteredLibraryItems.length === 0 ? (
                        <div className="px-5 py-3 text-left text-base font-semibold text-[#1f3f8f]">
                          Không tìm thấy văn bản.
                        </div>
                      ) : (
                        filteredLibraryItems.map((item) => {
                          const isDisabled = !itemSupportsCurrentType(item)
                          if (isDisabled) {
                            return (
                              <div
                                key={item.id}
                                className="block w-full cursor-not-allowed border-b border-gray-100 bg-gray-100 px-5 py-3 text-left text-base font-semibold text-gray-400"
                              >
                                <span className="block">{item.title}</span>
                              </div>
                            )
                          }

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setSelectedItem(item)
                                setSearch('')
                                setLibraryOpen(false)
                              }}
                              className={`block w-full border-b border-gray-100 px-5 py-3 text-left text-base font-semibold ${
                                selectedItem?.id === item.id ? 'bg-[#25a3b1] text-[#163f8f]' : 'text-[#1f3f8f] hover:bg-cyan-50'
                              }`}
                            >
                              <span className="block">{item.title}</span>
                            </button>
                          )
                        })
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
                rows={3}
                className="w-full resize-none rounded-xl bg-[#cbeff2] px-5 py-3 text-lg italic text-[#1f3f8f] placeholder:text-[#6f8dbc]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 sm:gap-6">
              {embedded ? (
                <button
                  type="button"
                  onClick={onCancel}
                  className="mx-auto w-full max-w-[190px] rounded-[18px] border-2 border-[#cfd4d9] bg-[#a8aaad] py-2.5 text-center text-base font-bold uppercase text-white transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105 hover:shadow-md active:translate-y-0 active:scale-[0.98]"
                >
                  Hủy
                </button>
              ) : (
                <Link
                  to={`/giao-vien/lop-hoc/${classId}`}
                  className="mx-auto w-full max-w-[190px] rounded-[18px] border-2 border-[#cfd4d9] bg-[#a8aaad] py-2.5 text-center text-base font-bold uppercase text-white transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105 hover:shadow-md active:translate-y-0 active:scale-[0.98]"
                >
                  Hủy
                </Link>
              )}
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

  if (embedded) {
    return (
      <div>
        {content}
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#efeff1] px-4 py-8 sm:px-6">
      {content}
    </div>
  )
}
