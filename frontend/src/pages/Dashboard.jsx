import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ArrowRight } from 'lucide-react'
import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'
import StatusBadge from '../components/StatusBadge'
import { jobService } from '../services/jobService'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../utils/formatters'
import { getErrorMessage } from '../services/api'
import '../styles/dashboard.css'

const STATUS_ROWS = [
  { key: 'applied', label: 'Applied', color: 'var(--color-applied)' },
  { key: 'assessment', label: 'Assessment', color: 'var(--color-assessment)' },
  { key: 'interview', label: 'Interview', color: 'var(--color-interview)' },
  { key: 'selected', label: 'Selected', color: 'var(--color-selected)' },
  { key: 'rejected', label: 'Rejected', color: 'var(--color-rejected)' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    jobService
      .getDashboardStats()
      .then((data) => mounted && setStats(data))
      .catch((err) => mounted && setError(getErrorMessage(err, 'Failed to load your dashboard.')))
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  if (loading) return <div className="loading-text">Loading dashboard...</div>
  if (error) return <div className="alert alert-error">{error}</div>

  const total = stats.total || 0
  const maxCount = Math.max(stats.applied, stats.assessment, stats.interview, stats.selected, stats.rejected, 1)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Good morning, {user?.name?.split(' ')[0] || 'there'}</h1>
          <p>Here's an overview of your job applications.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/applications/new')}>
          <Plus size={16} /> Add Application
        </button>
      </div>

      <div className="stat-grid">
        <StatCard label="Total Applications" value={total} accent="default" />
        <StatCard label="Applied" value={stats.applied} accent="applied" />
        <StatCard label="Assessments" value={stats.assessment} accent="assessment" />
        <StatCard label="Interviews" value={stats.interview} accent="interview" />
        <StatCard label="Selected" value={stats.selected} accent="selected" />
      </div>

      <div className="dashboard-grid">
        <div className="card card-padded">
          <div className="section-header">
            <span className="section-title">Recent Applications</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/applications')}>
              View all <ArrowRight size={14} />
            </button>
          </div>

          {stats.recentApplications.length === 0 ? (
            <EmptyState
              title="No applications yet"
              message="Start tracking your job search by adding your first application."
              actionLabel="+ Add Application"
              onAction={() => navigate('/applications/new')}
            />
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Position</th>
                    <th>Status</th>
                    <th>Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentApplications.map((app) => (
                    <tr key={app.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/applications/${app.id}`)}>
                      <td className="cell-primary">{app.companyName}</td>
                      <td>{app.jobTitle}</td>
                      <td><StatusBadge status={app.status} /></td>
                      <td className="cell-secondary">{formatDate(app.applicationDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: 28 }}>
            <div className="section-header">
              <span className="section-title">Application Status Overview</span>
            </div>
            <div className="status-overview">
              {STATUS_ROWS.map((row) => (
                <div className="status-row" key={row.key}>
                  <span className="status-name">{row.label}</span>
                  <div className="status-bar-track">
                    <div
                      className="status-bar-fill"
                      style={{
                        width: `${(stats[row.key] / maxCount) * 100}%`,
                        background: row.color,
                      }}
                    />
                  </div>
                  <span className="status-count">{stats[row.key]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card card-padded">
          <div className="section-header">
            <span className="section-title">Upcoming Interviews</span>
          </div>

          {stats.upcomingInterviews.length === 0 ? (
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>No upcoming interviews</p>
          ) : (
            stats.upcomingInterviews.map((app) => (
              <div className="interview-item" key={app.id}>
                <span className="interview-company">{app.companyName}</span>
                <span className="interview-role">{app.jobTitle}</span>
                <span className="interview-time">{formatDate(app.interviewDate, true)}</span>
                <div className="interview-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/applications/${app.id}`)}>
                    View Application
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
