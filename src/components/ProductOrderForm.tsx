"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import styles from "./ProductOrderForm.module.css";
import Link from "next/link";

interface ProductOrderFormProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: any;
    images: string[];
    stock: number;
  };
}

const TIME_SLOTS = [
  "08:00 - 12:00 (Sáng)",
  "13:00 - 17:00 (Chiều)",
  "17:00 - 21:00 (Tối)",
];

const CARD_TYPES = [
  "Chúc mừng sinh nhật",
  "Chúc mừng khai trương",
  "Kỷ niệm ngày cưới / Tình yêu",
  "Lời chúc sức khỏe / Cảm ơn",
  "Chia buồn / Tiếc thương",
  "Khác (Nhập bên dưới)",
];

export default function ProductOrderForm({ product }: ProductOrderFormProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [deliveryDate, setDeliveryDate] = useState(() => {
    // Default delivery date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [deliveryTime, setDeliveryTime] = useState(TIME_SLOTS[0]);
  const [cardTitle, setCardTitle] = useState(CARD_TYPES[0]);
  const [cardMessage, setCardMessage] = useState("");
  const [useCard, setUseCard] = useState(true);
  const [isAdded, setIsAdded] = useState(false);

  const incrementQty = () => {
    if (quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decrementQty = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addToCart(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: Number(product.price),
        image: product.images[0] || "",
        deliveryDate,
        deliveryTime,
        cardTitle: useCard ? cardTitle : undefined,
        cardMessage: useCard ? cardMessage : undefined,
      },
      quantity
    );

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 5000); // Reset alert after 5s
  };

  // Get minimum delivery date (cannot select past dates)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* 1. Quantity Selector */}
      <div className={styles.optionSection}>
        <h4 className={styles.sectionTitle}>
          Chọn Số Lượng
        </h4>
        <div className={styles.quantityContainer}>
          <div className={styles.quantitySelector}>
            <button
              type="button"
              onClick={decrementQty}
              className={styles.quantityBtn}
              disabled={quantity <= 1 || product.stock <= 0}
            >
              -
            </button>
            <span className={styles.quantityValue}>{quantity}</span>
            <button
              type="button"
              onClick={incrementQty}
              className={styles.quantityBtn}
              disabled={quantity >= product.stock || product.stock <= 0}
            >
              +
            </button>
          </div>
          <span style={{ fontSize: "0.9rem", color: "var(--foreground-light)" }}>
            {product.stock > 0 ? `Còn lại: ${product.stock} bó` : "Hết hàng"}
          </span>
        </div>
      </div>

      {/* 2. Delivery Date and Time */}
      <div className={styles.optionSection}>
        <h4 className={styles.sectionTitle}>
          Thời Gian Nhận Hoa
        </h4>
        <div className={styles.deliveryGrid}>
          <div className="form-group">
            <label className="form-label">Chọn ngày giao</label>
            <input
              type="date"
              className="form-input"
              value={deliveryDate}
              min={getMinDate()}
              required
              onChange={(e) => setDeliveryDate(e.target.value)}
              disabled={product.stock <= 0}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Chọn khung giờ</label>
            <select
              className={styles.cardSelect}
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
              disabled={product.stock <= 0}
            >
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Gift Greeting Card */}
      <div className={styles.optionSection}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h4 className={styles.sectionTitle}>
            Tặng Kèm Thiệp
          </h4>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.9rem" }}>
            <input
              type="checkbox"
              checked={useCard}
              onChange={(e) => setUseCard(e.target.checked)}
              disabled={product.stock <= 0}
            />
            Viết lời chúc
          </label>
        </div>

        {useCard && (
          <>
            <div className="form-group">
              <label className="form-label">Loại thiệp chúc mừng</label>
              <select
                className={styles.cardSelect}
                value={cardTitle}
                onChange={(e) => setCardTitle(e.target.value)}
                disabled={product.stock <= 0}
              >
                {CARD_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Nội dung lời nhắn chúc mừng</label>
              <textarea
                className={styles.cardTextarea}
                placeholder="Ví dụ: Chúc mừng sinh nhật tuổi mới rực rỡ và tràn đầy hạnh phúc nhé bạn yêu..."
                value={cardMessage}
                onChange={(e) => setCardMessage(e.target.value)}
                maxLength={250}
                required
                disabled={product.stock <= 0}
              />
              <span style={{ fontSize: "0.8rem", color: "var(--foreground-light)", textAlign: "right" }}>
                {cardMessage.length}/250 ký tự
              </span>
            </div>
          </>
        )}
      </div>

      {/* 4. Action Button and alert */}
      {isAdded && (
        <div className={styles.successMessage}>
          Đã thêm vào giỏ hàng!{" "}
          <Link href="/cart" style={{ textDecoration: "underline", fontWeight: "600", color: "inherit" }}>
            Xem giỏ hàng ngay
          </Link>
        </div>
      )}

      <button
        type="submit"
        className="btn btn-primary styles.submitBtn"
        disabled={product.stock <= 0}
      >
        {product.stock > 0 ? "Thêm Vào Giỏ Hàng" : "Hết Hàng"}
      </button>
    </form>
  );
}
