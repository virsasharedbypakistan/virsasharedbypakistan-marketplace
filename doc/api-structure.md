# API Structure Document

# Virsa Multi-Vendor Marketplace Platform

**Version:** 1.0
**Date:** 2026-03-05
**Base URL:** `https://virsasharedbypakistan.com/api`
**Framework:** Next.js App Router Route Handlers (`app/api/**/route.ts`)

---

## Conventions

| Convention | Rule |
|---|---|
| Auth header | `Authorization: Bearer <supabase_jwt>` (auto via Supabase client) |
| Content type | `application/json` |
| Validation | Zod on every POST/PUT/PATCH |
| Error format | `{ error: string, code?: string }` |
| Success format | `{ data: T, message?: string }` |
| Role check | Via `SUPABASE_SERVICE_ROLE_KEY` + JWT payload `role` claim |
| Rate limiting | All routes via Upstash Redis middleware |

---

## Route Handler File Convention

```
app/api/
  auth/
    register/route.ts
    login/route.ts
    logout/route.ts
    reset/route.ts
  products/
    route.ts              ← GET (list), POST (create)
    [id]/route.ts         ← GET, PUT, DELETE
  vendors/
    route.ts              ← GET (list), POST (register)
    [id]/route.ts         ← GET, PATCH (approve/reject)
  orders/
    route.ts              ← GET (mine), POST (create)
    [id]/route.ts         ← GET, PATCH (status)
  cart/
    route.ts              ← GET, POST, DELETE
    [id]/route.ts         ← PATCH (qty), DELETE (item)
  wishlist/
    route.ts              ← GET, POST
    [id]/route.ts         ← DELETE
  reviews/
    route.ts              ← GET, POST
    [id]/route.ts         ← PUT, DELETE
  categories/
    route.ts              ← GET (public), POST (admin)
    [id]/route.ts         ← PUT, DELETE
  withdrawals/
    route.ts              ← GET, POST (request)
    [id]/route.ts         ← PATCH (approve/reject)
  notifications/
    route.ts              ← GET, PATCH (mark read)
    [id]/route.ts         ← PATCH, DELETE
  deals/
    route.ts              ← GET (public list), POST (admin)
    [id]/route.ts         ← GET, PUT, DELETE
  vendor/
    deals/route.ts        ← GET my deals, POST (vendor creates)
    deals/[id]/route.ts   ← PUT, DELETE
  admin/
    deals/route.ts        ← GET all, POST
    deals/[id]/route.ts   ← PUT, DELETE
    stats/route.ts
    users/route.ts
    users/[id]/route.ts
  health/route.ts
```

---

## 1. Auth APIs

### `POST /api/auth/register`
**Screen:** Login page → Register tab
**Auth:** None
```ts
// Request body
{
  name: string
  email: string
  password: string        // min 8 chars
  role: "customer"        // only customers self-register
}
// Response 201
{ data: { user_id: string, email: string } }
```

---

### `POST /api/auth/login`
**Screen:** `/login`
**Auth:** None
```ts
// Request body
{
  email: string
  password: string
}
// Response 200
{
  data: {
    user_id: string
    role: "customer" | "vendor" | "admin"
    redirect: "/dashboard" | "/vendor/dashboard" | "/admin/dashboard"
  }
}
// Sets HTTP-only cookie with Supabase session
```

---

### `POST /api/auth/logout`
**Screen:** Any — navbar logout button
**Auth:** Required
```ts
// No body needed — clears session cookie
// Response 200
{ message: "Logged out" }
```

---

### `POST /api/auth/reset`
**Screen:** `/login` → Forgot Password
**Auth:** None
```ts
// Request body
{ email: string }
// Response 200
{ message: "Password reset email sent" }
// Triggers Supabase Auth email reset
```

---

### `POST /api/auth/vendor-register`
**Screen:** Vendor registration form
**Auth:** Required (role: customer → upgrades to vendor)
```ts
// Request body
{
  store_name: string
  store_description: string
  phone: string
  city: string
  bank_account_name: string       // encrypted at rest
  bank_account_number: string     // encrypted at rest
  bank_name: string               // encrypted at rest
  logo_url?: string               // Supabase Storage URL
  banner_url?: string             // Supabase Storage URL
}
// Response 201
{ data: { vendor_id: string, status: "pending" } }
// Sends email notification to admin
```

