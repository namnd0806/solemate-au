# SoleMate Australia - Kiến trúc và công nghệ

## 1. Mục tiêu lựa chọn stack

Stack phải đủ giống dự án thật nhưng không ép học viên vận hành quá nhiều hạ tầng. Mục tiêu là một repository duy nhất, deploy demo với chi phí gần 0, có frontend, API, authentication, database và storage rõ ràng.

## 2. Stack chốt

| Thành phần | Công nghệ | Vai trò |
|---|---|---|
| Frontend + Web Server | Next.js App Router + TypeScript | UI, Server Components, Route Handlers `/api/v1/...` |
| UI | Tailwind CSS + shadcn/ui | Component base, form, dialog, table, layout |
| Form/Validation | React Hook Form + Zod | Validation input ở UI/server boundary |
| Database | Supabase PostgreSQL | Business data, transaction, index, constraint |
| Authentication | Supabase Auth | Email/password, session, reset password, JWT |
| Authorization | Supabase RLS + server-side RBAC | Ownership Customer và quyền Admin |
| File/Image | Supabase Storage | Ảnh sản phẩm |
| Backend API | Next.js Route Handlers | Giữ contract `/api/v1/...`, điều phối business service |
| Transaction phức tạp | PostgreSQL function/RPC; Edge Function khi phù hợp | Place Order, inventory, operation cần atomicity |
| Deploy Web | Vercel | Hosting Next.js và preview deployment |
| Version control | Git + GitHub | Source code và lịch sử thay đổi |
| Package manager | npm | Giảm số công cụ học viên phải học |

## 3. Tại sao không làm backend Java riêng

Dự án là giả lập phục vụ học viên. Nếu tách Next.js + Java/Spring Boot + PostgreSQL + Auth service + hosting riêng, phần DevOps sẽ lấn át mục tiêu học nghiệp vụ và automation sau này.

Vì vậy backend được tổ chức theo mô hình BFF trong Next.js:

`Browser -> Next.js UI -> /api/v1 Route Handler -> Service -> Supabase`

Điều này vẫn giữ được khái niệm FE/BE/API rõ ràng. Học viên vẫn thấy request/response, status code, ownership, transaction và database, nhưng repository/deployment đơn giản hơn.

## 4. Quy ước Supabase Auth

Functional Spec dùng logical entity `users`. Khi triển khai vật lý:

- Credential và email đăng nhập do `auth.users` của Supabase quản lý.
- Tạo bảng `public.profiles` với `id` FK tới `auth.users.id` để lưu `first_name`, `last_name`, `phone`, `role`, `status` và thông tin app cần.
- Không tạo `password_hash` ở `public` schema.
- Không tự tạo raw password reset token table. Dùng Supabase Auth reset flow.
- API `/api/v1/auth/*` là application wrapper quanh Supabase Auth để UI không phụ thuộc trực tiếp vào chi tiết provider.

## 5. Supabase RLS

RLS phải bật cho dữ liệu có owner:

- `profiles`
- `addresses`
- `wishlists`, `wishlist_items`
- cart/customer-owned data nếu truy cập trực tiếp
- `orders`, `order_items`

Nguyên tắc:

- Customer chỉ đọc/ghi dữ liệu thuộc `auth.uid()`.
- Role Admin không được user tự chỉnh.
- Operation Admin quan trọng đi qua server-side route với kiểm tra role.
- `SUPABASE_SECRET_KEY`/service-role-like secret chỉ tồn tại server side; không có prefix `NEXT_PUBLIC_`.

## 6. API architecture

Giữ API contract trong `02_DacTa_API.xlsx`.

Ví dụ cấu trúc:

```text
src/app/api/v1/
  products/route.ts
  products/[slug]/route.ts
  cart/route.ts
  cart/items/route.ts
  checkout/route.ts
  payments/route.ts
  orders/route.ts
  orders/[id]/route.ts
  admin/products/route.ts
  admin/orders/route.ts
```

Route Handler không được chứa toàn bộ business logic. Logic tách về:

```text
src/lib/services/
  catalog.service.ts
  cart.service.ts
  checkout.service.ts
  payment.service.ts
  order.service.ts
  inventory.service.ts
  promotion.service.ts
```

Validation schema:

```text
src/lib/validators/
```

Supabase client:

```text
src/lib/supabase/client.ts
src/lib/supabase/server.ts
src/lib/supabase/admin.ts   # server only
```

## 7. Database migration

Không thay đổi schema bằng cách click thủ công rồi bỏ quên thay đổi.

Mọi thay đổi application schema phải được lưu ở:

```text
supabase/migrations/
```

Seed:

```text
supabase/seed.sql
```

Các migration chia nhỏ theo domain, ví dụ:

```text
001_profiles.sql
002_catalog.sql
003_cart_wishlist.sql
004_promotion.sql
005_checkout_payment.sql
006_orders_inventory.sql
007_rls_policies.sql
008_seed_support.sql
```

## 8. Payment simulator

Không tích hợp payment thật trong phiên bản học tập.

Các method:

- `CARD`: form giống thật, server simulator trả SUCCESS/DECLINED theo test card rule; không lưu CVV/full PAN.
- `PAYPAL`: mock redirect/approve/cancel.
- `AFTERPAY`: mock checkout token + approve/decline; hiển thị Pay in 4.
- `COD`: không thu tiền trước; order/payment state theo luồng COD.

Không sử dụng Stripe key, PayPal production key hay Afterpay production credential.

## 9. Deploy miễn phí cho demo

- Vercel Hobby: dùng cho dự án cá nhân/phi thương mại và có usage cap. Phù hợp với project giả lập này.
- Supabase có gói bắt đầu từ $0; dùng database/auth/storage cho demo trong quota cho phép.
- Dùng domain mặc định `*.vercel.app`; không cần mua domain.
- Environment Variables cấu hình trên Vercel, không commit secret vào Git.

Không hứa hệ thống luôn miễn phí nếu vượt giới hạn của nhà cung cấp.

## 10. Cấu trúc repository đề xuất

```text
solemate-au/
  CLAUDE.md
  docs/
    01_TaiLieu_PhanTich_NghiepVu_KyThuat.docx
    02_DacTa_API.xlsx
    03_ThietKe_Database_DataDictionary.xlsx
    AI_01_MO_TA_DU_AN.md
    AI_02_KIEN_TRUC_CONG_NGHE.md
    AI_03_LO_TRINH_XAY_DUNG.md
    AI_04_PROMPT_THEO_PHASE.md
  src/
    app/
    components/
    lib/
      services/
      validators/
      supabase/
      constants/
      utils/
    types/
  supabase/
    migrations/
    functions/
    seed.sql
  public/
  .env.example
  package.json
  README.md
```

## 11. Nguồn kỹ thuật chính thức

- Supabase Next.js quickstart: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- Supabase Database: https://supabase.com/docs/guides/database/overview
- Supabase Auth: https://supabase.com/docs/guides/auth
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Vercel Supabase integration: https://vercel.com/integrations/supabase
- Vercel pricing/Hobby: https://vercel.com/pricing
