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
                    <p>
                      <strong>📅 Ngày nhận:</strong> {formatDate(item.deliveryDate)}
                    </p>
                    <p>
                      <strong>🕒 Khung giờ:</strong> {item.deliveryTime || "Chưa chọn"}
                    </p>
                    {item.cardTitle && (
                      <div className={styles.cardDetails}>
                        <p>
                          <strong>💌 Loại thiệp:</strong> {item.cardTitle}
                        </p>
                        <p>
                          <strong>✍️ Lời nhắn:</strong> "{item.cardMessage}"
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
                    >
                      🗑️ Xóa
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

            <Link href="/checkout" className="btn btn-primary styles.checkoutBtn" style={{ width: "100%", textAlign: "center" }}>
              Tiến Hành Thanh Toán 💳
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
          <span className={styles.emptyIcon}>🛒</span>
          <h2>Giỏ hàng trống</h2>
          <p>Bạn chưa thêm sản phẩm hoa tươi nghệ thuật nào vào giỏ hàng.</p>
          <Link href="/products" className="btn btn-primary">
            Khám phá catalog hoa tươi 💐
          </Link>
        </div>
      )}
    </div>
  );
}
