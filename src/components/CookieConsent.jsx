import { useState, useEffect } from 'react'
import './CookieConsent.css'

const COOKIE_KEY = 'nicornivoras_cookies_accepted'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [animOut, setAnimOut] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem(COOKIE_KEY)
    if (!accepted) {
      // Small delay so it doesn't flash immediately
      const timer = setTimeout(() => setVisible(true), 1200)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem(COOKIE_KEY, 'accepted')
    dismiss()
  }

  const handleReject = () => {
    localStorage.setItem(COOKIE_KEY, 'rejected')
    dismiss()
  }

  const dismiss = () => {
    setAnimOut(true)
    setTimeout(() => setVisible(false), 400)
  }

  if (!visible) return null

  return (
    <div className={`cookie-banner ${animOut ? 'cookie-banner-out' : 'cookie-banner-in'}`} role="dialog" aria-label="Aviso de cookies" id="cookie-consent-banner">
      <div className="cookie-inner">
        <div className="cookie-icon">🍪</div>
        <div className="cookie-text">
          <p className="cookie-title">Usamos cookies</p>
          <p className="cookie-desc">
            Usamos cookies para mejorar tu experiencia y recordar tu carrito.
            {' '}
            <a href="/privacidad" className="cookie-link">Política de privacidad</a>
          </p>
        </div>
        <div className="cookie-actions">
          <button className="btn-cookie btn-cookie-accept" onClick={handleAccept} id="cookie-accept">
            Aceptar
          </button>
          <button className="btn-cookie btn-cookie-reject" onClick={handleReject} id="cookie-reject">
            Solo esenciales
          </button>
        </div>
        <button className="cookie-close" onClick={dismiss} aria-label="Cerrar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