---

## 2. Product APIs

### `GET /api/products`
**Screen:** `/products`, Homepage (featured), `/deals`
**Auth:** None (public)
```ts
// Query params
?page=1&limit=20
&category_id=uuid
&vendor_id=uuid
&search=string
&min_price=number
&max_price=number
&sort=newest|price_asc|price_desc|rating
&featured=true
&on_sale=true

// Response 200
{
  data: Product[],
  pagination: { page, limit, total, total_pages }
}
```

---

### `GET /api/products/[id]`
**Screen:** `/product/[id]`
**Auth:** None (public)
```ts
// Response 200
{
  data: {
    id, name, description, price, original_price,
    stock, images[], status, category,
    vendor: { id, store_name, logo_url, rating },
    average_rating, review_count
  }
}
```

---

### `POST /api/products`
**Screen:** Vendor Dashboard → My Products → Add Product
**Auth:** Required (role: vendor, status: approved)
```ts
// Request body
{
  name: string
  description: string
  price: number
  original_price?: number      // for sale pricing
  stock: number
  category_id: string
  images: string[]             // Supabase Storage URLs
  status?: "active" | "inactive"
}
// Response 201
{ data: { product_id: string } }
```

---

### `PUT /api/products/[id]`
**Screen:** Vendor Dashboard → My Products → Edit Product
**Auth:** Required (role: vendor — must own product)
```ts
// Request body (all optional)
{
  name?: string
  description?: string
  price?: number
  original_price?: number
  stock?: number
  category_id?: string
  images?: string[]
  status?: "active" | "inactive"
}
// Response 200
{ data: Product }
```

---

### `DELETE /api/products/[id]`
**Screen:** Vendor Dashboard → My Products / Admin → Delete
**Auth:** Required (vendor owner OR admin)
```ts
// Response 200
{ message: "Product deleted" }
```

---

## 3. Vendor APIs

### `GET /api/vendors`
**Screen:** `/vendors`
**Auth:** None (public)
```ts
// Query params
?page=1&limit=20&search=string&sort=rating|newest

// Response 200
{
  data: {
    id, store_name, logo_url, banner_url,
    rating, product_count, city, status
  }[]
}
```

---

### `GET /api/vendors/[id]`
**Screen:** `/vendors/[id]` (public profile)
**Auth:** None (public)
```ts
// Response 200
{
  data: {
    id, store_name, description, logo_url, banner_url,
    rating, review_count, product_count, joined_at,
    products: Product[]   // paginated
  }
}
```

---

### `GET /api/vendors/me`
**Screen:** Vendor Dashboard → Settings
**Auth:** Required (role: vendor)
```ts
// Response 200
{
  data: {
    id, store_name, description, logo_url, banner_url,
    phone, city, approval_status, commission_rate,
    bank_account_name, bank_name    // masked: **** last 4
  }
}
```

---

### `PATCH /api/vendors/me`
**Screen:** Vendor Dashboard → Settings → Update Profile
**Auth:** Required (role: vendor)
```ts
// Request body (all optional)
{
  store_name?: string
  store_description?: string
  logo_url?: string
  banner_url?: string
  phone?: string
  city?: string
  bank_account_name?: string
  bank_account_number?: string
  bank_name?: string
}
// Response 200
{ data: Vendor, message: "Profile updated" }
```

---

### `GET /api/admin/vendors`
**Screen:** Admin Dashboard → Vendor Management
**Auth:** Required (role: admin)
```ts
// Query params
?page=1&limit=20&status=pending|approved|rejected|suspended&search=string

// Response 200
{ data: Vendor[], pagination: {...} }
```

---

### `PATCH /api/admin/vendors/[id]`
**Screen:** Admin → Applications (approve/reject) + Vendor Management (suspend)
**Auth:** Required (role: admin)
```ts
// Request body
{
  action: "approve" | "reject" | "suspend" | "activate"
  reason?: string      // for reject/suspend — included in email
}
// Response 200
{ data: Vendor, message: "Vendor approved" }
// Triggers Resend email to vendor
```

