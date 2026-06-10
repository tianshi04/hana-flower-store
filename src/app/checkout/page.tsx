"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { createOrder } from "@/actions/orders";
import { PaymentMethod } from "@prisma/client";
import styles from "./checkout.module.css";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useCart();

  // Form states
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  
  // Use settings from first cart item as order defaults
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [cardTitle, setCardTitle] = useState("");
  const [cardMessage, setCardMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.COD);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cart.length > 0) {
      const firstItem = cart[0];
      setDeliveryDate(firstItem.deliveryDate || "");
      setDeliveryTime(firstItem.deliveryTime || "");
      setCardTitle(firstItem.cardTitle || "");
      setCardMessage(firstItem.cardMessage || "");
    } else {
      // Redirect to cart if empty
      router.push("/cart");
    }
  }, [cart, router]);

  const formatVND = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const orderItems = cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      // Call the Server Action
      const result = await createOrder({
        recipientName,
        recipientPhone,
        deliveryAddress,
        deliveryDateStr: new Date(deliveryDate).toISOString(),
        deliveryTime,
        cardTitle: cardTitle || undefined,
        cardMessage: cardMessage || undefined,
        paymentMethod,
        items: orderItems,
      }, "127.0.0.1"); // In a real app we can get IP from headers or client IP

      if (result.success) {
        // 1. Clear cart context state
        clearCart();

        // 2. Direct browser depending on payment method
        if (result.paymentMethod === PaymentMethod.VNPAY && result.paymentUrl) {
          // Redirect to VNPay portal
          window.location.href = result.paymentUrl;
        } else {
          // Redirect to Customer Profile / Order history page
          router.push("/profile?success=true");
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Đã xảy ra lỗi trong quá trình xử lý đơn hàng. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return <div className={styles.wrapper}><p>Đang tải giỏ hàng...</p></div>;
  }

  return (
    <div className={styles.wrapper}>
      <h1 className={`${styles.title} serif-title`}>Tiến Hành Thanh Toán</h1>

      {error && <div className={styles.errorBox}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.layout}>
        {/* 1. Left Column - Shipping Details & Payment */}
        <div>
          {/* Shipping Form */}
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--primary)" }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              Thông Tin Giao Nhận Hoa
            </h2>

            <div className="form-group">
              <label className="form-label">Tên người nhận hoa</label>
              <input
                type="text"
                className="form-input"
                placeholder="Nhập tên người nhận..."
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Số điện thoại liên hệ</label>
              <input
                type="tel"
                className="form-input"
                placeholder="Ví dụ: 0901234567..."
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Địa chỉ nhận hoa</label>
              <input
                type="text"
                className="form-input"
                placeholder="Nhập số nhà, tên đường, phường, quận..."
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Delivery Review Details */}
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--primary)" }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              Xác nhận lịch giao & thiệp chúc
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Ngày giao hoa</label>
                <input
                  type="date"
                  className="form-input"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Khung giờ giao</label>
                <input
                  type="text"
                  className="form-input"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  required
                />
              </div>
            </div>

            {cardTitle && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label">Dịp ghi thiệp</label>
                  <input
                    type="text"
                    className="form-input"
                    value={cardTitle}
                    onChange={(e) => setCardTitle(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Lời nhắn chúc mừng</label>
                  <textarea
                    className="form-input"
                    style={{ minHeight: "80px", resize: "vertical" }}
                    value={cardMessage}
                    onChange={(e) => setCardMessage(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Payment Options Selection */}
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--primary)" }}><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
              Phương Thức Thanh Toán
            </h2>

            <div className={styles.paymentGrid}>
              {/* COD option */}
              <div
                onClick={() => setPaymentMethod(PaymentMethod.COD)}
                className={`${styles.paymentCard} ${paymentMethod === PaymentMethod.COD ? styles.paymentCardActive : ""}`}
              >
                <span className={styles.paymentIcon}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2" /><path d="M6 12h.01M18 12h.01" /></svg>
                </span>
                <span className={styles.paymentLabel}>Thanh toán khi nhận (COD)</span>
                <span className={styles.paymentDesc}>Cần Admin duyệt xác nhận đơn</span>
              </div>

              {/* VNPay option */}
              <div
                onClick={() => setPaymentMethod(PaymentMethod.VNPAY)}
                className={`${styles.paymentCard} ${paymentMethod === PaymentMethod.VNPAY ? styles.paymentCardActive : ""}`}
              >
                <span className={styles.paymentIcon}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                </span>
                <span className={styles.paymentLabel}>Cổng VNPay (Thẻ/QR-Bank)</span>
                <span className={styles.paymentDesc}>Thanh toán tự động qua VNPay</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Right Column - Order Summary Panel */}
        <div className={styles.summaryCard}>
          <h2 className={styles.sectionTitle} style={{ borderBottom: "none", marginBottom: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--primary)" }}><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
            Chi Tiết Đơn Hàng
          </h2>

          <div className={styles.itemsList}>
            {cart.map((item) => (
              <div key={item.productId} className={styles.itemMini}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemQtyPrice}>
                    Số lượng: {item.quantity} x {formatVND(item.price)}
                  </span>
                </div>
                <span className={styles.itemTotal}>
                  {formatVND(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.summaryRow}>
            <span>Phí vận chuyển:</span>
            <span style={{ color: "var(--success)" }}>Miễn phí</span>
          </div>

          <div className={styles.totalRow}>
            <span>Tổng thanh toán:</span>
            <span className={styles.totalPrice}>{formatVND(cartTotal)}</span>
          </div>

          <button
            type="submit"
            className="btn btn-primary styles.submitBtn"
            disabled={isSubmitting}
            style={{ width: "100%", marginTop: "16px" }}
          >
            {isSubmitting ? "Đang Xử Lý Đơn Hàng..." : paymentMethod === PaymentMethod.VNPAY ? "Thanh Toán Qua VNPay" : "Xác Nhận Đặt Hàng (COD)"}
          </button>

          <Link
            href="/cart"
            style={{
              textAlign: "center",
              fontSize: "0.9rem",
              color: "var(--foreground-light)",
              marginTop: "8px",
              display: "block",
            }}
          >
            Quay lại sửa giỏ hàng
          </Link>
        </div>
      </form>
    </div>
  );
}
