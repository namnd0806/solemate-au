# Prompt mẫu để build SoleMate bằng Claude Code theo Phase

## Prompt khởi động - chỉ phân tích, chưa code

```text
Hãy đọc CLAUDE.md và toàn bộ tài liệu trong /docs liên quan SoleMate.

Mục tiêu hiện tại: hiểu dự án, chưa viết business code.

Hãy:
1. Tóm tắt architecture và 40 Function ID theo module.
2. Chỉ ra mapping logical users sang Supabase auth.users + profiles.
3. Đề xuất cấu trúc source code bám đúng tài liệu.
4. Liệt kê dependency thật sự cần thiết, tránh over-engineering.
5. Đọc AI_03_LO_TRINH_XAY_DUNG.md và xác nhận các phase.

Không tạo hoặc sửa file cho tới khi tôi yêu cầu PHASE 0.
```

## Prompt Phase 0

```text
Thực hiện PHASE 0 theo docs/AI_03_LO_TRINH_XAY_DUNG.md.

Trước khi code, đọc CLAUDE.md và 3 tài liệu lõi.
Chỉ làm PHASE 0, không làm UI business, database business hay feature của phase sau.

Khi xong:
- chạy lint/build cần thiết,
- liệt kê file đã tạo/sửa,
- cho tôi lệnh chạy local,
- ghi blocker nếu có,
- DỪNG và chờ tôi xác nhận.
```

## Prompt Phase 1 - UI shell

```text
Thực hiện PHASE 1: UI shell và Design System.

Hãy đọc các màn hình trong Functional Spec trước khi sửa code.
Tạo route/layout/component nền tảng cho toàn bộ màn hình nhưng chưa kết nối business database.
Chỉ dùng mock nhỏ ở presentation layer để nhìn layout.

Không triển khai Auth, Catalog API, Cart, Checkout hay Admin business logic ở phase này.
Sau khi hoàn thành hãy kiểm tra responsive cơ bản, lint/build và dừng.
```

## Prompt Phase 2 - Database/Supabase

```text
Thực hiện PHASE 2.

Nguồn chính: docs/03_ThietKe_Database_DataDictionary.xlsx, đặc biệt sheet 10_QuyUoc_Supabase.

Yêu cầu:
- tạo migration theo domain,
- dùng Supabase auth.users + public.profiles,
- tạo PK/FK/UQ/CHECK/index,
- tạo RLS policy,
- tạo Storage bucket policy cần thiết,
- tạo seed data,
- tuyệt đối không tạo password_hash ở public schema.

Không phát triển feature UI/API của Phase 3 trở đi ngoài phần tối thiểu để validate DB setup.
Cuối phase hãy đưa danh sách migration và cách reset/seed, sau đó dừng.
```

## Prompt Phase 3 - Auth/Profile/Address

```text
Thực hiện PHASE 3 theo roadmap.

Đọc Function F07-F12, API tương ứng và Database Design trước khi code.
Giữ API contract /api/v1/auth/*, /me, /addresses.
Supabase Auth là provider nhưng UI chỉ làm việc qua application flow đã thiết kế.

Triển khai ownership/RBAC đúng; không log credential/token.
Chạy kiểm tra compile/lint và mô tả cách verify từng flow thủ công.
Không bắt đầu Catalog.
```

## Prompt Phase 4 - Catalog

```text
Thực hiện PHASE 4 cho F01-F06.

Đọc Functional Spec + API-001..API-005 và bảng catalog liên quan.
Triển khai Home, Search, PLP, filter, sort, pagination, PDP và variant selection.
Server là source of truth cho effective price/stock/status.
DRAFT/INACTIVE không được xuất hiện storefront.

Không làm Wishlist/Cart ngoài việc giữ nút/UI placeholder nếu đã có.
Xong thì lint/build, báo cáo và dừng.
```

## Prompt Phase 5 - Wishlist/Cart

