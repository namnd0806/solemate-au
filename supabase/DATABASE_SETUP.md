# Database Setup - SoleMate Australia

## Overview

Database schema với 23 bảng, organized theo 8 domain migrations:

1. **Profiles** - User management (auth.users + public.profiles)
2. **Catalog** - Brands, categories, products, variants, images
3. **Cart & Wishlist** - Shopping cart và wishlist
4. **Promotions** - Discount codes và usage tracking
5. **Checkout & Payment** - Checkout sessions và payment records
6. **Orders & Inventory** - Orders, shipments, inventory movements, audit logs
7. **RLS Policies** - Row-level security
8. **Seed Data** - Initial demo data

## Key Design Decisions

### No Password in Public Schema
✅ **Passwords managed by Supabase Auth** (`auth.users.encrypted_password`)  
❌ **NO `password_hash` column in `public.profiles`**

### User Mapping
```
Logical "users" entity → auth.users + public.profiles

auth.users:
  - id (UUID)
  - email
  - encrypted_password (managed by Supabase)
  - email_confirmed_at
  - created_at

public.profiles:
  - id (UUID, FK to auth.users.id)
  - first_name
  - last_name
  - phone
  - role (CUSTOMER | ADMIN)
  - status (ACTIVE | DISABLED | LOCKED)
```

### Snapshot Pattern
- **Orders**: Store product/variant/address snapshot (không phụ thuộc master data)
- **Order Items**: `*_snapshot` columns preserve history

### Idempotency
- **orders.idempotency_key**: UNIQUE constraint prevents duplicate orders

### Soft Delete
- Status-based lifecycle cho products, orders, carts
- Hard delete chỉ cho temporary data (expired checkouts, abandoned carts)

## Local Development Setup

### Prerequisites
- Supabase CLI installed: `npm install -g supabase`
- Docker Desktop running

### Initialize Local Supabase

```bash
# Start Supabase local
npx supabase start

# Output will show:
# API URL: http://localhost:54321
# DB URL: postgresql://postgres:postgres@localhost:54322/postgres
# Studio URL: http://localhost:54323
# anon key: eyJ...
# service_role key: eyJ...
```

### Apply Migrations

```bash
# Apply all migrations
npx supabase db reset

# Or push to remote Supabase project
npx supabase db push
```

### Verify Setup

```bash
# Check migration status
npx supabase migration list

# Open Supabase Studio
open http://localhost:54323
```

## Remote Supabase Setup

### 1. Create Supabase Project
- Go to https://supabase.com/dashboard
- Create new project
- Save credentials:
  - Project URL
  - `anon` key (public)
  - `service_role` key (server-only, secret)

### 2. Link Local to Remote

```bash
# Login
npx supabase login

# Link project
npx supabase link --project-ref YOUR_PROJECT_REF
```

### 3. Push Migrations

```bash
# Push all migrations
npx supabase db push

# Run seed
npx supabase db reset --db-url "postgresql://..." # if needed
```

