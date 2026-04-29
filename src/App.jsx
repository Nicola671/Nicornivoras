import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { UserAuthProvider } from './context/UserAuthContext'
import { ToastProvider } from './context/ToastContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CookieConsent from './components/CookieConsent'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import ProductDetail from './pages/ProductDetail'
import About from './pages/About'
import Contact from './pages/Contact'
import Cart from './pages/Cart'
import Login from './pages/Login'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminProductForm from './pages/admin/AdminProductForm'
import AdminCategories from './pages/admin/AdminCategories'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'
import Toast from './components/Toast'

function App() {
  return (
    <Router>
      <AuthProvider>
        <UserAuthProvider>
          <CartProvider>
            <ToastProvider>
            <ScrollToTop />
            <Toast />
            <CookieConsent />
            <div className="app">
              <Routes>
                {/* Admin routes - no navbar/footer */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
                <Route path="/admin/products/new" element={<ProtectedRoute><AdminProductForm /></ProtectedRoute>} />
                <Route path="/admin/products/edit/:id" element={<ProtectedRoute><AdminProductForm /></ProtectedRoute>} />
                <Route path="/admin/categories" element={<ProtectedRoute><AdminCategories /></ProtectedRoute>} />

                {/* Public routes */}
                <Route path="*" element={
                  <>
                    <Navbar />
                    <main>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/catalogo" element={<Catalog />} />
                        <Route path="/producto/:id" element={<ProductDetail />} />
                        <Route path="/nosotros" element={<About />} />
                        <Route path="/contacto" element={<Contact />} />
                        <Route path="/carrito" element={<Cart />} />
                        <Route path="/cuenta" element={<Login />} />
                      </Routes>
                    </main>
                    <Footer />
                  </>
                } />
              </Routes>
            </div>
          </ToastProvider>
          </CartProvider>
        </UserAuthProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
