# Implementation Map - SoleMate Australia

Mapping 40 Function IDs từ Functional Spec sang module/source folder implementation.

## Module 1: Product Discovery (F01-F06)

| Function ID | Name | Screen | API Endpoint | Components | Services |
|-------------|------|--------|--------------|------------|----------|
| F01 | Trang chủ và điều hướng | SC-01_Home | GET /api/v1/home | `src/app/page.tsx`<br>`src/components/layout/Header.tsx`<br>`src/components/catalog/ProductGrid.tsx` | `src/lib/services/catalog.service.ts` |
| F02 | Tìm kiếm sản phẩm | SC-02_PLP | GET /api/v1/products?q= | `src/app/search/page.tsx`<br>`src/components/catalog/ProductFilter.tsx` | `src/lib/services/catalog.service.ts` |
| F03 | Điều hướng danh mục và thương hiệu | SC-01_Home | GET /api/v1/categories<br>GET /api/v1/brands | `src/components/layout/Header.tsx`<br>`src/app/brands/[slug]/page.tsx` | `src/lib/services/catalog.service.ts` |
| F04 | Danh sách sản phẩm (PLP) | SC-02_PLP | GET /api/v1/products | `src/app/products/page.tsx`<br>`src/components/catalog/ProductCard.tsx` | `src/lib/services/catalog.service.ts` |
| F05 | Lọc, sắp xếp và phân trang | SC-02_PLP | GET /api/v1/products?filter=... | `src/components/catalog/ProductSort.tsx`<br>`src/components/catalog/Pagination.tsx` | `src/lib/services/catalog.service.ts` |
| F06 | Chi tiết sản phẩm và lựa chọn biến thể | SC-03_PDP | GET /api/v1/products/{slug} | `src/app/products/[slug]/page.tsx`<br>`src/components/catalog/VariantSelector.tsx` | `src/lib/services/catalog.service.ts` |

**API Routes:**
- `src/app/api/v1/home/route.ts`
- `src/app/api/v1/products/route.ts`
- `src/app/api/v1/products/[slug]/route.ts`
- `src/app/api/v1/categories/route.ts`
- `src/app/api/v1/brands/route.ts`

## Module 2: Account Management (F07-F12)

| Function ID | Name | Screen | API Endpoint | Components | Services |
|-------------|------|--------|--------------|------------|----------|
| F07 | Đăng ký tài khoản | SC-15_Register | POST /api/v1/auth/register | `src/app/(auth)/register/page.tsx` | `src/lib/services/auth.service.ts` |
| F08 | Đăng nhập | SC-04_Login | POST /api/v1/auth/login | `src/app/(auth)/login/page.tsx` | `src/lib/services/auth.service.ts` |
| F09 | Đăng xuất | SC-04_Login | POST /api/v1/auth/logout | `src/components/layout/Header.tsx` | `src/lib/services/auth.service.ts` |
| F10 | Quên và đặt lại mật khẩu | SC-16_ForgotPassword | POST /api/v1/auth/forgot-password<br>POST /api/v1/auth/reset-password | `src/app/(auth)/forgot-password/page.tsx`<br>`src/app/(auth)/reset-password/page.tsx` | `src/lib/services/auth.service.ts` |
| F11 | Quản lý hồ sơ cá nhân | SC-17_Profile | GET /api/v1/me<br>PATCH /api/v1/me | `src/app/(customer)/account/profile/page.tsx` | `src/lib/services/profile.service.ts` |
| F12 | Sổ địa chỉ | SC-18_AddressBook | GET/POST/PATCH/DELETE /api/v1/addresses | `src/app/(customer)/account/addresses/page.tsx` | `src/lib/services/address.service.ts` |

**API Routes:**
- `src/app/api/v1/auth/register/route.ts`
- `src/app/api/v1/auth/login/route.ts`
- `src/app/api/v1/auth/logout/route.ts`
- `src/app/api/v1/auth/forgot-password/route.ts`
- `src/app/api/v1/auth/reset-password/route.ts`
- `src/app/api/v1/me/route.ts`
- `src/app/api/v1/addresses/route.ts`
- `src/app/api/v1/addresses/[id]/route.ts`

