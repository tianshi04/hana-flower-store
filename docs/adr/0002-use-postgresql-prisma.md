# ADR 0002: Sử dụng PostgreSQL và Prisma ORM làm giải pháp lưu trữ dữ liệu

**Trạng thái:** Accepted

**Ngày:** 2026-06-04

## Ngữ cảnh (Context)
Website bán hoa cần quản lý các dữ liệu có quan hệ chặt chẽ với nhau: sản phẩm hoa tươi thuộc các phân loại (Category) khác nhau và phục vụ các dịp (Occasion) khác nhau; người dùng đặt hàng thì một đơn hàng (Order) sẽ chứa nhiều chi tiết đơn hàng (OrderItem); các giao dịch thanh toán (Payment) sẽ gắn liền với đơn hàng.

Các phương án được cân nhắc:
1. **MongoDB + Mongoose**: Lưu trữ linh hoạt kiểu tài liệu (document), phù hợp cho catalog sản phẩm nhưng khó đảm bảo tính toàn vẹn dữ liệu giao dịch và quan hệ đơn hàng phức tạp.
2. **PostgreSQL + Prisma ORM**: Cơ sở dữ liệu quan hệ mạnh mẽ, đảm bảo tính ACID cho các giao dịch đơn hàng và thanh toán. Prisma ORM cung cấp khả năng tự động tạo kiểu dữ liệu (Typesafe) từ schema giúp viết code an toàn và có các tính năng migration mạnh mẽ.
3. **PostgreSQL + Drizzle ORM**: Gọn nhẹ, SQL-like và hiệu năng rất cao, nhưng Prisma ORM có hệ sinh thái trưởng thành hơn, dễ cấu hình và tài liệu hướng dẫn phong phú hơn cho sinh viên thực hiện đồ án.

## Quyết định (Decision)
Chúng tôi quyết định sử dụng **PostgreSQL** làm cơ sở dữ liệu chính kết hợp với **Prisma ORM** để tương tác dữ liệu.

Lý do chọn:
- **Tính toàn vẹn**: PostgreSQL đảm bảo tính nhất quán (ACID) cho dữ liệu tài chính/đơn hàng.
- **Prisma Schema**: Định nghĩa mô hình dữ liệu tập trung, trực quan và dễ hiểu.
- **Type-safe Querying**: Prisma Client tự động tạo kiểu dữ liệu TypeScript dựa trên schema, giúp phát hiện lỗi lập trình ngay trong quá trình viết code (compile-time).
- **Phát triển cục bộ**: Dễ dàng chạy PostgreSQL thông qua Docker Compose hoặc sử dụng dịch vụ Cloud Database miễn phí.

## Hệ quả (Consequences)
- **Điểm tích cực**:
  - Đảm bảo tính toàn vẹn tham chiếu dữ liệu (ví dụ: không thể xóa danh mục nếu đang có hoa thuộc danh mục đó).
  - Tự động hóa quá trình di chuyển cấu trúc CSDL (Database Migrations) bằng Prisma Migrate.
  - Hỗ trợ tốt cho việc viết code TypeScript an toàn.
- **Đánh đổi**:
  - Mỗi khi thay đổi schema, cần phải chạy lệnh `prisma migrate dev` để đồng bộ CSDL.
  - Cần duy trì kết nối cơ sở dữ liệu PostgreSQL (local hoặc cloud).
