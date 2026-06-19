import { PaymentMethod } from "@prisma/client";
import { PaymentService } from "@/domain/services/payment.service";
import { VNPayPaymentService } from "@/infrastructure/services/vnpay-payment.service";

export class PaymentServiceFactory {
  static create(method: PaymentMethod): PaymentService {
    switch (method) {
      case PaymentMethod.VNPAY:
        return new VNPayPaymentService();
      default:
        // COD hoặc các phương thức khác, mặc định trả về VNPayPaymentService
        // do CreateOrderUseCase hiện tại luôn nhận VNPayPaymentService làm paymentService
        return new VNPayPaymentService();
    }
  }
}
