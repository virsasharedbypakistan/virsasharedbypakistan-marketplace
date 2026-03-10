# Virsa Multi-Vendor Marketplace

A complete multi-vendor e-commerce platform built with Next.js 16 and Supabase.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Verify all connections
npm run verify

# 3. Seed sample data
npm run seed

# 4. Start development
npm run dev
```

Visit: http://localhost:3000

## 📋 Prerequisites

- Node.js 18+
- `.env.local` configured (see `.env.example`)
- Supabase projects (Primary + Backup)
- Upstash Redis account
- Resend email account

## 🗄️ Database Architecture

### Supabase (PostgreSQL) - 18 Tables
All application data including:
- Core: users, products, orders, vendors
- Financial: commissions, withdrawals, earnings, audit logs

### Redis (Upstash)
Rate limiting and caching

## 🔑 Test Accounts

After running `npm run seed`, demo accounts are created. Check the console output for credentials or contact your administrator.

## 📦 Available Scripts

```bash
npm run verify          # Verify complete setup
npm run test:connections # Test all database connections
npm run seed            # Seed sample data
npm run dev             # Start development server
```

## 🏗️ Project Structure

```
virsasharedbypakistan/
├── app/
│   ├── api/              # 65 API endpoints
│   ├── admin/            # Admin dashboard
│   ├── vendor/           # Vendor dashboard
│   └── dashboard/        # Customer dashboard
├── lib/
│   ├── supabase.ts       # Supabase client
│   ├── prisma.ts         # Prisma client
│   └── email.ts          # Email service
├── prisma/
│   └── schema.prisma     # MySQL schema
├── scripts/
│   ├── verify-setup.js   # Setup verification
│   ├── seed.js           # Database seeding
│   └── setup-prisma.js   # Prisma setup
└── doc/                  # Detailed documentation
    ├── prd.md            # Product requirements
    ├── trd.md            # Technical design
    ├── database-spec.md  # Database schema
    └── api-structure.md  # API documentation
```

## 📚 Documentation

Detailed specifications in `/doc`:
- **prd.md** - Product Requirements Document
- **trd.md** - Technical Requirements Document
- **database-spec.md** - Complete database schema
- **api-structure.md** - API endpoint documentation
- **ui-screens.md** - UI/UX specifications

## 🔧 Setup Steps

### 1. Environment Configuration

Copy `.env.example` to `.env.local` and configure:
- Supabase URLs and keys (Primary + Backup)
- MySQL connection string
- Upstash Redis credentials
- Resend API key

### 2. Verify Connections

```bash
npm run verify
```

This checks:
- ✓ Supabase Primary connection
- ✓ Supabase Backup connection
- ✓ MySQL connection
- ✓ Redis connection
- ✓ Email API connection
- ✓ Prisma migrations
- ✓ Sample data

### 3. Setup Databases

```bash
# Setup MySQL and seed all data
npm run db:setup
```

This will:
1. Generate Prisma client
2. Run MySQL migrations
3. Create 4 MySQL tables
4. Seed Supabase with sample data
5. Replicate to backup database

### 4. Start Development

```bash
npm run dev
```

## 🌐 API Endpoints

### Public
- `GET /api/health` - Health check
- `GET /api/categories` - List categories
- `GET /api/products` - List products
- `GET /api/vendors` - List vendors

### Authentication
- `POST /api/auth/register` - Customer signup
- `POST /api/auth/login` - User login
- `POST /api/auth/vendor-register` - Vendor application

### Customer
- `GET /api/cart` - Shopping cart
- `POST /api/orders` - Create order
- `GET /api/wishlist` - Wishlist

### Vendor
- `GET /api/vendor/orders` - Vendor orders
- `GET /api/vendor/earnings` - Earnings dashboard
- `POST /api/withdrawals` - Request withdrawal

### Admin
- `GET /api/admin/stats` - Dashboard KPIs
- `GET /api/admin/vendors` - Manage vendors
- `GET /api/admin/withdrawals` - Withdrawal queue

See `/doc/api-structure.md` for complete API documentation.

## 🔒 Security Features

- Row-Level Security (RLS) on all Supabase tables
- Rate limiting (10 req/10s per user)
- Input validation with Zod
- JWT authentication
- Encrypted sensitive data
- SQL injection prevention

## 🧪 Testing

```bash
# Test all connections
npm run test:connections

# Verify complete setup
npm run verify

# View MySQL data
npm run prisma:studio
```

## 🚀 Deployment

1. Push to GitHub
2. Deploy to Vercel
3. Configure environment variables
4. Run migrations on production databases
5. Seed initial data

## 📊 Features

- ✅ Multi-vendor marketplace
- ✅ Product catalog with categories
- ✅ Shopping cart & wishlist
- ✅ Order management (COD)
- ✅ Vendor earnings & withdrawals
- ✅ Admin dashboard
- ✅ Email notifications
- ✅ Product reviews
- ✅ Deals & promotions
- ✅ Backup database replication

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL), MySQL
- **Cache**: Upstash Redis
- **Email**: Resend
- **ORM**: Prisma
- **Auth**: Supabase Auth

## 📞 Support

For detailed documentation, see `/doc` folder.

## 📄 License

Private - All rights reserved
