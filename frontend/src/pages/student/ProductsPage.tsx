import { useEffect, useState } from 'react'
import StudentLayout from '../../components/student/Layout/StudentLayout'
import LoadingSpinner from '../../components/student/Common/LoadingSpinner'
import ProductsTabContent, { StudentSubmissionItem } from '../../components/student/Class/ProductsTabContent'
import api from '../../api/axios'

export default function ProductsPage() {
  const [submissions, setSubmissions] = useState<StudentSubmissionItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true)
      try {
        const res = await api.get('/submissions')
        setSubmissions(res.data.data || [])
      } catch {
        // Silent fail - show empty state
      } finally {
        setLoading(false)
      }
    }
    fetchSubmissions()
  }, [])

  if (loading) {
    return (
      <StudentLayout>
        <LoadingSpinner />
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        <ProductsTabContent submissions={submissions} />
      </div>
    </StudentLayout>
  )
}
