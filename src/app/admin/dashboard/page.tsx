import { getAdminOrders, updateOrderStatus, updatePaymentStatus } from "@/actions/orders";
import styles from "../admin.module.css";
import { OrderStatus, PaymentStatus } from "@prisma/client";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const orders = await getAdminOrders();

  // 1. Calculate stats
  const totalOrders = orders.length;

  // Revenue is the sum of all orders that are PAID
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === PaymentStatus.PAID)
    .reduce((sum, o) => sum + Number(o.totalPrice), 0);

  // Total unique customers (by email)
  const uniqueUsers = new Set(orders.map((o) => o.user.email)).size;

  const recentOrders = orders.slice(0, 5);

  const formatVND = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <h1 className={styles.title}>Báo Cáo Tổng Quan Cửa Hàng</h1>

      {/* Stats Cards Row */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: "var(--primary-light)" }}>💰</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Doanh Thu (Đã Thu)</span>
            <span className={styles.statValue}>{formatVND(totalRevenue)}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: "hsl(200, 100%, 96%)" }}>📋</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Tổng Đơn Hàng</span>
            <span className={styles.statValue}>{totalOrders} đơn</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: "hsl(142, 40%, 92%)" }}>👤</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Khách Hàng Đã Mua</span>
            <span className={styles.statValue}>{uniqueUsers} người</span>
          </div>
        </div>
      </div>

      {/* Recent Orders List with RSC server action buttons */}
      <div className={styles.tableCard}>
        <h2 className="serif-title" style={{ fontSize: "1.3rem", color: "var(--botanical)", marginBottom: "20px" }}>
          Đơn Hàng Mới Nhất Cần Xử Lý
        </h2>

        {recentOrders.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Mã đơn</th>
                <th className={styles.th}>Khách hàng</th>
                <th className={styles.th}>Tổng tiền</th>
                <th className={styles.th}>Thời gian</th>
                <th className={styles.th}>Trạng thái</th>
                <th className={styles.th}>Thao tác nhanh</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className={styles.tableRow}>
                  <td className={styles.td} style={{ fontSize: "0.8rem", fontWeight: "600" }}>
                    {order.id.slice(0, 8)}...
                  </td>
                  <td className={styles.td}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <strong>{order.recipientName}</strong>
                      <span style={{ fontSize: "0.75rem", color: "var(--foreground-light)" }}>
                        {order.user.email}
                      </span>
                    </div>
                  </td>
                  <td className={styles.td} style={{ fontWeight: "600", color: "var(--primary)" }}>
                    {formatVND(Number(order.totalPrice))}
                  </td>
                  <td className={styles.td}>{formatDate(order.createdAt)}</td>
                  <td className={styles.td}>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        padding: "4px 8px",
                        borderRadius: "9999px",
                        backgroundColor:
                          order.status === OrderStatus.PENDING_CONFIRMATION
                            ? "var(--primary-light)"
                            : order.status === OrderStatus.PROCESSING
                            ? "hsl(200, 100%, 96%)"
                            : order.status === OrderStatus.SHIPPING
                            ? "hsl(40, 100%, 95%)"
                            : order.status === OrderStatus.DELIVERED
                            ? "hsl(142, 40%, 92%)"
                            : "rgba(229, 57, 53, 0.08)",
                        color:
                          order.status === OrderStatus.PENDING_CONFIRMATION
                            ? "var(--primary)"
                            : order.status === OrderStatus.PROCESSING
                            ? "hsl(200, 80%, 40%)"
                            : order.status === OrderStatus.SHIPPING
                            ? "hsl(40, 90%, 45%)"
                            : "var(--success)",
                      }}
                    >
                      {order.status === OrderStatus.PENDING_CONFIRMATION
                        ? "Chờ xác nhận"
                        : order.status === OrderStatus.PROCESSING
                        ? "Đang xử lý"
                        : order.status === OrderStatus.SHIPPING
                        ? "Đang giao"
                        : order.status === OrderStatus.DELIVERED
                        ? "Đã giao"
                        : "Đã hủy"}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.actionBtns}>
                      {/* COD Confirmation Action */}
                      {order.status === OrderStatus.PENDING_CONFIRMATION && (
                        <form
                          action={async () => {
                            "use server";
                            await updateOrderStatus(order.id, OrderStatus.PROCESSING);
                          }}
                        >
                          <button type="submit" className={`${styles.actionBtn} ${styles.actionBtnConfirm}`}>
                            Xác nhận đơn
                          </button>
                        </form>
                      )}

                      {/* Shipping Action */}
                      {order.status === OrderStatus.PROCESSING && (
                        <form
                          action={async () => {
                            "use server";
                            await updateOrderStatus(order.id, OrderStatus.SHIPPING);
                          }}
                        >
                          <button type="submit" className={`${styles.actionBtn}`} style={{ borderColor: "var(--secondary)", color: "var(--secondary)" }}>
                            Giao hoa 🚗
                          </button>
                        </form>
                      )}

                      {/* Delivered Action */}
                      {order.status === OrderStatus.SHIPPING && (
                        <form
                          action={async () => {
                            "use server";
                            await updateOrderStatus(order.id, OrderStatus.DELIVERED);
                            await updatePaymentStatus(order.id, PaymentStatus.PAID);
                          }}
                        >
                          <button type="submit" className={`${styles.actionBtn} ${styles.actionBtnConfirm}`}>
                            Đã giao hàng ✔️
                          </button>
                        </form>
                      )}

                      {/* Cancellation Action */}
                      {order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.CANCELLED && (
                        <form
                          action={async () => {
                            "use server";
                            await updateOrderStatus(order.id, OrderStatus.CANCELLED);
                          }}
                        >
                          <button type="submit" className={`${styles.actionBtn} ${styles.actionBtnCancel}`}>
                            Hủy
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: "var(--foreground-light)", fontStyle: "italic" }}>Chưa có đơn đặt hàng nào trong hệ thống.</p>
        )}
      </div>
    </div>
  );
}
