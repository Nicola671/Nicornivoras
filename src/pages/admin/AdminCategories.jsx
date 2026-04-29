import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import AdminLayout from '../../components/AdminLayout'
import './Admin.css'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({ name: '', slug: '', description: '', icon: '🌿' })
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const { getToken } = useAuth()
  const { addToast } = useToast()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(data)
    } catch (err) {
      console.error('Error:', err)
    }
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const url = editingId ? `/api/categories/${editingId}` : '/api/categories'
    const method = editingId ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(form)
      })

      if (res.ok) {
        addToast(editingId ? 'Categoría actualizada' : 'Categoría creada', 'success')
        setForm({ name: '', slug: '', description: '', icon: '🌿' })
        setEditingId(null)
        fetchCategories()
      } else {
        addToast('Error al guardar', 'error')
      }
    } catch {
      addToast('Error de conexión', 'error')
    }
  }

  const handleEdit = (cat) => {
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      icon: cat.icon || '🌿'
    })
    setEditingId(cat.id)
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Eliminar categoría "${name}"?`)) return
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      if (res.ok) {
        setCategories(prev => prev.filter(c => c.id !== id))
        addToast(`"${name}" eliminada`, 'success')
      }
    } catch {
      addToast('Error al eliminar', 'error')
    }
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <h1 className="admin-page-title">Categorías</h1>

        <div className="admin-2col">
          {/* Form */}
          <form className="admin-form category-form" onSubmit={handleSubmit} id="category-form">
            <h3>{editingId ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
            <div className="input-group">
              <label htmlFor="cat-name">Nombre</label>
              <input
                id="cat-name"
                type="text"
                className="input-field"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="cat-slug">Slug</label>
              <input
                id="cat-slug"
                type="text"
                className="input-field"
                value={form.slug}
                onChange={e => setForm({ ...form, slug: e.target.value })}
                placeholder="ej: venus-atrapamoscas"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="cat-icon">Icono (emoji)</label>
              <input
                id="cat-icon"
                type="text"
                className="input-field"
                value={form.icon}
                onChange={e => setForm({ ...form, icon: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label htmlFor="cat-desc">Descripción</label>
              <textarea
                id="cat-desc"
                className="input-field"
                rows="3"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              ></textarea>
            </div>
            <div className="form-actions">
              {editingId && (
                <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setForm({ name: '', slug: '', description: '', icon: '🌿' }) }}>
                  Cancelar
                </button>
              )}
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>

          {/* List */}
          <div className="categories-list">
            {loading ? (
              <p>Cargando...</p>
            ) : categories.length === 0 ? (
              <p className="admin-empty">No hay categorías</p>
            ) : (
              categories.map(cat => (
                <div key={cat.id} className="category-list-item" id={`category-item-${cat.id}`}>
                  <div className="category-list-icon">{cat.icon || '🌿'}</div>
                  <div className="category-list-info">
                    <strong>{cat.name}</strong>
                    <span>{cat.slug}</span>
                  </div>
                  <div className="table-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(cat)}>
                      Editar
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat.id, cat.name)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
