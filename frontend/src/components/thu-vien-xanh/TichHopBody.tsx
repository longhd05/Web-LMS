import { type ChangeEvent, type DragEvent } from 'react'
import { type TichHopContent, type ThuVienXanhUserRole } from '../../types/thuVienXanh'
import { renderSimpleMarkdown } from '../../utils/simpleMarkdown'

interface TichHopBodyProps {
  content: TichHopContent
  userRole: ThuVienXanhUserRole
  answer: string
  selectedFiles: File[]
  allowedFileTypes?: string[]
  maxFileSizeMB?: number
  onChangeAnswer: (value: string) => void
  onChangeFiles: (files: File[]) => void
  onSubmit: () => void
  isClassStudent?: boolean
}

interface BachTuocAnchor {
  id: string
  label: string
  leftPercent: number
  topPercent: number
  targetId: string
  kind: 'word' | 'note'
}

export default function TichHopBody({
  content,
  userRole,
  answer,
  selectedFiles,
  allowedFileTypes,
  maxFileSizeMB,
  onChangeAnswer,
  onChangeFiles,
  onSubmit,
  isClassStudent = false,
}: TichHopBodyProps) {
  const dropzoneInputId = 'tich-hop-dropzone-file'
  const isBachTuoc = content.itemId === 't_env_01' && Boolean(content.fullPageImageUrl)

  const bachTuocAnchors: BachTuocAnchor[] = isBachTuoc
    ? [
        { id: 'word-1', label: '(1)', leftPercent: 71.5, topPercent: 27, targetId: 'note-1', kind: 'word' },
        { id: 'word-2', label: '(2)', leftPercent: 62.5, topPercent: 34, targetId: 'note-2', kind: 'word' },
        { id: 'word-3', label: '(3)', leftPercent: 73.9, topPercent: 74, targetId: 'note-3', kind: 'word' },
        { id: 'note-1', label: '(1)', leftPercent: 6.6, topPercent: 94.7, targetId: 'word-1', kind: 'note' },
        { id: 'note-2', label: '(2)', leftPercent: 6.6, topPercent: 95.3, targetId: 'word-2', kind: 'note' },
        { id: 'note-3', label: '(3)', leftPercent: 6.6, topPercent: 95.9, targetId: 'word-3', kind: 'note' },
      ]
    : []

  const scrollToBachTuocAnchor = (anchorId: string) => {
    const target = document.getElementById(anchorId)
    if (!target) return
    target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
  }

  const leftPanel = (
    <div>
      <p className="font-bold text-blue-900">Ngữ liệu</p>
      {content.fullPageImageUrl ? (
        <div className="relative mt-3 rounded-2xl border border-cyan-200 bg-white p-2">
          <img src={content.fullPageImageUrl} alt={`${content.passageTitle} - toàn văn`} className="w-full h-auto rounded-xl" />
          {bachTuocAnchors.map((anchor) => (
            <button
              key={anchor.id}
              id={anchor.id}
              type="button"
              aria-label={anchor.kind === 'word' ? `Word anchor ${anchor.label}` : `Note anchor ${anchor.label}`}
              onClick={() => scrollToBachTuocAnchor(anchor.targetId)}
              className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-md border text-[11px] font-bold transition-all ${
                anchor.kind === 'word'
                  ? anchor.id === 'word-2'
                    ? 'px-8 py-1 min-w-[44px]'
                    : anchor.id === 'word-3'
                      ? 'px-4 py-1 min-w-[34px]'
                      : 'px-2.5 py-1'
                  : 'px-2 py-0.5'
              } border-transparent bg-transparent text-transparent hover:border-transparent hover:bg-transparent`}
              style={{
                left: `${anchor.leftPercent}%`,
                top: `${anchor.topPercent}%`,
              }}
            >
              {anchor.label}
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="mt-3 whitespace-pre-wrap text-slate-700 leading-relaxed">{content.passageContent}</div>
          <div className="mt-5 h-48 rounded-2xl border border-dashed border-cyan-300 bg-white/80 flex items-center justify-center text-slate-500">
            {content.passageImageUrl ? (
              <img src={content.passageImageUrl} alt={content.passageTitle} className="w-full h-full rounded-2xl object-cover" />
            ) : (
              <span>Ảnh</span>
            )}
          </div>
        </>
      )}
    </div>
  )

  const handleTextArea = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChangeAnswer(event.target.value)
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : []
    onChangeFiles(files.slice(0, 5))
  }

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
  }

  const handleDragLeave = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
  }

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    const files = Array.from(event.dataTransfer.files || [])
    onChangeFiles(files.slice(0, 5))
  }

  const showUpload = userRole !== 'free_student' && isClassStudent
  const acceptValue = (allowedFileTypes || ['pdf', 'doc', 'docx', 'png', 'jpg', 'mp4'])
    .map((extension) => `.${extension}`)
    .join(',')
  const fileSizeLabel = maxFileSizeMB ?? 20

  const rightPanel = (
    <div className="space-y-5 pr-5">
      <section>
        <p className="font-bold text-blue-900">Đề bài:</p>
        <div className="mt-2 text-slate-700 leading-relaxed">{renderSimpleMarkdown(content.integrationPrompt)}</div>
      </section>

      {showUpload && (
        <section>
          <label className="block font-semibold text-slate-800 mb-2">Tải file bài làm</label>
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor={dropzoneInputId}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="flex flex-col items-center justify-center w-full h-64 rounded-2xl border border-dashed cursor-pointer transition-colors border-cyan-300 bg-white/80 text-slate-600 hover:bg-slate-50"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                <svg
                  className="w-8 h-8 mb-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 17h3a3 3 0 0 0 0-6h-.025a5.56 5.56 0 0 0 .025-.5A5.5 5.5 0 0 0 7.207 9.021C7.137 9.017 7.071 9 7 9a4 4 0 1 0 0 8h2.167M12 19v-9m0 0-2 2m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-sm">
                  <span className="font-semibold">Click để tải file</span> hoặc kéo thả vào đây
                </p>
                <p className="text-xs">Tối đa 5 file • Định dạng: {acceptValue.replace(/,/g, ', ')} • Mỗi file tối đa {fileSizeLabel}MB</p>
              </div>
              <input
                id={dropzoneInputId}
                type="file"
                multiple
                accept={acceptValue}
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
          <p className="mt-1 text-xs text-slate-500">Tối đa 5 file, mỗi file tối đa {fileSizeLabel}MB</p>
          {selectedFiles.length > 0 && (
            <ul className="mt-2 text-sm text-slate-600 space-y-1">
              {selectedFiles.map((file) => (
                <li key={file.name}>• {file.name}</li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section>
        <textarea
          value={answer}
          onChange={handleTextArea}
          placeholder="Nhập câu trả lời hoặc nội dung bài làm..."
          className="w-full h-44 rounded-2xl border border-cyan-200 bg-white px-4 py-3 resize-none outline-none focus:ring-2 focus:ring-teal-500"
        />
      </section>

      {showUpload && (
        <button
          onClick={onSubmit}
          className="w-full sm:w-auto rounded-full px-8 py-3 bg-teal-700 hover:bg-teal-800 text-white font-extrabold"
        >
          NỘP BÀI
        </button>
      )}

      {!isClassStudent && (
        <div className="rounded-2xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-yellow-800 text-sm font-medium">
          ⚠️ Bạn cần là học sinh trong lớp để thực hiện tính năng này
        </div>
      )}
    </div>
  )

  return { leftPanel, rightPanel }
}
