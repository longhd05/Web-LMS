import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

export interface User {
  id: string
  name: string
  email: string
  role: 'STUDENT' | 'TEACHER'
  avatarUrl?: string | null
}

interface AuthContextValue {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role: 'STUDENT' | 'TEACHER') => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Restore from localStorage
    const storedToken = localStorage.getItem('lms_token')
    const storedUser = localStorage.getItem('lms_user')
    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('lms_token')
        localStorage.removeItem('lms_user')
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password })
    const { accessToken, user: userData } = res.data.data
    localStorage.setItem('lms_token', accessToken)
    localStorage.setItem('lms_user', JSON.stringify(userData))
    setToken(accessToken)
    setUser(userData)
  }, [])

  const register = useCallback(async (
    name: string,
    email: string,
    password: string,
    role: 'STUDENT' | 'TEACHER'
  ) => {
    const res = await api.post('/auth/register', { name, email, password, role })
    const { accessToken, user: userData } = res.data.data
    localStorage.setItem('lms_token', accessToken)
    localStorage.setItem('lms_user', JSON.stringify(userData))
    setToken(accessToken)
    setUser(userData)
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

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
