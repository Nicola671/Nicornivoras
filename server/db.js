import { createClient } from '@libsql/client'
import bcryptjs from 'bcryptjs'

let db

export function getDB() {
  if (!db) {
    db = createClient({
      url: process.env.TURSO_DATABASE_URL || 'file:./nicornivoras.db',
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
  }
  return db
}

export async function initDB() {
  const database = getDB()

  // Create tables
  await database.executeMultiple(`
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

  // Add is_hibernating column if it doesn't exist (migration)
  try {
    await database.execute(`ALTER TABLE products ADD COLUMN is_hibernating INTEGER DEFAULT 0;`)
  } catch (e) {
    // Column already exists, safe to ignore
  }

  // Seed admin
  const adminEmail = process.env.ADMIN_USERNAME || 'nicolasmedinae06@gmail.com'
  const adminPass  = process.env.ADMIN_PASSWORD  || 'NicoyMati2025!'
  const hashedPassword = bcryptjs.hashSync(adminPass, 10)

  const adminExists = await database.execute({
    sql: 'SELECT id FROM admins WHERE username = ?',
    args: [adminEmail]
  })

  if (adminExists.rows.length === 0) {
    await database.execute({ sql: 'DELETE FROM admins WHERE username = ?', args: ['admin'] })
    await database.execute({
      sql: 'INSERT OR REPLACE INTO admins (username, password) VALUES (?, ?)',
      args: [adminEmail, hashedPassword]
    })
    console.log(`✅ Admin created: ${adminEmail}`)
  }

  // Seed categories
  const catCount = await database.execute('SELECT COUNT(*) as c FROM categories')
  if (catCount.rows[0].c === 0) {
    const cats = [
      ['Venus Atrapamoscas', 'venus', 'La planta carnívora más famosa del mundo, con sus icónicas trampas en forma de mandíbula', '🪴'],
      ['Sarracenias', 'sarracenia', 'Elegantes trompetas que atraen insectos con sus colores vibrantes y néctar dulce', '🌿'],
      ['Nepenthes', 'nepenthes', 'Jarras tropicales colgantes de formas espectaculares originarias del sudeste asiático', '🌱'],
      ['Droseras', 'drosera', 'Cubiertas de gotas pegajosas y brillantes que atrapan insectos con su belleza letal', '✨'],
      ['Pinguículas', 'pinguicula', 'Hojas viscosas con aspecto de suculenta que capturan mosquitos y pequeños insectos', '🍀'],
    ]
    for (const cat of cats) {
      await database.execute({
        sql: 'INSERT INTO categories (name, slug, description, icon) VALUES (?, ?, ?, ?)',
        args: cat
      })
    }
    console.log('✅ Categories seeded')
  }

  // Seed products
  const prodCount = await database.execute('SELECT COUNT(*) as c FROM products')
  if (prodCount.rows[0].c === 0) {
    const defaultProducts = [
      { name: "Dionaea Muscipula 'B52'", sci_name: "Dionaea muscipula", desc: "Variedad gigante.", care: "Agua destilada.", price: 15000, stock: 10, cat: 1, diff: 2, size: 'Mediano', badge: 'popular', img: null }
    ]

    for (const p of defaultProducts) {
      const res = await database.execute({
        sql: `INSERT INTO products (name, scientific_name, description, care_instructions, price, stock, category_id, difficulty, size, badge, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [p.name, p.sci_name, p.desc, p.care, p.price, p.stock, p.cat, p.diff, p.size, p.badge, p.img]
      })
      const prodId = Number(res.lastInsertRowid)
      await database.execute({
        sql: `INSERT INTO size_variants (product_id, size, price, stock) VALUES (?, ?, ?, ?)`,
        args: [prodId, p.size, p.price, p.stock]
      })
    }
    console.log('✅ Products seeded (1 plant)')
  }

  console.log('✅ Database initialized')
}
