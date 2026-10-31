import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { collections, products, productVariants } from './seed.js';

const databasePath = process.env.DB_PATH || path.join(process.cwd(), 'data', 'store.sqlite');
fs.mkdirSync(path.dirname(databasePath), { recursive: true });

export const db = new Database(databasePath);
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

export const resources = {
  collections: ['id', 'name', 'slug', 'description', 'imageUrl', 'active'],
  products: ['id', 'name', 'slug', 'description', 'basePrice', 'imageUrl', 'collectionId', 'gender', 'active', 'sizeGuide', 'fitNotes', 'createdAt'],
  productVariants: ['id', 'productId', 'size', 'color', 'material', 'price', 'stock', 'imageUrls'],
  cartItems: ['id', 'userId', 'variantId', 'quantity'],
  wishlist: ['id', 'userId', 'productId'],
  orders: ['id', 'userId', 'totalAmount', 'status', 'shippingAddress', 'createdAt'],
  orderItems: ['id', 'orderId', 'variantId', 'quantity', 'price'],
  returns: ['id', 'userId', 'orderId', 'status', 'reason', 'createdAt'],
};

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      passwordHash TEXT NOT NULL,
      displayName TEXT NOT NULL,
      isAdmin INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS collections (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL DEFAULT '', imageUrl TEXT NOT NULL DEFAULT '',
      active TEXT NOT NULL DEFAULT '1'
    );
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL DEFAULT '', basePrice REAL NOT NULL,
      imageUrl TEXT NOT NULL DEFAULT '', collectionId TEXT,
      gender TEXT NOT NULL DEFAULT 'unisex',
      active TEXT NOT NULL DEFAULT '1', sizeGuide TEXT, fitNotes TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (collectionId) REFERENCES collections(id) ON DELETE SET NULL
    );
    CREATE TABLE IF NOT EXISTS productVariants (
      id TEXT PRIMARY KEY, productId TEXT NOT NULL, size TEXT, color TEXT,
      material TEXT, price REAL, stock INTEGER NOT NULL DEFAULT 0,
      imageUrls TEXT NOT NULL DEFAULT '[]',
      FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS cartItems (
      id TEXT PRIMARY KEY, userId TEXT NOT NULL, variantId TEXT NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      UNIQUE (userId, variantId),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (variantId) REFERENCES productVariants(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS wishlist (
      id TEXT PRIMARY KEY, userId TEXT NOT NULL, productId TEXT NOT NULL,
      UNIQUE (userId, productId),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY, userId TEXT NOT NULL, totalAmount REAL NOT NULL,
      status TEXT NOT NULL, shippingAddress TEXT NOT NULL, createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS orderItems (
      id TEXT PRIMARY KEY, orderId TEXT NOT NULL, variantId TEXT NOT NULL,
      quantity INTEGER NOT NULL, price REAL NOT NULL,
      FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (variantId) REFERENCES productVariants(id)
    );
    CREATE TABLE IF NOT EXISTS returns (
      id TEXT PRIMARY KEY, userId TEXT NOT NULL, orderId TEXT NOT NULL,
      status TEXT NOT NULL, reason TEXT NOT NULL, createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS products_collection_idx ON products(collectionId);
    CREATE INDEX IF NOT EXISTS variants_product_idx ON productVariants(productId);
    CREATE INDEX IF NOT EXISTS orders_user_idx ON orders(userId);
    CREATE INDEX IF NOT EXISTS order_items_order_idx ON orderItems(orderId);
  `);

  const productColumns = db.prepare('PRAGMA table_info(products)').all();
  if (!productColumns.some((column) => column.name === 'gender')) {
    db.exec("ALTER TABLE products ADD COLUMN gender TEXT NOT NULL DEFAULT 'unisex'");
    db.exec(`
      UPDATE products
      SET gender = CASE
        WHEN collections.slug = 'men' THEN 'men'
        WHEN collections.slug = 'women' THEN 'women'
        WHEN collections.slug = 'kids' THEN 'kids'
        WHEN collections.slug = 'traditional' AND lower(products.name) LIKE '%women%' THEN 'women'
        WHEN collections.slug = 'traditional' AND lower(products.name) LIKE '%men%' THEN 'men'
        ELSE 'unisex'
      END
      FROM collections
      WHERE products.collectionId = collections.id
    `);
  }

  const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  if (adminEmail) {
    db.prepare('UPDATE users SET isAdmin = 1 WHERE email = ?').run(adminEmail);
  }

  const insertCollection = db.prepare(`
    INSERT OR IGNORE INTO collections (id, name, slug, description, imageUrl, active)
    VALUES (@id, @name, @slug, @description, @imageUrl, @active)
  `);
  const insertProduct = db.prepare(`
    INSERT OR IGNORE INTO products (id, name, slug, description, basePrice, imageUrl, collectionId, gender, active, createdAt)
    VALUES (@id, @name, @slug, @description, @basePrice, @imageUrl, @collectionId, @gender, @active, @createdAt)
  `);
  const insertVariant = db.prepare(`
    INSERT OR IGNORE INTO productVariants (id, productId, size, color, material, price, stock, imageUrls)
    VALUES (@id, @productId, @size, @color, @material, @price, @stock, @imageUrls)
  `);
  const seed = db.transaction(() => {
    collections.forEach((collection) => insertCollection.run(collection));
    products.forEach((product) => insertProduct.run(product));
    productVariants.forEach((variant) => insertVariant.run(variant));
  });
  seed();
}

initializeDatabase();
