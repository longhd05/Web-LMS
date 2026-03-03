import { useState, useEffect } from 'react'
import { fetchTextDetail } from '../api/readingComprehension'
import { TextDetail } from '../types/readingComprehension'

export const useReadingComprehension = (textId: string | null) => {
  const [textDetail, setTextDetail] = useState<TextDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!textId) {
      setTextDetail(null)
      return
    }

    const loadTextDetail = async () => {
      console.log('🔄 Loading text detail for:', textId)
      setLoading(true)
      setError(null)
      
      try {
        const detail = await fetchTextDetail(textId)
        console.log('✅ Text detail loaded:', detail)
        setTextDetail(detail)
      } catch (err) {
        console.error('❌ Failed to load text detail:', err)
        setError('Không thể tải nội dung văn bản')
      } finally {
        setLoading(false)
      }
    }

    loadTextDetail()
  }, [textId])

  return { textDetail, loading, error }
}