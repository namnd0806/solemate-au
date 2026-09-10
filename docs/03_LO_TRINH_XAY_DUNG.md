# SoleMate Australia - Lộ trình xây dựng theo Phase

## Nguyên tắc chung

Không yêu cầu AI "build toàn bộ dự án" trong một lần. Chỉ làm đúng một phase tại một thời điểm. Mỗi phase phải kết thúc bằng việc AI tóm tắt file đã thay đổi, database migration đã thêm, cách chạy kiểm tra thủ công và vấn đề còn mở. Chỉ chuyển phase khi người dùng xác nhận.

## Phase 0 - Khởi tạo repository và đọc tài liệu

Mục tiêu: có project skeleton sạch, chưa phát triển business feature.

Thực hiện:

- Tạo Next.js App Router + TypeScript + Tailwind.
- Cài dependency nền tảng cần thiết: Supabase client/SSR, Zod, React Hook Form, shadcn/ui theo nhu cầu.
- Tạo cấu trúc folder chuẩn.
- Copy 3 tài liệu lõi vào `/docs`.
- Tạo `.env.example` chỉ chứa tên biến, không chứa secret.
- Tạo `README.md` hướng dẫn chạy local.
- AI đọc toàn bộ tài liệu và tạo `docs/IMPLEMENTATION_MAP.md` mapping 40 Function ID sang module/source folder dự kiến. File này chỉ là bản đồ implementation, không thay đổi requirement.

Gate trước Phase 1:

- `npm run dev` chạy được.
- `npm run lint` không lỗi.
- Chưa có business code thừa.

## Phase 1 - UI shell và Design System

Mục tiêu: dựng khung website và navigation trước, chưa nối database thật.

Thực hiện:

- Global layout, typography, spacing, responsive container.
- Header/store navigation/footer.
- Customer layout và Admin layout.
- Shared component: Button, Input, Select, Modal/Dialog, Toast, Pagination, Skeleton, EmptyState, ErrorState.
- Route placeholders cho 20 màn hình trong tài liệu.
- Dùng mock data cục bộ rất nhỏ chỉ để dựng layout; không implement business logic.

Gate:

- Điều hướng tới tất cả route chính được.
- Desktop/mobile không vỡ layout.
- Không hard-code business data sâu trong component.

## Phase 2 - Supabase, Database, Migration, RLS và Seed

Mục tiêu: database có thể tạo lại từ source control.

Thực hiện theo file `03_ThietKe_Database_DataDictionary.xlsx`:

- Init Supabase CLI.
- Tạo migration cho `profiles`, catalog, cart/wishlist, promotions, checkout/payment, order/inventory/audit.
- Dùng `auth.users + profiles` theo sheet `10_QuyUoc_Supabase`.
- Tạo PK/FK/UQ/CHECK/index quan trọng.
- Bật RLS và policy cần thiết.
- Tạo Storage bucket cho ảnh sản phẩm.
- Tạo seed data đầy đủ để demo.
- Tạo type generated từ Supabase nếu workflow sử dụng generated types.

Gate:

- Có thể reset database và seed lại.
- Không có `password_hash` trong public table.
- Customer không đọc được row của Customer khác.
- Admin role không thể tự nâng quyền từ browser.

## Phase 3 - Authentication, Profile, Address

Phạm vi chức năng: F07-F12 và các màn Account liên quan.

Thực hiện:

- Register/Login/Logout.
- Forgot/Reset Password dùng Supabase Auth.
- Profile read/update.
- Address CRUD + default address.
- Route protection Customer/Admin.
- API `/api/v1/auth/*`, `/me`, `/addresses` theo API Spec.

Gate:

- Session SSR/cookie hoạt động sau refresh.
- Ownership đúng.
- Error message không lộ thông tin account quá mức cần thiết.

## Phase 4 - Catalog và Storefront

Phạm vi: F01-F06.

Thực hiện:

