# Security & Backup Specification Document

# Virsa Multi-Vendor Marketplace Platform

**Version:** 1.1  
**Date:** 2026-03-04  
**Status:** Final — Ready for Backend Implementation

---

## 1. Overview

This document defines the complete **security architecture** and **backup & recovery strategy** for the Virsa Multi-Vendor Marketplace Platform. It covers authentication hardening, API protection, database-level security, data encryption, and — critically — a **dual Supabase project strategy** where one project serves as the live primary database and a second dedicated project serves as the hot backup for high availability and scalability.

---

## 2. Security Architecture Layers

The system is secured across 5 layers:

```
┌──────────────────────────────────────────┐
│  Layer 5: Application Security           │  Input validation, CSRF, XSS
├──────────────────────────────────────────┤
│  Layer 4: API Security                   │  Auth tokens, rate limiting, CORS
├──────────────────────────────────────────┤
│  Layer 3: Database Security              │  RLS, parameterized queries, encryption
├──────────────────────────────────────────┤
│  Layer 2: Infrastructure Security        │  HTTPS, firewall, VPC, secrets vault
├──────────────────────────────────────────┤
│  Layer 1: Network Security               │  DDoS protection, CDN edge rules
└──────────────────────────────────────────┘
```

---

## 3. Authentication Security

### 3.1 Supabase Auth Configuration

Supabase Auth is the primary identity provider. The following configuration must be enforced:

| Setting | Value | Reason |
|---|---|---|
| JWT expiry | `3600` seconds (1 hour) | Short-lived tokens reduce attack window |
| Refresh token rotation | Enabled | Invalidates reused refresh tokens |
| Refresh token reuse interval | `0` seconds | Immediate rotation |
| Email confirmation | Required | Verified users only |
| Leaked password protection | Enabled | HaveIBeenPwned API integration |
| OTP expiry | `600` seconds | 10-minute limit |
| Max login attempts | `5` per 15 minutes | Brute-force protection |

### 3.2 Password Policy

All user-created passwords must:

- Be a minimum of **8 characters**
- Contain at least **1 uppercase letter**
- Contain at least **1 number**
- Contain at least **1 special character** (`!@#$%^&*`)
- Not match the user's email address
- Not be a commonly known password (HaveIBeenPwned check)

Enforcement: At API layer using **Zod validation schema**.

```typescript
// Example Zod schema for password
const passwordSchema = z.string()
  .min(8, 'Minimum 8 characters')
  .regex(/[A-Z]/, 'Must contain uppercase')
  .regex(/[0-9]/, 'Must contain number')
  .regex(/[^A-Za-z0-9]/, 'Must contain special character');
```

### 3.3 JWT Token Security

| Property | Value |
|---|---|
| Algorithm | `HS256` (Supabase default) |
| Token storage | `httpOnly` secure cookies (SSR) |
| Token transmission | Bearer header only — never in URL |
| Token validation | Server-side on every API request |
| Refresh on suspicious activity | Forced logout + token invalidation |

### 3.4 Role-Based Access Control (RBAC)

Every API route enforces role validation at two points:

1. **Middleware** (`middleware.ts`) — Route-level protection  
2. **API handler** — Business logic-level role check

```
Route: /api/admin/*   → requires role = 'admin'
Route: /api/vendor/*  → requires role = 'vendor' AND approval_status = 'approved'
Route: /api/orders/*  → requires role = 'customer' | 'vendor' | 'admin'
Route: /api/products  → GET is public; POST requires role = 'vendor'
```

### 3.5 Session Management

| Rule | Implementation |
|---|---|
| Auto logout on inactivity | After 30 minutes (client-side timer) |
| Concurrent session limit | Max 3 active sessions per user |
| Logout from all devices | Option available in user profile settings |
| Admin sessions | Max 1 active session; forced re-auth after 8 hours |

---

## 4. API Security

### 4.1 Rate Limiting

Rate limiting is applied per IP address and per authenticated user token.

| Endpoint Group | Limit | Window | Action |
|---|---|---|---|
| `POST /api/auth/login` | 5 requests | 15 minutes | Lockout + CAPTCHA |
| `POST /api/auth/register` | 3 requests | 1 hour | Reject + log |
| `POST /api/auth/reset` | 3 requests | 1 hour | Reject |
| `POST /api/orders` | 10 requests | 1 minute | Throttle |
| All other `POST` endpoints | 60 requests | 1 minute | Throttle |
| All `GET` endpoints | 300 requests | 1 minute | Throttle |
| Admin endpoints | 200 requests | 1 minute | Throttle |

