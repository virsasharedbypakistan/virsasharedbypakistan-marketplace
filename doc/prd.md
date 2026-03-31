# Product Requirements Document (PRD)

# Virsa Multi-Vendor Marketplace Platform

**Version:** 2.0 — Updated to reflect actual implemented stack
**Domain:** [virsasharedbypakistan.com](https://virsasharedbypakistan.com)
**Date:** 2026-03-05

---

# 1. Product Overview

## 1.1 Product Name

Virsa Multi-Vendor Marketplace Platform

## 1.2 Product Description

Virsa is a web-based multi-vendor ecommerce marketplace that enables multiple independent sellers to list, manage, and sell products to customers. The platform acts as an intermediary, providing vendor onboarding, commission management, order processing, and financial reporting.

**Live domain:** https://virsasharedbypakistan.com

## 1.3 Technology Stack (Confirmed & Implemented)

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router), TypeScript, TailwindCSS |
| **Backend** | Next.js API Routes |
| **Primary DB** | Supabase (PostgreSQL) — Project: `virsasharedbypakistan's Project`, Mumbai (ap-south-1) |
| **Backup DB** | Supabase (PostgreSQL) — Project: `virsa-backup`, Singapore (ap-southeast-1) |
| **Auth** | Supabase Auth (JWT) |
| **File Storage** | Supabase Storage (Primary + mirrored to Backup) |
| **Email** | Resend API |
| **Rate Limiting** | Upstash Redis |
| **Validation** | Zod |
| **Deployment** | Vercel (Frontend + API) |

---

## 1.4 Product Goals

- Enable vendors to sell products independently
- Provide customers with a seamless ecommerce experience
- Allow admin to manage vendors, commissions, and operations
- Support scalable multi-vendor architecture
- Enable commission-based revenue model

---

## 1.5 Success Metrics (KPIs)

- Number of registered vendors
- Number of active products
- Total orders processed
- Platform commission revenue
- Customer retention rate
- Vendor retention rate
- System uptime (>99.5%)

---

# 2. User Roles & Permissions

## 2.1 Customer

- Register / Login / Logout / Reset password
- Browse and search products
- View product details and vendor profiles
- Add to cart (multi-vendor)
- Place orders (Cash on Delivery)
- Track order status
- Add to wishlist
- Leave reviews and ratings
- Manage profile and settings
- View notifications

## 2.2 Vendor (Seller)

- Register as vendor (pending approval)
- Manage store profile (name, logo, banner, description)
- Manage products (add, edit, delete, images)
- View and update order status
- View earnings and commission breakdown
- Request withdrawals (Bank Transfer, JazzCash, Manual)
- View notifications and settings

## 2.3 Administrator

- Approve / reject / suspend vendor applications
- Manage all vendors, customers, products, orders
- Manage commissions (global, per-vendor, per-category)
- Approve / reject withdrawal requests
- Manage categories
- View platform earnings and analytics
- View notifications and configure platform settings

---

# 3. Functional Requirements

## 3.1 Authentication System

- Supabase Auth (JWT-based)
- Customer: Register, Login, Logout, Reset password
- Vendor: Register with store info → Admin approval required
- Admin: Login (role-gated)
- Role-based access control enforced at middleware and API level
- Session: HTTP-only cookies

## 3.2 Customer Module

### Implemented Screens
| Screen | Route | Status |
|---|---|---|
| Homepage | `/` | ✅ Implemented |
| Products Listing | `/products` | ✅ Implemented |
| Product Detail | `/product/[id]` | ✅ Implemented |
| Vendor Listings | `/vendors` | ✅ Implemented |
| Vendor Profile | `/vendors/[id]` | ✅ Implemented |
| Cart | `/cart` | ✅ Implemented |
| Checkout | `/checkout` | ✅ Implemented |
| Deals | `/deals` | ✅ Implemented |
| Contact | `/contact` | ✅ Implemented |
| Login | `/login` | ✅ Implemented |
| Customer Dashboard | `/dashboard` | ✅ Implemented |
| My Orders | `/dashboard/orders` | ✅ Implemented |
| My Reviews | `/dashboard/reviews` | ✅ Implemented |
| Wishlist | `/dashboard/wishlist` | ✅ Implemented |
| Notifications | `/dashboard/notifications` | ✅ Implemented |
| Profile Settings | `/dashboard/settings` | ✅ Implemented |

### Key Features
- Browse by category, vendor, search by name
- Multi-vendor cart support
- COD-only checkout with shipping address
- Order status tracking: Pending → Processing → Shipped → Completed → Cancelled
- Wishlist management
- Reviews only by verified buyers (verified purchase check)

