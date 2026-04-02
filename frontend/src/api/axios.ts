import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000',
})

// Request interceptor: attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lms_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('lms_token')
      localStorage.removeItem('lms_user')
      // Redirect to login if not already there
      if (window.location.pathname !== '/dang-nhap') {
        window.location.href = '/dang-nhap'
      }
    }
    return Promise.reject(error)
  }
)

export default api
