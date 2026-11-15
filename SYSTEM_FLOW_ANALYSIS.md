# CodeAlpha Fashion Store - System Flow Analysis

## Overview
This document analyzes the complete system flows for the Wende Fashion Store application, covering user authentication, product browsing, shopping cart, checkout/payment, admin management, and returns processing.

---

## 1. User Authentication Flow

### 1.1 Sign Up
**Entry Point**: `/register` page
**Process**:
1. User enters email, password, and display name
2. Frontend validates format (email regex, password length 8-128, display name ≤100 chars)
3. `storeApi.auth.signUp()` sends POST to `/api/auth/register`
4. Server validates:
   - Email format validation
   - Password length (8-128 chars)
   - Display name presence and length ≤100
   - Email uniqueness check
5. If valid, creates user with auto-determined `isAdmin` flag (admin if email matches `ADMIN_EMAIL` env var)
6. Server responds with `user` object and `token`
7. `setSession(token, user)` stores token in `localStorage` and triggers all auth listeners
8. User is redirected to login or home page

**Success Path**: Account page accessible
**Error Path**: Form errors displayed (400 for validation, 409 for duplicate email)

### 1.2 Sign In (Login)
**Entry Point**: `/login` page
**Process**:
1. User enters email and password
2. `storeApi.auth.signInWithEmail()` sends POST to `/api/auth/login`
3. Server looks up user by email (case-insensitive)
4. Compares provided password with stored `passwordHash` using bcrypt
5. If valid, returns `user` object and `token`
6. `setSession(token, user)` stores token and triggers listeners
7. User redirected to original path or `/account`

**Success Path**: User session established
**Error Path**: "Email or password is incorrect" (401)

### 1.3 Get Current User
**Trigger**: On app start, and via `storeApi.auth.onAuthStateChanged()`
**Process**:
1. Check for token in `localStorage`
2. If token exists, `apiRequest('/api/auth/me')` with Bearer auth header
3. Server returns current user profile
4. If token invalid/expired, user set to `null`
5. Auth state listeners notified of change

### 1.4 Sign Out
**Process**:
1. `storeApi.auth.signOut()` calls `setSession(null, null)`
2. Token removed from `localStorage`
3. All UI components re-render based on new auth state

### 1.5 Login Redirect
- `storeApi.auth.login(returnTo?)` handles redirect logic
- If `returnTo` origin matches current origin, redirects to that path
- Otherwise redirects to `/account`
- Sets `redirectTo` query param on `/login` URL

---

## 2. Product Browsing & Discovery Flow

### 2.1 Home Page
**Path**: `/`
**Data Fetch**: `storeApi.db.collections.list()` → returns all collections
**Render**: Grid of collection categories with images

### 2.2 Collection Detail
**Path**: `/collections/:slug`
**Process**:
1. Extract `slug` from route params
2. `storeApi.db.collections.list({ where: { slug } })` → returns matching collection
3. `storeApi.db.products.list({ where: { collectionId: collection.id } })` → returns products in that collection
4. Render product grid with collection header

### 2.3 Product Detail
**Path**: `/products/:slug`
**Process**:
1. Extract `slug` from route params
2. `storeApi.db.products.list({ where: { slug } })` → returns product
3. `storeApi.db.productVariants.list({ where: { productId: product.id } })` → returns all variants
4. Render product page with images, variant selector (size/color), add to cart button

### 2.4 Product Variant Selection
- User selects size and/or color
- Selected variant determines price and stock availability
- `validateCartQuantity()` ensures quantity ≤ stock before adding to cart

---

## 3. Shopping Cart Flow

### 3.1 Cart Provider & State
- `CartProvider` wraps the app with cart state management
- Cart items stored in memory + synchronized with API
- `AuthProvider` listens for auth changes and clears cart on sign-out

### 3.2 Add to Cart
**Process**:
1. User clicks "Add to cart" on product detail
2. Variant ID, size, color, and quantity determined
3. `storeApi.db.cartItems.create({ userId, variantId, quantity })` → POST `/api/cartItems`
4. If variant already in cart, quantity is incremented
5. Cart count updated in UI

### 3.3 View Cart
**Path**: `/account` (or cart drawer from navbar)
**Process**:
1. `storeApi.db.cartItems.list({ where: { userId: currentUser.id } })` → returns user's cart items
2. For each cart item, fetch variant details including price, stock, size
3. Calculate subtotal, shipping, tax
4. Render cart summary

