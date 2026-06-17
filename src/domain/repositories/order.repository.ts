import { Order, OrderItem, OrderStatus, PaymentMethod, PaymentStatus, Prisma } from "@prisma/client";

export interface CreateOrderItemInput {
  productId: string;
  quantity: number;
  price: number;
}

export interface CreateOrderInput {
  userId: string;
  totalPrice: number;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  deliveryDate: Date;
  deliveryTime: string;
  cardTitle?: string | null;
  cardMessage?: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
}

export type OrderWithDetails = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

export type AdminOrderWithDetails = Prisma.OrderGetPayload<{
  include: {
    user: {
      select: { name: true; email: true };
    };
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

export interface OrderRepository {
  findById(id: string): Promise<(Order & { items: OrderItem[] }) | null>;
  findByIdWithDetails(id: string): Promise<OrderWithDetails | null>;
  findByUserId(userId: string): Promise<OrderWithDetails[]>;
  findManyWithUsersAndItems(): Promise<AdminOrderWithDetails[]>;
  createWithStockReduction(orderData: CreateOrderInput, items: CreateOrderItemInput[]): Promise<Order>;
  cancelAndRevertStock(orderId: string, items: { productId: string | null; quantity: number }[]): Promise<void>;
  updateStatus(id: string, status: OrderStatus): Promise<Order>;
  updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Order>;
  updateOrderPaymentAndStatus(id: string, paymentStatus: PaymentStatus, status: OrderStatus): Promise<Order>;
}
