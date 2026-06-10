import { auth } from "@/auth";
import { getCustomerOrders } from "@/actions/orders";
import { redirect } from "next/navigation";
import styles from "./profile.module.css";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import Link from "next/link";

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    success?: string;
  }>;
}

export default async function ProfilePage({ searchParams }: PageProps) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  const params = await searchParams;
  const isSuccessCheckout = params.success === "true";

  const orders = await getCustomerOrders();

  const formatVND = (value: any) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(value));
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING_CONFIRMATION:
        return { text: "Chờ xác nhận", className: styles.statusPending };
      case OrderStatus.PROCESSING:
        return { text: "Đang xử lý", className: styles.statusProcessing };
      case OrderStatus.SHIPPING:
        return { text: "Đang giao hàng", className: styles.statusShipping };
      case OrderStatus.DELIVERED:
        return { text: "Đã giao hàng", className: styles.statusDelivered };
      case OrderStatus.CANCELLED:
        return { text: "Đã hủy", className: styles.statusCancelled };
      default:
        return { text: status, className: "" };
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    return method === PaymentMethod.VNPAY ? "Cổng VNPay Online" : "Thanh toán khi nhận (COD)";
  };

  const getPaymentStatusLabel = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.UNPAID:
        return "Chưa thanh toán";
      case PaymentStatus.PAID:
        return "Đã thanh toán";
      case PaymentStatus.REFUNDED:
        return "Đã hoàn tiền";
      default:
        return status;
    }
  };

  return (
    <div className={styles.wrapper}>
      <h1 className={`${styles.title} serif-title`}>Tài Khoản Của Bạn</h1>
      <p className={styles.subtitle}>Chào mừng, {session.user.name}. Quản lý và theo dõi lịch sử đơn hàng của bạn.</p>

      {/* 1. Success Order Placement Banner */}
      {isSuccessCheckout && (
        <div className={styles.successBanner} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          Đặt hàng thành công! Đơn hàng của bạn đã được tiếp nhận và đang chờ xác nhận từ nhân viên cửa hàng.
        </div>
      )}

      {/* 2. Order History list */}
      <h2 className="serif-title" style={{ fontSize: "1.5rem", color: "var(--botanical)", marginBottom: "20px" }}>
        Lịch Sử Đơn Đặt Hàng
      </h2>

      {orders.length > 0 ? (
        <div className={styles.ordersSection}>
          {orders.map((order) => {
            const statusInfo = getStatusLabel(order.status);
            return (
              <div key={order.id} className={styles.orderCard}>
                {/* Header detail */}
                <div className={styles.orderHeader}>
                  <div className={styles.orderMeta}>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Mã đơn hàng</span>
                      <span className={styles.metaValue} style={{ fontSize: "0.85rem" }}>{order.id}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Ngày đặt</span>
                      <span className={styles.metaValue}>{formatDate(order.createdAt)}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Tổng tiền</span>
                      <span className={styles.metaValue} style={{ color: "var(--primary)" }}>
                        {formatVND(order.totalPrice)}
                      </span>
                    </div>
                  </div>

                  <span className={`${styles.statusBadge} ${statusInfo.className}`}>
                    {statusInfo.text}
                  </span>
                </div>

                {/* Body detail */}
                <div className={styles.orderBody}>
                  {/* Items list */}
                  <div className={styles.itemsList}>
                    {order.items.map((item) => (
                      <div key={item.id} className={styles.itemRow}>
                        <div className={styles.imgWrapper}>
                          <img
                            className={styles.itemImg}
                            src={item.product?.images[0] || "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=100&q=80"}
                            alt={item.product?.name || "Sản phẩm hoa tươi"}
                          />
                        </div>
                        <div className={styles.itemInfo}>
                          <span className={styles.itemName}>{item.product?.name || "Hoa tươi cắm nghệ thuật (Đã ngừng kinh doanh)"}</span>
                          <span className={styles.itemMeta}>
                            Số lượng: {item.quantity} x {formatVND(item.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery & card messages */}
                  <div className={styles.deliveryInfo}>
                    <h3 className={styles.deliveryTitle}>Thông tin giao hàng</h3>
                    <p><strong>Người nhận:</strong> {order.recipientName}</p>
                    <p><strong>Điện thoại:</strong> {order.recipientPhone}</p>
                    <p><strong>Địa chỉ:</strong> {order.deliveryAddress}</p>
                    <p><strong>Lịch nhận:</strong> {formatDate(order.deliveryDate)} ({order.deliveryTime})</p>
                    <p><strong>Thanh toán:</strong> {getPaymentMethodLabel(order.paymentMethod)} ({getPaymentStatusLabel(order.paymentStatus)})</p>

                    {order.cardTitle && (
                      <div className={styles.cardMessageBlock}>
                        <p style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                          <strong>{order.cardTitle}:</strong>
                        </p>
                        <p>"{order.cardMessage}"</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.noOrders}>
          <p style={{ fontSize: "1.1rem", marginBottom: "16px" }}>Bạn chưa đặt đơn hàng nào.</p>
          <Link href="/products" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            Khám phá các mẫu hoa tươi nghệ thuật ngay
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
          </Link>
        </div>
      )}
    </div>
  );
}
