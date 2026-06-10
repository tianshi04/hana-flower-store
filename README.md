# FlowerDang - Cửa Hàng Hoa Tươi Thiết Kế Nghệ Thuật (Next.js Fullstack)

Dự án Website thương mại điện tử chuyên biệt cho ngành hoa tươi nghệ thuật được xây dựng bằng Next.js (App Router), PostgreSQL, Prisma ORM, Auth.js (NextAuth v5), CSS Modules và hệ thống kiểm thử tự động tích hợp Docker (Testcontainers).

---

## 🌟 Tính Năng Cốt Lõi

### 👤 Cho Khách Hàng (Storefront)
- **Trang chủ**: Banner chào mừng động, phân loại hoa nhanh theo Dịp (Sinh nhật, Khai trương, Tình yêu, Chia buồn) và trưng bày sản phẩm nổi bật.
- **Catalog lọc hoa**: Thanh tìm kiếm kết hợp bộ lọc Dịp lễ và Phân loại loại hoa đồng bộ thời gian thực lên URL thân thiện với SEO.
- **Tùy biến đặt hoa**: Chọn **Ngày nhận & Khung giờ giao hoa** mong muốn (bắt buộc) và viết **Thiệp chúc mừng** đính kèm (tối đa 250 ký tự).
- **Giỏ hàng & Thanh toán**: Chỉnh sửa số lượng, xem tóm tắt thông tin thiệp & lịch nhận, thanh toán trực tuyến qua **Cổng VNPay** hoặc **COD (Nhận hàng trả tiền)**.
- **Lịch sử đơn hàng**: Theo dõi chi tiết các đơn hàng đã đặt cùng trạng thái xử lý đơn hàng chi tiết.

### 🛡️ Cho Quản Trị Viên (Admin Dashboard)
- **Báo cáo tổng quan**: Thống kê doanh thu thực tế đã thu, tổng số đơn hàng đã đặt, số lượng khách hàng mua sắm trong hệ thống.
- **Quản lý đơn hàng**: Danh sách toàn bộ đơn hàng chi tiết (kèm nội dung thiệp chúc, địa chỉ giao). Cho phép cập nhật trạng thái đơn (Xác nhận COD, Giao hàng, Hoàn thành, Hủy đơn) thông qua Server Actions hiệu năng cao.
- **Quản lý sản phẩm**: CRUD danh sách hoa trong kho, quản lý số lượng tồn kho sản phẩm.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

* **Framework chính**: Next.js 16 (App Router, Server Actions, Edge Middleware)
* **Cơ sở dữ liệu**: PostgreSQL
* **ORM**: Prisma ORM (Tương thích Prisma v7 mới nhất)
* **Xác thực & Phân quyền**: Auth.js (NextAuth v5 Beta)
* **Tạo kiểu giao diện**: Vanilla CSS & CSS Modules (Thiết kế phong cách Premium HSL variables, glassmorphism, micro-animations)
* **Kiểm thử tự động (Testing)**: Vitest & Testcontainers (Tự động dựng DB PostgreSQL độc lập trên Docker để test giao dịch DB thực tế)

---

## 🏛️ Kiến Trúc Hệ Thống & Thiết Kế Chi Tiết

Dự án áp dụng chặt chẽ mô hình **Clean Architecture** kết hợp với các mẫu thiết kế phần mềm (**Design Patterns**) để đảm bảo tính phân tách ranh giới rõ ràng, dễ bảo trì và dễ kiểm thử.

### 1. Cấu trúc Clean Architecture (4 Tầng)
- **Tầng Domain (Lõi nghiệp vụ - [src/domain/](src/domain/)):** Định nghĩa các "hợp đồng" (contracts) nghiệp vụ của hệ thống dưới dạng các interface (như [product.repository.ts](src/domain/repositories/product.repository.ts), [order.repository.ts](src/domain/repositories/order.repository.ts), [payment.service.ts](src/domain/services/payment.service.ts)). Tầng này hoàn toàn độc lập với các framework và thư viện ngoài.
- **Tầng Application (Điều phối nghiệp vụ - [src/application/](src/application/)):** Chứa các lớp Use Case để điều phối các luồng nghiệp vụ chi tiết của hệ thống (như `CreateOrderUseCase` tại [order.usecases.ts](src/application/use-cases/order/order.usecases.ts)).
- **Tầng Infrastructure (Hạ tầng kỹ thuật - [src/infrastructure/](src/infrastructure/)):** Triển khai các interface từ tầng Domain bằng các công nghệ cụ thể như Prisma ORM ([prisma-product.repository.ts](src/infrastructure/repositories/prisma-product.repository.ts)) và VNPay SDK ([vnpay-payment.service.ts](src/infrastructure/services/vnpay-payment.service.ts)).
- **Tầng Presentation (Giao diện - [src/actions/](src/actions/) & [src/app/](src/app/)):** Sử dụng Next.js Server Actions đóng vai trò *Composition Root* lắp ráp các dependency và điều khiển luồng trả về giao diện người dùng.