### 4. Update .env.local

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ... # server-only, never expose
```

## Reset Database

### Local

```bash
# Reset to clean state and re-run all migrations + seed
npx supabase db reset
```

### Remote (CAUTION)

```bash
# This will DROP all data!
npx supabase db reset --db-url "postgresql://postgres:[password]@[host]:5432/postgres"
```

## Migration Files

| File | Description | Tables |
|------|-------------|--------|
| `20260101000001_profiles.sql` | User profiles và addresses | profiles, addresses |
| `20260101000002_catalog.sql` | Product catalog | brands, categories, products, product_variants, product_images, product_categories |
| `20260101000003_cart_wishlist.sql` | Shopping cart & wishlist | carts, cart_items, wishlists, wishlist_items |
| `20260101000004_promotion.sql` | Promotions | promotions, promotion_usages |
| `20260101000005_checkout_payment.sql` | Checkout & payment | checkout_sessions, payments, payment_transactions |
| `20260101000006_orders_inventory.sql` | Orders & inventory | orders, order_items, shipments, inventory_movements, audit_logs |
| `20260101000007_rls_policies.sql` | Row-level security | RLS policies for all tables |
| `20260101000008_seed_data.sql` | Demo seed data | Initial brands, products, variants, promotions |

## Seed Data Included

### Brands (5)
- Nike
- Adidas
- New Balance
- ASICS
- Converse

### Products (10)
- Nike Air Max 270
- Nike React Infinity Run
- Adidas Ultraboost 22
- Adidas Superstar
- New Balance 574
- New Balance Fresh Foam 1080
- ASICS Gel-Kayano 29
- ASICS Gel-Nimbus 24
- Converse Chuck Taylor All Star
- Converse Chuck 70

### Product Variants (~20)
- Multiple sizes (US 9, US 10)
- Multiple colors per product
- Price range: $85 - $260 AUD
- Sale prices on some items
- Stock quantities: 5-50 units

### Promotions (3)
- `WELCOME10` - 10% off, min $100 (active)
- `SUMMER50` - $50 off, min $200 (active)
- `EXPIRED` - Expired promotion for testing

## RLS Policies Summary

### Customer Access
- ✅ Own profile (read/update, cannot change role)
- ✅ Own addresses (CRUD)
- ✅ Own carts and cart items
- ✅ Own wishlist
- ✅ Own orders (read only)
- ✅ Public read: Active products, variants, brands, categories, active promotions

### Guest Access
- ✅ Public read: Active catalog, active promotions
- ✅ Guest cart via session_key (server-managed)

### Admin Access
- Admin operations use **service role key** server-side
- RLS policies prevent client-side admin access
- Server Route Handlers check `role = 'ADMIN'` explicitly

## Storage Buckets

### product-images
- **Public**: YES (read)
- **Upload**: Authenticated users only
- **File size limit**: 5MB
- **Allowed types**: JPEG, PNG, WebP

## Testing Database Setup

### 1. Verify Tables

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
-- Should return 23 tables
```

### 2. Verify Seed Data

```sql
-- Check brands
SELECT COUNT(*) FROM public.brands; -- 5

-- Check products
SELECT COUNT(*) FROM public.products WHERE status = 'ACTIVE'; -- 10

-- Check variants
SELECT COUNT(*) FROM public.product_variants WHERE status = 'ACTIVE'; -- ~20

-- Check promotions
SELECT COUNT(*) FROM public.promotions WHERE enabled = TRUE; -- 2
```

### 3. Test Profile Creation

```sql
-- When a user signs up via Supabase Auth, profile auto-creates
-- Check trigger function
SELECT proname, prosrc
FROM pg_proc
WHERE proname = 'handle_new_user';
```

### 4. Verify RLS

```sql
-- Check RLS enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true;
-- Should return all tables with RLS enabled
```

## Common Tasks

### Create Admin User (Development)

```bash
# 1. Sign up via Supabase Auth (creates profile with CUSTOMER role)
# 2. Manually update role to ADMIN using service role key
```

```sql
-- Via SQL (using service role connection)
UPDATE public.profiles
SET role = 'ADMIN'
WHERE id = 'USER_UUID_HERE';
```

### Add Product

```sql
INSERT INTO public.products (brand_id, name, slug, description, status)
VALUES (
  (SELECT id FROM public.brands WHERE slug = 'nike'),
  'Nike New Product',
  'nike-new-product',
  'Description here',
  'ACTIVE'
);
```

### Check Inventory Movements

```sql
SELECT
  im.*,
  pv.sku,
  p.name as product_name
FROM public.inventory_movements im
JOIN public.product_variants pv ON im.variant_id = pv.id
JOIN public.products p ON pv.product_id = p.id
ORDER BY im.created_at DESC
LIMIT 20;
```

## Troubleshooting

### Migration Failed
```bash
# Check error details
npx supabase db reset --debug

# Or check specific migration
psql $DATABASE_URL -f supabase/migrations/FILENAME.sql
```

### RLS Blocking Queries
```bash
# Test query as service role (bypasses RLS)
# In Studio, use service_role connection

# Or in SQL, disable RLS temporarily for testing
SET ROLE postgres;
SELECT * FROM public.profiles;
```

### Missing Seed Data
```bash
# Re-run seed
npx supabase db reset

# Or manually
psql $DATABASE_URL -f supabase/migrations/20260101000008_seed_data.sql
```

## Next Steps (Phase 3)

After database is verified:
1. Update Supabase client implementations (`src/lib/supabase/*.ts`)
2. Implement Auth APIs (Phase 3)
3. Connect UI to real data
4. Test RLS policies with real user sessions
