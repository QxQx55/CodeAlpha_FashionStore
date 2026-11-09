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

Create an account to add products to your cart and place orders. The catalog includes demo products in every category. Checkout supports cash on delivery and Chapa hosted checkout.

To enable Chapa sandbox payments, add your Chapa **test secret key** as `CHAPA_SECRET_KEY=...` in the ignored `.env.local` file (see `.env.example`). Add the setting without overwriting existing local environment values. Keep the key server-side; never add a `VITE_` prefix or commit `.env.local`. The API reads this ignored file when it starts, so restart `npm run dev` after changing it. The development return URL defaults to `http://localhost:3000`; set `PUBLIC_APP_URL` to your public HTTPS storefront URL in production.

The API creates a pending order using server-calculated prices, redirects the customer to Chapa, then verifies the transaction reference, payment status, amount, and currency with Chapa before processing the order and reducing stock. No card details are entered into or stored by this store. Use Chapa's test-mode credentials and test payment methods before switching to live credentials.

To enable the admin screens, set `ADMIN_EMAIL` to the store owner's email in the ignored `.env.local` file before starting the server. Create an account with that email, or restart the server to promote an existing account with that email. The admin portal is available at `/admin/products`; choose **Add Product**, fill in its category, price, sizes, and stock, then select **Save and Publish Product**. The server requires an authenticated administrator and creates the product and its variants together.

For example, in Windows PowerShell, set the email before starting the dev server:

```powershell
$env:ADMIN_EMAIL = "owner@example.com"
npm.cmd run dev
```

Alternatively, add `ADMIN_EMAIL=owner@example.com` to `.env.local`. If you change it while the server is running, restart the server; registering a new account with that email grants admin access, and an existing account is promoted on restart.

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

The Express server serves the built frontend and API on the same port (default `4000`). Set `JWT_SECRET` to a long, unique secret and configure `PORT` as needed. Set `DB_PATH` to a persistent writable file path when deploying so SQLite data survives restarts. Set `ADMIN_EMAIL` before registering your administrator account. For Chapa, set `CHAPA_SECRET_KEY` and `PUBLIC_APP_URL` on the API server; use HTTPS in production. The default development JWT secret is rejected in production unless `JWT_SECRET` is set.

## Deploying the frontend to Vercel

Vercel serves the Vite frontend, but it does not run this app's long-lived Express + SQLite server as a static deployment. Deploy the Express app separately on a Node.js host with a persistent disk, and set its `DB_PATH` to a file on that disk. Configure the API host with:

- `NODE_ENV=production`
- `JWT_SECRET` (at least 32 characters)
- `DB_PATH` (on persistent storage)
- `CORS_ORIGINS=https://code-alpha-fashion-store.vercel.app` (include any other exact storefront origins, comma-separated)
- `PUBLIC_APP_URL=https://code-alpha-fashion-store.vercel.app`

In the Vercel project settings, set `VITE_API_URL` to the API host's HTTPS origin (for example, `https://your-api-host.example.com`) for Production, then redeploy. This value is public and must not contain secrets. The frontend uses the Vite dev-server proxy locally when `VITE_API_URL` is unset.

Vercel's build configuration is in `vercel.json`. The API health check is `GET /api/health`. Without a reachable API, the storefront and catalog pages display demo products, but account, cart, and checkout features require the API. Configure `CHAPA_SECRET_KEY` only on the API host if hosted checkout is needed.

## API

- `GET /api/health`
- `GET /api/collections`, `GET /api/products`, `GET /api/productVariants` (optional JSON `where` query)
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- Authenticated catalog-variant, cart, and wishlist endpoints under `/api`
- `POST /api/checkout` creates cash-on-delivery orders or initializes a Chapa checkout from the signed-in customer's server-side cart and database prices
- `GET /api/payments/chapa/status`, `GET /api/payments/chapa/verify/:txRef` (authenticated transaction verification and stock finalization)
- Authenticated order and order-item endpoints under `/api`
