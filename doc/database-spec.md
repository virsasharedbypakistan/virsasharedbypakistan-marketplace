# Database Specification Document

# Virsa Multi-Vendor Marketplace Platform

**Version:** 1.0  
**Date:** 2026-03-04  
**Status:** Final — Ready for Backend Development

---

## 1. Overview

This document defines the complete database architecture for the Virsa Multi-Vendor Marketplace Platform. It covers all tables, columns, data types, constraints, indexes, relationships, and Row-Level Security (RLS) policies.

### 1.1 Database Technology Split

| Database | Purpose | Engine |
|---|---|---|
| **Supabase (PostgreSQL)** | Core transactional data (users, vendors, products, orders, cart, wishlist, reviews, categories) | PostgreSQL 15+ |
| **MySQL** | Financial records, commission logs, withdrawal logs, analytics snapshots | MySQL 8.0+ |

### 1.2 Why Two Databases?

- **Supabase** provides built-in Auth, real-time subscriptions, Row-Level Security (RLS), and Storage. Ideal for transactional and user-facing data.
- **MySQL** is used to isolate financial records for audit integrity, financial reporting, and regulatory compliance. Commission and withdrawal data is write-once and immutable.

### 1.3 ORM / Access Layer

| Database | Access Method |
|---|---|
| Supabase (PostgreSQL) | Supabase SDK (TypeScript) + PostgREST |
| MySQL | Prisma ORM (TypeScript) |

---

## 2. Entity Relationship Overview

```
users
  ├── vendors (one-to-one via user_id)
  │     ├── products (one-to-many via vendor_id)
  │     ├── vendor_bank_details (one-to-one)
  │     └── vendor_shipping_rates (one-to-many)
  ├── orders (one-to-many via customer_id)
  │     └── order_items (one-to-many via order_id)
  │           └── products (many-to-one via product_id)
  ├── cart_items (one-to-many via user_id)
  ├── wishlist_items (one-to-many via user_id)
  ├── reviews (one-to-many via user_id)
  └── addresses (one-to-many via user_id)

categories
  ├── products (one-to-many via category_id)
  └── sub_categories (self-referencing via parent_id)

platform_settings (global)
  └── commission_rates (global, per-vendor, per-category)

-- MySQL (Financial DB) --
withdrawal_requests (vendor-initiated)
commission_logs (auto-generated per order item)
earnings_snapshots (scheduled analytics)
```

---

## 3. Supabase (PostgreSQL) Schema

---

### 3.1 Table: `users`

**Purpose:** Core identity table. Managed by Supabase Auth. Extended with a profile row.

> ⚠️ The `auth.users` table is managed by Supabase Auth. This `public.users` table mirrors and extends it using a trigger.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT `gen_random_uuid()`, REFERENCES `auth.users(id)` ON DELETE CASCADE | Matches Supabase Auth user ID |
| `full_name` | `VARCHAR(120)` | NOT NULL | Customer/vendor display name |
| `email` | `VARCHAR(255)` | NOT NULL, UNIQUE | Email address |
| `phone` | `VARCHAR(20)` | NULLABLE | Optional contact number |
| `avatar_url` | `TEXT` | NULLABLE | Profile picture URL (Supabase Storage) |
| `role` | `ENUM('customer', 'vendor', 'admin')` | NOT NULL, DEFAULT `'customer'` | System role |
| `status` | `ENUM('active', 'suspended', 'banned')` | NOT NULL, DEFAULT `'active'` | Account status |
| `email_verified` | `BOOLEAN` | NOT NULL, DEFAULT `false` | Email verification status |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | Account creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | Last profile update timestamp |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
```

**RLS Policies:**
- Users can `SELECT` and `UPDATE` their own row (`id = auth.uid()`)
- Admins can `SELECT` all rows
- No user can directly `INSERT` or `DELETE` (handled by Auth trigger)

**Trigger:**
```sql
-- Auto-insert into public.users on Supabase Auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'customer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

### 3.2 Table: `addresses`

**Purpose:** Stores customer shipping addresses. A customer can have multiple saved addresses.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT `gen_random_uuid()` | Address ID |
| `user_id` | `UUID` | NOT NULL, FK → `users(id)` ON DELETE CASCADE | Owner |
| `label` | `VARCHAR(50)` | NULLABLE | e.g. "Home", "Office" |
| `full_name` | `VARCHAR(120)` | NOT NULL | Recipient name |
| `phone` | `VARCHAR(20)` | NOT NULL | Contact for delivery |
| `address_line_1` | `VARCHAR(255)` | NOT NULL | Street address |
| `address_line_2` | `VARCHAR(255)` | NULLABLE | Apartment/floor |
| `city` | `VARCHAR(100)` | NOT NULL | City |
| `province` | `VARCHAR(100)` | NOT NULL | Province/State |
| `postal_code` | `VARCHAR(20)` | NULLABLE | Postal/ZIP code |
| `country` | `VARCHAR(80)` | NOT NULL, DEFAULT `'Pakistan'` | Country |
| `is_default` | `BOOLEAN` | NOT NULL, DEFAULT `false` | Default address flag |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | Created timestamp |

**Indexes:**
```sql
CREATE INDEX idx_addresses_user_id ON addresses(user_id);
```

**RLS Policies:**
- Users can CRUD only their own addresses (`user_id = auth.uid()`)

---

