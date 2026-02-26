Below is the **Technical Requirements Document (TRD)** for your **Multi-Vendor Marketplace Platform**, structured for engineering execution.

---

# Technical Requirements Document (TRD)

# Virsa Multi-Vendor Marketplace Platform

---

# 1. Document Overview

## 1.1 Purpose

This document defines the technical architecture, system design, database structure, APIs, infrastructure, security controls, and operational requirements for building the Multi-Vendor Marketplace platform.

## 1.2 Scope

Covers:

* Frontend architecture (Next.js)
* Backend services & APIs
* Database architecture (Supabase + MySQL)
* Authentication & RBAC
* Order & commission engine
* Deployment & DevOps
* Performance & scalability
* Security
* Backup & monitoring

---

# 2. System Architecture

## 2.1 High-Level Architecture

Architecture Type: Modular Monolith (Phase 1)
Future-ready for Microservices (Phase 2)

### Layers:

1. Presentation Layer (Next.js Frontend)
2. API Layer (Next.js API routes / Node service)
3. Business Logic Layer
4. Data Layer (Supabase + MySQL)
5. Storage Layer (Supabase Storage / S3)

---

## 2.2 Architecture Flow

Client (Browser)
↓
Next.js Frontend (SSR + CSR hybrid)
↓
Next.js API Routes / Backend Services
↓
Supabase (Auth + Core DB)
↓
MySQL (Analytics + Financial Data)

---

# 3. Technology Stack

## 3.1 Frontend

* Next.js (App Router)
* TypeScript
* TailwindCSS
* React Query / SWR
* Zustand or Redux Toolkit
* Axios

Rendering Strategy:

* SSR for product pages
* SSG for static pages (legal)
* CSR for dashboards

---

## 3.2 Backend

* Next.js API Routes
* Node.js (if separated service)
* TypeScript
* Zod (validation)
* Prisma ORM (for MySQL)
* Supabase SDK

---

## 3.3 Database

Primary DB: Supabase (PostgreSQL)
Secondary DB: MySQL (Analytics + Financial Logs)

---

# 4. Database Architecture

---

# 4.1 Supabase (Transactional Database)

Handles:

* Users
* Vendors
* Products
* Orders
* Reviews
* Cart
* Wishlist

---

## 4.2 MySQL (Financial & Reporting Database)

Handles:

* Commission logs
* Withdrawal logs
* Earnings reports
* Analytics snapshots

Reason:
Financial data must be isolated for audit integrity.

---

# 5. Database Schema (Core Tables)

---

## 5.1 Users Table

* id (UUID)
* name
* email
* role (customer | vendor | admin)
* password_hash
* created_at
* status

---

## 5.2 Vendors Table

* id
* user_id (FK)
* store_name
* logo_url
* banner_url
* approval_status
* rating
* commission_type
* commission_rate
* created_at

---

## 5.3 Products Table

* id
* vendor_id
* category_id
* name
* description
* price
* stock
* images[]
* status
* created_at

---

## 5.4 Orders Table

* id
* customer_id
* total_amount
* shipping_amount
* status
* payment_method (COD)
* created_at

---

## 5.5 OrderItems Table

* id
* order_id
* product_id
* vendor_id
* quantity
* unit_price
* commission_amount
* vendor_earning

---

## 5.6 Withdrawals Table (MySQL)

* id
* vendor_id
* amount
* status
* method
* approved_by
* created_at

---

## 5.7 Commission Logs Table (MySQL)

* id
* order_id
* vendor_id
* commission_percentage
* commission_amount
* created_at

---

# 6. Role-Based Access Control (RBAC)

Roles:

Customer
Vendor
Admin

Access Control Implementation:

* Middleware-based route protection
* JWT token validation
* Role check in API layer
* Database-level row security policies (Supabase RLS)

---

# 7. API Design

RESTful API structure:

/api/auth
/api/products
/api/vendors
/api/orders
/api/admin
/api/withdrawals

---

## 7.1 Authentication APIs

POST /api/auth/register
POST /api/auth/login
POST /api/auth/reset

---

## 7.2 Product APIs

GET /api/products
GET /api/products/:id
POST /api/products
PUT /api/products/:id
DELETE /api/products/:id

---

## 7.3 Order APIs

POST /api/orders
GET /api/orders/:id
PATCH /api/orders/status

---

## 7.4 Withdrawal APIs

