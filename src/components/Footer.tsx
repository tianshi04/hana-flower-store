"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Footer.module.css";

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className={styles.footer} id="lien-he">
      <div className={styles.container}>
        <div className={styles.brandCol}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
                <path d="M12 10c2-3.5 5-2 5-2s.5 2.5-1.5 4.5-3.5 1.5-3.5 1.5-1.5.5-3.5-1.5S7 8 7 8s3-1.5 5 2z" />
                <path d="M12 14v7" />
                <path d="M12 17c-2 0-3-1-3-1" />
                <path d="M12 19c2 0 3-1 3-1" />
              </svg>
            </span>
            <span className={styles.logoText}>HanaShop</span>
          </div>
          <p className={styles.description}>
            Cung cấp các sản phẩm hoa tươi nghệ thuật thiết kế độc quyền, mang thông điệp yêu thương và trọn vẹn cảm xúc tới người nhận trong mọi dịp đặc biệt.
          </p>
        </div>

        <div>
          <h3 className={styles.title}>Danh mục</h3>
          <ul className={styles.links}>
            <li>
              <Link href="/products" className={styles.link}>
                Tất cả sản phẩm
              </Link>
            </li>
            <li>
              <Link href="/products?occasion=sinh-nhat" className={styles.link}>
                Hoa sinh nhật
              </Link>
            </li>
            <li>
              <Link href="/products?occasion=tinh-yeu" className={styles.link}>
                Hoa tình yêu
              </Link>
            </li>
            <li>
              <Link href="/products?occasion=khai-truong" className={styles.link}>
                Hoa khai trương
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className={styles.title}>Hỗ trợ</h3>
          <ul className={styles.links}>
            <li>
              <Link href="/" className={styles.link}>
                Chính sách giao hàng
              </Link>
            </li>
            <li>
              <Link href="/" className={styles.link}>
                Chính sách bảo hành hoa
              </Link>
            </li>
            <li>
              <Link href="/" className={styles.link}>
                Câu hỏi thường gặp
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className={styles.title}>Liên hệ</h3>
          <div className={styles.contactInfo}>
            <p>Địa chỉ: 123 Đường Láng, Đống Đa, Hà Nội</p>
            <p>Hotline: 1900 8888</p>
            <p>Email: contact@hanashop.com</p>
            <p>Giờ làm việc: 7:00 - 21:00 (Tất cả các ngày)</p>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.copy}>
          &copy; {currentYear} HanaShop. Thiết kế cao cấp cho ngày đặc biệt.
        </div>
        <div className={styles.paymentIcons}>
          <span className={styles.paymentBadge}>VNPay Online</span>
          <span className={styles.paymentBadge}>COD</span>
          <span className={styles.paymentBadge}>VietQR</span>
        </div>
      </div>
    </footer>
  );
}