### 3.4 Cart Item Modification
- User can update quantity via input
- `validateCartQuantity(variantId, newQuantity)` checks:
  - Integer between 1-100
  - Variant still available (not sample, not inactive)
  - Stock ≥ requested quantity
- Update sends PUT to `/api/cartItems/:id`

### 3.5 Remove from Cart
- Remove single variant or clear entire cart
- DELETE to `/api/cartItems/:id` (or clear by userId)

### 3.6 Cart Persistence
- Cart items tied to `userId`
- On sign out, cart is cleared (CartProvider resets)
- On sign in, cart loads from server for that user

---

## 4. Checkout & Payment Flow

### 4.1 Checkout Start
**Path**: `/checkout`
**Prerequisites**: User must be authenticated, cart must not be empty

**Process**:
1. Validate shipping address fields (firstName, lastName, address, city, postalCode, email)
2. Calculate cart total:
   - Subtotal: Σ(price × quantity) for all cart items
   - Shipping: Free if subtotal > 5000 ETB, else 250 ETB
   - Tax: 15% of subtotal
   - Total: Math.round((subtotal + shipping + tax) × 100) / 100
3. Validate all cart items are purchasable (active, not sample, sufficient stock)
4. Based on store mode (preview/live), available payment methods vary

### 4.2 Payment Methods

#### Cash on Delivery
- Available in both preview and live modes
- Order status: `processing`
- Stock deducted immediately on order creation
- Cart cleared on order completion

#### Demo Mode
- Available only when `storeMode === 'preview'`
- Payment method: `demo`
- Demo channels: `telebirr`, `cbe_birr`, `card`
- Order status: `sandbox_complete`
- Simulates payment without actual charge
- Cart cleared on order completion

#### Chapa (Real Payment)
- Available in preview mode with test key
- Available in live mode with live key
- Process:
  1. Order created with status `pending`
  2. POST to `https://api.chapa.co/v1/transaction/initialize`
  3. Chapa returns `checkout_url`
  4. User redirected to Chapa payment page
  5. On payment success, Chapa calls `/api/payments/chapa/verify/:txRef`
  6. Server verifies payment, validates:
     - Payment status = `success`
     - tx_ref matches order id
     - Currency = ETB
     - Amount matches order totalAmount
  7. If verified: stock deducted, order status → `processing`, cart cleared
  8. If failed: order status → `payment_failed`

### 4.3 Order Creation
**Transaction**: Uses `db.transaction()` for atomicity
**Steps**:
1. INSERT into `orders` table with all shipping address details
2. INSERT into `orderItems` for each cart item
3. If COD or demo: UPDATE productVariants stock, DELETE cartItems
4. If Chapa: order created initially, payment URL returned to user
5. Return order object to frontend

### 4.4 Checkout Complete
**Path**: `/checkout/complete?tx_ref=...`
**Process**:
1. Extract `tx_ref` from query params
2. If Chapa payment: verify payment via `/api/payments/chapa/verify/:txRef`
3. If successful, render completion page with order details
4. If failed, show error and allow retry

---

## 5. Admin Management Flow

### 5.1 Admin Authentication
- Admin user identified by email matching `ADMIN_EMAIL` env var
- `isAdmin = 1` in database for admin email
- `requireAdmin` middleware checks `req.user.isAdmin`
- All admin routes protected by `authenticate` + `requireAdmin`

### 5.2 Admin Dashboard
**Path**: `/admin/*`
**Overview**: Summary stats, recent orders, quick actions

### 5.3 Product Management
**Paths**:
- `/admin/products` - List all products with CRUD
- `/admin/products/new` - Create new product

**Create Product Flow**:
1. Admin fills product form: name, slug, description, basePrice, collectionId, gender, active, imageUrl, sizeGuide, fitNotes
2. Specify sizes and per-size stock
3. Server validation:
   - Name ≤200 chars, slug valid format ≤200 chars
   - basePrice > 0
   - gender in [men, women, unisex, kids]
   - collectionId exists and is active
   - Sizes: 1-30, each ≤30 chars
   - sizeStocks: must provide stock for every size
4. Transaction:
   - INSERT product
   - INSERT productVariants for each size with stock
   - If not live mode + active + has image + stock > 0: promote to live mode
5. Response returns product + storeMode

**Edit Product Flow**:
- Similar to create, but with update endpoints
- Can toggle active/inactive status
- Can update imageUrl (updates productVariants imageUrls)
- basePrice update cascades to productVariants price

### 5.4 Collection Management
**Paths**:
- `/admin/collections` - List, create, edit, delete collections
- Collection has: id, name, slug, description, imageUrl, active

