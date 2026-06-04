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
2. Cấu hình chuỗi kết nối PostgreSQL của bạn trong tệp `.env`. Cấu hình mặc định sử dụng PostgreSQL chạy qua Docker:
   ```env
   DATABASE_URL="postgresql://floweruser:flowerpassword@localhost:5432/flowerdb?schema=public"
   NEXTAUTH_SECRET="e932b70f2b3c22ad65b8c0ea0c8fb16da9ee29be97bfd3e1d11fb719a28d5753"
   NEXTAUTH_URL="http://localhost:3000"
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
* **Integration Tests**: Quy trình giao dịch tạo đơn hàng, trừ tồn kho, rollback khi thiếu hàng và xử lý tự động callback VNPay thành công/thất bại hoàn trả tồn kho (`src/actions/orders.integration.test.ts`).

---

## 👤 Tài Khoản Đăng Nhập Thử Nghiệm (Demo Accounts)

Hệ thống đã nạp sẵn dữ liệu tài khoản sau bước `seed` để bạn dễ dàng chạy thử nghiệm:

### 1. Tài khoản Khách hàng (Customer)
* **Email**: `customer@flowerdang.com`
* **Mật khẩu**: `customerpassword`

### 2. Tài khoản Quản trị viên (Admin)
* **Email**: `admin@flowerdang.com`
* **Mật khẩu**: `adminpassword`
