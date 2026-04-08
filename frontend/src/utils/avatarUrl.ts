import api from '../api/axios'

const API_PREFIX = '/api'

export const normalizeAvatarUrl = (url?: string | null) => {
  if (!url) return url ?? null
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url
  }

  const baseUrl = api.defaults.baseURL ?? ''
  const trimmedBaseUrl = baseUrl.replace(/\/+$/, '')

  if (url.startsWith('/')) {
    if (trimmedBaseUrl.startsWith('http://') || trimmedBaseUrl.startsWith('https://')) {
      try {
        return `${new URL(trimmedBaseUrl).origin}${url}`
      } catch {
        // Fallback to browser origin if baseURL is malformed.
        if (typeof window !== 'undefined') {
          return `${window.location.origin}${url}`
        }
      }
    }
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${url}`
    }
  }

  if (!trimmedBaseUrl) return url
  return `${trimmedBaseUrl.replace(new RegExp(`${API_PREFIX}$`), '')}/${url}`
}
