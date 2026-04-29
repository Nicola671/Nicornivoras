import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Admin.css'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)  // siempre activado por defecto
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email, password, remember)
    if (result.success) {
      navigate('/admin')
    } else {
      setError(result.message || 'Credenciales incorrectas')
    }
    setLoading(false)
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card animate-scale-in">
        <div className="login-header">
          <img
            src="https://i.postimg.cc/xTf6K1Yw/Whats-App-Image-2026-04-28-at-10-12-52-PM.png"
            alt="Nicornívoras"
            className="login-logo-img"
          />
          <h1>Nicornívoras</h1>
          <p>Panel de Administración</p>
        </div>

        <form onSubmit={handleSubmit} id="admin-login-form">
          {error && <div className="login-error">{error}</div>}

          <div className="input-group">
            <label htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              type="email"
              className="input-field"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="admin-password">Contraseña</label>
            <div className="input-password-wrap">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <label className="remember-label" htmlFor="remember-me">
            <input
              type="checkbox"
              id="remember-me"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
            />
            <span className="remember-custom"></span>
            Mantener sesión iniciada
          </label>

          <button type="submit" className="btn btn-primary btn-lg login-btn" disabled={loading} id="admin-login-btn">
            {loading ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                Ingresando...
              </>
            ) : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
