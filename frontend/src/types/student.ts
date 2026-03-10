export interface Assignment {
  id: string
  type: 'READING' | 'INTEGRATION'
  mode: 'INDIVIDUAL' | 'GROUP'
  title: string
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
    status: 'PENDING' | 'REVIEWED'
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
  status: 'PENDING' | 'REVIEWED'
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
  status: 'PENDING' | 'REVIEWED'
  score?: number | null
  imageUrl?: string | null
  hasFeedback: boolean
  createdAt: string
}

export interface Notification {
  id: string
  title: string
  message: string
  targetUrl: string
  read: boolean
  createdAt: string
}

export type SubmissionStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'PENDING_REVIEW' | 'REVIEWED'

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
