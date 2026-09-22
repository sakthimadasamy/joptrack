export function formatDate(value, withTime = false) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  const dateOptions = { day: '2-digit', month: 'short', year: 'numeric' }
  const formatted = date.toLocaleDateString('en-US', dateOptions)

  if (!withTime) return formatted

  const timeOptions = { hour: '2-digit', minute: '2-digit' }
  return `${formatted}, ${date.toLocaleTimeString('en-US', timeOptions)}`
}

export function formatDateInputValue(value) {
  if (!value) return ''
  return new Date(value).toISOString().slice(0, 10)
}

export function formatDateTimeInputValue(value) {
  if (!value) return ''
  const date = new Date(value)
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export const JOB_TYPE_LABELS = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  INTERNSHIP: 'Internship',
  CONTRACT: 'Contract',
}

export const STATUS_LABELS = {
  APPLIED: 'Applied',
  ASSESSMENT: 'Assessment',
  INTERVIEW: 'Interview',
  SELECTED: 'Selected',
  REJECTED: 'Rejected',
}
