# Technical Requirements Document (TRD)

# Virsa Multi-Vendor Marketplace Platform

**Version:** 2.0 — Updated to reflect confirmed infrastructure
**Domain:** [virsasharedbypakistan.com](https://virsasharedbypakistan.com)
**Date:** 2026-03-05

---

# 1. Document Overview

## 1.1 Purpose

This document defines the confirmed technical architecture, infrastructure, database design, API structure, security controls, and operational requirements for the Virsa Multi-Vendor Marketplace.

## 1.2 Scope

- Frontend architecture (Next.js App Router)
- Backend services & API Routes
- Database architecture (Supabase Primary + Backup + MySQL)
- Authentication & RBAC
- Order & commission engine
- File storage (Supabase Storage)
- Email (Resend), Rate Limiting (Upstash Redis)
- Deployment (Vercel + GitHub Actions)
- Performance, scalability, security, and backup

---

# 2. System Architecture

## 2.1 High-Level Architecture

**Type:** Modular Monolith — Next.js Full Stack (App Router)

```
Browser
  ↓
Next.js App Router (Vercel — virsasharedbypakistan.com)
  ├── Server Components (SSR/SSG — public pages)
  ├── Client Components (CSR — dashboards)
  └── API Routes (/api/*)
        ├── Supabase SDK → Primary DB (Mumbai)
        │     └── Backup DB (Singapore) [failover]
        ├── Prisma ORM → MySQL (Hostinger)
        ├── Resend API → Email notifications
        └── Upstash Redis → Rate limiting
```

## 2.2 Rendering Strategy

| Page Type | Strategy |
|---|---|
| Homepage, Products, Product Detail | SSR (dynamic, SEO critical) |
| Legal pages | SSG (static) |
| Dashboards (Customer, Vendor, Admin) | CSR (client-side) |

---

# 3. Technology Stack (Confirmed)

## 3.1 Frontend

| Technology | Purpose |
|---|---|
| Next.js 15 (App Router) | Framework |
| TypeScript | Type safety |
| TailwindCSS | Styling |
| React Hooks | State management |
| Supabase JS Client | DB + Auth + Storage |

## 3.2 Backend

| Technology | Purpose |
|---|---|
| Next.js API Routes | REST API layer |
| TypeScript | Type safety |
| Zod | Input validation |
| Prisma ORM | MySQL (financial DB) |
| Supabase Admin SDK | Server-side DB operations |

## 3.3 Infrastructure (Confirmed)

| Service | Provider | Details |
|---|---|---|
| Hosting | **Vercel** | Frontend + API routes |
| Primary DB | **Supabase** | Project ID: `ahdxjvdodferniaqjqbc`, Mumbai `ap-south-1` |
| Backup DB | **Supabase** | Project ID: `ubeawvyleowhgwndggbe`, Singapore `ap-southeast-1` |
| Financial DB | **Hostinger MySQL** | Host: `srv1491.hstgr.io`, DB: `u450707463_virsapakistan` |
| File Storage | **Supabase Storage** | Primary buckets + rclone sync to Backup project |
| Email | **Resend** | Transactional emails + system alert emails |
| Rate Limiting | **Upstash Redis** | REST-based, serverless-friendly |
| CI/CD | **GitHub Actions** | Auto-deploy to Vercel on push to `main` |

---

# 4. Database Architecture

## 4.1 Supabase — Primary DB (Core Transactional Data)

**Host:** `db.ahdxjvdodferniaqjqbc.supabase.co`
**PostgreSQL version:** 17.6

Core tables:

| Table | Purpose |
|---|---|
| `users` | All user accounts (extends Supabase Auth) |
| `vendors` | Vendor profiles and approval status |
| `products` | Product listings |
| `categories` | Product categories |
| `orders` | Order records |
| `order_items` | Per-item breakdown within an order |
| `cart_items` | Active cart items |
| `wishlist_items` | Saved wishlist |
| `reviews` | Product reviews |
| `notifications` | In-app notifications |
| `platform_settings` | Admin-configurable settings |

Full schema: see `doc/database-spec.md`

## 4.2 Supabase — Backup DB (Standby / Failover)

**Host:** `db.ubeawvyleowhgwndggbe.supabase.co`
**Region:** Singapore `ap-southeast-1`

- Replicated from primary every **4 hours** via `pg_dump → pg_restore` (GitHub Actions cron)
- Storage buckets mirrored every **6 hours** via rclone
- Promoted to primary by updating Vercel env vars (zero code change needed)

## 4.3 MySQL — Financial DB (Hostinger)

**Host:** `srv1491.hstgr.io`  
**Database:** `u450707463_virsapakistan`  
**ORM:** Prisma  

Financial tables (isolated for audit integrity):

| Table | Purpose |
|---|---|
| `commission_logs` | Immutable record per order item |
| `withdrawal_requests` | Vendor payout requests |
| `earnings_snapshots` | Daily vendor earning snapshots |
| `audit_logs` | Admin action trail |

## 4.4 Supabase Storage — File Storage

Buckets (Primary project + rclone-synced to Backup):

| Bucket | Contents |
|---|---|
| `product-images` | Product photos |
| `vendor-assets` | Store logos and banners |
| `review-images` | Review-attached photos |
| `user-avatars` | Profile pictures |
| `category-images` | Category thumbnails |
| `id-documents` | Vendor ID verification docs (private) |

---

# 5. Row-Level Security (RLS)

All Supabase tables have RLS enabled. Policies enforce:

- Customers see only their own orders, cart, wishlist, reviews
- Vendors see only their own products and orders
- Admins have full read/write access
- Public can read approved products and vendor profiles

Full RLS policies: see `doc/database-spec.md`

---

# 6. Role-Based Access Control (RBAC)

| Role | Access Scope |
|---|---|
| `customer` | Public pages + `/dashboard/*` |
| `vendor` | Public pages + `/vendor/dashboard/*` |
| `admin` | All routes including `/admin/dashboard/*` |

Enforcement layers:
1. Next.js Middleware (route protection)
2. API Route guard (role check via Supabase JWT)
3. Database RLS (data-level isolation)

---

# 7. API Design

All APIs are under `/api/*` as Next.js Route Handlers.

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/reset
DELETE /api/auth/logout

GET    /api/products
GET    /api/products/:id
POST   /api/products          (vendor)
PUT    /api/products/:id      (vendor)
DELETE /api/products/:id      (vendor/admin)

GET    /api/vendors
GET    /api/vendors/:id
POST   /api/vendors/register
PATCH  /api/vendors/:id/approve  (admin)
PATCH  /api/vendors/:id/reject   (admin)

POST   /api/orders
GET    /api/orders/:id
PATCH  /api/orders/:id/status

POST   /api/withdrawals/request
GET    /api/withdrawals/vendor
PATCH  /api/withdrawals/:id/approve  (admin)
PATCH  /api/withdrawals/:id/reject   (admin)

GET    /api/categories
POST   /api/categories        (admin)
PUT    /api/categories/:id    (admin)
DELETE /api/categories/:id    (admin)

GET    /api/health
```

All API inputs validated with **Zod**. All mutating routes require authenticated JWT.

---

# 8. Order & Commission Engine

## 8.1 Order Workflow

```
Pending → Processing → Shipped → Completed → Cancelled
```

| Transition | Actor |
|---|---|
| Pending → Processing | Vendor |
| Processing → Shipped | Vendor |
| Any → Cancelled (if Pending) | Customer |
| Any status override | Admin |

## 8.2 Commission Calculation

Priority: **Per-Vendor → Per-Category → Global Default**

```
CommissionAmount = ProductPrice × CommissionRate
VendorEarning    = ProductPrice − CommissionAmount
```

- Commission stored immutably in MySQL `commission_logs` at order time
- Cannot be modified retroactively

---

# 9. Checkout System (COD Only — Phase 1)

1. Validate cart items (stock check)
2. Lock stock (temporary reservation)
3. Create order + order items in Supabase
4. Log commission per item in MySQL
5. Deduct stock from `products` table
6. Send order confirmation email via Resend
7. Trigger vendor notification

---

# 10. Email Notification System

**Provider:** Resend (`RESEND_API_KEY`)
**From address:** `noreply@virsasharedbypakistan.com`
**Alert address:** `admin@virsasharedbypakistan.com`

| Trigger | Recipient |
|---|---|
| Order placed | Customer + Vendor |
| Order shipped | Customer |
| Order completed | Customer |
| Withdrawal approved | Vendor |
| Withdrawal rejected | Vendor |
| DB replication failure | Admin (alert email) |
| System error | Admin (alert email) |

Emails sent asynchronously via API routes.

---

# 11. Rate Limiting

**Provider:** Upstash Redis  
**Endpoint:** `UPSTASH_REDIS_REST_URL`

Applied to:
- Auth routes (login, register) — 10 req / minute per IP
- API mutation routes — 60 req / minute per user
- Admin routes — standard limits

---

# 12. Security Requirements

See `doc/security-and-backup.md` for full specification. Summary:

- HTTPS enforced via Vercel
- Supabase Auth (JWT, HTTP-only cookies, 1-hour token expiry)
- RLS on all Supabase tables
- AES-256-GCM encryption for vendor bank details (`ENCRYPTION_KEY`)
- Zod validation on all API inputs
- CORS locked to `https://virsasharedbypakistan.com`
- CSRF protection via SameSite cookies
- Rate limiting on all public-facing routes (Upstash Redis)
- Service role key never exposed to browser

---

# 13. Performance Requirements

- Page load < 2 seconds
- API response < 500ms
- Image delivery via Supabase Storage CDN
- Next.js Image Optimization enabled

---

# 14. Backup & Recovery

See `doc/security-and-backup.md` for full specification. Summary:

| Layer | Strategy | RPO |
|---|---|---|
| Supabase Primary | Managed daily backup (Pro Plan) | 24h |
| Supabase Backup project | pg_dump → pg_restore every 4h | 4h |
| MySQL (Hostinger) | Daily mysqldump | 24h |
| Supabase Storage | rclone sync to Backup every 6h | 6h |

**Failover:** Update 3 Vercel env vars → redeploy. No code change.

---

# 15. DevOps & Deployment

**CI/CD:** GitHub Actions → Vercel auto-deploy
**Branch strategy:** `main` = production

Pre-deploy checklist:
1. Run `pg_dump` snapshot of Primary DB
2. Apply migrations to both Primary and Backup Supabase projects
3. Deploy to Vercel
4. Run health check: `/api/health`

---

# 16. Monitoring

| Tool | Purpose |
|---|---|
| Vercel Analytics | Traffic, performance |
| Uptime monitoring | `/api/health` endpoint (monitors Primary + Backup + MySQL) |
| Email alerts (Resend) | DB replication failures, system errors |
| Supabase Dashboard | Slow query logs, DB usage |

---

# 17. Code Structure (Implemented)

```
/app
  /page.tsx                    ← Homepage
  /login                       ← Login page
  /products                    ← Products listing
  /product/[id]                ← Product detail
  /vendors                     ← Vendors listing
  /vendor/[id]                 ← Vendor public profile
  /cart                        ← Cart
  /checkout                    ← Checkout
  /deals                       ← Deals page
  /contact                     ← Contact page
  /wishlist                    ← Wishlist
  /dashboard                   ← Customer dashboard
    /orders
    /reviews
    /wishlist
    /notifications
    /settings
  /vendor/dashboard            ← Vendor dashboard
    /products
    /orders
    /earnings
    /notifications
    /settings
  /admin/dashboard             ← Admin dashboard
    /applications
    /vendors
    /customers
    /orders
    /earnings
    /notifications
    /settings
/components                    ← Shared UI components
/contexts                      ← React context providers
/lib                           ← Supabase client, utilities
```

---

# 18. Scalability Plan

**Phase 1 (Current):** Monolith — Next.js + Supabase + MySQL on Vercel

**Phase 2:** Separate backend service + Supabase read replicas + Redis caching

**Phase 3:** Microservices split (Order Service, Commission Service, Notification Service)

---

# 19. Future Technical Enhancements

- Payment gateways: JazzCash, Easypaisa, Stripe
- Real-time notifications via Supabase Realtime
- Vendor–customer messaging
- Elasticsearch for advanced product search
- Mobile app (React Native or Next.js PWA)
- AI product recommendations

---

# 20. Acceptance Criteria (Technical)

Platform is technically complete when:

- All three role-based dashboards fully functional
- Commission engine validated with correct calculations
- Multi-vendor cart works with per-vendor shipping
- Withdrawal workflow end-to-end functional
- Email notifications triggered correctly via Resend
- Automated DB replication active (Primary → Backup)
- All security policies enforced (RLS, rate limiting, encryption)
- Health check endpoint returns all services `up`
