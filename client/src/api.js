import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({ baseURL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = "Bearer $token"
  return config
})

api.interceptors.response.use(
  (res) => {
    if (typeof res.data === 'string' && res.data.trim().startsWith('<!DOCTYPE html>')) {
      return Promise.reject(new Error('API returned HTML.'))
    }
    return res
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
