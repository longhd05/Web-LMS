import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import TopNavBar from '../../components/thu-vien-xanh/TopNavBar'
import FullscreenModalShell from '../../components/thu-vien-xanh/FullscreenModalShell'
import TichHopBody from '../../components/thu-vien-xanh/TichHopBody'
import { useIntegratedTask } from '../../hooks/useIntegratedTask'
import { uploadSubmission } from '../../api/integratedTask'
import { type ThuVienXanhUserRole } from '../../types/thuVienXanh'

const thuVienXanhBackground = new URL('../../img/1x/hinh-nen.png', import.meta.url).href
const bachTuocFullPageImage = new URL('../../../Landing page.svg', import.meta.url).href

function resolveRole(rawRole: string | null, authRole: 'STUDENT' | 'TEACHER' | undefined): ThuVienXanhUserRole {
  if (rawRole === 'free_student' || rawRole === 'normal_student' || rawRole === 'teacher' || rawRole === 'admin') {
    return rawRole
  }
  if (authRole === 'TEACHER') return 'teacher'
  return 'normal_student'
}

export default function TichHopFullscreenModal() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, isClassStudent } = useAuth()

  const itemId = searchParams.get('itemId')
  const imageUrl = searchParams.get('imageUrl')
  const { task, textContent, textTitle, loading, error } = useIntegratedTask(itemId)
  const userRole = resolveRole(searchParams.get('role'), user?.role)

  const [answer, setAnswer] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const dirty = useMemo(() => answer.trim().length > 0 || selectedFiles.length > 0, [answer, selectedFiles])

  const handleSubmit = () => {
    if (!task) {
      window.alert('Không tìm thấy dữ liệu bài tích hợp.')
      return
    }
    if (!answer.trim() && selectedFiles.length === 0) {
      window.alert('Vui lòng nhập nội dung hoặc thêm ít nhất một file trước khi nộp bài.')
      return
    }

    const maxFileSizeBytes = task.maxFileSize * 1024 * 1024
    const normalizedAllowedTypes = task.allowedFileTypes.map((type) => type.toLowerCase())
    const invalidFile = selectedFiles.find((file) => {
      const extension = file.name.split('.').pop()?.toLowerCase() || ''
      return file.size > maxFileSizeBytes || !normalizedAllowedTypes.includes(extension)
    })

    if (invalidFile) {
      window.alert(`File ${invalidFile.name} không hợp lệ (định dạng hoặc dung lượng).`)
      return
    }

    Promise.all(selectedFiles.map((file) => uploadSubmission(task.id, file)))
      .then(() => {
        window.alert('Đã nộp bài Tích hợp thành công.')
        navigate('/thu-vien-xanh?mode=tich-hop')
      })
      .catch(() => {
        window.alert('Nộp bài thất bại. Vui lòng thử lại.')
      })
  }

  if (!itemId) {
    return (
      <div
        className="min-h-screen bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${thuVienXanhBackground})` }}
      >
        <TopNavBar searchValue="" onSearchChange={() => undefined} onSearchSubmit={() => undefined} />
        <div className="max-w-3xl mx-auto p-6">
          <div className="rounded-2xl border border-cyan-200 bg-white p-6 text-slate-700">Thiếu `itemId` trên URL.</div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div
        className="min-h-screen bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${thuVienXanhBackground})` }}
      >
        <TopNavBar searchValue="" onSearchChange={() => undefined} onSearchSubmit={() => undefined} />
        <div className="max-w-3xl mx-auto p-6">
          <div className="rounded-2xl border border-cyan-200 bg-white p-6 text-slate-700">Đang tải nội dung tích hợp...</div>
        </div>
      </div>
    )
  }

  if (error || !task) {
    return (
      <div
        className="min-h-screen bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${thuVienXanhBackground})` }}
      >
        <TopNavBar searchValue="" onSearchChange={() => undefined} onSearchSubmit={() => undefined} />
        <div className="max-w-3xl mx-auto p-6">
          <div className="rounded-2xl border border-cyan-200 bg-white p-6 text-red-600">
            {error || 'Không thể tải dữ liệu tích hợp.'}
          </div>
        </div>
      </div>
    )
  }

  const content = {
    itemId,
    passageTitle: textTitle,
    passageContent: textContent,
    passageImageUrl: imageUrl,
    fullPageImageUrl: itemId === 't_env_01' ? bachTuocFullPageImage : null,
    integrationPrompt: task.prompt,
  }

  const { leftPanel, rightPanel } = TichHopBody({
    content,
    userRole,
    answer,
    selectedFiles,
    allowedFileTypes: task.allowedFileTypes,
    maxFileSizeMB: task.maxFileSize,
    onChangeAnswer: setAnswer,
    onChangeFiles: setSelectedFiles,
    onSubmit: handleSubmit,
    isClassStudent,
  })

  return (
    <div
      className="min-h-screen bg-center bg-cover bg-no-repeat"
      style={{ backgroundImage: `url(${thuVienXanhBackground})` }}
    >
      <TopNavBar
        searchValue=""
        onSearchChange={() => undefined}
        onSearchSubmit={() => undefined}
      />
      <FullscreenModalShell
        titleLeft={content.passageTitle}
        titleRight="TÍCH HỢP GIÁO DỤC PHÁT TRIỂN BỀN VỮNG"
        dirty={dirty}
        onClose={() => navigate('/thu-vien-xanh?mode=tich-hop')}
        leftPanel={leftPanel}
        rightPanel={rightPanel}
      />
    </div>
  )
}
