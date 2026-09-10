-- Seed SQL for Supabase Storage and additional setup
-- Run after migrations

-- =============================================
-- STORAGE BUCKETS
-- =============================================

-- Create product-images bucket (public read)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  TRUE,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: public read
CREATE POLICY "Product images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Storage policy: authenticated upload (for admin)
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
);

-- Storage policy: authenticated update/delete (for admin)
CREATE POLICY "Authenticated users can update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- =============================================
-- HELPER: Create demo admin user
-- =============================================
-- NOTE: This is a helper function to create admin during development
-- In production, admin users should be created via secure process

CREATE OR REPLACE FUNCTION public.create_demo_admin(
  admin_email TEXT,
  admin_password TEXT,
  admin_first_name TEXT,
  admin_last_name TEXT
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- This function should only be used in development
  -- Call via Supabase Auth API instead in production

  -- Return NULL as placeholder - actual user creation via Supabase Auth API
  RETURN NULL;

  -- IMPORTANT: Use Supabase Auth signUp API instead:
  -- const { data, error } = await supabase.auth.signUp({
  --   email: 'admin@example.com',
  --   password: 'secure_password',
  --   options: {
  --     data: {
  --       first_name: 'Admin',
  --       last_name: 'User'
  --     }
  --   }
  -- })
  -- Then manually update profile role to 'ADMIN' via service role
END;
$$;

COMMENT ON FUNCTION public.create_demo_admin IS 'Placeholder - use Supabase Auth API for user creation';

-- =============================================
-- DEMO DATA (Brands, Categories, Products, Promotions)
-- =============================================

-- Insert demo brands
INSERT INTO brands (name, slug, description, logo_url, created_at, updated_at)
VALUES
  ('Nike', 'nike', 'American sportswear giant', 'https://via.placeholder.com/100?text=Nike', NOW(), NOW()),
  ('Adidas', 'adidas', 'German sportswear company', 'https://via.placeholder.com/100?text=Adidas', NOW(), NOW()),
  ('Puma', 'puma', 'German multinational sportswear brand', 'https://via.placeholder.com/100?text=Puma', NOW(), NOW()),
  ('New Balance', 'new-balance', 'American footwear company', 'https://via.placeholder.com/100?text=NewBalance', NOW(), NOW()),
  ('Saucony', 'saucony', 'American running shoe brand', 'https://via.placeholder.com/100?text=Saucony', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Insert demo categories
INSERT INTO categories (name, slug, description, created_at, updated_at)
VALUES
  ('Running', 'running', 'Running shoes for all terrains', NOW(), NOW()),
  ('Casual', 'casual', 'Comfortable everyday shoes', NOW(), NOW()),
  ('Sports', 'sports', 'Athletic and sports shoes', NOW(), NOW()),
  ('Hiking', 'hiking', 'Outdoor hiking footwear', NOW(), NOW()),
  ('Basketball', 'basketball', 'Basketball court shoes', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Insert demo products (10 products across categories)
INSERT INTO products (
  name, slug, description, brand_id, category_id,
  price, sale_price, image_url, stock_quantity,
  is_featured, created_at, updated_at
)
VALUES
  (
    'Nike Air Zoom Pegasus 40',
    'nike-air-zoom-pegasus-40',
    'Lightweight running shoe with responsive cushioning',
    (SELECT id FROM brands WHERE slug = 'nike'),
    (SELECT id FROM categories WHERE slug = 'running'),
    $149.99, $129.99,
    'https://via.placeholder.com/400x400?text=Nike+Pegasus',
    50, TRUE, NOW(), NOW()
  ),
  (
    'Adidas Ultra Boost 22',
    'adidas-ultra-boost-22',
    'Premium running shoe with energy return',
    (SELECT id FROM brands WHERE slug = 'adidas'),
    (SELECT id FROM categories WHERE slug = 'running'),
    $189.99, $159.99,
    'https://via.placeholder.com/400x400?text=Adidas+UltraBoost',
    35, TRUE, NOW(), NOW()
  ),
  (
    'Puma RS-X Comfort',
    'puma-rs-x-comfort',
    'Retro-inspired casual sneaker',
    (SELECT id FROM brands WHERE slug = 'puma'),
    (SELECT id FROM categories WHERE slug = 'casual'),
    $99.99, $79.99,
    'https://via.placeholder.com/400x400?text=Puma+RSVX',
    60, FALSE, NOW(), NOW()
  ),
  (
    'New Balance 990v5',
    'new-balance-990v5',
    'Premium American-made running shoe',
    (SELECT id FROM brands WHERE slug = 'new-balance'),
    (SELECT id FROM categories WHERE slug = 'running'),
    $199.99, $179.99,
    'https://via.placeholder.com/400x400?text=NB+990v5',
    25, TRUE, NOW(), NOW()
  ),
  (
    'Saucony Ride 15',
    'saucony-ride-15',
    'Versatile daily training shoe',
    (SELECT id FROM brands WHERE slug = 'saucony'),
    (SELECT id FROM categories WHERE slug = 'running'),
    $139.99, $119.99,
    'https://via.placeholder.com/400x400?text=Saucony+Ride',
    45, FALSE, NOW(), NOW()
  ),
  (
    'Nike Court Borough',
    'nike-court-borough',
    'Casual basketball-inspired shoe',
    (SELECT id FROM brands WHERE slug = 'nike'),
    (SELECT id FROM categories WHERE slug = 'casual'),
    $89.99, $69.99,
    'https://via.placeholder.com/400x400?text=Nike+Borough',
    70, FALSE, NOW(), NOW()
  ),
  (
    'Adidas Terrex Swift',
    'adidas-terrex-swift',
    'Lightweight hiking shoe for trails',
    (SELECT id FROM brands WHERE slug = 'adidas'),
    (SELECT id FROM categories WHERE slug = 'hiking'),
    $169.99, $149.99,
    'https://via.placeholder.com/400x400?text=Adidas+Terrex',
    30, TRUE, NOW(), NOW()
  ),
  (
    'Nike LeBron 20',
    'nike-lebron-20',
    'Premium basketball performance shoe',
    (SELECT id FROM brands WHERE slug = 'nike'),
    (SELECT id FROM categories WHERE slug = 'basketball'),
    $249.99, $199.99,
    'https://via.placeholder.com/400x400?text=Nike+LeBron',
    15, TRUE, NOW(), NOW()
  ),
  (
    'Puma Future Rider',
    'puma-future-rider',
    'Retro-modern casual sneaker',
    (SELECT id FROM brands WHERE slug = 'puma'),
    (SELECT id FROM categories WHERE slug = 'casual'),
    $109.99, $84.99,
    'https://via.placeholder.com/400x400?text=Puma+FutureRider',
    55, FALSE, NOW(), NOW()
  ),
  (
    'New Balance Fresh Foam 1080',
    'new-balance-fresh-foam-1080',
    'Cushioned running shoe with plush feel',
    (SELECT id FROM brands WHERE slug = 'new-balance'),
    (SELECT id FROM categories WHERE slug = 'running'),
    $174.99, $149.99,
    'https://via.placeholder.com/400x400?text=NB+FreshFoam',
    40, FALSE, NOW(), NOW()
  )
ON CONFLICT (slug) DO NOTHING;

-- Insert demo product variants (sizes and colors)
INSERT INTO product_variants (
  product_id, size, color, quantity, price, sale_price, sku, created_at, updated_at
)
SELECT
  p.id,
  size,
  color,
  quantity,
  p.price,
  p.sale_price,
  p.slug || '-' || size || '-' || color,
  NOW(),
  NOW()
FROM products p
CROSS JOIN (
  SELECT size FROM UNNEST(ARRAY['6', '7', '8', '9', '10', '11', '12', '13']) AS size
) sizes
CROSS JOIN (
  SELECT color FROM UNNEST(ARRAY['Black', 'White', 'Blue', 'Red']) AS color
) colors
WHERE p.id IS NOT NULL
ON CONFLICT (sku) DO NOTHING;

-- Insert demo promotions
INSERT INTO promotions (
  code, type, value, min_spend, max_usage, enabled,
  starts_at, ends_at, created_at, updated_at
)
VALUES
  (
    'WELCOME10',
    'PERCENT',
    10,
    50.00,
    100,
    TRUE,
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '30 days',
    NOW(),
    NOW()
  ),
  (
    'SAVE20',
    'PERCENT',
    20,
    120.00,
    50,
    TRUE,
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '30 days',
    NOW(),
    NOW()
  ),
  (
    'FREESHIPPING',
    'FIXED',
    10.00,
    80.00,
    200,
    TRUE,
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '30 days',
    NOW(),
    NOW()
  )
ON CONFLICT (code) DO NOTHING;
