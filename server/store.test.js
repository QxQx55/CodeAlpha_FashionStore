import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';

const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'wende-store-test-'));
process.env.DB_PATH = path.join(temporaryDirectory, 'store.sqlite');
process.env.PRODUCT_UPLOAD_DIR = path.join(temporaryDirectory, 'product-uploads');
process.env.JWT_SECRET = 'test-secret';
process.env.ADMIN_EMAIL = 'admin@example.com';
process.env.CORS_ORIGINS = 'https://www.codealpha.tech,https://codealpha.tech,https://code-alpha-fashion-store-zuw8.vercel.app,https://code-alpha-fashion-store.vercel.app';
process.env.STORE_MODE = 'live';
const { createApp } = await import('./index.js');
const { db } = await import('./store.js');
db.prepare(`
  INSERT INTO products (id, name, slug, basePrice, imageUrl, collectionId, gender, active, createdAt, isSample)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run('test_real_product', 'Verified Test Product', 'verified-test-product', 4500, '/images/products/women-dress-floral.jpg', 'coll_women', 'women', '1', new Date().toISOString(), 0);
db.prepare(`
  INSERT INTO productVariants (id, productId, size, price, stock)
  VALUES (?, ?, ?, ?, ?)
`).run('test_real_variant_s', 'test_real_product', 'S', 4500, 5);
let server;
let baseUrl;

before(async () => {
  server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  db.close();
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
});

async function request(route, { token, ...options } = {}) {
  const headers = new Headers(options.headers);
  if (options.body) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${baseUrl}${route}`, { ...options, headers });
  const body = response.status === 204 ? null : await response.json();
  return { response, body };
}

test('allows storefront requests from the custom production domains', async () => {
  for (const origin of ['https://www.codealpha.tech', 'https://codealpha.tech']) {
    const response = await fetch(`${baseUrl}/api/health`, { headers: { Origin: origin } });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('access-control-allow-origin'), origin);
  }
});

