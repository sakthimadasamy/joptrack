import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('jobtrack_user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('jobtrack_token')
    if (!token) {
      setLoading(false)
      return
    }
    authService
      .getProfile()
      .then((profile) => {
        setUser(profile)
        localStorage.setItem('jobtrack_user', JSON.stringify(profile))
      })
      .catch(() => {
        localStorage.removeItem('jobtrack_token')
        localStorage.removeItem('jobtrack_user')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await authService.login({ email, password })
    localStorage.setItem('jobtrack_token', data.token)
    const profile = { id: data.id, name: data.name, email: data.email }
    localStorage.setItem('jobtrack_user', JSON.stringify(profile))
    setUser(profile)
    return profile
  }, [])

  const register = useCallback(async (name, email, password, confirmPassword) => {
    await authService.register({ name, email, password, confirmPassword })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('jobtrack_token')
    localStorage.removeItem('jobtrack_user')
    setUser(null)
  }, [])

  const updateUser = useCallback((profile) => {
    setUser(profile)
    localStorage.setItem('jobtrack_user', JSON.stringify(profile))
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