**Implementation:** `upstash/ratelimit` package with Redis (Upstash Redis free tier).

```typescript
// lib/ratelimit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const loginRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.fixedWindow(5, '15 m'),
  prefix: 'auth:login',
});
```

### 4.2 Input Validation

Every API route validates incoming data using **Zod** before executing business logic.

```typescript
// Validate before processing — never trust client input
const schema = z.object({
  name: z.string().min(1).max(255).trim(),
  price: z.number().positive().max(9999999),
  quantity: z.number().int().positive().max(1000),
});

const parsed = schema.safeParse(req.body);
if (!parsed.success) {
  return res.status(400).json({ error: parsed.error.flatten() });
}
```

**Rules:**
- All strings are `.trim()`-ed before use
- All numbers are validated for range
- UUIDs are validated using `z.string().uuid()`
- Enum values are validated against allowed lists
- File uploads validated for MIME type and size at API layer

### 4.3 CORS Configuration

```typescript
// next.config.ts
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'https://virsasharedbypakistan.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};
```

- CORS `Allow-Origin` is set to the **production domain only** — no wildcard `*`
- Preflight (`OPTIONS`) is handled explicitly
- Development environment uses `localhost:3000` only

### 4.4 CSRF Protection

Next.js API Routes with cookie-based auth are protected via:

- `SameSite=Strict` cookie attribute on all auth cookies
- Custom `X-Requested-With: XMLHttpRequest` header requirement on state-mutating endpoints
- Double-submit cookie pattern for form submissions

### 4.5 HTTP Security Headers

Applied via Next.js `middleware.ts` on all routes:

| Header | Value |
|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `Content-Security-Policy` | `default-src 'self'; img-src 'self' data: https:; ...` |
| `X-XSS-Protection` | `1; mode=block` |

### 4.6 SQL Injection Prevention

All database queries go through:

1. **Supabase SDK** — Uses PostgREST parameterized queries (no raw SQL exposure)
2. **Prisma ORM** — Parameterized queries by default for MySQL
3. **No raw string concatenation** in any query — Enforced by code review policy

```typescript
// ✅ Safe — parameterized
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('vendor_id', vendorId);   // vendorId is bound as parameter

// ❌ Never — string interpolation
await supabase.rpc(`SELECT * FROM products WHERE id = '${id}'`);
```

### 4.7 XSS Prevention

- All user-submitted content is **sanitized before storage** using `DOMPurify` (server-side via jsdom)
- Product descriptions (rich text) are sanitized with an **allowlist** of safe HTML tags only
- React's JSX auto-escapes string values — no use of `dangerouslySetInnerHTML` without sanitization

```typescript
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const { window } = new JSDOM('');
const DOMPurify = createDOMPurify(window as any);

const safeHtml = DOMPurify.sanitize(userInput, {
  ALLOWED_TAGS: ['b', 'i', 'u', 'p', 'br', 'ul', 'li', 'strong', 'em'],
});
```

---

## 5. Database Security

### 5.1 Supabase Row-Level Security (RLS)

RLS is **enabled on every table** in the Supabase public schema. No direct table access is permitted without an active authenticated session.

**Policy implementation pattern:**
```sql
-- Enable RLS on table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE products FORCE ROW LEVEL SECURITY;

-- Public read for active products
CREATE POLICY "Public can view active products"
ON products FOR SELECT
USING (status = 'active');

-- Vendor can manage only their own products
CREATE POLICY "Vendor manages own products"
ON products FOR ALL
USING (
  vendor_id IN (
    SELECT id FROM vendors WHERE user_id = auth.uid()
  )
);

-- Admin has full access
CREATE POLICY "Admin full access"
ON products FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

**Critical RLS rules:**
- `anon` (unauthenticated) role can **only SELECT** public product/category/vendor data
- `authenticated` role enforces user-specific data isolation
- Service role key is **never exposed to the client** — only used server-side in API routes

### 5.2 Supabase Service Role Key Protection

```
❌ Never use in client-side code (components, pages, hooks)
✅ Only used in:
   - Next.js API Routes (server-side)
   - Background jobs
   - Admin operations
