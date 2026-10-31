# Wende Brand Store

A responsive fashion storefront built with React, TypeScript, and Vite. Its Express API uses SQLite for the product catalog, customer accounts, carts, wishlists, and orders.

## Requirements

- Node.js 20 or newer
- npm

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The development command starts the Vite frontend and Express API together. SQLite creates and seeds `data/store.sqlite` on the first API start.

On Windows PowerShell, if the `npm` command is blocked by script execution policy, use `npm.cmd install` and `npm.cmd run dev` instead.

Create an account to add products to your cart and place orders. Checkout uses cash on delivery; online payment is not configured, and the app does not request or store card details.

To enable the admin screens, set `ADMIN_EMAIL` to the store owner's email before starting the server. Create an account with that email, or restart the server to promote an existing account with that email. The admin portal is available at `/admin/products`.

For example, in Windows PowerShell, set the email before starting the dev server:

```powershell
$env:ADMIN_EMAIL = "owner@example.com"
npm.cmd run dev
```

Administrators can add a product in **Manage Store → Products → Add Product**. Select an existing category, enter a price and starting stock, and choose whether the listing is active. Saving writes the product and its purchasable default variant to SQLite in one transaction. Active products are available from the catalog immediately. Editing a product's base price updates variants that still use that base price.

Do not expose the development server publicly.

## Verification

```bash
npm run test:api
npm run build
```

## Production

```bash
npm run build
npm start
```

The Express server serves the built frontend and API on the same port (default `4000`). Set `JWT_SECRET` to a long, unique secret and configure `PORT` as needed. Set `DB_PATH` to a persistent writable file path when deploying so SQLite data survives restarts. Set `ADMIN_EMAIL` before registering your administrator account. The default development JWT secret is rejected in production unless `JWT_SECRET` is set.

## API

- `GET /api/health`
- `GET /api/collections`, `GET /api/products`, `GET /api/productVariants` (optional JSON `where` query)
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- Authenticated catalog-variant, cart, and wishlist endpoints under `/api`
- `POST /api/checkout` creates an order from the signed-in customer's server-side cart, calculates totals from database prices, and atomically reserves stock
- Authenticated order and order-item endpoints under `/api`
