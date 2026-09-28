import axios from 'axios'

// In production a missing VITE_API_BASE_URL would silently point every request at
// localhost:8080, which fails in a way that looks like a backend outage. Fail at
// startup instead, naming the variable that needs setting on the host.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  || (import.meta.env.DEV ? 'http://localhost:8080/api' : null)

if (!API_BASE_URL) {
  throw new Error(
    'VITE_API_BASE_URL is not set. Add it to frontend/.env for local development, '
      + 'or to your host dashboard (Vercel/Netlify/Cloudflare) and redeploy.',
  )
}

// A trailing slash would make axios resolve "/jobs" against the parent path.
const baseURL = API_BASE_URL.replace(/\/+$/, '')

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
})

// Attach the JWT to every outgoing request when present.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jobtrack_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Centralized handling for expired/invalid sessions.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jobtrack_token')
      localStorage.removeItem('jobtrack_user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return error?.response?.data?.message || fallback
}

export default api