### 2. Các Design Patterns Đã Áp Dụng
- **Singleton:** Đảm bảo duy nhất một instance kết nối cơ sở dữ liệu `PrismaClient` tránh cạn kiệt connection pool trong quá trình hot-reload khi phát triển ([src/lib/db.ts](src/lib/db.ts)).
- **Command:** Đóng gói mỗi ca nghiệp vụ thành một đối tượng độc lập với phương thức `execute()` duy nhất ([src/application/use-cases/](src/application/use-cases/)).
- **Strategy:** Cho phép hoán đổi chiến lược thanh toán linh hoạt qua VNPay hoặc COD bằng cách bọc chúng thông qua interface [PaymentService](src/domain/services/payment.service.ts).
- **Repository:** Trừu tượng hóa hoàn toàn tầng lưu trữ và thao tác dữ liệu khỏi logic nghiệp vụ ([src/domain/repositories/](src/domain/repositories/)).
- **Adapter:** Tương thích hóa driver kết nối PostgreSQL thông qua `PrismaPg` adapter ([src/lib/db.ts](src/lib/db.ts)).
- **Proxy:** Chặn và chuyển hướng tự động truy cập database production/development sang database test chạy trong Docker Testcontainers khi chạy kiểm thử (`vi.mock` trong các file test).
- **Dependency Injection (Constructor Injection):** Triển khai DI thủ công tại các Server Actions để inject trực tiếp các Repository/Service cụ thể vào Use Case giúp code có khả năng kiểm thử cao.

---

## 🚀 Hướng Dẫn Cài Đặt và Chạy Dự Án Cục Bộ

### Yêu cầu hệ thống
- **Node.js** phiên bản v18 trở lên.
- **Docker** đã được cài đặt và đang chạy (để khởi động PostgreSQL local & Testcontainers).

### Bước 1: Nhân bản dự án và cài đặt thư viện
```bash
npm install
```

### Bước 2: Thiết lập môi trường và cấu hình kết nối CSDL
1. Tạo một tệp `.env` tại thư mục gốc của dự án bằng cách copy từ `.env.example`:
   ```bash
   cp .env.example .env
   ```
2. Cấu hình chuỗi kết nối PostgreSQL của bạn và các thông số bảo mật trong tệp `.env`. Cấu hình mặc định sử dụng PostgreSQL chạy qua Docker:
   ```env
   DATABASE_URL="postgresql://floweruser:flowerpassword@localhost:5432/flowerdb?schema=public"
   NEXTAUTH_SECRET="e932b70f2b3c22ad65b8c0ea0c8fb16da9ee29be97bfd3e1d11fb719a28d5753"
   NEXTAUTH_URL="http://localhost:3000"

   # Cấu hình cổng thanh toán VNPay Sandbox (Tùy chọn, sẽ giả lập nếu bỏ trống)
   VNP_TMNCODE=""
   VNP_HASHSECRET=""
   VNP_URL="https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
   VNP_RETURNURL="http://localhost:3000/checkout/vnpay-return"
   ```

### Bước 3: Khởi chạy PostgreSQL Container bằng Docker
```bash
docker compose up -d
```

### Bước 4: Tạo cấu trúc bảng và Nạp dữ liệu mẫu (Seed Data)
1. Tạo bảng dữ liệu bằng Prisma Migrate:
   ```bash
   npx prisma migrate dev --name init
   ```
2. Tạo Client tương tác dữ liệu:
   ```bash
   npx prisma generate
   ```
3. Nạp dữ liệu mẫu (Sản phẩm hoa, Phân loại, Dịp tặng, các tài khoản thử nghiệm):
   ```bash
   npx prisma db seed
   ```

### Bước 5: Khởi chạy máy chủ phát triển
```bash
npm run dev
```
Mở trình duyệt truy cập: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Hướng Dẫn Chạy Kiểm Thử Tự Động (Testing)

Dự án sử dụng **Vitest** kết hợp với **Testcontainers** để tự động dựng một PostgreSQL database sạch trong Docker khi chạy kiểm thử Server Actions. Đảm bảo Docker đang chạy, sau đó thực thi lệnh:

```bash
npm test
```

Bộ test bao gồm:
* **Unit Tests**: Thuật toán sắp xếp chữ ký số và mã hóa VNPAY (`src/lib/vnpay.test.ts`).
* **Integration Tests**:
  * Quy trình giao dịch tạo đơn hàng, trừ tồn kho, rollback khi thiếu hàng và xử lý tự động callback VNPay thành công/thất bại hoàn trả tồn kho ([src/actions/orders.integration.test.ts](src/actions/orders.integration.test.ts)).
  * Quy trình CRUD sản phẩm, phân trang, lọc sản phẩm và đồng bộ dữ liệu kho ([src/actions/products.integration.test.ts](src/actions/products.integration.test.ts)).

---

## 👤 Tài Khoản Đăng Nhập Thử Nghiệm (Demo Accounts)

Hệ thống đã nạp sẵn dữ liệu tài khoản sau bước `seed` để bạn dễ dàng chạy thử nghiệm:

### 1. Tài khoản Khách hàng (Customer)
* **Email**: `customer@flowerdang.com`
* **Mật khẩu**: `customerpassword`

### 2. Tài khoản Quản trị viên (Admin)
* **Email**: `admin@flowerdang.com`
* **Mật khẩu**: `adminpassword`
