export interface Question {
  id: string
  type: 'multiple-choice' | 'short-answer'
  question: string
  options?: string[]
  correctAnswer?: string
  order: number
}

export interface TextDetail {
  id: string
  title: string
  type: string
  content: string
  difficulty: string | null
  categoryId: string
  categoryName: string
  hasReadingQuiz: boolean
  hasIntegratedTask: boolean
  readingQuestions?: Question[]
  integratedTasks?: any[] // TODO: Define integrated task type
}

export interface SubmitAnswerRequest {
  textId: string
  questionId: string
  answer: string
  type: 'reading' | 'integrated'
}

export interface SubmitAnswerResponse {
  isCorrect: boolean
  correctAnswer?: string
  feedback?: string
}