## Module 3: Wishlist & Cart (F13-F18)

| Function ID | Name | Screen | API Endpoint | Components | Services |
|-------------|------|--------|--------------|------------|----------|
| F13 | Wishlist | SC-11_Wishlist | GET /api/v1/wishlist<br>POST/DELETE /api/v1/wishlist/items | `src/app/(customer)/wishlist/page.tsx` | `src/lib/services/wishlist.service.ts` |
| F14 | Thêm sản phẩm vào giỏ | SC-03_PDP | POST /api/v1/cart/items | `src/app/products/[slug]/page.tsx` | `src/lib/services/cart.service.ts` |
| F15 | Xem giỏ hàng | SC-05_Cart | GET /api/v1/cart | `src/app/(customer)/cart/page.tsx`<br>`src/components/cart/CartItem.tsx` | `src/lib/services/cart.service.ts` |
| F16 | Cập nhật số lượng trong giỏ | SC-05_Cart | PATCH /api/v1/cart/items/{id} | `src/components/cart/CartItem.tsx` | `src/lib/services/cart.service.ts` |
| F17 | Xóa sản phẩm khỏi giỏ | SC-05_Cart | DELETE /api/v1/cart/items/{id} | `src/components/cart/CartItem.tsx` | `src/lib/services/cart.service.ts` |
| F18 | Áp dụng và gỡ mã khuyến mãi | SC-05_Cart | POST/DELETE /api/v1/cart/promotion | `src/components/cart/PromotionInput.tsx`<br>`src/components/cart/CartSummary.tsx` | `src/lib/services/cart.service.ts`<br>`src/lib/services/promotion.service.ts` |

**API Routes:**
- `src/app/api/v1/wishlist/route.ts`
- `src/app/api/v1/wishlist/items/route.ts`
- `src/app/api/v1/wishlist/items/[id]/route.ts`
- `src/app/api/v1/cart/route.ts`
- `src/app/api/v1/cart/items/route.ts`
- `src/app/api/v1/cart/items/[id]/route.ts`
- `src/app/api/v1/cart/promotion/route.ts`

## Module 4: Checkout & Payment (F19-F28)

| Function ID | Name | Screen | API Endpoint | Components | Services |
|-------------|------|--------|--------------|------------|----------|
| F19 | Khởi tạo checkout | SC-06_Shipping | POST /api/v1/checkout/init | `src/app/(customer)/checkout/page.tsx` | `src/lib/services/checkout.service.ts` |
| F20 | Nhập địa chỉ giao hàng | SC-06_Shipping | PATCH /api/v1/checkout/shipping-address | `src/app/(customer)/checkout/shipping/page.tsx`<br>`src/components/checkout/AddressForm.tsx` | `src/lib/services/checkout.service.ts` |
| F21 | Chọn phương thức giao hàng | SC-06_Shipping | POST /api/v1/checkout/shipping-quote | `src/app/(customer)/checkout/shipping/page.tsx`<br>`src/components/checkout/ShippingMethodSelector.tsx` | `src/lib/services/checkout.service.ts` |
| F22 | Chọn phương thức thanh toán | SC-07_Payment | PATCH /api/v1/checkout/payment-method<br>GET /api/v1/payment-methods | `src/app/(customer)/checkout/payment/page.tsx`<br>`src/components/checkout/PaymentMethodSelector.tsx` | `src/lib/services/payment.service.ts` |
| F23 | Thanh toán bằng Card | SC-07_Payment | POST /api/v1/payments/initiate | `src/app/(customer)/checkout/payment/page.tsx` | `src/lib/services/payment.service.ts` |
| F24 | Thanh toán bằng PayPal | SC-07_Payment | POST /api/v1/payments/initiate | `src/app/(customer)/checkout/payment/page.tsx` | `src/lib/services/payment.service.ts` |
| F25 | Thanh toán bằng Afterpay | SC-07_Payment | POST /api/v1/payments/initiate | `src/app/(customer)/checkout/payment/page.tsx` | `src/lib/services/payment.service.ts` |
| F26 | Thanh toán khi nhận hàng (COD) | SC-07_Payment | POST /api/v1/payments/initiate | `src/app/(customer)/checkout/payment/page.tsx` | `src/lib/services/payment.service.ts` |
| F27 | Review và Place Order | SC-08_Review | GET /api/v1/checkout/review<br>POST /api/v1/orders | `src/app/(customer)/checkout/review/page.tsx`<br>`src/components/checkout/OrderReview.tsx` | `src/lib/services/order.service.ts` |
| F28 | Xác nhận đơn hàng | SC-09_Confirmation | GET /api/v1/orders/{id} | `src/app/(customer)/checkout/confirmation/[id]/page.tsx` | `src/lib/services/order.service.ts` |