## 3.3 Vendor Module

### Implemented Screens
| Screen | Route | Status |
|---|---|---|
| Vendor Public Profile | `/vendor/[id]` | ✅ Implemented |
| Vendor Dashboard | `/vendor/dashboard` | ✅ Implemented |
| My Products | `/vendor/dashboard/products` | ✅ Implemented |
| My Orders | `/vendor/dashboard/orders` | ✅ Implemented |
| Earnings | `/vendor/dashboard/earnings` | ✅ Implemented |
| **My Deals** | `/vendor/dashboard/deals` | ✅ Implemented |
| Notifications | `/vendor/dashboard/notifications` | ✅ Implemented |
| Settings | `/vendor/dashboard/settings` | ✅ Implemented |

### Key Features
- Product management (add, edit, delete, images via Supabase Storage)
- Order status control (Processing → Shipped)
- Earnings view with commission deduction breakdown
- Withdrawal requests: Bank Transfer, JazzCash, Manual
- **Deal management**: create time-limited deals on own products with percentage or fixed discounts, set start/end dates, track units sold

## 3.4 Admin Module

### Implemented Screens
| Screen | Route | Status |
|---|---|---|
| Admin Dashboard | `/admin/dashboard` | ✅ Implemented |
| Vendor Applications | `/admin/dashboard/applications` | ✅ Implemented |
| Vendor Management | `/admin/dashboard/vendors` | ✅ Implemented |
| Customer Management | `/admin/dashboard/customers` | ✅ Implemented |
| Order Management | `/admin/dashboard/orders` | ✅ Implemented |
| Platform Earnings | `/admin/dashboard/earnings` | ✅ Implemented |
| **Deals Management** | `/admin/dashboard/deals` | ✅ Implemented |
| Notifications | `/admin/dashboard/notifications` | ✅ Implemented |
| Settings | `/admin/dashboard/settings` | ✅ Implemented |

### Key Features
- Vendor application review: Approve / Reject / Suspend
- Commission management: global, per-vendor, per-category
- Withdrawal approval/rejection
- Order status override
- Platform analytics: total revenue, commissions, users, vendors

## 3.5 Commission System

- Commission types: Global Default → Per Category → Per Vendor (priority order)
- Formula: `VendorEarning = OrderAmount − Commission`
- Commission recorded in Supabase `order_items` table at order time
- Commission logs stored in `commission_logs` table for audit trail

## 3.6 Shipping System

- Flat rate or city-based rate
- Configurable: vendor-managed or admin-managed
- In multi-vendor cart: shipping calculated per vendor

## 3.7 Notification System

- Email notifications via **Resend API**
- Triggers: order placed, order shipped, order completed, withdrawal approved
- System failure alerts sent to `ALERT_EMAIL` via Resend
- In-app notification panel for all three roles

## 3.8 Deals System

- Both **vendors** (on their own products) and **admin** (on any product) can create deals
- Discount types: **Percentage** (e.g. 20%) or **Fixed Amount** (e.g. Rs 500 off)
- Deal price auto-computed: `deal_price = original_price − discount`
- Deals have `starts_at` and `expires_at` — status auto-computed: `active | upcoming | expired`
- Platform-wide deals listed on the public `/deals` page and Homepage Flash Deals section
- Vendors see own deals in `/vendor/dashboard/deals`
- Admin sees all deals from all vendors in `/admin/dashboard/deals`
- Admin can edit or delete any deal regardless of who created it
- Deals stored in Supabase `deals` table with computed `is_active` column

---

# 4. Non-Functional Requirements

## 4.1 Performance
- Page load < 2 seconds
- API response < 500ms
- Supports 10,000 concurrent users

## 4.2 Scalability
- 100,000 users, 10,000 vendors, 1,000,000 products

## 4.3 Security
- HTTPS enforced (Vercel)
- Supabase Auth (JWT, HTTP-only cookies)
- Row-Level Security (RLS) on all Supabase tables
- AES-256-GCM encryption for sensitive vendor data (bank details)
- Rate limiting via Upstash Redis
- Input validation via Zod on all API routes
- See `doc/security-and-backup.md` for full security specification

## 4.4 Backup System
- **Dual Supabase project strategy**: Primary (Mumbai) → Backup (Singapore) — replicated every 4 hours
- MySQL backed up daily to Hostinger
- All secrets managed in Vercel Encrypted Environment Variables
- See `doc/security-and-backup.md` for full backup specification

## 4.5 Mobile Responsiveness
- Fully responsive: Desktop, Tablet, Mobile

---

