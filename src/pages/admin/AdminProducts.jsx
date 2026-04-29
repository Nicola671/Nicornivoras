import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import AdminLayout from '../../components/AdminLayout'
import './Admin.css'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { getToken } = useAuth()
  const { addToast } = useToast()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      setProducts(data)
    } catch (err) {
      console.error('Error:', err)
    }
    setLoading(false)
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Eliminar "${name}"?`)) return
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id))
        addToast(`"${name}" eliminada`, 'success')
      } else {
        addToast('Error al eliminar', 'error')
      }
    } catch {
      addToast('Error de conexión', 'error')
    }
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Productos</h1>
            <p className="admin-page-subtitle">{products.length} productos en total</p>
          </div>
          <Link to="/admin/products/new" className="btn btn-primary" id="admin-add-product">
            + Agregar Producto
          </Link>
        </div>

        {loading ? (
          <div className="admin-loading">Cargando...</div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table" id="products-table">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td>
                      <div className="table-image">
                        <img
                          src={product.image?.startsWith('http') ? product.image : product.image ? `/uploads/${product.image}` : `https://picsum.photos/seed/${product.id}/100/100`}
                          alt={product.name}
                          onError={(e) => { e.target.src = `https://picsum.photos/seed/${product.id}/100/100` }}
                        />
                      </div>
                    </td>
                    <td>
                      <div className="table-name">{product.name}</div>
                      <div className="table-scientific">{product.scientific_name}</div>
                    </td>
                    <td>{product.category_name}</td>
                    <td className="table-price">${product.price?.toLocaleString('es-AR')}</td>
                    <td>
                      <span className={`stock-indicator ${product.stock > 0 ? 'in' : 'out'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <Link
                          to={`/admin/products/edit/${product.id}`}
                          className="btn btn-secondary btn-sm"
                        >
                          Editar
                        </Link>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(product.id, product.name)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
