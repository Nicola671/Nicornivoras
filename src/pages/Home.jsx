import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import './Home.css'

const heroSlides = [
  'https://i.postimg.cc/ryKbD9Cz/4817e987e9e2-plantas-carnivoras-t.jpg',
  'https://i.postimg.cc/5Nr8640c/closeup-venus-flytrap-insectivorous-plants-600nw-2474016693.webp',
  'https://i.postimg.cc/pV6mB0tn/360-F-472972859-m-E7i-XWMCTo-BUgtu-A4t-DA06qi-X9x-D8oyg.jpg',
]

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    fetchData()
  }, [])

  // Hero slider — 10s per slide with crossfade
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % heroSlides.length)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products?featured=true&limit=6'),
        fetch('/api/categories')
      ])
      const products = await prodRes.json()
      const cats = await catRes.json()
      setFeatured(products)
      setCategories(cats)
    } catch (err) {
      console.error('Error fetching data:', err)
    }
    setLoading(false)
  }

  const features = [
    {
      icon: '🌱',
      title: 'Plantas Saludables',
      desc: 'Cada planta es cultivada con dedicación y cuidado profesional'
    },
    {
      icon: '📦',
      title: 'Envío Protegido',
      desc: 'Empaque especializado para que tu planta llegue perfecta'
    },
    {
      icon: '📚',
      title: 'Guía de Cuidados',
      desc: 'Recibe instrucciones detalladas con cada compra'
    },
    {
      icon: '💬',
      title: 'Soporte Experto',
      desc: 'Acompañamiento continuo para que tus plantas prosperen'
    }
  ]

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero" id="hero-section">
        {/* Image Slider Background */}
        <div className="hero-slider">
          {heroSlides.map((src, i) => (
            <div
              key={i}
              className={`hero-slide ${i === activeSlide ? 'active' : ''}`}
            >
              <img src={src} alt="" aria-hidden="true" />
            </div>
          ))}
        </div>
        <div className="hero-overlay"></div>


        <div className="hero-content container">
          <div className="hero-badge animate-fade-in-up">
            <img src="https://i.postimg.cc/xTf6K1Yw/Whats-App-Image-2026-04-28-at-10-12-52-PM.png" alt="" className="hero-badge-logo" />
            Tienda Especializada
          </div>
          <h1 className="hero-title animate-fade-in-up stagger-1">
            Plantas Carnívoras
            <span className="hero-title-accent">Extraordinarias</span>
          </h1>
          <p className="hero-subtitle animate-fade-in-up stagger-2">
            Descubre la fascinante belleza de las plantas más únicas del reino vegetal.
            Colección exclusiva cultivada con pasión.
          </p>
          <div className="hero-actions animate-fade-in-up stagger-3">
            <Link to="/catalogo" className="btn btn-primary btn-lg">
              Explorar Catálogo
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link to="/nosotros" className="btn btn-secondary btn-lg">
              Conocer Más
            </Link>
          </div>
          <div className="hero-stats animate-fade-in-up stagger-4">
            <div className="hero-stat">
              <strong>Minorista</strong>
              <span>y Mayorista</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <strong>+250</strong>
              <span>Clientes</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <strong>5⭐</strong>
              <span>Valoración</span>
            </div>
          </div>
        </div>
        <div className="hero-scroll-indicator">
          <div className="scroll-dot"></div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section categories-section" id="categories-section">
        <div className="container">
          <h2 className="section-title">Explora por Categoría</h2>
          <p className="section-subtitle">
            Cada especie tiene su propio encanto. Encuentra la planta carnívora perfecta para ti.
          </p>
          <div className="categories-grid">
            {(categories.length > 0 ? categories : [
              { id: 1, name: 'Venus Atrapamoscas', slug: 'venus', description: 'La más famosa de las carnívoras' },
              { id: 2, name: 'Sarracenias', slug: 'sarracenia', description: 'Trompetas elegantes y coloridas' },
              { id: 3, name: 'Nepenthes', slug: 'nepenthes', description: 'Jarras tropicales exóticas' },
              { id: 4, name: 'Droseras', slug: 'drosera', description: 'Gotas brillantes y pegajosas' },
              { id: 5, name: 'Pinguículas', slug: 'pinguicula', description: 'Hojas viscosas atrapa insectos' },
            ]).map((cat, i) => {
              const categoryImages = {
                venus: 'https://i.postimg.cc/CxDSk7Fy/T52MP9.jpg',
                sarracenia: 'https://i.postimg.cc/dQHsYDWN/istockphoto-1093911896-612x612.jpg',
                nepenthes: 'https://i.postimg.cc/B6PrfQXW/360-F-67202431-4vh-Gxh-Uf-Mkx-O3Aj-DKa4l-Lq-EEImd0nmoh.jpg',
                drosera: 'https://i.postimg.cc/DywSrtNH/drosera-capensis.avif',
                pinguicula: 'https://i.postimg.cc/pTPW2jbg/pinguicula.jpg',
              }
              const bgImage = categoryImages[cat.slug] || ''

              return (
                <Link
                  to={`/catalogo?category=${cat.slug || cat.name}`}
                  key={cat.id}
                  className={`category-card animate-fade-in-up stagger-${(i % 5) + 1}`}
                  id={`category-${cat.slug || cat.id}`}
                >
                  <div className="category-card-bg" style={{ backgroundImage: `url(${bgImage})` }}></div>
                  <div className="category-card-overlay"></div>
                  <div className="category-card-content">
                    <h3>{cat.name}</h3>
                    <p>{cat.description}</p>
                    <span className="category-arrow">
                      Explorar
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section featured-section" id="featured-section">
        <div className="container">
          <h2 className="section-title">Plantas Destacadas</h2>
          <p className="section-subtitle">
            Nuestra selección especial de plantas carnívoras más populares y exclusivas.
          </p>
          {loading ? (
            <div className="products-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="product-skeleton">
                  <div className="skeleton" style={{ aspectRatio: '1', width: '100%' }}></div>
                  <div style={{ padding: '1rem' }}>
                    <div className="skeleton" style={{ height: '14px', width: '40%', marginBottom: '8px' }}></div>
                    <div className="skeleton" style={{ height: '20px', width: '80%', marginBottom: '6px' }}></div>
                    <div className="skeleton" style={{ height: '14px', width: '60%', marginBottom: '16px' }}></div>
                    <div className="skeleton" style={{ height: '24px', width: '30%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="products-grid">
              {featured.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
          <div className="featured-cta">
            <Link to="/catalogo" className="btn btn-secondary btn-lg">
              Ver Todo el Catálogo →
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section features-section" id="features-section">
        <div className="container">
          <h2 className="section-title">¿Por Qué Elegirnos?</h2>
          <p className="section-subtitle">
            Más que una tienda, somos una comunidad apasionada por las plantas carnívoras.
          </p>
          <div className="features-grid">
            {features.map((feature, i) => (
              <div key={i} className={`feature-card animate-fade-in-up stagger-${i + 1}`}>
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" id="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-glow"></div>
            <h2>¿Listo para tu Primera Carnívora?</h2>
            <p>Explora nuestra colección y encuentra la planta perfecta. Envío cuidado a todo el país.</p>
            <Link to="/catalogo" className="btn btn-primary btn-lg">
              Comenzar Ahora
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
