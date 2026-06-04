# ADR 0003: Sử dụng Auth.js (NextAuth) với Credentials Provider làm hệ thống xác thực

**Trạng thái:** Accepted

**Ngày:** 2026-06-04

## Ngữ cảnh (Context)
Ứng dụng yêu cầu định danh người dùng để thực hiện các chức năng: lưu trữ giỏ hàng cá nhân, xem lịch sử mua hàng và truy cập trang quản trị (Admin Dashboard) chỉ dành riêng cho tài khoản có vai trò `ADMIN`.

Các phương án được cân nhắc:
1. **Dịch vụ SaaS (Clerk / Kinde)**: Rất dễ cài đặt, bảo mật cao, nhưng bị giới hạn về số lượng người dùng ở gói miễn phí và phụ thuộc vào kết nối mạng bên thứ ba, khó tùy biến sâu thông tin lưu trữ trong DB cục bộ.
2. **Tự viết JWT + Cookie Auth**: Tự chủ hoàn toàn nhưng tốn thời gian viết mã bảo mật (mã hóa cookie, refresh token, bảo vệ chống XSS/CSRF).
3. **Auth.js (NextAuth.js v5)**: Thư viện bảo mật tiêu chuẩn cho Next.js, tích hợp sẵn với Prisma qua Adapter, hỗ trợ cơ chế Session dựa trên Database hoặc JWT, dễ dàng mở rộng thêm các nhà cung cấp như Google, Facebook.

## Quyết định (Decision)
Chúng tôi quyết định sử dụng **Auth.js (NextAuth v5)** làm giải pháp xác thực và phân quyền cho hệ thống, sử dụng cấu hình **Credentials Provider** (Email/Password) kết hợp lưu trữ cơ sở dữ liệu qua Prisma Adapter.

Lý do chọn:
- **Tích hợp sẵn**: Hỗ trợ đầy đủ các chuẩn bảo mật trong Next.js App Router.
- **Lưu trữ cục bộ**: Mật khẩu người dùng được băm bằng `bcrypt` và lưu trực tiếp trong bảng `User` của PostgreSQL, đảm bảo dữ liệu thuộc quyền kiểm soát của ứng dụng.
- **Phân quyền vai trò**: Dễ dàng nhúng trường `role` (`CUSTOMER` / `ADMIN`) vào trong Session để kiểm tra quyền truy cập ở lớp Middleware.

## Hệ quả (Consequences)
- **Điểm tích cực**:
  - Bảo mật cao nhờ cơ chế bảo vệ CSRF tích hợp sẵn của NextAuth.
  - Quản lý phiên (Session) mượt mà thông qua cả Client-side và Server-side.
  - Dễ dàng nâng cấp thêm các nhà cung cấp mạng xã hội (Google, Facebook OAuth) sau này chỉ bằng cách thêm cấu hình.
- **Đánh đổi**:
  - Cấu hình NextAuth v5 (bản mới nhất) có một số thay đổi cú pháp so với v4 trong tài liệu cũ, đòi hỏi cài đặt middleware đúng cách để tránh vòng lặp chuyển hướng (redirect loop).
