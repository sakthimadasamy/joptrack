import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Briefcase, CalendarClock, BarChart3, Settings, User, LogOut, Building2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/applications', label: 'Applications', icon: Briefcase },
  { to: '/interviews', label: 'Interviews', icon: CalendarClock },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function Sidebar({ open, onClose }) {
  const { logout } = useAuth()

  return (
    <>
      <div className={`sidebar-overlay ${open ? 'open' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <span className="logo-mark">
            <Building2 size={16} />
          </span>
          JobTrack
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-divider" />

        <div className="sidebar-footer">
          <NavLink
            to="/profile"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Settings size={18} />
            Settings
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <User size={18} />
            Profile
          </NavLink>
          <button type="button" className="sidebar-link" style={{ border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }} onClick={logout}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
