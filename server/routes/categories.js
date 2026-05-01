import express from 'express'
import { getDB } from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// GET all categories
router.get('/', async (req, res) => {
  try {
    const db = getDB()
    const result = await db.execute('SELECT * FROM categories ORDER BY name ASC')
    res.json(result.rows)
  } catch (err) {
    console.error('Error fetching categories:', err)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// GET single category
router.get('/:id', async (req, res) => {
  try {
    const db = getDB()
    const result = await db.execute({
      sql: 'SELECT * FROM categories WHERE id = ?',
      args: [req.params.id]
    })
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Categoría no encontrada' })
    }
    res.json(result.rows[0])
  } catch (err) {
    console.error('Error:', err)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// POST create category (admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const db = getDB()
    const { name, slug, description, icon } = req.body

    if (!name || !slug) {
      return res.status(400).json({ message: 'Nombre y slug son requeridos' })
    }

    const existing = await db.execute({
      sql: 'SELECT id FROM categories WHERE slug = ?',
      args: [slug]
    })
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Ya existe una categoría con ese slug' })
    }

    const result = await db.execute({
      sql: 'INSERT INTO categories (name, slug, description, icon) VALUES (?, ?, ?, ?)',
      args: [name, slug, description || null, icon || '🌿']
    })

    const category = await db.execute({
      sql: 'SELECT * FROM categories WHERE id = ?',
      args: [result.lastInsertRowid]
    })
    res.status(201).json(category.rows[0])
  } catch (err) {
    console.error('Error creating category:', err)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// PUT update category (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const db = getDB()
    const { name, slug, description, icon } = req.body

    const existing = await db.execute({
      sql: 'SELECT id FROM categories WHERE id = ?',
      args: [req.params.id]
    })
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Categoría no encontrada' })
    }

    await db.execute({
      sql: 'UPDATE categories SET name = ?, slug = ?, description = ?, icon = ? WHERE id = ?',
      args: [name, slug, description || null, icon || '🌿', req.params.id]
    })

    const category = await db.execute({
      sql: 'SELECT * FROM categories WHERE id = ?',
      args: [req.params.id]
    })
    res.json(category.rows[0])
  } catch (err) {
    console.error('Error updating category:', err)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// DELETE category (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const db = getDB()
    const existing = await db.execute({
      sql: 'SELECT id FROM categories WHERE id = ?',
      args: [req.params.id]
    })
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Categoría no encontrada' })
    }

    // Set products with this category to null
    await db.execute({
      sql: 'UPDATE products SET category_id = NULL WHERE category_id = ?',
      args: [req.params.id]
    })
    await db.execute({
      sql: 'DELETE FROM categories WHERE id = ?',
      args: [req.params.id]
    })

    res.json({ message: 'Categoría eliminada' })
  } catch (err) {
    console.error('Error deleting category:', err)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

export default router
