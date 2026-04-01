import { type ChangeEvent } from 'react'
import { type DocHieuContent } from '../../types/thuVienXanh'

interface DocHieuBodyProps {
  content: DocHieuContent
  mcqAnswers: Record<string, string>
  shortAnswer: string
  submitted: boolean
  score: number | null
  mcqResults: Record<string, { isCorrect: boolean; correctAnswer: string }>
  onChangeMcq: (questionId: string, option: string) => void
  onChangeShortAnswer: (value: string) => void
  onSubmit: () => void
  isClassStudent?: boolean
}

export default function DocHieuBody({
  content,
  mcqAnswers,
  shortAnswer,
  submitted,
  score,
  mcqResults,
  onChangeMcq,
  onChangeShortAnswer,
  onSubmit,
  isClassStudent = true,
}: DocHieuBodyProps) {
  const renderPassageWithAnnotations = () => {
    if (!content.annotations || content.annotations.length === 0) {
      return <div className="mt-3 whitespace-pre-wrap text-slate-700 leading-relaxed">{content.passageContent}</div>
    }

    let passageHTML = content.passageContent
    const parts: Array<{ type: 'text' | 'annotation'; content: string; annotationId?: string }> = []
    let lastIndex = 0

    content.annotations.forEach((annotation) => {
      const index = passageHTML.indexOf(annotation.textHighlight)
      if (index !== -1) {
        if (index > lastIndex) {
          parts.push({ type: 'text', content: passageHTML.substring(lastIndex, index) })
        }
        parts.push({ type: 'annotation', content: annotation.textHighlight, annotationId: annotation.id })
        lastIndex = index + annotation.textHighlight.length
      }
    })

    if (lastIndex < passageHTML.length) {
      parts.push({ type: 'text', content: passageHTML.substring(lastIndex) })
    }

    return (
      <div className="mt-3 text-slate-700 leading-relaxed whitespace-pre-wrap">
        {parts.length > 0
          ? parts.map((part, index) => {
              if (part.type === 'text') {
                return <span key={index}>{part.content}</span>
              }
              return (
                <span
                  key={index}
                  className="underline font-semibold text-blue-700"
                >
                  {part.content}
                </span>
              )
            })
          : content.passageContent}
      </div>
    )
  }

  const leftPanel = (
    <div>
      <p className="font-bold text-blue-900 text-center">Ngữ liệu</p>
      {content.fullPageImageUrl ? (
        <div className="mt-3 rounded-2xl border border-cyan-200 bg-white p-2">
          <img
            src={content.fullPageImageUrl}
            alt={`${content.passageTitle} - toàn văn`}
            className="w-full h-auto rounded-xl"
          />
        </div>
      ) : (
        <>
          {renderPassageWithAnnotations()}
          <div className="mt-5 h-48 rounded-2xl border border-dashed border-cyan-300 bg-[#1f3f8f]/80 flex items-center justify-center text-white">
            {content.passageImageUrl ? (
              <img src={content.passageImageUrl} alt={content.passageTitle} className="w-full h-full rounded-2xl object-cover" />
            ) : (
              <span>Ảnh</span>
            )}
          </div>
        </>
      )}
      {content.annotations && content.annotations.length > 0 && (
        <div className="mt-5 space-y-2">
          <p className="font-bold text-blue-900">Chú thích:</p>
          {content.annotations.map((annotation) => (
            <article
              key={annotation.id}
              className="w-full text-left p-3 rounded-lg border-2 border-cyan-200 bg-white text-slate-700"
            >
              <p className="font-semibold text-sm mb-1">{annotation.textHighlight}</p>
              <p className="text-sm">{annotation.annotationText}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  )

  const handleTextArea = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChangeShortAnswer(event.target.value)
  }

  const rightPanel = (
    <div className="space-y-5 pr-5">
      {submitted && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-emerald-800 font-bold">
          Đã nộp bài • Điểm: {score ?? 0}/100
        </div>
      )}

      <section>
        <h4 className="font-extrabold text-blue-900">Câu hỏi trắc nghiệm</h4>
        <div className="mt-3 space-y-4">
          {content.mcq.map((question) => (
            <article key={question.id} className="rounded-2xl bg-white p-4 border border-cyan-200">
              <p className="font-semibold text-slate-800">{question.question}</p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {question.options.map((option) => {
                  const selected = mcqAnswers[question.id] === option
                  const result = mcqResults[question.id]
                  const isCorrectOption = submitted && isClassStudent && option === result?.correctAnswer
                  const isWrongSelected = submitted && isClassStudent && selected && option !== result?.correctAnswer

                  const className = submitted
                    ? isCorrectOption
                      ? 'border-emerald-500 bg-emerald-100 text-emerald-900'
                      : isWrongSelected
                        ? 'border-red-500 bg-red-100 text-red-900'
                        : 'border-cyan-200 bg-white text-slate-700'
                    : selected
                      ? 'border-teal-600 bg-teal-50 text-teal-800'
                      : 'border-cyan-200 bg-white text-slate-700 hover:bg-cyan-50'

                  return (
                    <button
                      key={`${question.id}-${option}`}
                      disabled={submitted}
                      onClick={() => onChangeMcq(question.id, option)}
                      className={`rounded-xl border px-3 py-2 text-left font-medium transition disabled:cursor-not-allowed ${className}`}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>

              {submitted && isClassStudent && mcqResults[question.id] && (
                <p
                  className={`mt-3 text-sm font-semibold ${
                    mcqResults[question.id].isCorrect ? 'text-emerald-700' : 'text-red-700'
                  }`}
                >
                  {mcqResults[question.id].isCorrect
                    ? '✓ Đúng'
                    : `✗ Sai • Đáp án đúng: ${mcqResults[question.id].correctAnswer}`}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>

      <section>
        <h4 className="font-extrabold text-blue-900">Câu hỏi tự luận</h4>
        {!!content.shortQuestions?.length && (
          <div className="mt-3 space-y-3">
            {content.shortQuestions.map((question, index) => (
              <article key={`${index}-${question}`} className="rounded-2xl bg-white p-4 border border-cyan-200">
                <p className="font-semibold text-slate-800">{question}</p>
              </article>
            ))}
          </div>
        )}
        <textarea
          value={shortAnswer}
          onChange={handleTextArea}
          disabled={submitted}
          placeholder="Nhập câu trả lời cho phần tự luận..."
          className="mt-3 w-full h-36 rounded-2xl border border-cyan-200 bg-white px-4 py-3 resize-none outline-none focus:ring-2 focus:ring-teal-500"
        />
      </section>

      <div className="flex justify-end">
        <button
          onClick={onSubmit}
          disabled={submitted}
          className="rounded-full px-8 py-3 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-400 text-white font-extrabold"
        >
          {submitted ? 'ĐÃ NỘP' : 'NỘP BÀI'}
        </button>
      </div>
    </div>
  )

  return { leftPanel, rightPanel }
}
