-- Migration: Promotions
-- Description: Promotion codes and usage tracking

-- =============================================
-- PROMOTIONS TABLE
-- =============================================
CREATE TABLE public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('PERCENT', 'FIXED')),
  value NUMERIC(12,2) NOT NULL CHECK (value > 0),
  min_spend NUMERIC(12,2) CHECK (min_spend IS NULL OR min_spend >= 0),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL CHECK (ends_at > starts_at),
  usage_limit INTEGER CHECK (usage_limit IS NULL OR usage_limit > 0),
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_percent_value CHECK (type != 'PERCENT' OR value <= 100)
);

CREATE UNIQUE INDEX uq_promotions_code_ci ON public.promotions(LOWER(code));
CREATE INDEX idx_promotions_active_window ON public.promotions(enabled, starts_at, ends_at);

-- =============================================
-- PROMOTION_USAGES TABLE
-- =============================================
CREATE TABLE public.promotion_usages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID NOT NULL REFERENCES public.promotions(id) ON DELETE RESTRICT,
  order_id UUID NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  discount_amount NUMERIC(12,2) NOT NULL,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_promo_usage_promotion_user ON public.promotion_usages(promotion_id, user_id, used_at);
CREATE UNIQUE INDEX uq_promo_usage_order ON public.promotion_usages(promotion_id, order_id);

-- Add FK constraint for carts.promotion_id (deferred from cart migration)
ALTER TABLE public.carts
  ADD CONSTRAINT fk_carts_promotion
  FOREIGN KEY (promotion_id) REFERENCES public.promotions(id) ON DELETE SET NULL;

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================
CREATE TRIGGER promotions_updated_at
  BEFORE UPDATE ON public.promotions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON TABLE public.promotions IS 'Discount codes with rules';
COMMENT ON TABLE public.promotion_usages IS 'Track promotion usage per order';
COMMENT ON COLUMN public.promotions.type IS 'PERCENT (0-100) or FIXED (dollar amount)';
