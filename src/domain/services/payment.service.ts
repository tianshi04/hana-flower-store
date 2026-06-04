export interface GeneratePaymentUrlInput {
  orderId: string;
  amount: number;
  ipAddress: string;
  orderInfo?: string;
}

export interface VerifyPaymentCallbackResult {
  isValid: boolean;
  orderId: string;
  amount: number;
  responseCode: string;
  isSuccess: boolean;
}

export interface PaymentService {
  generatePaymentUrl(input: GeneratePaymentUrlInput): string;
  verifyPaymentCallback(queryParams: Record<string, string>): VerifyPaymentCallbackResult;
}
