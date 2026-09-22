import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Briefcase } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../services/api'
import '../styles/auth.css'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function validate() {
    const next = {}
    if (!form.email.trim()) next.email = 'Email is required.'
    if (!form.password) next.password = 'Password is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    if (!validate()) return

    setSubmitting(true)
    try {
      await login(form.email.trim(), form.password)
      const redirectTo = location.state?.from?.pathname || '/dashboard'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setFormError(getErrorMessage(err, 'Invalid email or password.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-brand-panel">
        <div className="logo-mark">
          <Briefcase size={22} />
        </div>
        <h1>Track your applications. Manage your career.</h1>
        <p>
          JobTrack keeps every application, interview, and follow-up in one clean dashboard —
          so you always know exactly where your job search stands.
        </p>
      </div>

      <div className="auth-form-panel">
        <div className="auth-card">
          <h2>Welcome back</h2>
          <p className="auth-subtitle">Log in to continue tracking your applications.</p>

          {formError && <div className="alert alert-error">{formError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className={`input ${errors.email ? 'has-error' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className={`input ${errors.password ? 'has-error' : ''}`}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <button type="button" className="btn btn-ghost" style={{ padding: 0, marginBottom: 18, fontSize: 13 }}>
              Forgot password?
            </button>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? <span className="spinner" /> : 'Login'}
            </button>
          </form>

          <div className="demo-hint">
            Demo account — email: <strong>demo@jobtrack.com</strong>, password: <strong>demo1234</strong>
          </div>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
