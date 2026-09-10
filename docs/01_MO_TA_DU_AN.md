# SoleMate Australia - Mô tả dự án cho AI

## 1. Mục tiêu dự án

SoleMate Australia là một website thương mại điện tử bán giày giả lập thị trường Australia. Dự án được xây để mô phỏng cách một hệ thống e-commerce thực tế được phân tích, thiết kế và phát triển, nhưng chủ động giới hạn phạm vi để phù hợp cho học viên thực hành dự án end-to-end.

Dự án không phải hệ thống thương mại thật. Không tích hợp thanh toán thật, không thu tiền thật và không lưu dữ liệu thẻ thật. Tuy nhiên luồng nghiệp vụ, trạng thái dữ liệu, API, database, quyền truy cập và cách xử lý lỗi phải được triển khai giống một dự án thật ở mức hợp lý.

## 2. Nguồn yêu cầu chính

AI phải đọc theo thứ tự sau trước khi code:

1. `docs/01_TaiLieu_PhanTich_NghiepVu_KyThuat.docx` - nguồn yêu cầu nghiệp vụ chính, mô tả 40 chức năng, màn hình, sequence, business rule và mapping DB ở mức logical.
2. `docs/02_DacTa_API.xlsx` - API contract gồm 52 endpoint, request/response, validation, lỗi nghiệp vụ, RBAC và idempotency.
3. `docs/03_ThietKe_Database_DataDictionary.xlsx` - thiết kế database, quan hệ, index, constraint, transaction, data dictionary và quy ước triển khai Supabase.

Nếu có mâu thuẫn:

- Quy tắc nghiệp vụ và hành vi màn hình: ưu tiên tài liệu phân tích.
- API contract: ưu tiên file Đặc tả API.
- Cấu trúc vật lý database/Supabase: ưu tiên file Thiết kế Database.
- Không tự ý sửa requirement để code dễ hơn. Ghi lại mâu thuẫn và hỏi trước khi thay đổi contract.

## 3. Phạm vi business

### Storefront

- Trang chủ.
- Tìm kiếm sản phẩm.
- Danh mục, brand, filter, sort, pagination.
- Chi tiết sản phẩm, ảnh, size/variant, giá, tồn kho.
- Đăng ký, đăng nhập, quên/đặt lại mật khẩu.
- Profile và sổ địa chỉ.
- Wishlist.
- Cart cho guest và customer.
- Promotion/coupon.
- Checkout.
- Shipping address và shipping method.
- Payment simulator: Card, PayPal mock, Afterpay mock, COD.
- Review order.
- Place Order.
- Order confirmation.
- My Orders, Order Detail, Cancel Order, Reorder.

### Admin

- Danh sách và tìm kiếm sản phẩm.
- Tạo/cập nhật sản phẩm.
- Quản lý variant/SKU và stock.
- Inventory adjustment và movement history.
- Danh sách/chi tiết đơn hàng.
- Cập nhật order/shipment/COD collection theo transition hợp lệ.
- Quản lý promotion.

## 4. Actor

- `Guest`: chưa đăng nhập, được browse sản phẩm và có guest cart/session.
- `Customer`: người mua đã đăng nhập.
- `Admin`: quản trị catalog, tồn kho, đơn hàng và promotion.
- `System`: xử lý server-side, transaction, trạng thái payment/order và audit.

## 5. Nguyên tắc business quan trọng

- Giá tiền, tồn kho, promotion, shipping fee và order total do server quyết định; client không phải source of truth.
- Cart không reserve stock. Stock phải được revalidate tại checkout/place order.
- Một item trong cart đại diện cho một exact variant/SKU.
- Order phải lưu snapshot tên SKU, giá và địa chỉ để lịch sử không thay đổi khi catalog/profile thay đổi.
- `Place Order` phải chống tạo trùng bằng `Idempotency-Key`.
- Tạo order và trừ stock phải nằm trong transaction phù hợp.
- Payment simulator không lưu CVV hoặc full PAN. Chỉ lưu metadata an toàn như method/status/providerRef/last4 nếu cần.
- COD tạo order ở trạng thái chưa thu tiền; payment chuyển PAID khi Admin ghi nhận thu tiền theo luồng hợp lệ.
- Không hard-delete order/payment/inventory ledger trong luồng nghiệp vụ bình thường.
- Mọi thao tác Customer phải kiểm tra ownership. Mọi thao tác Admin phải kiểm tra role server-side.

## 6. Dữ liệu demo

Seed data phải ổn định và dễ reset:

- Brand: Nike, Adidas, New Balance, ASICS, Converse.
- Khoảng 25-40 sản phẩm.
- Mỗi sản phẩm có nhiều variant size/màu, một số variant out-of-stock/low-stock.
- Có product active, inactive và draft để phục vụ Admin.
- Có promotion hợp lệ, hết hạn, chưa tới ngày, không đạt min spend và đã vượt usage limit.
- Có Customer demo và Admin demo.
- Có order ở nhiều trạng thái để xem history/admin operation.

Không hard-code dữ liệu seed vào component UI. Seed phải nằm trong migration/seed script.

## 7. Tiêu chí dự án hoàn thành

Dự án được coi là hoàn thành khi toàn bộ 40 chức năng trong Functional Spec có implementation tương ứng hoặc được đánh dấu rõ là `Out of Scope`, API contract chính được giữ, database migration có thể tạo lại môi trường, quyền truy cập hoạt động đúng, UI có loading/empty/error state và bản demo deploy được trên Vercel với Supabase.