### 3.3 Table: `categories`

**Purpose:** Hierarchical product category tree. Supports parent → child categories.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT `gen_random_uuid()` | Category ID |
| `parent_id` | `UUID` | NULLABLE, FK → `categories(id)` ON DELETE SET NULL | Parent category (NULL = top-level) |
| `name` | `VARCHAR(100)` | NOT NULL, UNIQUE | Category display name |
| `slug` | `VARCHAR(120)` | NOT NULL, UNIQUE | URL-friendly slug |
| `description` | `TEXT` | NULLABLE | Category description |
| `image_url` | `TEXT` | NULLABLE | Category image (Supabase Storage) |
| `commission_rate` | `NUMERIC(5,2)` | NULLABLE | Category-specific commission % (overrides global) |
| `display_order` | `INTEGER` | NOT NULL, DEFAULT `0` | Sort order in UI |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT `true` | Whether category is visible |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | Created timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | Last update timestamp |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_is_active ON categories(is_active);
```

**RLS Policies:**
- `SELECT`: Public (all roles)
- `INSERT`, `UPDATE`, `DELETE`: Admins only

---

### 3.4 Table: `vendors`

**Purpose:** Vendor store profile. One-to-one with `users`. Created after admin approval.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT `gen_random_uuid()` | Vendor ID |
| `user_id` | `UUID` | NOT NULL, UNIQUE, FK → `users(id)` ON DELETE CASCADE | Associated user account |
| `store_name` | `VARCHAR(150)` | NOT NULL, UNIQUE | Public store name |
| `store_slug` | `VARCHAR(160)` | NOT NULL, UNIQUE | URL-friendly store slug |
| `description` | `TEXT` | NULLABLE | Store description (about) |
| `logo_url` | `TEXT` | NULLABLE | Store logo (Supabase Storage) |
| `banner_url` | `TEXT` | NULLABLE | Store banner image |
| `phone` | `VARCHAR(20)` | NULLABLE | Store contact number |
| `email` | `VARCHAR(255)` | NULLABLE | Store public contact email |
| `approval_status` | `ENUM('pending', 'approved', 'rejected', 'suspended')` | NOT NULL, DEFAULT `'pending'` | Admin approval state |
| `rejection_reason` | `TEXT` | NULLABLE | Reason if rejected/suspended |
| `commission_type` | `ENUM('global', 'custom')` | NOT NULL, DEFAULT `'global'` | Which commission rule applies |
| `commission_rate` | `NUMERIC(5,2)` | NULLABLE | Custom rate if `commission_type = 'custom'` |
| `average_rating` | `NUMERIC(3,2)` | NOT NULL, DEFAULT `0.00` | Cached average rating (updated by trigger) |
| `total_reviews` | `INTEGER` | NOT NULL, DEFAULT `0` | Cached review count |
| `total_sales` | `INTEGER` | NOT NULL, DEFAULT `0` | Cached total orders fulfilled |
| `balance` | `NUMERIC(12,2)` | NOT NULL, DEFAULT `0.00` | Current withdrawable balance (PKR) |
| `approved_by` | `UUID` | NULLABLE, FK → `users(id)` | Admin who approved/rejected |
| `approved_at` | `TIMESTAMPTZ` | NULLABLE | Approval timestamp |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | Registration timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | Last profile update |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_vendors_user_id ON vendors(user_id);
CREATE UNIQUE INDEX idx_vendors_store_slug ON vendors(store_slug);
CREATE INDEX idx_vendors_approval_status ON vendors(approval_status);
```

**RLS Policies:**
- `SELECT`: Public (approved vendors visible to all)
- `UPDATE`: Vendor can update their own store (`user_id = auth.uid()`), admin can update any
- Approval fields (`approval_status`, `approved_by`, `approved_at`, `rejection_reason`) can only be updated by admin

---

### 3.5 Table: `vendor_bank_details`

**Purpose:** Stores vendor withdrawal bank/payment information (sensitive - RLS restricted).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT `gen_random_uuid()` | Record ID |
| `vendor_id` | `UUID` | NOT NULL, UNIQUE, FK → `vendors(id)` ON DELETE CASCADE | Associated vendor |
| `account_holder_name` | `VARCHAR(150)` | NOT NULL | Account holder's full name |
| `bank_name` | `VARCHAR(100)` | NULLABLE | Bank name (e.g., HBL, MCB) |
| `account_number` | `VARCHAR(50)` | NULLABLE | Bank account number |
| `iban` | `VARCHAR(34)` | NULLABLE | IBAN code |
| `jazzcash_number` | `VARCHAR(20)` | NULLABLE | JazzCash mobile number |
| `easypaisa_number` | `VARCHAR(20)` | NULLABLE | Easypaisa mobile number |
| `preferred_method` | `ENUM('bank_transfer', 'jazzcash', 'easypaisa', 'manual')` | NOT NULL, DEFAULT `'bank_transfer'` | Preferred payout method |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | Created timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | Last update timestamp |

**RLS Policies:**
- `SELECT`: Vendor and Admin only
- `INSERT`, `UPDATE`: Vendor (own record) and Admin

---

### 3.6 Table: `vendor_applications`

