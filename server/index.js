import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { initDB } from './db.js'
import productsRouter   from './routes/products.js'
import categoriesRouter from './routes/categories.js'
import adminRouter      from './routes/admin.js'
import usersRouter      from './routes/users.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

// Initialize database
initDB()

// API Routes
app.use('/api/products',    productsRouter)
app.use('/api/categories',  categoriesRouter)
app.use('/api/admin',       adminRouter)
app.use('/api/users',       usersRouter)

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'dist')))
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`🌿 Nicornívoras API running on http://localhost:${PORT}`)
})