- Home data.
- Category/brand navigation.
- PLP.
- Search.
- Filter multi-condition.
- Sort/pagination.
- PDP, image gallery, variant size/màu, effective price, stock status.
- Admin inactive/draft không xuất hiện storefront.

Gate:

- URL query phản ánh filter/sort/page hợp lý.
- Server trả dữ liệu authoritative.
- Empty/loading/error state có đầy đủ.

## Phase 5 - Wishlist và Cart

Phạm vi: F13-F18.

Thực hiện:

- Wishlist add/remove/read.
- Guest cart bằng session key/cookie an toàn.
- Customer cart.
- Merge strategy khi login nếu requirement áp dụng.
- Add exact variant, update qty, remove item.
- Revalidate product/variant/stock/price khi đọc/update cart.
- Cart totals server-side.

Gate:

- Cart không reserve stock.
- Không cho qty vượt policy/stock hiện tại.
- Refresh trang không làm mất cart hợp lệ.

## Phase 6 - Promotion, Checkout và Shipping

Phạm vi các chức năng promotion/checkout trước payment.

Thực hiện:

- Apply/remove coupon.
- Validate active window, min spend, usage limit và rule khác trong spec.
- Checkout session có expiry.
- Address snapshot.
- Shipping method/rate simulator theo Australia.
- Recalculate subtotal/discount/shipping/total ở server.

Gate:

- Promotion invalid trả business error đúng.
- Checkout không tin total từ client.
- Address/order snapshot đúng.

## Phase 7 - Payment Simulator và Place Order

Phạm vi: payment Card/PayPal/Afterpay/COD + F27 Place Order.

Thực hiện:

- Payment method discovery/selection.
- CARD simulator.
- PayPal mock approve/cancel.
- Afterpay mock approve/decline + installment display.
- COD flow.
- `POST /orders` yêu cầu `Idempotency-Key`.
- Place Order transaction/RPC revalidate checkout, promotion, payment và stock.
- Insert order/order_items snapshot.
- Trừ stock + inventory movement.
- Link payment + shipment.
- Mark cart converted.

Gate:

- Retry cùng Idempotency-Key không tạo order mới.
- Transaction lỗi giữa chừng không để order/stock dở dang.
- Không lưu full PAN/CVV.

## Phase 8 - Customer Order Management

Phạm vi: My Orders, Order Detail, Cancel, Reorder.

Thực hiện:

- List/filter orders của current user.
- Order detail từ snapshot.
- Cancel chỉ ở trạng thái cho phép; restore inventory bằng transaction/movement.
- Reorder tạo cart mới từ item còn bán được; revalidate price/stock.

Gate:

- Không xem được order user khác.
- Cancel không thực hiện hai lần.
- Reorder không copy mù giá cũ.

## Phase 9 - Admin Catalog, Inventory, Order và Promotion

Phạm vi F33-F40.

Thực hiện:

- Admin product list/form.
- Variant/SKU CRUD theo rule.
- Stock adjustment + inventory movement + audit log.
- Admin order list/detail.
- Order/shipment transition.
- COD collection update.
- Promotion CRUD/enable-disable.

Gate:

- Toàn bộ route Admin check role server-side.
- Không cho invalid state transition.
- Stock adjustment không làm stock âm.
- Các action quan trọng có audit record.

## Phase 10 - Hoàn thiện UI, dữ liệu demo và Deploy

Thực hiện:

- Responsive toàn bộ 20 màn hình.
- Loading, empty, error, disabled, confirmation states.
- Chuẩn hóa error mapping từ API.
- Seed scenario demo rõ ràng.
- Thiết lập Supabase project hosted.
- Thiết lập Vercel project, environment variables và deploy.
- Verify redirect URL cho Auth.
- Smoke walkthrough bằng browser: browse -> cart -> checkout -> payment -> order -> admin.
- Viết README cuối cùng về cách demo dự án.

Gate cuối:

- Production demo URL hoạt động.
- Không commit secret.
- Không còn mock data UI ngoài seed/payment simulator được định nghĩa.
- 40 Function ID được mapping trạng thái implementation.
