-- Migration: Seed Data
-- Description: Initial data for development and demo

-- =============================================
-- BRANDS
-- =============================================
INSERT INTO public.brands (id, name, slug) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Nike', 'nike'),
  ('22222222-2222-2222-2222-222222222222', 'Adidas', 'adidas'),
  ('33333333-3333-3333-3333-333333333333', 'New Balance', 'new-balance'),
  ('44444444-4444-4444-4444-444444444444', 'ASICS', 'asics'),
  ('55555555-5555-5555-5555-555555555555', 'Converse', 'converse');

-- =============================================
-- CATEGORIES
-- =============================================
INSERT INTO public.categories (id, name, slug, parent_id, display_order) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'Running', 'running', NULL, 1),
  ('c2222222-2222-2222-2222-222222222222', 'Basketball', 'basketball', NULL, 2),
  ('c3333333-3333-3333-3333-333333333333', 'Lifestyle', 'lifestyle', NULL, 3),
  ('c4444444-4444-4444-4444-444444444444', 'Training', 'training', NULL, 4);

-- =============================================
-- PRODUCTS (Sample - 10 products)
-- =============================================
INSERT INTO public.products (id, brand_id, name, slug, description, status) VALUES
  -- Nike Products
  ('p1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
   'Nike Air Max 270', 'nike-air-max-270',
   'The Nike Air Max 270 features a large Max Air unit for all-day comfort.', 'ACTIVE'),

  ('p1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111',
   'Nike React Infinity Run', 'nike-react-infinity-run',
   'Designed to help reduce injury and keep you on the run.', 'ACTIVE'),

  -- Adidas Products
  ('p2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222',
   'Adidas Ultraboost 22', 'adidas-ultraboost-22',
   'Energy-returning Boost midsole for endless energy.', 'ACTIVE'),

  ('p2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
   'Adidas Superstar', 'adidas-superstar',
   'Iconic shell-toe design, a street style classic.', 'ACTIVE'),

  -- New Balance Products
  ('p3333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333',
   'New Balance 574', 'new-balance-574',
   'A versatile, everyday sneaker with timeless style.', 'ACTIVE'),

  ('p3333333-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333333',
   'New Balance Fresh Foam 1080', 'new-balance-fresh-foam-1080',
   'Plush cushioning for a soft, comfortable ride.', 'ACTIVE'),

  -- ASICS Products
  ('p4444444-4444-4444-4444-444444444441', '44444444-4444-4444-4444-444444444444',
   'ASICS Gel-Kayano 29', 'asics-gel-kayano-29',
   'Stability running shoe with premium cushioning.', 'ACTIVE'),

  ('p4444444-4444-4444-4444-444444444442', '44444444-4444-4444-4444-444444444444',
   'ASICS Gel-Nimbus 24', 'asics-gel-nimbus-24',
   'Maximum cushioning for long-distance comfort.', 'ACTIVE'),

  -- Converse Products
  ('p5555555-5555-5555-5555-555555555551', '55555555-5555-5555-5555-555555555555',
   'Converse Chuck Taylor All Star', 'converse-chuck-taylor-all-star',
   'The iconic canvas sneaker that started it all.', 'ACTIVE'),

  ('p5555555-5555-5555-5555-555555555552', '55555555-5555-5555-5555-555555555555',
   'Converse Chuck 70', 'converse-chuck-70',
   'Premium version with enhanced comfort and durability.', 'ACTIVE');

-- =============================================
-- PRODUCT_CATEGORIES
-- =============================================
-- NOTE: Only showing a subset to keep seed manageable
INSERT INTO public.product_categories (product_id, category_id) VALUES
  ('p1111111-1111-1111-1111-111111111111', 'c3333333-3333-3333-3333-333333333333'), -- Air Max -> Lifestyle
  ('p1111111-1111-1111-1111-111111111112', 'c1111111-1111-1111-1111-111111111111'), -- React Infinity -> Running
  ('p2222222-2222-2222-2222-222222222221', 'c1111111-1111-1111-1111-111111111111'), -- Ultraboost -> Running
  ('p2222222-2222-2222-2222-222222222222', 'c3333333-3333-3333-3333-333333333333'), -- Superstar -> Lifestyle
  ('p3333333-3333-3333-3333-333333333331', 'c3333333-3333-3333-3333-333333333333'), -- 574 -> Lifestyle
  ('p3333333-3333-3333-3333-333333333332', 'c1111111-1111-1111-1111-111111111111'), -- 1080 -> Running
  ('p4444444-4444-4444-4444-444444444441', 'c1111111-1111-1111-1111-111111111111'), -- Gel-Kayano -> Running
  ('p4444444-4444-4444-4444-444444444442', 'c1111111-1111-1111-1111-111111111111'), -- Gel-Nimbus -> Running
  ('p5555555-5555-5555-5555-555555555551', 'c3333333-3333-3333-3333-333333333333'), -- Chuck Taylor -> Lifestyle
  ('p5555555-5555-5555-5555-555555555552', 'c3333333-3333-3333-3333-333333333333'); -- Chuck 70 -> Lifestyle

