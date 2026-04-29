import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import AdminLayout from '../../components/AdminLayout'
import './Admin.css'
import './AdminProductForm.css'

const SIZE_OPTIONS = [
  'Esqueje', 'Plántula', 'Pequeño', 'Mediano', 'Grande', 'Extra Grande', 'Colección'
]

const emptyVariant = () => ({ size: 'Mediano', price: '', stock: '' })

export default function AdminProductForm() {
  const { id }      = useParams()
  const isEditing   = Boolean(id)
  const navigate    = useNavigate()
  const { getToken } = useAuth()
  const { addToast } = useToast()
  const fileRef      = useRef(null)

  const [categories,    setCategories]    = useState([])
  const [loading,       setLoading]       = useState(false)
  const [imagePreviews, setImagePreviews] = useState([])
  const [imageFiles,    setImageFiles]    = useState([])
  const [variants,      setVariants]      = useState([emptyVariant()])
  const [form,          setForm]          = useState({
    name: '',
    description: '',
    care_instructions: '',
    category_id: '',
    difficulty: '1',
    badge: '',
    featured: false,
  })

  useEffect(() => {
    fetchCategories()
    if (isEditing) fetchProduct()
  }, [id])

  const fetchCategories = async () => {
    const res  = await fetch('/api/categories')
    const data = await res.json()
    setCategories(data)
  }

  const fetchProduct = async () => {
    const res  = await fetch(`/api/products/${id}`)
    if (!res.ok) return
    const data = await res.json()

    setForm({
      name:              data.name              || '',
      description:       data.description       || '',
      care_instructions: data.care_instructions || '',
      category_id:       data.category_id?.toString() || '',
      difficulty:        data.difficulty?.toString()   || '1',
      badge:             data.badge  || '',
      featured:          Boolean(data.featured),
    })

    // Load existing variants or fall back to product-level data
    if (data.size_variants?.length) {
      setVariants(data.size_variants.map(v => ({
        size:  v.size,
        price: v.price?.toString(),
        stock: v.stock?.toString(),
      })))
    } else {
      setVariants([{ size: data.size || 'Mediano', price: data.price?.toString() || '', stock: data.stock?.toString() || '' }])
    }

    if (data.image) {
      const imgs = data.image.split(',').map(img => img.trim())
      setImagePreviews(imgs.map(img => img.startsWith('http') ? img : `/uploads/${img}`))
    }
  }

  // ── Variants CRUD ─────────────────────────────────────────────────────────
  const updateVariant = (index, field, value) => {
    setVariants(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v))
  }
  const addVariant    = () => setVariants(prev => [...prev, emptyVariant()])
  const removeVariant = (index) => setVariants(prev => prev.filter((_, i) => i !== index))

  // ── Image ─────────────────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setImageFiles(prev => [...prev, ...files])
    setImagePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
  }

  const handleRemoveImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
    if (fileRef.current) fileRef.current.value = ''
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!variants.length) { addToast('Agregá al menos un tamaño', 'error'); return }
    for (const v of variants) {
      if (!v.size || v.price === '' || v.stock === '') {
        addToast('Completá todos los campos de cada tamaño', 'error'); return
      }
    }

    setLoading(true)

    const fd = new FormData()
    fd.append('name',              form.name)
    fd.append('description',       form.description)
    fd.append('care_instructions', form.care_instructions)
    fd.append('category_id',       form.category_id)
    fd.append('difficulty',        form.difficulty)
    fd.append('badge',             form.badge)
    fd.append('featured',          form.featured ? 'true' : 'false')
    fd.append('size_variants',     JSON.stringify(variants))

    imageFiles.forEach(file => fd.append('images', file))

    try {
      const url    = isEditing ? `/api/products/${id}` : '/api/products'
      const method = isEditing ? 'PUT' : 'POST'
      const res    = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd
      })

      if (res.ok) {
        addToast(isEditing ? 'Producto actualizado' : 'Producto creado', 'success')
        navigate('/admin/products')
      } else {
        const data = await res.json()
        addToast(data.message || 'Error al guardar', 'error')
      }
    } catch {
      addToast('Error de conexión', 'error')
    }
    setLoading(false)
  }

  const difficultyLabels = { '1': 'Fácil', '2': 'Media', '3': 'Difícil' }

  return (
    <AdminLayout>
      <div className="admin-page pf-page">
        <div className="pf-header">
          <div>
            <h1 className="admin-page-title">{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</h1>
            <p className="admin-page-subtitle">
              {isEditing ? `Editando producto #${id}` : 'Completá la información del nuevo producto'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} id="product-form" encType="multipart/form-data">
          <div className="pf-grid">

            {/* ── LEFT: info ── */}
            <div className="pf-col">
              <div className="pf-card">
                <h3 className="pf-card-title">Información básica</h3>

                <div className="input-group">
                  <label htmlFor="product-name">Nombre del producto *</label>
                  <input id="product-name" type="text" className="input-field"
                    placeholder="Ej: Venus Atrapamoscas Clásica"
                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>

                <div className="pf-row">
                  <div className="input-group">
                    <label htmlFor="product-category">Categoría *</label>
                    <select id="product-category" className="input-field"
                      value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} required>
                      <option value="">Seleccionar...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="input-group">
                    <label htmlFor="product-difficulty">Dificultad de cultivo</label>
                    <select id="product-difficulty" className="input-field"
                      value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
                      <option value="1">Fácil</option>
                      <option value="2">Media</option>
                      <option value="3">Difícil</option>
                    </select>
                  </div>
                </div>

                <div className="pf-row">
                  <div className="input-group">
                    <label htmlFor="product-badge">Etiqueta</label>
                    <select id="product-badge" className="input-field"
                      value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))}>
                      <option value="">Sin etiqueta</option>
                      <option value="new">Nuevo</option>
                      <option value="sale">Oferta</option>
                      <option value="popular">Popular</option>
                    </select>
                  </div>
                  <div className="input-group pf-featured-wrap">
                    <label>Destacado en home</label>
                    <label className="pf-toggle" htmlFor="product-featured">
                      <input type="checkbox" id="product-featured"
                        checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} />
                      <span className="pf-toggle-track"><span className="pf-toggle-thumb"></span></span>
                      <span>{form.featured ? 'Sí' : 'No'}</span>
                    </label>
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="product-description">Descripción</label>
                  <textarea id="product-description" className="input-field" rows="4"
                    placeholder="Descripción de la planta, origen, características..."
                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>

                <div className="input-group">
                  <label htmlFor="product-care">Instrucciones de cuidado</label>
                  <textarea id="product-care" className="input-field" rows="4"
                    placeholder="Luz, riego, temperatura, sustrato..."
                    value={form.care_instructions} onChange={e => setForm(f => ({ ...f, care_instructions: e.target.value }))} />
                </div>
              </div>
            </div>

            {/* ── RIGHT: image + sizes ── */}
            <div className="pf-col">

              {/* Image upload */}
              <div className="pf-card">
                <h3 className="pf-card-title">Imágenes del producto</h3>
                {imagePreviews.length > 0 && (
                  <div className="pf-img-previews-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '15px' }}>
                    {imagePreviews.map((src, i) => (
                      <div key={i} className="pf-img-preview" style={{ position: 'relative' }}>
                        <img src={src} alt={`Preview ${i}`} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                        <button type="button" onClick={() => handleRemoveImage(i)} style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(232, 76, 76, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <button type="button" className="pf-upload-zone" onClick={() => fileRef.current?.click()} style={{ width: '100%' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span>{imagePreviews.length > 0 ? 'Agregar más imágenes' : 'Seleccionar imágenes'}</span>
                  <span className="pf-upload-hint">JPG, PNG, WEBP (podés seleccionar varias)</span>
                </button>
                <input ref={fileRef} type="file" multiple accept="image/*" hidden onChange={handleImageChange} id="product-image-file" />
              </div>

              {/* Size variants */}
              <div className="pf-card">
                <div className="pf-variants-header">
                  <h3 className="pf-card-title">Tamaños, precios y stock</h3>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addVariant} id="add-variant-btn">
                    + Agregar tamaño
                  </button>
                </div>

                <div className="pf-variants-list">
                  {variants.map((v, i) => (
                    <div key={i} className="pf-variant-row" id={`variant-${i}`}>
                      <div className="pf-variant-num">{i + 1}</div>

                      <div className="input-group pf-variant-size">
                        <label>Tamaño</label>
                        <select className="input-field" value={v.size}
                          onChange={e => updateVariant(i, 'size', e.target.value)}>
                          {SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>

                      <div className="input-group pf-variant-price">
                        <label>Precio (ARS)</label>
                        <div className="pf-price-wrap">
                          <span className="pf-price-symbol">$</span>
                          <input type="number" min="0" step="1" className="input-field"
                            placeholder="0" value={v.price}
                            onChange={e => updateVariant(i, 'price', e.target.value)} required />
                        </div>
                      </div>

                      <div className="input-group pf-variant-stock">
                        <label>Stock</label>
                        <input type="number" min="0" className="input-field"
                          placeholder="0" value={v.stock}
                          onChange={e => updateVariant(i, 'stock', e.target.value)} required />
                      </div>

                      {variants.length > 1 && (
                        <button type="button" className="pf-variant-remove" onClick={() => removeVariant(i)} aria-label="Eliminar tamaño">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Summary */}
                {variants.length > 0 && variants[0].price && (
                  <div className="pf-variants-summary">
                    {variants.map((v, i) => v.price && (
                      <span key={i} className="pf-summary-chip">
                        {v.size} · ${parseFloat(v.price).toLocaleString('es-AR')} · {v.stock} uds.
                      </span>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Actions */}
          <div className="pf-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/products')}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="product-submit-btn">
              {loading
                ? <><span className="pf-spinner"></span>{isEditing ? 'Actualizando...' : 'Creando...'}</>
                : isEditing ? 'Actualizar producto' : 'Crear producto'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