### 5.5 Order Management
**Paths**:
- `/admin/orders` - List all orders with filtering
- Admin can view order details and change status

**Order Status Lifecycle**:
- `pending` → awaiting payment (Chapa)
- `processing` → order confirmed, stock reserved
- `sandbox_complete` → demo mode completion
- `payment_failed` → payment unsuccessful

### 5.6 Returns Management
**Path**: `/admin/returns` - List all return requests
**Create Return**:
1. Admin or user initiates return for an order
2. Create `returns` record with status `pending`
3. User provides reason (max 500 chars)
4. Admin can update return status

---

## 6. Storefront Settings Flow

### 6.1 Store Mode
- Determined by `STORE_MODE` env var
- Default: `preview` mode
- Can be `live` or `preview`
- Affects:
  - Available payment methods
  - Demo checkout availability
  - Chapa test key validation
  - Seed catalog promotion

### 6.2 Storefront Settings (Footer)
**Path**: `/api/storefront-settings` (GET)
**Path**: `/api/admin/storefront-settings` (PUT, admin only)
**Fields**:
- `footer.shippingReturns` - Text about shipping/returns (≤5000 chars)
- `footer.newsletterOffer` - Newsletter offer text (≤1000 chars)

---

## 7. API Resource Access Control

### Public Resources (no auth required)
- `collections` - All products listed
- `products` - All products listed
- `productVariants` - All variants listed

### Protected Resources (auth required)
- `orders` - List filtered by userId (or orderId for specific order)
- `orderItems` - Filtered by orderId and user ownership
- `cartItems` - Filtered by userId only
- `wishlist` - Filtered by userId only
- `returns` - Filtered by userId only

### Admin Resources (admin auth required)
- `products` - Full CRUD operations
- `productVariants` - Full CRUD operations
- `collections` - Full CRUD operations
- `orders` - Admin can view any order
- `returns` - Admin can create and update

---

## 8. Image Upload Flow

### 8.1 Product Image Upload
**Endpoint**: `POST /api/admin/product-images`
**Middleware**: `authenticate` + `requireAdmin`
**Process**:
1. Receive file (JPEG, PNG, or WebP, max 5MB)
2. Validate MIME type and file signature (magic bytes)
3. Generate UUID filename with appropriate extension
4. Save to `productUploadDirectory`
5. Return `{ imageUrl: `${apiUrl}/uploads/products/${filename}` }`

---

## 9. Database & Data Flow

### 9.1 Database Schema
Key tables: `users`, `collections`, `products`, `productVariants`, `cartItems`, `wishlist`, `orders`, `orderItems`, `returns`, `storeSettings`

### 9.2 Foreign Key Relationships
- `products.collectionId` → `collections.id` (ON DELETE SET NULL)
- `productVariants.productId` → `products.id` (ON DELETE CASCADE)
- `cartItems.userId` → `users.id` (ON DELETE CASCADE)
- `cartItems.variantId` → `productVariants.id` (ON DELETE CASCADE)
- `wishlist.userId` → `users.id` (ON DELETE CASCADE)
- `wishlist.productId` → `products.id` (ON DELETE CASCADE)
- `orders.userId` → `users.id` (ON DELETE CASCADE)
- `orderItems.orderId` → `orders.id` (ON DELETE CASCADE)
- `orderItems.variantId` → `productVariants.id`
- `returns.userId` → `users.id` (ON DELETE CASCADE)
- `returns.orderId` → `orders.id` (ON DELETE CASCADE)

### 9.3 Stock Deduction
- On COD order: `UPDATE productVariants SET stock = stock - ? WHERE id = ? AND stock >= ?`
- On Chapa verified order: same stock update within `validateChapaPayment` transaction
- On demo order: stock not deducted (sandbox mode)

---

## 10. Error Handling Flow

### 10.1 HTTP Error Responses
- **400**: Bad request (validation, missing fields)
- **401**: Unauthorized (missing/invalid token)
- **403**: Forbidden (non-admin trying admin action)
- **404**: Not found (resource doesn't exist)
- **409**: Conflict (stock insufficient, duplicate, invalid state)
- **413**: Payload too large (file > 5MB)
- **429**: Too many requests (rate limit exceeded)
- **500**: Server error (unexpected)
- **502**: Bad gateway (Chapa API unavailable)
- **503**: Service unavailable (payment not configured, wrong mode)

### 10.2 Error Format
All errors returned as JSON: `{ error: "descriptive message" }`
HttpError class extends Error with `status` property

---