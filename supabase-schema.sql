-- ============================================================================
-- VIRSA MULTI-VENDOR MARKETPLACE — SUPABASE SCHEMA
-- Version: 1.0
-- Date: 2026-03-10
-- ============================================================================

-- ── 1. USERS TABLE (extends auth.users) ────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'vendor', 'admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_status ON public.users(status);

-- Trigger to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 2. ADDRESSES TABLE ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  label VARCHAR(50),
  full_name VARCHAR(120) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address_line_1 VARCHAR(255) NOT NULL,
  address_line_2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  province VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20),
  country VARCHAR(80) NOT NULL DEFAULT 'Pakistan',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_addresses_user_id ON public.addresses(user_id);

-- ── 3. CATEGORIES TABLE ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(120) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  commission_rate NUMERIC(5,2),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX idx_categories_is_active ON public.categories(is_active);

-- ── 4. VENDORS TABLE ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  store_name VARCHAR(150) NOT NULL UNIQUE,
  store_slug VARCHAR(160) NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'suspended')),
  rejection_reason TEXT,
  commission_type TEXT NOT NULL DEFAULT 'global' CHECK (commission_type IN ('global', 'custom')),
  commission_rate NUMERIC(5,2),
  average_rating NUMERIC(3,2) NOT NULL DEFAULT 0.00,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  total_sales INTEGER NOT NULL DEFAULT 0,
  balance NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  approved_by UUID REFERENCES public.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_vendors_user_id ON public.vendors(user_id);
CREATE UNIQUE INDEX idx_vendors_store_slug ON public.vendors(store_slug);
CREATE INDEX idx_vendors_approval_status ON public.vendors(approval_status);

-- ── 5. VENDOR BANK DETAILS TABLE ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.vendor_bank_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL UNIQUE REFERENCES public.vendors(id) ON DELETE CASCADE,
  account_holder_name VARCHAR(150) NOT NULL,
  bank_name VARCHAR(100),
  account_number VARCHAR(255), -- Encrypted
  iban VARCHAR(255), -- Encrypted
  jazzcash_number VARCHAR(20),
  easypaisa_number VARCHAR(20),
  preferred_method TEXT NOT NULL DEFAULT 'bank_transfer' CHECK (preferred_method IN ('bank_transfer', 'jazzcash', 'easypaisa', 'manual')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 6. PRODUCTS TABLE ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(280) NOT NULL UNIQUE,
  description TEXT,
  short_description VARCHAR(500),
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  sale_price NUMERIC(12,2) CHECK (sale_price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  sku VARCHAR(100) UNIQUE,
  weight_kg NUMERIC(6,3),
  images TEXT[] NOT NULL DEFAULT '{}',
  thumbnail_url TEXT,
  tags TEXT[],
  specifications JSONB,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'out_of_stock', 'blocked', 'deleted')),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  average_rating NUMERIC(3,2) NOT NULL DEFAULT 0.00,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  total_sold INTEGER NOT NULL DEFAULT 0,
  blocked_by UUID REFERENCES public.users(id),
  blocked_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_vendor_id ON public.products(vendor_id);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_is_featured ON public.products(is_featured);
CREATE INDEX idx_products_price ON public.products(price);
CREATE INDEX idx_products_average_rating ON public.products(average_rating DESC);

-- ── 7. CART ITEMS TABLE ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_cart_items_user_id ON public.cart_items(user_id);

-- ── 8. WISHLIST ITEMS TABLE ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_wishlist_items_user_id ON public.wishlist_items(user_id);

-- ── 9. ORDERS TABLE ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(20) NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  shipping_address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
  shipping_full_name VARCHAR(120) NOT NULL,
  shipping_phone VARCHAR(20) NOT NULL,
  shipping_address_line_1 VARCHAR(255) NOT NULL,
  shipping_address_line_2 VARCHAR(255),
  shipping_city VARCHAR(100) NOT NULL,
  shipping_province VARCHAR(100) NOT NULL,
  shipping_postal_code VARCHAR(20),
  subtotal NUMERIC(12,2) NOT NULL,
  shipping_total NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  discount_total NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(12,2) NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('cod', 'jazzcash', 'easypaisa', 'stripe')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'completed', 'cancelled', 'refunded')),
  notes TEXT,
  cancelled_reason TEXT,
  cancelled_by UUID REFERENCES public.users(id),
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

