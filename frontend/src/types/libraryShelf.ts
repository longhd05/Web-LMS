export interface Category {
  id: string
  name: string
  color: string
  textCount: number
}

export interface TextItem {
  id: string
  title: string
  type: string
  categoryId: string
  coverUrl: string | null
  difficulty: string | null
  hasReadingQuiz: boolean
  hasIntegratedTask: boolean
}

export interface CategoryWithTexts extends Category {
  texts: TextItem[]
  loading: boolean
  error: string | null
}