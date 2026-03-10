import { FormEvent, useState } from 'react'
import Modal from '../Common/Modal'
import Button from '../Common/Button'
import api from '../../../api/axios'

interface JoinClassModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function JoinClassModal({ open, onClose, onSuccess }: JoinClassModalProps) {
  const [classCode, setClassCode] = useState('')
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (classCode.length !== 6) {
      setError('Mã lớp phải có 6 ký tự')
      return
    }
    
    setJoining(true)
    setError('')
    
    try {
      await api.post('/classes/join', { code: classCode.toUpperCase() })
      setClassCode('')
      onSuccess()
      onClose()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(msg ?? 'Tham gia lớp thất bại. Vui lòng kiểm tra lại mã lớp.')
    } finally {
      setJoining(false)
    }
  }

  const handleClose = () => {
    setClassCode('')
    setError('')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Tham gia lớp học" maxWidth="sm">
      <p className="mb-6 text-center text-gray-600">
        Nhập mã lớp gồm 6 ký tự do giáo viên cung cấp
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={classCode}
          onChange={(e) => setClassCode(e.target.value.toUpperCase())}
          placeholder="Ví dụ: ABC123"
          maxLength={6}
          className="h-14 w-full rounded-2xl border-2 border-[#89a4dc] bg-white px-4 text-center text-2xl font-bold uppercase tracking-widest text-[#1f3f8f] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          required
        />
        
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            className="flex-1"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={joining || classCode.length !== 6}
            className="flex-1"
          >
            {joining ? 'Đang tham gia...' : 'Tham gia'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
