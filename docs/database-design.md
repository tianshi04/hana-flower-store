# Thiết kế Cơ sở dữ liệu (Database Design)

Tài liệu này chi tiết cấu trúc các bảng dữ liệu (Tables), mối quan hệ (Relationships) và kiểu dữ liệu được sử dụng trong hệ thống bán hoa tươi. Cấu trúc này sẽ được hiện thực hóa thông qua Prisma ORM kết nối với PostgreSQL.

---

## 1. Sơ đồ thực thể quan hệ (Entity Relationship - ERD)

Các thực thể chính trong hệ thống bao gồm:
- **User**: Người dùng (Khách hàng & Admin).
- **Product**: Sản phẩm hoa tươi.
- **Category**: Phân loại theo loại hoa.
- **Occasion**: Phân loại theo dịp tặng hoa.
- **Order**: Thông tin đơn hàng và giao nhận.
- **OrderItem**: Chi tiết từng mặt hàng trong đơn hàng.
- **Review**: Đánh giá sản phẩm từ người dùng.

---

## 2. Chi tiết cấu trúc các bảng (Tables Metadata)

### 2.1. Bảng `User` (Người dùng)
Lưu trữ thông tin tài khoản đăng nhập và phân quyền.

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | Primary Key | Định danh duy nhất |
| `name` | String | | Họ tên đầy đủ |
| `email` | String | Unique | Địa chỉ email đăng nhập |
| `password` | String | | Mật khẩu đã băm (bcrypt) |
| `role` | Enum (`CUSTOMER`, `ADMIN`) | Default: `CUSTOMER` | Phân quyền truy cập |
| `createdAt` | DateTime | Default: `now()` | Thời gian tạo tài khoản |
| `updatedAt` | DateTime | UpdatedAt | Thời gian cập nhật gần nhất |

### 2.2. Bảng `Category` (Phân loại hoa)
Ví dụ: Hoa hồng, Hoa cúc, Hoa tulip.

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | Primary Key | Định danh duy nhất |
| `name` | String | Unique | Tên danh mục |
| `slug` | String | Unique | Chuỗi đường dẫn thân thiện (SEO) |
| `description`| String | Optional | Mô tả ngắn danh mục |

### 2.3. Bảng `Occasion` (Dịp tặng hoa)
Ví dụ: Sinh nhật, Tình yêu, Khai trương, Chia buồn.

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | Primary Key | Định danh duy nhất |
| `name` | String | Unique | Tên dịp lễ |
| `slug` | String | Unique | Chuỗi đường dẫn thân thiện |
| `description`| String | Optional | Mô tả ngắn |

### 2.4. Bảng `Product` (Sản phẩm hoa)

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | Primary Key | Định danh duy nhất |
| `name` | String | | Tên sản phẩm hoa |
| `slug` | String | Unique | Đường dẫn SEO |
| `description`| String | | Mô tả chi tiết (thành phần hoa, ý nghĩa) |
| `price` | Decimal | | Giá bán (VND) |
| `images` | String[] | | Danh sách URL ảnh sản phẩm |
| `stock` | Integer | Default: 0 | Số lượng có sẵn |
| `categoryId` | String (UUID) | Foreign Key | Liên kết tới bảng `Category` |
| `occasionId` | String (UUID) | Foreign Key | Liên kết tới bảng `Occasion` |
| `createdAt` | DateTime | Default: `now()` | Thời gian tạo |
| `updatedAt` | DateTime | UpdatedAt | Thời gian sửa |

### 2.5. Bảng `Order` (Đơn hàng)

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | Primary Key | Định danh duy nhất |
| `userId` | String (UUID) | Foreign Key | Người đặt hàng (Khách hàng) |
| `totalPrice` | Decimal | | Tổng giá trị đơn hàng |
| `recipientName`| String | | Tên người nhận hoa |
| `recipientPhone`| String | | Số điện thoại người nhận |
| `deliveryAddress`| String | | Địa chỉ giao hoa chi tiết |
| `deliveryDate`| Date | | Ngày giao hoa mong muốn |
| `deliveryTime`| String | | Khung giờ giao hoa (ví dụ: "09:00 - 11:00") |
| `cardTitle` | String | Optional | Loại thiệp (ví dụ: "Chúc mừng sinh nhật") |
| `cardMessage`| String | Optional | Lời nhắn viết lên thiệp chúc mừng |
| `status` | Enum | Default: `PENDING_CONFIRMATION` | Trạng thái: `PENDING_CONFIRMATION`, `PROCESSING`, `SHIPPING`, `DELIVERED`, `CANCELLED` |
| `paymentMethod`| Enum | Default: `COD` | Phương thức: `COD`, `VNPAY` |
| `paymentStatus`| Enum | Default: `UNPAID` | Trạng thái thanh toán: `UNPAID`, `PAID`, `REFUNDED` |
| `createdAt` | DateTime | Default: `now()` | Thời gian đặt hàng |
| `updatedAt` | DateTime | UpdatedAt | Thời gian cập nhật |

### 2.6. Bảng `OrderItem` (Chi tiết đơn hàng)

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | Primary Key | Định danh duy nhất |
| `orderId` | String (UUID) | Foreign Key | Liên kết tới bảng `Order` (Cascade delete) |
| `productId` | String (UUID) | Foreign Key | Liên kết tới bảng `Product` (Set null/Restrict) |
| `quantity` | Integer | | Số lượng hoa đặt mua |
| `price` | Decimal | | Giá bán tại thời điểm mua hàng |

### 2.7. Bảng `Review` (Đánh giá)

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | Primary Key | Định danh duy nhất |
| `userId` | String (UUID) | Foreign Key | Người đánh giá |
| `productId` | String (UUID) | Foreign Key | Sản phẩm được đánh giá |
| `rating` | Integer | | Điểm đánh giá (1 đến 5 sao) |
| `comment` | String | Optional | Nhận xét chi tiết từ khách |
| `createdAt` | DateTime | Default: `now()` | Ngày tạo đánh giá |

---

## 3. Mối quan hệ giữa các bảng (Relationships)
1. **User - Order** (`1 - N`): Một khách hàng có thể đặt nhiều đơn hàng.
2. **Category - Product** (`1 - N`): Một danh mục hoa chứa nhiều sản phẩm hoa.
3. **Occasion - Product** (`1 - N`): Một dịp lễ (ví dụ Valentine) có nhiều sản phẩm hoa phù hợp.
4. **Order - OrderItem** (`1 - N`): Một đơn hàng có nhiều chi tiết mặt hàng hoa. Khi xóa đơn hàng, các chi tiết đơn tương ứng sẽ bị xóa theo (`onDelete: Cascade`).
5. **Product - OrderItem** (`1 - N`): Một sản phẩm hoa có thể xuất hiện trong nhiều đơn hàng khác nhau.
6. **Product - Review** (`1 - N`): Một sản phẩm hoa nhận được nhiều lượt đánh giá của các khách hàng khác nhau.
7. **User - Review** (`1 - N`): Một người dùng có thể gửi nhiều đánh giá cho các sản phẩm khác nhau.
