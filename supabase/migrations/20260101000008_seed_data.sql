-- Migration: Seed Data
-- Description: Initial data for development and demo

-- =============================================
-- BRANDS
-- =============================================
INSERT INTO public.brands (id, name, slug) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Nike', 'nike'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Adidas', 'adidas'),
  ('550e8400-e29b-41d4-a716-446655440003', 'New Balance', 'new-balance'),
  ('550e8400-e29b-41d4-a716-446655440004', 'ASICS', 'asics'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Converse', 'converse');

-- =============================================
-- CATEGORIES
-- =============================================
INSERT INTO public.categories (id, name, slug, parent_id, display_order) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'Running', 'running', NULL, 1),
  ('660e8400-e29b-41d4-a716-446655440002', 'Basketball', 'basketball', NULL, 2),
  ('660e8400-e29b-41d4-a716-446655440003', 'Lifestyle', 'lifestyle', NULL, 3),
  ('660e8400-e29b-41d4-a716-446655440004', 'Training', 'training', NULL, 4);

-- =============================================
-- PRODUCTS (40 products)
-- =============================================
INSERT INTO public.products (id, brand_id, name, slug, description, status) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Nike Air Max 270', 'nike-air-max-270', 'The Nike Air Max 270 features a large Max Air unit for all-day comfort.', 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Nike React Infinity Run', 'nike-react-infinity-run', 'Designed to help reduce injury and keep you on the run.', 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Adidas Ultraboost 22', 'adidas-ultraboost-22', 'Energy-returning Boost midsole for endless energy.', 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'Adidas Superstar', 'adidas-superstar', 'Iconic shell-toe design, a street style classic.', 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', 'New Balance 574', 'new-balance-574', 'A versatile, everyday sneaker with timeless style.', 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003', 'New Balance Fresh Foam 1080', 'new-balance-fresh-foam-1080', 'Plush cushioning for a soft, comfortable ride.', 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440004', 'ASICS Gel-Kayano 29', 'asics-gel-kayano-29', 'Stability running shoe with premium cushioning.', 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440004', 'ASICS Gel-Nimbus 24', 'asics-gel-nimbus-24', 'Maximum cushioning for long-distance comfort.', 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440005', 'Converse Chuck Taylor All Star', 'converse-chuck-taylor-all-star', 'The iconic canvas sneaker that started it all.', 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440005', 'Converse Chuck 70', 'converse-chuck-70', 'Premium version with enhanced comfort and durability.', 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'Nike Revolution 7', 'nike-revolution-7', 'Lightweight daily trainer with comfortable fit.', 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', 'Nike Cortez', 'nike-cortez', 'OG Nike silhouette with street style appeal.', 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440002', 'Adidas NMD R1', 'adidas-nmd-r1', 'Modern running style inspired by heritage.', 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440002', 'Adidas ZX 500', 'adidas-zx-500', 'Classic runner with legendary DNA.', 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440003', 'New Balance 990v6', 'new-balance-990v6', 'Premium heritage running shoe.', 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440003', 'New Balance 2002R', 'new-balance-2002r', 'Retro runner with modern comfort.', 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440004', 'ASICS Gel-Lyte III', 'asics-gel-lyte-3', 'Iconic split-tongue runner.', 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440004', 'ASICS Gel-Quantum 360', 'asics-gel-quantum-360', '360-degree cushioning design.', 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440005', 'Converse One Star', 'converse-one-star', 'Skate-inspired classic silhouette.', 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440005', 'Converse RIP Wade', 'converse-rip-wade', 'Basketball heritage meets comfort.', 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440001', 'Nike Air Force 1', 'nike-air-force-1', 'The most iconic basketball shoe of all time.', 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440001', 'Nike Blazer Mid', 'nike-blazer-mid', 'Timeless basketball silhouette.', 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440002', 'Adidas Stan Smith', 'adidas-stan-smith', 'Tennis legend turned fashion icon.', 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440002', 'Adidas Gazelle', 'adidas-gazelle', 'Archive running heritage.', 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440003', 'New Balance 327', 'new-balance-327', 'Modern take on retro design.', 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440003', 'New Balance 650', 'new-balance-650', 'Basketball court to street.', 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440004', 'ASICS Gel-Venture 8', 'asics-gel-venture-8', 'Trail-ready comfort shoe.', 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440004', 'ASICS Gel-Contend 7', 'asics-gel-contend-7', 'Lightweight daily runner.', 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440029', '550e8400-e29b-41d4-a716-446655440005', 'Converse Pro Leather', 'converse-pro-leather', 'Basketball-inspired casual.', 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440005', 'Converse All Star Hi', 'converse-all-star-hi', 'High-top classic canvas.', 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440001', 'Nike Dunks Low', 'nike-dunks-low', 'Basketball court to skate park.', 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440001', 'Nike Pegasus Turbo', 'nike-pegasus-turbo', 'Speed-focused daily trainer.', 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440002', 'Adidas EQT Support', 'adidas-eqt-support', 'Advanced equipment technology.', 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440034', '550e8400-e29b-41d4-a716-446655440002', 'Adidas Forum 84', 'adidas-forum-84', 'Basketball silhouette with style.', 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440035', '550e8400-e29b-41d4-a716-446655440003', 'New Balance 530', 'new-balance-530', 'Heritage-inspired comfort.', 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440036', '550e8400-e29b-41d4-a716-446655440003', 'New Balance 480', 'new-balance-480', 'Classic court aesthetic.', 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440037', '550e8400-e29b-41d4-a716-446655440004', 'ASICS Metaride', 'asics-metaride', 'Next-gen running technology.', 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440038', '550e8400-e29b-41d4-a716-446655440004', 'ASICS Curreo', 'asics-curreo', 'Casual court-inspired style.', 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440039', '550e8400-e29b-41d4-a716-446655440005', 'Converse Jack Purcell', 'converse-jack-purcell', 'Minimalist court classic.', 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440005', 'Converse ERX 260', 'converse-erx-260', 'Basketball heritage inspired.', 'ACTIVE');