```

```typescript
// lib/supabaseAdmin.ts — only imported by API routes
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,  // server-only
);
```

### 5.3 Database User Privileges (MySQL)

Separate MySQL users are created with minimum required privileges:

| User | Privileges | Purpose |
|---|---|---|
| `virsa_app` | SELECT, INSERT on `commission_logs` | Application writes commission logs |
| `virsa_withdraw` | SELECT, INSERT, UPDATE on `withdrawal_requests` | Withdrawal workflow |
| `virsa_analytics` | SELECT on all tables | Analytics dashboards |
| `virsa_admin` | FULL on all tables | Migrations, admin ops (not application user) |
| `virsa_backup` | SELECT, LOCK TABLES | Backup agent only |

```sql
-- Example: minimum privilege app user
CREATE USER 'virsa_app'@'%' IDENTIFIED BY '<strong_password>';
GRANT SELECT, INSERT ON virsa_financial.commission_logs TO 'virsa_app'@'%';
GRANT SELECT, INSERT, UPDATE ON virsa_financial.withdrawal_requests TO 'virsa_app'@'%';
FLUSH PRIVILEGES;
```

### 5.4 Data Encryption

| Data Type | Encryption Method |
|---|---|
| Passwords | Supabase Auth (bcrypt, managed) |
| JWT secrets | AES-256 (Supabase managed) |
| Database connections | TLS 1.3 in transit |
| MySQL data at rest | AES-256 (cloud provider managed) |
| Supabase data at rest | AES-256 (Supabase managed) |
| Vendor bank details | Additional application-level encryption using `AES-256-GCM` before storage |
| ID documents | Supabase private bucket (no public URL) |
| Environment variables | Vercel encrypted secrets vault |

**Vendor bank detail encryption:**
```typescript
// lib/encryption.ts
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'); // 32-byte key

