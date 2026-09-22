import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, Menu } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  function handleSearchSubmit(e) {
    e.preventDefault()
    navigate(`/applications?search=${encodeURIComponent(query)}`)
  }

  const initials = user?.name
    ? user.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="mobile-menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={22} />
        </button>
        <form className="topbar-search" onSubmit={handleSearchSubmit}>
          <Search size={16} color="var(--color-text-muted)" />
          <input
            type="text"
            placeholder="Search company or position..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search applications"
          />
        </form>
      </div>

      <div className="topbar-actions">
        <button className="topbar-icon-btn" aria-label="Notifications">
          <Bell size={18} />
        </button>
        <div className="topbar-user" onClick={() => navigate('/profile')}>
          <div className="avatar">{initials}</div>
        </div>
      </div>
    </header>
  )
}