---

## 4. Order APIs

### `POST /api/orders`
**Screen:** `/checkout` → Place Order
**Auth:** Required (role: customer)
```ts
// Request body
{
  shipping_address: {
    full_name: string
    phone: string
    city: string
    address: string
  },
  items: {
    product_id: string
    quantity: number
  }[]
}
// Response 201
{
  data: {
    order_id: string,
    total_amount: number,
    status: "pending"
  }
}
// Server side:
// 1. Validate stock for each item
// 2. Lock stock
// 3. Create order + order_items in Supabase
// 4. Log commission per item in MySQL
// 5. Deduct stock
// 6. Send email via Resend
```

---

### `GET /api/orders`
**Screen:** Customer Dashboard → My Orders
**Auth:** Required (role: customer)
```ts
// Query params
?page=1&limit=10&status=all|pending|processing|shipped|completed|cancelled

// Response 200
{ data: Order[], pagination: {...} }
```

---

### `GET /api/orders/[id]`
**Screen:** Customer Dashboard → Order Detail
**Auth:** Required (owns order OR vendor in order OR admin)
```ts
// Response 200
{
  data: {
    id, status, total_amount, shipping_amount,
    shipping_address, payment_method,
    created_at,
    items: {
      product: { id, name, images, price },
      vendor: { id, store_name },
      quantity, unit_price, commission_amount, vendor_earning
    }[]
  }
}
```

---

### `PATCH /api/orders/[id]/status`
**Screen:** Vendor Dashboard → Orders / Admin → Orders
**Auth:** Required (vendor or admin)
```ts
// Request body
{
  status: "processing" | "shipped" | "completed" | "cancelled"
}
// Vendor can: pending→processing, processing→shipped
// Admin can: any transition
// Response 200
{ data: { order_id, status } }
// Sends status update email to customer via Resend
```

---

### `GET /api/vendor/orders`
**Screen:** Vendor Dashboard → My Orders
**Auth:** Required (role: vendor)
```ts
// Query params
?page=1&limit=10&status=all|pending|processing|shipped|completed

// Response 200
{ data: VendorOrder[], pagination: {...} }
// Only returns orders containing this vendor's products
```

---

### `GET /api/admin/orders`
**Screen:** Admin Dashboard → Order Management
**Auth:** Required (role: admin)
```ts
// Query params
?page=1&limit=20&status=all&vendor_id=uuid&search=order_id

// Response 200
{ data: Order[], pagination: {...} }
```

---

## 5. Cart APIs

### `GET /api/cart`
**Screen:** `/cart`
**Auth:** Required
```ts
// Response 200
{
  data: {
    items: {
      id, product: { id, name, price, images, stock, vendor },
      quantity
    }[],
    total: number,
    item_count: number
  }
}
```

---

### `POST /api/cart`
**Screen:** Any product card / Product detail → Add to Cart
**Auth:** Required
```ts
// Request body
{ product_id: string, quantity: number }
// Response 201
{ data: CartItem, message: "Added to cart" }
// If already in cart → increments quantity
```

---

### `PATCH /api/cart/[id]`
**Screen:** `/cart` → Quantity +/-
**Auth:** Required
```ts
// Request body
{ quantity: number }   // 0 = remove
// Response 200
{ data: CartItem }
```

---

### `DELETE /api/cart/[id]`
**Screen:** `/cart` → Remove item
**Auth:** Required
```ts
// Response 200
{ message: "Item removed" }
```

---

### `DELETE /api/cart`
**Screen:** After successful checkout (auto-called)
**Auth:** Required
```ts
// Clears entire cart for the customer
// Response 200
{ message: "Cart cleared" }
```

---

## 6. Wishlist APIs

### `GET /api/wishlist`
**Screen:** Customer Dashboard → Wishlist
**Auth:** Required
```ts
// Response 200
{
  data: {
    id, product: { id, name, price, images, vendor }
  }[]
}
```

