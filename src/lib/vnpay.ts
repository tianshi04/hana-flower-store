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
 * Sorts and URL-encodes an object's keys and values according to official VNPay guidelines:
 * - Keys are sorted alphabetically.
 * - Spaces in values must be encoded as "+" instead of "%20".
 */
function sortObject(obj: Record<string, any>): Record<string, any> {
  const sorted: Record<string, any> = {};
  const keys = Object.keys(obj).map(k => encodeURIComponent(k)).sort();
  for (const key of keys) {
    const val = obj[key];
    if (val !== undefined && val !== null) {
      // encode value and replace %20 with + as strictly required by VNPay
      sorted[key] = encodeURIComponent(val.toString()).replace(/%20/g, "+");
    }
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
 * Generates the redirect URL for VNPay Payment using the official encoding schema
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
    vnp_Amount: amount * 100, // VNPay amount is in cents/hào (VND * 100)
    vnp_ReturnUrl: config.returnUrl,
    vnp_IpAddr: ipAddress || "127.0.0.1",
    vnp_CreateDate: createDate,
  };

  // Filter out any undefined or empty values
  const filteredParams: Record<string, any> = {};
  for (const [key, value] of Object.entries(vnpParams)) {
    if (value !== undefined && value !== null && value !== "") {
      filteredParams[key] = value;
    }
  }

  const sortedParams = sortObject(filteredParams);

  // Concatenate sorted parameters to form the signature input data
  const signQuery = Object.keys(sortedParams)
    .map((key) => `${key}=${sortedParams[key]}`)
    .join("&");

  // Sign hash calculation using HMAC-SHA512
  const hmac = crypto.createHmac("sha512", config.hashSecret);
  const signed = hmac.update(Buffer.from(signQuery, "utf-8")).digest("hex");

  // Append the signature parameter to the final URL
  return `${config.vnpUrl}?${signQuery}&vnp_SecureHash=${signed}`;
}

/**
 * Validates the VNPay return parameters using the official secure hash validation algorithm
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

  // Filter out secure hash parameters and only include actual vnp_ values for validation
  const vnpParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(queryParams)) {
    if (key.startsWith("vnp_") && key !== "vnp_SecureHash" && key !== "vnp_SecureHashType") {
      vnpParams[key] = value;
    }
  }

  const sortedParams = sortObject(vnpParams);

  // Generate signData query string
  const signQuery = Object.keys(sortedParams)
    .map((key) => `${key}=${sortedParams[key]}`)
    .join("&");

  const hmac = crypto.createHmac("sha512", config.hashSecret);
  const checkSignature = hmac.update(Buffer.from(signQuery, "utf-8")).digest("hex");

  // Validate signature matching
  const isValid = secureHash === checkSignature;
  const isSuccess = responseCode === "00";
  const amount = parseInt(amountStr, 10) / 100;

  return {
    isValid,
    orderId: txnRef,
    amount,
    responseCode,
    isSuccess,
  };
}
