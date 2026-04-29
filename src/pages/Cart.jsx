import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import './Cart.css'

const ALIAS  = 'nicornivoras.mdp'
const CVU    = '0000003100042030182413'
const WA_NUM = '5492236160926' // +54 9 223 616 0926

export default function Cart() {
  const { items, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart()
  const { addToast } = useToast()
  const [showModal, setShowModal]       = useState(false)
  const [copiedAlias, setCopiedAlias]   = useState(false)
  const [copiedCVU,   setCopiedCVU]     = useState(false)

  const handleRemove = (id, name) => {
    removeFromCart(id)
    addToast(`${name} eliminada del carrito`, 'info')
  }

  const copy = (text, setter) => {
    navigator.clipboard.writeText(text).then(() => {
      setter(true)
      setTimeout(() => setter(false), 2500)
    })
  }

  // Builds a pre-filled WhatsApp message with the full order summary
  const buildWAMessage = () => {
    const lines = items.map(
      i => `• ${i.name} x${i.quantity} — $${(i.price * i.quantity).toLocaleString('es-AR')}`
    )
    const msg =
      `¡Hola! Quiero hacer un pedido en Nicornívoras 🌿\n\n` +
      lines.join('\n') +
      `\n\n*Total: $${cartTotal.toLocaleString('es-AR')}*\n\n` +
      `Ya realicé la transferencia al alias *${ALIAS}*. Te adjunto el comprobante.`
    return `https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Tu carrito está vacío</h2>
            <p>¿Aún no encontraste la planta perfecta?</p>
            <Link to="/catalogo" className="btn btn-primary btn-lg">
              Explorar Catálogo
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Main cart ──────────────────────────────────────────────────────────────
  return (
    <div className="cart-page">
      <div className="cart-header">
        <div className="container">
          <h1 className="page-title animate-fade-in-up">Carrito de Compras</h1>
          <p className="page-subtitle animate-fade-in-up stagger-1">
            {items.length} producto{items.length !== 1 ? 's' : ''} en tu carrito
          </p>
        </div>
      </div>

      <div className="container">
        <div className="cart-grid">

          {/* ── Items list ── */}
          <div className="cart-items animate-fade-in-up">
            {items.map(item => {
              const imageUrl = item.image?.startsWith('http')
                ? item.image
                : item.image
                  ? `/uploads/${item.image}`
                  : `https://picsum.photos/seed/${item.id}/200/200`
              return (
                <div key={item.id} className="cart-item" id={`cart-item-${item.id}`}>
                  <div className="cart-item-image">
                    <img src={imageUrl} alt={item.name}
                      onError={e => { e.target.src = `https://picsum.photos/seed/${item.id}/200/200` }} />
                  </div>
                  <div className="cart-item-info">
                    <Link to={`/producto/${item.id}`} className="cart-item-name">{item.name}</Link>
                    <span className="cart-item-price">${item.price?.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="cart-item-quantity">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="qty-btn">−</button>
                    <span className="qty-value">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="qty-btn">+</button>
                  </div>
                  <div className="cart-item-subtotal">
                    ${(item.price * item.quantity).toLocaleString('es-AR')}
                  </div>
                  <button className="cart-item-remove" onClick={() => handleRemove(item.id, item.name)} aria-label="Eliminar">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              )
            })}
            <button className="btn btn-secondary btn-sm clear-cart-btn"
              onClick={() => { clearCart(); addToast('Carrito vaciado', 'info') }} id="clear-cart">
              Vaciar Carrito
            </button>
          </div>

          {/* ── Order summary ── */}
          <div className="cart-summary animate-fade-in-up stagger-2" id="cart-summary">
            <h3>Resumen del Pedido</h3>
            <div className="summary-lines">
              <div className="summary-line">
                <span>Subtotal</span>
                <span>${cartTotal.toLocaleString('es-AR')}</span>
              </div>
              <div className="summary-line">
                <span>Envío</span>
                <span className="free-shipping">Consultar</span>
              </div>
              <div className="summary-line summary-total">
                <span>Total</span>
                <span>${cartTotal.toLocaleString('es-AR')}</span>
              </div>
            </div>

            <button className="btn btn-primary btn-lg checkout-btn"
              onClick={() => setShowModal(true)} id="checkout-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              Finalizar Compra
            </button>
            <Link to="/catalogo" className="continue-shopping">← Seguir Comprando</Link>
          </div>

        </div>
      </div>

      {/* ── Payment Modal ─────────────────────────────────────────────────── */}
      {showModal && (
        <div className="mp-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="mp-modal animate-scale-in" onClick={e => e.stopPropagation()} role="dialog" aria-label="Datos de pago">

            <button className="mp-modal-close" onClick={() => setShowModal(false)} aria-label="Cerrar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            {/* Header */}
            <div className="mp-modal-header">
              <div className="checkout-icon">💳</div>
              <h2>Datos de Pago</h2>
              <p>Transferí y luego avisanos por WhatsApp con el comprobante</p>
            </div>

            {/* Total */}
            <div className="mp-total-display">
              <span className="mp-total-label">Total a transferir</span>
              <span className="mp-total-amount">${cartTotal.toLocaleString('es-AR')}</span>
            </div>

            {/* Alias */}
            <div className="mp-alias-card">
              <span className="mp-alias-label">Alias</span>
              <div className="mp-alias-row">
                <span className="mp-alias-value">{ALIAS}</span>
                <button className={`mp-copy-btn ${copiedAlias ? 'copied' : ''}`}
                  onClick={() => copy(ALIAS, setCopiedAlias)}>
                  {copiedAlias
                    ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> ¡Copiado!</>
                    : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copiar</>
                  }
                </button>
              </div>
            </div>

            {/* CVU */}
            <div className="mp-alias-card">
              <span className="mp-alias-label">CVU</span>
              <div className="mp-alias-row">
                <span className="mp-cvu-value">{CVU}</span>
                <button className={`mp-copy-btn ${copiedCVU ? 'copied' : ''}`}
                  onClick={() => copy(CVU, setCopiedCVU)}>
                  {copiedCVU
                    ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> ¡Copiado!</>
                    : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copiar</>
                  }
                </button>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a href={buildWAMessage()} target="_blank" rel="noopener noreferrer"
              className="btn btn-wa" id="wa-pay-btn">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Enviar pedido por WhatsApp
            </a>

            <p className="mp-contact-note">
              Transferí el monto, sacá el comprobante y mandánoslo por WhatsApp. ¡Coordinamos el envío enseguida! 🌿
            </p>

          </div>
        </div>
      )}
    </div>
  )
}