---

### `POST /api/wishlist`
**Screen:** Product card / Product detail → Heart icon
**Auth:** Required
```ts
// Request body
{ product_id: string }
// Response 201
{ data: { wishlist_item_id: string } }
// If already in wishlist → returns 200 (idempotent)
```

---

### `DELETE /api/wishlist/[id]`
**Screen:** Product card / Wishlist page → Remove
**Auth:** Required
```ts
// Response 200
{ message: "Removed from wishlist" }
```

---

## 7. Review APIs

### `GET /api/reviews`
**Screen:** Product detail page → Reviews section
**Auth:** None (public)
```ts
// Query params
?product_id=uuid&page=1&limit=10

// Response 200
{
  data: {
    id, rating, comment, created_at,
    customer: { name, avatar_url }
  }[],
  average_rating: number,
  total_reviews: number
}
```

---

### `POST /api/reviews`
**Screen:** Product detail → Leave a Review
**Auth:** Required (role: customer, verified purchase check)
```ts
// Request body
{
  product_id: string
  rating: number               // 1–5
  comment: string
  images?: string[]            // Supabase Storage URLs
}
// Response 201
{ data: Review }
// Checks: customer must have completed order containing this product
```

---

### `PUT /api/reviews/[id]`
**Screen:** Customer Dashboard → My Reviews → Edit
**Auth:** Required (owns review)
```ts
// Request body
{ rating?: number, comment?: string }
// Response 200
{ data: Review }
```

---

### `DELETE /api/reviews/[id]`
**Screen:** Customer Dashboard → My Reviews / Admin moderation
**Auth:** Required (owns review OR admin)
```ts
// Response 200
{ message: "Review deleted" }
```

---

## 8. Category APIs

### `GET /api/categories`
**Screen:** Homepage, Products filter sidebar, Add Product form
**Auth:** None (public)
```ts
// Response 200
{
  data: { id, name, slug, image_url, product_count }[]
}
```

---

### `POST /api/categories`
**Screen:** Admin Dashboard → Settings → Category Management
**Auth:** Required (role: admin)
```ts
// Request body
{ name: string, slug: string, image_url?: string }
// Response 201
{ data: Category }
```

---

### `PUT /api/categories/[id]`
**Screen:** Admin Dashboard → Settings → Edit Category
**Auth:** Required (role: admin)
```ts
// Request body
{ name?: string, slug?: string, image_url?: string }
// Response 200
{ data: Category }
```

---

### `DELETE /api/categories/[id]`
**Screen:** Admin Dashboard → Settings → Delete Category
**Auth:** Required (role: admin)
```ts
// Response 200
{ message: "Category deleted" }
// Blocks if products exist in category (returns 400)
```

---

## 9. Withdrawal APIs

### `POST /api/withdrawals`
**Screen:** Vendor Dashboard → Earnings → Request Withdrawal
**Auth:** Required (role: vendor)
```ts
// Request body
{
  amount: number             // must be ≤ available_balance
  method: "bank" | "jazzcash" | "manual"
  note?: string
}
// Response 201
{ data: { withdrawal_id: string, status: "pending" } }
// Sends notification to admin
```

---

### `GET /api/withdrawals`
**Screen:** Vendor Dashboard → Earnings → Withdrawal History
**Auth:** Required (role: vendor)
```ts
// Query params
?page=1&limit=10&status=pending|approved|rejected

// Response 200
{ data: Withdrawal[], pagination: {...} }
```

---

### `GET /api/admin/withdrawals`
**Screen:** Admin Dashboard → Earnings → Withdrawal Queue
**Auth:** Required (role: admin)
```ts
// Query params
?page=1&limit=20&status=pending|approved|rejected

// Response 200
{ data: Withdrawal[], pagination: {...} }
```

---

### `PATCH /api/admin/withdrawals/[id]`
**Screen:** Admin Dashboard → Earnings → Approve/Reject Withdrawal
**Auth:** Required (role: admin)
```ts
// Request body
{
  action: "approve" | "reject"
  note?: string       // included in vendor email
}
// Response 200
{ data: Withdrawal }
// Sends email to vendor via Resend
```

