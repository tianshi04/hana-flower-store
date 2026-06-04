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
            <h2 className={styles.sectionTitle}>
              <span>📍</span> Thông Tin Giao Nhận Hoa
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
            <h2 className={styles.sectionTitle}>
              <span>📅</span> Xác nhận lịch giao & thiệp chúc
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
            <h2 className={styles.sectionTitle}>
              <span>💳</span> Phương Thức Thanh Toán
            </h2>

            <div className={styles.paymentGrid}>
              {/* COD option */}
              <div
                onClick={() => setPaymentMethod(PaymentMethod.COD)}
                className={`${styles.paymentCard} ${paymentMethod === PaymentMethod.COD ? styles.paymentCardActive : ""}`}
              >
                <span className={styles.paymentIcon}>💵</span>
                <span className={styles.paymentLabel}>Thanh toán khi nhận (COD)</span>
                <span className={styles.paymentDesc}>Cần Admin duyệt xác nhận đơn</span>
              </div>

              {/* VNPay option */}
              <div
                onClick={() => setPaymentMethod(PaymentMethod.VNPAY)}
                className={`${styles.paymentCard} ${paymentMethod === PaymentMethod.VNPAY ? styles.paymentCardActive : ""}`}
              >
                <span className={styles.paymentIcon}>🌐</span>
                <span className={styles.paymentLabel}>Cổng VNPay (Thẻ/QR-Bank)</span>
                <span className={styles.paymentDesc}>Thanh toán tự động qua VNPay</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Right Column - Order Summary Panel */}
        <div className={styles.summaryCard}>
          <h2 className={styles.sectionTitle} style={{ borderBottom: "none", marginBottom: 0 }}>
            <span>🛒</span> Chi Tiết Đơn Hàng
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
            {isSubmitting ? "Đang Xử Lý Đơn Hàng..." : paymentMethod === PaymentMethod.VNPAY ? "Thanh Toán Qua VNPay 💳" : "Xác Nhận Đặt Hàng (COD) 🛒"}
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