**Purpose:** Tracks vendor registration applications before approval. Stores form data from vendor onboarding.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT `gen_random_uuid()` | Application ID |
| `user_id` | `UUID` | NOT NULL, FK → `users(id)` ON DELETE CASCADE | Applicant user |
| `store_name` | `VARCHAR(150)` | NOT NULL | Requested store name |
| `store_description` | `TEXT` | NULLABLE | Store description |
| `phone` | `VARCHAR(20)` | NOT NULL | Contact phone |
| `business_type` | `VARCHAR(100)` | NULLABLE | Type of business |
| `product_categories` | `TEXT[]` | NULLABLE | Intended product categories |
| `id_document_url` | `TEXT` | NULLABLE | CNIC/ID document (Supabase Storage) |
| `status` | `ENUM('pending', 'under_review', 'approved', 'rejected')` | NOT NULL, DEFAULT `'pending'` | Review status |
| `admin_notes` | `TEXT` | NULLABLE | Internal admin notes |
| `reviewed_by` | `UUID` | NULLABLE, FK → `users(id)` | Admin reviewer |
| `reviewed_at` | `TIMESTAMPTZ` | NULLABLE | Review timestamp |
| `submitted_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | Application submission time |

**Indexes:**
```sql
CREATE INDEX idx_vendor_applications_user_id ON vendor_applications(user_id);
CREATE INDEX idx_vendor_applications_status ON vendor_applications(status);
```

---

### 3.7 Table: `vendor_shipping_rates`

**Purpose:** Defines shipping rates for vendor-managed shipping.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT `gen_random_uuid()` | Rate ID |
| `vendor_id` | `UUID` | NOT NULL, FK → `vendors(id)` ON DELETE CASCADE | Owning vendor |
| `city` | `VARCHAR(100)` | NULLABLE | Target city (NULL = all cities flat rate) |
| `province` | `VARCHAR(100)` | NULLABLE | Target province |
| `rate` | `NUMERIC(10,2)` | NOT NULL | Shipping rate (PKR) |
| `estimated_days` | `INTEGER` | NULLABLE | Delivery estimate in days |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT `true` | Whether this rate is active |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | Created timestamp |

**Indexes:**
```sql
CREATE INDEX idx_vendor_shipping_rates_vendor_id ON vendor_shipping_rates(vendor_id);
```

---

### 3.8 Table: `products`

**Purpose:** Product catalog. Belongs to a vendor and a category.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT `gen_random_uuid()` | Product ID |
| `vendor_id` | `UUID` | NOT NULL, FK → `vendors(id)` ON DELETE CASCADE | Owning vendor |
| `category_id` | `UUID` | NULLABLE, FK → `categories(id)` ON DELETE SET NULL | Product category |
| `name` | `VARCHAR(255)` | NOT NULL | Product name |
| `slug` | `VARCHAR(280)` | NOT NULL, UNIQUE | URL-friendly slug |
| `description` | `TEXT` | NULLABLE | Full product description (rich text / HTML) |
| `short_description` | `VARCHAR(500)` | NULLABLE | Summary for listing cards |
| `price` | `NUMERIC(12,2)` | NOT NULL, CHECK (`price >= 0`) | Regular price (PKR) |
| `sale_price` | `NUMERIC(12,2)` | NULLABLE, CHECK (`sale_price >= 0`) | Discounted price (PKR) |
| `stock` | `INTEGER` | NOT NULL, DEFAULT `0`, CHECK (`stock >= 0`) | Available stock units |
| `sku` | `VARCHAR(100)` | NULLABLE, UNIQUE | Stock Keeping Unit identifier |
| `weight_kg` | `NUMERIC(6,3)` | NULLABLE | Product weight for shipping |
| `images` | `TEXT[]` | NOT NULL, DEFAULT `'{}'` | Array of image URLs (Supabase Storage) |
| `thumbnail_url` | `TEXT` | NULLABLE | Primary listing image |
| `tags` | `TEXT[]` | NULLABLE | Searchable tags array |
| `specifications` | `JSONB` | NULLABLE | Key-value product specs (e.g., `{"Color":"Red","Size":"M"}`) |
| `status` | `ENUM('draft', 'active', 'out_of_stock', 'blocked', 'deleted')` | NOT NULL, DEFAULT `'draft'` | Product visibility state |
| `is_featured` | `BOOLEAN` | NOT NULL, DEFAULT `false` | Featured on homepage |
| `average_rating` | `NUMERIC(3,2)` | NOT NULL, DEFAULT `0.00` | Cached average rating |
| `total_reviews` | `INTEGER` | NOT NULL, DEFAULT `0` | Cached review count |
| `total_sold` | `INTEGER` | NOT NULL, DEFAULT `0` | Lifetime units sold (cached) |
| `blocked_by` | `UUID` | NULLABLE, FK → `users(id)` | Admin who blocked this product |
| `blocked_reason` | `TEXT` | NULLABLE | Reason for blocking |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | Created timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | Last update timestamp |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_vendor_id ON products(vendor_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_average_rating ON products(average_rating DESC);
-- Full text search
CREATE INDEX idx_products_fts ON products USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));
```

**RLS Policies:**
- `SELECT`: Public for `status = 'active'`; Vendor can see all their own products regardless of status
- `INSERT`, `UPDATE`: Vendor (own products), Admin (any product)
- `DELETE`: Soft delete only — set `status = 'deleted'`

---

### 3.9 Table: `product_variants` *(Phase 2)*

**Purpose:** Optional future table for size/color variants. Placeholder for Phase 2.

