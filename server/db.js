import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import bcryptjs from 'bcryptjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = path.join(__dirname, '..', 'data', 'nicornivoras.db')

let db

export function getDB() {
  if (!db) {
    // Ensure data directory exists
    const dataDir = path.dirname(dbPath)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    db = new Database(dbPath)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
  }
  return db
}

export function initDB() {
  const database = getDB()

  // Create tables
  database.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      icon TEXT DEFAULT '🌿',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      scientific_name TEXT,
      description TEXT,
      care_instructions TEXT,
      price REAL NOT NULL,
      stock INTEGER DEFAULT 0,
      category_id INTEGER,
      difficulty INTEGER DEFAULT 1,
      size TEXT DEFAULT 'Mediano',
      badge TEXT,
      featured INTEGER DEFAULT 0,
      image TEXT,
      is_hibernating INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );
  `)

  // Add is_hibernating column if it doesn't exist (migration)
  try {
    database.exec(`ALTER TABLE products ADD COLUMN is_hibernating INTEGER DEFAULT 0;`)
  } catch (e) {
    // Column already exists
  }

    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS size_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      size TEXT NOT NULL,
      price REAL NOT NULL DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
  `)

  // Seed admin — always ensure real credentials are up to date
  const adminEmail = process.env.ADMIN_USERNAME || 'nicolasmedinae06@gmail.com'
  const adminPass  = process.env.ADMIN_PASSWORD  || 'NicoyMati2025!'
  const hashedPassword = bcryptjs.hashSync(adminPass, 10)

  const adminExists = database.prepare('SELECT id FROM admins WHERE username = ?').get(adminEmail)
  if (!adminExists) {
    // Remove any old 'admin' entry and insert real one
    database.prepare('DELETE FROM admins WHERE username = ?').run('admin')
    database.prepare('INSERT OR REPLACE INTO admins (username, password) VALUES (?, ?)').run(adminEmail, hashedPassword)
    console.log(`✅ Admin created: ${adminEmail}`)
  }

  // Seed categories if empty
  const catCount = database.prepare('SELECT COUNT(*) as c FROM categories').get()
  if (catCount.c === 0) {
    const insertCat = database.prepare('INSERT INTO categories (name, slug, description, icon) VALUES (?, ?, ?, ?)')
    const cats = [
      ['Venus Atrapamoscas', 'venus', 'La planta carnívora más famosa del mundo, con sus icónicas trampas en forma de mandíbula', '🪴'],
      ['Sarracenias', 'sarracenia', 'Elegantes trompetas que atraen insectos con sus colores vibrantes y néctar dulce', '🌿'],
      ['Nepenthes', 'nepenthes', 'Jarras tropicales colgantes de formas espectaculares originarias del sudeste asiático', '🌱'],
      ['Droseras', 'drosera', 'Cubiertas de gotas pegajosas y brillantes que atrapan insectos con su belleza letal', '✨'],
      ['Pinguículas', 'pinguicula', 'Hojas viscosas con aspecto de suculenta que capturan mosquitos y pequeños insectos', '🍀'],
    ]
    for (const cat of cats) {
      insertCat.run(...cat)
    }
    console.log('✅ Categories seeded')
  }

  // Seed products if empty
  const prodCount = database.prepare('SELECT COUNT(*) as c FROM products').get()
  if (prodCount.c === 0) {
    const insertProd = database.prepare(`
      INSERT INTO products (name, scientific_name, description, care_instructions, price, stock, category_id, difficulty, size, badge, featured, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const products = [
      [
        'Venus Atrapamoscas Clásica',
        'Dionaea muscipula',
        'La reina de las carnívoras. Sus trampas se cierran en milisegundos al detectar la presencia de un insecto. Una planta fascinante que no puede faltar en tu colección.',
        'Luz solar directa mínimo 4 horas. Regar con agua destilada o de lluvia. Mantener sustrato siempre húmedo. No fertilizar. Temperatura 15-35°C.',
        4500, 25, 1, 1, 'Mediano', 'popular', 1,
        'https://images.unsplash.com/photo-1615671524827-c1fe3973b648?w=600&h=600&fit=crop'
      ],
      [
        'Venus Giant Trap',
        'Dionaea muscipula "B52"',
        'Variedad de trampa gigante que puede alcanzar hasta 5cm de diámetro. Perfecta para coleccionistas que buscan algo especial e impresionante.',
        'Mucha luz solar directa. Agua destilada. Sustrato de turba y perlita. Hibernación en invierno a 5-10°C durante 3 meses.',
        7800, 10, 1, 2, 'Grande', 'new', 1,
        'https://images.unsplash.com/photo-1567331711402-509c12c41959?w=600&h=600&fit=crop'
      ],
      [
        'Venus Red Dragon',
        'Dionaea muscipula "Red Dragon"',
        'Espectacular variedad completamente roja. Sus trampas y hojas adquieren un color rojo intenso con buena iluminación. Una joya para coleccionistas.',
        'Sol directo abundante para mantener el color rojo intenso. Agua destilada. No usar macetas de metal. Sustrato ácido.',
        6500, 15, 1, 2, 'Mediano', 'sale', 1,
        'https://images.unsplash.com/photo-1509223197845-458d87a6c5a4?w=600&h=600&fit=crop'
      ],
      [
        'Sarracenia Purpurea',
        'Sarracenia purpurea',
        'Hermosa planta con trampas en forma de copa que se llenan de agua de lluvia. Los insectos caen y se ahogan en el líquido digestivo.',
        'Sol directo al menos 6 horas. Tolera frío intenso. Riego con agua destilada. Sustrato de turba. Excelente para exterior.',
        5200, 20, 2, 1, 'Mediano', 'popular', 1,
        'https://images.unsplash.com/photo-1596438459194-f275f413d6ff?w=600&h=600&fit=crop'
      ],
      [
        'Sarracenia Leucophylla',
        'Sarracenia leucophylla',
        'Una de las sarracenias más elegantes. Sus tubos altos con tapas blancas y venación roja crean un espectáculo visual impresionante en cualquier jardín.',
        'Sol directo abundante. Riego con agua destilada por bandeja. Sustrato de turba y arena. Hibernación natural en invierno.',
        6800, 12, 2, 2, 'Grande', 'new', 1,
        'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600&h=600&fit=crop'
      ],
      [
        'Nepenthes Alata',
        'Nepenthes alata',
        'Nepenthes tropical ideal para principiantes. Produce jarras colgantes de tamaño mediano que capturan una gran variedad de insectos voladores.',
        'Luz indirecta brillante. Alta humedad (50-80%). Riego regular con agua destilada. Temperatura 18-30°C. No requiere hibernación.',
        5800, 18, 3, 1, 'Mediano', null, 1,
        'https://images.unsplash.com/photo-1545241047-6083a3684587?w=600&h=600&fit=crop'
      ],
      [
        'Nepenthes Ventricosa',
        'Nepenthes ventricosa',
        'Produce jarras gordas y redondeadas con boca ancha. Una planta resistente y muy decorativa que se adapta bien a interiores luminosos.',
        'Luz brillante indirecta. Humedad moderada a alta. Riego cuando el sustrato esté casi seco. Sustrato drenante de corteza y musgo.',
        8500, 8, 3, 2, 'Grande', 'popular', 1,
        'https://images.unsplash.com/photo-1470058869958-2a77ade41c02?w=600&h=600&fit=crop'
      ],
      [
        'Drosera Capensis',
        'Drosera capensis',
        'La drosera más fácil de cultivar. Sus hojas alargadas están cubiertas de tentáculos pegajosos que brillan como gotas de rocío bajo la luz.',
        'Luz solar directa o indirecta brillante. Sustrato de turba húmedo. Agua destilada por bandeja. Muy resistente y prolífica.',
        3200, 30, 4, 1, 'Pequeño', null, 1,
        'https://images.unsplash.com/photo-1457530378978-8bac673b8062?w=600&h=600&fit=crop'
      ],
      [
        'Drosera Spatulata',
        'Drosera spatulata',
        'Pequeña roseta de hojas en forma de espátula cubiertas de mucílago brillante. Perfecta para terrarios y espacios reducidos.',
        'Luz brillante. Sustrato húmedo de turba y perlita. Agua destilada. Tolera bien temperaturas de interior.',
        2800, 35, 4, 1, 'Pequeño', 'sale', 1,
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop'
      ],
      [
        'Pinguícula Moranensis',
        'Pinguicula moranensis',
        'Hermosa planta con hojas verdes viscosas que atrapan mosquitos y pequeños insectos. Produce flores moradas espectaculares.',
        'Luz indirecta brillante. Riego moderado. Sustrato mineral bien drenado. Tolera ambientes secos mejor que otras carnívoras.',
        3800, 22, 5, 1, 'Pequeño', 'new', 1,
        'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=600&h=600&fit=crop'
      ],
      [
        'Kit Iniciación Carnívoras',
        'Colección variada',
        'Pack perfecto para comenzar tu colección. Incluye una Venus Atrapamoscas, una Drosera Capensis y una Pinguícula. Ideal para regalar.',
        'Cada planta viene con su guía de cuidados individual. Seguir las instrucciones específicas de cada especie para mejores resultados.',
        9900, 15, 1, 1, 'Mediano', 'popular', 1,
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop'
      ],
      [
        'Nepenthes Rajah',
        'Nepenthes rajah',
        'La reina de las Nepenthes. Produce las jarras más grandes del género, capaces de atrapar incluso pequeños roedores. Pieza de colección exclusiva.',
        'Clima fresco y húmedo (highland). Temperaturas nocturnas bajas (10-18°C). Muy alta humedad. Solo para cultivadores experimentados.',
        25000, 3, 3, 3, 'Grande', 'new', 1,
        'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600&h=600&fit=crop'
      ],
    ]

    for (const prod of products) {
      insertProd.run(...prod)
    }
    console.log('✅ Products seeded (12 plants)')
  }

  console.log('✅ Database initialized')
}
