# CodeAlpha Fashion Store - System Preview

## Quick Overview
A full-stack fashion e-commerce application with React frontend, Express API, and SQLite database.

## Core Features

### 🛍️ Product Catalog
- 10 collections (Men, Women, Kids, Shoes, Traditional, Accessories, Outerwear, Activewear + demos)
- 40+ products with variants (sizes/colors)
- Image optimization with collection-specific image mapping

### 🔐 Authentication
- Sign up / login with email/password
- Auto-admin detection (email matches ADMIN_EMAIL env var)
- Token-based session with localStorage
- Auth state change listeners

### 🛒 Shopping Cart
- Persistent cart tied to user ID
- Add/remove/modify quantities
- Stock validation before purchase
- Clears on sign out / order completion

### 💳 Payment Methods
| Method | Mode | Status |
|--------|------|--------|
| Cash on Delivery | Preview + Live | Immediate stock deduction |
| Demo | Preview only | Sandbox completion, no charge |
| Chapa | Preview (test key) + Live | Full API integration, redirects to Chapa checkout |

### 👑 Admin Dashboard
- Product CRUD with per-size inventory
- Collection management
- Order lifecycle management (`pending` → `processing` → `sandbox_complete`)
- Returns processing system

### ⚙️ Storefront Settings
- Footer: shipping/returns text (≤5000 chars)
- Newsletter offer text (≤1000 chars)
- Store mode: `preview` (default) or `live`

## Technical Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript + React Router |
| UI | Radix UI components, Tailwind CSS, framer-motion |
| Backend | Express.js + better-sqlite3 |
| Database | SQLite with WAL mode, foreign key constraints |
| Payments | Chapa API + demo/cash_on_delivery modes |
| Build | Vite, ES modules, TypeScript |

## API Endpoints (Key)

**Public (no auth):** `GET /api/collections`, `GET /api/products`, `GET /api/productVariants`

**Auth Required:** `GET/POST /api/cartItems`, `GET/POST /api/wishlist`, `POST /api/checkout`, `GET /api/auth/me`

**Admin Required:** `POST/PUT/DELETE /api/products`, `POST/PUT/DELETE /api/collections`, `GET/POST /api/orders`, `GET/POST /api/returns`

## Data Flow Highlights

1. **Checkout Process**: Cart → Total calculation (subtotal + shipping + 15% tax) → Payment method selection → Order creation → Stock deduction → Cart clearance

2. **Chapa Payment**: Order created (status `pending`) → POST to Chapa API → User redirected → Chapa verifies payment → Server validates → Stock deducted → Order status → `processing`

3. **Admin Product Creation**: Form validation → Transaction: INSERT product + INSERT variants + optionally promote to live mode

4. **Stock Deduction**: `UPDATE productVariants SET stock = stock - ? WHERE id = ? AND stock >= ?` (atomic with order creation)

## Development Workflow

```
feature/branch → commit → push → Pull Request → code review → merge → main
```

CI/CD pipeline includes: typecheck, eslint, stylelint, API tests, production build

## Key Numbers

- **Collections**: 10
- **Products**: 40+
- **Product Variants**: 100+ (with size/color options)
- **API Routes**: 25+ endpoints
- **Database Tables**: 11
- **Payment Methods**: 3 (COD, demo, Chapa)