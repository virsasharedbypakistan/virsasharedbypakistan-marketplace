# Virsa Marketplace 🛍️

A modern Pakistani e-commerce marketplace built with **Next.js 16**, **React 19**, and **Tailwind CSS 4**. Virsa connects customers with local vendors selling authentic Pakistani crafts, textiles, and goods.

---

## ✨ Features

### 🛒 Customer Portal (`/`)
- **Homepage** — Hero banner, category grid, featured products, vendor showcase, deals section
- **Shop / Product Listing** — Grid browse with filter sidebar
- **Product Detail** — Image gallery, reviews, add-to-cart & wishlist
- **Vendor Stores** — Public storefront for each vendor (`/vendor/[id]`)
- **Cart & Checkout** — Multi-step checkout flow
- **Daily Deals** — Time-sensitive offers
- **Wishlist & Contact** pages

### 🧑‍💼 Customer Dashboard (`/dashboard`)
| Page | Features |
|------|----------|
| Overview | Stats cards, recent orders with real product images, Buy Again & Write Review modals |
| My Orders | Order details modal, package tracking modal, write review modal with star rating, search & filter |
| Wishlist | Add to cart with toast, delete confirmation modal, out-of-stock overlay |
| My Reviews | Edit review modal, delete confirmation, live search, ⋮ dropdown menu |
| Account Settings | Profile form, password update with validation, full address CRUD (add/edit/delete/set-default) |

### 🏪 Vendor Dashboard (`/vendor/dashboard`)
| Page | Features |
|------|----------|
| Overview | KPI stats, revenue chart, new orders queue with Ship confirmation modal + real product images |
| Products | Table with real images, Add/Edit/Delete modals, image picker, show/hide toggle, live search |
| Orders | Tab filtering by status, Update Status modal, Order Details modal, live search |
| Earnings | COD settlement history, earnings breakdown, revenue summary cards |
| Settings | 4-tab settings: Store Profile, Payout Details, Notification toggles, Security (password) |

### 🔐 Admin Dashboard (`/admin/dashboard`)
| Page | Features |
|------|----------|
| Overview | Platform KPIs, revenue/commission chart, vendor approval queue with real logos, Approve/Reject/Review-Docs modals |
| Vendors | Real vendor images, Approve/Reject for pending, Suspend/Reactivate/Delete modal, view details, live search |
| Customers | View/Ban/Unban/Delete via dropdown, customer detail modal, live search, success toasts |
| Orders | Status update modal (all statuses), order detail modal, search + status filter |
| Earnings | Platform revenue, commission breakdown, vendor payout tracking |

---

## 🗂️ Project Structure

```
virsasharedbypakistan/
├── app/
│   ├── page.tsx                    # Homepage
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles
│   ├── dashboard/                  # Customer dashboard
│   │   ├── page.tsx                # Overview
│   │   ├── orders/
│   │   ├── wishlist/
│   │   ├── reviews/
│   │   └── settings/
│   ├── vendor/
│   │   ├── [id]/                   # Public vendor store
│   │   └── dashboard/              # Vendor portal
│   │       ├── page.tsx
│   │       ├── products/
│   │       ├── orders/
│   │       ├── earnings/
│   │       └── settings/
│   ├── admin/
│   │   └── dashboard/              # Admin portal
│   │       ├── page.tsx
│   │       ├── vendors/
│   │       ├── customers/
│   │       ├── orders/
│   │       └── earnings/
│   ├── product/[id]/               # Product detail
│   ├── products/                   # Product listing
│   ├── vendors/                    # Vendor listing
│   ├── cart/
│   ├── checkout/
│   ├── wishlist/
│   ├── deals/
│   ├── contact/
│   └── login/
├── components/
│   ├── Providers.tsx               # Context providers wrapper
│   └── layout/                     # Shared layout components
├── contexts/
│   ├── CartContext.tsx             # Global cart state
│   └── WishlistContext.tsx         # Global wishlist state
├── public/
│   ├── virsa-logo.png
│   └── images/
│       ├── products/               # product1.jpg, product2.jpg
│       └── vendors/                # vendor1.png, vendor3.jpg
└── doc/                            # Project documentation
```

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org) | 16.1.6 | React framework (App Router) |
| [React](https://react.dev) | 19.2.3 | UI library |
| [TypeScript](https://www.typescriptlang.org) | ^5 | Type safety |
| [Tailwind CSS](https://tailwindcss.com) | ^4 | Utility-first styling |
| [Lucide React](https://lucide.dev) | ^0.575 | Icon library |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm / yarn / pnpm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd virsasharedbypakistan

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Other Scripts

```bash
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 🔗 Key Routes

| Route | Description |
|-------|-------------|
| `/` | Customer homepage |
| `/shop` | Browse all products |
| `/vendor/[id]` | Public vendor storefront |
| `/dashboard` | Customer account overview |
| `/dashboard/orders` | Customer order history |
| `/dashboard/wishlist` | Saved items |
| `/dashboard/reviews` | My reviews |
| `/dashboard/settings` | Account settings |
| `/vendor/dashboard` | Vendor portal home |
| `/vendor/dashboard/products` | Vendor product management |
| `/vendor/dashboard/orders` | Vendor order management |
| `/vendor/dashboard/earnings` | Vendor earnings & payouts |
| `/vendor/dashboard/settings` | Vendor store settings |
| `/admin/dashboard` | Admin overview |
| `/admin/dashboard/vendors` | Vendor management |
| `/admin/dashboard/customers` | Customer management |
| `/admin/dashboard/orders` | Global order management |
| `/login` | Authentication page |

---

## 📝 Notes

- All dashboard CRUD operations are currently **UI-only** (no backend). State is managed locally with React `useState`.
- Product and vendor images are served from `public/images/`.
- Cart and wishlist state is managed globally via React Context (`CartContext`, `WishlistContext`).
- The app uses Next.js **App Router** with `"use client"` directives for interactive pages.
