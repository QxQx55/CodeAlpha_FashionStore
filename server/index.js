import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, resources } from './store.js';

const appDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(appDirectory, '..');
const jwtSecret = process.env.JWT_SECRET || 'development-secret-change-before-deploy';
const privateResources = new Set(['cartItems', 'wishlist', 'orders', 'orderItems', 'returns']);
const publicResources = new Set(['collections', 'products', 'productVariants']);

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    isAdmin: Boolean(user.isAdmin),
  };
}

function createToken(user) {
  return jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: '7d' });
}

function authenticate(req, _res, next) {
  const authorization = req.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) return next(new HttpError(401, 'Please sign in to continue.'));

  let payload;
  try {
    payload = jwt.verify(token, jwtSecret);
  } catch {
    return next(new HttpError(401, 'Your session has expired. Please sign in again.'));
  }
  const user = db.prepare('SELECT id, email, displayName, isAdmin FROM users WHERE id = ?').get(payload.sub);
  if (!user) return next(new HttpError(401, 'Your session has expired. Please sign in again.'));
  req.user = user;
  next();
}

function requireAdmin(req, _res, next) {
  if (!req.user?.isAdmin) return next(new HttpError(403, 'Administrator access is required.'));
  next();
}

function parseJson(value, fallback) {
  if (typeof value !== 'string') return value ?? fallback;
  try {
    return JSON.parse(value);
  } catch {
    throw new HttpError(400, 'Invalid JSON request parameter.');
  }
}

function cleanFields(resource, input) {
  const allowed = resources[resource];
  return Object.fromEntries(
    Object.entries(input || {}).filter(([key, value]) => allowed.includes(key) && value !== undefined),
  );
}

function validateCartQuantity(variantId, quantity) {
  const amount = Number(quantity);
  if (!Number.isInteger(amount) || amount < 1 || amount > 100) {
    throw new HttpError(400, 'Quantity must be a whole number between 1 and 100.');
  }
  const variant = db.prepare('SELECT stock FROM productVariants WHERE id = ?').get(variantId);
  if (!variant) throw new HttpError(404, 'That product option is no longer available.');
  if (amount > variant.stock) throw new HttpError(409, 'There is not enough stock for that quantity.');
  return amount;
}

