import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Pencil, Trash2, ExternalLink } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import ConfirmModal from '../components/ConfirmModal'
import { jobService } from '../services/jobService'
import { getErrorMessage } from '../services/api'
import { formatDate, JOB_TYPE_LABELS } from '../utils/formatters'

export default function ApplicationDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [app, setApp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setLoading(true)
    jobService
      .getById(id)
      .then(setApp)
      .catch((err) => setError(getErrorMessage(err, 'Failed to load this application.')))
      .finally(() => setLoading(false))
  }, [id])

  async function handleDelete() {
    setDeleting(true)
    try {
      await jobService.remove(id)
      navigate('/applications')
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete application.'))
      setConfirmOpen(false)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <div className="loading-text">Loading application...</div>
  if (error) return <div className="alert alert-error">{error}</div>
  if (!app) return null

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{app.companyName}</h1>
          <p>{app.jobTitle} {app.location ? `· ${app.location}` : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => navigate(`/applications/${id}/edit`)}>
            <Pencil size={16} /> Edit Application
          </button>
          <button className="btn btn-danger" onClick={() => setConfirmOpen(true)}>
            <Trash2 size={16} /> Delete Application
          </button>
        </div>
      </div>

      <div className="card card-padded" style={{ maxWidth: 720 }}>
        <div className="form-row" style={{ marginBottom: 20 }}>
          <div>
            <div className="stat-label" style={{ marginBottom: 6 }}>Status</div>
            <StatusBadge status={app.status} />
          </div>
          <div>
            <div className="stat-label" style={{ marginBottom: 6 }}>Job Type</div>
            <div style={{ fontWeight: 600 }}>{app.jobType ? JOB_TYPE_LABELS[app.jobType] : '—'}</div>
          </div>
        </div>

        <div className="form-row" style={{ marginBottom: 20 }}>
          <div>
            <div className="stat-label" style={{ marginBottom: 6 }}>Application Date</div>
            <div style={{ fontWeight: 600 }}>{formatDate(app.applicationDate)}</div>
          </div>
          <div>
            <div className="stat-label" style={{ marginBottom: 6 }}>Interview Date</div>
            <div style={{ fontWeight: 600 }}>{formatDate(app.interviewDate, true)}</div>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div className="stat-label" style={{ marginBottom: 6 }}>Job Link</div>
          {app.jobUrl ? (
            <a href={app.jobUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
              View Job <ExternalLink size={14} />
            </a>
          ) : (
            <span style={{ color: 'var(--color-text-muted)' }}>Not provided</span>
          )}
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 20 }}>
          <div className="stat-label" style={{ marginBottom: 8 }}>Notes</div>
          <p style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: app.notes ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
            {app.notes || 'No notes added.'}
          </p>
        </div>
      </div>

      <p style={{ marginTop: 16 }}>
        <Link to="/applications" style={{ fontSize: 14, fontWeight: 600 }}>← Back to Applications</Link>
      </p>

      <ConfirmModal
        open={confirmOpen}
        title="Delete Application?"
        message={`Are you sure you want to delete the application for ${app.jobTitle} at ${app.companyName}? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