-- =============================================
-- PRODUCT_VARIANTS (Sample sizes and colors)
-- Note: Only creating a few variants per product for seed data
-- =============================================
-- Nike Air Max 270 - Black/White variants
INSERT INTO public.product_variants (product_id, sku, colour, size, price, sale_price, stock_qty, status) VALUES
  ('p1111111-1111-1111-1111-111111111111', 'NIKE-AM270-BLK-US9', 'Black', 'US 9', 219.00, 189.00, 15, 'ACTIVE'),
  ('p1111111-1111-1111-1111-111111111111', 'NIKE-AM270-BLK-US10', 'Black', 'US 10', 219.00, 189.00, 20, 'ACTIVE'),
  ('p1111111-1111-1111-1111-111111111111', 'NIKE-AM270-WHT-US9', 'White', 'US 9', 219.00, NULL, 10, 'ACTIVE'),
  ('p1111111-1111-1111-1111-111111111111', 'NIKE-AM270-WHT-US10', 'White', 'US 10', 219.00, NULL, 12, 'ACTIVE');

-- Adidas Ultraboost 22
INSERT INTO public.product_variants (product_id, sku, colour, size, price, sale_price, stock_qty, status) VALUES
  ('p2222222-2222-2222-2222-222222222221', 'ADIDAS-UB22-BLK-US9', 'Black', 'US 9', 260.00, NULL, 25, 'ACTIVE'),
  ('p2222222-2222-2222-2222-222222222221', 'ADIDAS-UB22-BLK-US10', 'Black', 'US 10', 260.00, NULL, 18, 'ACTIVE'),
  ('p2222222-2222-2222-2222-222222222221', 'ADIDAS-UB22-GRY-US9', 'Grey', 'US 9', 260.00, 229.00, 8, 'ACTIVE');

-- New Balance 574
INSERT INTO public.product_variants (product_id, sku, colour, size, price, sale_price, stock_qty, status) VALUES
  ('p3333333-3333-3333-3333-333333333331', 'NB-574-NVY-US9', 'Navy', 'US 9', 150.00, 129.00, 30, 'ACTIVE'),
  ('p3333333-3333-3333-3333-333333333331', 'NB-574-NVY-US10', 'Navy', 'US 10', 150.00, 129.00, 35, 'ACTIVE'),
  ('p3333333-3333-3333-3333-333333333331', 'NB-574-GRY-US9', 'Grey', 'US 9', 150.00, NULL, 22, 'ACTIVE');

-- ASICS Gel-Kayano 29
INSERT INTO public.product_variants (product_id, sku, colour, size, price, sale_price, stock_qty, status) VALUES
  ('p4444444-4444-4444-4444-444444444441', 'ASICS-GK29-BLK-US9', 'Black', 'US 9', 240.00, NULL, 12, 'ACTIVE'),
  ('p4444444-4444-4444-4444-444444444441', 'ASICS-GK29-BLK-US10', 'Black', 'US 10', 240.00, NULL, 15, 'ACTIVE'),
  ('p4444444-4444-4444-4444-444444444441', 'ASICS-GK29-BLU-US9', 'Blue', 'US 9', 240.00, 215.00, 5, 'ACTIVE');

-- Converse Chuck Taylor
INSERT INTO public.product_variants (product_id, sku, colour, size, price, sale_price, stock_qty, status) VALUES
  ('p5555555-5555-5555-5555-555555555551', 'CONV-CT-BLK-US9', 'Black', 'US 9', 85.00, NULL, 50, 'ACTIVE'),
  ('p5555555-5555-5555-5555-555555555551', 'CONV-CT-BLK-US10', 'Black', 'US 10', 85.00, NULL, 45, 'ACTIVE'),
  ('p5555555-5555-5555-5555-555555555551', 'CONV-CT-WHT-US9', 'White', 'US 9', 85.00, 75.00, 40, 'ACTIVE'),
  ('p5555555-5555-5555-5555-555555555551', 'CONV-CT-WHT-US10', 'White', 'US 10', 85.00, 75.00, 38, 'ACTIVE');

-- =============================================
-- PROMOTIONS (Sample active and expired)
-- =============================================
INSERT INTO public.promotions (code, type, value, min_spend, starts_at, ends_at, usage_limit, enabled) VALUES
  ('WELCOME10', 'PERCENT', 10, 100, '2026-01-01 00:00:00+00', '2026-12-31 23:59:59+00', 1000, TRUE),
  ('SUMMER50', 'FIXED', 50, 200, '2026-01-01 00:00:00+00', '2026-06-30 23:59:59+00', NULL, TRUE),
  ('EXPIRED', 'PERCENT', 20, NULL, '2025-01-01 00:00:00+00', '2025-12-31 23:59:59+00', 100, FALSE);

-- =============================================
-- DEMO NOTE
-- =============================================
-- Admin user and customer users will be created via Supabase Auth UI/API
-- Profiles will auto-create via trigger
-- No password_hash in public schema (per requirement)

COMMENT ON COLUMN public.product_variants.stock_qty IS 'Initial seed stock - will be managed via inventory_movements in production';
