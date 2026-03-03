export type ThuVienXanhMode = 'doc-hieu' | 'tich-hop'

export type ThuVienXanhUserRole = 'free_student' | 'normal_student' | 'teacher' | 'admin'

export interface ThuVienXanhUser {
  id: string
  name: string
  role: ThuVienXanhUserRole
}

export interface LibraryItem {
  id: string
  title: string
  categoryId: string
  coverUrl?: string | null
  hasDocHieu: boolean
  hasTichHop: boolean
}

export interface LibraryCategory {
  id: string
  title: string
  items: LibraryItem[]
}

export interface MCQItem {
  id: string
  question: string
  options: string[]
  correctAnswer: string | null
}

export interface DocHieuContent {
  itemId: string
  passageTitle: string
  passageContent: string
  passageImageUrl: string | null
  mcq: MCQItem[]
}

export interface TichHopContent {
  itemId: string
  passageTitle: string
  passageContent: string
  passageImageUrl: string | null
  integrationPrompt: string
}
