import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useUserAuth } from '../context/UserAuthContext'
import { useToast } from '../context/ToastContext'
import './Login.css'

export default function Login() {
  const [tab,          setTab]          = useState('login')  // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [remember,     setRemember]     = useState(false)

  const [loginForm,    setLoginForm]    = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error,        setError]        = useState('')

  const { login, register } = useUserAuth()
  const { addToast }        = useToast()
  const navigate            = useNavigate()

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login({ ...loginForm, remember })
    if (result.success) {
      addToast('Bienvenido de vuelta', 'success')
      navigate('/')
    } else {
      setError(result.message || 'Email o contraseña incorrectos')
    }
    setLoading(false)
  }

  // ── REGISTER ───────────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    if (registerForm.password !== registerForm.confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    setLoading(true)
    const result = await register({
      name:     registerForm.name,
      email:    registerForm.email,
      password: registerForm.password,
    })
    if (result.success) {
      addToast('Cuenta creada exitosamente', 'success')
      navigate('/')
    } else {
      setError(result.message || 'Error al crear la cuenta')
    }
    setLoading(false)
  }

  const EyeIcon = ({ open }) => open
    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>

  return (
    <div className="login-page">
      <div className="login-card animate-scale-in">

        {/* Logo */}
        <div className="login-brand">
          <img
            src="https://i.postimg.cc/xTf6K1Yw/Whats-App-Image-2026-04-28-at-10-12-52-PM.png"
            alt="Nicornívoras"
            className="login-brand-logo"
          />
          <span className="login-brand-name">Nicornívoras</span>
        </div>

        {/* Tabs */}
        <div className="login-tabs">
          <button
            className={`login-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setError('') }}
            id="tab-login"
          >Iniciar sesión</button>
          <button
            className={`login-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => { setTab('register'); setError('') }}
            id="tab-register"
          >Crear cuenta</button>
        </div>

        {/* Error */}
        {error && <div className="login-error-msg">{error}</div>}

        {/* ── LOGIN FORM ── */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} id="login-form">
            <div className="input-group">
              <label htmlFor="login-email">Email</label>
              <input id="login-email" type="email" className="input-field"
                placeholder="tu@email.com" autoComplete="email"
                value={loginForm.email}
                onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                required />
            </div>

            <div className="input-group">
              <label htmlFor="login-password">Contraseña</label>
              <div className="input-password-wrap">
                <input id="login-password" className="input-field"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••" autoComplete="current-password"
                  value={loginForm.password}
                  onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                  required />
                <button type="button" className="password-toggle"
                  onClick={() => setShowPassword(v => !v)} aria-label="Mostrar contraseña">
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            <label className="remember-label" htmlFor="user-remember">
              <input type="checkbox" id="user-remember"
                checked={remember} onChange={e => setRemember(e.target.checked)} />
              <span className="remember-custom"></span>
              Mantener sesión iniciada
            </label>

            <button type="submit" className="btn btn-primary btn-lg login-btn" disabled={loading} id="login-submit">
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        )}

        {/* ── REGISTER FORM ── */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} id="register-form">
            <div className="input-group">
              <label htmlFor="reg-name">Nombre completo</label>
              <input id="reg-name" type="text" className="input-field"
                placeholder="Tu nombre" autoComplete="name"
                value={registerForm.name}
                onChange={e => setRegisterForm({ ...registerForm, name: e.target.value })}
                required />
            </div>

            <div className="input-group">
              <label htmlFor="reg-email">Email</label>
              <input id="reg-email" type="email" className="input-field"
                placeholder="tu@email.com" autoComplete="email"
                value={registerForm.email}
                onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                required />
            </div>

            <div className="input-group">
              <label htmlFor="reg-password">Contraseña</label>
              <div className="input-password-wrap">
                <input id="reg-password" className="input-field"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres" autoComplete="new-password"
                  value={registerForm.password}
                  onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
                  required />
                <button type="button" className="password-toggle"
                  onClick={() => setShowPassword(v => !v)} aria-label="Mostrar contraseña">
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="reg-confirm">Confirmar contraseña</label>
              <input id="reg-confirm" className="input-field"
                type={showPassword ? 'text' : 'password'}
                placeholder="Repetir contraseña" autoComplete="new-password"
                value={registerForm.confirm}
                onChange={e => setRegisterForm({ ...registerForm, confirm: e.target.value })}
                required />
            </div>

            <button type="submit" className="btn btn-primary btn-lg login-btn" disabled={loading} id="register-submit">
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>
        )}

        {/* Footer note */}
        <p className="login-footer-note">
          ¿Sos administrador?{' '}
          <Link to="/admin/login" className="login-admin-link">Acceder al panel</Link>
        </p>

      </div>
    </div>
  )
}