# 5. System Architecture

```
Browser
  ↓
Next.js (Vercel) — virsasharedbypakistan.com
  ↓
Next.js API Routes
  ├── Supabase (Primary) → Core data (Mumbai)
  │     └── Replicated → Supabase (Backup) — Singapore
  └── Supabase Storage → Product images, vendor assets
```

---

# 6. Database Architecture

| Database | Provider | Purpose |
|---|---|---|
| Supabase Primary | `ahdxjvdodferniaqjqbc.supabase.co` | All application data |
| Supabase Backup | `ubeawvyleowhgwndggbe.supabase.co` | Standby replica (failover) |
| Supabase Storage | Primary + mirrored to Backup | Product/vendor images, avatars |

All Supabase tables: `users`, `addresses`, `categories`, `platform_settings`, `vendors`, `vendor_bank_details`, `products`, `cart_items`, `wishlist_items`, `orders`, `order_items`, `reviews`, `notifications`, `deals`, `commission_logs`, `withdrawal_requests`, `earnings_snapshots`, `audit_logs`

---

# 7. API Modules

```
/api/auth          — Register, Login, Reset, Logout
/api/products      — CRUD, search, filter
/api/vendors       — Profile, registration, approval
/api/orders        — Place, view, update status
/api/admin         — Vendor/product/order management
/api/withdrawals   — Request, approve, reject
/api/categories    — CRUD
/api/health        — Monitors Primary + Backup Supabase + MySQL
```

---

# 8. Legal & Policy Requirements

Required pages: Privacy Policy, Terms & Conditions, Refund Policy, Seller Agreement

---

# 9. Deployment

| Component | Host |
|---|---|
| Frontend + API | Vercel |
| Primary DB | Supabase (Mumbai) |
| Backup DB | Supabase (Singapore) |
| Email | Resend |
| Rate Limiting | Upstash Redis |
| Storage | Supabase Storage |

CI/CD: GitHub Actions → Vercel auto-deploy on push to `main`

---

# 10. Future Enhancements (Phase 2)

- Online payments: JazzCash, Easypaisa, Stripe
- Mobile app (React Native)
- Real-time notifications (Supabase Realtime / WebSockets)
- Vendor–customer chat
- Advanced analytics dashboard
- AI product recommendations
- Push notifications

---

# 11. Risks & Mitigation

| Risk | Mitigation |
|---|---|
| Fraud vendors | Vendor approval workflow with ID verification |
| Payment disputes | COD order tracking + refund policy |
| Database failure | Dual Supabase project failover strategy |
| Scalability | Vercel + Supabase Pro auto-scaling |

---

# 12. Milestones

- **Phase 1** — Core Marketplace UI ✅ (In Progress)
- **Phase 2** — Backend API + DB integration
- **Phase 3** — Payment gateway integration
- **Phase 4** — Mobile Apps


---

# 13. Recent Implementations (Session: 2026-03-31)

## 13.1 Vendor Registration Enhancements

### Document Upload System
- **CNIC Front & Back Upload**: Vendors must now upload both sides of their CNIC (front with photo, back with address)
- **Store Logo Upload**: Required 200x200px square logo for store branding
- **Store Banner Upload**: Required 1200x400px wide banner for store page header
- **File Storage**: All uploads stored in Supabase Storage `vendor-documents` bucket
  - Allowed types: `image/*`, `application/pdf`
  - Max file size: 5MB
  - Public access enabled for display
- **Filename Convention**: 
  - `logo_[timestamp]_[random].[ext]`
  - `banner_[timestamp]_[random].[ext]`
  - `cnic_front_[timestamp]_[random].[ext]`
  - `cnic_back_[timestamp]_[random].[ext]`

### Vendor Application API Updates
- **Route**: `/api/auth/vendor-application`
- **New Required Fields**:
  - `logo_url`: Store logo URL (required)
  - `banner_url`: Store banner URL (required)
  - `cnic_front_url`: CNIC front side URL (required)
  - `cnic_back_url`: CNIC back side URL (required)
- **Storage**: Logo and banner stored in `vendors` table, CNIC URLs stored in `metadata` JSONB column

### Upload API Enhancement
- **Route**: `/api/upload/cnic`
- **New Parameter**: `type` - Specifies document type (logo, banner, cnic-front, cnic-back)
- **Functionality**: Generates descriptive filenames based on document type for better organization

## 13.2 Admin Application Review Enhancements

### Admin Applications Page Updates
- **Route**: `/admin/dashboard/applications`
- **New Display Features**:
  - Store branding preview section showing logo and banner with proper aspect ratios
  - Separate CNIC front and back document sections with labels
  - View and download buttons for each document
  - Clear indicators for missing documents
  - Proper image previews with Next.js Image component

