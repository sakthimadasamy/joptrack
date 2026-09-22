const LABELS = {
  APPLIED: 'Applied',
  ASSESSMENT: 'Assessment',
  INTERVIEW: 'Interview',
  SELECTED: 'Selected',
  REJECTED: 'Rejected',
}

const CLASSES = {
  APPLIED: 'badge-applied',
  ASSESSMENT: 'badge-assessment',
  INTERVIEW: 'badge-interview',
  SELECTED: 'badge-selected',
  REJECTED: 'badge-rejected',
}

export default function StatusBadge({ status }) {
  if (!status) return null
  return <span className={`badge ${CLASSES[status] || ''}`}>{LABELS[status] || status}</span>
}
