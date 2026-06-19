# ADR 0006: Sử dụng PaymentServiceFactory tại Server Action không sửa đổi CreateOrderUseCase

**Trạng thái:** Proposed

**Ngày:** 2026-06-19

## Ngữ cảnh (Context)

Hiện tại, trong `CreateOrderUseCase` (`src/application/use-cases/order/order.usecases.ts`), constructor nhận trực tiếp `paymentService: PaymentService` (hiện tại là `VNPayPaymentService`). Trong hàm `createOrder` Server Action (`src/actions/orders.ts`), instance `VNPayPaymentService` luôn được khởi tạo và truyền vào Usecase cho tất cả các phương thức thanh toán.

Để chuẩn bị cho việc mở rộng thêm các phương thức thanh toán online mới trong tương lai (Momo, ZaloPay...), chúng ta cần áp dụng Factory Pattern để đóng gói logic khởi tạo các Service thanh toán này. Tuy nhiên, chúng ta cần đảm bảo:
- **Không sửa đổi `CreateOrderUseCase`:** Giữ nguyên vẹn mã nguồn của Usecase để tránh rủi ro ảnh hưởng tới logic nghiệp vụ cốt lõi.
- **Chỉ áp dụng Factory ở tầng ngoài (Action Layer):** Nơi chịu trách nhiệm cấu hình và kết nối các thành phần (Composition Root).

## Quyết định (Decision)

Chúng tôi quyết định tạo **PaymentServiceFactory** tại tầng Infrastructure để khởi tạo `PaymentService` thích hợp và inject vào Usecase, giữ nguyên vẹn `CreateOrderUseCase`:

1. **Giữ nguyên hoàn toàn `CreateOrderUseCase`:**
   Không thực hiện bất kỳ thay đổi nào trong file `src/application/use-cases/order/order.usecases.ts`.

2. **Xây dựng `PaymentServiceFactory` tại tầng Infrastructure:**
   Factory chịu trách nhiệm tạo ra `PaymentService` tương ứng. Đối với phương thức thanh toán ngoại tuyến như COD, Factory sẽ trả về `VNPayPaymentService` làm fallback mặc định (tương ứng với hành vi hiện tại của hệ thống khi luôn truyền `VNPayPaymentService` cho mọi phương thức):
   ```typescript
   export class PaymentServiceFactory {
     static create(method: PaymentMethod): PaymentService {
       switch (method) {
         case PaymentMethod.VNPAY:
           return new VNPayPaymentService();
         default:
           // COD hoặc các phương thức khác, mặc định trả về VNPayPaymentService
           // do Usecase hiện tại luôn nhận VNPayPaymentService làm paymentService
           return new VNPayPaymentService();
       }
     }
   }
   ```

3. **Cấu hình tại Server Action (`src/actions/orders.ts`):**
   Thay thế việc khởi tạo trực tiếp bằng việc gọi Factory:
   ```typescript
   // Thay vì: const paymentService = new VNPayPaymentService();
   const paymentService = PaymentServiceFactory.create(input.paymentMethod);
   const useCase = new CreateOrderUseCase(orderRepo, productRepo, paymentService);
   ```

## Hệ quả (Consequences)

### Điểm tích cực (Positives)
- **An toàn tuyệt đối cho Usecase:** Không có bất kỳ thay đổi nào đối với logic nghiệp vụ cốt lõi của Usecase, loại bỏ hoàn toàn rủi ro gây lỗi hồi quy (regression) tại core layer.
- **Chuẩn bị sẵn sàng cho mở rộng:** Khi thêm phương thức online mới (như Momo), ta chỉ cần đăng ký Service mới trong Factory. Việc khởi tạo động đã được giải quyết xong tại Server Action.
- **Surgical Edits:** Thay đổi tối thiểu cần thiết để đạt được mục tiêu cấu hình Factory.

### Đánh đổi (Negatives)
- Usecase hiện tại vẫn chứa logic rẽ nhánh cứng cho VNPay (`if (input.paymentMethod === PaymentMethod.VNPAY)`). Khi thêm phương thức thanh toán online mới trong tương lai, lúc đó chúng ta mới cần cập nhật logic rẽ nhánh này trong Usecase (hoặc chuyển sang đa hình hoàn toàn). Đây là bước đi an toàn và có kiểm soát.
