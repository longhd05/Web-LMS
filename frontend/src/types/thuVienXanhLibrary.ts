export interface ThuVienXanhCategory {
  id: string
  name: string
  color: string
  textCount: number
}

export interface ThuVienXanhTextItem {
  id: string
  title: string
  type: string
  categoryId: string
  coverUrl: string | null
  difficulty: string | null
  hasReadingQuiz: boolean
  hasIntegratedTask: boolean
}

export interface ThuVienXanhCategoryWithTexts extends ThuVienXanhCategory {
  texts: ThuVienXanhTextItem[]
  loading: boolean
  error: string | null
}
