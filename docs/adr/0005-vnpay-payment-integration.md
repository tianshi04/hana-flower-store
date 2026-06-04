# ADR 0005: Tích hợp phương thức thanh toán VNPay và COD

**Trạng thái:** Accepted

**Ngày:** 2026-06-04

## Ngữ cảnh (Context)
Đối với một trang thương mại điện tử bán hoa tại Việt Nam, khách hàng cần được hỗ trợ hai luồng thanh toán chính:
1. **Thanh toán khi nhận hàng (COD - Cash on Delivery)**: Phổ biến, an toàn cho khách hàng, nhưng đòi hỏi nhân viên cửa hàng phải xác nhận đơn hàng trước khi chuẩn bị hoa.
2. **Thanh toán trực tuyến (VNPay)**: Phương thức thanh toán phổ biến qua ứng dụng ngân hàng và ví điện tử, giúp giảm tỷ lệ hủy đơn ảo và tăng tiện lợi.

Yêu cầu tích hợp VNPay cần giải quyết vấn đề sandbox phát triển vì VNPay yêu cầu hồ sơ doanh nghiệp để có API production. 

## Quyết định (Decision)
Chúng tôi quyết định tích hợp cả hai phương thức thanh toán:
1. **COD**: Luồng đơn hàng đi từ trạng thái `PENDING_CONFIRMATION` -> Admin xác nhận -> `PROCESSING` -> `SHIPPING` -> `DELIVERED` -> Thu tiền.
2. **VNPay (Mô phỏng & Sandbox)**: Xây dựng bộ SDK tính toán mã băm SHA512 để tạo URL chuyển hướng đến VNPay Sandbox. Đối với môi trường phát triển cục bộ không có tài khoản VNPay hoặc không cấu hình được IPN, chúng tôi sẽ xây dựng một **Trang Giả lập Cổng Thanh toán VNPay** nội bộ (Simulated Payment Page) mô tả đúng luồng tham số của VNPay, để kiểm tra logic cập nhật trạng thái đơn hàng thông qua mã băm bảo mật.

Lý do chọn:
- **Trải nghiệm thực tế**: Người dùng vẫn trải nghiệm đầy đủ quá trình chọn thanh toán ngân hàng, quét mã QR/nhập thẻ và nhận kết quả thanh toán.
- **Tính khả thi**: Giúp đồ án chạy độc lập và ổn định ở mọi môi trường mà không bị phụ thuộc vào việc đăng ký kinh doanh với VNPay.

## Hệ quả (Consequences)
- **Điểm tích cực**:
  - Hỗ trợ đầy đủ luồng thanh toán online và offline.
  - Mã nguồn xây dựng thuật toán ký số VNPay (hàm `vnp_SecureHash`) hoàn toàn tương thích và có thể chuyển sang cổng VNPay thật dễ dàng chỉ bằng cách thay đổi các biến môi trường cấu hình API (`VNP_TMNCODE`, `VNP_HASHSECRET`).
- **Đánh đổi**:
  - Phải duy trì mã logic giả lập VNPay trong dự án phục vụ cho mục đích chạy thử nghiệm.
