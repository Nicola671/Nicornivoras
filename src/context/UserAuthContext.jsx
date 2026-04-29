import { createContext, useContext, useState, useEffect } from 'react'

const UserAuthContext = createContext()

const TOKEN_KEY = 'nicornivoras_user_token'

export function UserAuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
    if (token) verifyToken(token)
    else setLoading(false)
  }, [])

  const verifyToken = async (token) => {
    try {
      const res = await fetch('/api/users/verify', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
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

  const register = async ({ name, email, password }) => {
    const res  = await fetch('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    })
    const data = await res.json()
    if (res.ok) {
      localStorage.setItem(TOKEN_KEY, data.token)
      setUser(data.user)
      return { success: true }
    }
    return { success: false, message: data.message }
  }

  const login = async ({ email, password, remember }) => {
    const res  = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    if (res.ok) {
      if (remember) localStorage.setItem(TOKEN_KEY, data.token)
      else          sessionStorage.setItem(TOKEN_KEY, data.token)
      setUser(data.user)
      return { success: true }
    }
    return { success: false, message: data.message }
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }

  return (
    <UserAuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </UserAuthContext.Provider>
  )
}

export const useUserAuth = () => {
  const ctx = useContext(UserAuthContext)
  if (!ctx) throw new Error('useUserAuth must be inside UserAuthProvider')
  return ctx
}
