import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import './Catalog.css'

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const activeCategory = searchParams.get('category') || ''
  const activeSort = searchParams.get('sort') || ''
  const searchQuery = searchParams.get('q') || ''

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [activeCategory, activeSort, searchQuery])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(data)
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeCategory) params.set('category', activeCategory)
      if (activeSort) params.set('sort', activeSort)
      if (searchQuery) params.set('q', searchQuery)

      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()
      setProducts(data)
    } catch (err) {
      console.error('Error:', err)
    }
    setLoading(false)
  }

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    setSearchParams(params)
  }

  return (
    <div className="catalog-page">
      <div className="catalog-header">
        <div className="container">
          <h1 className="page-title animate-fade-in-up">Catálogo</h1>
          <p className="page-subtitle animate-fade-in-up stagger-1">
            Explora nuestra colección completa de plantas carnívoras
          </p>
        </div>
      </div>

      <div className="container">
        <div className="catalog-toolbar">
          <div className="search-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar plantas..."
              value={searchQuery}
              onChange={e => updateFilter('q', e.target.value)}
              className="search-input"
              id="catalog-search"
            />
          </div>

          <button
            className="filter-toggle btn btn-secondary btn-sm"
            onClick={() => setFiltersOpen(!filtersOpen)}
            id="filter-toggle"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
              <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
            </svg>
            Filtros
          </button>

          <select
            value={activeSort}
            onChange={e => updateFilter('sort', e.target.value)}
            className="input-field sort-select"
            id="catalog-sort"
          >
            <option value="">Ordenar por</option>
            <option value="price_asc">Precio: Menor a Mayor</option>
            <option value="price_desc">Precio: Mayor a Menor</option>
            <option value="name_asc">Nombre: A-Z</option>
            <option value="name_desc">Nombre: Z-A</option>
            <option value="newest">Más Recientes</option>
          </select>
        </div>

        <div className={`catalog-filters ${filtersOpen ? 'open' : ''}`}>
          <div className="filter-group">
            <h4>Categoría</h4>
            <div className="filter-chips">
              <button
                className={`filter-chip ${!activeCategory ? 'active' : ''}`}
                onClick={() => updateFilter('category', '')}
              >
                Todas
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`filter-chip ${activeCategory === cat.slug ? 'active' : ''}`}
                  onClick={() => updateFilter('category', cat.slug)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="catalog-results">
          <span className="results-count">
            {loading ? 'Cargando...' : `${products.length} planta${products.length !== 1 ? 's' : ''} encontrada${products.length !== 1 ? 's' : ''}`}
          </span>
        </div>

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
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌵</div>
            <h3>No se encontraron plantas</h3>
            <p>Intenta cambiar los filtros o la búsqueda</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
