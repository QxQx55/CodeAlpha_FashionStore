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

function createRateLimiter({ limit, windowMs }) {
  const attempts = new Map();
  return (req, res, next) => {
    const now = Date.now();
    let bucket = attempts.get(req.ip);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
    }
    bucket.count += 1;
    attempts.set(req.ip, bucket);

    if (attempts.size > 10000) {
      for (const [ip, entry] of attempts) {
        if (entry.resetAt <= now) attempts.delete(ip);
      }
      if (attempts.size > 10000) attempts.delete(attempts.keys().next().value);
    }

    const remaining = Math.max(0, limit - bucket.count);
    const resetSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    res.set('RateLimit-Limit', String(limit));
    res.set('RateLimit-Remaining', String(remaining));
    res.set('RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));
    if (bucket.count > limit) {
      res.set('Retry-After', String(resetSeconds));
      return res.status(429).json({ error: 'Too many attempts. Please try again later.' });
    }
    next();
  };
}

function validateChapaPayment(order, providerResponse) {
  const payment = providerResponse?.data;
  if (String(payment?.status || '').toLowerCase() !== 'success') {
    throw new HttpError(409, 'Chapa has not confirmed this payment.');
  }
  if (payment.tx_ref !== order.id) {
    throw new HttpError(409, 'The payment reference does not match this order.');
  }
  if (String(payment.currency || '').toUpperCase() !== 'ETB') {
    throw new HttpError(409, 'The payment currency does not match this order.');
  }
  const amount = Number(payment.amount);
  if (!Number.isFinite(amount) || Math.round(amount * 100) !== Math.round(order.totalAmount * 100)) {
    throw new HttpError(409, 'The verified payment amount does not match this order.');
  }

  const finalizeOrder = db.transaction(() => {
    const currentOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(order.id);
    if (!currentOrder) throw new HttpError(404, 'Order not found.');
    if (currentOrder.status === 'processing') return currentOrder;
    if (currentOrder.status !== 'pending') throw new HttpError(409, 'This order is no longer awaiting payment.');

    const items = db.prepare('SELECT variantId, quantity FROM orderItems WHERE orderId = ?').all(order.id);
    const updateStock = db.prepare('UPDATE productVariants SET stock = stock - ? WHERE id = ? AND stock >= ?');
    for (const item of items) {
      const result = updateStock.run(item.quantity, item.variantId, item.quantity);
      if (result.changes !== 1) {
        throw new HttpError(409, 'Payment succeeded, but an item is no longer available. Contact store support.');
      }
    }

    db.prepare("UPDATE orders SET status = 'processing' WHERE id = ?").run(order.id);
    db.prepare(`
      DELETE FROM cartItems
      WHERE userId = ? AND variantId IN (SELECT variantId FROM orderItems WHERE orderId = ?)
    `).run(order.userId, order.id);
    return db.prepare('SELECT * FROM orders WHERE id = ?').get(order.id);
  });
  return finalizeOrder();
}

