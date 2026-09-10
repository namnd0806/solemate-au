-- Migration: Catalog (Brands, Categories, Products, Variants, Images)
-- Description: Product catalog domain

-- =============================================
-- BRANDS TABLE
-- =============================================
CREATE TABLE public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX uq_brands_slug ON public.brands(slug);

-- =============================================
-- CATEGORIES TABLE
-- =============================================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX uq_categories_slug ON public.categories(slug);

-- =============================================
-- PRODUCTS TABLE
-- =============================================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX uq_products_slug ON public.products(slug);
CREATE INDEX idx_products_brand_status ON public.products(brand_id, status);
CREATE INDEX idx_products_created_at ON public.products(created_at DESC);

-- =============================================
-- PRODUCT_CATEGORIES (Many-to-Many)
-- =============================================
CREATE TABLE public.product_categories (
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

-- =============================================
-- PRODUCT_VARIANTS TABLE
-- =============================================
CREATE TABLE public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  colour TEXT NOT NULL,
  size TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL CHECK (price > 0),
  sale_price NUMERIC(12,2) CHECK (sale_price IS NULL OR (sale_price > 0 AND sale_price < price)),
  stock_qty INTEGER NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX uq_product_variants_sku ON public.product_variants(sku);
CREATE UNIQUE INDEX uq_variant_option ON public.product_variants(product_id, colour, size);
CREATE INDEX idx_variant_product_status ON public.product_variants(product_id, status);
CREATE INDEX idx_variant_stock ON public.product_variants(stock_qty);

-- =============================================
-- PRODUCT_IMAGES TABLE
-- =============================================
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_images_product ON public.product_images(product_id, display_order);
CREATE UNIQUE INDEX uq_product_primary_image ON public.product_images(product_id) WHERE is_primary = TRUE;

-- =============================================
-- UPDATED_AT TRIGGERS
-- =============================================
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON TABLE public.brands IS 'Shoe brands (Nike, Adidas, etc.)';
COMMENT ON TABLE public.categories IS 'Product categories with optional hierarchy';
COMMENT ON TABLE public.products IS 'Product families (e.g., "Nike Air Max 270")';
COMMENT ON TABLE public.product_variants IS 'Specific SKUs with colour/size/price/stock';
COMMENT ON TABLE public.product_images IS 'Product images with ordering';
