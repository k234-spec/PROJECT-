import axios from 'axios'

// In local dev, Vite proxies /api → http://localhost:4000/api (no CORS needed)
// In production builds, set VITE_API_URL to your deployed backend URL
const baseURL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({ baseURL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
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
