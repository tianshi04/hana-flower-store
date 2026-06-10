import { getAdminOrders, updateOrderStatus, updatePaymentStatus } from "@/actions/orders";
import styles from "../admin.module.css";
import { OrderStatus, PaymentStatus } from "@prisma/client";

export const revalidate = 0;

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  const formatVND = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div>
      <h1 className={styles.title}>Quản Lý Tất Cả Đơn Hàng</h1>

      <div className={styles.tableCard}>
        {orders.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Đơn hàng</th>
                <th className={styles.th}>Người nhận & Giao hàng</th>
                <th className={styles.th}>Thiệp chúc mừng</th>
                <th className={styles.th}>Chi tiết sản phẩm</th>
                <th className={styles.th}>Tổng tiền</th>
                <th className={styles.th}>Trạng thái</th>
                <th className={styles.th}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                return (
                  <tr key={order.id} className={styles.tableRow}>
                    {/* 1. Meta */}
                    <td className={styles.td}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: "600" }}>{order.id.slice(0, 8)}...</span>
                        <span style={{ fontSize: "0.75rem", color: "var(--foreground-light)" }}>
                          Đặt: {formatDate(order.createdAt)}
                        </span>
                      </div>
                    </td>

                    {/* 2. Recipient info */}
                    <td className={styles.td} style={{ fontSize: "0.9rem" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <strong>{order.recipientName} ({order.recipientPhone})</strong>
                        <span style={{ display: "flex", alignItems: "center" }}>
                          <span className={styles.inlineIcon}>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                          </span>
                          {order.deliveryAddress}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "var(--botanical)", fontWeight: "600", display: "flex", alignItems: "center" }}>
                          <span className={styles.inlineIcon}>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                          </span>
                          Giao: {formatDate(order.deliveryDate)} ({order.deliveryTime})
                        </span>
                      </div>
                    </td>

                    {/* 3. Card message */}
                    <td className={styles.td} style={{ fontSize: "0.85rem", fontStyle: "italic", maxWidth: "200px" }}>
                      {order.cardTitle ? (
                        <div>
                          <strong>{order.cardTitle}:</strong>
                          <p>"{order.cardMessage}"</p>
                        </div>
                      ) : (
                        <span style={{ color: "var(--foreground-light)" }}>Không dùng thiệp</span>
                      )}
                    </td>

                    {/* 4. Products list */}
                    <td className={styles.td} style={{ fontSize: "0.85rem" }}>
                      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "4px" }}>
                        {order.items.map((item) => (
                          <li key={item.id} style={{ display: "flex", alignItems: "center" }}>
                            <span className={styles.inlineIcon} style={{ color: "var(--primary)", marginRight: "6px" }}>
                              <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /></svg>
                            </span>
                            {item.product?.name || "Hoa tươi"} x <strong>{item.quantity}</strong>
                          </li>
                        ))}
                      </ul>
                    </td>

                    {/* 5. Total Price & Payment */}
                    <td className={styles.td}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <strong style={{ color: "var(--primary)" }}>{formatVND(Number(order.totalPrice))}</strong>
                        <span style={{ fontSize: "0.75rem", color: "var(--foreground-light)" }}>
                          {order.paymentMethod}
                        </span>
                        <span style={{ fontSize: "0.75rem", fontWeight: "600", color: order.paymentStatus === PaymentStatus.PAID ? "var(--success)" : "var(--error)" }}>
                          {order.paymentStatus === PaymentStatus.PAID ? "Đã trả" : "Chưa trả"}
                        </span>
                      </div>
                    </td>

                    {/* 6. Order Status Badge */}
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

                    {/* 7. Action buttons */}
                    <td className={styles.td}>
                      <div className={styles.actionBtns}>
                        {/* Confirm COD */}
                        {order.status === OrderStatus.PENDING_CONFIRMATION && (
                          <form
                            action={async () => {
                              "use server";
                              await updateOrderStatus(order.id, OrderStatus.PROCESSING);
                            }}
                          >
                            <button type="submit" className={`${styles.actionBtn} ${styles.actionBtnConfirm}`}>
                              <span className={styles.inlineIcon}>
                                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                              </span>
                              Xác nhận
                            </button>
                          </form>
                        )}

                        {/* Ship Order */}
                        {order.status === OrderStatus.PROCESSING && (
                          <form
                            action={async () => {
                              "use server";
                              await updateOrderStatus(order.id, OrderStatus.SHIPPING);
                            }}
                          >
                            <button type="submit" className={styles.actionBtn} style={{ borderColor: "var(--secondary)", color: "var(--secondary)" }}>
                              <span className={styles.inlineIcon}>
                                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
                              </span>
                              Giao hàng
                            </button>
                          </form>
                        )}

                        {/* Complete Order */}
                        {order.status === OrderStatus.SHIPPING && (
                          <form
                            action={async () => {
                              "use server";
                              await updateOrderStatus(order.id, OrderStatus.DELIVERED);
                              await updatePaymentStatus(order.id, PaymentStatus.PAID);
                            }}
                          >
                            <button type="submit" className={`${styles.actionBtn} ${styles.actionBtnConfirm}`}>
                              <span className={styles.inlineIcon}>
                                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                              </span>
                              Hoàn thành
                            </button>
                          </form>
                        )}

                        {/* Cancel Order */}
                        {order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.CANCELLED && (
                          <form
                            action={async () => {
                              "use server";
                              await updateOrderStatus(order.id, OrderStatus.CANCELLED);
                            }}
                          >
                            <button type="submit" className={`${styles.actionBtn} ${styles.actionBtnCancel}`}>
                              <span className={styles.inlineIcon}>
                                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                              </span>
                              Hủy
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p style={{ color: "var(--foreground-light)", fontStyle: "italic" }}>Chưa có đơn đặt hàng nào trong hệ thống.</p>
        )}
      </div>
    </div>
  );
}
