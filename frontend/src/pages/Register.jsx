import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Briefcase } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../services/api'
import '../styles/auth.css'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function validate() {
    const next = {}
    if (!form.name.trim()) next.name = 'Full name is required.'
    if (!form.email.trim()) next.email = 'Email is required.'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Please enter a valid email.'
    if (!form.password) next.password = 'Password is required.'
    else if (form.password.length < 6) next.password = 'Password must be at least 6 characters.'
    if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    setSuccessMessage('')
    if (!validate()) return

    setSubmitting(true)
    try {
      await register(form.name.trim(), form.email.trim(), form.password, form.confirmPassword)
      setSuccessMessage('Account created successfully. Redirecting to login...')
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      setFormError(getErrorMessage(err, 'Could not create your account. Please try again.'))
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
          Create a free account to start organizing every application, interview, and offer
          in one clean, professional dashboard.
        </p>
      </div>

      <div className="auth-form-panel">
        <div className="auth-card">
          <h2>Create your account</h2>
          <p className="auth-subtitle">It only takes a minute.</p>

          {formError && <div className="alert alert-error">{formError}</div>}
          {successMessage && <div className="alert alert-success">{successMessage}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                className={`input ${errors.name ? 'has-error' : ''}`}
                placeholder="Sakthi Madasamy"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                autoComplete="name"
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

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
                placeholder="At least 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="new-password"
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                className={`input ${errors.confirmPassword ? 'has-error' : ''}`}
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                autoComplete="new-password"
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? <span className="spinner" /> : 'Create Account'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
