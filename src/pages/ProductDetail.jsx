import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import './ProductDetail.css'

export default function ProductDetail() {
  const { id } = useParams()
  const [product,         setProduct]         = useState(null)
  const [related,         setRelated]         = useState([])
  const [quantity,        setQuantity]        = useState(1)
  const [loading,         setLoading]         = useState(true)
  const [activeTab,       setActiveTab]       = useState('description')
  const [activeImage,     setActiveImage]     = useState(0) // ← NEW
  const [selectedVariant, setSelectedVariant] = useState(null)
  const { addToCart }  = useCart()
  const { addToast }   = useToast()

  useEffect(() => { fetchProduct() }, [id])

  const fetchProduct = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/products/${id}`)
      if (res.ok) {
        const data = await res.json()
        setProduct(data)
        // Pre-select first variant if available
        if (data.size_variants?.length) setSelectedVariant(data.size_variants[0])
        // Fetch related
        const relRes  = await fetch(`/api/products?category=${data.category_slug || ''}&limit=4`)
        const relData = await relRes.json()
        setRelated(relData.filter(p => p.id !== data.id).slice(0, 3))
      }
    } catch (err) { console.error('Error:', err) }
    setLoading(false)
  }

  // Active price & stock — from variant or product-level fallback
  const activePrice = selectedVariant ? selectedVariant.price : product?.price
  const activeStock = selectedVariant ? selectedVariant.stock : product?.stock
  const activeSize  = selectedVariant ? selectedVariant.size  : product?.size

  const handleAddToCart = () => {
    addToCart({
      id:    `${product.id}-${activeSize}`,   // unique per size
      name:  product.name,
      price: activePrice,
      image: product.image,
      size:  activeSize,
    }, quantity)
    addToast(`${product.name} — ${activeSize} (x${quantity}) añadida al carrito`, 'success')
  }

  const imageList = product?.image ? product.image.split(',').map(img => img.trim()) : []
  const imageUrls = imageList.length > 0 
    ? imageList.map(img => img.startsWith('http') ? img : `/uploads/${img}`)
    : [`https://picsum.photos/seed/${id}/600/600`]
  
  const mainImageUrl = imageUrls[activeImage] || imageUrls[0]

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="product-detail-grid">
            <div className="skeleton" style={{ aspectRatio: '1', borderRadius: '16px' }}></div>
            <div>
              <div className="skeleton" style={{ height: '20px', width: '30%', marginBottom: '16px' }}></div>
              <div className="skeleton" style={{ height: '40px', width: '80%', marginBottom: '12px' }}></div>
              <div className="skeleton" style={{ height: '16px', width: '50%', marginBottom: '24px' }}></div>
              <div className="skeleton" style={{ height: '32px', width: '25%', marginBottom: '24px' }}></div>
              <div className="skeleton" style={{ height: '100px', width: '100%', marginBottom: '24px' }}></div>
              <div className="skeleton" style={{ height: '48px', width: '200px' }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="empty-state">
            <div className="empty-icon">🌵</div>
            <h3>Producto no encontrado</h3>
            <Link to="/catalogo" className="btn btn-primary">Volver al Catálogo</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb animate-fade-in">
          <Link to="/">Inicio</Link>
          <span>/</span>
          <Link to="/catalogo">Catálogo</Link>
          <span>/</span>
          <span className="current">{product.name}</span>
        </nav>

        <div className="product-detail-grid">
          {/* Image */}
          <div className="product-image-section animate-fade-in-up">
            <div className="product-main-image">
              <img
                src={mainImageUrl}
                alt={product.name}
                onError={(e) => {
                  e.target.src = `https://picsum.photos/seed/${product.id}/600/600`
                }}
              />
              {product.badge && (
                <span className={`product-badge badge badge-${product.badge}`}>
                  {product.badge === 'new' ? 'Nuevo' : product.badge === 'sale' ? 'Oferta' : 'Popular'}
                </span>
              )}
              {product.is_hibernating ? (
                <div className="hibernating-banner detail-banner">
                  <span className="hibernating-icon">💤</span> Esta planta está hibernando
                </div>
              ) : null}
            </div>
            
            {imageUrls.length > 1 && (
              <div className="product-thumbnails" style={{ display: 'flex', gap: '10px', marginTop: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
                {imageUrls.map((url, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveImage(i)}
                    style={{ 
                      flexShrink: 0, 
                      width: '80px', 
                      height: '80px', 
                      border: activeImage === i ? '2px solid var(--accent-primary)' : '2px solid transparent',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      padding: 0,
                      cursor: 'pointer',
                      background: 'var(--bg-secondary)',
                      transition: 'border-color 0.2s'
                    }}
                  >
                    <img src={url} alt={`Thumbnail ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product-info-section animate-fade-in-up stagger-1">
            <span className="product-category-tag">{product.category_name || 'Planta Carnívora'}</span>
            <h1 className="product-name">{product.name}</h1>

            {/* Price & stock — reactive to selected variant */}
            <div className="product-price-section">
              <span className="product-price">${activePrice?.toLocaleString('es-AR')}</span>
              {activeStock > 0 ? (
                <span className="stock-badge in-stock">✓ En Stock · {activeStock} disponibles</span>
              ) : (
                <span className="stock-badge out-stock">Sin stock</span>
              )}
            </div>

            {/* Size variant selector */}
            {product.size_variants?.length > 0 && (
              <div className="variant-selector">
                <span className="variant-label">Tamaño</span>
                <div className="variant-pills">
                  {product.size_variants.map(v => (
                    <button
                      key={v.id}
                      type="button"
                      className={`variant-pill ${selectedVariant?.id === v.id ? 'active' : ''} ${v.stock <= 0 ? 'out' : ''}`}
                      onClick={() => { if (v.stock > 0) { setSelectedVariant(v); setQuantity(1) } }}
                      disabled={v.stock <= 0}
                      title={v.stock <= 0 ? 'Sin stock' : ''}
                    >
                      <span className="pill-size">{v.size}</span>
                      <span className="pill-price">${v.price?.toLocaleString('es-AR')}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Difficulty */}
            <div className="product-meta">
              <div className="meta-item">
                <span className="meta-label">Dificultad de cultivo</span>
                <span className="meta-value">{'🌿'.repeat(product.difficulty || 1)} {['Fácil', 'Media', 'Difícil'][((product.difficulty || 1) - 1)]}</span>
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="product-actions">
              <div className="quantity-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="qty-btn" id="qty-decrease">−</button>
                <span className="qty-value">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(activeStock || 99, quantity + 1))} className="qty-btn" id="qty-increase">+</button>
              </div>
              <button
                className="btn btn-primary btn-lg add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={activeStock <= 0}
                id="add-to-cart"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                Añadir al Carrito
              </button>
            </div>

            {/* Tabs */}
            <div className="product-tabs">
              <div className="tab-headers">
                <button
                  className={`tab-header ${activeTab === 'description' ? 'active' : ''}`}
                  onClick={() => setActiveTab('description')}
                >
                  Descripción
                </button>
                <button
                  className={`tab-header ${activeTab === 'care' ? 'active' : ''}`}
                  onClick={() => setActiveTab('care')}
                >
                  Cuidados
                </button>
              </div>
              <div className="tab-content">
                {activeTab === 'description' && (
                  <p>{product.description || 'Una planta carnívora fascinante que te cautivará con su belleza única.'}</p>
                )}
                {activeTab === 'care' && (
                  <div className="care-info">
                    <p>{product.care_instructions || 'Mantener en un lugar con buena luz indirecta. Regar con agua destilada o de lluvia. No fertilizar.'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="related-section">
            <h2 className="section-title">También te Puede Gustar</h2>
            <div className="products-grid related-grid">
              {related.map((p, i) => (
                <Link to={`/producto/${p.id}`} key={p.id} className="product-card">
                  <div className="product-card-image">
                    {(() => {
                      const firstImg = p.image ? p.image.split(',')[0].trim() : null;
                      const imgSrc = firstImg?.startsWith('http') ? firstImg : firstImg ? `/uploads/${firstImg}` : `https://picsum.photos/seed/${p.id}/400/400`;
                      return <img src={imgSrc} alt={p.name} loading="lazy" onError={(e) => { e.target.src = `https://picsum.photos/seed/${p.id}/400/400` }} />
                    })()}
                  </div>
                  <div className="product-card-info">
                    <span className="product-card-category">{p.category_name}</span>
                    <h3 className="product-card-name">{p.name}</h3>
                    <div className="product-card-footer">
                      <span className="product-card-price">${p.price?.toLocaleString('es-AR')}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
