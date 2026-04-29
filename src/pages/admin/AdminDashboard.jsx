import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AdminLayout from '../../components/AdminLayout'
import './Admin.css'
import './AdminDashboard.css'

// SVG icons — no emojis
const IconPlant = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22V12"/><path d="M12 12C12 7 7 4 3 6c0 4 3 7 9 6"/><path d="M12 12c0-5 5-8 9-6c0 4-3 7-9 6"/>
  </svg>
)
const IconFolder = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
)
const IconUsers = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const IconStock = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
)
const IconPlus = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const IconGrid = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
)
const IconTag = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
)
const IconStore = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)
const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)

export default function AdminDashboard() {
  const [stats,    setStats]    = useState({ products: 0, categories: 0, users: 0, lowStock: 0 })
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const { getToken } = useAuth()

  useEffect(() => { fetchStats() }, [])

  const fetchStats = async () => {
    try {
      const [prodRes, catRes, userRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/users/count', { headers: { Authorization: `Bearer ${getToken()}` } }).catch(() => ({ ok: false }))
      ])
      const products   = prodRes.ok  ? await prodRes.json()  : []
      const categories = catRes.ok   ? await catRes.json()   : []
      const userCount  = userRes.ok  ? (await userRes.json()).count : 0

      const lowStock = products.filter(p => p.stock <= 3).length

      setStats({
        products:   products.length,
        categories: categories.length,
        users:      userCount,
        lowStock
      })
      setProducts(products.slice(0, 5)) // last 5 for quick table
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const statCards = [
    { label: 'Productos',   value: stats.products,   icon: <IconPlant />,  color: 'green'  },
    { label: 'Categorías',  value: stats.categories, icon: <IconFolder />, color: 'blue'   },
    { label: 'Usuarios',    value: stats.users || '—', icon: <IconUsers />, color: 'purple' },
    { label: 'Stock bajo',  value: stats.lowStock,   icon: <IconStock />,  color: stats.lowStock > 0 ? 'red' : 'green' },
  ]

  const quickActions = [
    { to: '/admin/products/new', label: 'Agregar Producto',      icon: <IconPlus /> },
    { to: '/admin/products',     label: 'Gestionar Productos',   icon: <IconGrid /> },
    { to: '/admin/categories',   label: 'Gestionar Categorías',  icon: <IconTag  /> },
    { to: '/',                   label: 'Ver Tienda',            icon: <IconStore /> },
  ]

  return (
    <AdminLayout>
      <div className="admin-page db-page">
        {/* Header */}
        <div className="db-header">
          <div>
            <h1 className="admin-page-title">Dashboard</h1>
            <p className="admin-page-subtitle">
              Panel de administración · Nicornívoras
            </p>
          </div>
          <Link to="/admin/products/new" className="btn btn-primary db-add-btn" id="db-add-product">
            <IconPlus />
            Nuevo producto
          </Link>
        </div>

        {/* Stat cards */}
        <div className="db-stats">
          {statCards.map(card => (
            <div key={card.label} className={`db-stat-card db-stat-card--${card.color}`}>
              <div className="db-stat-icon">{card.icon}</div>
              <div className="db-stat-info">
                <span className="db-stat-value">
                  {loading ? <span className="db-skeleton"></span> : card.value}
                </span>
                <span className="db-stat-label">{card.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main content grid */}
        <div className="db-main-grid">
          {/* Quick actions */}
          <div className="db-section">
            <h2 className="db-section-title">Acciones rápidas</h2>
            <div className="db-quick-grid">
              {quickActions.map(a => (
                <Link key={a.to} to={a.to} className="db-quick-card" id={`qa-${a.label.toLowerCase().replace(/\s/g,'-')}`}>
                  <div className="db-quick-icon">{a.icon}</div>
                  <span className="db-quick-label">{a.label}</span>
                  <IconArrow />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent products mini-table */}
          <div className="db-section">
            <div className="db-section-head">
              <h2 className="db-section-title">Últimos productos</h2>
              <Link to="/admin/products" className="db-see-all">Ver todos <IconArrow /></Link>
            </div>
            <div className="db-mini-table">
              {loading ? (
                <div className="db-skeleton-list">
                  {[1,2,3].map(i => <div key={i} className="db-skeleton-row"></div>)}
                </div>
              ) : products.length === 0 ? (
                <p className="db-empty">No hay productos todavía.</p>
              ) : (
                products.map(p => {
                  const imgSrc = p.image?.startsWith('http')
                    ? p.image : p.image ? `/uploads/${p.image}` : null
                  return (
                    <div key={p.id} className="db-mini-row">
                      <div className="db-mini-img">
                        {imgSrc
                          ? <img src={imgSrc} alt={p.name} onError={e => { e.target.style.display='none' }} />
                          : <span className="db-mini-img-placeholder"></span>}
                      </div>
                      <div className="db-mini-info">
                        <span className="db-mini-name">{p.name}</span>
                        <span className="db-mini-cat">{p.category_name || '—'}</span>
                      </div>
                      <div className="db-mini-meta">
                        <span className="db-mini-price">${p.price?.toLocaleString('es-AR')}</span>
                        <span className={`db-mini-stock ${p.stock <= 3 ? 'low' : ''}`}>
                          {p.stock} en stock
                        </span>
                      </div>
                      <Link to={`/admin/products/edit/${p.id}`} className="db-mini-edit" aria-label="Editar">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </Link>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
