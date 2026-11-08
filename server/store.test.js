import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';

const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'wende-store-test-'));
process.env.DB_PATH = path.join(temporaryDirectory, 'store.sqlite');
process.env.JWT_SECRET = 'test-secret';
process.env.ADMIN_EMAIL = 'admin@example.com';
const { createApp } = await import('./index.js');
let server;
let baseUrl;

before(async () => {
  server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  const { db } = await import('./store.js');
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

  const excessiveCartItem = await request('/api/cartItems', {
    method: 'POST',
    token: login.body.token,
    body: JSON.stringify({ variantId: 'variant_hab_1_s', quantity: 26 }),
  });
  assert.equal(excessiveCartItem.response.status, 409);

  const cartItem = await request('/api/cartItems', {
    method: 'POST',
    token,
    body: JSON.stringify({ variantId: 'variant_hab_1_s', quantity: 2, price: 1 }),
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
  const [variant] = (await request('/api/productVariants?where=%7B%22id%22%3A%22variant_hab_1_s%22%7D')).body;
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
      imageUrl: 'https://example.com/product.jpg',
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

  const updatedProduct = await request(`/api/products/${product.body.id}`, {
    method: 'PUT',
    token: adminRegistration.body.token,
    body: JSON.stringify({ basePrice: 2500 }),
  });
  assert.equal(updatedProduct.response.status, 200);
  assert.equal(updatedProduct.body.basePrice, 2500);
  const updatedVariants = (await request(`/api/productVariants?where=${encodeURIComponent(JSON.stringify({ productId: product.body.id }))}`)).body;
  assert.ok(updatedVariants.every((variant) => variant.price === 2500 && variant.stock === 7));

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

test('sets security headers and limits repeated sign-in attempts', async () => {
  const health = await request('/api/health');
  assert.equal(health.response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(health.response.headers.get('x-frame-options'), 'DENY');
  assert.equal(health.response.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
  assert.match(health.response.headers.get('content-security-policy'), /frame-ancestors 'none'/);

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
  assert.equal(new Set(imageUrls).size, imageUrls.length, 'every product must have a distinct main photo');
  const names = products.body.map((product) => product.name.trim().toLowerCase());
  assert.equal(new Set(names).size, names.length, 'product names must be unique');
});

test('initializes Chapa checkout and only processes an order after verifying payment', async () => {
  const originalFetch = globalThis.fetch;
  const originalSecret = process.env.CHAPA_SECRET_KEY;
  const originalAppUrl = process.env.PUBLIC_APP_URL;
  const providerCalls = [];
  process.env.CHAPA_SECRET_KEY = 'CHASECK_TEST_example';
  process.env.PUBLIC_APP_URL = 'http://localhost:3000';

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
    const variantBefore = (await request('/api/productVariants?where=%7B%22id%22%3A%22variant_demo_men_1_s%22%7D')).body[0];
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
    assert.equal(initialization.amount, '4735.00');
    assert.equal(initialization.currency, 'ETB');
    assert.equal(initialization.phone_number, '0911234567');
    assert.equal(initialization.return_url, `http://localhost:3000/checkout/complete?tx_ref=${checkout.body.txRef}`);
    assert.equal(providerCalls[0].options.headers.Authorization, 'Bearer CHASECK_TEST_example');

    const pendingOrder = (await request(`/api/orders?where=${encodeURIComponent(JSON.stringify({ id: checkout.body.orderId }))}`, { token })).body[0];
    assert.equal(pendingOrder.status, 'pending');
    assert.equal(JSON.parse(pendingOrder.shippingAddress).paymentMethod, 'chapa');
    const stockBeforeVerification = (await request(`/api/productVariants?where=${encodeURIComponent(JSON.stringify({ id: variantBefore.id }))}`)).body[0].stock;
    assert.equal(stockBeforeVerification, variantBefore.stock);

    const verification = await request(`/api/payments/chapa/verify/${checkout.body.txRef}`, { token });
    assert.equal(verification.response.status, 200);
    assert.equal(verification.body.status, 'processing');
    const variantAfterVerification = (await request(`/api/productVariants?where=${encodeURIComponent(JSON.stringify({ id: variantBefore.id }))}`)).body[0];
    assert.equal(variantAfterVerification.stock, variantBefore.stock - 2);
    const cartAfterVerification = await request('/api/cartItems', { token });
    assert.deepEqual(cartAfterVerification.body, []);

    const repeatedVerification = await request(`/api/payments/chapa/verify/${checkout.body.txRef}`, { token });
    assert.equal(repeatedVerification.response.status, 200);
    assert.equal(providerCalls.length, 2, 'a completed order should not be verified or charged twice');
    assert.equal((await request(`/api/productVariants?where=${encodeURIComponent(JSON.stringify({ id: variantBefore.id }))}`)).body[0].stock, variantBefore.stock - 2);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalSecret === undefined) delete process.env.CHAPA_SECRET_KEY;
    else process.env.CHAPA_SECRET_KEY = originalSecret;
    if (originalAppUrl === undefined) delete process.env.PUBLIC_APP_URL;
    else process.env.PUBLIC_APP_URL = originalAppUrl;
  }
});
