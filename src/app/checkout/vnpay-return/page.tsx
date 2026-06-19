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
            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
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
            <Link href="/profile" className="btn btn-primary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              Xem chi tiết đơn hàng
            </Link>
            <Link href="/" className="btn btn-secondary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              Quay lại trang chủ
            </Link>
          </div>
        </div>
      ) : (
        /* Failure/Cancelled display */
        <div className={styles.card}>
          <div className={`${styles.iconWrapper} ${styles.errorIcon}`}>
            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
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
            <Link href="/products" className="btn btn-primary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              Thử đặt lại hoa tươi
            </Link>
            <Link href="/" className="btn btn-secondary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              Về trang chủ
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
