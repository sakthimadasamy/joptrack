import { useEffect, useState } from 'react'
import { jobService } from '../services/jobService'
import { getErrorMessage } from '../services/api'
import StatCard from '../components/StatCard'
import { JOB_TYPE_LABELS, STATUS_LABELS } from '../utils/formatters'

const STATUS_COLORS = {
  APPLIED: 'var(--color-applied)',
  ASSESSMENT: 'var(--color-assessment)',
  INTERVIEW: 'var(--color-interview)',
  SELECTED: 'var(--color-selected)',
  REJECTED: 'var(--color-rejected)',
}

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    jobService
      .getAnalytics()
      .then(setData)
      .catch((err) => setError(getErrorMessage(err, 'Failed to load analytics.')))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-text">Loading analytics...</div>
  if (error) return <div className="alert alert-error">{error}</div>

  const statusEntries = Object.entries(data.byStatus)
  const maxStatus = Math.max(...statusEntries.map(([, v]) => v), 1)

  const jobTypeEntries = Object.entries(data.byJobType).filter(([, v]) => v > 0)
  const maxJobType = Math.max(...jobTypeEntries.map(([, v]) => v), 1)

  const maxMonth = Math.max(...data.byMonth.map((m) => m.count), 1)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Analytics</h1>
          <p>A quick look at how your job search is progressing.</p>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard label="Total Applications" value={data.total} accent="default" />
        <StatCard label="Interviews" value={data.interviews} accent="interview" />
        <StatCard label="Assessments" value={data.assessments} accent="assessment" />
        <StatCard label="Selected" value={data.selected} accent="selected" />
        <StatCard label="Rejected" value={data.rejected} accent="rejected" />
      </div>

      <div className="dashboard-grid">
        <div className="card card-padded">
          <div className="section-header">
            <span className="section-title">Applications by Status</span>
          </div>
          <div className="status-overview">
            {statusEntries.map(([status, count]) => (
              <div className="status-row" key={status}>
                <span className="status-name">{STATUS_LABELS[status] || status}</span>
                <div className="status-bar-track">
                  <div
                    className="status-bar-fill"
                    style={{ width: `${(count / maxStatus) * 100}%`, background: STATUS_COLORS[status] }}
                  />
                </div>
                <span className="status-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card card-padded">
          <div className="section-header">
            <span className="section-title">Applications by Job Type</span>
          </div>
          {jobTypeEntries.length === 0 ? (
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>No job type data yet.</p>
          ) : (
            <div className="status-overview">
              {jobTypeEntries.map(([type, count]) => (
                <div className="status-row" key={type}>
                  <span className="status-name">{JOB_TYPE_LABELS[type] || type}</span>
                  <div className="status-bar-track">
                    <div
                      className="status-bar-fill"
                      style={{ width: `${(count / maxJobType) * 100}%`, background: 'var(--color-primary)' }}
                    />
                  </div>
                  <span className="status-count">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card card-padded" style={{ marginTop: 20 }}>
        <div className="section-header">
          <span className="section-title">Applications Over Time</span>
        </div>
        {data.byMonth.length === 0 ? (
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Not enough data yet to show a trend.</p>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 160, padding: '0 4px' }}>
            {data.byMonth.map((m) => (
              <div key={m.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
                <div
                  style={{
                    width: '60%',
                    minWidth: 24,
                    height: `${(m.count / maxMonth) * 120}px`,
                    background: 'var(--color-primary)',
                    borderRadius: '4px 4px 0 0',
                  }}
                  title={`${m.month}: ${m.count}`}
                />
                <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 600 }}>{m.count}</span>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{m.month}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
