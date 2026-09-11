import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// Generate UUIDs for all records
const brandIds = {
  nike: uuidv4(),
  adidas: uuidv4(),
  newBalance: uuidv4(),
  asics: uuidv4(),
  converse: uuidv4()
};

const categoryIds = {
  running: uuidv4(),
  basketball: uuidv4(),
  lifestyle: uuidv4(),
  training: uuidv4()
};

const productIds = {
  nikeAirMax: uuidv4(),
  nikeReact: uuidv4(),
  adidasUB: uuidv4(),
  adidasSuperstar: uuidv4(),
  nb574: uuidv4(),
  nbFresh: uuidv4(),
  asicsGK: uuidv4(),
  asicsGN: uuidv4(),
  converseChuck: uuidv4(),
  converseChuck70: uuidv4()
};

const sql = `-- Migration: Seed Data
-- Description: Initial data for development and demo

-- =============================================
-- BRANDS
-- =============================================
INSERT INTO public.brands (id, name, slug) VALUES
  ('${brandIds.nike}', 'Nike', 'nike'),
  ('${brandIds.adidas}', 'Adidas', 'adidas'),
  ('${brandIds.newBalance}', 'New Balance', 'new-balance'),
  ('${brandIds.asics}', 'ASICS', 'asics'),
  ('${brandIds.converse}', 'Converse', 'converse');

-- =============================================
-- CATEGORIES
-- =============================================
INSERT INTO public.categories (id, name, slug, parent_id, display_order) VALUES
  ('${categoryIds.running}', 'Running', 'running', NULL, 1),
  ('${categoryIds.basketball}', 'Basketball', 'basketball', NULL, 2),
  ('${categoryIds.lifestyle}', 'Lifestyle', 'lifestyle', NULL, 3),
  ('${categoryIds.training}', 'Training', 'training', NULL, 4);

-- =============================================
-- PRODUCTS (Sample - 10 products)
-- =============================================
INSERT INTO public.products (id, brand_id, name, slug, description, status) VALUES
  -- Nike Products
  ('${productIds.nikeAirMax}', '${brandIds.nike}',
   'Nike Air Max 270', 'nike-air-max-270',
   'The Nike Air Max 270 features a large Max Air unit for all-day comfort.', 'ACTIVE'),

  ('${productIds.nikeReact}', '${brandIds.nike}',
   'Nike React Infinity Run', 'nike-react-infinity-run',
   'Designed to help reduce injury and keep you on the run.', 'ACTIVE'),

  -- Adidas Products
  ('${productIds.adidasUB}', '${brandIds.adidas}',
   'Adidas Ultraboost 22', 'adidas-ultraboost-22',
   'Energy-returning Boost midsole for endless energy.', 'ACTIVE'),

  ('${productIds.adidasSuperstar}', '${brandIds.adidas}',
   'Adidas Superstar', 'adidas-superstar',
   'Iconic shell-toe design, a street style classic.', 'ACTIVE'),

  -- New Balance Products
  ('${productIds.nb574}', '${brandIds.newBalance}',
   'New Balance 574', 'new-balance-574',
   'A versatile, everyday sneaker with timeless style.', 'ACTIVE'),

  ('${productIds.nbFresh}', '${brandIds.newBalance}',
   'New Balance Fresh Foam 1080', 'new-balance-fresh-foam-1080',
   'Plush cushioning for a soft, comfortable ride.', 'ACTIVE'),

  -- ASICS Products
  ('${productIds.asicsGK}', '${brandIds.asics}',
   'ASICS Gel-Kayano 29', 'asics-gel-kayano-29',
   'Stability running shoe with premium cushioning.', 'ACTIVE'),

  ('${productIds.asicsGN}', '${brandIds.asics}',
   'ASICS Gel-Nimbus 24', 'asics-gel-nimbus-24',
   'Maximum cushioning for long-distance comfort.', 'ACTIVE'),

  -- Converse Products
  ('${productIds.converseChuck}', '${brandIds.converse}',
   'Converse Chuck Taylor All Star', 'converse-chuck-taylor-all-star',
   'The iconic canvas sneaker that started it all.', 'ACTIVE'),

  ('${productIds.converseChuck70}', '${brandIds.converse}',
   'Converse Chuck 70', 'converse-chuck-70',
   'Premium version with enhanced comfort and durability.', 'ACTIVE');

-- =============================================
-- PRODUCT_CATEGORIES
-- =============================================
INSERT INTO public.product_categories (product_id, category_id) VALUES
  ('${productIds.nikeAirMax}', '${categoryIds.lifestyle}'),
  ('${productIds.nikeReact}', '${categoryIds.running}'),
  ('${productIds.adidasUB}', '${categoryIds.running}'),
  ('${productIds.adidasSuperstar}', '${categoryIds.lifestyle}'),
  ('${productIds.nb574}', '${categoryIds.lifestyle}'),
  ('${productIds.nbFresh}', '${categoryIds.running}'),
  ('${productIds.asicsGK}', '${categoryIds.running}'),
  ('${productIds.asicsGN}', '${categoryIds.running}'),
  ('${productIds.converseChuck}', '${categoryIds.lifestyle}'),
  ('${productIds.converseChuck70}', '${categoryIds.lifestyle}');

-- =============================================
-- PRODUCT_VARIANTS (Sample sizes and colors)
-- =============================================
INSERT INTO public.product_variants (product_id, sku, colour, size, price, sale_price, stock_qty, status) VALUES
  ('${productIds.nikeAirMax}', 'NIKE-AM270-BLK-US9', 'Black', 'US 9', 219.00, 189.00, 15, 'ACTIVE'),
  ('${productIds.nikeAirMax}', 'NIKE-AM270-BLK-US10', 'Black', 'US 10', 219.00, 189.00, 20, 'ACTIVE'),
  ('${productIds.nikeAirMax}', 'NIKE-AM270-WHT-US9', 'White', 'US 9', 219.00, NULL, 10, 'ACTIVE'),
  ('${productIds.nikeAirMax}', 'NIKE-AM270-WHT-US10', 'White', 'US 10', 219.00, NULL, 12, 'ACTIVE'),
  
  ('${productIds.adidasUB}', 'ADIDAS-UB22-BLK-US9', 'Black', 'US 9', 260.00, NULL, 25, 'ACTIVE'),
  ('${productIds.adidasUB}', 'ADIDAS-UB22-BLK-US10', 'Black', 'US 10', 260.00, NULL, 18, 'ACTIVE'),
  ('${productIds.adidasUB}', 'ADIDAS-UB22-GRY-US9', 'Grey', 'US 9', 260.00, 229.00, 8, 'ACTIVE'),
  
  ('${productIds.nb574}', 'NB-574-NVY-US9', 'Navy', 'US 9', 150.00, 129.00, 30, 'ACTIVE'),
  ('${productIds.nb574}', 'NB-574-NVY-US10', 'Navy', 'US 10', 150.00, 129.00, 35, 'ACTIVE'),
  ('${productIds.nb574}', 'NB-574-GRY-US9', 'Grey', 'US 9', 150.00, NULL, 22, 'ACTIVE'),
  
  ('${productIds.asicsGK}', 'ASICS-GK29-BLK-US9', 'Black', 'US 9', 240.00, NULL, 12, 'ACTIVE'),
  ('${productIds.asicsGK}', 'ASICS-GK29-BLK-US10', 'Black', 'US 10', 240.00, NULL, 15, 'ACTIVE'),
  ('${productIds.asicsGK}', 'ASICS-GK29-BLU-US9', 'Blue', 'US 9', 240.00, 215.00, 5, 'ACTIVE'),
  
  ('${productIds.converseChuck}', 'CONV-CT-BLK-US9', 'Black', 'US 9', 85.00, NULL, 50, 'ACTIVE'),
  ('${productIds.converseChuck}', 'CONV-CT-BLK-US10', 'Black', 'US 10', 85.00, NULL, 45, 'ACTIVE'),
  ('${productIds.converseChuck}', 'CONV-CT-WHT-US9', 'White', 'US 9', 85.00, 75.00, 40, 'ACTIVE'),
  ('${productIds.converseChuck70}', 'CONV-C70-BLK-US9', 'Black', 'US 9', 120.00, 99.00, 25, 'ACTIVE');
`;

export default sql;
export { brandIds, categoryIds, productIds };