-- =============================================
-- PRODUCT_CATEGORIES
-- =============================================
INSERT INTO public.product_categories (product_id, category_id) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003'),
  ('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001'),
  ('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001'),
  ('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440003'),
  ('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440003'),
  ('770e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440001'),
  ('770e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440001'),
  ('770e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440001'),
  ('770e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440003'),
  ('770e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440003'),
  ('770e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440001'),
  ('770e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440003'),
  ('770e8400-e29b-41d4-a716-446655440013', '660e8400-e29b-41d4-a716-446655440003'),
  ('770e8400-e29b-41d4-a716-446655440014', '660e8400-e29b-41d4-a716-446655440001'),
  ('770e8400-e29b-41d4-a716-446655440015', '660e8400-e29b-41d4-a716-446655440001'),
  ('770e8400-e29b-41d4-a716-446655440016', '660e8400-e29b-41d4-a716-446655440003'),
  ('770e8400-e29b-41d4-a716-446655440017', '660e8400-e29b-41d4-a716-446655440001'),
  ('770e8400-e29b-41d4-a716-446655440018', '660e8400-e29b-41d4-a716-446655440003'),
  ('770e8400-e29b-41d4-a716-446655440019', '660e8400-e29b-41d4-a716-446655440003'),
  ('770e8400-e29b-41d4-a716-446655440020', '660e8400-e29b-41d4-a716-446655440002'),
  ('770e8400-e29b-41d4-a716-446655440021', '660e8400-e29b-41d4-a716-446655440003'),
  ('770e8400-e29b-41d4-a716-446655440022', '660e8400-e29b-41d4-a716-446655440002'),
  ('770e8400-e29b-41d4-a716-446655440023', '660e8400-e29b-41d4-a716-446655440003'),
  ('770e8400-e29b-41d4-a716-446655440024', '660e8400-e29b-41d4-a716-446655440001'),
  ('770e8400-e29b-41d4-a716-446655440025', '660e8400-e29b-41d4-a716-446655440003'),
  ('770e8400-e29b-41d4-a716-446655440026', '660e8400-e29b-41d4-a716-446655440002'),
  ('770e8400-e29b-41d4-a716-446655440027', '660e8400-e29b-41d4-a716-446655440004'),
  ('770e8400-e29b-41d4-a716-446655440028', '660e8400-e29b-41d4-a716-446655440001'),
  ('770e8400-e29b-41d4-a716-446655440029', '660e8400-e29b-41d4-a716-446655440002'),
  ('770e8400-e29b-41d4-a716-446655440030', '660e8400-e29b-41d4-a716-446655440003'),
  ('770e8400-e29b-41d4-a716-446655440031', '660e8400-e29b-41d4-a716-446655440002'),
  ('770e8400-e29b-41d4-a716-446655440032', '660e8400-e29b-41d4-a716-446655440001'),
  ('770e8400-e29b-41d4-a716-446655440033', '660e8400-e29b-41d4-a716-446655440004'),
  ('770e8400-e29b-41d4-a716-446655440034', '660e8400-e29b-41d4-a716-446655440002'),
  ('770e8400-e29b-41d4-a716-446655440035', '660e8400-e29b-41d4-a716-446655440003'),
  ('770e8400-e29b-41d4-a716-446655440036', '660e8400-e29b-41d4-a716-446655440002'),
  ('770e8400-e29b-41d4-a716-446655440037', '660e8400-e29b-41d4-a716-446655440001'),
  ('770e8400-e29b-41d4-a716-446655440038', '660e8400-e29b-41d4-a716-446655440003'),
  ('770e8400-e29b-41d4-a716-446655440039', '660e8400-e29b-41d4-a716-446655440003'),
  ('770e8400-e29b-41d4-a716-446655440040', '660e8400-e29b-41d4-a716-446655440002');

