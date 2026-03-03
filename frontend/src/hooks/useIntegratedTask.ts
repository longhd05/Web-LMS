import { useState, useEffect } from 'react'
import { fetchIntegratedTask } from '../api/integratedTask'
import { IntegratedTask } from '../types/integratedTask'

export const useIntegratedTask = (textId: string | null) => {
  const [task, setTask] = useState<IntegratedTask | null>(null)
  const [textContent, setTextContent] = useState<string>('')
  const [textTitle, setTextTitle] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!textId) {
      setTask(null)
      setTextContent('')
      setTextTitle('')
      return
    }

    const loadTask = async () => {
      console.log('🔄 Loading integrated task for:', textId)
      setLoading(true)
      setError(null)
      
      try {
        const data = await fetchIntegratedTask(textId)
        console.log('✅ Integrated task loaded:', data)
        setTask(data.task)
        setTextContent(data.textContent)
        setTextTitle(data.textTitle)
      } catch (err) {
        console.error('❌ Failed to load integrated task:', err)
        setError('Không thể tải bài tập tích hợp')
      } finally {
        setLoading(false)
      }
    }

    loadTask()
  }, [textId])

  return { task, textContent, textTitle, loading, error }
}