# UI Screens Documentation

# Virsa Multi-Vendor Marketplace Platform

**Version:** 2.0 — Reflects all implemented screens
**Domain:** [virsasharedbypakistan.com](https://virsasharedbypakistan.com)
**Date:** 2026-03-05

---

## Implementation Status Key

| Symbol | Meaning |
|---|---|
| ✅ | Implemented |
| 🔲 | Planned (Phase 2) |

---

## 1. Public Pages

### 1.1 Homepage — `/` ✅

**Layout:** Full-width, dark themed, multi-section landing

| Section | Description |
|---|---|
| Hero Banner | Full-width banner with CTA buttons (Shop Now, Become a Vendor) |
| Featured Categories | Grid of category cards with icons |
| Featured Products | Horizontal scroll / grid of top products |
| Flash Deals | Sale timer + discounted products |
| Top Vendors | Vendor cards with rating and product count |
| New Arrivals | Latest product listings |
| Banner CTA | Mid-page promotional banner |
| Footer | Links, social media, newsletter signup |

---

### 1.2 Products Listing — `/products` ✅

| Section | Description |
|---|---|
| Filter Sidebar | Category, price range, rating, vendor filters |
| Sort Bar | Sort by: Newest, Price (low/high), Rating |
| Product Grid | Responsive card grid (image, name, price, rating, add to cart) |
| Pagination | Page-based navigation |
| Search Bar | Search by product name |

---

### 1.3 Product Detail — `/product/[id]` ✅

| Section | Description |
|---|---|
| Image Gallery | Main image + thumbnail strip |
| Product Info | Name, price, stock status, category |
| Vendor Card | Vendor name, rating, link to store |
| Add to Cart | Quantity selector + Add to Cart button |
| Add to Wishlist | Heart icon toggle |
| Description | Full product description |
| Specifications | Key product specs |
| Reviews Section | Star rating summary + individual reviews |
| Related Products | Bottom grid of similar products |

---

### 1.4 Vendors Listing — `/vendors` ✅

| Section | Description |
|---|---|
| Search Bar | Search by vendor/store name |
| Vendor Cards Grid | Store logo, name, rating, product count, location |
| Sort/Filter | By rating, category, newest |

---

### 1.5 Vendor Public Profile — `/vendors/[id]` ✅

| Section | Description |
|---|---|
| Store Banner | Full-width banner image |
| Store Header | Logo, store name, rating, joined date |
| Store Stats | Total products, reviews, rating |
| Product Listing | All vendor products (filterable) |
| Contact Info | Vendor contact details |

---

### 1.6 Login — `/login` ✅

| Section | Description |
|---|---|
| Login Form | Email + Password + Submit |
| Register Link | Switch to registration |
| Forgot Password | Password reset flow via Supabase Auth |
| Role detection | Redirects to correct dashboard after login |

---

### 1.7 Cart — `/cart` ✅

| Section | Description |
|---|---|
| Cart Items | Product image, name, vendor, price, quantity controls |
| Multi-vendor grouping | Items grouped by vendor |
| Price Summary | Subtotal, shipping, total |
| Checkout Button | Proceeds to `/checkout` |
| Empty State | Message + CTA to browse products |

---

### 1.8 Checkout — `/checkout` ✅

| Section | Description |
|---|---|
| Shipping Address Form | Name, phone, city, address |
| Order Summary | All cart items + pricing |
| Payment Method | Cash on Delivery (COD) only |
| Place Order Button | Creates order, sends confirmation email via Resend |
| Success Screen | Order ID + thank you message |

---

### 1.9 Deals — `/deals` ✅

| Section | Description |
|---|---|
| Flash Deals Banner | Countdown timer |
| Deal Products Grid | Discounted products with savings badge |

---

### 1.10 Contact — `/contact` ✅

| Section | Description |
|---|---|
| Contact Form | Name, email, message fields |
| Platform Info | Address, email, phone |

---

## 2. Customer Dashboard

**Base route:** `/dashboard`  
**Auth:** Required (role: `customer`)  
**Layout:** Sidebar navigation + main content area

### 2.1 Dashboard Home — `/dashboard` ✅

| Widget | Description |
|---|---|
| Recent Orders | Last 5 orders with status badges |
| Wishlist Count | Number of saved items |
| Review Count | Total reviews given |
| Quick Links | Navigate to orders, wishlist, settings |

---

### 2.2 My Orders — `/dashboard/orders` ✅

| Section | Description |
|---|---|
| Orders Table | Order ID, date, total, status, items count |
| Status Filter | Filter by: All, Pending, Processing, Shipped, Completed, Cancelled |
| Order Detail | Expandable row / modal: items, shipping address, invoice |
| Track Button | Visual status progress bar |

---

### 2.3 My Reviews — `/dashboard/reviews` ✅

| Section | Description |
|---|---|
| Reviews List | Product image, review text, star rating, date |
| Edit Review | Update review if eligible |
| Delete Review | Remove own review |

---

### 2.4 Wishlist — `/dashboard/wishlist` ✅

| Section | Description |
|---|---|
| Wishlist Grid | Product cards with image, price, name |
| Remove Button | Remove from wishlist |
| Add to Cart | Direct add to cart from wishlist |

---

### 2.5 Notifications — `/dashboard/notifications` ✅

| Section | Description |
|---|---|
| Notification List | All notifications with read/unread state |
| Mark as Read | Single / Mark all as read |
| Notification Types | Order updates, vendor updates, system messages |

---

### 2.6 Profile Settings — `/dashboard/settings` ✅

| Section | Description |
|---|---|
| Profile Info | Name, email, phone, avatar upload |
| Change Password | Current + new password via Supabase Auth |
| Address Book | Save shipping addresses |
| Notification Preferences | Email notification toggles |

---

## 3. Vendor Dashboard

**Base route:** `/vendor/dashboard`  
**Auth:** Required (role: `vendor`, status: `approved`)  
**Layout:** Sidebar navigation + main content area

### 3.1 Dashboard Home — `/vendor/dashboard` ✅

| Widget | Description |
|---|---|
| Total Revenue | Lifetime earnings |
| Total Orders | Order count by status |
| Total Products | Active product count |
| Pending Withdrawals | Outstanding withdrawal amounts |
| Recent Orders | Quick view of latest orders |
| Sales Chart | Revenue over last 30 days |

---

### 3.2 My Products — `/vendor/dashboard/products` ✅

| Section | Description |
|---|---|
| Product Table | Image, name, price, stock, status, actions |
| Add Product | Modal/form: name, description, price, stock, category, images |
| Edit Product | Update any product field including image upload |
| Delete Product | Confirmation dialog |
| Image Upload | Supabase Storage (`product-images` bucket) |
| Status Toggle | Active / Inactive |

---

### 3.3 My Orders — `/vendor/dashboard/orders` ✅

| Section | Description |
|---|---|
| Orders Table | Order ID, customer, date, items, total, status |
| Status Update | Update: Processing → Shipped |
| Filter | By status, date range |
| Order Detail | View full order + customer shipping address |

---

### 3.4 Earnings — `/vendor/dashboard/earnings` ✅

| Section | Description |
|---|---|
| Earnings Summary | Gross earnings, commission deducted, net earnings |
| Transaction History | Per-order earnings breakdown |
| Withdrawal History | Past withdrawals with status |
| Request Withdrawal | Amount + method (Bank Transfer, JazzCash, Manual) |

---

### 3.5 Deals — `/vendor/dashboard/deals` ✅

| Section | Description |
|---|---|
| Stats Bar | Total deals, Active now, Upcoming, Units sold via deals |
| Filter Tabs | All / Active / Upcoming / Expired |
| Deals Table | Title, product, discount badge, deal price vs original, validity dates, status, sold count |
| Edit Deal | Update title, discount, dates via modal |
| Delete Deal | Confirm dialog |
| Create Deal | Modal form: title, product, discount type (% or fixed), value, start/end datetime, live price preview |

---

### 3.6 Notifications — `/vendor/dashboard/notifications` ✅

| Section | Description |
|---|---|
| Notification Feed | New orders, withdrawal updates, system messages |
| Mark as Read | Single / bulk |

---

### 3.6 Settings — `/vendor/dashboard/settings` ✅

| Section | Description |
|---|---|
| Store Profile | Store name, description, logo, banner (Supabase Storage) |
| Contact Details | Phone, email, address |
| Bank Details | Account info (AES-256-GCM encrypted at rest) |
| Password Change | Via Supabase Auth |

---

## 4. Admin Dashboard

**Base route:** `/admin/dashboard`  
**Auth:** Required (role: `admin`)  
**Layout:** Full-width sidebar + main content area

### 4.1 Dashboard Home — `/admin/dashboard` ✅

| Widget | Description |
|---|---|
| Total Users | Registered customer count |
| Total Vendors | Active vendor count |
| Total Revenue | Platform-wide order value |
| Platform Commission | Total commission earned |
| Recent Orders | Latest orders across all vendors |
| Recent Applications | Latest vendor registration requests |
| Revenue Chart | Last 30 days revenue graph |
| Top Vendors | By sales volume |

---

### 4.2 Vendor Applications — `/admin/dashboard/applications` ✅

| Section | Description |
|---|---|
| Applications Table | Vendor name, store name, date, status |
| Status Filter | Pending, Approved, Rejected, Suspended |
| View Details | Full application: store info, contact, bank details |
| Approve | Sets vendor status → `approved` + notifies via email |
| Reject | Sets vendor status → `rejected` + notifies via email |
| Suspend | Sets vendor status → `suspended` |
| Delete | Remove application record |

---

### 4.3 Vendor Management — `/admin/dashboard/vendors` ✅

| Section | Description |
|---|---|
| Vendors Table | Logo, store name, rating, product count, status, actions |
| View Profile | Link to vendor's public profile |
| Suspend/Activate | Toggle vendor status |
| Edit Commission | Set vendor-specific commission rate |
| Search/Filter | By name, status, date registered |

---

### 4.4 Customer Management — `/admin/dashboard/customers` ✅

| Section | Description |
|---|---|
| Customer Table | Name, email, orders count, joined date, status |
| View Orders | Customer's full order history |
| Ban/Activate | Toggle customer account status |
| Search | By name or email |

---

### 4.5 Order Management — `/admin/dashboard/orders` ✅

| Section | Description |
|---|---|
| Orders Table | Order ID, customer, vendor(s), total, status, date |
| Status Override | Admin can set any status |
| Filter | By status, vendor, date range |
| Order Detail | Full breakdown: items, shipping address, commission |

---

### 4.6 Platform Earnings — `/admin/dashboard/earnings` ✅

| Section | Description |
|---|---|
| Earnings Summary | Total gross sales, total commission, net payouts |
| Commission Breakdown | Per-vendor commission log |
| Withdrawal Queue | Pending withdrawal requests |
| Approve Withdrawal | Confirm + notify vendor via email |
| Reject Withdrawal | Reject + notify vendor via email |
| Withdrawal History | All historical payouts |

---

### 4.7 Deals Management — `/admin/dashboard/deals` ✅

| Section | Description |
|---|---|
| Stats Bar | Total deals, Active, Upcoming, Units sold platform-wide |
| Status Filter | All / Active / Upcoming / Expired |
| Source Filter | All Sources / Platform (admin-created) / Vendors |
| Deals Table | Title, product, vendor, source badge, discount, deal price, validity, status, sold |
| Create Platform Deal | Modal: any product + any vendor, discount type, value, dates, live price preview |
| Edit Any Deal | Admin can edit any deal regardless of creator |
| Delete Any Deal | Confirm dialog, admin can remove any deal |

---

### 4.8 Notifications — `/admin/dashboard/notifications` ✅

| Section | Description |
|---|---|
| Notification Feed | Vendor registrations, withdrawal requests, system alerts |
| Mark as Read | Single / bulk |

---

### 4.8 Settings — `/admin/dashboard/settings` ✅

| Section | Description |
|---|---|
| Commission Settings | Global commission rate (%) |
| Category Management | Add, edit, delete categories |
| Shipping Settings | Flat rate or city-based options |
| Platform Info | Site name, contact email, currency |
| Maintenance Mode | Toggle platform offline |

---

## 5. Planned Screens (Phase 2) 🔲

| Screen | Route | Notes |
|---|---|---|
| Payment Success/Fail | `/checkout/success` | After online payment integration |
| Vendor Registration Form | `/vendor/register` | Separate vendor onboarding flow |
| Advanced Analytics | `/admin/dashboard/analytics` | Charts, exports |
| Chat | `/dashboard/messages` | Vendor–customer messaging |
| Push Notification Settings | `/dashboard/settings/notifications` | Mobile push |