**API Routes:**
- `src/app/api/v1/checkout/init/route.ts`
- `src/app/api/v1/checkout/shipping-address/route.ts`
- `src/app/api/v1/checkout/shipping-quote/route.ts`
- `src/app/api/v1/checkout/payment-method/route.ts`
- `src/app/api/v1/checkout/review/route.ts`
- `src/app/api/v1/payment-methods/route.ts`
- `src/app/api/v1/payments/initiate/route.ts`
- `src/app/api/v1/payments/[id]/route.ts`
- `src/app/api/v1/orders/route.ts` (POST with Idempotency-Key)

## Module 5: Customer Orders (F29-F32)

| Function ID | Name | Screen | API Endpoint | Components | Services |
|-------------|------|--------|--------------|------------|----------|
| F29 | Danh sách đơn hàng của tôi | SC-10_MyOrders | GET /api/v1/orders | `src/app/(customer)/account/orders/page.tsx`<br>`src/components/order/OrderCard.tsx` | `src/lib/services/order.service.ts` |
| F30 | Chi tiết đơn hàng | SC-19_OrderDetail | GET /api/v1/orders/{id} | `src/app/(customer)/account/orders/[id]/page.tsx`<br>`src/components/order/OrderTimeline.tsx` | `src/lib/services/order.service.ts` |
| F31 | Hủy đơn hàng | SC-19_OrderDetail | POST /api/v1/orders/{id}/cancel | `src/app/(customer)/account/orders/[id]/page.tsx` | `src/lib/services/order.service.ts` |
| F32 | Mua lại (Buy Again) | SC-19_OrderDetail | POST /api/v1/orders/{id}/reorder | `src/app/(customer)/account/orders/[id]/page.tsx` | `src/lib/services/order.service.ts` |

**API Routes:**
- `src/app/api/v1/orders/route.ts` (GET)
- `src/app/api/v1/orders/[id]/route.ts` (GET)
- `src/app/api/v1/orders/[id]/cancel/route.ts`
- `src/app/api/v1/orders/[id]/reorder/route.ts`

## Module 6: Admin Product & Inventory (F33-F36)

| Function ID | Name | Screen | API Endpoint | Components | Services |
|-------------|------|--------|--------------|------------|----------|
| F33 | Danh sách và tìm kiếm sản phẩm | SC-12_AdminProducts | GET /api/v1/admin/products | `src/app/(admin)/admin/products/page.tsx` | `src/lib/services/admin/product.service.ts` |
| F34 | Tạo và cập nhật sản phẩm | SC-20_AdminProductForm | POST /api/v1/admin/products<br>PATCH /api/v1/admin/products/{id} | `src/app/(admin)/admin/products/new/page.tsx`<br>`src/app/(admin)/admin/products/[id]/page.tsx`<br>`src/components/admin/ProductForm.tsx` | `src/lib/services/admin/product.service.ts` |
| F35 | Quản lý biến thể, SKU và giá | SC-20_AdminProductForm | POST /api/v1/admin/products/{id}/variants<br>PATCH /api/v1/admin/variants/{id} | `src/app/(admin)/admin/products/[id]/variants/page.tsx`<br>`src/components/admin/VariantForm.tsx` | `src/lib/services/admin/product.service.ts` |
| F36 | Điều chỉnh tồn kho | SC-12_AdminProducts | POST /api/v1/admin/inventory-adjustments | `src/app/(admin)/admin/inventory/page.tsx`<br>`src/components/admin/InventoryAdjustmentForm.tsx` | `src/lib/services/inventory.service.ts` |

