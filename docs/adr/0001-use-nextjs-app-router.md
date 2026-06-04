# ADR 0001: Sử dụng Next.js App Router làm nền tảng phát triển Fullstack

**Trạng thái:** Accepted

**Ngày:** 2026-06-04

## Ngữ cảnh (Context)
Chúng tôi cần xây dựng một ứng dụng web bán hoa hoàn chỉnh (fullstack) bao gồm cả giao diện người dùng (Storefront) và trang quản trị (Admin Dashboard). Hệ thống đòi hỏi hiệu năng cao, SEO tốt cho các trang sản phẩm và khả năng viết mã nguồn backend (API, Database interactions) một cách nhanh chóng mà không cần duy trì hai dự án riêng biệt (frontend và backend độc lập).

Các phương án được cân nhắc:
1. **Frontend React (Vite) + Backend Node.js (Express)**: Tách biệt rõ ràng nhưng tăng độ phức tạp khi cấu hình môi trường, triển khai và SEO kém cho trang bán hàng.
2. **Next.js Pages Router**: Ổn định nhưng là mô hình cũ, không được tối ưu các tính năng React Server Components mới nhất.
3. **Next.js App Router**: Mô hình hiện đại nhất của Next.js, hỗ trợ React Server Components (RSC), Server Actions, tối ưu hóa SEO mặc định và định tuyến (Routing) mạnh mẽ.

## Quyết định (Decision)
Chúng tôi quyết định sử dụng **Next.js App Router (v15+)** làm khung phát triển (framework) chính cho toàn bộ dự án.

Lý do chọn:
- **React Server Components**: Cho phép lấy dữ liệu trực tiếp trên server, giảm dung lượng JavaScript gửi xuống client, cải thiện tốc độ tải trang ban đầu.
- **Server Actions**: Thay thế việc viết các API Routes truyền thống cho các hoạt động gửi form, mutation dữ liệu, giúp code type-safe hơn giữa client và server.
- **Tối ưu SEO**: Hỗ trợ thẻ metadata động linh hoạt cho từng trang chi tiết sản phẩm hoa tươi.
- **Monorepo/Unified Codebase**: Dễ dàng quản lý cả UI và Logic xử lý dữ liệu trong một thư mục duy nhất.

## Hệ quả (Consequences)
- **Điểm tích cực**:
  - Tốc độ tải trang nhanh nhờ Server Rendering.
  - Tối ưu hóa SEO tốt hơn cho các trang sản phẩm hoa.
  - Quá trình phát triển nhanh hơn nhờ giảm tải việc xây dựng API Boilerplate nhờ Server Actions.
- **Đánh đổi**:
  - Cần phải tuân thủ nghiêm ngặt các quy tắc phân tách giữa `'use client'` và các Server Components để tránh rò rỉ mã nguồn server hoặc tăng dung lượng bundle không đáng có.
