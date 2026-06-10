"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import styles from "./cart.module.css";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();

  const formatVND = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Chưa chọn";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className={styles.wrapper}>
      <h1 className={`${styles.title} serif-title`}>Giỏ Hàng Của Bạn</h1>

      {cart.length > 0 ? (
        <div className={styles.layout}>
          {/* 1. Left side - Cart Items list */}
          <div className={styles.itemsSection}>
            {cart.map((item) => (
              <div key={item.productId} className={styles.itemCard}>
                <div className={styles.imageWrapper}>
                  <img
                    className={styles.itemImg}
                    src={item.image || "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=200&q=80"}
                    alt={item.name}
                  />
                </div>

                <div className={styles.itemDetails}>
                  <h3 className={styles.itemName}>{item.name}</h3>

                  <div className={styles.deliveryDetails}>
                    <p style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                      <strong>Ngày nhận:</strong> {formatDate(item.deliveryDate)}
                    </p>
                    <p style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                      <strong>Khung giờ:</strong> {item.deliveryTime || "Chưa chọn"}
                    </p>
                    {item.cardTitle && (
                      <div className={styles.cardDetails}>
                        <p style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                          <strong>Loại thiệp:</strong> {item.cardTitle}
                        </p>
                        <p style={{ display: "flex", alignItems: "start", gap: "6px" }}>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "4px" }}><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                          <strong>Lời nhắn:</strong> "{item.cardMessage}"
                        </p>
                      </div>
                    )}
                  </div>

                  <div className={styles.actionRow}>
                    <div className={styles.quantitySelector}>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className={styles.quantityBtn}
                      >
                        -
                      </button>
                      <span className={styles.quantityValue}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className={styles.quantityBtn}
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className={styles.removeBtn}
                      style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                      Xóa
                    </button>

                    <div className={styles.itemPrice}>
                      {formatVND(item.price * item.quantity)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 2. Right side - Order Summary */}
          <div className={styles.summaryBox}>
            <h2 className={styles.summaryTitle}>Tóm tắt đơn hàng</h2>
            
            <div className={styles.summaryRow}>
              <span>Số lượng hoa:</span>
              <span>{cartCount} bó</span>
            </div>

            <div className={styles.summaryRow}>
              <span>Phí vận chuyển:</span>
              <span style={{ color: "var(--success)" }}>Miễn phí</span>
            </div>

            <div className={styles.totalRow}>
              <span>Tổng thanh toán:</span>
              <span className={styles.totalPrice}>{formatVND(cartTotal)}</span>
            </div>

            <Link href="/checkout" className="btn btn-primary styles.checkoutBtn" style={{ width: "100%", textAlign: "center", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              Tiến Hành Thanh Toán
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
            </Link>

            <Link
              href="/products"
              style={{
                textAlign: "center",
                fontSize: "0.9rem",
                color: "var(--foreground-light)",
                marginTop: "8px",
                display: "block",
              }}
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      ) : (
        <div className={styles.emptyCart}>
          <span className={styles.emptyIcon}>
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--foreground-light)", display: "block", margin: "0 auto 16px" }}><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
          </span>
          <h2>Giỏ hàng trống</h2>
          <p>Bạn chưa thêm sản phẩm hoa tươi nghệ thuật nào vào giỏ hàng.</p>
          <Link href="/products" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            Khám phá catalog hoa tươi
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
          </Link>
        </div>
      )}
    </div>
  );
}
