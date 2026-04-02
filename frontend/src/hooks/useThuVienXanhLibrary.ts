import { useEffect, useState } from 'react'
import { fetchThuVienXanhCategories, fetchThuVienXanhTextsByCategory } from '../api/thuVienXanhLibrary'
import { type ThuVienXanhCategoryWithTexts } from '../types/thuVienXanhLibrary'

export const useThuVienXanhLibrary = (searchQuery: string) => {
  const [categories, setCategories] = useState<ThuVienXanhCategoryWithTexts[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError('')
      try {
        const cats = await fetchThuVienXanhCategories(searchQuery)
        const catsWithTexts: ThuVienXanhCategoryWithTexts[] = cats.map((category) => ({
          ...category,
          texts: [],
          loading: true,
          error: null,
        }))
        setCategories(catsWithTexts)

        cats.forEach(async (category, idx) => {
          try {
            const texts = await fetchThuVienXanhTextsByCategory(category.id, searchQuery, category.textCount)
            setCategories((prev) => {
              const updated = [...prev]
              updated[idx] = { ...updated[idx], texts, loading: false }
              return updated
            })
          } catch {
            setCategories((prev) => {
              const updated = [...prev]
              updated[idx] = {
                ...updated[idx],
                loading: false,
                error: 'Không thể tải văn bản',
              }
              return updated
            })
          }
        })
      } catch {
        setError('Không thể tải danh mục')
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(() => {
      loadData()
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  return { categories, loading, error }
}
