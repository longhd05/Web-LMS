import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopNavBar, { type ThuVienXanhSearchResult } from '../../components/thu-vien-xanh/TopNavBar'
import LibraryContent from '../../components/thu-vien-xanh/LibraryContent'
import { useThuVienXanhLibrary } from '../../hooks/useThuVienXanhLibrary'
import { type LibraryItem, type ThuVienXanhMode } from '../../types/thuVienXanh'

export default function ThuVienXanhLibraryPage() {
  const [searchValue, setSearchValue] = useState('')
  const navigate = useNavigate()
  const { categories: shelfCategories, loading } = useThuVienXanhLibrary(searchValue)

  const categories = useMemo(() => {
    return shelfCategories
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
          .filter((item) => item.hasDocHieu || item.hasTichHop),
      }))
      .filter((category) => category.items.length > 0)
  }, [shelfCategories])

  const searchResults = useMemo<ThuVienXanhSearchResult[]>(() => {
    if (!searchValue.trim()) return []

    return shelfCategories
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
    const preferredMode: ThuVienXanhMode = item.hasDocHieu ? 'doc-hieu' : 'tich-hop'
    const params = new URLSearchParams({ itemId: item.id })
    if (item.coverUrl) {
      params.set('imageUrl', item.coverUrl)
    }
    navigate(`/thu-vien-xanh/${preferredMode}?${params.toString()}`)
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
    <div className="min-h-screen bg-gradient-to-r from-sky-100 via-cyan-100 to-emerald-100">
      <TopNavBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearchSubmit={handleSearchSubmit}
        searchResults={searchResults}
        onSelectSearchResult={handleSelectSearchResult}
        loadingResults={loading}
      />
      <LibraryContent categories={categories} onOpenItem={handleOpenItem} />
    </div>
  )
}
