import { describe, it, expect } from "vitest";
import { generateVNPayUrl, verifyVNPaySignature } from "./vnpay";

describe("VNPay Payment Utility Tests", () => {
  const mockConfig = {
    orderId: "test-order-12345",
    amount: 150000,
    ipAddress: "127.0.0.1",
    orderInfo: "Thanh toan test",
  };

  it("should generate a valid VNPay payment redirect URL", () => {
    const url = generateVNPayUrl(mockConfig);

    expect(url).toBeDefined();
    expect(url.startsWith("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html")).toBe(true);

    const parsedUrl = new URL(url);
    expect(parsedUrl.searchParams.get("vnp_Command")).toBe("pay");
    expect(parsedUrl.searchParams.get("vnp_TmnCode")).toBe(process.env.VNP_TMNCODE || "2QXG2Y51");
    expect(parsedUrl.searchParams.get("vnp_TxnRef")).toBe(mockConfig.orderId);
    expect(parsedUrl.searchParams.get("vnp_Amount")).toBe("15000000"); // 150000 * 100
    expect(parsedUrl.searchParams.get("vnp_SecureHash")).not.toBeNull();
  });

  it("should verify a valid signature returned from VNPay redirect", () => {
    // Generate a URL to get the hash signature for checking
    const url = generateVNPayUrl(mockConfig);
    const parsedUrl = new URL(url);
    
    // Extract query parameters as record
    const queryParams: Record<string, string> = {};
    parsedUrl.searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    // Artificially append response code indicating success
    queryParams["vnp_ResponseCode"] = "00";
    
    // Regenerate signature including the ResponseCode (VNPay return contains ResponseCode)
    // To make verifySignature pass, we need to match the signature that would be generated
    // with that ResponseCode.
    const verifyResult = verifyVNPaySignature(queryParams);
    
    // Let's test custom mock parameters to verify logic
    const testParams = {
      vnp_Amount: "15000000",
      vnp_Command: "pay",
      vnp_CreateDate: queryParams["vnp_CreateDate"],
      vnp_CurrCode: "VND",
      vnp_IpAddr: "127.0.0.1",
      vnp_Locale: "vn",
      vnp_OrderInfo: "Thanh toan test",
      vnp_OrderType: "other",
      vnp_ReturnUrl: "http://localhost:3000/checkout/vnpay-return",
      vnp_TmnCode: "2QXG2Y51",
      vnp_TxnRef: "test-order-12345",
      vnp_Version: "2.1.0",
      vnp_ResponseCode: "00",
    };

    // Calculate valid secure hash manually with default secret key
    const sortedKeys = Object.keys(testParams).sort() as Array<keyof typeof testParams>;
    const signData = new URLSearchParams();
    for (const key of sortedKeys) {
      signData.append(key, testParams[key]);
    }
    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha512", process.env.VNP_HASHSECRET || "GET_YOURS_FROM_VNPAY");
    const testHash = hmac.update(Buffer.from(signData.toString(), "utf-8")).digest("hex");

    const payload = {
      ...testParams,
      vnp_SecureHash: testHash,
    };

    const verifyOutput = verifyVNPaySignature(payload);
    expect(verifyOutput.isValid).toBe(true);
    expect(verifyOutput.isSuccess).toBe(true);
    expect(verifyOutput.orderId).toBe("test-order-12345");
    expect(verifyOutput.amount).toBe(150000);
  });

  it("should fail validation if signature is tampered", () => {
    const testParams = {
      vnp_Amount: "15000000",
      vnp_TxnRef: "test-order-12345",
      vnp_ResponseCode: "00",
      vnp_SecureHash: "tamperedhash12345",
    };

    const verifyOutput = verifyVNPaySignature(testParams);
    expect(verifyOutput.isValid).toBe(false);
  });
});
