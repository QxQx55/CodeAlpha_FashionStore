# Wende Brand Store

A responsive fashion storefront built with React, TypeScript, and Vite. Its Express API uses SQLite for the product catalog, customer accounts, carts, wishlists, and orders.

## Requirements

- Node.js 20.12 or newer
- npm

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The development command starts the Vite frontend and Express API together. SQLite creates and seeds `data/store.sqlite` on the first API start.

On Windows PowerShell, if the `npm` command is blocked by script execution policy, use `npm.cmd install` and `npm.cmd run dev` instead.

Create an account to add real products to your cart. The catalog includes clearly labeled sample listings for display; sample listings cannot be added to a cart or purchased. In preview mode, real products can be tested using simulated Telebirr, CBE Birr, or card checkout. Demo orders are marked as sandbox demos, do not represent real orders or payments, and do not change stock. With `STORE_MODE=auto`, the store switches to live after an administrator adds the first active real product with a photo and positive stock. Live checkout never accepts sample listings.

For an optional Chapa sandbox integration, add your Chapa **test secret key** (the key begins with `CHASECK_TEST`) as `CHAPA_SECRET_KEY=...` in the ignored `.env.local` file (see `.env.example`). This is not required for the local no-charge demo checkout. Add the setting without overwriting existing local environment values. Keep the key server-side; never add a `VITE_` prefix or commit `.env.local`. The API reads this ignored file when it starts, so restart `npm run dev` after changing it. The development return URL defaults to `http://localhost:3000`; set `PUBLIC_APP_URL` to your public HTTPS storefront URL in production. Chapa's hosted checkout shows the methods enabled for your merchant account; its supported methods include Telebirr, CBE Birr, and credit/debit cards. Mastercard availability depends on your Chapa merchant account.

The API creates demo orders using server-calculated prices and marks them `sandbox_complete` without changing stock. The demo payment options only record the selected simulation method; they do not contact a provider or process a charge. If Chapa test credentials are configured, a separate optional Chapa sandbox flow creates a pending order and verifies the transaction reference, payment status, amount, and currency. In live mode, verified orders are processed and stock is reduced. No card details are entered into or stored by this store. Use Chapa's test-mode credentials and test payment methods before switching to live credentials.

To enable the admin screens, set `ADMIN_EMAIL` to the store owner's email in the ignored `.env.local` file before starting the server. Create an account with that email, or restart the server to promote an existing account with that email. The admin portal is available at `/admin/products`; administrators can add products, edit their catalog data, price, and photo URL, manage variant sizes and stock, and delete products that have no order history. Product and variant data is saved in SQLite and active products are fetched by the storefront. Products with order history should be deactivated rather than deleted.

For example, in Windows PowerShell, set the email before starting the dev server:

```powershell
$env:ADMIN_EMAIL = "owner@example.com"
npm.cmd run dev
```

Alternatively, add `ADMIN_EMAIL=owner@example.com` to `.env.local`. If you change it while the server is running, restart the server; registering a new account with that email grants admin access, and an existing account is promoted on restart.

Administrators can add a product in **Manage Store → Products → Add Product**. Select an existing category, enter a price and the actual stock quantity for each size, upload or provide a product photo, and choose whether the listing is active. Stock values are required per size; the form does not assume inventory quantities. Saving writes the product and its variants to SQLite in one transaction. With `STORE_MODE=auto`, the first active product with a photo and positive stock automatically enables live checkout. Seeded sample products stay visible with a sample label but are never purchasable. Editing a product's base price updates variants that still use that base price.

Administrators can edit footer copy at **Manage Store → Storefront Content**. Shipping and returns appears publicly only after text is saved. Newsletter-offer copy is shown as plain information; newsletter signup is not connected. Privacy and Terms links are clearly marked as drafts that require owner review.

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

The Express server serves the built frontend and API on the same port (default `4000`). Set `JWT_SECRET` to a long, unique secret and configure `PORT` as needed. Set `DB_PATH` to a persistent writable file path when deploying so SQLite data survives restarts. Uploaded product photos are stored in a `product-uploads` folder beside the database by default; set `PRODUCT_UPLOAD_DIR` to override it. Keep this folder on persistent storage in production. Set `ADMIN_EMAIL` before registering your administrator account. For Chapa, set `CHAPA_SECRET_KEY` and `PUBLIC_APP_URL` on the API server; use HTTPS in production. The default development JWT secret is rejected in production unless `JWT_SECRET` is set.

## Deploying the storefront and API

Vercel serves the frontend. The Express + SQLite API needs a persistent Node.js host; SQLite must not be stored on Vercel's temporary filesystem. A Render Blueprint is provided in `render.yaml` and provisions the API, a persistent 1 GB disk, production JWT secret, and health check. Render's persistent disk requires a paid web-service plan.

1. In Render, choose **New → Blueprint**, connect this repository and deploy `render.yaml`.
2. Wait for the API service to become healthy, then verify `https://<your-render-service>.onrender.com/api/health` returns `{"status":"ok"}`.
3. In the Vercel project's Production environment variables, set `VITE_API_URL` to the API service's HTTPS origin (no trailing slash), then redeploy the frontend.
4. If using Chapa, set `CHAPA_SECRET_KEY` in Render. Set `ADMIN_EMAIL` there before registering the store owner account.
5. Keep `STORE_MODE=auto` in Render. The API stays in preview until an administrator adds the first active real product with a photo and positive stock, then switches to live automatically. The frontend reads the current store mode from the API, so no separate Vercel catalog-mode setting is needed. Use Chapa's **live** secret key for Chapa payments; cash on delivery remains available for real products. Preview demo orders do not change stock.

The Render Blueprint allows `https://www.codealpha.tech` and `https://codealpha.tech` as storefront origins and uses `https://www.codealpha.tech` for payment return links. Attach the custom domain to the Vercel project and set `VITE_API_URL` in Vercel to the deployed Render API origin before redeploying. `VITE_API_URL` is public and must never contain secrets. `PUBLIC_APP_URL` is used for payment return links. The frontend uses Vite's local API proxy when `VITE_API_URL` is unset.

Until your actual product names, prices, stock, and product photos are loaded, the storefront intentionally identifies its built-in catalog as preview/sample inventory. The photos and listings currently marked as samples are not proof of actual inventory and cannot be purchased. Use your own product photos or images you have permission to use.

The preview catalog and homepage hero use locally stored, category-matched illustrative photos under `public/images/`. Their sources and license/attribution details are in [public/images/SOURCES.md](public/images/SOURCES.md). Replace these illustrative photos with photos of the actual items before publishing real inventory.

## API

- `GET /api/health`
- `GET /api/storefront-settings` (public footer copy), `PUT /api/admin/storefront-settings` (administrator only)
- `GET /api/collections`, `GET /api/products`, `GET /api/productVariants` (optional JSON `where` query)
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- Authenticated catalog-variant, cart, and wishlist endpoints under `/api`
- `POST /api/checkout` creates cash-on-delivery orders or initializes a Chapa checkout from the signed-in customer's server-side cart and database prices
- `GET /api/payments/chapa/status`, `GET /api/payments/chapa/verify/:txRef` (authenticated transaction verification and stock finalization)
- Authenticated order and order-item endpoints under `/api`
