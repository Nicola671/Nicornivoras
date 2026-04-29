import express from 'express'
import { getDB } from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// GET all categories
router.get('/', (req, res) => {
  try {
    const db = getDB()
    const categories = db.prepare('SELECT * FROM categories ORDER BY name ASC').all()
    res.json(categories)
  } catch (err) {
    console.error('Error fetching categories:', err)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// GET single category
router.get('/:id', (req, res) => {
  try {
    const db = getDB()
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id)
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' })
    }
    res.json(category)
  } catch (err) {
    console.error('Error:', err)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// POST create category (admin only)
router.post('/', authMiddleware, (req, res) => {
  try {
    const db = getDB()
    const { name, slug, description, icon } = req.body

    if (!name || !slug) {
      return res.status(400).json({ message: 'Nombre y slug son requeridos' })
    }

    const existing = db.prepare('SELECT id FROM categories WHERE slug = ?').get(slug)
    if (existing) {
      return res.status(400).json({ message: 'Ya existe una categoría con ese slug' })
    }

    const result = db.prepare(
      'INSERT INTO categories (name, slug, description, icon) VALUES (?, ?, ?, ?)'
    ).run(name, slug, description || null, icon || '🌿')

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid)
    res.status(201).json(category)
  } catch (err) {
    console.error('Error creating category:', err)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// PUT update category (admin only)
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const db = getDB()
    const { name, slug, description, icon } = req.body

    const existing = db.prepare('SELECT id FROM categories WHERE id = ?').get(req.params.id)
    if (!existing) {
      return res.status(404).json({ message: 'Categoría no encontrada' })
    }

    db.prepare(
      'UPDATE categories SET name = ?, slug = ?, description = ?, icon = ? WHERE id = ?'
    ).run(name, slug, description || null, icon || '🌿', req.params.id)

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id)
    res.json(category)
  } catch (err) {
    console.error('Error updating category:', err)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// DELETE category (admin only)
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const db = getDB()
    const existing = db.prepare('SELECT id FROM categories WHERE id = ?').get(req.params.id)
    if (!existing) {
      return res.status(404).json({ message: 'Categoría no encontrada' })
    }

    // Set products with this category to null
    db.prepare('UPDATE products SET category_id = NULL WHERE category_id = ?').run(req.params.id)
    db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id)

    res.json({ message: 'Categoría eliminada' })
  } catch (err) {
    console.error('Error deleting category:', err)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

export default router
