import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopNavBar, { type ThuVienXanhSearchResult } from '../../components/thu-vien-xanh/TopNavBar'
import LibraryContent from '../../components/thu-vien-xanh/LibraryContent'
import { useThuVienXanhLibrary } from '../../hooks/useThuVienXanhLibrary'
import { type LibraryItem, type ThuVienXanhMode } from '../../types/thuVienXanh'

const thuVienXanhBackground = new URL('../../img/1x/hinh-nen.png', import.meta.url).href
const triThucTheLoaiSvg = new URL('../../../Tri thức thể loại.png', import.meta.url).href
const kyNangVaChienThuatSvg = new URL('../../../Kỹ năng và chiến thuật.png', import.meta.url).href

const allowedCategoryIds = new Set(['env', 'peace'])
type ThuVienXanhSection = 'hoc-lieu' | 'van-ban-va-nhiem-vu'
type HocLieuDocKey =
  | 'lqh-hoa-binh'
  | 'lqh-moi-truong'
  | 'khvt-tri-thuc-the-loai'
  | 'khvt-ky-nang-va-chien-thuat'

const hocLieuImageModalMap: Record<
  Exclude<HocLieuDocKey, 'lqh-hoa-binh' | 'lqh-moi-truong'>,
  { title: string; imageUrl: string }
> = {
  'khvt-tri-thuc-the-loai': {
    title: 'Tri thức thể loại',
    imageUrl: triThucTheLoaiSvg,
  },
  'khvt-ky-nang-va-chien-thuat': {
    title: 'Chiến thuật/kĩ thuật đọc hiểu',
    imageUrl: kyNangVaChienThuatSvg,
  },
}

export default function ThuVienXanhLibraryPage() {
  const [searchValue, setSearchValue] = useState('')
  const [mode, setMode] = useState<ThuVienXanhMode>('doc-hieu')
  const [section, setSection] = useState<ThuVienXanhSection>('van-ban-va-nhiem-vu')
  const [hocLieuModal, setHocLieuModal] = useState<{ title: string; imageUrl: string } | null>(null)

  const navigate = useNavigate()
  const { categories: shelfCategories, loading } = useThuVienXanhLibrary(searchValue)

  useEffect(() => {
    if (!hocLieuModal) return

    const scrollY = window.scrollY
    const previousStyles = {
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      overflowY: document.body.style.overflowY,
    }

    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    document.body.style.overflowY = 'scroll'

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setHocLieuModal(null)
      }
    }

    window.addEventListener('keydown', handleEsc)

    return () => {
      window.removeEventListener('keydown', handleEsc)
      document.body.style.position = previousStyles.position
      document.body.style.top = previousStyles.top
      document.body.style.width = previousStyles.width
      document.body.style.overflowY = previousStyles.overflowY
      window.scrollTo(0, scrollY)
    }
  }, [hocLieuModal])

  const categories = useMemo(() => {
    return shelfCategories
      .filter((category) => allowedCategoryIds.has(category.id))
      .map((category) => ({
        id: category.id,
        title: category.name.toUpperCase(),
        items: category.texts
          .map<LibraryItem>((text) => ({
            id: text.id,
            title: text.title,
            categoryId: text.categoryId,
            coverUrl: text.coverUrl,
            hasDocHieu: text.hasReadingQuiz,
            hasTichHop: text.hasIntegratedTask,
          }))
          .filter((item) => (mode === 'doc-hieu' ? item.hasDocHieu : item.hasTichHop)),
      }))
      .filter((category) => category.items.length > 0)
  }, [shelfCategories, mode])

  const searchResults = useMemo<ThuVienXanhSearchResult[]>(() => {
    if (!searchValue.trim()) return []

    return shelfCategories
      .filter((category) => allowedCategoryIds.has(category.id))
      .flatMap((category) => category.texts)
      .map((text) => {
        const options: ThuVienXanhSearchResult['options'] = []
        if (text.hasReadingQuiz) {
          options.push({ mode: 'doc-hieu', label: 'Đọc hiểu' })
        }
        if (text.hasIntegratedTask) {
          options.push({ mode: 'tich-hop', label: 'Tích hợp' })
        }
        return {
          itemId: text.id,
          title: text.title,
          imageUrl: text.coverUrl,
          options,
        }
      })
      .filter((result) => result.options.length > 0)
  }, [searchValue, shelfCategories])

  const handleOpenItem = (item: LibraryItem) => {
    const preferredMode: ThuVienXanhMode = mode
    const params = new URLSearchParams({ itemId: item.id })
    if (item.coverUrl) {
      params.set('imageUrl', item.coverUrl)
    }
    navigate(`/thu-vien-xanh/${preferredMode}?${params.toString()}`)
  }

  const handleModeChange = (newMode: ThuVienXanhMode) => {
    setMode(newMode)
  }

  const handleOpenHocLieuItem = (item: { docKey?: HocLieuDocKey }) => {
    if (!item.docKey) return

    if (item.docKey === 'lqh-hoa-binh' || item.docKey === 'lqh-moi-truong') {
      const params = new URLSearchParams({ doc: item.docKey })
      navigate(`/thu-vien-xanh/hoc-lieu?${params.toString()}`)
      return
    }

    const modalData = hocLieuImageModalMap[item.docKey]
    if (modalData) {
      setHocLieuModal(modalData)
    }
  }

  const handleSearchSubmit = () => {
    setSearchValue((previous) => previous.trim())
  }

  const handleSelectSearchResult = ({
    itemId,
    mode: nextMode,
    imageUrl,
  }: {
    itemId: string
    mode: ThuVienXanhMode
    imageUrl?: string | null
  }) => {
    const params = new URLSearchParams({ itemId })
    if (imageUrl) {
      params.set('imageUrl', imageUrl)
    }
    navigate(`/thu-vien-xanh/${nextMode}?${params.toString()}`)
  }

  return (
    <div
      className="min-h-screen bg-center bg-cover bg-no-repeat"
      style={{ backgroundImage: `url(${thuVienXanhBackground})` }}
    >
      <TopNavBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearchSubmit={handleSearchSubmit}
        searchResults={searchResults}
        onSelectSearchResult={handleSelectSearchResult}
        loadingResults={loading}
      />
      <LibraryContent
        categories={categories}
        mode={mode}
        section={section}
        onSectionChange={setSection}
        onModeChange={handleModeChange}
        onOpenItem={handleOpenItem}
        onOpenHocLieuItem={handleOpenHocLieuItem}
      />

      {hocLieuModal && (
        <div className="fixed inset-0 z-[120] overflow-y-auto bg-slate-950/70 px-3 py-4 sm:px-6 sm:py-8" onClick={() => setHocLieuModal(null)}>
          <div
            className="mx-auto flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-cyan-100 bg-white shadow-xl"
            style={{ maxHeight: 'calc(100vh - 2rem)' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-cyan-100 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 sm:py-4">
              <h2 className="pr-4 text-base font-extrabold text-blue-950 sm:text-lg">{hocLieuModal.title}</h2>
              <button
                type="button"
                onClick={() => setHocLieuModal(null)}
                className="rounded-full border border-cyan-300 bg-white px-4 py-1.5 text-sm font-bold text-blue-900 transition hover:bg-cyan-50"
              >
                Đóng
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-2 sm:p-4">
              <div className="rounded-xl border border-cyan-100 bg-white p-2 shadow-sm sm:p-3">
                <img src={hocLieuModal.imageUrl} alt={hocLieuModal.title} className="h-auto w-full rounded-lg bg-white" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

