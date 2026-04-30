import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import './ProductCard.css'

export default function ProductCard({ product, index = 0 }) {
  const { addToCart } = useCart()
  const { addToast } = useToast()

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image
    })
    addToast(`${product.name} añadida al carrito`, 'success')
  }

  const firstImage = product.image ? product.image.split(',')[0].trim() : null
  const imageUrl = firstImage?.startsWith('http')
    ? firstImage
    : firstImage
      ? `/uploads/${firstImage}`
      : '/placeholder-plant.jpg'

  return (
    <Link
      to={`/producto/${product.id}`}
      className={`product-card animate-fade-in-up stagger-${(index % 5) + 1}`}
      id={`product-card-${product.id}`}
    >
      <div className="product-card-image">
        <img
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.target.src = `https://picsum.photos/seed/${product.id}/400/400`
          }}
        />
        <div className="product-card-overlay">
          <button
            className="quick-add-btn"
            onClick={handleAddToCart}
            id={`quick-add-${product.id}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            Añadir
          </button>
        </div>
        {product.badge && (
          <span className={`product-badge badge badge-${product.badge}`}>
            {product.badge === 'new' ? 'Nuevo' : product.badge === 'sale' ? 'Oferta' : 'Popular'}
          </span>
        )}
        {product.is_hibernating ? (
          <div className="hibernating-banner">
            <span className="hibernating-icon">💤</span> Hibernando
          </div>
        ) : null}
      </div>
      <div className="product-card-info">
        <span className="product-card-category">{product.category_name || product.category}</span>
        <h3 className="product-card-name">{product.name}</h3>
        <p className="product-card-scientific">{product.scientific_name}</p>
        <div className="product-card-footer">
          <span className="product-card-price">${product.price?.toLocaleString('es-AR')}</span>
          <span className="product-card-difficulty">
            {'🌿'.repeat(product.difficulty || 1)}
          </span>
        </div>
      </div>
    </Link>
  )
}
