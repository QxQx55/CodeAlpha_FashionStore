import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';

const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'wende-store-test-'));
process.env.DB_PATH = path.join(temporaryDirectory, 'store.sqlite');
process.env.JWT_SECRET = 'test-secret';
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
    body: JSON.stringify({ variantId: 'variant_hab_1_default', quantity: 26 }),
  });
  assert.equal(excessiveCartItem.response.status, 409);

  const cartItem = await request('/api/cartItems', {
    method: 'POST',
    token,
    body: JSON.stringify({ variantId: 'variant_hab_1_default', quantity: 2, price: 1 }),
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
  const [variant] = (await request('/api/productVariants?where=%7B%22id%22%3A%22variant_hab_1_default%22%7D')).body;
  assert.equal(variant.stock, 23);

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
});