**API Routes:**
- `src/app/api/v1/admin/products/route.ts`
- `src/app/api/v1/admin/products/[id]/route.ts`
- `src/app/api/v1/admin/products/[id]/variants/route.ts`
- `src/app/api/v1/admin/variants/[id]/route.ts`
- `src/app/api/v1/admin/inventory-adjustments/route.ts`

## Module 7: Admin Orders (F37-F38)

| Function ID | Name | Screen | API Endpoint | Components | Services |
|-------------|------|--------|--------------|------------|----------|
| F37 | Danh sách và chi tiết đơn hàng | SC-13_AdminOrders | GET /api/v1/admin/orders<br>GET /api/v1/admin/orders/{id} | `src/app/(admin)/admin/orders/page.tsx`<br>`src/app/(admin)/admin/orders/[id]/page.tsx`<br>`src/components/admin/OrderTable.tsx` | `src/lib/services/admin/order.service.ts` |
| F38 | Cập nhật fulfilment, giao hàng và thu COD | SC-13_AdminOrders | PATCH /api/v1/admin/orders/{id}/status<br>PATCH /api/v1/admin/orders/{id}/shipment<br>PATCH /api/v1/admin/orders/{id}/payment | `src/app/(admin)/admin/orders/[id]/page.tsx` | `src/lib/services/admin/order.service.ts` |

**API Routes:**
- `src/app/api/v1/admin/orders/route.ts`
- `src/app/api/v1/admin/orders/[id]/route.ts`
- `src/app/api/v1/admin/orders/[id]/status/route.ts`
- `src/app/api/v1/admin/orders/[id]/shipment/route.ts`
- `src/app/api/v1/admin/orders/[id]/payment/route.ts`

## Module 8: Admin Promotions (F39-F40)

| Function ID | Name | Screen | API Endpoint | Components | Services |
|-------------|------|--------|--------------|------------|----------|
| F39 | Danh sách khuyến mãi | SC-14_AdminPromotions | GET /api/v1/admin/promotions | `src/app/(admin)/admin/promotions/page.tsx` | `src/lib/services/promotion.service.ts` |
| F40 | Tạo và cập nhật khuyến mãi | SC-14_AdminPromotions | POST /api/v1/admin/promotions<br>PATCH /api/v1/admin/promotions/{id} | `src/app/(admin)/admin/promotions/[id]/page.tsx`<br>`src/components/admin/PromotionForm.tsx` | `src/lib/services/promotion.service.ts` |

**API Routes:**
- `src/app/api/v1/admin/promotions/route.ts`
- `src/app/api/v1/admin/promotions/[id]/route.ts`

## Shared Components & Utilities

### Layout Components
- `src/components/layout/Header.tsx` - Global header với navigation
- `src/components/layout/Footer.tsx` - Global footer
- `src/components/layout/Sidebar.tsx` - Admin sidebar navigation
- `src/components/layout/Container.tsx` - Responsive container wrapper

### UI Primitives (shadcn/ui)
- `src/components/ui/button.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/toast.tsx`
- `src/components/ui/form.tsx`
- `src/components/ui/table.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/separator.tsx`
- `src/components/ui/skeleton.tsx`