test('registers customers and places orders using current database prices and stock', async () => {
  const catalog = await request('/api/products?where=%7B%22slug%22%3A%22classic-mens-habesha-kemis%22%7D');
  assert.equal(catalog.response.status, 200);
  assert.equal(catalog.body.length, 1);
  assert.equal(catalog.body[0].basePrice, 4500);

  const registration = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email: 'shopper@example.com', password: 'secure-password-1', displayName: 'Shopper' }),
  });
  assert.equal(registration.response.status, 201);
  assert.equal(registration.body.user.email, 'shopper@example.com');
  assert.equal('passwordHash' in registration.body.user, false);
  const { token } = registration.body;

  const duplicate = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email: 'SHOPPER@example.com', password: 'secure-password-1', displayName: 'Shopper' }),
  });
  assert.equal(duplicate.response.status, 409);

  const invalidPassword = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'shopper@example.com', password: 'incorrect-password' }),
  });
  assert.equal(invalidPassword.response.status, 401);

  const login = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'SHOPPER@example.com', password: 'secure-password-1' }),
  });
  assert.equal(login.response.status, 200);
  assert.equal(login.body.user.id, registration.body.user.id);

  const unauthenticatedCart = await request('/api/cartItems');
  assert.equal(unauthenticatedCart.response.status, 401);

  process.env.STORE_MODE = 'preview';
  const previewCheckout = await request('/api/checkout', {
    token,
    method: 'POST',
    body: JSON.stringify({}),
  });
  assert.equal(previewCheckout.response.status, 503);
  assert.match(previewCheckout.body.error, /preview inventory/);
  const previewCartItem = await request('/api/cartItems', {
    token,
    method: 'POST',
    body: JSON.stringify({ variantId: 'test_real_variant_s', quantity: 1 }),
  });
  assert.equal(previewCartItem.response.status, 201);
  const removePreviewItem = await request(`/api/cartItems/${previewCartItem.body.id}`, {
    token,
    method: 'DELETE',
  });
  assert.equal(removePreviewItem.response.status, 204);
  const sampleCartItem = await request('/api/cartItems', {
    token,
    method: 'POST',
    body: JSON.stringify({ variantId: 'variant_hab_1_s', quantity: 1 }),
  });
  assert.equal(sampleCartItem.response.status, 409);
  assert.match(sampleCartItem.body.error, /sample or unpublished product/);
  process.env.STORE_MODE = 'live';

  const excessiveCartItem = await request('/api/cartItems', {
    method: 'POST',
    token: login.body.token,
    body: JSON.stringify({ variantId: 'test_real_variant_s', quantity: 26 }),
  });
  assert.equal(excessiveCartItem.response.status, 409);

  const cartItem = await request('/api/cartItems', {
    method: 'POST',
    token,
    body: JSON.stringify({ variantId: 'test_real_variant_s', quantity: 2, price: 1 }),
  });
  assert.equal(cartItem.response.status, 201);
  assert.equal(cartItem.body.quantity, 2);

  const order = await request('/api/checkout', {
    method: 'POST',
    token,
    body: JSON.stringify({
      paymentMethod: 'cash_on_delivery',
      shippingAddress: {
        email: 'shopper@example.com',
        firstName: 'Shop',
        lastName: 'Per',
        address: '1 Market Street',
        city: 'Addis Ababa',
        postalCode: '1000',
        cardNumber: '4111111111111111',
      },
    }),
  });
  assert.equal(order.response.status, 201);
  assert.equal(order.body.totalAmount, 10350);
  const savedAddress = JSON.parse(order.body.shippingAddress);
  assert.equal(savedAddress.paymentMethod, 'cash_on_delivery');
  assert.equal('cardNumber' in savedAddress, false);

  const [storedOrder] = (await request(`/api/orders?where=${encodeURIComponent(JSON.stringify({ id: order.body.id }))}`, { token })).body;
  assert.equal(storedOrder.totalAmount, 10350);
  const orderItems = await request(`/api/orderItems?where=${encodeURIComponent(JSON.stringify({ orderId: order.body.id }))}`, { token });
  assert.equal(orderItems.body.length, 1);
  assert.equal(orderItems.body[0].price, 4500);

  const remainingCart = await request('/api/cartItems', { token });
  assert.deepEqual(remainingCart.body, []);
  const [variant] = (await request('/api/productVariants?where=%7B%22id%22%3A%22test_real_variant_s%22%7D')).body;
  assert.equal(variant.stock, 3);

  const secondRegistration = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email: 'another@example.com', password: 'secure-password-2', displayName: 'Another Shopper' }),
  });
  const otherOrders = await request(`/api/orders?where=${encodeURIComponent(JSON.stringify({ id: order.body.id }))}`, {
    token: secondRegistration.body.token,
  });
  assert.deepEqual(otherOrders.body, []);
  const otherOrderItems = await request(`/api/orderItems?where=${encodeURIComponent(JSON.stringify({ orderId: order.body.id }))}`, {
    token: secondRegistration.body.token,
  });
  assert.equal(otherOrderItems.response.status, 404);

  const anonymousProduct = await request('/api/products', {
    method: 'POST',
    body: JSON.stringify({ name: 'Unauthorized product', basePrice: 1, collectionId: 'coll_men' }),
  });
  assert.equal(anonymousProduct.response.status, 401);

  const customerProduct = await request('/api/products', {
    method: 'POST',
    token: secondRegistration.body.token,
    body: JSON.stringify({ name: 'Unauthorized product', basePrice: 1, collectionId: 'coll_men' }),
  });
  assert.equal(customerProduct.response.status, 403);

  const adminRegistration = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@example.com', password: 'secure-password-admin', displayName: 'Store Admin' }),
  });
  assert.equal(adminRegistration.body.user.isAdmin, true);

  const imageBytes = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a0y8AAAAASUVORK5CYII=', 'base64');
  const unauthorizedUpload = await fetch(`${baseUrl}/api/admin/product-images`, {
    method: 'POST',
    headers: { 'Content-Type': 'image/png' },
    body: imageBytes,
  });
  assert.equal(unauthorizedUpload.status, 401);

  const invalidImageUpload = await fetch(`${baseUrl}/api/admin/product-images`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminRegistration.body.token}`,
      'Content-Type': 'image/png',
    },
    body: Buffer.from('not an image'),
  });
  assert.equal(invalidImageUpload.status, 400);

  const imageUpload = await fetch(`${baseUrl}/api/admin/product-images`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminRegistration.body.token}`,
      'Content-Type': 'image/png',
    },
    body: imageBytes,
  });
  assert.equal(imageUpload.status, 201);
  const uploadedImage = await imageUpload.json();
  assert.match(uploadedImage.imageUrl, new RegExp(`^${baseUrl}/uploads/products/[0-9a-f-]+\\.png$`));
  const imageResponse = await fetch(uploadedImage.imageUrl);
  assert.equal(imageResponse.status, 200);
  assert.deepEqual(Buffer.from(await imageResponse.arrayBuffer()), imageBytes);

  const product = await request('/api/products', {
    method: 'POST',
    token: adminRegistration.body.token,
    body: JSON.stringify({
      name: 'New Store Product',
      slug: 'new-store-product',
      description: 'Added from the admin product form.',
      collectionId: 'coll_women',
      gender: 'women',
      basePrice: 2300,
      imageUrl: uploadedImage.imageUrl,
      active: '1',
      initialStock: 7,
      sizes: ['S', 'M', 'L'],
    }),
  });
  assert.equal(product.response.status, 201);
  assert.equal(product.body.basePrice, 2300);
  assert.equal(product.body.collectionId, 'coll_women');
  assert.equal(product.body.gender, 'women');

  const publishedProduct = await request(`/api/products?where=${encodeURIComponent(JSON.stringify({ slug: 'new-store-product', active: '1' }))}`);
  assert.equal(publishedProduct.body.length, 1);
  const newVariants = (await request(`/api/productVariants?where=${encodeURIComponent(JSON.stringify({ productId: product.body.id }))}`)).body;
  assert.deepEqual(newVariants.map((variant) => variant.size).sort(), ['L', 'M', 'S']);
  assert.ok(newVariants.every((variant) => variant.price === 2300 && variant.stock === 7));

  const perSizeProduct = await request('/api/products', {
    method: 'POST',
    token: adminRegistration.body.token,
    body: JSON.stringify({
      name: 'Product with Per-Size Stock',
      slug: 'product-with-per-size-stock',
      collectionId: 'coll_women',
      gender: 'women',
      basePrice: 3100,
      imageUrl: '/images/products/women-dress-floral.jpg',
      active: '0',
      sizes: ['S', 'M', 'L'],
      sizeStocks: [
        { size: 'S', stock: 2 },
        { size: 'M', stock: 5 },
        { size: 'L', stock: 0 },
      ],
    }),
  });
  assert.equal(perSizeProduct.response.status, 201);
  const perSizeVariants = (await request(`/api/productVariants?where=${encodeURIComponent(JSON.stringify({ productId: perSizeProduct.body.id }))}`)).body;
  assert.deepEqual(
    Object.fromEntries(perSizeVariants.map((variant) => [variant.size, variant.stock])),
    { S: 2, M: 5, L: 0 },
  );

  const incompleteSizeStocks = await request('/api/products', {
    method: 'POST',
    token: adminRegistration.body.token,
    body: JSON.stringify({
      name: 'Incomplete Size Stock Product',
      slug: 'incomplete-size-stock-product',
      collectionId: 'coll_women',
      gender: 'women',
      basePrice: 3100,
      sizes: ['S', 'M'],
      sizeStocks: [{ size: 'S', stock: 1 }],
    }),
  });
  assert.equal(incompleteSizeStocks.response.status, 400);
  assert.match(incompleteSizeStocks.body.error, /stock for every product size/);

  const invalidSizeStock = await request('/api/products', {
    method: 'POST',
    token: adminRegistration.body.token,
    body: JSON.stringify({
      name: 'Invalid Size Stock Product',
      slug: 'invalid-size-stock-product',
      collectionId: 'coll_women',
      gender: 'women',
      basePrice: 3100,
      sizes: ['S'],
      sizeStocks: [{ size: 'S', stock: null }],
    }),
  });
  assert.equal(invalidSizeStock.response.status, 400);
  assert.match(invalidSizeStock.body.error, /whole number between 0 and 1,000,000/);

  const updatedProduct = await request(`/api/products/${product.body.id}`, {
    method: 'PUT',
    token: adminRegistration.body.token,
    body: JSON.stringify({ basePrice: 2500 }),
  });
  assert.equal(updatedProduct.response.status, 200);
  assert.equal(updatedProduct.body.basePrice, 2500);
  const updatedVariants = (await request(`/api/productVariants?where=${encodeURIComponent(JSON.stringify({ productId: product.body.id }))}`)).body;
  assert.ok(updatedVariants.every((variant) => variant.price === 2500 && variant.stock === 7));
  assert.ok(updatedVariants.every((variant) => variant.imageUrls === JSON.stringify([uploadedImage.imageUrl])));

  const updatedPhoto = await request(`/api/products/${product.body.id}`, {
    method: 'PUT',
    token: adminRegistration.body.token,
    body: JSON.stringify({ imageUrl: 'https://example.com/updated-product.jpg' }),
  });
  assert.equal(updatedPhoto.response.status, 200);
  assert.equal(updatedPhoto.body.imageUrl, 'https://example.com/updated-product.jpg');
  const variantsWithUpdatedPhoto = (await request(`/api/productVariants?where=${encodeURIComponent(JSON.stringify({ productId: product.body.id }))}`)).body;
  assert.ok(variantsWithUpdatedPhoto.every((variant) => variant.imageUrls === JSON.stringify(['https://example.com/updated-product.jpg'])));

  const orderId = randomUUID();
  db.prepare(`
    INSERT INTO orders (id, userId, totalAmount, status, shippingAddress, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(orderId, adminRegistration.body.user.id, 100, 'processing', '{}', new Date().toISOString());
  db.prepare(`
    INSERT INTO orderItems (id, orderId, variantId, quantity, price)
    VALUES (?, ?, ?, ?, ?)
  `).run(randomUUID(), orderId, variantsWithUpdatedPhoto[0].id, 1, 100);
  const deleteOrderedProduct = await request(`/api/products/${product.body.id}`, {
    token: adminRegistration.body.token,
    method: 'DELETE',
  });
  assert.equal(deleteOrderedProduct.response.status, 409);
  assert.match(deleteOrderedProduct.body.error, /order history/);
  db.prepare('DELETE FROM orders WHERE id = ?').run(orderId);

  const deleteProduct = await request(`/api/products/${product.body.id}`, {
    token: adminRegistration.body.token,
    method: 'DELETE',
  });
  assert.equal(deleteProduct.response.status, 204);
  const deletedVariants = await request(`/api/productVariants?where=${encodeURIComponent(JSON.stringify({ productId: product.body.id }))}`);
  assert.deepEqual(deletedVariants.body, []);
  const deletedProduct = await request(`/api/products?where=${encodeURIComponent(JSON.stringify({ id: product.body.id }))}`);
  assert.deepEqual(deletedProduct.body, []);

  const invalidProduct = await request('/api/products', {
    method: 'POST',
    token: adminRegistration.body.token,
    body: JSON.stringify({
      name: 'Product without category',
      slug: 'product-without-category',
      basePrice: 1500,
    }),
  });
  assert.equal(invalidProduct.response.status, 400);

});

test('automatically enables live mode for the first complete real product and keeps samples unpurchasable', async () => {
  const originalStoreMode = process.env.STORE_MODE;
  const originalAdminEmail = process.env.ADMIN_EMAIL;
  process.env.STORE_MODE = 'auto';
  process.env.ADMIN_EMAIL = 'automatic-admin@example.com';
  db.prepare('UPDATE storeSettings SET value = ? WHERE key = ?').run('preview', 'mode');

  try {
    const registration = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'automatic-admin@example.com',
        password: 'secure-password-auto',
        displayName: 'Automatic Admin',
      }),
    });
    assert.equal(registration.response.status, 201);

    const sampleCart = await request('/api/cartItems', {
      token: registration.body.token,
      method: 'POST',
      body: JSON.stringify({ variantId: 'variant_hab_1_s', quantity: 1 }),
    });
    assert.equal(sampleCart.response.status, 409);

    const incompleteProduct = await request('/api/products', {
      token: registration.body.token,
      method: 'POST',
      body: JSON.stringify({
        name: 'Draft Without a Photo',
        slug: 'draft-without-a-photo',
        collectionId: 'coll_women',
        gender: 'women',
        basePrice: 3000,
        active: '1',
        sizes: ['S'],
        sizeStocks: [{ size: 'S', stock: 3 }],
      }),
    });
    assert.equal(incompleteProduct.body.storeMode, 'preview');

    const realProduct = await request('/api/products', {
      token: registration.body.token,
      method: 'POST',
      body: JSON.stringify({
        name: 'First Complete Real Product',
        slug: 'first-complete-real-product',
        collectionId: 'coll_women',
        gender: 'women',
        basePrice: 3200,
        imageUrl: '/images/products/women-dress-floral.jpg',
        active: '1',
        sizes: ['S', 'M'],
        sizeStocks: [{ size: 'S', stock: 2 }, { size: 'M', stock: 4 }],
      }),
    });
    assert.equal(realProduct.response.status, 201);
    assert.equal(realProduct.body.storeMode, 'live');
    assert.equal(realProduct.body.isSample, 0);

    const status = await request('/api/payments/chapa/status');
    assert.equal(status.body.previewMode, false);
    assert.equal(status.body.storeMode, 'live');

    const sampleCartAfterActivation = await request('/api/cartItems', {
      token: registration.body.token,
      method: 'POST',
      body: JSON.stringify({ variantId: 'variant_hab_1_s', quantity: 1 }),
    });
    assert.equal(sampleCartAfterActivation.response.status, 409);

    db.prepare('INSERT INTO cartItems (id, userId, variantId, quantity) VALUES (?, ?, ?, ?)')
      .run(randomUUID(), registration.body.user.id, 'variant_hab_1_s', 1);
    const visibleCart = await request('/api/cartItems', { token: registration.body.token });
    assert.deepEqual(visibleCart.body, []);
    const sampleCheckout = await request('/api/checkout', {
      token: registration.body.token,
      method: 'POST',
      body: JSON.stringify({
        paymentMethod: 'cash_on_delivery',
        shippingAddress: {
          email: 'automatic-admin@example.com',
          firstName: 'Automatic',
          lastName: 'Admin',
          address: '1 Market Street',
          city: 'Addis Ababa',
          postalCode: '1000',
        },
      }),
    });
    assert.equal(sampleCheckout.response.status, 409);
    assert.match(sampleCheckout.body.error, /sample or unpublished product/);
    db.prepare('DELETE FROM cartItems WHERE userId = ?').run(registration.body.user.id);

    const realVariant = (await request(`/api/productVariants?where=${encodeURIComponent(JSON.stringify({ productId: realProduct.body.id }))}`)).body[0];
    const realCart = await request('/api/cartItems', {
      token: registration.body.token,
      method: 'POST',
      body: JSON.stringify({ variantId: realVariant.id, quantity: 1 }),
    });
    assert.equal(realCart.response.status, 201);
  } finally {
    db.prepare('UPDATE storeSettings SET value = ? WHERE key = ?').run('preview', 'mode');
    db.prepare('DELETE FROM products WHERE slug IN (?, ?)').run('draft-without-a-photo', 'first-complete-real-product');
    if (originalStoreMode === undefined) delete process.env.STORE_MODE;
    else process.env.STORE_MODE = originalStoreMode;
    if (originalAdminEmail === undefined) delete process.env.ADMIN_EMAIL;
    else process.env.ADMIN_EMAIL = originalAdminEmail;
  }
});

test('sets security headers and limits repeated sign-in attempts', async () => {
  const health = await request('/api/health');
  assert.equal(health.response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(health.response.headers.get('x-frame-options'), 'DENY');
  assert.equal(health.response.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
  assert.match(health.response.headers.get('content-security-policy'), /frame-ancestors 'none'/);

  const allowedOrigin = await fetch(`${baseUrl}/api/health`, {
    headers: { Origin: 'https://code-alpha-fashion-store-zuw8.vercel.app' },
  });
  assert.equal(allowedOrigin.headers.get('access-control-allow-origin'), 'https://code-alpha-fashion-store-zuw8.vercel.app');

  const preflight = await fetch(`${baseUrl}/api/health`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'https://code-alpha-fashion-store-zuw8.vercel.app',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'authorization,content-type',
    },
  });
  assert.equal(preflight.status, 204);
  assert.match(preflight.headers.get('access-control-allow-methods'), /POST/);

  const rejectedOrigin = await fetch(`${baseUrl}/api/health`, {
    method: 'OPTIONS',
    headers: { Origin: 'https://attacker.example' },
  });
  assert.equal(rejectedOrigin.status, 403);

  let throttledResponse;
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const result = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: `unknown-${attempt}@example.com`, password: 'wrong-password' }),
    });
    if (result.response.status === 429) {
      throttledResponse = result.response;
      break;
    }
  }
  assert.ok(throttledResponse, 'repeated sign-in attempts should be throttled');
  assert.ok(Number(throttledResponse.headers.get('retry-after')) > 0);
});

test('seeds at least ten category-matched products into every active category', async () => {
  const [categories, products] = await Promise.all([
    request('/api/collections?limit=200'),
    request('/api/products?limit=200'),
  ]);
  assert.equal(categories.response.status, 200);
  assert.equal(products.response.status, 200);
  const categoryNamePrefixes = {
    Men: ["Men's"],
    Women: ["Women's"],
    Kids: ['Kids '],
    Shoes: ['Shoes -'],
    'Traditional Wear': ['Traditional Wear -'],
    Accessories: ['Accessories -'],
    Outerwear: ['Outerwear -'],
    Activewear: ['Activewear -'],
  };
  for (const category of categories.body) {
    const categoryProducts = products.body.filter((product) => product.collectionId === category.id);
    assert.ok(categoryProducts.length >= 10, `expected at least ten products in ${category.name}, got ${categoryProducts.length}`);
    const expectedPrefixes = categoryNamePrefixes[category.name];
    assert.ok(expectedPrefixes, `missing product-name rule for ${category.name}`);
    const matchingProducts = categoryProducts.filter((product) => expectedPrefixes.some((prefix) => product.name.startsWith(prefix)));
    assert.ok(matchingProducts.length >= 8, `expected category-matched demo products in ${category.name}`);
  }
  const imageUrls = products.body.map((product) => product.imageUrl);
  const nonLocalImages = imageUrls.filter((imageUrl) => !/^\/images\/products\/[a-z0-9-]+\.jpg$/.test(imageUrl));
  assert.deepEqual(nonLocalImages, [], 'sample products should use locally stored photos');
  for (const category of categories.body) {
    const categoryImageUrls = new Set(
      products.body
        .filter((product) => product.collectionId === category.id)
        .map((product) => product.imageUrl),
    );
    assert.ok(categoryImageUrls.size >= 2, `expected multiple relevant photos in ${category.name}`);
  }
  const names = products.body.map((product) => product.name.trim().toLowerCase());
  assert.equal(new Set(names).size, names.length, 'product names must be unique');
});

test('completes no-charge demo checkout without a payment provider and preserves real inventory', async () => {
  const originalSecret = process.env.CHAPA_SECRET_KEY;
  const originalStoreMode = process.env.STORE_MODE;
  delete process.env.CHAPA_SECRET_KEY;
  process.env.STORE_MODE = 'preview';

  try {
    const registration = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'demo-shopper@example.com', password: 'secure-password-4', displayName: 'Demo Shopper' }),
    });
    assert.equal(registration.response.status, 201);
    const { token } = registration.body;
    const status = await request('/api/payments/chapa/status');
    assert.equal(status.body.demoCheckoutAvailable, true);

    process.env.STORE_MODE = 'live';
    const liveDemoCheckout = await request('/api/checkout', {
      token,
      method: 'POST',
      body: JSON.stringify({ paymentMethod: 'demo' }),
    });
    assert.equal(liveDemoCheckout.response.status, 503);
    assert.match(liveDemoCheckout.body.error, /only available while the store is in preview mode/);
    process.env.STORE_MODE = 'preview';

    const shippingAddress = {
      email: 'demo-shopper@example.com',
      firstName: 'Demo',
      lastName: 'Shopper',
      address: '1 Market Street',
      city: 'Addis Ababa',
      postalCode: '1000',
      phone: '+251 911 234 567',
    };
    const invalidChannel = await request('/api/checkout', {
      token,
      method: 'POST',
      body: JSON.stringify({ paymentMethod: 'demo', demoChannel: 'unknown', shippingAddress }),
    });
    assert.equal(invalidChannel.response.status, 400);
    assert.match(invalidChannel.body.error, /valid simulated payment option/);

    const variantId = 'test_real_variant_s';
    const variantBefore = (await request(`/api/productVariants?where=${encodeURIComponent(JSON.stringify({ id: variantId }))}`)).body[0];
    assert.ok(variantBefore.stock > 0);
    const cartItem = await request('/api/cartItems', {
      token,
      method: 'POST',
      body: JSON.stringify({ variantId, quantity: 2 }),
    });
    assert.equal(cartItem.response.status, 201);

    const checkout = await request('/api/checkout', {
      token,
      method: 'POST',
      body: JSON.stringify({ paymentMethod: 'demo', demoChannel: 'telebirr', shippingAddress }),
    });
    assert.equal(checkout.response.status, 201);
    assert.equal(checkout.body.status, 'sandbox_complete');
    const orderDetails = JSON.parse(checkout.body.shippingAddress);
    assert.equal(orderDetails.paymentMethod, 'demo');
    assert.equal(orderDetails.demoChannel, 'telebirr');
    assert.equal(orderDetails.sandbox, true);

    const orderItems = await request(`/api/orderItems?where=${encodeURIComponent(JSON.stringify({ orderId: checkout.body.id }))}`, { token });
    assert.equal(orderItems.response.status, 200);
    assert.equal(orderItems.body.length, 1);
    assert.equal(orderItems.body[0].variantId, variantId);
    assert.equal(orderItems.body[0].quantity, 2);

    const cartAfterCheckout = await request('/api/cartItems', { token });
    assert.deepEqual(cartAfterCheckout.body, []);
    const variantAfter = (await request(`/api/productVariants?where=${encodeURIComponent(JSON.stringify({ id: variantId }))}`)).body[0];
    assert.equal(variantAfter.stock, variantBefore.stock);
  } finally {
    if (originalSecret === undefined) delete process.env.CHAPA_SECRET_KEY;
    else process.env.CHAPA_SECRET_KEY = originalSecret;
    if (originalStoreMode === undefined) delete process.env.STORE_MODE;
    else process.env.STORE_MODE = originalStoreMode;
  }
});

test('initializes Chapa checkout and only processes an order after verifying payment', async () => {
  const originalFetch = globalThis.fetch;
  const originalSecret = process.env.CHAPA_SECRET_KEY;
  const originalAppUrl = process.env.PUBLIC_APP_URL;
  const originalStoreMode = process.env.STORE_MODE;
  const providerCalls = [];
  process.env.CHAPA_SECRET_KEY = 'CHASECK_TEST_example';
  process.env.PUBLIC_APP_URL = 'http://localhost:3000';
  process.env.STORE_MODE = 'live';

  globalThis.fetch = async (input, options) => {
    if (String(input).startsWith(baseUrl)) return originalFetch(input, options);
    providerCalls.push({ url: String(input), options });
    if (String(input).endsWith('/transaction/initialize')) {
      const payload = JSON.parse(options.body);
      return new Response(JSON.stringify({
        status: 'success',
        data: { checkout_url: 'https://checkout.chapa.co/checkout/payment/demo', tx_ref: payload.tx_ref },
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    const txRef = String(input).split('/').pop();
    const initializePayload = JSON.parse(providerCalls[0].options.body);
    return new Response(JSON.stringify({
      status: 'success',
      data: { status: 'success', tx_ref: txRef, amount: initializePayload.amount, currency: 'ETB' },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };

  try {
    const registration = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'chapa-shopper@example.com', password: 'secure-password-3', displayName: 'Chapa Shopper' }),
    });
    assert.equal(registration.response.status, 201);
    const token = registration.body.token;
    const liveTestKeyCheckout = await request('/api/checkout', {
      token,
      method: 'POST',
      body: JSON.stringify({ paymentMethod: 'chapa' }),
    });
    assert.equal(liveTestKeyCheckout.response.status, 503);
    assert.match(liveTestKeyCheckout.body.error, /test key cannot be used for live checkout/);

    process.env.STORE_MODE = 'preview';
    const chapaStatus = await request('/api/payments/chapa/status');
    assert.deepEqual(chapaStatus.body, {
      available: true,
      sandbox: true,
      checkoutAvailable: true,
      demoCheckoutAvailable: true,
      storeMode: 'preview',
      previewMode: true,
    });
    const previewCashOnDelivery = await request('/api/checkout', {
      token,
      method: 'POST',
      body: JSON.stringify({ paymentMethod: 'cash_on_delivery' }),
    });
    assert.equal(previewCashOnDelivery.response.status, 503);
    assert.match(previewCashOnDelivery.body.error, /preview inventory/);

    const variantBefore = (await request('/api/productVariants?where=%7B%22id%22%3A%22test_real_variant_s%22%7D')).body[0];
    assert.ok(variantBefore.stock > 0);

    await request('/api/cartItems', {
      method: 'POST',
      token,
      body: JSON.stringify({ variantId: variantBefore.id, quantity: 2 }),
    });
    const checkout = await request('/api/checkout', {
      method: 'POST',
      token,
      body: JSON.stringify({
        paymentMethod: 'chapa',
        shippingAddress: {
          email: 'chapa-shopper@example.com',
          firstName: 'Chapa',
          lastName: 'Shopper',
          address: '1 Market Street',
          city: 'Addis Ababa',
          postalCode: '1000',
          phone: '+251 911 234 567',
        },
      }),
    });
    assert.equal(checkout.response.status, 201);
    assert.match(checkout.body.paymentUrl, /^https:\/\/checkout\.chapa\.co\//);
    const initialization = JSON.parse(providerCalls[0].options.body);
    assert.equal(initialization.amount, '10350.00');
    assert.equal(initialization.currency, 'ETB');
    assert.equal(initialization.phone_number, '0911234567');
    assert.equal(initialization.return_url, `http://localhost:3000/checkout/complete?tx_ref=${checkout.body.txRef}`);
    assert.equal(providerCalls[0].options.headers.Authorization, 'Bearer CHASECK_TEST_example');

    const pendingOrder = (await request(`/api/orders?where=${encodeURIComponent(JSON.stringify({ id: checkout.body.orderId }))}`, { token })).body[0];
    assert.equal(pendingOrder.status, 'pending');
    assert.equal(JSON.parse(pendingOrder.shippingAddress).paymentMethod, 'chapa');
    assert.equal(JSON.parse(pendingOrder.shippingAddress).sandbox, true);
    const stockBeforeVerification = (await request(`/api/productVariants?where=${encodeURIComponent(JSON.stringify({ id: variantBefore.id }))}`)).body[0].stock;
    assert.equal(stockBeforeVerification, variantBefore.stock);

    process.env.STORE_MODE = 'live';
    const verification = await request(`/api/payments/chapa/verify/${checkout.body.txRef}`, { token });
    assert.equal(verification.response.status, 200);
    assert.equal(verification.body.status, 'sandbox_complete');
    const variantAfterVerification = (await request(`/api/productVariants?where=${encodeURIComponent(JSON.stringify({ id: variantBefore.id }))}`)).body[0];
    assert.equal(variantAfterVerification.stock, variantBefore.stock);
    const cartAfterVerification = await request('/api/cartItems', { token });
    assert.deepEqual(cartAfterVerification.body, []);

    process.env.STORE_MODE = 'preview';
    const repeatedVerification = await request(`/api/payments/chapa/verify/${checkout.body.txRef}`, { token });
    assert.equal(repeatedVerification.response.status, 200);
    assert.equal(repeatedVerification.body.status, 'sandbox_complete');
    assert.equal(providerCalls.length, 2, 'a completed order should not be verified or charged twice');
    assert.equal((await request(`/api/productVariants?where=${encodeURIComponent(JSON.stringify({ id: variantBefore.id }))}`)).body[0].stock, variantBefore.stock);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalSecret === undefined) delete process.env.CHAPA_SECRET_KEY;
    else process.env.CHAPA_SECRET_KEY = originalSecret;
    if (originalAppUrl === undefined) delete process.env.PUBLIC_APP_URL;
    else process.env.PUBLIC_APP_URL = originalAppUrl;
    if (originalStoreMode === undefined) delete process.env.STORE_MODE;
    else process.env.STORE_MODE = originalStoreMode;
  }
});
