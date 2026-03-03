import { useState, useEffect } from 'react'
import { X, ArrowLeft, ChevronRight, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { useReadingComprehension } from '../../hooks/useReadingComprehension'
import { submitReadingQuiz } from '../../api/readingComprehension'
import { useAuth } from '../../contexts/AuthContext'
import ConfirmDialog from '../common/ConfirmDialog' // 👈 Import

interface ReadingComprehensionModalProps {
  isOpen: boolean
  onClose: () => void
  textId: string
}

export default function ReadingComprehensionModal({
  isOpen,
  onClose,
  textId,
}: ReadingComprehensionModalProps) {
  const { textDetail, loading, error } = useReadingComprehension(isOpen ? textId : null)
  const { isClassStudent, isIndependentStudent, user } = useAuth()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<{
    score: number
    totalQuestions: number
    feedback: string
  } | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false) // 👈 State cho confirm dialog

  // Log API endpoint
  useEffect(() => {
    if (isOpen && textId) {
      const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
      const apiEndpoint = `${BASE_URL}/api/texts/${textId}`
      console.log('📍 [ĐỌC HIỂU] API Endpoint:', apiEndpoint)
      console.log('📚 [ĐỌC HIỂU] Text ID:', textId)
    }
  }, [isOpen, textId])

  // Reset state khi đóng modal
  useEffect(() => {
    if (!isOpen) {
      setAnswers({})
      setResult(null)
      setSubmitted(false)
      setShowConfirmDialog(false)
    }
  }, [isOpen])

  // 👇 Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleCloseAttempt()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, submitted, answers])

  if (!isOpen) return null

  const multipleChoiceQuestions = textDetail?.readingQuestions?.filter(q => q.type === 'multiple-choice') || []
  const shortAnswerQuestions = textDetail?.readingQuestions?.filter(q => q.type === 'short-answer') || []

  const handleSubmit = async () => {
    if (!textDetail) return
    
    setSubmitting(true)
    try {
      const response = await submitReadingQuiz(textDetail.id, answers)
      setResult(response)
      setSubmitted(true)
      console.log('✅ Quiz submitted:', response)
    } catch (err) {
      console.error('❌ Failed to submit quiz:', err)
      alert('Không thể nộp bài, vui lòng thử lại')
    } finally {
      setSubmitting(false)
    }
  }

  // 👇 Check nếu cần confirm trước khi đóng
  const handleCloseAttempt = () => {
    if (!submitted && Object.keys(answers).length > 0) {
      setShowConfirmDialog(true)
    } else {
      onClose()
    }
  }

  // 👇 Xác nhận đóng modal
  const handleConfirmClose = () => {
    setShowConfirmDialog(false)
    onClose()
  }

  // 👇 Hủy đóng modal
  const handleCancelClose = () => {
    setShowConfirmDialog(false)
  }

  // 👇 Handle click backdrop
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCloseAttempt()
    }
  }

  const isCorrect = (questionId: string, answer: string) => {
    const question = multipleChoiceQuestions.find(q => q.id === questionId)
    return answer === question?.correctAnswer
  }

  const canAccessShortAnswer = isClassStudent

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={handleBackdropClick} // 👈 Click backdrop
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full h-[90vh] max-w-7xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCloseAttempt}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Thoát mà chưa lưu</span>
              </button>
              <div className="h-6 w-px bg-white/30"></div>
              <h2 className="text-xl font-bold">{textDetail?.title || 'Đang tải...'}</h2>
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
                <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
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
          {!loading && !error && textDetail && (
            <div className="flex-1 flex overflow-hidden">
              {/* Left: Text content */}
              <div className="w-1/2 border-r border-gray-200 overflow-y-auto bg-amber-50 relative">
                <div className="p-8">
                  <div className="mb-4">
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                      Tên đoạn trích
                    </span>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{textDetail.title}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-sm text-gray-600">{textDetail.type}</span>
                      {textDetail.difficulty && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full">
                            {textDetail.difficulty}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="prose prose-lg max-w-none">
                    <div className="text-gray-800 leading-relaxed whitespace-pre-wrap italic text-justify">
                      {textDetail.content}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Questions */}
              <div className="w-1/2 overflow-y-auto bg-gray-50 relative">
                <div className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-bold text-gray-900">ĐỌC HIỂU</h3>
                  </div>

                  {result && (
                    <div className={`mb-8 p-6 rounded-xl ${
                      result.score >= 70 ? 'bg-green-50 border-2 border-green-400' :
                      result.score >= 50 ? 'bg-yellow-50 border-2 border-yellow-400' :
                      'bg-red-50 border-2 border-red-400'
                    }`}>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-gray-600 mb-1">
                          Điểm trắc nghiệm
                        </div>
                        <div className="text-4xl font-bold mb-2">
                          {result.score}/100
                        </div>
                        <p className="text-gray-700 font-medium">{result.feedback}</p>
                      </div>
                    </div>
                  )}

                  {multipleChoiceQuestions.length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 italic">
                        Câu hỏi trắc nghiệm
                      </h4>
                      <div className="space-y-6">
                        {multipleChoiceQuestions.map((q, index) => {
                          const userAnswer = answers[q.id]
                          const isAnswerCorrect = submitted && userAnswer && isCorrect(q.id, userAnswer)
                          const isAnswerWrong = submitted && userAnswer && !isCorrect(q.id, userAnswer)

                          return (
                            <div key={q.id} className="bg-white rounded-xl p-6 shadow-sm">
                              <div className="flex items-start gap-3 mb-4">
                                <p className="font-medium text-gray-900 flex-1">
                                  Câu hỏi {index + 1}: {q.question}
                                </p>
                                {submitted && (
                                  <div>
                                    {isAnswerCorrect && (
                                      <CheckCircle className="w-6 h-6 text-green-600" />
                                    )}
                                    {isAnswerWrong && (
                                      <XCircle className="w-6 h-6 text-red-600" />
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="space-y-3">
                                {q.options?.map((option, optIndex) => {
                                  const isSelected = answers[q.id] === option
                                  const isCorrectAnswer = option === q.correctAnswer
                                  const showAsCorrect = submitted && isCorrectAnswer
                                  const showAsWrong = submitted && isSelected && !isCorrectAnswer

                                  return (
                                    <label
                                      key={optIndex}
                                      className={`
                                        flex items-start gap-3 p-4 rounded-lg border-2 transition-all
                                        ${!submitted && isSelected
                                          ? 'border-teal-500 bg-teal-50'
                                          : !submitted
                                          ? 'border-gray-200 hover:border-teal-300 hover:bg-gray-50 cursor-pointer'
                                          : 'border-gray-200'
                                        }
                                        ${showAsCorrect ? 'border-green-500 bg-green-50' : ''}
                                        ${showAsWrong ? 'border-red-500 bg-red-50' : ''}
                                        ${submitted ? 'cursor-default' : ''}
                                      `}
                                    >
                                      <input
                                        type="radio"
                                        name={q.id}
                                        value={option}
                                        checked={answers[q.id] === option}
                                        onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                                        disabled={submitted}
                                        className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0"
                                      />
                                      <div className="flex-1">
                                        <span className={`
                                          ${showAsCorrect ? 'text-green-900 font-semibold' : ''}
                                          ${showAsWrong ? 'text-red-900' : 'text-gray-800'}
                                        `}>
                                          {String.fromCharCode(65 + optIndex)}. {option}
                                        </span>
                                        {submitted && isSelected && !isCorrectAnswer && (
                                          <div className="mt-2 text-sm text-red-600 font-medium">
                                            ✗ Sai rồi bạn ơi
                                          </div>
                                        )}
                                        {submitted && isCorrectAnswer && (
                                          <div className="mt-2 text-sm text-green-600 font-medium">
                                            ✓ {isSelected ? 'Chính xác!' : 'Đây là đáp án đúng'}
                                          </div>
                                        )}
                                      </div>
                                    </label>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {canAccessShortAnswer && shortAnswerQuestions.length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 italic">
                        Câu hỏi tự luận ngắn
                      </h4>
                      {submitted && (
                        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            💡 Câu tự luận sẽ được giáo viên chấm điểm sau.
                          </p>
                        </div>
                      )}
                      <div className="space-y-6">
                        {shortAnswerQuestions.map((q, index) => (
                          <div key={q.id} className="bg-white rounded-xl p-6 shadow-sm">
                            <p className="font-medium text-gray-900 mb-4">
                              Câu hỏi {multipleChoiceQuestions.length + index + 1}: {q.question}
                            </p>
                            <div className="border-2 border-green-400 rounded-xl p-4 min-h-[120px]">
                              <textarea
                                value={answers[q.id] || ''}
                                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                                placeholder="CÂU HỎI TỰ LUẬN NGẮN SẼ CÓ Ô ĐIỀN"
                                disabled={submitted}
                                className="w-full h-full min-h-[100px] resize-none outline-none bg-transparent text-gray-800 placeholder:text-gray-400 placeholder:text-center disabled:opacity-70"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!submitted && (
                    <div className="flex justify-end mt-8">
                      <button
                        onClick={handleSubmit}
                        disabled={Object.keys(answers).length === 0 || submitting}
                        className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Đang nộp...
                          </>
                        ) : (
                          <>
                            Nộp bài
                            <ChevronRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {submitted && (
                    <div className="flex justify-end gap-4 mt-8">
                      <button
                        onClick={onClose}
                        className="px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                      >
                        Đóng
                      </button>
                      <button
                        onClick={() => {
                          setAnswers({})
                          setResult(null)
                          setSubmitted(false)
                        }}
                        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                      >
                        Làm lại
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 👇 Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Xác nhận thoát"
        message="Bạn có chắc chắn muốn thoát ra ngoài? Các câu trả lời chưa nộp sẽ biến mất."
        onConfirm={handleConfirmClose}
        onCancel={handleCancelClose}
        confirmText="Có"
        cancelText="Không"
      />
    </>
  )
}