---

## 10. Earnings APIs

### `GET /api/vendor/earnings`
**Screen:** Vendor Dashboard → Earnings
**Auth:** Required (role: vendor)
```ts
// Query params
?period=7d|30d|90d|all

// Response 200
{
  data: {
    gross_earnings: number,
    commission_deducted: number,
    net_earnings: number,
    available_balance: number,
    pending_withdrawal: number,
    transactions: {
      order_id, order_date, gross, commission, net
    }[]
  }
}
// Source: MySQL commission_logs
```

---

### `GET /api/admin/earnings`
**Screen:** Admin Dashboard → Platform Earnings
**Auth:** Required (role: admin)
```ts
// Query params
?period=7d|30d|90d|all

// Response 200
{
  data: {
    total_revenue: number,
    total_commission: number,
    total_vendor_payouts: number,
    pending_withdrawals: number,
    top_vendors: { vendor_id, store_name, revenue }[],
    chart_data: { date, revenue, commission }[]
  }
}
// Source: MySQL commission_logs + withdrawal_requests
```

---

## 11. Notification APIs

### `GET /api/notifications`
**Screen:** All dashboards → Notifications page + bell icon count
**Auth:** Required
```ts
// Query params
?page=1&limit=20&unread=true

// Response 200
{
  data: {
    id, title, message, type, read, created_at, link?
  }[],
  unread_count: number
}
```

---

### `PATCH /api/notifications/[id]`
**Screen:** Notifications page → Mark as Read
**Auth:** Required (owns notification)
```ts
// Request body
{ read: true }
// Response 200
{ data: Notification }
```

---

### `PATCH /api/notifications`
**Screen:** Notifications page → Mark All as Read
**Auth:** Required
```ts
// No body — marks ALL as read for current user
// Response 200
{ message: "All marked as read" }
```

---

## 12. Admin Stats API

### `GET /api/admin/stats`
**Screen:** Admin Dashboard → Home (KPI widgets)
**Auth:** Required (role: admin)
```ts
// Response 200
{
  data: {
    total_users: number,
    total_vendors: number,
    total_products: number,
    total_orders: number,
    total_revenue: number,
    total_commission: number,
    pending_applications: number,
    pending_withdrawals: number,
    recent_orders: Order[],
    recent_applications: Vendor[]
  }
}
```

---

### `GET /api/admin/users`
**Screen:** Admin Dashboard → Customer Management
**Auth:** Required (role: admin)
```ts
// Query params
?page=1&limit=20&search=email|name&status=active|banned

// Response 200
{ data: User[], pagination: {...} }
```

---

### `PATCH /api/admin/users/[id]`
**Screen:** Admin Dashboard → Customer Management → Ban/Activate
**Auth:** Required (role: admin)
```ts
// Request body
{ action: "ban" | "activate" }
// Response 200
{ data: User }
```

---

## 13. File Upload API

### `POST /api/upload`
**Screen:** Any image upload (product images, store logo, avatar)
**Auth:** Required
```ts
// Request: multipart/form-data
// Field: file (image/jpeg, image/png, image/webp — max 5MB)
// Field: bucket ("product-images" | "vendor-assets" | "user-avatars" | "review-images")

// Response 201
{
  data: {
    url: string    // Public Supabase Storage URL
    path: string
  }
}
// Validates: type, size, MIME type on server before upload
```

---

## 14. Deals APIs

A **deal** links a product to a discounted price + countdown timer.
Both **vendors** (on their own products) and **admins** (on any product) can create deals.

---

### `GET /api/deals`
**Screen:** `/deals` (public), Homepage → Flash Deals section
**Auth:** None (public)
```ts
// Query params
?page=1&limit=20
&active=true            // only deals where expiry_at > now
&vendor_id=uuid         // filter by vendor
&sort=expiry_asc|discount_desc|newest

// Response 200
{
  data: {
    id, title, description?,
    discount_type: "percentage" | "fixed",
    discount_value: number,
    deal_price: number,
    original_price: number,
    starts_at: string,         // ISO datetime
    expires_at: string,        // ISO datetime
    product: { id, name, images, category },
    vendor: { id, store_name, logo_url },
    is_active: boolean
  }[],
  pagination: { page, limit, total, total_pages }
}
```

