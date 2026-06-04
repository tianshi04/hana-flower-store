import crypto from "crypto";

interface VNPayConfig {
  tmnCode: string;
  hashSecret: string;
  vnpUrl: string;
  returnUrl: string;
}

// Default values point to VNPay Sandbox
const config: VNPayConfig = {
  tmnCode: process.env.VNP_TMNCODE || "2QXG2Y51",
  hashSecret: process.env.VNP_HASHSECRET || "GET_YOURS_FROM_VNPAY",
  vnpUrl: process.env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  returnUrl: process.env.VNP_RETURNURL || "http://localhost:3000/checkout/vnpay-return",
};

/**
 * Sorts an object's keys alphabetically (required by VNPay)
 */
function sortObject(obj: Record<string, any>): Record<string, any> {
  const sorted: Record<string, any> = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    sorted[key] = obj[key];
  }
  return sorted;
}

/**
 * Formats a Date object to yyyyMMddHHmmss format required by VNPay
 */
function formatDate(date: Date): string {
  const pad = (num: number) => num.toString().padStart(2, "0");
  return (
    date.getFullYear() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}

/**
 * Generates the redirect URL for VNPay Payment
 */
export function generateVNPayUrl({
  orderId,
  amount,
  ipAddress,
  orderInfo = "Thanh toan don hang hoa tuoi",
}: {
  orderId: string;
  amount: number;
  ipAddress: string;
  orderInfo?: string;
}): string {
  const date = new Date();
  const createDate = formatDate(date);

  // VNPay parameters
  const vnpParams: Record<string, any> = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: config.tmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: "other",
    vnp_Amount: amount * 100, // VNPay amount is in cents/hào, so multiply by 100 for VND
    vnp_ReturnUrl: config.returnUrl,
    vnp_IpAddr: ipAddress || "127.0.0.1",
    vnp_CreateDate: createDate,
  };

  const sortedParams = sortObject(vnpParams);

  // Generate query string
  const signData = new URLSearchParams();
  for (const [key, value] of Object.entries(sortedParams)) {
    if (value !== undefined && value !== null && value !== "") {
      signData.append(key, value.toString());
    }
  }

  const signQuery = signData.toString();

  // Sign hash calculation
  const hmac = crypto.createHmac("sha512", config.hashSecret);
  const signed = hmac.update(Buffer.from(signQuery, "utf-8")).digest("hex");

  signData.append("vnp_SecureHash", signed);

  return `${config.vnpUrl}?${signData.toString()}`;
}

/**
 * Validates the VNPay return parameters using secure hash signature matching
 */
export function verifyVNPaySignature(queryParams: Record<string, string>): {
  isValid: boolean;
  orderId: string;
  amount: number;
  responseCode: string;
  isSuccess: boolean;
} {
  const secureHash = queryParams["vnp_SecureHash"];
  const txnRef = queryParams["vnp_TxnRef"] || "";
  const amountStr = queryParams["vnp_Amount"] || "0";
  const responseCode = queryParams["vnp_ResponseCode"] || "";

  // Filter out secure hash parameters for signature validation
  const vnpParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(queryParams)) {
    if (key !== "vnp_SecureHash" && key !== "vnp_SecureHashType") {
      vnpParams[key] = value;
    }
  }

  const sortedParams = sortObject(vnpParams);

  const signData = new URLSearchParams();
  for (const [key, value] of Object.entries(sortedParams)) {
    if (value !== undefined && value !== null && value !== "") {
      signData.append(key, value);
    }
  }

  const hmac = crypto.createHmac("sha512", config.hashSecret);
  const checkSignature = hmac.update(Buffer.from(signData.toString(), "utf-8")).digest("hex");

  // Validate signature
  const isValid = secureHash === checkSignature;
  const isSuccess = responseCode === "00"; // VNPay "00" indicates transaction success
  const amount = parseInt(amountStr, 10) / 100;

  return {
    isValid,
    orderId: txnRef,
    amount,
    responseCode,
    isSuccess,
  };
}
