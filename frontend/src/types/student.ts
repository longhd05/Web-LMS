export interface Assignment {
  id: string
  type: 'READING' | 'INTEGRATION'
  mode: 'INDIVIDUAL' | 'GROUP'
  title: string
  description?: string | null
  dueAt: string | null
  createdAt: string
  classId: string
  libraryItem: {
    id: string
    title: string
    content?: string
    fileUrl?: string
    questions?: Array<{
      id: number
      text: string
    }>
  }
  submission?: {
    id: string
    status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
    createdAt: string
    answers?: Record<number, string>
    fileUrl?: string
    feedback?: string
    score?: number
  }
  rubric?: {
    id: number
    criteria: Array<{
      id: number
      description: string
      maxScore: number
    }>
  }
}

export interface Submission {
  id: string
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  createdAt: string
  assignment: {
    id: string
    title: string
    type: 'READING' | 'INTEGRATION'
  }
  answers?: Record<string, string>
  fileUrl?: string | null
  description?: string | null
  review?: {
    id: string
    score: number
    feedback: string
    resultStatus: 'PASSED' | 'FAILED'
  }
}

export interface RubricCriteria {
  id: string
  name: string
  description: string
  maxScore: number
  type: 'READING' | 'INTEGRATION'
}

export interface ClassInfo {
  id: string
  name: string
  code: string
  teacher: {
    id: string
    name: string
    email: string
  }
  _count: {
    memberships: number
    assignments: number
  }
}

export interface Product {
  id: string
  assignmentId: string
  assignmentTitle: string
  assignmentType: 'READING' | 'INTEGRATION'
  className: string
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  score?: number | null
  imageUrl?: string | null
  hasFeedback: boolean
  createdAt: string
}

export interface Notification {
  id: string
  type: string
  payload: Record<string, unknown>
  readAt: string | null
  createdAt: string
}

export type SubmissionStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'

export interface ReadingQuestion {
  id: string
  question: string
  type: 'multiple-choice' | 'short-answer'
  options?: string[]
  correctAnswer?: string | null
}

export interface AssignmentDetail extends Assignment {
  description?: string | null
  libraryItem: {
    id: string
    title: string
    content?: string
    imageUrl?: string | null
  }
  readingQuestions?: ReadingQuestion[]
}
