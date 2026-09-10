-- Migration: Checkout and Payment
-- Description: Checkout sessions and payment processing

-- =============================================
-- CHECKOUT_SESSIONS TABLE
-- =============================================
CREATE TABLE public.checkout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE RESTRICT,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  shipping_address_json JSONB,
  shipping_method TEXT,
  shipping_fee NUMERIC(12,2) CHECK (shipping_fee IS NULL OR shipping_fee >= 0),
  payment_method TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_checkout_cart ON public.checkout_sessions(cart_id);
CREATE INDEX idx_checkout_expires ON public.checkout_sessions(expires_at);

-- =============================================
-- PAYMENTS TABLE
-- =============================================
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID,
  checkout_session_id UUID REFERENCES public.checkout_sessions(id) ON DELETE SET NULL,
  method TEXT NOT NULL CHECK (method IN ('CARD', 'PAYPAL', 'AFTERPAY', 'COD')),
  status TEXT NOT NULL DEFAULT 'INITIATED' CHECK (
    status IN ('INITIATED', 'PENDING', 'SUCCESS', 'DECLINED', 'PENDING_COLLECTION', 'PAID')
  ),
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  provider_ref TEXT,
  last4 TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_order ON public.payments(order_id);
CREATE INDEX idx_payments_checkout ON public.payments(checkout_session_id);
CREATE INDEX idx_payments_provider_ref ON public.payments(provider_ref);

-- =============================================
-- PAYMENT_TRANSACTIONS TABLE
-- =============================================
CREATE TABLE public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  status TEXT NOT NULL,
  amount NUMERIC(12,2),
  provider_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_tx_payment_created ON public.payment_transactions(payment_id, created_at);

-- =============================================
-- UPDATED_AT TRIGGERS
-- =============================================
CREATE TRIGGER checkout_sessions_updated_at
  BEFORE UPDATE ON public.checkout_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON TABLE public.checkout_sessions IS 'Temporary checkout state with expiry';
COMMENT ON TABLE public.payments IS 'Payment records - MVP simulator, no real credentials';
COMMENT ON TABLE public.payment_transactions IS 'Payment event history for audit';
COMMENT ON COLUMN public.payments.last4 IS 'Last 4 digits for display - mock data only';
