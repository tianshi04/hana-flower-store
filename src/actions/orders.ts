"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { generateVNPayUrl, verifyVNPaySignature } from "@/lib/vnpay";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";

interface OrderItemInput {
  productId: string;
  quantity: number;
}

interface CreateOrderInput {
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  deliveryDateStr: string; // ISO date string
  deliveryTime: string;
  cardTitle?: string;
  cardMessage?: string;
  paymentMethod: PaymentMethod;
  items: OrderItemInput[];
}

export async function createOrder(input: CreateOrderInput, ipAddress: string = "127.0.0.1") {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("You must be logged in to place an order.");
  }
  const userId = session.user.id;

  if (input.items.length === 0) {
    throw new Error("Your cart is empty.");
  }

  // 1. Get products from database to check price and stock
  const productIds = input.items.map((item) => item.productId);
  const dbProducts = await db.product.findMany({
    where: { id: { in: productIds } },
  });

  const productMap = new Map(dbProducts.map((p) => [p.id, p]));

  // Calculate total price and verify stock availability
  let totalPrice = 0;
  const orderItemsData: any[] = [];

  for (const item of input.items) {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    if (product.stock < item.quantity) {
      throw new Error(`Sản phẩm "${product.name}" không đủ hàng trong kho (Còn lại: ${product.stock}).`);
    }

    const price = Number(product.price);
    totalPrice += price * item.quantity;

    orderItemsData.push({
      productId: product.id,
      quantity: item.quantity,
      price: price,
    });
  }

  const deliveryDate = new Date(input.deliveryDateStr);

  // 2. Perform DB Transaction to create order and decrease stock
  const order = await db.$transaction(async (tx) => {
    // Decrease stock for each product
    for (const item of input.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // Create the order
    return await tx.order.create({
      data: {
        userId,
        totalPrice,
        recipientName: input.recipientName,
        recipientPhone: input.recipientPhone,
        deliveryAddress: input.deliveryAddress,
        deliveryDate,
        deliveryTime: input.deliveryTime,
        cardTitle: input.cardTitle || null,
        cardMessage: input.cardMessage || null,
        paymentMethod: input.paymentMethod,
        paymentStatus: PaymentStatus.UNPAID,
        status: OrderStatus.PENDING_CONFIRMATION,
        items: {
          create: orderItemsData,
        },
      },
    });
  });

  revalidatePath("/profile");
  revalidatePath("/admin/orders");

  // 3. Return payment info or confirmation info
  if (input.paymentMethod === PaymentMethod.VNPAY) {
    const paymentUrl = generateVNPayUrl({
      orderId: order.id,
      amount: totalPrice,
      ipAddress,
      orderInfo: `Thanh toan don hang hoa ${order.id.slice(0, 8)}`,
    });

    return {
      success: true,
      orderId: order.id,
      paymentMethod: PaymentMethod.VNPAY,
      paymentUrl,
    };
  }

  return {
    success: true,
    orderId: order.id,
    paymentMethod: PaymentMethod.COD,
  };
}

/**
 * Verifies VNPay return parameters and updates order database state
 */
export async function handleVNPayCallback(queryParams: Record<string, string>) {
  const verifyResult = verifyVNPaySignature(queryParams);

  if (!verifyResult.isValid) {
    return {
      success: false,
      message: "Chữ ký số bảo mật của VNPay không hợp lệ (Signature mismatch).",
    };
  }

  const orderId = verifyResult.orderId;
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    return {
      success: false,
      message: "Không tìm thấy đơn hàng tương ứng trong hệ thống.",
    };
  }

  if (order.paymentStatus === PaymentStatus.PAID) {
    return {
      success: true,
      orderId,
      message: "Đơn hàng đã được ghi nhận thanh toán thành công trước đó.",
    };
  }

  if (verifyResult.isSuccess) {
    // Update order status to paid and processing
    await db.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: PaymentStatus.PAID,
        status: OrderStatus.PROCESSING,
      },
    });

    revalidatePath("/profile");
    revalidatePath(`/admin/orders`);
    return {
      success: true,
      orderId,
      message: "Thanh toán qua cổng VNPay thành công!",
    };
  } else {
    // If payment failed/cancelled, we revert the stock deductions
    await db.$transaction(async (tx) => {
      // Revert product stock
      for (const item of order.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }
      }

      // Mark order as cancelled
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
          paymentStatus: PaymentStatus.UNPAID,
        },
      });
    });

    revalidatePath("/profile");
    revalidatePath(`/admin/orders`);
    return {
      success: false,
      message: `Thanh toán không thành công hoặc bị hủy. Mã phản hồi: ${verifyResult.responseCode}`,
    };
  }
}

export async function getCustomerOrders() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return await db.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderDetails(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) return null;

  // Verify that either the customer owns the order, or the user is an admin
  if (order.userId !== session.user.id && session.user.role !== "ADMIN") {
    throw new Error("Unauthorized access to order details.");
  }

  return order;
}

// Admin Order Management functions
export async function getAdminOrders() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  return await db.order.findMany({
    include: {
      user: {
        select: { name: true, email: true },
      },
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const updatedOrder = await db.order.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/profile");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/dashboard");
  return updatedOrder;
}

export async function updatePaymentStatus(id: string, paymentStatus: PaymentStatus) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const updatedOrder = await db.order.update({
    where: { id },
    data: { paymentStatus },
  });

  revalidatePath("/profile");
  revalidatePath("/admin/orders");
  return updatedOrder;
}
