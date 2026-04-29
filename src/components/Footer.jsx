import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer-glow"></div>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <img src="https://i.postimg.cc/xTf6K1Yw/Whats-App-Image-2026-04-28-at-10-12-52-PM.png" alt="Nicornívoras" className="footer-logo-img" />
              <span className="logo-text">Nicornívoras</span>
            </Link>
            <p className="footer-description">
              Tu tienda especializada en plantas carnívoras. Cultivamos pasión por la naturaleza más fascinante.
            </p>
            <div className="footer-socials">
              <a
                href="https://www.instagram.com/nicornivoras?igsh=Yng5cjAwajN5Y3U5"
                className="social-link social-instagram"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                {/* Instagram icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a
                href="https://www.facebook.com/share/1EHvFsZoiW/"
                className="social-link social-facebook"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                {/* Facebook icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Navegación</h4>
            <div className="footer-links">
              <Link to="/">Inicio</Link>
              <Link to="/catalogo">Catálogo</Link>
              <Link to="/nosotros">Nosotros</Link>
              <Link to="/contacto">Contacto</Link>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Categorías</h4>
            <div className="footer-links">
              <Link to="/catalogo?category=venus">Venus Atrapamoscas</Link>
              <Link to="/catalogo?category=sarracenia">Sarracenias</Link>
              <Link to="/catalogo?category=nepenthes">Nepenthes</Link>
              <Link to="/catalogo?category=drosera">Droseras</Link>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Contacto</h4>
            <div className="footer-contact">
              <a href="mailto:nicolasmedinae06@gmail.com" className="footer-contact-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                nicolasmedinae06@gmail.com
              </a>
              <a href="https://www.instagram.com/nicornivoras?igsh=Yng5cjAwajN5Y3U5" className="footer-contact-item" target="_blank" rel="noopener noreferrer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
                @nicornivoras
              </a>
              <a href="https://www.facebook.com/share/1EHvFsZoiW/" className="footer-contact-item" target="_blank" rel="noopener noreferrer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
                Nicornívoras
              </a>
              <p className="footer-contact-location">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Buenos Aires, Argentina
              </p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Nicornívoras. Todos los derechos reservados.</p>
          <p className="footer-made">Hecho con 🌱 y mucha pasión</p>
        </div>
      </div>
    </footer>
  )
}