POST /api/withdrawals/request
GET /api/withdrawals/vendor
PATCH /api/withdrawals/approve

---

# 8. Order & Commission Engine

---

## 8.1 Order Workflow

Status flow:

Pending → Processing → Shipped → Completed → Cancelled

Status transitions controlled by:

* Vendor (Processing → Shipped)
* Admin (Override)
* Customer (Cancel if Pending)

---

## 8.2 Commission Calculation Logic

Commission priority:

1. Per Vendor
2. Per Category
3. Global Default

Formula:

Commission = ProductPrice × CommissionRate
VendorEarning = ProductPrice − Commission

Commission stored at order time (immutable).

---

# 9. Shipping System Logic

Shipping type configurable:

Option A: Vendor Managed
Option B: Admin Managed

Shipping Calculation:

* Flat rate
* City-based rate

Multi-vendor cart:

Shipping calculated separately per vendor.

---

# 10. Checkout System (COD)

Workflow:

1. Validate cart
2. Lock stock (temporary reservation)
3. Create order
4. Deduct stock
5. Send email notification

Stock consistency must use transaction-level locking.

---

# 11. Email Notification System

Triggers:

* Order placed
* Order shipped
* Order completed
* Withdrawal approved

Provider:

* SendGrid or Resend API

Emails must be asynchronous (background job queue).

---

# 12. Background Job Processing

Used for:

* Email sending
* Commission logging
* Analytics aggregation
* Scheduled payouts

Recommended:

* BullMQ (Redis)
* Supabase Edge Functions (optional)

---

# 13. Admin Panel Architecture

Built using:

* Next.js (separate admin layout)
* Protected routes
* API-level admin validation

Admin capabilities:

* Vendor approval
* Order override
* Commission management
* Withdrawal approval

---

# 14. Security Requirements

---

## 14.1 Authentication Security

* Supabase Auth
* JWT validation
* Secure cookies
* Password hashing (bcrypt)

---

## 14.2 API Security

* Input validation (Zod)
* Rate limiting
* CSRF protection
* CORS policy

---

## 14.3 Data Security

* HTTPS enforced
* Environment variable encryption
* Row-level security in Supabase
* SQL injection prevention via ORM

---

# 15. Performance Requirements

Target:

* <2 sec page load
* <500ms API response

Optimizations:

* CDN caching
* Image optimization
* Database indexing
* Query optimization

---

# 16. Scalability Plan

Phase 1:

Monolith (Next.js + Supabase)

Phase 2:

* Separate backend service
* Redis caching
* Read replicas
* Microservices split:

  * Order Service
  * Commission Service
  * Notification Service

---

# 17. Backup & Recovery

Database backup:

* Daily automated backups (Supabase)
* Weekly full MySQL dump

Retention:

* 30 days backup history

Recovery plan:

* Restore from snapshot
* Redeploy via CI/CD

---

# 18. DevOps & Deployment

Environments:

* Development
* Staging
* Production

CI/CD:

* GitHub Actions
* Automated build & deploy

Hosting:

Frontend: Vercel
Backend: Vercel / AWS
Database: Supabase + Managed MySQL

---

# 19. Monitoring & Logging

Monitoring:

* Vercel Analytics
* Sentry (Error tracking)

Logs:

* API logs
* Payment logs
* Withdrawal logs

---

# 20. Testing Strategy

Testing Types:

* Unit testing (Jest)
* Integration testing
* API testing (Postman)
* E2E testing (Playwright)

Coverage Target:

≥ 70%

---

# 21. Code Structure

/src
/app
/components
/modules
/services
/lib
/types
/api

Separation by feature modules recommended.

---

# 22. Technical Risks

Risk: Multi-vendor cart complexity
Mitigation: Separate order items by vendor

Risk: Commission calculation errors
Mitigation: Immutable commission logs

Risk: Concurrency in stock management
Mitigation: Transactional queries

---

# 23. Future Technical Enhancements

* Payment gateway integration
* Real-time notifications (WebSockets)
* Vendor-customer chat
* Elasticsearch integration
* AI product recommendations

---

# 24. Acceptance Criteria (Technical)

Platform is technically complete when:

* Role-based system enforced
* Commission engine validated
* Multi-vendor cart works
* Withdrawal workflow functional
* Email notifications triggered
* Automated backups active
* Security policies enforced

---

This TRD now provides the engineering blueprint required to implement the system.