### Admin Dashboard Quick Review Modal
- **Route**: `/admin/dashboard`
- **Update**: Simplified vendor documents modal
  - Removed hardcoded document list (was showing 4 fake document types)
  - Added informational notice explaining only CNIC is collected
  - Added link to full applications page for detailed review
  - Kept quick approve/reject actions

## 13.3 Vendor Status Filtering

### Products & Deals Filtering
- **Implementation**: Only products and deals from `approved` vendors are shown on public pages
- **Affected Routes**:
  - `/api/products` - Filters by `vendors.status = 'approved'`
  - `/api/products/[id]` - Filters by `vendors.status = 'approved'`
  - `/api/deals` - Filters by `vendors.status = 'approved'`
  - `/api/deals/[id]` - Filters by `vendors.status = 'approved'`
- **Stores Page**: `/vendors` - Only shows approved vendors

### Admin Vendor Status Display Fix
- **Issue**: Admin dashboard was checking for status `"active"` but database uses `"approved"`
- **Fix**: Updated status mapping to correctly display vendor statuses
  - Database: `"approved"`, `"pending"`, `"suspended"`, `"rejected"`
  - Display: `"Active"`, `"Pending"`, `"Suspended"`, `"Rejected"`
- **Action Handlers**: Updated to use proper action-based API calls instead of direct status updates

## 13.4 Vendor Deletion System

### Enhanced Deletion Logic
- **Route**: `/api/admin/vendors/[id]` (DELETE method)
- **Constraint Handling**:
  - Checks for order items (RESTRICT constraint) - blocks deletion if any exist
  - Manually deletes records with NO ACTION constraints:
    - Deals
    - Commission logs
    - Earnings snapshots
    - Withdrawal requests
  - Allows CASCADE deletion for products, cart items, bank details
- **User Account Cleanup**: Deletes vendor's Supabase Auth account and user record
- **Error Handling**: User-friendly error messages for constraint violations
- **UI Updates**: 
  - Delete confirmation modal with warning about order history preservation
  - Displays API error messages to admin
  - Fixed dropdown menu positioning to prevent container overflow

## 13.5 Vendor Orders Management

### Status Update Restrictions
- **Route**: `/vendor/dashboard/orders`
- **Implementation**: "Update Status" button is hidden when order status is "Delivered"
- **Rationale**: Prevents vendors from modifying completed orders

## 13.6 Domain Configuration Updates

### Domain Standardization
- **Old Domain**: `virsa.pk`
- **New Domain**: `virsasharedbypakistan.com`
- **Updated Locations**:
  - Vendor registration store URL prefix
  - Vendor settings store URL prefix
  - Contact page support email
- **Environment Variables**: All configured in `.env.local` with proper domain references

## 13.7 Storage Bucket Configuration

### Vendor Documents Bucket
- **Bucket Name**: `vendor-documents`
- **Configuration**:
  - Public access: Enabled
  - File size limit: 5MB (5,242,880 bytes)
  - Allowed MIME types: `image/*`, `application/pdf`
  - Created: 2026-03-31
- **Purpose**: Stores all vendor application documents (logos, banners, CNIC documents)

## 13.8 TypeScript Fixes

### Compilation Errors Resolved
1. **Admin Applications Page**: Added missing `Image` import from `next/image`
2. **Orders API**: Added explicit type annotation `any[]` for `orderItems` array

## 13.9 Data Cleanup

### Vendor Deletion
- **Deleted**: TechHub Pakistan vendor
- **Cleanup Performed**:
  - 3 order items removed
  - 3 products removed
  - 1 deal removed
  - Commission logs removed
  - Earnings snapshots removed
  - Withdrawal requests removed
  - Bank details removed
  - User account removed
- **Current State**: Only ZeeLabs vendor remains (pending status)

---

# 14. Technical Debt & Known Issues

## 14.1 Resolved Issues
- ✅ Vendor status display mismatch (active vs approved)
- ✅ Missing CNIC document upload in vendor registration
- ✅ Admin applications page not showing all vendor data
- ✅ Suspended vendor products appearing on shop page
- ✅ Vendor dropdown menu overflow issue
- ✅ Domain inconsistencies across the application
- ✅ TypeScript compilation errors

## 14.2 Future Improvements
- Add image compression for uploaded files
- Implement image cropping/resizing on upload
- Add document verification status tracking
- Implement vendor document expiry notifications
- Add bulk vendor operations for admin
- Implement vendor performance metrics dashboard