-- =============================================
-- PRODUCT_VARIANTS (varied stock, pricing, sales)
-- =============================================
INSERT INTO public.product_variants (product_id, sku, colour, size, price, sale_price, stock_qty, status) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', 'NIKE-AM270-BLK-US9', 'Black', 'US 9', 219.00, 189.00, 15, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440001', 'NIKE-AM270-BLK-US10', 'Black', 'US 10', 219.00, 189.00, 20, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440001', 'NIKE-AM270-WHT-US9', 'White', 'US 9', 219.00, NULL, 10, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440001', 'NIKE-AM270-WHT-US10', 'White', 'US 10', 219.00, NULL, 12, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440002', 'NIKE-RIR-BLU-US9', 'Blue', 'US 9', 189.00, 159.00, 8, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440002', 'NIKE-RIR-BLU-US10', 'Blue', 'US 10', 189.00, 159.00, 5, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440002', 'NIKE-RIR-WHT-US9', 'White', 'US 9', 189.00, NULL, 0, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440003', 'ADIDAS-UB22-BLK-US9', 'Black', 'US 9', 260.00, NULL, 25, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440003', 'ADIDAS-UB22-BLK-US10', 'Black', 'US 10', 260.00, NULL, 18, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440003', 'ADIDAS-UB22-GRY-US9', 'Grey', 'US 9', 260.00, 229.00, 8, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440004', 'ADIDAS-SS-WHT-US9', 'White', 'US 9', 115.00, NULL, 30, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440004', 'ADIDAS-SS-WHT-US10', 'White', 'US 10', 115.00, NULL, 28, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440004', 'ADIDAS-SS-BLK-US9', 'Black', 'US 9', 115.00, 99.00, 22, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440005', 'NB-574-NVY-US9', 'Navy', 'US 9', 150.00, 129.00, 30, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440005', 'NB-574-NVY-US10', 'Navy', 'US 10', 150.00, 129.00, 35, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440005', 'NB-574-GRY-US9', 'Grey', 'US 9', 150.00, NULL, 22, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440006', 'NB-FF1080-BLK-US10', 'Black', 'US 10', 195.00, 169.00, 12, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440006', 'NB-FF1080-RED-US9', 'Red', 'US 9', 195.00, NULL, 0, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440007', 'ASICS-GK29-BLK-US9', 'Black', 'US 9', 240.00, NULL, 12, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440007', 'ASICS-GK29-BLK-US10', 'Black', 'US 10', 240.00, NULL, 15, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440007', 'ASICS-GK29-BLU-US9', 'Blue', 'US 9', 240.00, 215.00, 5, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440008', 'ASICS-GN24-BLK-US10', 'Black', 'US 10', 280.00, 249.00, 8, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440008', 'ASICS-GN24-WHT-US9', 'White', 'US 9', 280.00, NULL, 3, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440009', 'CONV-CT-BLK-US9', 'Black', 'US 9', 85.00, NULL, 50, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440009', 'CONV-CT-BLK-US10', 'Black', 'US 10', 85.00, NULL, 45, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440009', 'CONV-CT-WHT-US9', 'White', 'US 9', 85.00, 75.00, 40, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440009', 'CONV-CT-WHT-US10', 'White', 'US 10', 85.00, 75.00, 38, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440010', 'CONV-C70-BLK-US9', 'Black', 'US 9', 105.00, NULL, 16, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440010', 'CONV-C70-BLK-US10', 'Black', 'US 10', 105.00, NULL, 14, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440011', 'NIKE-REV7-BLU-US9', 'Blue', 'US 9', 89.99, 79.99, 20, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440012', 'NIKE-CTZ-RED-US10', 'Red', 'US 10', 125.00, 109.00, 18, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440013', 'ADIDAS-NMD-GRY-US9', 'Grey', 'US 9', 175.00, 159.00, 6, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440014', 'ADIDAS-ZX5-GRN-US10', 'Green', 'US 10', 99.99, NULL, 24, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440015', 'NB-990V6-GRY-US9', 'Grey', 'US 9', 345.00, 319.00, 4, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440016', 'NB-2002R-BLK-US10', 'Black', 'US 10', 195.00, NULL, 11, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440017', 'ASICS-GL3-PUR-US9', 'Purple', 'US 9', 189.00, 169.00, 9, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440018', 'ASICS-Q360-ORA-US10', 'Orange', 'US 10', 210.00, NULL, 7, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440019', 'CONV-OS-PNK-US9', 'Pink', 'US 9', 95.00, 85.00, 13, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440020', 'CONV-RW-GLD-US10', 'Gold', 'US 10', 135.00, NULL, 0, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440021', 'NIKE-AF1-WHT-US9', 'White', 'US 9', 145.00, 129.00, 32, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440022', 'NIKE-BZ-ORN-US10', 'Orange', 'US 10', 165.00, NULL, 19, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440023', 'ADIDAS-SS-GRN-US9', 'Green', 'US 9', 119.99, 99.99, 26, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440024', 'ADIDAS-GZ-YEL-US10', 'Yellow', 'US 10', 105.00, NULL, 15, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440025', 'NB-327-PNK-US9', 'Pink', 'US 9', 139.99, 119.99, 10, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440026', 'NB-650-PUR-US10', 'Purple', 'US 10', 169.00, NULL, 14, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440027', 'ASICS-GV8-GRN-US9', 'Green', 'US 9', 155.00, 139.00, 11, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440028', 'ASICS-GC7-BLU-US10', 'Blue', 'US 10', 129.99, NULL, 0, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440029', 'CONV-PL-BRN-US9', 'Brown', 'US 9', 125.00, 109.00, 8, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440030', 'CONV-HI-BLK-US10', 'Black', 'US 10', 95.00, NULL, 17, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440031', 'NIKE-DK-RED-US9', 'Red', 'US 9', 179.99, 159.99, 5, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440032', 'NIKE-PT-GRY-US10', 'Grey', 'US 10', 149.00, NULL, 21, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440033', 'ADIDAS-EQT-BLK-US9', 'Black', 'US 9', 189.99, 169.99, 9, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440034', 'ADIDAS-FM84-WHT-US10', 'White', 'US 10', 155.00, NULL, 12, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440035', 'NB-530-BLU-US9', 'Blue', 'US 9', 139.99, 119.99, 19, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440036', 'NB-480-GRY-US10', 'Grey', 'US 10', 129.99, NULL, 16, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440037', 'ASICS-MR-GRN-US9', 'Green', 'US 9', 249.00, 219.00, 3, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440038', 'ASICS-CUR-BRN-US10', 'Brown', 'US 10', 145.00, NULL, 13, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440039', 'CONV-JP-TAN-US9', 'Tan', 'US 9', 115.00, 99.00, 20, 'ACTIVE'),
  ('770e8400-e29b-41d4-a716-446655440040', 'CONV-ERX-NVY-US10', 'Navy', 'US 10', 139.99, NULL, 11, 'ACTIVE');

-- =============================================
-- PROMOTIONS
-- =============================================
INSERT INTO public.promotions (code, type, value, min_spend, starts_at, ends_at, usage_limit, enabled) VALUES
  ('WELCOME10', 'PERCENT', 10, 100, '2026-01-01 00:00:00+00', '2026-12-31 23:59:59+00', 1000, TRUE),
  ('SUMMER50', 'FIXED', 50, 200, '2026-01-01 00:00:00+00', '2026-12-31 23:59:59+00', NULL, TRUE),
  ('LUCKY20', 'PERCENT', 20, 150, '2026-01-01 00:00:00+00', '2026-12-31 23:59:59+00', 500, TRUE),
  ('DEMO100', 'FIXED', 100, 300, '2026-01-01 00:00:00+00', '2026-12-31 23:59:59+00', NULL, TRUE),
  ('EXPIRED', 'PERCENT', 20, NULL, '2025-01-01 00:00:00+00', '2025-12-31 23:59:59+00', 100, FALSE);