function createApp() {
  const app = express();
  app.disable('x-powered-by');
  const allowedOrigins = new Set(
    String(process.env.CORS_ORIGINS || '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  );
  app.use((_req, res, next) => {
    res.set({
      'Content-Security-Policy': "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; script-src 'self'; connect-src 'self' https:",
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    });
    if (process.env.NODE_ENV === 'production') {
      res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
  });
  app.use((req, res, next) => {
    const origin = req.get('origin');
    if (origin && allowedOrigins.has(origin)) {
      res.set({
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        Vary: 'Origin',
      });
    }
    if (req.method === 'OPTIONS') {
      if (origin && !allowedOrigins.has(origin)) return res.status(403).end();
      return res.status(204).end();
    }
    next();
  });
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.get('/api/payments/chapa/status', (_req, res) => {
    res.json({ available: Boolean(process.env.CHAPA_SECRET_KEY) });
  });

  app.post('/api/auth/register', createRateLimiter({ limit: 10, windowMs: 15 * 60 * 1000 }), async (req, res, next) => {
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

  app.post('/api/auth/login', createRateLimiter({ limit: 10, windowMs: 15 * 60 * 1000 }), async (req, res, next) => {
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

  app.post('/api/checkout', authenticate, async (req, res, next) => {
    try {
      if (process.env.STORE_MODE !== 'live') {
        throw new HttpError(503, 'Checkout is disabled while the store is using preview inventory.');
      }
      const address = req.body?.shippingAddress;
      const paymentMethod = req.body?.paymentMethod;
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
      if (!['cash_on_delivery', 'chapa'].includes(paymentMethod)) {
        throw new HttpError(400, 'Choose a supported payment method.');
      }
      if (paymentMethod === 'chapa' && !process.env.CHAPA_SECRET_KEY) {
        throw new HttpError(503, 'Chapa payments are not configured. Set CHAPA_SECRET_KEY on the API server.');
      }
      if (paymentMethod === 'chapa' && String(address.phone || '').trim()) {
        const digits = String(address.phone).replace(/\D/g, '');
        const localNumber = digits.startsWith('251') ? `0${digits.slice(3)}` : digits;
        if (!/^0[79]\d{8}$/.test(localNumber)) {
          throw new HttpError(400, 'Enter an Ethiopian mobile number with 10 digits, or leave it blank.');
        }
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
      let appUrl;
      if (paymentMethod === 'chapa') {
        const publicAppUrl = process.env.PUBLIC_APP_URL
          || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000');
        try {
          appUrl = new URL(publicAppUrl);
        } catch {
          throw new HttpError(503, 'Set PUBLIC_APP_URL to your storefront URL before enabling Chapa payments.');
        }
        if (!['http:', 'https:'].includes(appUrl.protocol)
          || appUrl.username
          || appUrl.password
          || (process.env.NODE_ENV === 'production' && appUrl.protocol !== 'https:')) {
          throw new HttpError(503, 'PUBLIC_APP_URL must be a valid HTTPS storefront URL in production.');
        }
      }
      const orderId = crypto.randomUUID();
      const order = {
        id: orderId,
        userId: req.user.id,
        totalAmount,
        status: paymentMethod === 'chapa' ? 'pending' : 'processing',
        shippingAddress: JSON.stringify({
          email: String(address.email).trim(),
          firstName: String(address.firstName).trim(),
          lastName: String(address.lastName).trim(),
          address: String(address.address).trim(),
          city: String(address.city).trim(),
          postalCode: String(address.postalCode).trim(),
          country: String(address.country || 'Ethiopia').trim(),
          phone: String(address.phone || '').trim(),
          paymentMethod,
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
        for (const item of cart) {
          const price = Number(item.price ?? item.basePrice);
          insertItem.run(crypto.randomUUID(), order.id, item.variantId, item.quantity, price);
        }
        if (paymentMethod === 'cash_on_delivery') {
          const updateStock = db.prepare('UPDATE productVariants SET stock = stock - ? WHERE id = ? AND stock >= ?');
          for (const item of cart) {
            const result = updateStock.run(item.quantity, item.variantId, item.quantity);
            if (result.changes !== 1) throw new HttpError(409, 'A cart item has just sold out. Please review your cart.');
          }
          db.prepare('DELETE FROM cartItems WHERE userId = ?').run(req.user.id);
        }
      });
      createOrder();

      if (paymentMethod === 'cash_on_delivery') {
        return res.status(201).json(order);
      }

      const digits = String(address.phone || '').replace(/\D/g, '');
      const phoneNumber = digits ? (digits.startsWith('251') ? `0${digits.slice(3)}` : digits) : '';
      const paymentPayload = {
        amount: totalAmount.toFixed(2),
        currency: 'ETB',
        email: String(address.email).trim(),
        first_name: String(address.firstName).trim(),
        last_name: String(address.lastName).trim(),
        tx_ref: order.id,
        return_url: new URL(`/checkout/complete?tx_ref=${encodeURIComponent(order.id)}`, appUrl).toString(),
        customization: {
          title: 'Wende Market',
          description: `Order ${order.id}`,
        },
      };
      if (phoneNumber) paymentPayload.phone_number = phoneNumber;

      let chapaResponse;
      try {
        chapaResponse = await fetch('https://api.chapa.co/v1/transaction/initialize', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentPayload),
        });
      } catch {
        db.prepare("UPDATE orders SET status = 'payment_failed' WHERE id = ?").run(order.id);
        throw new HttpError(502, 'Could not connect to Chapa. Your cart has not been charged; please try again.');
      }
      const chapaResult = await chapaResponse.json().catch(() => null);
      if (!chapaResponse.ok || chapaResult?.status !== 'success' || !chapaResult?.data?.checkout_url) {
        db.prepare("UPDATE orders SET status = 'payment_failed' WHERE id = ?").run(order.id);
        throw new HttpError(502, 'Chapa could not start the payment. Your cart has not been charged; please try again.');
      }
      let paymentUrl;
      try {
        paymentUrl = new URL(chapaResult.data.checkout_url);
      } catch {
        db.prepare("UPDATE orders SET status = 'payment_failed' WHERE id = ?").run(order.id);
        throw new HttpError(502, 'Chapa returned an invalid payment link.');
      }
      if (paymentUrl.protocol !== 'https:' || paymentUrl.hostname !== 'checkout.chapa.co') {
        db.prepare("UPDATE orders SET status = 'payment_failed' WHERE id = ?").run(order.id);
        throw new HttpError(502, 'Chapa returned an invalid payment link.');
      }
      res.status(201).json({
        orderId: order.id,
        txRef: order.id,
        paymentUrl: paymentUrl.toString(),
      });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/payments/chapa/verify/:txRef', authenticate, async (req, res, next) => {
    try {
      const txRef = String(req.params.txRef || '');
      if (!/^[0-9a-f-]{36}$/i.test(txRef)) throw new HttpError(400, 'Invalid payment reference.');
      const order = db.prepare('SELECT * FROM orders WHERE id = ? AND userId = ?').get(txRef, req.user.id);
      if (!order) throw new HttpError(404, 'Order not found.');
      if (order.status === 'processing') return res.json(order);
      if (order.status !== 'pending') throw new HttpError(409, 'This order is no longer awaiting payment.');
      if (!process.env.CHAPA_SECRET_KEY) {
        throw new HttpError(503, 'Chapa payments are not configured on the API server.');
      }

      let chapaResponse;
      try {
        chapaResponse = await fetch(`https://api.chapa.co/v1/transaction/verify/${encodeURIComponent(txRef)}`, {
          headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` },
        });
      } catch {
        throw new HttpError(502, 'Could not verify the payment with Chapa. Please try again.');
      }
      const chapaResult = await chapaResponse.json().catch(() => null);
      if (!chapaResponse.ok || chapaResult?.status !== 'success') {
        throw new HttpError(502, 'Chapa could not verify this payment. Please try again.');
      }
      res.json(validateChapaPayment(order, chapaResult));
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
    if (resource === 'products') {
      fields.name = String(fields.name || '').trim();
      fields.slug = String(fields.slug || fields.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')).trim();
      fields.description = String(fields.description || '');
      fields.collectionId = String(fields.collectionId || '');
      fields.gender = String(fields.gender || 'unisex').toLowerCase();
      fields.basePrice = Number(fields.basePrice);
      fields.imageUrl = String(fields.imageUrl || '').trim();
      fields.sizeGuide = String(fields.sizeGuide || '');
      fields.fitNotes = String(fields.fitNotes || '');
      fields.active = fields.active === '0' || fields.active === 0 || fields.active === false ? '0' : '1';

      if (!fields.name || fields.name.length > 200) {
        throw new HttpError(400, 'Enter a product name up to 200 characters.');
      }
      if (!fields.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fields.slug) || fields.slug.length > 200) {
        throw new HttpError(400, 'Enter a valid product URL slug.');
      }
      if (!Number.isFinite(fields.basePrice) || fields.basePrice <= 0) {
        throw new HttpError(400, 'Product price must be greater than zero.');
      }
      if (!['men', 'women', 'unisex', 'kids'].includes(fields.gender)) {
        throw new HttpError(400, 'Choose a valid product audience.');
      }
      if (!db.prepare('SELECT id FROM collections WHERE id = ? AND active = ?').get(fields.collectionId, '1')) {
        throw new HttpError(400, 'Choose an active product category.');
      }
      const initialStock = Number(req.body?.initialStock ?? 25);
      if (!Number.isInteger(initialStock) || initialStock < 0 || initialStock > 1000000) {
        throw new HttpError(400, 'Initial stock must be a whole number between 0 and 1,000,000.');
      }
      const sizes = Array.isArray(req.body?.sizes)
        ? [...new Set(req.body.sizes.map((size) => String(size).trim()).filter(Boolean))]
        : ['One Size'];
      if (sizes.length === 0 || sizes.length > 30 || sizes.some((size) => size.length > 30)) {
        throw new HttpError(400, 'Add between 1 and 30 valid product sizes.');
      }
      fields.createdAt = new Date().toISOString();
      const insertProduct = db.prepare(`
        INSERT INTO products (id, name, slug, description, basePrice, imageUrl, collectionId, gender, active, sizeGuide, fitNotes, createdAt)
        VALUES (@id, @name, @slug, @description, @basePrice, @imageUrl, @collectionId, @gender, @active, @sizeGuide, @fitNotes, @createdAt)
      `);
      const insertVariant = db.prepare(`
        INSERT INTO productVariants (id, productId, size, color, material, price, stock, imageUrls)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      db.transaction(() => {
        insertProduct.run(fields);
        sizes.forEach((size) => {
          insertVariant.run(
            crypto.randomUUID(),
            fields.id,
            size,
            'Default',
            '',
            fields.basePrice,
            initialStock,
            JSON.stringify(fields.imageUrl ? [fields.imageUrl] : []),
          );
        });
      })();
      return res.status(201).json(db.prepare('SELECT * FROM products WHERE id = ?').get(fields.id));
    }

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
          if (resource === 'products') {
            if (fields.name !== undefined) fields.name = String(fields.name).trim();
            if (fields.slug !== undefined) fields.slug = String(fields.slug).trim();
            if (fields.basePrice !== undefined) fields.basePrice = Number(fields.basePrice);
            if (fields.collectionId !== undefined) fields.collectionId = String(fields.collectionId || '');
            if (fields.gender !== undefined) fields.gender = String(fields.gender).toLowerCase();
            if (fields.name !== undefined && (!fields.name || fields.name.length > 200)) {
              throw new HttpError(400, 'Enter a product name up to 200 characters.');
            }
            if (fields.slug !== undefined && (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fields.slug) || fields.slug.length > 200)) {
              throw new HttpError(400, 'Enter a valid product URL slug.');
            }
            if (fields.basePrice !== undefined && (!Number.isFinite(fields.basePrice) || fields.basePrice <= 0)) {
              throw new HttpError(400, 'Product price must be greater than zero.');
            }
            if (fields.gender !== undefined && !['men', 'women', 'unisex', 'kids'].includes(fields.gender)) {
              throw new HttpError(400, 'Choose a valid product audience.');
            }
            if (fields.collectionId !== undefined && !db.prepare('SELECT id FROM collections WHERE id = ? AND active = ?').get(fields.collectionId, '1')) {
              throw new HttpError(400, 'Choose an active product category.');
            }
            if (fields.active !== undefined) {
              fields.active = fields.active === '0' || fields.active === 0 || fields.active === false ? '0' : '1';
            }
          }
          const entries = Object.entries(fields);
          if (entries.length === 0) throw new HttpError(400, 'No valid fields were provided.');
          const updateRecord = db.transaction(() => {
            db.prepare(`UPDATE "${resource}" SET ${entries.map(([key]) => `"${key}" = ?`).join(', ')} WHERE id = ?`)
              .run(...entries.map(([, value]) => value), id);
            if (resource === 'products' && fields.basePrice !== undefined) {
              db.prepare(`
                UPDATE productVariants
                SET price = ?
                WHERE productId = ? AND (price IS NULL OR price = ?)
              `).run(fields.basePrice, id, current.basePrice);
            }
          });
          updateRecord();
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