function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  app.post('/api/auth/register', async (req, res, next) => {
    try {
      const email = String(req.body?.email || '').trim().toLowerCase();
      const password = String(req.body?.password || '');
      const displayName = String(req.body?.displayName || '').trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new HttpError(400, 'Enter a valid email address.');
      }
      if (password.length < 8 || password.length > 128) {
        throw new HttpError(400, 'Password must be between 8 and 128 characters.');
      }
      if (!displayName || displayName.length > 100) {
        throw new HttpError(400, 'Enter your name (up to 100 characters).');
      }
      if (db.prepare('SELECT id FROM users WHERE email = ?').get(email)) {
        throw new HttpError(409, 'An account with this email already exists.');
      }

      const user = {
        id: crypto.randomUUID(),
        email,
        displayName,
        passwordHash: await bcrypt.hash(password, 12),
        isAdmin: email === String(process.env.ADMIN_EMAIL || '').trim().toLowerCase() ? 1 : 0,
        createdAt: new Date().toISOString(),
      };
      db.prepare(`
        INSERT INTO users (id, email, passwordHash, displayName, isAdmin, createdAt)
        VALUES (@id, @email, @passwordHash, @displayName, @isAdmin, @createdAt)
      `).run(user);
      const safeUser = publicUser(user);
      res.status(201).json({ user: safeUser, token: createToken(safeUser) });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/auth/login', async (req, res, next) => {
    try {
      const email = String(req.body?.email || '').trim().toLowerCase();
      const password = String(req.body?.password || '');
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        throw new HttpError(401, 'Email or password is incorrect.');
      }
      const safeUser = publicUser(user);
      res.json({ user: safeUser, token: createToken(safeUser) });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/auth/me', authenticate, (req, res) => res.json({ user: publicUser(req.user) }));

  app.get('/api/:resource', (req, res, next) => {
    try {
      const { resource } = req.params;
      if (!Object.hasOwn(resources, resource)) throw new HttpError(404, 'Resource not found.');
      const columns = resources[resource];
      if (!publicResources.has(resource) && !req.user) {
        return authenticate(req, res, (error) => {
          if (error) return next(error);
          listResource(req, res, resource, columns);
        });
      }
      if (privateResources.has(resource) && req.user) {
        return listResource(req, res, resource, columns);
      }
      if (!publicResources.has(resource)) {
        return authenticate(req, res, (error) => {
          if (error) return next(error);
          listResource(req, res, resource, columns);
        });
      }
      listResource(req, res, resource, columns);
    } catch (error) {
      next(error);
    }
  });

  function listResource(req, res, resource, columns) {
    const where = parseJson(req.query.where, {});
    if (!where || typeof where !== 'object' || Array.isArray(where)) {
      throw new HttpError(400, 'The where filter must be an object.');
    }
    const filters = Object.entries(where).filter(([key]) => columns.includes(key));
    if (privateResources.has(resource)) {
      if (resource === 'orderItems') {
        if (!where.orderId) throw new HttpError(400, 'An order ID is required.');
        const order = req.user.isAdmin
          ? db.prepare('SELECT id FROM orders WHERE id = ?').get(where.orderId)
          : db.prepare('SELECT id FROM orders WHERE id = ? AND userId = ?').get(where.orderId, req.user.id);
        if (!order) throw new HttpError(404, 'Order not found.');
      } else if (!req.user.isAdmin) {
        filters.push(['userId', req.user.id]);
      }
    }

    const clauses = filters.map(([key]) => `"${key}" = ?`);
    const values = filters.map(([, value]) => value);
    const orderBy = parseJson(req.query.orderBy, {});
    if (!orderBy || typeof orderBy !== 'object' || Array.isArray(orderBy)) {
      throw new HttpError(400, 'The orderBy parameter must be an object.');
    }
    const [orderColumn, direction] = Object.entries(orderBy)[0] || [];
    const safeOrder = columns.includes(orderColumn) ? `"${orderColumn}" ${direction === 'asc' ? 'ASC' : 'DESC'}` : '';
    const limit = Math.max(1, Math.min(Number.parseInt(req.query.limit, 10) || 100, 200));
    const sql = `SELECT * FROM "${resource}"${clauses.length ? ` WHERE ${clauses.join(' AND ')}` : ''}${safeOrder ? ` ORDER BY ${safeOrder}` : ''} LIMIT ?`;
    res.json(db.prepare(sql).all(...values, limit));
  }

  app.post('/api/checkout', authenticate, (req, res, next) => {
    try {
      const address = req.body?.shippingAddress;
      if (!address || typeof address !== 'object' || Array.isArray(address)) {
        throw new HttpError(400, 'Enter a valid shipping address.');
      }
      const requiredAddress = ['firstName', 'lastName', 'address', 'city', 'postalCode'];
      if (requiredAddress.some((field) => !String(address[field] || '').trim())) {
        throw new HttpError(400, 'Complete all required shipping address fields.');
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(address.email || ''))) {
        throw new HttpError(400, 'Enter a valid contact email address.');
      }
      const addressLimits = { email: 254, firstName: 100, lastName: 100, address: 200, city: 100, postalCode: 30, country: 100, phone: 30 };
      for (const [field, maxLength] of Object.entries(addressLimits)) {
        if (String(address[field] || '').length > maxLength) {
          throw new HttpError(400, `${field} is too long.`);
        }
      }
      if (req.body?.paymentMethod !== 'cash_on_delivery') {
        throw new HttpError(400, 'Choose cash on delivery to place this demo order.');
      }

      const cart = db.prepare(`
        SELECT ci.variantId, ci.quantity, v.stock, v.price, p.basePrice
        FROM cartItems ci
        JOIN productVariants v ON v.id = ci.variantId
        JOIN products p ON p.id = v.productId
        WHERE ci.userId = ?
      `).all(req.user.id);
      if (cart.length === 0) throw new HttpError(400, 'Your cart is empty.');
      for (const item of cart) {
        if (item.quantity > item.stock) throw new HttpError(409, 'A cart item no longer has enough stock.');
      }

      const subtotal = cart.reduce((total, item) => total + Number(item.price ?? item.basePrice) * item.quantity, 0);
      const shipping = subtotal > 5000 ? 0 : 250;
      const tax = subtotal * 0.15;
      const totalAmount = Math.round((subtotal + shipping + tax) * 100) / 100;
      const order = {
        id: crypto.randomUUID(),
        userId: req.user.id,
        totalAmount,
        status: 'processing',
        shippingAddress: JSON.stringify({
          email: String(address.email).trim(),
          firstName: String(address.firstName).trim(),
          lastName: String(address.lastName).trim(),
          address: String(address.address).trim(),
          city: String(address.city).trim(),
          postalCode: String(address.postalCode).trim(),
          country: String(address.country || 'Ethiopia').trim(),
          phone: String(address.phone || '').trim(),
          paymentMethod: 'cash_on_delivery',
        }),
        createdAt: new Date().toISOString(),
      };

      const createOrder = db.transaction(() => {
        db.prepare(`
          INSERT INTO orders (id, userId, totalAmount, status, shippingAddress, createdAt)
          VALUES (@id, @userId, @totalAmount, @status, @shippingAddress, @createdAt)
        `).run(order);
        const insertItem = db.prepare(`
          INSERT INTO orderItems (id, orderId, variantId, quantity, price)
          VALUES (?, ?, ?, ?, ?)
        `);
        const updateStock = db.prepare('UPDATE productVariants SET stock = stock - ? WHERE id = ? AND stock >= ?');
        for (const item of cart) {
          const price = Number(item.price ?? item.basePrice);
          insertItem.run(crypto.randomUUID(), order.id, item.variantId, item.quantity, price);
          const result = updateStock.run(item.quantity, item.variantId, item.quantity);
          if (result.changes !== 1) throw new HttpError(409, 'A cart item has just sold out. Please review your cart.');
        }
        db.prepare('DELETE FROM cartItems WHERE userId = ?').run(req.user.id);
      });
      createOrder();
      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/:resource', (req, res, next) => {
    try {
      const { resource } = req.params;
      if (!Object.hasOwn(resources, resource)) throw new HttpError(404, 'Resource not found.');
      authenticate(req, res, (authError) => {
        if (authError) return next(authError);
        try {
          if (['products', 'productVariants', 'collections'].includes(resource)) {
            requireAdmin(req, res, (adminError) => {
              if (adminError) return next(adminError);
              createResource(req, res, resource);
            });
            return;
          }
          if (resource === 'cartItems') {
            const variantId = String(req.body?.variantId || '');
            const quantity = validateCartQuantity(variantId, req.body?.quantity);
            const existing = db.prepare('SELECT id, quantity FROM cartItems WHERE userId = ? AND variantId = ?').get(req.user.id, variantId);
            if (existing) {
              const nextQuantity = validateCartQuantity(variantId, existing.quantity + quantity);
              db.prepare('UPDATE cartItems SET quantity = ? WHERE id = ?').run(nextQuantity, existing.id);
              return res.json(db.prepare('SELECT * FROM cartItems WHERE id = ?').get(existing.id));
            }
            const item = { id: crypto.randomUUID(), userId: req.user.id, variantId, quantity };
            db.prepare('INSERT INTO cartItems (id, userId, variantId, quantity) VALUES (@id, @userId, @variantId, @quantity)').run(item);
            return res.status(201).json(item);
          }
          if (resource === 'wishlist') {
            const productId = String(req.body?.productId || '');
            if (!db.prepare('SELECT id FROM products WHERE id = ?').get(productId)) {
              throw new HttpError(404, 'Product not found.');
            }
            const existing = db.prepare('SELECT * FROM wishlist WHERE userId = ? AND productId = ?').get(req.user.id, productId);
            if (existing) return res.json(existing);
            const item = { id: crypto.randomUUID(), userId: req.user.id, productId };
            db.prepare('INSERT INTO wishlist (id, userId, productId) VALUES (@id, @userId, @productId)').run(item);
            return res.status(201).json(item);
          }
          if (resource === 'returns') {
            const orderId = String(req.body?.orderId || '');
            if (!db.prepare('SELECT id FROM orders WHERE id = ? AND userId = ?').get(orderId, req.user.id)) {
              throw new HttpError(404, 'Order not found.');
            }
            const item = {
              id: crypto.randomUUID(),
              userId: req.user.id,
              orderId,
              status: 'pending',
              reason: String(req.body?.reason || 'Customer requested return').slice(0, 500),
              createdAt: new Date().toISOString(),
            };
            db.prepare('INSERT INTO returns (id, userId, orderId, status, reason, createdAt) VALUES (@id, @userId, @orderId, @status, @reason, @createdAt)').run(item);
            return res.status(201).json(item);
          }
          throw new HttpError(403, 'This resource cannot be created directly.');
        } catch (error) {
          next(error);
        }
      });
    } catch (error) {
      next(error);
    }
  });

  function createResource(req, res, resource) {
    const fields = cleanFields(resource, req.body);
    if (!fields.id) fields.id = crypto.randomUUID();
    const entries = Object.entries(fields);
    if (entries.length === 0) throw new HttpError(400, 'No valid fields were provided.');
    const names = entries.map(([key]) => `"${key}"`).join(', ');
    const placeholders = entries.map(() => '?').join(', ');
    db.prepare(`INSERT INTO "${resource}" (${names}) VALUES (${placeholders})`).run(...entries.map(([, value]) => value));
    res.status(201).json(db.prepare(`SELECT * FROM "${resource}" WHERE id = ?`).get(fields.id));
  }

  app.put('/api/:resource/:id', authenticate, (req, res, next) => {
    try {
      const { resource, id } = req.params;
      if (!Object.hasOwn(resources, resource)) throw new HttpError(404, 'Resource not found.');
      const columns = resources[resource];
      const performUpdate = () => {
        const current = db.prepare(`SELECT * FROM "${resource}" WHERE id = ?`).get(id);
        if (!current) throw new HttpError(404, 'Record not found.');
        if (resource === 'cartItems') {
          if (current.userId !== req.user.id) throw new HttpError(404, 'Record not found.');
          const quantity = validateCartQuantity(current.variantId, req.body?.quantity);
          db.prepare('UPDATE cartItems SET quantity = ? WHERE id = ?').run(quantity, id);
          return res.json(db.prepare('SELECT * FROM cartItems WHERE id = ?').get(id));
        }
        if (['products', 'productVariants', 'collections', 'orders', 'returns'].includes(resource)) {
          const fields = cleanFields(resource, req.body);
          delete fields.id;
          const entries = Object.entries(fields);
          if (entries.length === 0) throw new HttpError(400, 'No valid fields were provided.');
          db.prepare(`UPDATE "${resource}" SET ${entries.map(([key]) => `"${key}" = ?`).join(', ')} WHERE id = ?`)
            .run(...entries.map(([, value]) => value), id);
          return res.json(db.prepare(`SELECT * FROM "${resource}" WHERE id = ?`).get(id));
        }
        throw new HttpError(403, 'This record cannot be updated.');
      };

      if (resource === 'cartItems') return performUpdate();
      requireAdmin(req, res, (error) => {
        if (error) return next(error);
        try {
          performUpdate();
        } catch (updateError) {
          next(updateError);
        }
      });
    } catch (error) {
      next(error);
    }
  });

  app.delete('/api/:resource/:id', authenticate, (req, res, next) => {
    try {
      const { resource, id } = req.params;
      if (!Object.hasOwn(resources, resource)) throw new HttpError(404, 'Resource not found.');
      const remove = () => {
        const record = db.prepare(`SELECT * FROM "${resource}" WHERE id = ?`).get(id);
        if (!record) throw new HttpError(404, 'Record not found.');
        if (resource === 'cartItems' || resource === 'wishlist') {
          if (record.userId !== req.user.id) throw new HttpError(404, 'Record not found.');
        } else if (['products', 'productVariants', 'collections'].includes(resource)) {
          if (!req.user.isAdmin) throw new HttpError(403, 'Administrator access is required.');
        } else {
          throw new HttpError(403, 'This record cannot be deleted.');
        }
        db.prepare(`DELETE FROM "${resource}" WHERE id = ?`).run(id);
        res.status(204).end();
      };
      if (['products', 'productVariants', 'collections'].includes(resource)) {
        return requireAdmin(req, res, (error) => {
          if (error) return next(error);
          try {
            remove();
          } catch (removeError) {
            next(removeError);
          }
        });
      }
      remove();
    } catch (error) {
      next(error);
    }
  });

  app.use('/api', (_req, _res, next) => next(new HttpError(404, 'API endpoint not found.')));
  app.use(express.static(path.join(projectDirectory, 'dist')));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(projectDirectory, 'dist', 'index.html'), (error) => {
      if (error) next(error);
    });
  });

  app.use((error, _req, res, _next) => {
    if (error instanceof SyntaxError && 'body' in error) {
      return res.status(400).json({ error: 'Request body must be valid JSON.' });
    }
    if (error instanceof HttpError) {
      return res.status(error.status).json({ error: error.message });
    }
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'That record already exists.' });
    }
    console.error(error);
    res.status(500).json({ error: 'An unexpected server error occurred.' });
  });
  return app;
}

export { createApp };

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
    throw new Error('Set JWT_SECRET to at least 32 characters before starting the server in production.');
  }
  const port = Number(process.env.PORT || 4000);
  createApp().listen(port, () => {
    console.log(`Store API listening on http://localhost:${port}`);
  });
}