---

### `GET /api/deals/[id]`
**Screen:** Deal detail (expandable card on `/deals` page)
**Auth:** None (public)
```ts
// Response 200
{ data: Deal }  // same shape as list item + full product detail
```

---

### `POST /api/vendor/deals`
**Screen:** Vendor Dashboard → My Products → Add Deal button per product
**Auth:** Required (role: vendor, status: approved)
```ts
// Request body
{
  product_id: string           // must be owned by this vendor
  title: string
  description?: string
  discount_type: "percentage" | "fixed"
  discount_value: number       // e.g. 20 for 20% OR 500 for PKR 500 off
  starts_at: string            // ISO datetime
  expires_at: string           // ISO datetime — must be > starts_at
}
// Server computes: deal_price = original_price - discount
// Validation: deal_price must be > 0
// Response 201
{ data: { deal_id: string, deal_price: number } }
```

---

### `GET /api/vendor/deals`
**Screen:** Vendor Dashboard → Deals (new screen)
**Auth:** Required (role: vendor)
```ts
// Query params
?status=active|expired|upcoming|all

// Response 200
{
  data: {
    id, title, product: { id, name, images },
    discount_type, discount_value, deal_price, original_price,
    starts_at, expires_at, is_active
  }[]
}
```

---

### `PUT /api/vendor/deals/[id]`
**Screen:** Vendor Dashboard → Deals → Edit Deal
**Auth:** Required (role: vendor, must own the deal)
```ts
// Request body (all optional)
{
  title?: string
  description?: string
  discount_type?: "percentage" | "fixed"
  discount_value?: number
  starts_at?: string
  expires_at?: string
}
// Response 200
{ data: Deal }
```

---

### `DELETE /api/vendor/deals/[id]`
**Screen:** Vendor Dashboard → Deals → Delete Deal
**Auth:** Required (role: vendor, must own the deal)
```ts
// Response 200
{ message: "Deal deleted" }
```

---

### `POST /api/admin/deals`
**Screen:** Admin Dashboard → Deals → Create Deal (on any product)
**Auth:** Required (role: admin)
```ts
// Request body — same as vendor, but product_id can be ANY product
{
  product_id: string
  title: string
  description?: string
  discount_type: "percentage" | "fixed"
  discount_value: number
  starts_at: string
  expires_at: string
}
// Response 201
{ data: { deal_id: string, deal_price: number } }
```

---

### `GET /api/admin/deals`
**Screen:** Admin Dashboard → Deals Management
**Auth:** Required (role: admin)
```ts
// Query params
?page=1&limit=20&status=active|expired|upcoming|all&vendor_id=uuid

// Response 200
{
  data: Deal[],   // all vendors' deals + admin-created deals
  pagination: {...}
}
```

---

### `PUT /api/admin/deals/[id]`
**Screen:** Admin Dashboard → Deals → Edit any Deal
**Auth:** Required (role: admin)
```ts
// Same body as vendor PUT — admin can edit any deal
// Response 200
{ data: Deal }
```

---

### `DELETE /api/admin/deals/[id]`
**Screen:** Admin Dashboard → Deals → Delete any Deal
**Auth:** Required (role: admin)
```ts
// Response 200
{ message: "Deal deleted" }
```

---

### Deals DB Table (add to Supabase)

```sql
CREATE TABLE deals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  vendor_id     UUID NOT NULL REFERENCES vendors(id),
  created_by    UUID NOT NULL,              -- user_id of creator
  creator_role  TEXT CHECK (creator_role IN ('vendor','admin')),
  title         TEXT NOT NULL,
  description   TEXT,
  discount_type TEXT CHECK (discount_type IN ('percentage','fixed')),
  discount_value NUMERIC(10,2) NOT NULL,
  deal_price    NUMERIC(10,2) NOT NULL,
  starts_at     TIMESTAMPTZ NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL,
  is_active     BOOLEAN GENERATED ALWAYS AS
                  (now() BETWEEN starts_at AND expires_at) STORED,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
-- Public: read active deals
-- Vendor: insert/update/delete own deals (vendor_id = auth.uid())
-- Admin: full access
```

