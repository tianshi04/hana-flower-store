import { OrderRepository, CreateOrderInput, CreateOrderItemInput } from "@/domain/repositories/order.repository";
import { ProductRepository } from "@/domain/repositories/product.repository";
import { PaymentService } from "@/domain/services/payment.service";
import { PaymentMethod, PaymentStatus, OrderStatus } from "@prisma/client";

interface CreateOrderUseCaseInput {
  userId: string;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  deliveryDateStr: string;
  deliveryTime: string;
  cardTitle?: string;
  cardMessage?: string;
  paymentMethod: PaymentMethod;
  items: { productId: string; quantity: number }[];
  ipAddress?: string;
}

export class CreateOrderUseCase {
  constructor(
    private orderRepo: OrderRepository,
    private productRepo: ProductRepository,
    private paymentService: PaymentService
  ) {}

  async execute(input: CreateOrderUseCaseInput) {
    if (input.items.length === 0) {
      throw new Error("Your cart is empty.");
    }

    if (input.cardMessage && input.cardMessage.length > 250) {
      throw new Error("Lời nhắn trên thiệp chúc mừng không được vượt quá 250 ký tự.");
    }

    // 1. Get products from repository to check price and stock
    const productIds = input.items.map((item) => item.productId);
    const dbProducts = await Promise.all(
      productIds.map(async (id) => {
        const prod = await this.productRepo.findById(id);
        if (!prod) {
          throw new Error(`Product not found: ${id}`);
        }
        return prod;
      })
    );

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // Calculate total price and verify stock availability
    let totalPrice = 0;
    const orderItemsData: CreateOrderItemInput[] = [];

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

    // 2. Perform DB creation and stock reduction inside repository
    const orderData: CreateOrderInput = {
      userId: input.userId,
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
    };

    const order = await this.orderRepo.createWithStockReduction(orderData, orderItemsData);

    // 3. Return payment info or confirmation info
    if (input.paymentMethod === PaymentMethod.VNPAY) {
      const paymentUrl = this.paymentService.generatePaymentUrl({
        orderId: order.id,
        amount: totalPrice,
        ipAddress: input.ipAddress || "127.0.0.1",
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
}

export class HandleVNPayCallbackUseCase {
  constructor(
    private orderRepo: OrderRepository,
    private paymentService: PaymentService
  ) {}

  async execute(queryParams: Record<string, string>) {
    const verifyResult = this.paymentService.verifyPaymentCallback(queryParams);

    if (!verifyResult.isValid) {
      return {
        success: false,
        message: "Chữ ký số bảo mật của VNPay không hợp lệ (Signature mismatch).",
      };
    }

    const orderId = verifyResult.orderId;
    const order = await this.orderRepo.findById(orderId);

    if (!order) {
      return {
        success: false,
        orderId,
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
      await this.orderRepo.updateOrderPaymentAndStatus(orderId, PaymentStatus.PAID, OrderStatus.PROCESSING);
      return {
        success: true,
        orderId,
        message: "Thanh toán qua cổng VNPay thành công!",
      };
    } else {
      // Revert product stock and cancel order
      await this.orderRepo.cancelAndRevertStock(orderId, order.items);
      return {
        success: false,
        orderId,
        message: `Thanh toán không thành công hoặc bị hủy. Mã phản hồi: ${verifyResult.responseCode}`,
      };
    }
  }
}

export class GetCustomerOrdersUseCase {
  constructor(private orderRepo: OrderRepository) {}
  async execute(userId: string) {
    return await this.orderRepo.findByUserId(userId);
  }
}

export class GetOrderDetailsUseCase {
  constructor(private orderRepo: OrderRepository) {}
  async execute(id: string) {
    return await this.orderRepo.findByIdWithDetails(id);
  }
}

export class GetAdminOrdersUseCase {
  constructor(private orderRepo: OrderRepository) {}
  async execute() {
    return await this.orderRepo.findManyWithUsersAndItems();
  }
}

export class UpdateOrderStatusUseCase {
  constructor(private orderRepo: OrderRepository) {}
  async execute(id: string, status: OrderStatus) {
    return await this.orderRepo.updateStatus(id, status);
  }
}

export class UpdatePaymentStatusUseCase {
  constructor(private orderRepo: OrderRepository) {}
  async execute(id: string, paymentStatus: PaymentStatus) {
    return await this.orderRepo.updatePaymentStatus(id, paymentStatus);
  }
}
