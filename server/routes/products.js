import express from 'express'
import multer  from 'multer'
import path    from 'path'
import fs      from 'fs'
import { fileURLToPath } from 'url'
import { getDB } from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const router = express.Router()

// ── Multer (image upload) ──────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '..', '..', 'uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename:    (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`
    cb(null, `${unique}${path.extname(file.originalname)}`)
  }
})
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Solo se permiten imágenes'))
  }
})

// ── GET all products ───────────────────────────────────────────────────────
router.get('/', (req, res) => {
  try {
    const db = getDB()
    const { category, sort, q, featured, limit } = req.query

    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `
    const params = []

    if (category) { query += ' AND c.slug = ?'; params.push(category) }
    if (featured === 'true') query += ' AND p.featured = 1'
    if (q) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)'
      params.push(`%${q}%`, `%${q}%`)
    }

    switch (sort) {
      case 'price_asc':  query += ' ORDER BY p.price ASC';  break
      case 'price_desc': query += ' ORDER BY p.price DESC'; break
      case 'name_asc':   query += ' ORDER BY p.name ASC';   break
      case 'name_desc':  query += ' ORDER BY p.name DESC';  break
      case 'newest':     query += ' ORDER BY p.created_at DESC'; break
      default:           query += ' ORDER BY p.featured DESC, p.created_at DESC'
    }

    if (limit) { query += ' LIMIT ?'; params.push(parseInt(limit)) }

    const products = db.prepare(query).all(...params)

    // Attach size_variants — store the statement, call .all() on it
    const variantStmt = db.prepare('SELECT * FROM size_variants WHERE product_id = ? ORDER BY id')
    const result = products.map(p => ({
      ...p,
      size_variants: variantStmt.all(p.id)
    }))

    res.json(result)
  } catch (err) {
    console.error('Error fetching products:', err)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// ── GET single product ─────────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  try {
    const db = getDB()
    const product = db.prepare(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(req.params.id)

    if (!product) return res.status(404).json({ message: 'Producto no encontrado' })

    const size_variants = db.prepare('SELECT * FROM size_variants WHERE product_id = ? ORDER BY id').all(product.id)
    res.json({ ...product, size_variants })
  } catch (err) {
    console.error('Error fetching product:', err)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// ── POST create product (admin) ────────────────────────────────────────────
router.post('/', authMiddleware, upload.array('images', 5), (req, res) => {
  try {
    const db = getDB()
    const {
      name, description, care_instructions,
      category_id, difficulty, badge, featured, is_hibernating,
      size_variants  // JSON string: [{size, price, stock}]
    } = req.body

    if (!name) return res.status(400).json({ message: 'El nombre es obligatorio' })

    // Parse variants
    let variants = []
    try { variants = JSON.parse(size_variants || '[]') } catch { variants = [] }
    if (!variants.length) return res.status(400).json({ message: 'Agregá al menos un tamaño' })

    // Use first variant as the "default" price/stock/size on the product row
    const defaultVariant = variants[0]

    // Handle multiple images
    let imageFiles = []
    if (req.files && req.files.length > 0) {
      imageFiles = req.files.map(f => f.filename)
    } else if (req.body.image_url) {
      imageFiles = [req.body.image_url]
    }
    const imageString = imageFiles.length > 0 ? imageFiles.join(',') : null

    const result = db.prepare(`
      INSERT INTO products
        (name, description, care_instructions, price, stock,
         category_id, difficulty, size, badge, featured, image, is_hibernating)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name,
      description || null,
      care_instructions || null,
      parseFloat(defaultVariant.price) || 0,
      parseInt(defaultVariant.stock)   || 0,
      category_id ? parseInt(category_id) : null,
      difficulty  ? parseInt(difficulty)  : 1,
      defaultVariant.size || 'Mediano',
      badge    || null,
      featured === 'true' || featured === true ? 1 : 0,
      imageString,
      is_hibernating === 'true' || is_hibernating === true ? 1 : 0
    )

    const productId = result.lastInsertRowid

    // Insert all size_variants
    const insertVariant = db.prepare(
      'INSERT INTO size_variants (product_id, size, price, stock) VALUES (?, ?, ?, ?)'
    )
    for (const v of variants) {
      insertVariant.run(productId, v.size, parseFloat(v.price) || 0, parseInt(v.stock) || 0)
    }

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId)
    const savedVariants = db.prepare('SELECT * FROM size_variants WHERE product_id = ?').all(productId)
    res.status(201).json({ ...product, size_variants: savedVariants })
  } catch (err) {
    console.error('Error creating product:', err)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// ── PUT update product (admin) ─────────────────────────────────────────────
router.put('/:id', authMiddleware, upload.array('images', 5), (req, res) => {
  try {
    const db = getDB()
    const existing = db.prepare('SELECT id, image FROM products WHERE id = ?').get(req.params.id)
    if (!existing) return res.status(404).json({ message: 'Producto no encontrado' })

    const {
      name, description, care_instructions,
      category_id, difficulty, badge, featured, is_hibernating, size_variants
    } = req.body

    let variants = []
    try { variants = JSON.parse(size_variants || '[]') } catch { variants = [] }
    if (!variants.length) return res.status(400).json({ message: 'Agregá al menos un tamaño' })

    const defaultVariant = variants[0]

    // If new image files were uploaded, replace old ones
    let imageString = existing.image
    if (req.files && req.files.length > 0) {
      if (existing.image) {
        existing.image.split(',').forEach(img => {
          if (!img.startsWith('http')) {
            const oldPath = path.join(uploadDir, img.trim())
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
          }
        })
      }
      imageString = req.files.map(f => f.filename).join(',')
    } else if (req.body.image_url !== undefined) {
      imageString = req.body.image_url || existing.image
    }

    db.prepare(`
      UPDATE products SET
        name = ?, description = ?, care_instructions = ?,
        price = ?, stock = ?, category_id = ?, difficulty = ?, size = ?,
        badge = ?, featured = ?, image = ?, is_hibernating = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name,
      description || null,
      care_instructions || null,
      parseFloat(defaultVariant.price) || 0,
      parseInt(defaultVariant.stock)   || 0,
      category_id ? parseInt(category_id) : null,
      difficulty  ? parseInt(difficulty)  : 1,
      defaultVariant.size || 'Mediano',
      badge    || null,
      featured === 'true' || featured === true ? 1 : 0,
      imageString,
      is_hibernating === 'true' || is_hibernating === true ? 1 : 0,
      req.params.id
    )

    // Replace all variants
    db.prepare('DELETE FROM size_variants WHERE product_id = ?').run(req.params.id)
    const insertVariant = db.prepare(
      'INSERT INTO size_variants (product_id, size, price, stock) VALUES (?, ?, ?, ?)'
    )
    for (const v of variants) {
      insertVariant.run(req.params.id, v.size, parseFloat(v.price) || 0, parseInt(v.stock) || 0)
    }

    const product = db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(req.params.id)
    const savedVariants = db.prepare('SELECT * FROM size_variants WHERE product_id = ?').all(req.params.id)
    res.json({ ...product, size_variants: savedVariants })
  } catch (err) {
    console.error('Error updating product:', err)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// ── DELETE product (admin) ─────────────────────────────────────────────────
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const db = getDB()
    const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id)
    if (!existing) return res.status(404).json({ message: 'Producto no encontrado' })
    db.prepare('DELETE FROM size_variants WHERE product_id = ?').run(req.params.id)
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id)
    res.json({ message: 'Producto eliminado' })
  } catch (err) {
    console.error('Error deleting product:', err)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// ── POST upload image only ─────────────────────────────────────────────────
router.post('/upload-image', authMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No se subió ningún archivo' })
  res.json({ filename: req.file.filename, url: `/uploads/${req.file.filename}` })
})

export default router