| Column | Type | Description |
|---|---|---|
| `id` | `UUID` | PK |
| `product_id` | `UUID` | FK → `products(id)` |
| `variant_name` | `VARCHAR(100)` | e.g. "Size: Large / Color: Blue" |
| `price` | `NUMERIC(12,2)` | Variant-specific price |
| `stock` | `INTEGER` | Variant-specific stock |
| `sku` | `VARCHAR(100)` | Variant SKU |

---

### 3.10 Table: `cart_items`

**Purpose:** Persistent shopping cart. Stored per authenticated user. Unauthenticated carts handled client-side (localStorage), merged on login.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT `gen_random_uuid()` | Cart item ID |
| `user_id` | `UUID` | NOT NULL, FK → `users(id)` ON DELETE CASCADE | Cart owner |
| `product_id` | `UUID` | NOT NULL, FK → `products(id)` ON DELETE CASCADE | Product in cart |
| `vendor_id` | `UUID` | NOT NULL, FK → `vendors(id)` ON DELETE CASCADE | Denormalized for grouping |
| `quantity` | `INTEGER` | NOT NULL, DEFAULT `1`, CHECK (`quantity >= 1`) | Units in cart |
| `added_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | When added to cart |

**Constraints:**
```sql
UNIQUE (user_id, product_id) -- One row per product per user
```

**Indexes:**
```sql
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
```

**RLS Policies:**
- Users can CRUD only their own cart items

---

### 3.11 Table: `wishlist_items`

**Purpose:** Customer product wishlist.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT `gen_random_uuid()` | Wishlist item ID |
| `user_id` | `UUID` | NOT NULL, FK → `users(id)` ON DELETE CASCADE | Owner |
| `product_id` | `UUID` | NOT NULL, FK → `products(id)` ON DELETE CASCADE | Wished product |
| `added_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | When added |

**Constraints:**
```sql
UNIQUE (user_id, product_id)
```

**Indexes:**
```sql
CREATE INDEX idx_wishlist_items_user_id ON wishlist_items(user_id);
```

---

### 3.12 Table: `orders`

