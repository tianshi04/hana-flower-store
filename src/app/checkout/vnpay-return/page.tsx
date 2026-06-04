import { handleVNPayCallback } from "@/actions/orders";
import Link from "next/link";
import styles from "./vnpay-return.module.css";

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<Record<string, string>>;
}

export default async function VNPayReturnPage({ searchParams }: PageProps) {
  const queryParams = await searchParams;
  const result = await handleVNPayCallback(queryParams);

  const formatVND = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const amount = queryParams["vnp_Amount"]
    ? parseInt(queryParams["vnp_Amount"], 10) / 100
    : 0;
  const payDate = queryParams["vnp_PayDate"] || "";
  
  // Format vnp_PayDate (yyyyMMddHHmmss) to human readable
  const formatPayDate = (dateStr: string) => {
    if (dateStr.length < 14) return "Vừa xong";
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const hour = dateStr.substring(8, 10);
    const min = dateStr.substring(10, 12);
    return `${hour}:${min} - ${day}/${month}/${year}`;
  };

  return (
    <div className={styles.wrapper}>
      {result.success ? (
        /* Success display */
        <div className={styles.card}>
          <div className={`${styles.iconWrapper} ${styles.successIcon}`}>
            ✔️
          </div>
          <h1 className={`${styles.statusTitle} serif-title`}>
            Thanh Toán Thành Công!
          </h1>
          <p className={styles.statusMessage}>
            Cảm ơn bạn đã lựa chọn FlowerDang. Đơn hàng của bạn đã được thanh toán và đang được chuyển đến nghệ nhân để thực hiện cắm hoa.
          </p>

          <div className={styles.detailsBlock}>
            <div className={styles.detailRow}>
              <span className={styles.label}>Mã đơn hàng:</span>
              <span className={styles.value} style={{ fontSize: "0.85rem" }}>
                {result.orderId}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Số tiền đã trả:</span>
              <span className={styles.value} style={{ color: "var(--primary)" }}>
                {formatVND(amount)}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Thời gian GD:</span>
              <span className={styles.value}>{formatPayDate(payDate)}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Phương thức:</span>
              <span className={styles.value}>VNPay (Thẻ/QR-Bank)</span>
            </div>
          </div>

          <div className={styles.actions}>
            <Link href="/profile" className="btn btn-primary">
              Xem chi tiết đơn hàng 📋
            </Link>
            <Link href="/" className="btn btn-secondary">
              Quay lại trang chủ 🌸
            </Link>
          </div>
        </div>
      ) : (
        /* Failure/Cancelled display */
        <div className={styles.card}>
          <div className={`${styles.iconWrapper} ${styles.errorIcon}`}>
            ❌
          </div>
          <h1 className={`${styles.statusTitle} serif-title`} style={{ color: "var(--error)" }}>
            Thanh Toán Thất Bại
          </h1>
          <p className={styles.statusMessage}>
            {result.message || "Giao dịch đã bị hủy hoặc không thành công từ cổng VNPay."}
          </p>

          <div className={styles.detailsBlock}>
            <div className={styles.detailRow}>
              <span className={styles.label}>Mã đơn hàng:</span>
              <span className={styles.value} style={{ fontSize: "0.85rem" }}>
                {result.orderId || "Chưa xác định"}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Trạng thái đơn:</span>
              <span className={styles.value} style={{ color: "var(--error)" }}>
                Đã hủy giao dịch
              </span>
            </div>
          </div>

          <div className={styles.actions}>
            <Link href="/products" className="btn btn-primary">
              Thử đặt lại hoa tươi 💐
            </Link>
            <Link href="/" className="btn btn-secondary">
              Về trang chủ 🌸
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
