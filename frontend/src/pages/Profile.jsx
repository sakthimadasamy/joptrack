import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'
import { getErrorMessage } from '../services/api'
import { formatDate } from '../utils/formatters'

export default function Profile() {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ name: '', email: '' })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' })

  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    authService.getProfile().then((data) => {
      setProfile(data)
      setForm({ name: data.name, email: data.email })
    })
  }, [])

  async function handleProfileSubmit(e) {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')
    setSavingProfile(true)
    try {
      const updated = await authService.updateProfile(form)
      setProfile(updated)
      updateUser({ id: updated.id, name: updated.name, email: updated.email })
      setProfileSuccess('Profile updated successfully.')
    } catch (err) {
      setProfileError(getErrorMessage(err, 'Failed to update profile.'))
    } finally {
      setSavingProfile(false)
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordError('New passwords do not match.')
      return
    }

    setSavingPassword(true)
    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      setPasswordSuccess('Password changed successfully.')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
    } catch (err) {
      setPasswordError(getErrorMessage(err, 'Failed to change password.'))
    } finally {
      setSavingPassword(false)
    }
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  if (!profile) return <div className="loading-text">Loading profile...</div>

  const initials = profile.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Profile</h1>
          <p>Manage your account information and security.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20, maxWidth: 640 }}>
        <div className="card card-padded">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div className="avatar" style={{ width: 56, height: 56, fontSize: 18 }}>{initials}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{profile.name}</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                Member since {formatDate(profile.createdAt)}
              </div>
            </div>
          </div>

          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Account Information</h3>

          {profileError && <div className="alert alert-error">{profileError}</div>}
          {profileSuccess && <div className="alert alert-success">{profileSuccess}</div>}

          <form onSubmit={handleProfileSubmit} noValidate>
            <div className="field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={savingProfile}>
              {savingProfile ? <span className="spinner" /> : 'Save Changes'}
            </button>
          </form>
        </div>

        <div className="card card-padded">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Change Password</h3>

          {passwordError && <div className="alert alert-error">{passwordError}</div>}
          {passwordSuccess && <div className="alert alert-success">{passwordSuccess}</div>}

          <form onSubmit={handlePasswordSubmit} noValidate>
            <div className="field">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                id="currentPassword"
                type="password"
                className="input"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              />
            </div>
            <div className="form-row">
              <div className="field">
                <label htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  className="input"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                />
              </div>
              <div className="field">
                <label htmlFor="confirmNewPassword">Confirm New Password</label>
                <input
                  id="confirmNewPassword"
                  type="password"
                  className="input"
                  value={passwordForm.confirmNewPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={savingPassword}>
              {savingPassword ? <span className="spinner" /> : 'Change Password'}
            </button>
          </form>
        </div>

        <div className="card card-padded" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Logout</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Sign out of your JobTrack account.</div>
          </div>
          <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </div>
  )
}
