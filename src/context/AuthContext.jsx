import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

const TOKEN_KEY = 'nicornivoras_admin_token'
const REMEMBER_KEY = 'nicornivoras_admin_remember'

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check both storages
    const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
    if (token) {
      verifyToken(token)
    } else {
      setLoading(false)
    }
  }, [])

  const verifyToken = async (token) => {
    try {
      const res = await fetch('/api/admin/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setAdmin(data.admin)
      } else {
        localStorage.removeItem(TOKEN_KEY)
        sessionStorage.removeItem(TOKEN_KEY)
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      sessionStorage.removeItem(TOKEN_KEY)
    }
    setLoading(false)
  }

  const login = async (username, password, remember = true) => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (res.ok) {
        // Siempre guardar en localStorage → sesión permanente en esta computadora
        localStorage.setItem(TOKEN_KEY, data.token)
        localStorage.setItem(REMEMBER_KEY, 'true')
        sessionStorage.removeItem(TOKEN_KEY)
        setAdmin(data.admin)
        return { success: true }
      }
      return { success: false, message: data.message }
    } catch {
      return { success: false, message: 'Error de conexión con el servidor' }
    }
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REMEMBER_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    setAdmin(null)
  }

  const getToken = () =>
    localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
