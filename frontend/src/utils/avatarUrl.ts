import api from '../api/axios'

export const normalizeAvatarUrl = (url?: string | null) => {
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
