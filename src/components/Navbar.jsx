import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useUserAuth } from '../context/UserAuthContext'
import './Navbar.css'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [userMenu,   setUserMenu]   = useState(false)
  const { cartCount }               = useCart()
  const { user, logout }            = useUserAuth()
  const location                    = useLocation()
  const navigate                    = useNavigate()
  const userMenuRef                 = useRef(null)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  // Close user dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setUserMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const navLinks = [
    { path: '/',         label: 'Inicio' },
    { path: '/catalogo', label: 'Catálogo' },
    { path: '/nosotros', label: 'Nosotros' },
    { path: '/contacto', label: 'Contacto' },
  ]

  const handleLogout = () => {
    logout()
    setUserMenu(false)
    navigate('/')
  }

  // First letter of name for avatar
  const initials = user?.name?.charAt(0)?.toUpperCase() || '?'

  return (
    <nav id="main-navbar" className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner container">
        <Link to="/" className="navbar-logo" id="navbar-logo">
          <img src="https://i.postimg.cc/xTf6K1Yw/Whats-App-Image-2026-04-28-at-10-12-52-PM.png"
            alt="Nicornívoras" className="logo-img" />
          <span className="logo-text">Nicornívoras</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {navLinks.map(link => (
            <Link key={link.path} to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              id={`nav-link-${link.label.toLowerCase()}`}>
              {link.label}
              <span className="nav-link-indicator"></span>
            </Link>
          ))}
        </div>

        <div className="navbar-actions">
          {/* Cart */}
          <Link to="/carrito" className="cart-btn" id="cart-button">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {cartCount > 0 && <span className="cart-count" id="cart-count">{cartCount}</span>}
          </Link>

          {/* User / Account */}
          {user ? (
            <div className="user-menu-wrap" ref={userMenuRef}>
              <button className="user-avatar-btn" onClick={() => setUserMenu(v => !v)}
                id="user-avatar-btn" aria-label="Mi cuenta">
                <span className="user-avatar">{initials}</span>
              </button>
              {userMenu && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <span className="user-dropdown-name">{user.name}</span>
                    <span className="user-dropdown-email">{user.email}</span>
                  </div>
                  <div className="user-dropdown-divider"></div>
                  <button className="user-dropdown-item user-dropdown-logout"
                    onClick={handleLogout} id="logout-btn">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/cuenta" className="nav-login-btn" id="nav-login-btn">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Ingresar
            </Link>
          )}

          {/* Hamburger */}
          <button className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)} id="hamburger-menu" aria-label="Toggle menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      {menuOpen && <div className="menu-overlay" onClick={() => setMenuOpen(false)} />}
    </nav>
  )
}
