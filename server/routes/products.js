import express from 'express'
import multer  from 'multer'
import path    from 'path'
import fs      from 'fs'
import { fileURLToPath } from 'url'
import { getDB } from '../db.js'
import { authMiddleware } from '../middleware/auth.js'
import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const router = express.Router()

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer to use Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'nicornivoras_uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
})

// ── GET all products ───────────────────────────────────────────────────────
router.get('/', async (req, res) => {
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

    const productsRes = await db.execute({ sql: query, args: params })
    const products = productsRes.rows

    // Attach size_variants
    const result = await Promise.all(products.map(async p => {
      const vars = await db.execute({ sql: 'SELECT * FROM size_variants WHERE product_id = ? ORDER BY id', args: [p.id] })
      return { ...p, size_variants: vars.rows }
    }))

    res.json(result)
  } catch (err) {
    console.error('Error fetching products:', err)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// ── GET single product ─────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const db = getDB()
    const productRes = await db.execute({
      sql: `
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?
      `,
      args: [req.params.id]
    })

    if (productRes.rows.length === 0) return res.status(404).json({ message: 'Producto no encontrado' })
    const product = productRes.rows[0]

    const vars = await db.execute({ sql: 'SELECT * FROM size_variants WHERE product_id = ? ORDER BY id', args: [product.id] })
    res.json({ ...product, size_variants: vars.rows })
  } catch (err) {
    console.error('Error fetching product:', err)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// ── POST create product (admin) ────────────────────────────────────────────
router.post('/', authMiddleware, upload.array('images', 5), async (req, res) => {
  try {
    const db = getDB()
    const {
      name, description, care_instructions,
      category_id, difficulty, badge, featured, is_hibernating,
      size_variants
    } = req.body

    if (!name) return res.status(400).json({ message: 'El nombre es obligatorio' })

    let variants = []
    try { variants = JSON.parse(size_variants || '[]') } catch { variants = [] }
    if (!variants.length) return res.status(400).json({ message: 'Agregá al menos un tamaño' })

    const defaultVariant = variants[0]

    let imageFiles = []
    if (req.files && req.files.length > 0) {
      imageFiles = req.files.map(f => f.path) // Cloudinary URL is in path
    } else if (req.body.image_url) {
      imageFiles = [req.body.image_url]
    }
    const imageString = imageFiles.length > 0 ? imageFiles.join(',') : null

    const result = await db.execute({
      sql: `
        INSERT INTO products
          (name, description, care_instructions, price, stock,
           category_id, difficulty, size, badge, featured, image, is_hibernating)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
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
      ]
    })

    const productId = Number(result.lastInsertRowid)

    for (const v of variants) {
      await db.execute({
        sql: 'INSERT INTO size_variants (product_id, size, price, stock) VALUES (?, ?, ?, ?)',
        args: [productId, v.size, parseFloat(v.price) || 0, parseInt(v.stock) || 0]
      })
    }

    const prodRes = await db.execute({ sql: 'SELECT * FROM products WHERE id = ?', args: [productId] })
    const varRes = await db.execute({ sql: 'SELECT * FROM size_variants WHERE product_id = ?', args: [productId] })
    
    res.status(201).json({ ...prodRes.rows[0], size_variants: varRes.rows })
  } catch (err) {
    console.error('Error creating product:', err)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// ── PUT update product (admin) ─────────────────────────────────────────────
router.put('/:id', authMiddleware, upload.array('images', 5), async (req, res) => {
  try {
    const db = getDB()
    const existingRes = await db.execute({ sql: 'SELECT id, image FROM products WHERE id = ?', args: [req.params.id] })
    if (existingRes.rows.length === 0) return res.status(404).json({ message: 'Producto no encontrado' })
    const existing = existingRes.rows[0]

    const {
      name, description, care_instructions,
      category_id, difficulty, badge, featured, is_hibernating, size_variants
    } = req.body

    let variants = []
    try { variants = JSON.parse(size_variants || '[]') } catch { variants = [] }
    if (!variants.length) return res.status(400).json({ message: 'Agregá al menos un tamaño' })

    const defaultVariant = variants[0]

    let imageString = existing.image
    if (req.files && req.files.length > 0) {
      imageString = req.files.map(f => f.path).join(',')
    } else if (req.body.image_url !== undefined) {
      imageString = req.body.image_url || existing.image
    } else if (req.body.existing_images) {
      imageString = req.body.existing_images.split(',').map(img => img.trim()).join(',')
    }

    await db.execute({
      sql: `
        UPDATE products SET
          name = ?, description = ?, care_instructions = ?,
          price = ?, stock = ?, category_id = ?, difficulty = ?, size = ?,
          badge = ?, featured = ?, image = ?, is_hibernating = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [
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
      ]
    })

    await db.execute({ sql: 'DELETE FROM size_variants WHERE product_id = ?', args: [req.params.id] })
    for (const v of variants) {
      await db.execute({
        sql: 'INSERT INTO size_variants (product_id, size, price, stock) VALUES (?, ?, ?, ?)',
        args: [req.params.id, v.size, parseFloat(v.price) || 0, parseInt(v.stock) || 0]
      })
    }

    const prodRes = await db.execute({ sql: 'SELECT * FROM products WHERE id = ?', args: [req.params.id] })
    const varRes = await db.execute({ sql: 'SELECT * FROM size_variants WHERE product_id = ? ORDER BY id', args: [req.params.id] })
    
    res.json({ ...prodRes.rows[0], size_variants: varRes.rows })
  } catch (err) {
    console.error('Error updating product:', err)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// ── DELETE product (admin) ─────────────────────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const db = getDB()
    const existingRes = await db.execute({ sql: 'SELECT id, image FROM products WHERE id = ?', args: [req.params.id] })
    if (existingRes.rows.length === 0) return res.status(404).json({ message: 'Producto no encontrado' })

    await db.execute({ sql: 'DELETE FROM products WHERE id = ?', args: [req.params.id] })
    res.json({ message: 'Producto eliminado' })
  } catch (err) {
    console.error('Error deleting product:', err)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

export default router
