-- Migration: Row Level Security (RLS) Policies
-- Description: Enable RLS and create policies for data ownership

-- =============================================
-- ENABLE RLS
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Catalog tables: public read for ACTIVE, admin write
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Promotions: public read for active, admin write
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_usages ENABLE ROW LEVEL SECURITY;

-- Inventory and audit: admin only
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES POLICIES
-- =============================================
CREATE POLICY profiles_owner_read ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY profiles_owner_update ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()) -- prevent role escalation
  );

-- =============================================
-- ADDRESSES POLICIES
-- =============================================
CREATE POLICY addresses_owner_all ON public.addresses
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =============================================
-- CARTS POLICIES
-- =============================================
CREATE POLICY carts_owner_all ON public.carts
  FOR ALL
  USING (
    user_id = auth.uid()
    OR (user_id IS NULL AND session_key IS NOT NULL) -- guest cart via server
  );

CREATE POLICY cart_items_via_cart ON public.cart_items
  FOR ALL
  USING (
    cart_id IN (
      SELECT id FROM public.carts
      WHERE user_id = auth.uid() OR (user_id IS NULL AND session_key IS NOT NULL)
    )
  );

-- =============================================
-- WISHLISTS POLICIES
-- =============================================
CREATE POLICY wishlists_owner_all ON public.wishlists
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY wishlist_items_via_wishlist ON public.wishlist_items
  FOR ALL
  USING (
    wishlist_id IN (SELECT id FROM public.wishlists WHERE user_id = auth.uid())
  );

-- =============================================
-- CATALOG POLICIES (Public Read)
-- =============================================
CREATE POLICY brands_public_read ON public.brands
  FOR SELECT
  USING (TRUE);

CREATE POLICY categories_public_read ON public.categories
  FOR SELECT
  USING (TRUE);

CREATE POLICY products_public_read_active ON public.products
  FOR SELECT
  USING (status = 'ACTIVE');

CREATE POLICY product_categories_public_read ON public.product_categories
  FOR SELECT
  USING (TRUE);

CREATE POLICY product_variants_public_read_active ON public.product_variants
  FOR SELECT
  USING (
    status = 'ACTIVE'
    AND EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND status = 'ACTIVE')
  );

CREATE POLICY product_images_public_read ON public.product_images
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND status = 'ACTIVE')
  );

-- =============================================
-- PROMOTIONS POLICIES
-- =============================================
CREATE POLICY promotions_public_read_active ON public.promotions
  FOR SELECT
  USING (enabled = TRUE AND starts_at <= NOW() AND ends_at > NOW());

-- =============================================
-- CHECKOUT POLICIES
-- =============================================
CREATE POLICY checkout_sessions_owner ON public.checkout_sessions
  FOR ALL
  USING (user_id = auth.uid() OR user_id IS NULL);

-- =============================================
-- ORDERS POLICIES
-- =============================================
CREATE POLICY orders_owner_read ON public.orders
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY order_items_via_order ON public.order_items
  FOR SELECT
  USING (
    order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
  );

CREATE POLICY shipments_via_order ON public.shipments
  FOR SELECT
  USING (
    order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
  );

-- =============================================
-- PAYMENTS POLICIES (Limited customer read)
-- =============================================
CREATE POLICY payments_owner_read_limited ON public.payments
  FOR SELECT
  USING (
    order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
  );

CREATE POLICY payment_transactions_owner_read ON public.payment_transactions
  FOR SELECT
  USING (
    payment_id IN (
      SELECT id FROM public.payments
      WHERE order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
    )
  );

-- =============================================
-- NOTE: Admin policies
-- =============================================
-- Admin operations will use service role key server-side
-- These policies protect against accidental client-side access
-- Server-side Route Handlers will check role explicitly before using service client

COMMENT ON POLICY profiles_owner_read ON public.profiles IS 'Users can read their own profile';
COMMENT ON POLICY addresses_owner_all ON public.addresses IS 'Users can manage their own addresses';
COMMENT ON POLICY products_public_read_active ON public.products IS 'Public can read ACTIVE products only';
COMMENT ON POLICY orders_owner_read ON public.orders IS 'Users can read their own orders';
