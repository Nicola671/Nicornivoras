import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AdminLayout.css'

export default function AdminLayout({ children }) {
  const { admin, logout } = useAuth()
  const location = useLocation()

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/products', label: 'Productos', icon: '🌿' },
    { path: '/admin/categories', label: 'Categorías', icon: '🏷️' },
  ]

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar" id="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link to="/" className="admin-brand">
            <span>🌿</span>
            <span>Nicornívoras</span>
          </Link>
          <span className="admin-badge">Admin</span>
        </div>

        <nav className="admin-nav">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user">
            <div className="admin-avatar">👤</div>
            <div>
              <strong>{admin?.username || 'Admin'}</strong>
              <span>Administrador</span>
            </div>
          </div>
          <button onClick={logout} className="btn btn-secondary btn-sm logout-btn" id="admin-logout">
            Salir
          </button>
        </div>
      </aside>

      <div className="admin-main">
        {children}
      </div>
    </div>
  )
}
