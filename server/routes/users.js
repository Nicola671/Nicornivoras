import { Router } from 'express'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getDB } from '../db.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'nicornivoras_secret_key_2024_v2'

// POST /api/users/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Todos los campos son obligatorios' })
    if (password.length < 6)
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' })

    const db = getDB()
    const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
    if (exists)
      return res.status(409).json({ message: 'Ya existe una cuenta con ese email' })

    const hashed = bcryptjs.hashSync(password, 10)
    const result = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(name, email, hashed)

    const token = jwt.sign({ id: result.lastInsertRowid, email, name }, JWT_SECRET, { expiresIn: '30d' })
    res.status(201).json({ token, user: { id: result.lastInsertRowid, name, email } })
  } catch (err) {
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// POST /api/users/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ message: 'Email y contraseña requeridos' })

    const db = getDB()
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
    if (!user)
      return res.status(401).json({ message: 'Email o contraseña incorrectos' })

    const valid = bcryptjs.compareSync(password, user.password)
    if (!valid)
      return res.status(401).json({ message: 'Email o contraseña incorrectos' })

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '30d' })
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } })
  } catch (err) {
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// GET /api/users/verify  (verifies JWT)
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ message: 'Token requerido' })
    const decoded = jwt.verify(token, JWT_SECRET)
    res.json({ user: { id: decoded.id, name: decoded.name, email: decoded.email } })
  } catch {
    res.status(401).json({ message: 'Token inválido' })
  }
})

export default router