### Services
- `src/lib/services/catalog.service.ts` - Product discovery
- `src/lib/services/auth.service.ts` - Authentication
- `src/lib/services/profile.service.ts` - User profile
- `src/lib/services/address.service.ts` - Address management
- `src/lib/services/wishlist.service.ts` - Wishlist operations
- `src/lib/services/cart.service.ts` - Cart operations
- `src/lib/services/checkout.service.ts` - Checkout flow
- `src/lib/services/payment.service.ts` - Payment processing
- `src/lib/services/order.service.ts` - Order operations
- `src/lib/services/inventory.service.ts` - Inventory management
- `src/lib/services/promotion.service.ts` - Promotion management
- `src/lib/services/admin/product.service.ts` - Admin product operations
- `src/lib/services/admin/order.service.ts` - Admin order operations
- `src/lib/services/admin/audit.service.ts` - Audit logging

### Validators (Zod schemas)
- `src/lib/validators/auth.schema.ts`
- `src/lib/validators/product.schema.ts`
- `src/lib/validators/cart.schema.ts`
- `src/lib/validators/checkout.schema.ts`
- `src/lib/validators/order.schema.ts`
- `src/lib/validators/admin.schema.ts`

### Constants
- `src/lib/constants/status.ts` - OrderStatus, PaymentStatus, ShipmentStatus, etc.
- `src/lib/constants/roles.ts` - UserRole
- `src/lib/constants/errors.ts` - Error codes

### Utils
- `src/lib/utils/currency.ts` - AUD formatting
- `src/lib/utils/date.ts` - Date helpers
- `src/lib/utils/validation.ts` - Common validators

### Supabase Clients
- `src/lib/supabase/client.ts` - Browser client
- `src/lib/supabase/server.ts` - Server-side client (SSR)
- `src/lib/supabase/admin.ts` - Service role client (privileged operations)

### Hooks
- `src/lib/hooks/useAuth.ts` - Authentication state
- `src/lib/hooks/useCart.ts` - Cart state
- `src/lib/hooks/useCheckout.ts` - Checkout state
- `src/lib/hooks/useToast.ts` - Toast notifications

### Types
- `src/types/database.types.ts` - Supabase generated types
- `src/types/api.types.ts` - API request/response types
- `src/types/domain.types.ts` - Business domain types

## Database Migrations

Migration files trong `supabase/migrations/`:

1. `001_profiles.sql` - auth.users + public.profiles setup
2. `002_catalog.sql` - brands, categories, products, product_variants, product_images
3. `003_cart_wishlist.sql` - carts, cart_items, wishlists, wishlist_items
4. `004_promotion.sql` - promotions, promotion_usages
5. `005_checkout_payment.sql` - checkout_sessions, payments, payment_transactions
6. `006_orders_inventory.sql` - orders, order_items, shipments, inventory_movements
7. `007_rls_policies.sql` - Row-level security policies
8. `008_seed_support.sql` - Functions/triggers for seed data

Seed data: `supabase/seed.sql`

## Critical Transactions

### TX-001: Place Order
**Location:** `src/lib/services/order.service.ts` hoặc `supabase/functions/place-order/`

**Flow:**
1. Revalidate checkout/price/promotion/stock/payment
2. INSERT order/items
3. UPDATE stock
4. INSERT movements
5. Link payment/shipment
6. Mark cart converted

**Tables:** checkout_sessions, carts, cart_items, product_variants, promotions, payments, orders, order_items, inventory_movements, shipments

### TX-002: Cancel Order
**Location:** `src/lib/services/order.service.ts`

**Flow:**
1. Validate cancellable
2. UPDATE order CANCELLED
3. UPDATE stock + INSERT ORDER_CANCEL movement

**Tables:** orders, product_variants, inventory_movements

### TX-003: Inventory Adjustment
**Location:** `src/lib/services/inventory.service.ts`

**Flow:**
1. Validate delta
2. UPDATE stock
3. INSERT movement
4. INSERT audit

**Tables:** product_variants, inventory_movements, audit_logs

## Notes

- Cấu trúc này mapping logical requirement sang physical implementation
- Mỗi service tập trung vào một business domain
- Route handlers là thin layer gọi services
- Validation ở boundary (API entry points và forms)
- Types generated từ Supabase schema
- Constants shared giữa UI/API/DB để đảm bảo consistency
- Không hard-code business data trong components
