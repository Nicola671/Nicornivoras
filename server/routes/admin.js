import express from 'express'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getDB } from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ message: 'Usuario y contraseña requeridos' })
    }

    const db = getDB()
    const result = await db.execute({
      sql: 'SELECT * FROM admins WHERE username = ?',
      args: [username]
    })
    const admin = result.rows[0]

    if (!admin) {
      return res.status(401).json({ message: 'Credenciales incorrectas' })
    }

    const isValid = bcryptjs.compareSync(password, admin.password)
    if (!isValid) {
      return res.status(401).json({ message: 'Credenciales incorrectas' })
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET || 'nicornivoras_secret_key_2024',
      { expiresIn: '365d' }   // 1 año — sesión permanente
    )

    res.json({
      token,
      admin: { id: admin.id, username: admin.username }
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// Verify token
router.get('/verify', authMiddleware, (req, res) => {
  res.json({ admin: { id: req.admin.id, username: req.admin.username } })
})

export default router
