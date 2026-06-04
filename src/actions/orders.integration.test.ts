import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { GenericContainer, StartedTestContainer } from "testcontainers";
import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { createOrder, handleVNPayCallback } from "./orders";
import { PaymentMethod, PaymentStatus, OrderStatus } from "@prisma/client";

// 1. Mock NextAuth to return a valid customer session
vi.mock("@/auth", () => {
  return {
    auth: vi.fn().mockResolvedValue({
      user: {
        id: "test-customer-id-123",
        name: "Test Customer",
        email: "testcustomer@example.com",
        role: "CUSTOMER",
      },
    }),
  };
});

// Mock next/cache since it expects Next.js environment context
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

// 2. Mock database to redirect all calls to our container instance via global Proxy
vi.mock("@/lib/db", () => {
  return {
    db: new Proxy({} as any, {
      get(target, prop) {
        const testDb = (globalThis as any).testPrisma;
        if (!testDb) {
          throw new Error("Test Prisma client not initialized yet.");
        }
        return testDb[prop];
      },
    }),
  };
});

describe("Orders Server Actions Integration Tests (PostgreSQL Testcontainer)", () => {
  let container: StartedTestContainer;
  let prisma: PrismaClient;
  let pool: Pool;
  let connectionString: string;

  // Variables to hold seeded database identifiers
  let categoryId: string;
  let occasionId: string;
  let productId: string;
  const initialStock = 20;
  const productPrice = 500000;

  beforeAll(async () => {
    console.log("Spinning up PostgreSQL Testcontainer...");
    
    // Start Postgres generic container
    container = await new GenericContainer("postgres:15-alpine")
      .withExposedPorts(5432)
      .withEnvironment({
        POSTGRES_USER: "testuser",
        POSTGRES_PASSWORD: "testpassword",
        POSTGRES_DB: "testdb",
      })
      .start();

    const host = container.getHost();
    const port = container.getMappedPort(5432);
    connectionString = `postgresql://testuser:testpassword@${host}:${port}/testdb?schema=public`;

    console.log(`Testcontainer database ready at ${connectionString}`);

    // Push Prisma schema to this test database
    console.log("Pushing Prisma schema to Testcontainer...");
    execSync("npx prisma db push", {
      env: {
        ...process.env,
        DATABASE_URL: connectionString,
      },
    });

    // Initialize Prisma Client pointing to test container DB
    pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });

    // Inject this instance into globalThis for the database Proxy mock to use
    (globalThis as any).testPrisma = prisma;

    // Seed initial data for integration tests
    console.log("Seeding test database fixtures...");
    
    // Create test user
    await prisma.user.create({
      data: {
        id: "test-customer-id-123",
        name: "Test Customer",
        email: "testcustomer@example.com",
        password: "hashedpassword123",
        role: "CUSTOMER",
      },
    });

    // Create Category & Occasion
    const category = await prisma.category.create({
      data: {
        name: "Hoa Hồng Đẹp",
        slug: "hoa-hong-dep",
        description: "Test Category",
      },
    });
    categoryId = category.id;

    const occasion = await prisma.occasion.create({
      data: {
        name: "Sinh Nhật Test",
        slug: "sinh-nhat-test",
        description: "Test Occasion",
      },
    });
    occasionId = occasion.id;

    // Create Product
    const product = await prisma.product.create({
      data: {
        name: "Bó Hoa Hồng Sinh Nhật",
        slug: "bo-hoa-hong-sinh-nhat",
        description: "Bó hoa hồng xinh đẹp dành cho sinh nhật",
        price: productPrice,
        stock: initialStock,
        images: ["https://example.com/test-flower.jpg"],
        categoryId,
        occasionId,
      },
    });
    productId = product.id;

    console.log("Database seeded successfully.");
  }, 90000); // 90 seconds timeout for container startup, schema pushing, and seeding

  afterAll(async () => {
    // Clean up connections and container
    if (prisma) await prisma.$disconnect();
    if (pool) await pool.end();
    if (container) await container.stop();
    console.log("Testcontainer stopped.");
  });

  it("should verify test db seed data exists", async () => {
    const prod = await prisma.product.findUnique({ where: { id: productId } });
    expect(prod).toBeDefined();
    expect(prod?.stock).toBe(initialStock);
    expect(Number(prod?.price)).toBe(productPrice);
  });

  it("should successfully place a COD order and reduce product stock", async () => {
    const orderInput = {
      recipientName: "Nguyễn Văn Nhận",
      recipientPhone: "0901234567",
      deliveryAddress: "123 Đường Láng, Hà Nội",
      deliveryDateStr: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days in future
      deliveryTime: "09:00 - 11:00",
      cardTitle: "Chúc mừng sinh nhật",
      cardMessage: "Chúc bạn tuổi mới nhiều niềm vui",
      paymentMethod: PaymentMethod.COD,
      items: [
        {
          productId: productId,
          quantity: 3,
        },
      ],
    };

    const result = await createOrder(orderInput, "127.0.0.1");

    expect(result.success).toBe(true);
    expect(result.orderId).toBeDefined();
    expect(result.paymentMethod).toBe(PaymentMethod.COD);

    // Verify order database entry
    const order = await prisma.order.findUnique({
      where: { id: result.orderId },
      include: { items: true },
    });

    expect(order).not.toBeNull();
    expect(order?.recipientName).toBe(orderInput.recipientName);
    expect(order?.status).toBe(OrderStatus.PENDING_CONFIRMATION);
    expect(order?.paymentStatus).toBe(PaymentStatus.UNPAID);
    expect(order?.items.length).toBe(1);
    expect(order?.items[0].productId).toBe(productId);
    expect(order?.items[0].quantity).toBe(3);
    expect(Number(order?.totalPrice)).toBe(productPrice * 3);

    // Verify product stock was decremented from 20 to 17
    const product = await prisma.product.findUnique({ where: { id: productId } });
    expect(product?.stock).toBe(initialStock - 3);
  });

  it("should throw an error and rollback stock changes if product stock is insufficient", async () => {
    const orderInput = {
      recipientName: "Nguyễn Văn Nhận",
      recipientPhone: "0901234567",
      deliveryAddress: "123 Đường Láng, Hà Nội",
      deliveryDateStr: new Date(Date.now() + 86400000 * 2).toISOString(),
      deliveryTime: "09:00 - 11:00",
      paymentMethod: PaymentMethod.COD,
      items: [
        {
          productId: productId,
          quantity: 50, // Insufficient stock (current stock: 17)
        },
      ],
    };

    // Assert that the order creation fails
    await expect(createOrder(orderInput, "127.0.0.1")).rejects.toThrow();

    // Verify that the product stock remains 17 (no change)
    const product = await prisma.product.findUnique({ where: { id: productId } });
    expect(product?.stock).toBe(initialStock - 3);
  });

  it("should process a successful VNPay payment callback, updating order status to PAID and PROCESSING", async () => {
    // 1. Create a VNPAY order first (current stock is 17)
    const orderInput = {
      recipientName: "Khách Thanh Toán Trực Tuyến",
      recipientPhone: "0909998887",
      deliveryAddress: "456 Kim Mã, Hà Nội",
      deliveryDateStr: new Date(Date.now() + 86400000 * 3).toISOString(),
      deliveryTime: "13:00 - 17:00",
      paymentMethod: PaymentMethod.VNPAY,
      items: [
        {
          productId: productId,
          quantity: 2, // Deducts stock from 17 to 15
        },
      ],
    };

    const orderResult = await createOrder(orderInput, "127.0.0.1");
    expect(orderResult.success).toBe(true);
    expect(orderResult.paymentUrl).toBeDefined();
    const orderId = orderResult.orderId!;

    // 2. Generate a valid VNPay query payload
    const testParams = {
      vnp_Amount: (productPrice * 2 * 100).toString(),
      vnp_Command: "pay",
      vnp_CreateDate: "20260604160000",
      vnp_CurrCode: "VND",
      vnp_IpAddr: "127.0.0.1",
      vnp_Locale: "vn",
      vnp_OrderInfo: `Thanh toan don hang hoa ${orderId.slice(0, 8)}`,
      vnp_OrderType: "other",
      vnp_ReturnUrl: "http://localhost:3000/checkout/vnpay-return",
      vnp_TmnCode: "2QXG2Y51",
      vnp_TxnRef: orderId,
      vnp_Version: "2.1.0",
      vnp_ResponseCode: "00", // Success
    };

    const sortedKeys = Object.keys(testParams).sort() as Array<keyof typeof testParams>;
    const signData = new URLSearchParams();
    for (const key of sortedKeys) {
      signData.append(key, testParams[key]);
    }
    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha512", "GET_YOURS_FROM_VNPAY");
    const secureHash = hmac.update(Buffer.from(signData.toString(), "utf-8")).digest("hex");

    const payload = {
      ...testParams,
      vnp_SecureHash: secureHash,
    };

    // 3. Process the callback action
    const callbackResult = await handleVNPayCallback(payload);
    expect(callbackResult.success).toBe(true);
    expect(callbackResult.orderId).toBe(orderId);

    // 4. Verify DB state updates
    const updatedOrder = await prisma.order.findUnique({ where: { id: orderId } });
    expect(updatedOrder?.paymentStatus).toBe(PaymentStatus.PAID);
    expect(updatedOrder?.status).toBe(OrderStatus.PROCESSING);

    // Verify stock remains 15 (paid successfully)
    const product = await prisma.product.findUnique({ where: { id: productId } });
    expect(product?.stock).toBe(15);
  });

  it("should process a failed VNPay payment callback, canceling the order and reverting product stock", async () => {
    // 1. Create a VNPAY order first (current stock is 15)
    const orderInput = {
      recipientName: "Khách Thanh Toán Hủy",
      recipientPhone: "0901112223",
      deliveryAddress: "789 Hoàng Hoa Thám, Hà Nội",
      deliveryDateStr: new Date(Date.now() + 86400000 * 3).toISOString(),
      deliveryTime: "17:00 - 21:00",
      paymentMethod: PaymentMethod.VNPAY,
      items: [
        {
          productId: productId,
          quantity: 5, // Deducts stock from 15 to 10
        },
      ],
    };

    const orderResult = await createOrder(orderInput, "127.0.0.1");
    expect(orderResult.success).toBe(true);
    const orderId = orderResult.orderId!;

    // 2. Generate a failed VNPay query payload (vnp_ResponseCode is "24" - customer cancelled)
    const testParams = {
      vnp_Amount: (productPrice * 5 * 100).toString(),
      vnp_Command: "pay",
      vnp_CreateDate: "20260604160000",
      vnp_CurrCode: "VND",
      vnp_IpAddr: "127.0.0.1",
      vnp_Locale: "vn",
      vnp_OrderInfo: `Thanh toan don hang hoa ${orderId.slice(0, 8)}`,
      vnp_OrderType: "other",
      vnp_ReturnUrl: "http://localhost:3000/checkout/vnpay-return",
      vnp_TmnCode: "2QXG2Y51",
      vnp_TxnRef: orderId,
      vnp_Version: "2.1.0",
      vnp_ResponseCode: "24", // Failure/Cancelled
    };

    const sortedKeys = Object.keys(testParams).sort() as Array<keyof typeof testParams>;
    const signData = new URLSearchParams();
    for (const key of sortedKeys) {
      signData.append(key, testParams[key]);
    }
    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha512", "GET_YOURS_FROM_VNPAY");
    const secureHash = hmac.update(Buffer.from(signData.toString(), "utf-8")).digest("hex");

    const payload = {
      ...testParams,
      vnp_SecureHash: secureHash,
    };

    // 3. Process the callback action
    const callbackResult = await handleVNPayCallback(payload);
    expect(callbackResult.success).toBe(false);

    // 4. Verify DB state updates
    const updatedOrder = await prisma.order.findUnique({ where: { id: orderId } });
    expect(updatedOrder?.paymentStatus).toBe(PaymentStatus.UNPAID);
    expect(updatedOrder?.status).toBe(OrderStatus.CANCELLED);

    // Verify stock is reverted back from 10 to 15!
    const product = await prisma.product.findUnique({ where: { id: productId } });
    expect(product?.stock).toBe(15);
  });
});
