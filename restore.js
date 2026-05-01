import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { Blob } from 'buffer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const BASE_URL = 'https://nicornivoras.onrender.com'
const BACKUP_DIR = path.join(__dirname, 'rescate_datos')
const UPLOADS_DIR = path.join(BACKUP_DIR, 'uploads')

async function run() {
  try {
    console.log('Obteniendo token de administrador...')
    const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'nicolasmedinae06@gmail.com',
        password: 'NicoyMati2025!'
      })
    })
    
    if (!loginRes.ok) throw new Error('No se pudo iniciar sesión en vivo')
    const { token } = await loginRes.json()

    const productosFile = path.join(BACKUP_DIR, 'productos.json')
    const products = JSON.parse(fs.readFileSync(productosFile, 'utf8'))

    console.log(`Restaurando ${products.length} plantas...`)

    for (const p of products) {
      const fd = new FormData()
      fd.append('name', p.name)
      if (p.description) fd.append('description', p.description)
      if (p.care_instructions) fd.append('care_instructions', p.care_instructions)
      if (p.category_id) fd.append('category_id', String(p.category_id))
      if (p.difficulty) fd.append('difficulty', String(p.difficulty))
      if (p.badge) fd.append('badge', p.badge)
      if (p.featured) fd.append('featured', 'true')
      if (p.is_hibernating) fd.append('is_hibernating', 'true')

      const variants = p.size_variants || [{ size: p.size, price: p.price, stock: p.stock }]
      fd.append('size_variants', JSON.stringify(variants))

      const images = p.image ? p.image.split(',').map(i => i.trim()) : []
      for (const img of images) {
        if (!img.startsWith('http')) {
          const imgPath = path.join(UPLOADS_DIR, img)
          if (fs.existsSync(imgPath)) {
            const buffer = fs.readFileSync(imgPath)
            const blob = new Blob([buffer], { type: 'image/jpeg' })
            fd.append('images', blob, img)
          }
        } else {
          fd.append('image_url', img)
        }
      }

      const uploadRes = await fetch(`${BASE_URL}/api/products`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      })

      if (uploadRes.ok) {
        console.log(`✅ Restaurada: ${p.name}`)
      } else {
        const errorData = await uploadRes.json()
        console.error(`❌ Error restaurando ${p.name}:`, errorData)
      }
    }

    console.log('🎉 ¡Todas tus plantas y fotos fueron subidas de nuevo!')
  } catch (err) {
    console.error('Error fatal:', err)
  }
}

run()
