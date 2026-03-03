import { useEffect, useState } from 'react'
import { fetchCategories, fetchTextsByCategory } from '../api/libraryShelf'
import { CategoryWithTexts } from '../types/libraryShelf'

export const useLibraryShelf = (searchQuery: string) => {
  const [categories, setCategories] = useState<CategoryWithTexts[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError('')
      try {
        const cats = await fetchCategories(searchQuery)
        const catsWithTexts: CategoryWithTexts[] = cats.map((c) => ({
          ...c,
          texts: [],
          loading: true,
          error: null,
        }))
        setCategories(catsWithTexts)

        // Load texts for each category
        cats.forEach(async (cat, idx) => {
          try {
            const texts = await fetchTextsByCategory(cat.id, searchQuery, cat.textCount)
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
    }, 300) // debounce

    return () => clearTimeout(timer)
  }, [searchQuery])

  return { categories, loading, error }
}