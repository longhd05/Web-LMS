export interface IntegratedTask {
  id: string
  textId: string
  prompt: string // Đề bài
  maxFileSize: number // MB
  allowedFileTypes: string[] // ['pdf', 'docx', 'txt']
  dueDate?: string
}

export interface SubmissionFile {
  id: string
  taskId: string
  studentId: string
  fileName: string
  fileSize: number
  fileUrl: string
  uploadedAt: string
  status: 'pending' | 'graded'
  grade?: number
  feedback?: string
}