export function encryptSensitive(plaintext: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptSensitive(ciphertext: string): string {
  const [ivHex, tagHex, encryptedHex] = ciphertext.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(tag);
  return decipher.update(encrypted) + decipher.final('utf8');
}
```

### 5.5 Sensitive Data Masking

Sensitive fields are **never returned in API responses** unless explicitly required:

| Field | Masking Rule |
|---|---|
| `password_hash` | Never returned (excluded from all SELECT queries) |
| `account_number` | Returned as `****1234` (last 4 digits only) |
| `jazzcash_number` | Returned as `03XX-XXX-9999` |
| `ip_address` | Only accessible by admin |
| `id_document_url` | Signed URL with 15-minute expiry |
| `supabase_service_key` | Never in any response |

---

## 6. File Upload Security

### 6.1 Upload Validation Rules

| Check | Rule |
|---|---|
| File type | Allowlist: `image/jpeg`, `image/png`, `image/webp` only |
| File size | Max 5 MB per file |
| File name | Sanitized, UUID-renamed on upload |
| Extension spoofing | Check MIME type via magic bytes, not just extension |
| Virus scanning | ClamAV (optional Phase 2) |

### 6.2 Supabase Storage Policies

```sql
-- product-images bucket: vendor can upload to own folder only
CREATE POLICY "Vendor uploads own product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- id-documents bucket: private, admin-only read
CREATE POLICY "Admin reads ID documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'id-documents'
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

### 6.3 Signed URL Generation

Private documents (ID files) are accessed via **time-limited signed URLs**:

```typescript
const { data } = await supabaseAdmin.storage
  .from('id-documents')
  .createSignedUrl(filePath, 900); // 15 minutes
```

---

## 7. Environment Variables & Secrets Management

### 7.1 Required Environment Variables

```env
# ─── SUPABASE PRIMARY (active project — live traffic) ─────
NEXT_PUBLIC_SUPABASE_URL=https://[PRIMARY-ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...primary_anon...    # Public OK
SUPABASE_SERVICE_ROLE_KEY=eyJ...primary_service...     # SERVER ONLY
SUPABASE_PRIMARY_DB_URL=postgresql://postgres:pass@db.[PRIMARY-ID].supabase.co:5432/postgres

# ─── SUPABASE BACKUP (standby project — failover ready) ───
SUPABASE_BACKUP_URL=https://[BACKUP-ID].supabase.co   # SERVER ONLY
SUPABASE_BACKUP_ANON_KEY=eyJ...backup_anon...         # SERVER ONLY
SUPABASE_BACKUP_SERVICE_ROLE_KEY=eyJ...backup_svc...  # SERVER ONLY
SUPABASE_BACKUP_DB_HOST=db.[BACKUP-ID].supabase.co    # SERVER ONLY
SUPABASE_BACKUP_DB_PASSWORD=<backup_db_password>      # SERVER ONLY

# ─── MySQL (Prisma) ───────────────────────────────────────
DATABASE_URL=mysql://virsa_app:password@host:3306/virsa_financial

# ─── Encryption ───────────────────────────────────────────
ENCRYPTION_KEY=<64-char hex string - 32 bytes>        # SERVER ONLY

# ─── Email (Resend / SendGrid) ────────────────────────────
RESEND_API_KEY=re_xxxxxxxxxxxx                         # SERVER ONLY

# ─── Rate Limiting (Upstash Redis) ────────────────────────
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...                           # SERVER ONLY

# ─── App ──────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=https://virsasharedbypakistan.com
ALLOWED_ORIGIN=https://virsasharedbypakistan.com
NODE_ENV=production
```

### 7.2 Secrets Classification

| Prefix | Visibility | Storage |
|---|---|---|
| `NEXT_PUBLIC_` | Public (client + server) | Vercel environment variables |
| *(no prefix)* | **Server only** | Vercel encrypted secrets |
| `ENCRYPTION_KEY` | Server only | Vercel encrypted secrets (rotate every 6 months) |

### 7.3 Secret Rotation Policy

| Secret | Rotation Frequency |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Every 90 days |
| `ENCRYPTION_KEY` | Every 180 days |
| `DATABASE_URL` password | Every 90 days |
| `RESEND_API_KEY` | On compromise or 180 days |
| MySQL user passwords | Every 90 days |

---

## 8. Backup Strategy — Dual Supabase Project Architecture

### 8.0 Strategy Overview

The Virsa platform uses **two separate Supabase projects** as the database backbone:

| Role | Project Name | Region | Purpose |
|---|---|---|---|
| **Primary (MAIN)** | `virsasharedbypakistan's Project` | `ap-south-1` (Mumbai) | Live production traffic, all reads/writes |
| **Backup (STANDBY)** | `virsa-backup` | `ap-southeast-1` (Singapore) | Continuous replica, failover target |

```
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                         │
│              Next.js API Routes (Vercel)                    │
└──────────────────────┬──────────────────────────────────────┘
                       │  All reads + writes
                       ▼
┌─────────────────────────────────────────────────────────────┐
│            PRIMARY SUPABASE PROJECT                         │
│            virsa-primary (Mumbai)                           │
│            ● All tables (live data)                         │
│            ● Supabase Auth (canonical)                      │
│            ● Supabase Storage (canonical)                   │
└──────────────────────┬──────────────────────────────────────┘
                       │  Continuous replication
                       │  (pg_dump → restore  OR  logical replication)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│            BACKUP SUPABASE PROJECT                          │
│            virsa-backup (Singapore)                         │
│            ● Full schema replica (read-only in normal ops)  │
│            ● Promoted to PRIMARY on failover                │
│            ● Supabase Storage mirror (rclone sync)          │
└─────────────────────────────────────────────────────────────┘
```

**Key design decisions:**
- The backup project is in a **different geographic region** (Singapore vs Mumbai) for true disaster isolation
- In normal operation, the backup project is **read-only** — no writes go to it directly
- In a failover event, the backup is **promoted to primary** by updating a single environment variable
- Schema changes (migrations) are **applied to both projects** simultaneously during each deployment

---

### 8.1 Supabase Primary Project Setup

#### Automatic Backups (Supabase Managed — Primary Project)

| Plan | Backup Frequency | Retention | Point-in-Time Recovery |
|---|---|---|---|
| Pro Plan | Daily | 7 days | ✅ Up to 7 days |
| Team/Enterprise | Daily | 28 days | ✅ Up to 28 days |

**Requirement:** Both projects (Primary + Backup) must be on **Supabase Pro Plan** minimum.

#### Supabase Client Setup (Primary)

```typescript
// lib/supabase.ts — used by all API routes for live traffic
import { createClient } from '@supabase/supabase-js';

// Primary (main) project — all production reads/writes
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,        // https://ahdxjvdodferniaqjqbc.supabase.co
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// Admin client — server-side only, used in API routes
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,        // https://ahdxjvdodferniaqjqbc.supabase.co
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
```

---

### 8.2 Backup Project — Continuous Replication

#### Replication Method: Scheduled pg_dump → pg_restore

Every **4 hours**, the primary database is dumped and restored to the backup project. This gives a maximum data gap (RPO) of 4 hours.

```bash
#!/bin/bash
# scripts/replicate-to-backup.sh
# Runs every 4 hours via GitHub Actions cron job

set -e

DATE=$(date +%Y-%m-%d_%H-%M)
DUMP_FILE="virsa_replica_$DATE.dump"

echo "[$(date)] Starting replication to backup project..."

# Step 1: Dump from PRIMARY Supabase project (ahdxjvdodferniaqjqbc)
pg_dump "$SUPABASE_PRIMARY_DB_URL" \
  --no-password \
  --format=custom \
  --compress=6 \
  --exclude-table=auth.* \
  --schema=public \
  --file="$DUMP_FILE"

echo "[$(date)] Dump complete: $(du -sh $DUMP_FILE)"

# Step 2: Drop + restore to BACKUP Supabase project (ubeawvyleowhgwndggbe)
# (only public schema — auth is managed separately)
pg_restore \
  --host="$SUPABASE_BACKUP_DB_HOST" \
  --port=5432 \
  --username=postgres \
  --dbname=postgres \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  "$DUMP_FILE"

# Step 3: Cleanup
rm "$DUMP_FILE"

echo "[$(date)] Replication complete."
```

#### Replication Schedule (GitHub Actions Cron)

```yaml
# .github/workflows/db-replication.yml
name: Database Replication — Primary to Backup

on:
  schedule:
    - cron: '0 */4 * * *'   # Every 4 hours
  workflow_dispatch:          # Manual trigger for emergency sync

jobs:
  replicate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install PostgreSQL client
        run: sudo apt-get install -y postgresql-client

      - name: Run replication script
        env:
          SUPABASE_PRIMARY_DB_URL: ${{ secrets.SUPABASE_PRIMARY_DB_URL }}
          SUPABASE_BACKUP_DB_HOST: ${{ secrets.SUPABASE_BACKUP_DB_HOST }}
          PGPASSWORD: ${{ secrets.SUPABASE_BACKUP_DB_PASSWORD }}
        run: bash scripts/replicate-to-backup.sh

      - name: Notify on failure
        if: failure()
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK_URL }} \
            -d '{"text": "🚨 DB Replication FAILED — check GitHub Actions!"}'
```

#### Replication Schedule Summary

| Job | Frequency | RPO | Notes |
|---|---|---|---|
| Full schema sync | Every 4 hours | 4 hours | Main replication job |
| Full schema sync | Daily at 02:00 AM PKT | — | Extra daily run |
| Pre-migration sync | Before every deployment | — | Manual trigger |
| Storage sync | Every 6 hours | 6 hours | Images sync via rclone |

---

### 8.3 Backup Project — Supabase Storage Mirror

Product images and vendor assets stored in the primary Supabase Storage are mirrored to the backup project every 6 hours:

```bash
#!/bin/bash
# scripts/sync-storage.sh

# Sync all storage buckets from Primary → Backup using rclone
BUCKETS=("product-images" "vendor-assets" "review-images" "user-avatars" "category-images")

for BUCKET in "${BUCKETS[@]}"; do
  echo "Syncing bucket: $BUCKET"
  rclone sync \
    supabase-primary:"$BUCKET" \
    supabase-backup:"$BUCKET" \
    --transfers=20 \
    --checkers=10 \
    --log-file=/var/log/virsa-storage-sync.log
done

echo "Storage sync complete."
```

---

### 8.4 Environment Variable — Failover Switch

The active Supabase project is controlled by a **single environment variable**. Switching from primary to backup requires only updating this variable in Vercel — no code change needed.

```env
# ─── PRIMARY (normal operation) ──────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://ahdxjvdodferniaqjqbc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...primary_anon_key...
SUPABASE_SERVICE_ROLE_KEY=eyJ...primary_service_key...
SUPABASE_PRIMARY_DB_URL=postgresql://postgres:[pass]@db.ahdxjvdodferniaqjqbc.supabase.co:5432/postgres

# ─── BACKUP PROJECT (kept in Vercel secrets — not active) ────
SUPABASE_BACKUP_URL=https://ubeawvyleowhgwndggbe.supabase.co
SUPABASE_BACKUP_ANON_KEY=eyJ...backup_anon_key...
SUPABASE_BACKUP_SERVICE_ROLE_KEY=eyJ...backup_service_key...
SUPABASE_BACKUP_DB_HOST=db.ubeawvyleowhgwndggbe.supabase.co
SUPABASE_BACKUP_DB_PASSWORD=<backup_db_password>
```

**On failover:** Swap `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to use the backup project values, then trigger a Vercel redeploy.

---

### 8.5 Additional S3 File Backups (pg_dump Archive)

In addition to the live backup project, `pg_dump` snapshots are archived to AWS S3:

```bash
#!/bin/bash
# scripts/backup-to-s3.sh — runs daily at 02:00 AM PKT

DATE=$(date +%Y-%m-%d)
BACKUP_FILE="virsa_primary_$DATE.dump.gz"
S3_BUCKET="s3://virsa-backups/supabase/daily/"

pg_dump "$SUPABASE_PRIMARY_DB_URL" \
  --format=custom \
  --compress=9 \
  --file="$BACKUP_FILE"

aws s3 cp "$BACKUP_FILE" "$S3_BUCKET$BACKUP_FILE" \
  --storage-class STANDARD_IA

rm "$BACKUP_FILE"
echo "S3 archive backup complete: $BACKUP_FILE"
```

**S3 Archive Retention:**
```
AWS S3 Bucket: virsa-backups
├── supabase/
│   ├── daily/          ← 30-day retention (auto-expire)
│   ├── pre-migration/  ← Permanent
│   └── manual/         ← On-demand snapshots
├── mysql/
│   ├── daily/          ← 30-day retention
│   ├── weekly/         ← 90-day retention
│   └── monthly/        ← 1-year retention (Glacier after 90d)
└── media/
    └── storage-mirror/ ← Weekly full snapshot of all buckets
```

---

### 8.6 MySQL (Financial DB) Backup

```bash
#!/bin/bash
# scripts/backup-mysql.sh

DATE=$(date +%Y-%m-%d)
BACKUP_FILE="virsa_financial_$DATE.sql.gz"
S3_BUCKET="s3://virsa-backups/mysql/daily/"

mysqldump \
  --host="srv1491.hstgr.io" \
  --user="u450707463_virsapakistan" \
  --password="$MYSQL_BACKUP_PASSWORD" \
  --single-transaction \
  --routines --triggers --events \
  --databases u450707463_virsapakistan \
  | gzip -9 > "$BACKUP_FILE"

# Encrypt before upload
openssl enc -aes-256-cbc \
  -in "$BACKUP_FILE" \
  -out "$BACKUP_FILE.enc" \
  -k "$BACKUP_ENCRYPTION_KEY"

aws s3 cp "$BACKUP_FILE.enc" "$S3_BUCKET$BACKUP_FILE.enc"

rm "$BACKUP_FILE" "$BACKUP_FILE.enc"
echo "MySQL backup complete."
```

| Backup Type | Frequency | Retention |
|---|---|---|
| Full mysqldump | Daily at 01:00 AM PKT | 30 days |
| Weekly dump | Sunday 00:00 AM PKT | 90 days |
| Monthly dump | 1st of month | 1 year (Glacier) |

---

## 9. Disaster Recovery Plan

### 9.1 Recovery Time Objectives (RTO)

| Scenario | RTO Target | RPO Target |
|---|---|---|
| API downtime (Vercel) | < 5 minutes | 0 (stateless) |
| Supabase region outage | < 1 hour | < 24 hours |
| Accidental data deletion | < 2 hours | < 24 hours |
| Full database corruption | < 4 hours | < 24 hours |
| Complete infrastructure failure | < 8 hours | < 24 hours |

### 9.2 Supabase Database Restore Procedure

```bash
# Step 1: Download the backup
aws s3 cp s3://virsa-backups/supabase/daily/virsa_supabase_YYYY-MM-DD.sql.gz .

# Step 2: Decompress
gunzip virsa_supabase_YYYY-MM-DD.sql.gz

# Step 3: Restore to new Supabase project (or same, after pause)
pg_restore \
  --host=db.xxxx.supabase.co \
  --port=5432 \
  --username=postgres \
  --dbname=postgres \
  --no-password \
  --format=custom \
  virsa_supabase_YYYY-MM-DD.sql

# Step 4: Re-enable RLS policies (verify they survived restore)
# Step 5: Update DNS / connection strings
# Step 6: Run smoke tests
```

### 9.3 MySQL Restore Procedure

```bash
# Step 1: Download encrypted backup
aws s3 cp s3://virsa-backups/mysql/daily/virsa_financial_YYYY-MM-DD.sql.gz.enc .

# Step 2: Decrypt
openssl enc -d -aes-256-cbc \
  -in virsa_financial_YYYY-MM-DD.sql.gz.enc \
  -out virsa_financial_YYYY-MM-DD.sql.gz \
  -k "$BACKUP_ENCRYPTION_KEY"

# Step 3: Decompress and restore
gunzip -c virsa_financial_YYYY-MM-DD.sql.gz \
  | mysql -h "$MYSQL_HOST" -u virsa_admin -p virsa_financial

# Step 4: Verify row counts match known checksum
# Step 5: Update DATABASE_URL in Vercel if host changed
```

### 9.4 Rollback Procedure (Deployment)

```bash
# Vercel instant rollback to previous deployment
vercel rollback --token=$VERCEL_TOKEN

# Or promote a previous deployment
vercel promote <deployment-id> --token=$VERCEL_TOKEN
```

**Schema rollback:**
```bash
# Supabase migration rollback
supabase db reset           # Full reset (development only)
supabase migration repair   # Mark specific migration as reverted
```

### 9.5 Incident Response Checklist

When a security incident or data loss event occurs:

- [ ] 1. Immediately revoke compromised credentials / tokens
- [ ] 2. Enable maintenance mode (`platform_settings.maintenance_mode = 'true'`)
- [ ] 3. Notify team via Slack/email
- [ ] 4. Identify scope — which data, which users affected
- [ ] 5. Preserve logs — do NOT rotate or delete logs during investigation
- [ ] 6. Restore from nearest clean backup
- [ ] 7. Audit `audit_logs` table for suspicious admin actions
- [ ] 8. Rotate all secrets and regenerate tokens
- [ ] 9. Notify affected users if personal data was compromised
- [ ] 10. Post-mortem documentation within 48 hours

---

## 10. Monitoring & Alerting

### 10.1 Error Tracking

| Tool | Purpose | Configuration |
|---|---|---|
| **Sentry** | Runtime error tracking | Next.js SDK (`@sentry/nextjs`) |
| **Vercel Analytics** | Web vitals, performance | Auto-enabled on Vercel |
| **Supabase Dashboard** | DB query performance, slow queries | Enable `log_min_duration_statement = 1000` |

**Sentry alert rules:**
- New error type detected → **Immediate Slack notification**
- Error rate > 5% in 5 minutes → **PagerDuty alert**
- Any 500 from `/api/auth/*` → **Immediate alert**

### 10.2 Security Monitoring

| Event | Detection | Alert |
|---|---|---|
| 5+ failed logins from same IP | Rate limiter + Redis counter | Slack alert |
| Admin password change | Supabase Auth webhook | Email to all admins |
| Service role key used from new IP | Supabase audit log | Immediate email |
| Withdrawal > PKR 50,000 | API-level check | Admin email notification |
| Unusual signup spike (>100/hour) | Redis counter | Slack alert |
| DB query taking > 2 seconds | Supabase slow query log | Weekly report |

### 10.3 Uptime Monitoring

| Tool | Check Frequency | Alert Channel |
|---|---|---|
| **UptimeRobot** (free tier) | Every 5 minutes | Email + SMS |
| Monitored URLs | `/api/health`, Homepage, Admin login | — |

**Health check endpoint (monitors both projects):**
```typescript
// app/api/health/route.ts
export async function GET() {
  const primaryOk = await checkSupabaseConnection(process.env.NEXT_PUBLIC_SUPABASE_URL!);
  const backupOk  = await checkSupabaseConnection(process.env.SUPABASE_BACKUP_URL!);
  const mysqlOk   = await checkMysqlConnection();

  const overallStatus = primaryOk && mysqlOk ? 'ok'
    : backupOk ? 'degraded_primary_down'
    : 'critical';

  return Response.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    services: {
      supabase_primary: primaryOk ? 'up' : 'down',
      supabase_backup:  backupOk  ? 'up' : 'down',
      mysql:            mysqlOk   ? 'up' : 'down',
    },
  });
  // If status is 'degraded_primary_down' → trigger PagerDuty alert + manual failover
}
```

### 10.4 Backup Verification

Backups are automatically verified after creation:

```bash
# After each backup, verify integrity
pg_restore --list virsa_supabase_YYYY-MM-DD.sql > /dev/null
echo "Exit code: $? (0 = valid)"

# For MySQL — verify row counts
mysql -e "SELECT COUNT(*) FROM virsa_financial.commission_logs;" > backup_check.log
```

**Monthly restore drill:** Once per month, restore the latest backup to a staging environment and run smoke tests to verify data integrity.

---

## 11. Backup Testing Schedule

| Test | Frequency | Owner | Checklist |
|---|---|---|---|
| Backup file integrity check | After every backup | Automated script | Exit code 0, file size > 0 |
| Staging restore drill | Monthly | Backend dev | All tables restored, row counts match |
| RLS policy audit | Quarterly | Backend dev | Test each policy with anon/user/admin |
| Secret rotation | Every 90 days | Backend dev | All env vars updated, no downtime |
| Penetration test | Every 6 months | External | OWASP Top 10 coverage |
| Dependency vulnerability scan | Weekly | `npm audit` CI step | No critical CVEs |

---

## 12. CI/CD Security Integration

Security checks are embedded in the GitHub Actions CI pipeline:

```yaml
# .github/workflows/security.yml
name: Security Checks

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Dependency audit
        run: npm audit --audit-level=high

      - name: Secret scanning
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}

      - name: TypeScript type check
        run: npx tsc --noEmit

      - name: Lint for security issues
        run: npx eslint . --ext .ts,.tsx --rule '{"no-eval": "error"}'

      - name: Build (verify no secrets in bundle)
        run: npm run build
```

**Key CI rules:**
- `npm audit` fails build on `high` or `critical` CVEs
- Secret scanning (`trufflehog`) blocks commit if real credentials detected
- No `console.log` of sensitive data (ESLint rule enforced)

---

## 13. OWASP Top 10 Coverage

| OWASP Risk | Mitigation Implemented |
|---|---|
| A01 Broken Access Control | Supabase RLS + RBAC middleware + role checks in every API handler |
| A02 Cryptographic Failures | AES-256-GCM for sensitive fields, TLS 1.3 in transit, bcrypt for passwords |
| A03 Injection | Supabase SDK + Prisma (parameterized), Zod input validation |
| A04 Insecure Design | Defined threat model, principle of least privilege in DB users |
| A05 Security Misconfiguration | CORS locked down, security headers on all routes, no debug in production |
| A06 Vulnerable Components | Weekly `npm audit`, Dependabot alerts enabled on GitHub |
| A07 Auth & Session Failures | Short JWT expiry, token rotation, max sessions, brute-force lockout |
| A08 Software & Data Integrity | Signed deployments via Vercel, dependency lock files (`package-lock.json`) |
| A09 Logging & Monitoring Failures | Sentry, audit_logs table, UptimeRobot, Supabase slow query logs |
| A10 Server-Side Request Forgery | No server-side URL fetch from user input; allowlist for external calls |

---

## 14. Compliance Notes

| Requirement | Status | Notes |
|---|---|---|
| HTTPS enforced | ✅ | Vercel enforces HTTPS; HSTS header set |
| Password hashing | ✅ | Supabase Auth uses bcrypt |
| User data deletion | ✅ | CASCADE deletes remove all user data |
| Data export (right to portability) | 🔄 Phase 2 | User profile + orders export feature |
| Minimal data collection | ✅ | Only data required for business function is stored |
| Audit logs retained | ✅ | MySQL `audit_logs` table, 1-year retention |
| Backup encryption | ✅ | AES-256-CBC for all backup files |

---

## 15. Security Checklist (Pre-Launch)

Complete this checklist before the production launch:

### Authentication
- [ ] Supabase email confirmation enabled
- [ ] Password policy enforced via Zod
- [ ] JWT expiry set to 3600 seconds
- [ ] Refresh token rotation enabled
- [ ] Rate limiting on auth endpoints live

### API
- [ ] All routes protected by role middleware
- [ ] Zod validation on every POST/PUT/PATCH endpoint
- [ ] CORS restricted to production domain
- [ ] Security headers applied globally
- [ ] Rate limiter deployed (Upstash Redis)

### Database
- [ ] RLS enabled and FORCE on every table
- [ ] Service role key only used server-side
- [ ] MySQL users created with minimum privileges
- [ ] Vendor bank details encryption implemented

### Backups
- [ ] Supabase Pro Plan active (daily backups, PITR)
- [ ] pg_dump scheduled (02:00 AM PKT daily)
- [ ] mysqldump scheduled (01:00 AM PKT daily)
- [ ] S3 lifecycle policies configured
- [ ] First manual restore drill completed

### Monitoring
- [ ] Sentry configured (Next.js SDK)
- [ ] UptimeRobot monitoring live
- [ ] `/api/health` endpoint live
- [ ] Slack alerts for security events configured

### Secrets
- [ ] All secrets in Vercel encrypted environment variables
- [ ] No secrets in `.env` files committed to Git
- [ ] `.gitignore` includes `.env*` files
- [ ] Secret rotation schedule documented

---

*Document prepared for Virsa Multi-Vendor Marketplace — Backend Security & Backup Phase*
