const ACCENT_COLORS = {
  default: 'var(--color-primary)',
  applied: 'var(--color-applied)',
  assessment: 'var(--color-assessment)',
  interview: 'var(--color-interview)',
  selected: 'var(--color-selected)',
  rejected: 'var(--color-rejected)',
}

export default function StatCard({ label, value, accent = 'default' }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-accent" style={{ background: ACCENT_COLORS[accent] }} />
    </div>
  )
}
