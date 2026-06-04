import {
  PaymentService,
  GeneratePaymentUrlInput,
  VerifyPaymentCallbackResult,
} from "@/domain/services/payment.service";
import { generateVNPayUrl, verifyVNPaySignature } from "@/lib/vnpay";

export class VNPayPaymentService implements PaymentService {
  generatePaymentUrl(input: GeneratePaymentUrlInput): string {
    return generateVNPayUrl({
      orderId: input.orderId,
      amount: input.amount,
      ipAddress: input.ipAddress,
      orderInfo: input.orderInfo,
    });
  }

  verifyPaymentCallback(queryParams: Record<string, string>): VerifyPaymentCallbackResult {
    return verifyVNPaySignature(queryParams);
  }
}