-- ── 10. ORDER ITEMS TABLE ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE RESTRICT,
  product_name VARCHAR(255) NOT NULL,
  product_thumbnail TEXT,
  quantity INTEGER NOT NULL CHECK (quantity >= 1),
  unit_price NUMERIC(12,2) NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL,
  shipping_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  commission_rate NUMERIC(5,2) NOT NULL,
  commission_amount NUMERIC(12,2) NOT NULL,
  vendor_earning NUMERIC(12,2) NOT NULL,
  item_status TEXT NOT NULL DEFAULT 'pending' CHECK (item_status IN ('pending', 'processing', 'shipped', 'completed', 'cancelled')),
  tracking_number VARCHAR(100),
  shipped_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_vendor_id ON public.order_items(vendor_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX idx_order_items_item_status ON public.order_items(item_status);

-- ── 11. REVIEWS TABLE ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL UNIQUE REFERENCES public.order_items(id),
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(200),
  body TEXT,
  images TEXT[],
  is_approved BOOLEAN NOT NULL DEFAULT TRUE,
  is_reported BOOLEAN NOT NULL DEFAULT FALSE,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX idx_reviews_is_approved ON public.reviews(is_approved);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);

-- ── 12. NOTIFICATIONS TABLE ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type VARCHAR(60) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- ── 13. PLATFORM SETTINGS TABLE ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.platform_settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES public.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed platform settings
INSERT INTO public.platform_settings (key, value, description) VALUES
  ('global_commission_rate', '10.00', 'Default platform commission (%)'),
  ('min_withdrawal_amount', '500.00', 'Minimum withdrawal amount (PKR)'),
  ('max_withdrawal_amount', '100000.00', 'Maximum withdrawal amount (PKR)'),
  ('shipping_mode', 'vendor', 'Shipping managed by: vendor | admin'),
  ('flat_shipping_rate', '150.00', 'Default flat shipping rate (PKR)'),
  ('order_auto_complete_days', '7', 'Days after shipping to auto-complete'),
  ('maintenance_mode', 'false', 'Platform maintenance switch')
ON CONFLICT (key) DO NOTHING;

-- ── 14. DEALS TABLE ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.users(id),
  discount_percentage NUMERIC(5,2) NOT NULL CHECK (discount_percentage BETWEEN 1 AND 99),
  original_price NUMERIC(12,2) NOT NULL,
  deal_price NUMERIC(12,2) NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_deals_product_id ON public.deals(product_id);
CREATE INDEX idx_deals_vendor_id ON public.deals(vendor_id);
CREATE INDEX idx_deals_is_active ON public.deals(is_active);
CREATE INDEX idx_deals_end_date ON public.deals(end_date);
CREATE INDEX idx_deals_active_period ON public.deals(start_date, end_date) WHERE is_active = TRUE;

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_bank_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Users: Own profile + admin full access
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins full access to users" ON public.users FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Addresses: Own addresses only
CREATE POLICY "Users manage own addresses" ON public.addresses FOR ALL USING (auth.uid() = user_id);

-- Categories: Public read, admin write
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Vendors: Public read approved, own vendor write
CREATE POLICY "Public can view approved vendors" ON public.vendors FOR SELECT USING (approval_status = 'approved');
CREATE POLICY "Vendors manage own store" ON public.vendors FOR UPDATE USING (
  auth.uid() = user_id
);
CREATE POLICY "Admins full access to vendors" ON public.vendors FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Products: Public read active, vendor manage own
CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (status = 'active');
CREATE POLICY "Vendors manage own products" ON public.products FOR ALL USING (
  vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid())
);
CREATE POLICY "Admins full access to products" ON public.products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Cart: Own cart only
CREATE POLICY "Users manage own cart" ON public.cart_items FOR ALL USING (auth.uid() = user_id);

-- Wishlist: Own wishlist only
CREATE POLICY "Users manage own wishlist" ON public.wishlist_items FOR ALL USING (auth.uid() = user_id);

-- Orders: Own orders + vendor orders + admin all
CREATE POLICY "Customers view own orders" ON public.orders FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Admins full access to orders" ON public.orders FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Reviews: Public read approved, own review write
CREATE POLICY "Public can view approved reviews" ON public.reviews FOR SELECT USING (is_approved = TRUE);
CREATE POLICY "Users manage own reviews" ON public.reviews FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins moderate reviews" ON public.reviews FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Notifications: Own notifications only
CREATE POLICY "Users manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- Platform Settings: Public read selected, admin write
CREATE POLICY "Public can view settings" ON public.platform_settings FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage settings" ON public.platform_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Deals: Public read active, vendor/admin write
CREATE POLICY "Public can view active deals" ON public.deals FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Vendors manage own deals" ON public.deals FOR ALL USING (
  vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid())
);
CREATE POLICY "Admins manage all deals" ON public.deals FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.vendor_bank_details FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.platform_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================


