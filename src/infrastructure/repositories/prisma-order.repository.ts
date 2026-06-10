import { db } from "@/lib/db";
import { Order, OrderItem, OrderStatus, PaymentStatus } from "@prisma/client";
import {
  OrderRepository,
  CreateOrderInput,
  CreateOrderItemInput,
  OrderWithDetails,
  AdminOrderWithDetails,
} from "@/domain/repositories/order.repository";

export class PrismaOrderRepository implements OrderRepository {
  async findById(id: string): Promise<(Order & { items: OrderItem[] }) | null> {
    return await db.order.findUnique({
      where: { id },
      include: { items: true },
    });
  }

  async findByIdWithDetails(id: string): Promise<OrderWithDetails | null> {
    return await db.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findByUserId(userId: string): Promise<OrderWithDetails[]> {
    return await db.order.findMany({
      where: { userId },
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

  async findManyWithUsersAndItems(): Promise<AdminOrderWithDetails[]> {
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

  async createWithStockReduction(orderData: CreateOrderInput, items: CreateOrderItemInput[]): Promise<Order> {
    return await db.$transaction(async (tx) => {
      // Decrease stock for each product
      for (const item of items) {
        const updatedProduct = await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (updatedProduct.stock < 0) {
          throw new Error(`Sản phẩm "${updatedProduct.name}" không đủ hàng trong kho (Còn lại: ${updatedProduct.stock + item.quantity}).`);
        }
      }

      // Create the order
      return await tx.order.create({
        data: {
          userId: orderData.userId,
          totalPrice: orderData.totalPrice,
          recipientName: orderData.recipientName,
          recipientPhone: orderData.recipientPhone,
          deliveryAddress: orderData.deliveryAddress,
          deliveryDate: orderData.deliveryDate,
          deliveryTime: orderData.deliveryTime,
          cardTitle: orderData.cardTitle,
          cardMessage: orderData.cardMessage,
          paymentMethod: orderData.paymentMethod,
          paymentStatus: orderData.paymentStatus,
          status: orderData.status,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });
    });
  }

  async cancelAndRevertStock(orderId: string, items: { productId: string | null; quantity: number }[]): Promise<void> {
    await db.$transaction(async (tx) => {
      // Revert product stock
      for (const item of items) {
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
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    return await db.order.update({
      where: { id },
      data: { status },
    });
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Order> {
    return await db.order.update({
      where: { id },
      data: { paymentStatus },
    });
  }

  async updateOrderPaymentAndStatus(id: string, paymentStatus: PaymentStatus, status: OrderStatus): Promise<Order> {
    return await db.order.update({
      where: { id },
      data: {
        paymentStatus,
        status,
      },
    });
  }
}