```text
Thực hiện PHASE 5.

Đọc F13-F18 và API/DB tương ứng.
Triển khai Wishlist, guest cart, customer cart, add exact variant, update qty, remove item và server-side cart summary.
Cart không reserve stock và phải revalidate variant/status/stock/price.

Không làm promotion/checkout/payment.
Kết thúc bằng cách mô tả state flow guest/customer và dừng.
```

## Prompt Phase 6 - Promotion/Checkout/Shipping

```text
Thực hiện PHASE 6.

Đọc toàn bộ rule Promotion, Checkout, Shipping trong Functional Spec và API Spec.
Triển khai apply/remove coupon, checkout session, address snapshot, shipping method/rate simulator và authoritative total.

Phải xử lý expired/not-started/min-spend/usage-limit promotion.
Chưa triển khai payment execution hoặc Place Order của Phase 7.
Xong hãy liệt kê business error code đã cover và dừng.
```

## Prompt Phase 7 - Payment/Place Order

```text
Thực hiện PHASE 7. Đây là phase transaction-critical.

Đọc kỹ Payment, Place Order, API contract, Transaction Boundaries và Data Dictionary trước khi sửa.

Triển khai:
- CARD simulator,
- PayPal mock,
- Afterpay mock,
- COD,
- POST /orders với Idempotency-Key,
- transaction/RPC để revalidate checkout + stock + promotion + payment,
- insert order/order_items snapshot,
- update stock + inventory movement,
- payment/shipment link,
- cart converted.

Không lưu CVV/full PAN.
Không workaround transaction bằng nhiều request client-side.
Sau khi xong hãy mô tả failure/rollback path và dừng.
```

## Prompt Phase 8 - Order Customer

```text
Thực hiện PHASE 8.

Triển khai My Orders, Order Detail, Cancel và Reorder theo Functional Spec.
Customer chỉ được truy cập order của chính mình.
Cancel phải kiểm tra state và restore inventory bằng transaction/movement.
Reorder phải revalidate product/variant/price/stock hiện tại.
Không làm Admin feature.
```

## Prompt Phase 9 - Admin

```text
Thực hiện PHASE 9 cho Admin.

Đọc F33-F40 và tất cả API admin liên quan.
Triển khai product/variant/inventory, order/shipment/COD operation và promotion management.
Mọi action phải check ADMIN ở server.
Stock adjustment phải ghi inventory movement; operation quan trọng ghi audit.
Không cho invalid state transition.

Xong hãy lập bảng Function ID -> route -> service -> table đã implement và dừng.
```

## Prompt Phase 10 - Deploy

```text
Thực hiện PHASE 10.

Không thêm feature mới.
Tập trung hoàn thiện loading/empty/error/responsive, seed demo, env, Supabase hosted và Vercel deployment.

Hãy:
- kiểm tra .env.example,
- không expose secret,
- cấu hình auth redirect URL,
- deploy lên Vercel,
- thực hiện walkthrough browser từ browse -> cart -> checkout -> payment -> order -> admin,
- cập nhật README hướng dẫn demo.

Nếu thao tác nào ảnh hưởng remote/destructive, hỏi tôi trước.
```

## Prompt khi Claude làm quá phạm vi

```text
Dừng lại. Bạn đang làm vượt phase hiện tại.
Hãy đọc lại CLAUDE.md và AI_03_LO_TRINH_XAY_DUNG.md.
Revert/chỉ loại bỏ phần thay đổi thuộc phase sau nếu việc đó an toàn và chưa commit; giữ lại phần đúng phase.
Sau đó báo chính xác file nào đã vượt scope và dừng.
```

## Prompt review cuối mỗi phase

```text
Review PHASE hiện tại trước khi chuyển phase.
Không viết feature mới.

Hãy kiểm tra:
- có vi phạm Functional Spec/API/Database Design không,
- có hard-code business data không,
- có secret/client service key không,
- có thay schema không qua migration không,
- ownership/RBAC/RLS đúng không,
- có code thuộc phase sau không,
- lint/typecheck/build có pass không.

Chỉ sửa lỗi thuộc phạm vi phase hiện tại. Cuối cùng đưa checklist PASS/FAIL và dừng.
```
