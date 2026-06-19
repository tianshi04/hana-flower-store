"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { PrismaOrderRepository } from "@/infrastructure/repositories/prisma-order.repository";
import { PrismaProductRepository } from "@/infrastructure/repositories/prisma-product.repository";
import { VNPayPaymentService } from "@/infrastructure/services/vnpay-payment.service";
import { pinoLogger } from "@/infrastructure/logging/pino-logger";
import { db } from "@/lib/db";
import {
  CreateOrderUseCase,
  HandleVNPayCallbackUseCase,
  GetCustomerOrdersUseCase,
  GetOrderDetailsUseCase,
  GetAdminOrdersUseCase,
  UpdateOrderStatusUseCase,
  UpdatePaymentStatusUseCase,
} from "@/application/use-cases/order/order.usecases";

const orderRepo = new PrismaOrderRepository();
const productRepo = new PrismaProductRepository();
const paymentService = new VNPayPaymentService();

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

  // Check if user exists in database to prevent foreign key constraint violations (e.g. after db seed)
  const userExists = await db.user.findUnique({ where: { id: userId } });
  if (!userExists) {
    throw new Error("Tài khoản của bạn đã hết hạn hoặc không tồn tại trên hệ thống. Vui lòng đăng xuất và đăng nhập lại.");
  }

  const useCase = new CreateOrderUseCase(orderRepo, productRepo, paymentService, pinoLogger);
  const result = await useCase.execute({
    userId,
    recipientName: input.recipientName,
    recipientPhone: input.recipientPhone,
    deliveryAddress: input.deliveryAddress,
    deliveryDateStr: input.deliveryDateStr,
    deliveryTime: input.deliveryTime,
    cardTitle: input.cardTitle,
    cardMessage: input.cardMessage,
    paymentMethod: input.paymentMethod,
    items: input.items,
    ipAddress,
  });

  revalidatePath("/profile");
  revalidatePath("/admin/orders");

  return result;
}

export async function handleVNPayCallback(queryParams: Record<string, string>) {
  const useCase = new HandleVNPayCallbackUseCase(orderRepo, paymentService);
  const result = await useCase.execute(queryParams);

  return result;
}

export async function getCustomerOrders() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const useCase = new GetCustomerOrdersUseCase(orderRepo);
  return await useCase.execute(session.user.id);
}

export async function getOrderDetails(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const useCase = new GetOrderDetailsUseCase(orderRepo);
  const order = await useCase.execute(id);

  if (!order) return null;

  // Verify that either the customer owns the order, or the user is an admin
  if (order.userId !== session.user.id && session.user.role !== "ADMIN") {
    throw new Error("Unauthorized access to order details.");
  }

  return order;
}

export async function getAdminOrders() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const useCase = new GetAdminOrdersUseCase(orderRepo);
  return await useCase.execute();
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const useCase = new UpdateOrderStatusUseCase(orderRepo);
  const updatedOrder = await useCase.execute(id, status);

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

  const useCase = new UpdatePaymentStatusUseCase(orderRepo);
  const updatedOrder = await useCase.execute(id, paymentStatus);

  revalidatePath("/profile");
  revalidatePath("/admin/orders");
  return updatedOrder;
}