---

## 15. Health Check API

### `GET /api/health`
**Screen:** Internal (monitoring, uptime checks)
**Auth:** None
```ts
// Response 200
{
  status: "ok" | "degraded_primary_down" | "critical",
  timestamp: string,
  services: {
    supabase_primary: "up" | "down",
    supabase_backup:  "up" | "down",
    mysql:            "up" | "down"
  }
}
```

---

## 15. API Middleware Stack

Every route passes through this middleware chain:

```ts
// middleware.ts (applied globally)

1. Rate Limiter       → Upstash Redis (req/min per IP)
2. JWT Verifier       → Supabase Auth (extracts user + role)
3. Route Guard        → Match role to allowed roles[]
4. Zod Validator      → Validates req.body before handler runs
5. Route Handler      → Business logic
6. Error Handler      → Returns standardised error JSON
```

---

## 16. Screen → API Mapping Summary

| Screen | APIs Called |
|---|---|
| Homepage | `GET /products?featured=true`, `GET /categories`, `GET /vendors`, `GET /deals?active=true` |
| Products page | `GET /products`, `GET /categories` |
| Product detail | `GET /products/[id]`, `GET /reviews?product_id=`, `POST /cart`, `POST /wishlist` |
| Vendors page | `GET /vendors` |
| Vendor profile | `GET /vendors/[id]` |
| Deals page | `GET /deals?active=true` |
| Cart | `GET /cart`, `PATCH /cart/[id]`, `DELETE /cart/[id]` |
| Checkout | `GET /cart`, `POST /orders`, `DELETE /cart` |
| Login | `POST /auth/login` |
| Vendor Register | `POST /auth/vendor-register`, `POST /upload` |
| Customer: Orders | `GET /orders` |
| Customer: Order Detail | `GET /orders/[id]` |
| Customer: Reviews | `GET /reviews`, `PUT /reviews/[id]`, `DELETE /reviews/[id]` |
| Customer: Wishlist | `GET /wishlist`, `DELETE /wishlist/[id]` |
| Customer: Notifications | `GET /notifications`, `PATCH /notifications/[id]` |
| Customer: Settings | `GET /auth/me`, `PATCH /auth/me`, `POST /upload` |
| Vendor: Dashboard | `GET /admin/stats` (vendor variant) |
| Vendor: Products | `GET /products?vendor_id=me`, `POST /products`, `PUT /products/[id]`, `DELETE /products/[id]`, `POST /upload` |
| Vendor: Orders | `GET /vendor/orders`, `PATCH /orders/[id]/status` |
| Vendor: Earnings | `GET /vendor/earnings`, `GET /withdrawals`, `POST /withdrawals` |
| **Vendor: Deals** | `GET /vendor/deals`, `POST /vendor/deals`, `PUT /vendor/deals/[id]`, `DELETE /vendor/deals/[id]` |
| Vendor: Settings | `GET /vendors/me`, `PATCH /vendors/me`, `POST /upload` |
| Admin: Dashboard | `GET /admin/stats` |
| Admin: Applications | `GET /admin/vendors?status=pending`, `PATCH /admin/vendors/[id]` |
| Admin: Vendors | `GET /admin/vendors`, `PATCH /admin/vendors/[id]` |
| Admin: Customers | `GET /admin/users`, `PATCH /admin/users/[id]` |
| Admin: Orders | `GET /admin/orders`, `PATCH /orders/[id]/status` |
| Admin: Earnings | `GET /admin/earnings`, `GET /admin/withdrawals`, `PATCH /admin/withdrawals/[id]` |
| **Admin: Deals** | `GET /admin/deals`, `POST /admin/deals`, `PUT /admin/deals/[id]`, `DELETE /admin/deals/[id]` |
| Admin: Settings | `GET /categories`, `POST /categories`, `PUT /categories/[id]`, `DELETE /categories/[id]` |
