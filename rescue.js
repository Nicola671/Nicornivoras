import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import https from 'https'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const BASE_URL = 'https://nicornivoras.onrender.com'
const BACKUP_DIR = path.join(__dirname, 'rescate_datos')

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true })
}
const UPLOADS_DIR = path.join(BACKUP_DIR, 'uploads')
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

const fetchJson = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) } catch(e) { reject(e) }
      })
    }).on('error', reject)
  })
}

const downloadImage = (filename) => {
  return new Promise((resolve, reject) => {
    const fileUrl = `${BASE_URL}/uploads/${filename}`
    const dest = path.join(UPLOADS_DIR, filename)
    
    // Skip if already downloaded
    if (fs.existsSync(dest)) return resolve()

    const file = fs.createWriteStream(dest)
    https.get(fileUrl, (res) => {
      if (res.statusCode !== 200) {
        file.close()
        fs.unlinkSync(dest)
        return resolve() // Ignore 404s
      }
      res.pipe(file)
      file.on('finish', () => {
        file.close()
        console.log(`✅ Descargada: ${filename}`)
        resolve()
      })
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err))
    })
  })
}

async function run() {
  try {
    console.log('Iniciando rescate de datos desde Render...')
    
    // 1. Fetch Categories
    console.log('Descargando categorías...')
    const categories = await fetchJson(`${BASE_URL}/api/categories`)
    fs.writeFileSync(path.join(BACKUP_DIR, 'categorias.json'), JSON.stringify(categories, null, 2))
    console.log(`✅ ${categories.length} categorías guardadas.`)

    // 2. Fetch Products
    console.log('Descargando productos...')
    const products = await fetchJson(`${BASE_URL}/api/products`)
    fs.writeFileSync(path.join(BACKUP_DIR, 'productos.json'), JSON.stringify(products, null, 2))
    console.log(`✅ ${products.length} productos guardados.`)

    // 3. Extract and Download Images
    const imagesToDownload = new Set()
    products.forEach(p => {
      if (p.image && !p.image.startsWith('http')) {
        p.image.split(',').forEach(img => imagesToDownload.add(img.trim()))
      }
    })

    console.log(`Descargando ${imagesToDownload.size} imágenes...`)
    for (const img of Array.from(imagesToDownload)) {
      await downloadImage(img)
    }

    console.log('🎉 ¡RESCATE COMPLETADO CON ÉXITO!')
  } catch (err) {
    console.error('❌ Error durante el rescate:', err)
  }
}

run()