-- ═══════════════════════════════════════════════════════════
-- FINANCIAL TABLES (Previously in MySQL)
-- ═══════════════════════════════════════════════════════════

-- Commission logs table
CREATE TABLE IF NOT EXISTS commission_logs (
  id BIGSERIAL PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id),
  order_item_id UUID NOT NULL UNIQUE REFERENCES order_items(id),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  product_id UUID NOT NULL REFERENCES products(id),
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL,
  commission_rate DECIMAL(5, 2) NOT NULL,
  commission_amount DECIMAL(12, 2) NOT NULL,
  vendor_earning DECIMAL(12, 2) NOT NULL,
  commission_source VARCHAR(20) NOT NULL CHECK (commission_source IN ('global', 'vendor', 'category')),
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_commission_logs_vendor_id ON commission_logs(vendor_id);
CREATE INDEX idx_commission_logs_order_id ON commission_logs(order_id);
CREATE INDEX idx_commission_logs_logged_at ON commission_logs(logged_at);

-- Withdrawal requests table
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id BIGSERIAL PRIMARY KEY,
  reference_number VARCHAR(30) NOT NULL UNIQUE,
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  amount DECIMAL(12, 2) NOT NULL,
  method VARCHAR(20) NOT NULL CHECK (method IN ('bank_transfer', 'jazzcash', 'easypaisa', 'manual')),
  account_details_snapshot JSONB NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'paid')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  transaction_reference VARCHAR(100),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_withdrawal_requests_vendor_id ON withdrawal_requests(vendor_id);
CREATE INDEX idx_withdrawal_requests_status ON withdrawal_requests(status);

-- Earnings snapshots table
CREATE TABLE IF NOT EXISTS earnings_snapshots (
  id BIGSERIAL PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  period_type VARCHAR(10) NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_items_sold INTEGER NOT NULL DEFAULT 0,
  gross_revenue DECIMAL(14, 2) NOT NULL DEFAULT 0,
  total_commission DECIMAL(14, 2) NOT NULL DEFAULT 0,
  total_vendor_earning DECIMAL(14, 2) NOT NULL DEFAULT 0,
  total_shipping DECIMAL(14, 2) NOT NULL DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(vendor_id, period_type, period_start)
);

CREATE INDEX idx_earnings_snapshots_vendor_id ON earnings_snapshots(vendor_id);
CREATE INDEX idx_earnings_snapshots_period ON earnings_snapshots(period_type, period_start);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(80) NOT NULL,
  target_type VARCHAR(60) NOT NULL,
  target_id VARCHAR(36) NOT NULL,
  before_state JSONB,
  after_state JSONB,
  ip_address VARCHAR(45),
  user_agent VARCHAR(255),
  performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_performed_at ON audit_logs(performed_at);

-- Enable RLS on financial tables
ALTER TABLE commission_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for commission_logs
CREATE POLICY "Vendors can view their own commission logs"
  ON commission_logs FOR SELECT
  USING (vendor_id IN (
    SELECT id FROM vendors WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all commission logs"
  ON commission_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for withdrawal_requests
CREATE POLICY "Vendors can view their own withdrawal requests"
  ON withdrawal_requests FOR SELECT
  USING (vendor_id IN (
    SELECT id FROM vendors WHERE user_id = auth.uid()
  ));

CREATE POLICY "Vendors can create withdrawal requests"
  ON withdrawal_requests FOR INSERT
  WITH CHECK (vendor_id IN (
    SELECT id FROM vendors WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all withdrawal requests"
  ON withdrawal_requests FOR ALL
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for earnings_snapshots
CREATE POLICY "Vendors can view their own earnings snapshots"
  ON earnings_snapshots FOR SELECT
  USING (vendor_id IN (
    SELECT id FROM vendors WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all earnings snapshots"
  ON earnings_snapshots FOR ALL
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for audit_logs
CREATE POLICY "Admins can view all audit logs"
  ON audit_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can create audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));
