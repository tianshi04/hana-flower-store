import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brandCol}>
          <div className={styles.logo}>
            <span>🌸</span>
            <span className="serif-title">FlowerDang</span>
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
            <p>📍 Địa chỉ: 123 Đường Láng, Đống Đa, Hà Nội</p>
            <p>📞 Hotline: 1900 8888</p>
            <p>✉️ Email: contact@flowerdang.com</p>
            <p>🕒 Giờ làm việc: 7:00 - 21:00 (Tất cả các ngày)</p>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.copy}>
          &copy; {currentYear} FlowerDang. Thiết kế cao cấp cho ngày đặc biệt.
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
