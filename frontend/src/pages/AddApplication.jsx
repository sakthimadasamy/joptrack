import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { jobService } from '../services/jobService'
import { getErrorMessage } from '../services/api'
import { formatDateInputValue } from '../utils/formatters'
import { normalizeExternalUrl } from '../utils/urls'

const EMPTY_FORM = {
  companyName: '',
  jobTitle: '',
  location: '',
  jobType: 'FULL_TIME',
  status: 'APPLIED',
  applicationDate: '',
  interviewDate: '',
  interviewTime: '',
  interviewMeridiem: 'AM',
  jobUrl: '',
  notes: '',
}

function parseInterviewParts(value) {
  if (!value) return { date: '', time: '', meridiem: 'AM' }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return { date: '', time: '', meridiem: 'AM' }

  const pad = (n) => String(n).padStart(2, '0')
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const meridiem = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12

  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(hour12)}:${pad(minutes)}`,
    meridiem,
  }
}

function buildInterviewDateTimeValue(form) {
  if (!form.interviewDate || !form.interviewTime) return null

  let [hours, minutes] = form.interviewTime.split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null

  if (form.interviewMeridiem === 'PM' && hours !== 12) hours += 12
  if (form.interviewMeridiem === 'AM' && hours === 12) hours = 0

  const formattedHours = String(hours).padStart(2, '0')
  const formattedMinutes = String(minutes).padStart(2, '0')

  return `${form.interviewDate}T${formattedHours}:${formattedMinutes}:00`
}

export default function AddApplication() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    jobService
      .getById(id)
      .then((app) => {
        const interviewParts = parseInterviewParts(app.interviewDate)

        setForm({
          companyName: app.companyName || '',
          jobTitle: app.jobTitle || '',
          location: app.location || '',
          jobType: app.jobType || 'FULL_TIME',
          status: app.status || 'APPLIED',
          applicationDate: formatDateInputValue(app.applicationDate),
          interviewDate: interviewParts.date,
          interviewTime: interviewParts.time,
          interviewMeridiem: interviewParts.meridiem,
          jobUrl: app.jobUrl || '',
          notes: app.notes || '',
        })
      })
      .catch((err) => setFormError(getErrorMessage(err, 'Failed to load this application.')))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  function validate() {
    const next = {}
    if (!form.companyName.trim()) next.companyName = 'Company name is required.'
    if (!form.jobTitle.trim()) next.jobTitle = 'Job title is required.'
    if (!form.status) next.status = 'Status is required.'
    if (form.jobUrl.trim() && !normalizeExternalUrl(form.jobUrl)) {
      next.jobUrl = 'Enter a valid web address.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    if (!validate()) return

    setSubmitting(true)
    const payload = {
      ...form,
      applicationDate: form.applicationDate || null,
      interviewDate: buildInterviewDateTimeValue(form),
      jobUrl: normalizeExternalUrl(form.jobUrl) || null,
      interviewTime: undefined,
      interviewMeridiem: undefined,
    }

    try {
      if (isEdit) {
        await jobService.update(id, payload)
        navigate(`/applications/${id}`);
      } else {
        const created = await jobService.create(payload)
        navigate(`/applications/${created.id}`)
      }
    } catch (err) {
      setFormError(getErrorMessage(err, 'Failed to save application.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="loading-text">Loading application...</div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{isEdit ? 'Edit Application' : 'Add Application'}</h1>
          <p>{isEdit ? 'Update the details of this application.' : 'Add a new job application to track.'}</p>
        </div>
      </div>

      {formError && <div className="alert alert-error">{formError}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="card card-padded" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>Company Information</h3>

          <div className="form-row">
            <div className="field">
              <label htmlFor="companyName">Company Name</label>
              <input
                id="companyName"
                type="text"
                className={`input ${errors.companyName ? 'has-error' : ''}`}
                placeholder="e.g. TCS"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              />
              {errors.companyName && <span className="error-text">{errors.companyName}</span>}
            </div>

            <div className="field">
              <label htmlFor="jobTitle">Job Title</label>
              <input
                id="jobTitle"
                type="text"
                className={`input ${errors.jobTitle ? 'has-error' : ''}`}
                placeholder="e.g. Java Developer"
                value={form.jobTitle}
                onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
              />
              {errors.jobTitle && <span className="error-text">{errors.jobTitle}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label htmlFor="location">Location</label>
              <input
                id="location"
                type="text"
                className="input"
                placeholder="e.g. Chennai"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>

            <div className="field">
              <label htmlFor="jobType">Job Type</label>
              <select
                id="jobType"
                className="select"
                value={form.jobType}
                onChange={(e) => setForm({ ...form, jobType: e.target.value })}
              >
                <option value="FULL_TIME">Full-time</option>
                <option value="PART_TIME">Part-time</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="CONTRACT">Contract</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card card-padded" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>Application Information</h3>

          <div className="form-row">
            <div className="field">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                className={`select ${errors.status ? 'has-error' : ''}`}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="APPLIED">Applied</option>
                <option value="ASSESSMENT">Assessment</option>
                <option value="INTERVIEW">Interview</option>
                <option value="SELECTED">Selected</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="applicationDate">Application Date</label>
              <input
                id="applicationDate"
                type="date"
                className="input"
                value={form.applicationDate}
                onChange={(e) => setForm({ ...form, applicationDate: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label htmlFor="interviewDate">Interview Date</label>
              <input
                id="interviewDate"
                type="date"
                className="input"
                value={form.interviewDate}
                onChange={(e) => setForm((current) => ({ ...current, interviewDate: e.target.value }))}
              />
            </div>

            <div className="field">
              <label htmlFor="interviewTime">Interview Time</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  id="interviewTime"
                  type="time"
                  className="input"
                  value={form.interviewTime}
                  onChange={(e) => setForm({ ...form, interviewTime: e.target.value })}
                />
                <select
                  className="select"
                  value={form.interviewMeridiem}
                  onChange={(e) => setForm({ ...form, interviewMeridiem: e.target.value })}
                  style={{ width: 90 }}
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
              <span className="hint">Only needed if an interview is scheduled.</span>
            </div>

            <div className="field">
              <label htmlFor="jobUrl">Job URL</label>
              <input
                id="jobUrl"
                type="text"
                inputMode="url"
                className="input"
                placeholder="www.company.com/jobs/123"
                value={form.jobUrl}
                onChange={(e) => setForm({ ...form, jobUrl: e.target.value })}
              />
              {errors.jobUrl && <span className="error-text">{errors.jobUrl}</span>}
            </div>
          </div>
        </div>

        <div className="card card-padded" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>Additional Information</h3>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              className="textarea"
              placeholder="Add any notes about this application..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? <span className="spinner" /> : 'Save Application'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
