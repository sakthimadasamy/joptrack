import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { jobService } from '../services/jobService'
import { getErrorMessage } from '../services/api'
import { formatDate } from '../utils/formatters'
import StatusBadge from '../components/StatusBadge'
import EmptyState from '../components/EmptyState'

export default function Interviews() {
  const navigate = useNavigate()
  const [data, setData] = useState({ upcoming: [], past: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    jobService
      .getInterviews()
      .then(setData)
      .catch((err) => setError(getErrorMessage(err, 'Failed to load interviews.')))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-text">Loading interviews...</div>
  if (error) return <div className="alert alert-error">{error}</div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Interviews</h1>
          <p>Keep track of your upcoming and past interviews.</p>
        </div>
      </div>

      <div className="card card-padded" style={{ marginBottom: 20 }}>
        <div className="section-header">
          <span className="section-title">Upcoming Interviews</span>
        </div>
        {data.upcoming.length === 0 ? (
          <EmptyState title="No upcoming interviews" message="Interviews you schedule will show up here." />
        ) : (
          <InterviewList items={data.upcoming} onView={(id) => navigate(`/applications/${id}`)} />
        )}
      </div>

      <div className="card card-padded">
        <div className="section-header">
          <span className="section-title">Past Interviews</span>
        </div>
        {data.past.length === 0 ? (
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>No past interviews yet.</p>
        ) : (
          <InterviewList items={data.past} onView={(id) => navigate(`/applications/${id}`)} />
        )}
      </div>
    </div>
  )
}

function InterviewList({ items, onView }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {items.map((app) => (
        <div key={app.id} className="interview-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="interview-time">{formatDate(app.interviewDate, true)}</div>
            <div className="interview-company">{app.companyName}</div>
            <div className="interview-role">{app.jobTitle}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <StatusBadge status={app.status} />
            <button className="btn btn-secondary btn-sm" onClick={() => onView(app.id)}>View</button>
          </div>
        </div>
      ))}
    </div>
  )
}
