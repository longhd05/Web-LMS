import { useState, useRef, useEffect } from 'react'
import { X, ArrowLeft, Upload, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useIntegratedTask } from '../../hooks/useIntegratedTask'
import { uploadSubmission } from '../../api/integratedTask'
import { useAuth } from '../../contexts/AuthContext'
import ConfirmDialog from '../common/ConfirmDialog'
import { renderSimpleMarkdown } from '../../utils/simpleMarkdown'

interface IntegratedTaskModalProps {
  isOpen: boolean
  onClose: () => void
  textId: string
}

export default function IntegratedTaskModal({
  isOpen,
  onClose,
  textId,
}: IntegratedTaskModalProps) {
  const { task, textContent, textTitle, loading, error } = useIntegratedTask(isOpen ? textId : null)
  const { isClassStudent, isIndependentStudent, user } = useAuth()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Refs cho scroll indicators
  const leftScrollRef = useRef<HTMLDivElement>(null)
  const rightScrollRef = useRef<HTMLDivElement>(null)
  const [leftScrollProgress, setLeftScrollProgress] = useState(0)
  const [rightScrollProgress, setRightScrollProgress] = useState(0)

  // Log API endpoint khi mở modal
  useEffect(() => {
    if (isOpen && textId) {
      const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
      const apiEndpoint = `${BASE_URL}/texts/${textId}/integrated-task`
      console.log('📍 [TÍCH HỢP] API Endpoint:', apiEndpoint)
      console.log('📚 [TÍCH HỢP] Text ID:', textId)
    }
  }, [isOpen, textId])

  // Reset state khi đóng modal
  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null)
      setUploadSuccess(false)
      setUploadError(null)
      setShowConfirmDialog(false)
    }
  }, [isOpen])

  // Track scroll progress
  useEffect(() => {
    const handleLeftScroll = () => {
      if (!leftScrollRef.current) return
      const { scrollTop, scrollHeight, clientHeight } = leftScrollRef.current
      const progress = scrollHeight > clientHeight 
        ? (scrollTop / (scrollHeight - clientHeight)) * 100 
        : 0
      setLeftScrollProgress(progress)
    }

    const handleRightScroll = () => {
      if (!rightScrollRef.current) return
      const { scrollTop, scrollHeight, clientHeight } = rightScrollRef.current
      const progress = scrollHeight > clientHeight 
        ? (scrollTop / (scrollHeight - clientHeight)) * 100 
        : 0
      setRightScrollProgress(progress)
    }

    const leftEl = leftScrollRef.current
    const rightEl = rightScrollRef.current

    leftEl?.addEventListener('scroll', handleLeftScroll)
    rightEl?.addEventListener('scroll', handleRightScroll)

    handleLeftScroll()
    handleRightScroll()

    return () => {
      leftEl?.removeEventListener('scroll', handleLeftScroll)
      rightEl?.removeEventListener('scroll', handleRightScroll)
    }
  }, [loading, error, task])

  useEffect(() => {
    console.log('🔍 [DEBUG] showConfirmDialog:', showConfirmDialog)
    console.log('🔍 [DEBUG] selectedFile:', selectedFile)
    console.log('🔍 [DEBUG] uploadSuccess:', uploadSuccess)
  }, [showConfirmDialog, selectedFile, uploadSuccess])

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleCloseAttempt()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, uploadSuccess, selectedFile])

  if (!isOpen) return null

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !task) return

    const maxSizeBytes = task.maxFileSize * 1024 * 1024
    if (file.size > maxSizeBytes) {
      setUploadError(`File quá lớn! Kích thước tối đa: ${task.maxFileSize}MB`)
      return
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase()
    if (fileExt && !task.allowedFileTypes.includes(fileExt)) {
      setUploadError(`Định dạng file không hợp lệ! Chỉ chấp nhận: ${task.allowedFileTypes.join(', ')}`)
      return
    }

    setSelectedFile(file)
    setUploadError(null)
    setUploadSuccess(false)
  }

  const handleUpload = async () => {
    if (!selectedFile || !task) return

    setUploading(true)
    setUploadError(null)

    try {
      await uploadSubmission(task.id, selectedFile)
      setUploadSuccess(true)
      console.log('✅ File uploaded successfully')
      
      setTimeout(() => {
        setSelectedFile(null)
        setUploadSuccess(false)
      }, 3000)
    } catch (err: any) {
      console.error('❌ Failed to upload file:', err)
      setUploadError(err.message || 'Không thể tải file lên')
    } finally {
      setUploading(false)
    }
  }

  // Check nếu cần confirm trước khi đóng
  const handleCloseAttempt = () => {
    console.log('🚪 [CLOSE ATTEMPT]', {
      hasFile: !!selectedFile,
      isSuccess: uploadSuccess,
      shouldConfirm: !!(selectedFile && !uploadSuccess)
    })
    
    if (selectedFile && !uploadSuccess) {
      console.log('✅ Showing confirm dialog')
      setShowConfirmDialog(true)
    } else {
      console.log('❌ Closing without confirm')
      onClose()
    }
  }

  // Xác nhận đóng modal
  const handleConfirmClose = () => {
    setShowConfirmDialog(false)
    onClose()
  }

  // Hủy đóng modal
  const handleCancelClose = () => {
    setShowConfirmDialog(false)
  }

  // Handle click backdrop
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCloseAttempt()
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const canUpload = isClassStudent

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full h-[90vh] max-w-7xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 flex items-center justify-between text-white flex-shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCloseAttempt}
                className="flex items-center gap-2 px-4 py-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Thoát mà chưa lưu</span>
              </button>
              <div className="h-6 w-px bg-white/30"></div>
              <h2 className="text-xl font-bold">{textTitle || 'Đang tải...'}</h2>
              {user && (
                <div className="flex items-center gap-2">
                  {isClassStudent && (
                    <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                      🎓 Lớp {user.className}
                    </span>
                  )}
                  {isIndependentStudent && (
                    <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                      🏠 Học sinh tự do
                    </span>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={handleCloseAttempt}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Đang tải nội dung...</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}

          {/* Content - 2 columns */}
          {!loading && !error && task && (
            <div className="flex-1 flex overflow-hidden">
              {/* Left: Text content với custom scrollbar */}
              <div className="w-1/2 border-r border-gray-200 relative bg-amber-50">
                <div 
                  ref={leftScrollRef}
                  className="h-full overflow-y-auto pr-6"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
                >
                  <style>{`
                    .hide-scrollbar::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>
                  <div className="p-8 hide-scrollbar">
                    <div className="mb-4">
                      <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                        Tên đoạn trích
                      </span>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">{textTitle}</h3>
                    </div>
                    <div className="prose prose-lg max-w-none">
                      <div className="text-gray-800 leading-relaxed whitespace-pre-wrap italic text-justify">
                        {textContent}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Custom scrollbar - Thanh cuộn ngữ liệu */}
                <div className="absolute right-2 top-4 bottom-4 w-2 bg-gray-300/30 rounded-full overflow-hidden">
                  <div 
                    className="w-full bg-teal-500 rounded-full transition-all duration-150"
                    style={{ 
                      height: '30%',
                      transform: `translateY(${leftScrollProgress * 2.33}%)`
                    }}
                  />
                </div>
              </div>

              {/* Right: Task prompt and upload với custom scrollbar */}
              <div className="w-1/2 relative bg-gray-50">
                <div 
                  ref={rightScrollRef}
                  className="h-full overflow-y-auto pr-6"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
                >
                  <div className="p-8 hide-scrollbar">
                    <div className="text-center mb-8">
                      <h3 className="text-3xl font-bold text-gray-900">TÍCH HỢP</h3>
                    </div>

                    {isIndependentStudent && (
                      <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-300 rounded-xl">
                        <p className="text-sm text-amber-800 font-medium">
                          ℹ️ Bạn là <strong>học sinh tự do</strong>, chỉ có thể xem đề bài. Nộp bài dành cho học sinh thuộc lớp.
                        </p>
                      </div>
                    )}

                    {/* Task prompt */}
                    <div className="mb-8 bg-white rounded-xl p-6 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Đề bài:
                      </h4>
                      <div className="text-gray-800 leading-relaxed">
                        {renderSimpleMarkdown(task.prompt)}
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-6 text-sm text-gray-600 flex-wrap">
                          <div>
                            <span className="font-medium">Kích thước tối đa:</span>{' '}
                            <span className="text-purple-600 font-semibold">{task.maxFileSize}MB</span>
                          </div>
                          <div>
                            <span className="font-medium">Định dạng:</span>{' '}
                            <span className="text-purple-600 font-semibold">
                              {task.allowedFileTypes.join(', ').toUpperCase()}
                            </span>
                          </div>
                        </div>
                        {task.dueDate && (
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Hạn nộp:</span>{' '}
                            <span className="text-red-600 font-semibold">
                              {new Date(task.dueDate).toLocaleString('vi-VN')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {canUpload && (
                      <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                          Nộp bài của bạn:
                        </h4>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept={task.allowedFileTypes.map(ext => '.' + ext).join(',')}
                          onChange={handleFileSelect}
                          className="hidden"
                        />

                        <div
                          onClick={() => !uploading && !uploadSuccess && fileInputRef.current?.click()}
                          className={`
                            border-2 border-dashed rounded-xl p-8 text-center transition-all
                            ${uploadSuccess
                              ? 'border-green-400 bg-green-50 cursor-default'
                              : selectedFile
                              ? 'border-purple-400 bg-purple-50 cursor-pointer'
                              : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50 cursor-pointer'
                            }
                            ${uploading ? 'pointer-events-none opacity-50' : ''}
                          `}
                        >
                          {uploadSuccess ? (
                            <>
                              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                              <p className="text-green-700 font-bold mb-1">
                                Nộp bài thành công!
                              </p>
                              <p className="text-sm text-green-600">
                                Giáo viên sẽ chấm điểm sau
                              </p>
                            </>
                          ) : !selectedFile ? (
                            <>
                              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                              <p className="text-gray-700 font-medium mb-1">
                                Click để chọn file
                              </p>
                              <p className="text-sm text-gray-500">
                                hoặc kéo thả file vào đây
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                Định dạng: {task.allowedFileTypes.join(', ').toUpperCase()}
                              </p>
                            </>
                          ) : (
                            <>
                              <FileText className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                              <p className="text-gray-900 font-medium mb-1">
                                {selectedFile.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {formatFileSize(selectedFile.size)}
                              </p>
                            </>
                          )}
                        </div>

                        {uploadError && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{uploadError}</p>
                          </div>
                        )}

                        {selectedFile && !uploadSuccess && (
                          <div className="mt-6 flex gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedFile(null)
                                setUploadError(null)
                              }}
                              disabled={uploading}
                              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
                            >
                              Hủy
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleUpload()
                              }}
                              disabled={uploading}
                              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                            >
                              {uploading ? (
                                <>
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                  Đang tải lên...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-5 h-5" />
                                  Nộp bài
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Custom scrollbar - Thanh cuộn bài tập */}
                <div className="absolute right-2 top-4 bottom-4 w-2 bg-gray-300/30 rounded-full overflow-hidden">
                  <div 
                    className="w-full bg-purple-500 rounded-full transition-all duration-150"
                    style={{ 
                      height: '30%',
                      transform: `translateY(${rightScrollProgress * 2.33}%)`
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Xác nhận thoát"
        message="Bạn có chắc chắn muốn thoát ra ngoài? File bạn đã chọn sẽ bị hủy."
        onConfirm={handleConfirmClose}
        onCancel={handleCancelClose}
        confirmText="Có"
        cancelText="Không"
      />
    </>
  )
}
