import { type ChangeEvent } from 'react'
import { type TichHopContent, type ThuVienXanhUserRole } from '../../types/thuVienXanh'

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
}: TichHopBodyProps) {
  const leftPanel = (
    <div>
      <p className="font-bold text-blue-900">Ngữ liệu</p>
      <div className="mt-3 whitespace-pre-wrap text-slate-700 leading-relaxed">{content.passageContent}</div>
      <div className="mt-5 h-48 rounded-2xl border border-dashed border-cyan-300 bg-white/80 flex items-center justify-center text-slate-500">
        {content.passageImageUrl ? (
          <img src={content.passageImageUrl} alt={content.passageTitle} className="w-full h-full rounded-2xl object-cover" />
        ) : (
          <span>Ảnh</span>
        )}
      </div>
    </div>
  )

  const handleTextArea = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChangeAnswer(event.target.value)
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : []
    onChangeFiles(files.slice(0, 5))
  }

  const showUpload = userRole !== 'free_student'
  const acceptValue = (allowedFileTypes || ['pdf', 'doc', 'docx', 'png', 'jpg'])
    .map((extension) => `.${extension}`)
    .join(',')
  const fileSizeLabel = maxFileSizeMB ?? 20

  const rightPanel = (
    <div className="space-y-5 pr-5">
      <section>
        <p className="font-bold text-blue-900">Đề bài:</p>
        <div className="mt-2 whitespace-pre-wrap text-slate-700 leading-relaxed">{content.integrationPrompt}</div>
      </section>

      {showUpload && (
        <section>
          <label className="block font-semibold text-slate-800 mb-2">Tải file bài làm</label>
          <input
            type="file"
            multiple
            accept={acceptValue}
            onChange={handleFileChange}
            className="block w-full rounded-xl border border-cyan-200 bg-white px-3 py-2 text-slate-700"
          />
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

      <button
        onClick={onSubmit}
        className="w-full sm:w-auto rounded-full px-8 py-3 bg-teal-700 hover:bg-teal-800 text-white font-extrabold"
      >
        NỘP BÀI
      </button>
    </div>
  )

  return { leftPanel, rightPanel }
}