**Purpose:** Master order record. One order can contain items from multiple vendors.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT `gen_random_uuid()` | Order ID |
| `order_number` | `VARCHAR(20)` | NOT NULL, UNIQUE | Human-readable (e.g., `VRS-20260301-0042`) |
| `customer_id` | `UUID` | NOT NULL, FK → `users(id)` ON DELETE RESTRICT | Customer who placed order |
| `shipping_address_id` | `UUID` | NULLABLE, FK → `addresses(id)` ON DELETE SET NULL | Saved address reference |
| `shipping_full_name` | `VARCHAR(120)` | NOT NULL | Snapshot of recipient name at order time |
| `shipping_phone` | `VARCHAR(20)` | NOT NULL | Snapshot of delivery phone |
| `shipping_address_line_1` | `VARCHAR(255)` | NOT NULL | Snapshot of address line 1 |
| `shipping_address_line_2` | `VARCHAR(255)` | NULLABLE | Snapshot of address line 2 |
| `shipping_city` | `VARCHAR(100)` | NOT NULL | Snapshot of city |
| `shipping_province` | `VARCHAR(100)` | NOT NULL | Snapshot of province |
| `shipping_postal_code` | `VARCHAR(20)` | NULLABLE | Snapshot of postal code |
| `subtotal` | `NUMERIC(12,2)` | NOT NULL | Sum of all item prices |
| `shipping_total` | `NUMERIC(12,2)` | NOT NULL, DEFAULT `0.00` | Total shipping charged |
| `discount_total` | `NUMERIC(12,2)` | NOT NULL, DEFAULT `0.00` | Total discounts applied |
| `total_amount` | `NUMERIC(12,2)` | NOT NULL | Final amount (subtotal + shipping - discount) |
| `payment_method` | `ENUM('cod', 'jazzcash', 'easypaisa', 'stripe')` | NOT NULL, DEFAULT `'cod'` | Payment method |
| `payment_status` | `ENUM('pending', 'paid', 'failed', 'refunded')` | NOT NULL, DEFAULT `'pending'` | Payment state |
| `status` | `ENUM('pending', 'processing', 'shipped', 'completed', 'cancelled', 'refunded')` | NOT NULL, DEFAULT `'pending'` | Overall order status |
| `notes` | `TEXT` | NULLABLE | Customer order notes |
| `cancelled_reason` | `TEXT` | NULLABLE | Cancellation reason if cancelled |
| `cancelled_by` | `UUID` | NULLABLE, FK → `users(id)` | Who cancelled (customer/admin) |
| `ip_address` | `VARCHAR(45)` | NULLABLE | Customer IP at checkout (fraud detection) |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | Order placed timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | Last status update |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
```

**Order Number Generation:**
```sql
-- Format: VRS-YYYYMMDD-NNNN (sequential per day)
CREATE SEQUENCE order_daily_seq START 1;
-- Generated at application layer using date + sequence
```

**RLS Policies:**
- Customer: `SELECT` own orders only
- Vendor: `SELECT` orders containing their items (via `order_items` join)
- Admin: Full access

---

### 3.13 Table: `order_items`

**Purpose:** Line items within an order. One row per product per order. Stores price snapshot at time of purchase.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT `gen_random_uuid()` | Item ID |
| `order_id` | `UUID` | NOT NULL, FK → `orders(id)` ON DELETE CASCADE | Parent order |
| `product_id` | `UUID` | NOT NULL, FK → `products(id)` ON DELETE RESTRICT | Purchased product |
| `vendor_id` | `UUID` | NOT NULL, FK → `vendors(id)` ON DELETE RESTRICT | Vendor who fulfills |
| `product_name` | `VARCHAR(255)` | NOT NULL | **Snapshot** of product name at order time |
| `product_thumbnail` | `TEXT` | NULLABLE | **Snapshot** of product image at order time |
| `quantity` | `INTEGER` | NOT NULL, CHECK (`quantity >= 1`) | Units ordered |
| `unit_price` | `NUMERIC(12,2)` | NOT NULL | **Snapshot** of price per unit at order time |
| `subtotal` | `NUMERIC(12,2)` | NOT NULL | `unit_price × quantity` |
| `shipping_amount` | `NUMERIC(12,2)` | NOT NULL, DEFAULT `0.00` | Shipping for this vendor's items |
| `commission_rate` | `NUMERIC(5,2)` | NOT NULL | Commission % applied at order time |
| `commission_amount` | `NUMERIC(12,2)` | NOT NULL | `subtotal × commission_rate / 100` |
| `vendor_earning` | `NUMERIC(12,2)` | NOT NULL | `subtotal - commission_amount` |
| `item_status` | `ENUM('pending', 'processing', 'shipped', 'completed', 'cancelled')` | NOT NULL, DEFAULT `'pending'` | Per-item status (per vendor) |
| `tracking_number` | `VARCHAR(100)` | NULLABLE | Shipment tracking code |
| `shipped_at` | `TIMESTAMPTZ` | NULLABLE | When vendor marked as shipped |
| `completed_at` | `TIMESTAMPTZ` | NULLABLE | When item was completed |

**Indexes:**
```sql
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_vendor_id ON order_items(vendor_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_order_items_item_status ON order_items(item_status);
```

**Business Rules:**
- `commission_rate` is locked at order creation (immutable after creation)
- `vendor_earning` is calculated: `subtotal − commission_amount`
- When `item_status = 'completed'`, trigger adds `vendor_earning` to `vendors.balance`

---

### 3.14 Table: `reviews`

**Purpose:** Customer product reviews and ratings. Only verified buyers can review.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT `gen_random_uuid()` | Review ID |
| `product_id` | `UUID` | NOT NULL, FK → `products(id)` ON DELETE CASCADE | Reviewed product |
| `user_id` | `UUID` | NOT NULL, FK → `users(id)` ON DELETE CASCADE | Reviewer |
| `order_item_id` | `UUID` | NOT NULL, UNIQUE, FK → `order_items(id)` | Links to verified purchase |
| `rating` | `SMALLINT` | NOT NULL, CHECK (`rating BETWEEN 1 AND 5`) | 1–5 star rating |
| `title` | `VARCHAR(200)` | NULLABLE | Review headline |
| `body` | `TEXT` | NULLABLE | Full review text |
| `images` | `TEXT[]` | NULLABLE | Review image attachments |
| `is_approved` | `BOOLEAN` | NOT NULL, DEFAULT `true` | Admin moderation flag |
| `is_reported` | `BOOLEAN` | NOT NULL, DEFAULT `false` | Flagged for moderation |
| `helpful_count` | `INTEGER` | NOT NULL, DEFAULT `0` | Upvotes from other users |
| `admin_notes` | `TEXT` | NULLABLE | Internal moderation notes |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | Submitted timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | Last edited timestamp |

**Constraints:**
```sql
UNIQUE (user_id, product_id) -- One review per product per customer
```

**Indexes:**
```sql
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_is_approved ON reviews(is_approved);
CREATE INDEX idx_reviews_rating ON reviews(rating);
```

**Trigger — Update Product Rating Cache:**
```sql
-- After INSERT/UPDATE/DELETE on reviews, recalculate products.average_rating and products.total_reviews
```

**RLS Policies:**
- `SELECT`: Public (approved reviews only for public; own reviews for user)
- `INSERT`: Authenticated users only (verified via `order_item_id`)
- `UPDATE`: User can edit own review within 24 hours; Admin can moderate
- `DELETE`: Admin only

---

### 3.15 Table: `notifications`

**Purpose:** In-app notification log for users. Supports order updates, approval events, etc.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT `gen_random_uuid()` | Notification ID |
| `user_id` | `UUID` | NOT NULL, FK → `users(id)` ON DELETE CASCADE | Target user |
| `type` | `VARCHAR(60)` | NOT NULL | Notification type (e.g., `order_placed`, `vendor_approved`) |
| `title` | `VARCHAR(255)` | NOT NULL | Notification title |
| `message` | `TEXT` | NOT NULL | Notification message body |
| `link` | `TEXT` | NULLABLE | Deep-link URL |
| `is_read` | `BOOLEAN` | NOT NULL, DEFAULT `false` | Read state |
| `metadata` | `JSONB` | NULLABLE | Extra structured data (order_id, vendor_id, etc.) |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | Created timestamp |

**Indexes:**
```sql
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

**Notification Types:**
| Type | Triggered When |
|---|---|
| `order_placed` | Customer places order |
| `order_status_changed` | Order status updated |
| `vendor_approved` | Admin approves vendor |
| `vendor_rejected` | Admin rejects vendor |
| `withdrawal_approved` | Admin approves withdrawal |
| `withdrawal_rejected` | Admin rejects withdrawal |
| `review_posted` | Customer posts a review on vendor's product |
| `low_stock_alert` | Product stock falls below threshold |

---

### 3.16 Table: `platform_settings`

**Purpose:** Global platform configuration key-value store. Managed by admin.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `key` | `VARCHAR(100)` | PK | Setting key |
| `value` | `TEXT` | NOT NULL | Setting value (serialized) |
| `description` | `TEXT` | NULLABLE | Human-readable description |
| `updated_by` | `UUID` | NULLABLE, FK → `users(id)` | Admin who last updated |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | Last update timestamp |

**Seed Data:**
```sql
INSERT INTO platform_settings (key, value, description) VALUES
  ('global_commission_rate', '10.00', 'Default platform commission (%)'),
  ('min_withdrawal_amount', '500.00', 'Minimum withdrawal amount (PKR)'),
  ('max_withdrawal_amount', '100000.00', 'Maximum withdrawal amount (PKR)'),
  ('shipping_mode', 'vendor', 'Shipping managed by: vendor | admin'),
  ('flat_shipping_rate', '150.00', 'Default flat shipping rate (PKR)'),
  ('order_auto_complete_days', '7', 'Days after shipping to auto-complete'),
  ('maintenance_mode', 'false', 'Platform maintenance switch');
```

---

## 4. MySQL (Financial & Analytics) Schema

---

### 4.1 Table: `commission_logs`

**Purpose:** Immutable record of every commission event. Written once when an order item is completed. Never updated.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGINT` | PK, AUTO_INCREMENT | Log ID |
| `order_id` | `CHAR(36)` | NOT NULL, INDEX | Supabase UUID reference |
| `order_item_id` | `CHAR(36)` | NOT NULL, UNIQUE, INDEX | Supabase order_item UUID |
| `vendor_id` | `CHAR(36)` | NOT NULL, INDEX | Supabase vendor UUID |
| `product_id` | `CHAR(36)` | NOT NULL | Supabase product UUID |
| `product_name` | `VARCHAR(255)` | NOT NULL | Snapshot of product name |
| `quantity` | `INT` | NOT NULL | Units sold |
| `unit_price` | `DECIMAL(12,2)` | NOT NULL | Unit price at time of sale |
| `subtotal` | `DECIMAL(12,2)` | NOT NULL | Line item total |
| `commission_rate` | `DECIMAL(5,2)` | NOT NULL | Commission % applied |
| `commission_amount` | `DECIMAL(12,2)` | NOT NULL | Platform commission earned |
| `vendor_earning` | `DECIMAL(12,2)` | NOT NULL | Net vendor earning |
| `commission_source` | `ENUM('global', 'vendor', 'category')` | NOT NULL | Which rule was applied |
| `logged_at` | `DATETIME` | NOT NULL, DEFAULT `CURRENT_TIMESTAMP` | Log creation time |

**Indexes (MySQL):**
```sql
CREATE INDEX idx_commission_logs_vendor_id ON commission_logs(vendor_id);
CREATE INDEX idx_commission_logs_order_id ON commission_logs(order_id);
CREATE INDEX idx_commission_logs_logged_at ON commission_logs(logged_at);
```

---

### 4.2 Table: `withdrawal_requests`

**Purpose:** Vendor withdrawal request lifecycle. Managed by admin.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGINT` | PK, AUTO_INCREMENT | Request ID |
| `reference_number` | `VARCHAR(30)` | NOT NULL, UNIQUE | Human-readable ID (e.g., `WD-20260301-001`) |
| `vendor_id` | `CHAR(36)` | NOT NULL, INDEX | Supabase vendor UUID |
| `amount` | `DECIMAL(12,2)` | NOT NULL, CHECK (`amount > 0`) | Requested amount (PKR) |
| `method` | `ENUM('bank_transfer', 'jazzcash', 'easypaisa', 'manual')` | NOT NULL | Payout method |
| `account_details_snapshot` | `JSON` | NOT NULL | Snapshot of bank/payment details |
| `status` | `ENUM('pending', 'under_review', 'approved', 'rejected', 'paid')` | NOT NULL, DEFAULT `'pending'` | Processing state |
| `admin_notes` | `TEXT` | NULLABLE | Admin notes or rejection reason |
| `reviewed_by` | `CHAR(36)` | NULLABLE | Admin user UUID |
| `reviewed_at` | `DATETIME` | NULLABLE | Review timestamp |
| `paid_at` | `DATETIME` | NULLABLE | Actual payment timestamp |
| `transaction_reference` | `VARCHAR(100)` | NULLABLE | Bank/transfer reference |
| `requested_at` | `DATETIME` | NOT NULL, DEFAULT `CURRENT_TIMESTAMP` | Request creation time |

**Indexes (MySQL):**
```sql
CREATE UNIQUE INDEX idx_withdrawal_requests_reference ON withdrawal_requests(reference_number);
CREATE INDEX idx_withdrawal_requests_vendor_id ON withdrawal_requests(vendor_id);
CREATE INDEX idx_withdrawal_requests_status ON withdrawal_requests(status);
```

---

### 4.3 Table: `earnings_snapshots`

**Purpose:** Periodic aggregated earnings data for reporting dashboards. Generated by background job (daily/weekly/monthly).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGINT` | PK, AUTO_INCREMENT | Snapshot ID |
| `vendor_id` | `CHAR(36)` | NOT NULL, INDEX | Supabase vendor UUID (NULL = platform total) |
| `period_type` | `ENUM('daily', 'weekly', 'monthly')` | NOT NULL | Snapshot granularity |
| `period_start` | `DATE` | NOT NULL | Period start date |
| `period_end` | `DATE` | NOT NULL | Period end date |
| `total_orders` | `INT` | NOT NULL, DEFAULT `0` | Orders in period |
| `total_items_sold` | `INT` | NOT NULL, DEFAULT `0` | Items sold in period |
| `gross_revenue` | `DECIMAL(14,2)` | NOT NULL, DEFAULT `0.00` | Total sales revenue |
| `total_commission` | `DECIMAL(14,2)` | NOT NULL, DEFAULT `0.00` | Platform commission collected |
| `total_vendor_earning` | `DECIMAL(14,2)` | NOT NULL, DEFAULT `0.00` | Net vendor earnings |
| `total_shipping` | `DECIMAL(14,2)` | NOT NULL, DEFAULT `0.00` | Shipping collected |
| `generated_at` | `DATETIME` | NOT NULL, DEFAULT `CURRENT_TIMESTAMP` | When snapshot was generated |

**Indexes (MySQL):**
```sql
CREATE INDEX idx_earnings_snapshots_vendor_id ON earnings_snapshots(vendor_id);
CREATE INDEX idx_earnings_snapshots_period ON earnings_snapshots(period_type, period_start);
UNIQUE KEY uk_snapshot (vendor_id, period_type, period_start);
```

---

### 4.4 Table: `audit_logs`

**Purpose:** Admin action audit trail. Logs critical actions for compliance.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGINT` | PK, AUTO_INCREMENT | Audit log ID |
| `actor_id` | `CHAR(36)` | NOT NULL, INDEX | Admin user UUID who performed action |
| `action` | `VARCHAR(80)` | NOT NULL | Action type (e.g., `vendor.approve`, `withdrawal.reject`) |
| `target_type` | `VARCHAR(60)` | NOT NULL | Entity type affected (e.g., `vendor`, `withdrawal`) |
| `target_id` | `VARCHAR(36)` | NOT NULL | Entity ID affected |
| `before_state` | `JSON` | NULLABLE | Serialized state before change |
| `after_state` | `JSON` | NULLABLE | Serialized state after change |
| `ip_address` | `VARCHAR(45)` | NULLABLE | Admin's IP address |
| `user_agent` | `VARCHAR(255)` | NULLABLE | Admin's browser |
| `performed_at` | `DATETIME` | NOT NULL, DEFAULT `CURRENT_TIMESTAMP` | Action timestamp |

**Indexes (MySQL):**
```sql
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_performed_at ON audit_logs(performed_at);
```

---

## 5. Commission Calculation Logic

The commission engine resolves the applicable rate using the following priority:

```
Priority 1: Vendor-specific commission (vendors.commission_type = 'custom')
Priority 2: Category-specific commission (categories.commission_rate IS NOT NULL)
Priority 3: Global commission (platform_settings.key = 'global_commission_rate')
```

**Formula applied at order creation time:**

```
commission_rate   = resolved rate from above priority
commission_amount = order_item.subtotal × (commission_rate / 100)
vendor_earning    = order_item.subtotal − commission_amount
```

> ⚠️ Commission values in `order_items` are **immutable after order creation** to preserve audit integrity.

---

## 6. Database Relationships Diagram

```
┌─────────────┐       ┌──────────────┐       ┌──────────────────┐
│    users    │──1:1──│   vendors    │──1:N──│ vendor_bank_det  │
│             │       │              │       └──────────────────┘
│             │──1:N──│  addresses   │──1:N──│ vendor_shipping  │
│             │       │              │       └──────────────────┘
│             │──1:N──│   orders     │──1:N──│  order_items     │
│             │       └──────────────┘       │                  │
│             │──1:N──│  cart_items  │       │  ──N:1──┐        │
│             │       └──────────────┘       └─────────│────────┘
│             │──1:N──│wishlist_items│                 │
│             │       └──────────────┘       ┌─────────┘
│             │──1:N──│   reviews    │        ▼
└─────────────┘       └──────────────┘   ┌──────────┐    ┌────────────┐
                                          │ products │──N:1──│ categories │
                       ┌──────────────┐  │          │    └────────────┘
                       │ notifications│  └──────────┘
                       └──────────────┘
                       
── MySQL (Separate DB) ──────────────────────────────
┌─────────────────┐   ┌──────────────────┐   ┌──────────────┐
│ commission_logs │   │withdrawal_requests│   │audit_logs    │
└─────────────────┘   └──────────────────┘   └──────────────┘
                       ┌──────────────────┐
                       │earnings_snapshots│
                       └──────────────────┘
```

---

## 7. Supabase Row-Level Security (RLS) Summary

| Table | Customer | Vendor | Admin |
|---|---|---|---|
| `users` | Own row only | Own row only | All rows |
| `addresses` | Own rows only | Own rows only | All rows |
| `categories` | READ | READ | Full CRUD |
| `vendors` | READ (approved) | Own store | Full CRUD |
| `vendor_bank_details` | ❌ | Own only | All |
| `vendor_applications` | Own only | Own only | All |
| `products` | READ (active) | Own products | Full CRUD |
| `cart_items` | Own only | ❌ | All |
| `wishlist_items` | Own only | ❌ | All |
| `orders` | Own only | View if item vendor | All |
| `order_items` | View via own orders | Own vendor items | All |
| `reviews` | Own + approved others | Own product reviews | All |
| `notifications` | Own only | Own only | All |
| `platform_settings` | READ selected | READ selected | Full CRUD |

---

## 8. Storage Buckets (Supabase Storage)

| Bucket Name | Purpose | Access | Max File Size |
|---|---|---|---|
| `product-images` | Product photos | Public read | 5 MB |
| `vendor-assets` | Store logos & banners | Public read | 3 MB |
| `review-images` | Review photo attachments | Public read | 3 MB |
| `user-avatars` | Customer profile pictures | Public read | 2 MB |
| `id-documents` | Vendor CNIC/ID docs | Private (admin only) | 5 MB |
| `category-images` | Category icon/image | Public read | 2 MB |

---

## 9. Key Triggers & Automation

| Trigger | Table | Event | Action |
|---|---|---|---|
| `handle_new_user` | `auth.users` | INSERT | Creates mirror row in `public.users` |
| `update_product_rating` | `reviews` | INSERT/UPDATE/DELETE | Recalculates `products.average_rating` and `products.total_reviews` |
| `update_vendor_rating` | `reviews` | INSERT/UPDATE/DELETE | Recalculates `vendors.average_rating` |
| `update_vendor_balance` | `order_items` | UPDATE `item_status='completed'` | Adds `vendor_earning` to `vendors.balance` |
| `deduct_product_stock` | `order_items` | INSERT | Decrements `products.stock` on order creation |
| `log_commission` | `order_items` | UPDATE `item_status='completed'` | Writes to MySQL `commission_logs` via API job |
| `set_updated_at` | All tables | UPDATE | Sets `updated_at = now()` |

---

## 10. Indexes Summary (Performance Critical)

| Table | Column | Index Type | Reason |
|---|---|---|---|
| `products` | `(name, description)` | GIN Full-Text | Search |
| `products` | `vendor_id` | BTREE | Filter by vendor |
| `products` | `category_id` | BTREE | Category browsing |
| `products` | `status` | BTREE | Status filtering |
| `products` | `price` | BTREE | Price sorting |
| `products` | `average_rating` | BTREE DESC | Rating sorting |
| `orders` | `customer_id` | BTREE | Order history |
| `orders` | `status` | BTREE | Status filtering |
| `orders` | `created_at` | BTREE DESC | Recent orders |
| `order_items` | `vendor_id` | BTREE | Vendor order view |
| `reviews` | `product_id` | BTREE | Product reviews |

---

## 11. Data Validation Rules

### Amounts & Pricing
- All monetary values: `NUMERIC(12,2)` — supports up to ₨9,999,999,999.99
- All prices must be ≥ 0
- `sale_price` must be < `price` if set (enforced at API layer)
- Commission rate must be between 0.00 and 100.00

### String Lengths
- UUIDs: `CHAR(36)` in MySQL, `UUID` type in PostgreSQL
- Short text (names, labels): `VARCHAR(100–255)`
- Long text: `TEXT` (unlimited)
- URLs: `TEXT`

### Enum States
- All status enums must transition via defined state machines (enforced at API/business logic layer, not DB)

---

## 12. Migration Strategy

### Phase 1 — Supabase Tables (in order)
1. `users` (trigger setup)
2. `categories`
3. `addresses`
4. `vendors`
5. `vendor_bank_details`
6. `vendor_applications`
7. `vendor_shipping_rates`
8. `products`
9. `cart_items`
10. `wishlist_items`
11. `orders`
12. `order_items`
13. `reviews`
14. `notifications`
15. `platform_settings` (seed data)
16. Enable RLS policies on all tables
17. Create all triggers

### Phase 2 — MySQL Tables
1. `commission_logs`
2. `withdrawal_requests`
3. `earnings_snapshots`
4. `audit_logs`

### Tooling
- Supabase: Migrations via Supabase CLI (`supabase db diff`, `supabase migration new`)
- MySQL: Prisma Migrate (`npx prisma migrate dev`)

---

## 13. Seed Data Requirements

The following data must be seeded before launch:

| Data | Table | Notes |
|---|---|---|
| Admin user | `auth.users` + `public.users` | Set `role = 'admin'` |
| Top-level categories | `categories` | Electronics, Fashion, Home, etc. |
| Platform settings | `platform_settings` | All rows from Section 3.16 |
| Global commission | `platform_settings` | Default 10% |

---

## 14. Database Connection Architecture

```
Next.js API Routes
       ↓
  ┌────────────────────────────────────┐
  │         Service Layer              │
  │  /lib/supabase.ts  /lib/prisma.ts  │
  └────────────────────────────────────┘
       ↓                    ↓
  Supabase SDK          Prisma Client
       ↓                    ↓
  Supabase             MySQL (PlanetScale /
  PostgreSQL           Managed MySQL)
```

**Environment Variables Required:**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# MySQL (Prisma)
DATABASE_URL="mysql://user:password@host:3306/virsa_financial"
```

---

*Document prepared for Virsa Multi-Vendor Marketplace — Backend Development Phase*
