import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import TopNavBar from '../../components/thu-vien-xanh/TopNavBar'
import FullscreenModalShell from '../../components/thu-vien-xanh/FullscreenModalShell'
import DocHieuBody from '../../components/thu-vien-xanh/DocHieuBody'
import { useReadingComprehension } from '../../hooks/useReadingComprehension'
import { submitReadingQuiz } from '../../api/readingComprehension'

type McqResultMap = Record<string, { isCorrect: boolean; correctAnswer: string }>
const thuVienXanhBackground = new URL('../../img/1x/hinh-nen.png', import.meta.url).href

export default function DocHieuFullscreenModal() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const itemId = searchParams.get('itemId')
  const imageUrl = searchParams.get('imageUrl')
  const { textDetail, loading, error } = useReadingComprehension(itemId)

  const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>({})
  const [shortAnswer, setShortAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [mcqResults, setMcqResults] = useState<McqResultMap>({})
  const [score, setScore] = useState<number | null>(null)

  const dirty = useMemo(
    () => !submitted && (Object.keys(mcqAnswers).length > 0 || shortAnswer.trim().length > 0),
    [submitted, mcqAnswers, shortAnswer],
  )

  const handleChangeMcq = (questionId: string, option: string) => {
    setMcqAnswers((previous) => ({ ...previous, [questionId]: option }))
  }

  const handleSubmit = () => {
    if (!itemId || !textDetail) {
      window.alert('Không tìm thấy dữ liệu bài đọc hiểu.')
      return
    }
    const hasAtLeastOne = Object.keys(mcqAnswers).length > 0 || shortAnswer.trim().length > 0
    if (!hasAtLeastOne) {
      window.alert('Vui lòng trả lời ít nhất một phần trước khi nộp bài.')
      return
    }
    submitReadingQuiz(itemId, { ...mcqAnswers, shortAnswer })
      .then((result) => {
        const results: McqResultMap = {}
        mcq.forEach((question) => {
          const selected = mcqAnswers[question.id]
          const correctAnswer = question.correctAnswer ?? ''
          results[question.id] = {
            isCorrect: selected === correctAnswer,
            correctAnswer,
          }
        })
        setMcqResults(results)
        setScore(result.score)
        setSubmitted(true)
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
          <div className="rounded-2xl border border-cyan-200 bg-white p-6 text-slate-700">Đang tải nội dung đọc hiểu...</div>
        </div>
      </div>
    )
  }

  if (error || !textDetail) {
    return (
      <div
        className="min-h-screen bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${thuVienXanhBackground})` }}
      >
        <TopNavBar searchValue="" onSearchChange={() => undefined} onSearchSubmit={() => undefined} />
        <div className="max-w-3xl mx-auto p-6">
          <div className="rounded-2xl border border-cyan-200 bg-white p-6 text-red-600">
            {error || 'Không thể tải dữ liệu đọc hiểu.'}
          </div>
        </div>
      </div>
    )
  }

  const mcq = (textDetail.readingQuestions || [])
    .filter((question) => question.type === 'multiple-choice')
    .map((question) => ({
      id: question.id,
      question: question.question,
      options: question.options || [],
      correctAnswer: question.correctAnswer ?? null,
    }))

  const shortQuestions = (textDetail.readingQuestions || [])
    .filter((question) => question.type === 'short-answer')
    .map((question) => question.question)

  const content = {
    itemId,
    passageTitle: textDetail.title,
    passageContent: textDetail.content,
    passageImageUrl: imageUrl,
    shortQuestions,
    mcq,
  }

  const { leftPanel, rightPanel } = DocHieuBody({
    content,
    mcqAnswers,
    shortAnswer,
    submitted,
    score,
    mcqResults,
    onChangeMcq: handleChangeMcq,
    onChangeShortAnswer: setShortAnswer,
    onSubmit: handleSubmit,
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
        titleRight="VĂN BẢN ĐỌC HIỂU"
        dirty={dirty}
        onClose={() => navigate('/thu-vien-xanh?mode=doc-hieu')}
        leftPanel={leftPanel}
        rightPanel={rightPanel}
      />
    </div>
  )
}
