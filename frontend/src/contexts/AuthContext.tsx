import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

export interface User {
  id: string
  name: string
  email: string
  role: 'STUDENT' | 'TEACHER'
  avatarUrl?: string | null
  avatarVersion?: number

  // Added to match UI usage
  className?: string | null
  studentType?: 'CLASS' | 'INDEPENDENT' | null
}

interface AuthContextValue {
  user: User | null
  token: string | null
  loading: boolean

  // Added to match UI usage
  isClassStudent: boolean
  isIndependentStudent: boolean

  login: (email: string, password: string, role: 'STUDENT' | 'TEACHER') => Promise<User>
  register: (name: string, email: string, password: string, role: 'STUDENT' | 'TEACHER') => Promise<void>
  logout: () => Promise<void>
  updateUser: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const normalizeAvatarUrl = (url?: string | null) => {
  if (!url) return url ?? null
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url
  }
  if (url.startsWith('/')) {
    const baseUrl = String(api.defaults.baseURL ?? '')
    if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) {
      return `${new URL(baseUrl).origin}${url}`
    }
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${url}`
    }
  }
  const baseUrl = api.defaults.baseURL ?? ''
  if (!baseUrl) return url
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('lms_token')
    const storedUser = localStorage.getItem('lms_user')
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        const normalizedUser = {
          ...parsedUser,
          avatarUrl: normalizeAvatarUrl(parsedUser.avatarUrl),
        }
        setToken(storedToken)
        setUser(normalizedUser)
        localStorage.setItem('lms_user', JSON.stringify(normalizedUser))
      } catch {
        localStorage.removeItem('lms_token')
        localStorage.removeItem('lms_user')
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string, role: 'STUDENT' | 'TEACHER') => {
    const res = await api.post('/auth/login', { email, password, role })
    const { accessToken, user: userData } = res.data.data
    const normalizedUser = {
      ...userData,
      avatarUrl: normalizeAvatarUrl(userData.avatarUrl),
    }
    localStorage.setItem('lms_token', accessToken)
    localStorage.setItem('lms_user', JSON.stringify(normalizedUser))
    setToken(accessToken)
    setUser(normalizedUser)
    return normalizedUser as User
  }, [])

  const register = useCallback(async (
    name: string,
    email: string,
    password: string,
    role: 'STUDENT' | 'TEACHER'
  ) => {
    await api.post('/auth/register', { name, email, password, role })
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // Ignore errors on logout
    }
    localStorage.removeItem('lms_token')
    localStorage.removeItem('lms_user')
    setToken(null)
    setUser(null)
  }, [])

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev
      const shouldBumpAvatar = Object.prototype.hasOwnProperty.call(updates, 'avatarUrl')
      const normalizedUpdates = shouldBumpAvatar
        ? { ...updates, avatarUrl: normalizeAvatarUrl(updates.avatarUrl ?? null) }
        : updates
      const updated = {
        ...prev,
        ...normalizedUpdates,
        ...(shouldBumpAvatar ? { avatarVersion: Date.now() } : null),
      }
      localStorage.setItem('lms_user', JSON.stringify(updated))
      return updated
    })
  }, [])

  // Default logic (adjust if your backend encodes this differently)
  const isClassStudent = !!user && user.role === 'STUDENT' && !!user.className
  const isIndependentStudent = !!user && user.role === 'STUDENT' && !user.className

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isClassStudent,
      isIndependentStudent,
      login,
      register,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
