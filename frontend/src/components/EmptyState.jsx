import { Inbox } from 'lucide-react'

export default function EmptyState({ title, message, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14, color: 'var(--color-text-muted)' }}>
        <Inbox size={40} />
      </div>
      <h3>{title}</h3>
      <p>{message}</p>
      {actionLabel && onAction && (
        <button className="btn btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}
