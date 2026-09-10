-- Migration: Orders, Order Items, Shipments, and Inventory
-- Description: Order management and inventory tracking

-- =============================================
-- ORDERS TABLE
-- =============================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (
    status IN ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED')
  ),
  payment_status TEXT NOT NULL DEFAULT 'INITIATED' CHECK (
    payment_status IN ('INITIATED', 'PENDING', 'SUCCESS', 'DECLINED', 'PENDING_COLLECTION', 'PAID')
  ),
  subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
  discount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  shipping_fee NUMERIC(12,2) NOT NULL CHECK (shipping_fee >= 0),
  total NUMERIC(12,2) NOT NULL CHECK (total >= 0),
  shipping_address_json JSONB NOT NULL,
  idempotency_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX uq_orders_order_no ON public.orders(order_no);
CREATE UNIQUE INDEX uq_orders_idempotency ON public.orders(idempotency_key);
CREATE INDEX idx_orders_user_created ON public.orders(user_id, created_at DESC);
CREATE INDEX idx_orders_status_created ON public.orders(status, created_at DESC);

-- =============================================
-- ORDER_ITEMS TABLE
-- =============================================
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  sku_snapshot TEXT NOT NULL,
  name_snapshot TEXT NOT NULL,
  brand_snapshot TEXT NOT NULL,
  colour_snapshot TEXT NOT NULL,
  size_snapshot TEXT NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
  qty INTEGER NOT NULL CHECK (qty > 0),
  line_total NUMERIC(12,2) NOT NULL CHECK (line_total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON public.order_items(order_id);

-- =============================================
-- SHIPMENTS TABLE
-- =============================================
CREATE TABLE public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  method TEXT NOT NULL CHECK (method IN ('STANDARD', 'EXPRESS')),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SHIPPED', 'DELIVERED')),
  tracking_no TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX uq_shipments_order ON public.shipments(order_id);

-- =============================================
-- INVENTORY_MOVEMENTS TABLE
-- =============================================
CREATE TABLE public.inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE RESTRICT,
  type TEXT NOT NULL CHECK (type IN ('ORDER', 'ORDER_CANCEL', 'MANUAL_ADJUSTMENT')),
  qty_delta INTEGER NOT NULL CHECK (qty_delta != 0),
  qty_before INTEGER NOT NULL,
  qty_after INTEGER NOT NULL,
  ref_type TEXT,
  ref_id UUID,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inventory_variant_created ON public.inventory_movements(variant_id, created_at);
CREATE INDEX idx_inventory_ref ON public.inventory_movements(ref_type, ref_id);

-- =============================================
-- AUDIT_LOGS TABLE
-- =============================================
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  actor_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_entity_created ON public.audit_logs(entity_type, entity_id, created_at);
CREATE INDEX idx_audit_actor_created ON public.audit_logs(actor_user_id, created_at);

-- Add FK for payments.order_id (deferred from payment migration)
ALTER TABLE public.payments
  ADD CONSTRAINT fk_payments_order
  FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;

-- =============================================
-- UPDATED_AT TRIGGERS
-- =============================================
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER shipments_updated_at
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON TABLE public.orders IS 'Customer orders with snapshot data';
COMMENT ON TABLE public.order_items IS 'Order line items - snapshot of product at purchase time';
COMMENT ON TABLE public.shipments IS 'Shipment tracking per order';
COMMENT ON TABLE public.inventory_movements IS 'Stock ledger - all quantity changes';
COMMENT ON TABLE public.audit_logs IS 'Audit trail for admin operations';
COMMENT ON COLUMN public.orders.idempotency_key IS 'Client-provided key to prevent duplicate orders';
COMMENT ON COLUMN public.order_items.variant_id IS 'FK nullable - preserve history if variant deleted';
