import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import JobTable from '../components/JobTable'
import EmptyState from '../components/EmptyState'
import ConfirmModal from '../components/ConfirmModal'
import { jobService } from '../services/jobService'
import { getErrorMessage } from '../services/api'

const STATUS_OPTIONS = ['All', 'APPLIED', 'ASSESSMENT', 'INTERVIEW', 'SELECTED', 'REJECTED']
const JOB_TYPE_OPTIONS = ['All', 'FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT']
const JOB_TYPE_LABELS = { FULL_TIME: 'Full-time', PART_TIME: 'Part-time', INTERNSHIP: 'Internship', CONTRACT: 'Contract' }
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'company', label: 'Company name' },
  { value: 'interviewDate', label: 'Interview date' },
]

export default function Applications() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [status, setStatus] = useState('All')
  const [jobType, setJobType] = useState('All')
  const [location, setLocation] = useState('')
  const [sort, setSort] = useState('newest')

  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [notice, setNotice] = useState('')

  const fetchApplications = useCallback(() => {
    setLoading(true)
    setError('')
    const params = {
      search: search || undefined,
      status: status !== 'All' ? status : undefined,
      jobType: jobType !== 'All' ? jobType : undefined,
      location: location || undefined,
      sort,
    }
    jobService
      .getAll(params)
      .then(setApplications)
      .catch((err) => setError(getErrorMessage(err, 'Failed to load applications.')))
      .finally(() => setLoading(false))
  }, [search, status, jobType, location, sort])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  async function handleConfirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await jobService.remove(toDelete.id)
      setApplications((prev) => prev.filter((a) => a.id !== toDelete.id))
      setNotice('Application deleted successfully.')
      setTimeout(() => setNotice(''), 3000)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete application.'))
    } finally {
      setDeleting(false)
      setToDelete(null)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Job Applications</h1>
          <p>Track and manage all your applications.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/applications/new')}>
          <Plus size={16} /> Add Application
        </button>
      </div>

      {notice && <div className="alert alert-success">{notice}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card card-padded" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="topbar-search" style={{ width: 280, maxWidth: '100%' }}>
            <Search size={16} color="var(--color-text-muted)" />
            <input
              type="text"
              placeholder="Search company or position..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select className="select" style={{ width: 160 }} value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt === 'All' ? 'All statuses' : opt.charAt(0) + opt.slice(1).toLowerCase()}</option>
            ))}
          </select>

          <select className="select" style={{ width: 160 }} value={jobType} onChange={(e) => setJobType(e.target.value)}>
            {JOB_TYPE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt === 'All' ? 'All job types' : JOB_TYPE_LABELS[opt]}</option>
            ))}
          </select>

          <input
            type="text"
            className="input"
            style={{ width: 160 }}
            placeholder="Any location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <select className="select" style={{ width: 170 }} value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>Sort: {opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-text">Loading applications...</div>
        ) : applications.length === 0 ? (
          <EmptyState
            title="No applications yet"
            message="Start tracking your job search by adding your first application."
            actionLabel="+ Add Application"
            onAction={() => navigate('/applications/new')}
          />
        ) : (
          <JobTable applications={applications} onDelete={setToDelete} />
        )}
      </div>

      <ConfirmModal
        open={!!toDelete}
        title="Delete Application?"
        message={
          toDelete
            ? `Are you sure you want to delete the application for ${toDelete.jobTitle} at ${toDelete.companyName}? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}
