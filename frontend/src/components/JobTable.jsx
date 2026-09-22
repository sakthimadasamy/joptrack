import { useNavigate } from 'react-router-dom'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { formatDate } from '../utils/formatters'

export default function JobTable({ applications, onDelete }) {
  const navigate = useNavigate()

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Position</th>
            <th>Location</th>
            <th>Status</th>
            <th>Applied</th>
            <th>Interview</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id}>
              <td className="cell-primary">{app.companyName}</td>
              <td>{app.jobTitle}</td>
              <td className="cell-secondary">{app.location || '—'}</td>
              <td><StatusBadge status={app.status} /></td>
              <td className="cell-secondary">{formatDate(app.applicationDate)}</td>
              <td className="cell-secondary">{formatDate(app.interviewDate, true)}</td>
              <td>
                <div className="row-actions">
                  <button
                    className="icon-btn"
                    aria-label={`View ${app.companyName} application`}
                    onClick={() => navigate(`/applications/${app.id}`)}
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    className="icon-btn"
                    aria-label={`Edit ${app.companyName} application`}
                    onClick={() => navigate(`/applications/${app.id}/edit`)}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="icon-btn danger"
                    aria-label={`Delete ${app.companyName} application`}
                    onClick={() => onDelete(app)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
