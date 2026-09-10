-- Migration: Cart and Wishlist
-- Description: Shopping cart and wishlist functionality

-- =============================================
-- CARTS TABLE
-- =============================================
CREATE TABLE public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_key TEXT,
  promotion_id UUID,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CONVERTED', 'ABANDONED')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_carts_user_status ON public.carts(user_id, status);
CREATE INDEX idx_carts_session_status ON public.carts(session_key, status);

-- =============================================
-- CART_ITEMS TABLE
-- =============================================
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE RESTRICT,
  qty INTEGER NOT NULL CHECK (qty > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX uq_cart_variant ON public.cart_items(cart_id, variant_id);

-- =============================================
-- WISHLISTS TABLE
-- =============================================
CREATE TABLE public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX uq_wishlists_user ON public.wishlists(user_id);

-- =============================================
-- WISHLIST_ITEMS TABLE
-- =============================================
CREATE TABLE public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id UUID NOT NULL REFERENCES public.wishlists(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX uq_wishlist_variant ON public.wishlist_items(wishlist_id, variant_id);

-- =============================================
-- UPDATED_AT TRIGGERS
-- =============================================
CREATE TRIGGER carts_updated_at
  BEFORE UPDATE ON public.carts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON TABLE public.carts IS 'Shopping carts for guest and authenticated users';
COMMENT ON TABLE public.cart_items IS 'Line items in cart with quantity';
COMMENT ON TABLE public.wishlists IS 'User wishlists (one per user)';
COMMENT ON TABLE public.wishlist_items IS 'Products saved to wishlist';
COMMENT ON COLUMN public.carts.session_key IS 'For guest carts - secure session identifier';
