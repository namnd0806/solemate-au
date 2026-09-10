# CLAUDE.md - SoleMate Australia Project Rules

## Nguồn sự thật

Trước khi sửa code liên quan nghiệp vụ, hãy đọc tài liệu liên quan trong `/docs`.

Thứ tự ưu tiên:

1. `01_TaiLieu_PhanTich_NghiepVu_KyThuat.docx` - business behavior, screen, flow, rule.
2. `02_DacTa_API.xlsx` - API contract.
3. `03_ThietKe_Database_DataDictionary.xlsx` - physical database/Supabase mapping.
4. `AI_02_KIEN_TRUC_CONG_NGHE.md` - implementation architecture.
5. `AI_03_LO_TRINH_XAY_DUNG.md` - phase đang được phép thực hiện.

Không đoán nội dung file chưa đọc. Nếu requirement mâu thuẫn, báo rõ và dừng phần mâu thuẫn thay vì tự chọn một cách triển khai.

## Phase gate - quy tắc quan trọng nhất

- Chỉ thực hiện PHASE mà user chỉ định.
- Không tự chuyển sang phase kế tiếp.
- Không "tiện tay" làm chức năng của phase sau.
- Nếu dependency của phase sau là bắt buộc, tạo interface/stub tối thiểu và ghi TODO, không implement nghiệp vụ đó.
- Khi phase hoàn thành, dừng và báo cáo. Chờ user xác nhận mới tiếp tục.

## Không over-engineering

Đây là project giả lập phục vụ học tập, không phải enterprise production system.

- Không thêm microservice.
- Không thêm message broker, Kubernetes, Elasticsearch hoặc paid SaaS nếu requirement không cần.
- Không tạo abstraction chỉ dùng một lần.
- Không tự thêm feature ngoài 40 Function ID.
- Không tạo hàng loạt file helper vô ích.
- Nếu tạo file tạm để xử lý, xóa khi xong.

## Stack bắt buộc

- Next.js App Router.
- TypeScript strict.
- Tailwind CSS; shadcn/ui cho primitive phù hợp.
- Supabase Postgres/Auth/Storage/RLS.
- Next.js Route Handlers cho `/api/v1/...`.
- Zod cho validation ở system boundary.
- Vercel deployment.

Không thay stack nếu user chưa đồng ý.

## Database rules

- Mọi thay đổi schema phải qua `supabase/migrations`.
- Seed ở `supabase/seed.sql` hoặc seed file được roadmap cho phép.
- Không lưu `password_hash` trong public schema; dùng Supabase Auth.
- Logical `users` trong Functional Spec được map sang `auth.users + public.profiles`.
- Không lưu CVV/full PAN.
- Không dùng service/admin secret ở browser.
- Bật RLS cho bảng dữ liệu theo owner.
- Không dùng hard delete cho order/payment/inventory ledger trong normal business flow.
- `Place Order`, cancel order, stock adjustment phải đảm bảo transaction/atomicity theo Database Design.

## API rules

- Giữ endpoint, method, status, validation và business code trong `02_DacTa_API.xlsx` trừ khi user chấp thuận thay đổi contract.
- UI không truy cập database trực tiếp cho nghiệp vụ cần server authoritative/privileged logic.
- Route Handler gọi service layer; không nhồi toàn bộ business logic vào `route.ts`.
- Server là source of truth cho price, stock, promotion, shipping fee và order total.
- `POST /orders` phải xử lý `Idempotency-Key`.
- Error response dùng code ổn định; không trả stack trace ra client.

## Security rules

- Secret chỉ server-side.
- Không commit `.env.local`.
- Tạo `.env.example` không chứa giá trị secret.
- Check ownership trước Customer read/update.
- Check Admin role server-side trước Admin operation.
- Không tin role gửi từ client.
- Không log password, access token, reset token raw, CVV hoặc full PAN.

## Coding rules

- Ưu tiên code đơn giản, rõ ràng, dễ học.
- Tên code/identifier bằng English; comment và tài liệu có thể dùng tiếng Việt.
- Không hard-code business data vào UI nếu dữ liệu thuộc database.
- Không dùng `any` trừ boundary đặc biệt và phải giải thích.
- Không swallow error.
- Component UI không chứa SQL/business transaction.
- Domain service không phụ thuộc trực tiếp vào component.
- Shared constant cho enum/status được dùng ở nhiều nơi.

## Cách làm việc mỗi task

Trước khi edit:

1. Đọc file requirement và code liên quan.
2. Nói ngắn gọn scope sẽ thay đổi.
3. Xác định Function ID/API/table liên quan.
4. Kiểm tra task có đúng current phase không.

Trong khi edit:

- Chỉ sửa file cần thiết.
- Nếu thay DB, tạo migration mới; không rewrite history migration đã áp dụng.
- Nếu thay API contract, dừng và hỏi trước.

Sau khi edit:

- Chạy lint/typecheck/build phù hợp.
- Kiểm tra lỗi compile.
- Tóm tắt: file đã đổi, migration, route/API, cách verify thủ công, TODO/blocker.
- Không tự bắt đầu task tiếp theo.

## Git safety

Không tự `git push`, không force push, không reset hard, không xóa branch hoặc drop database remote khi chưa được user yêu cầu rõ.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
