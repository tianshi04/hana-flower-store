"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import styles from "./Navbar.module.css";
import { signOut } from "next-auth/react";

interface NavbarProps {
  session: any; // Passed from parent layout (Server Component)
}

export default function Navbar({ session }: NavbarProps) {
  const pathname = usePathname();
  const { cartCount } = useCart();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>🌸</span>
          <span className="serif-title">FlowerDang</span>
        </Link>

        <nav className={styles.nav}>
          <Link href="/" className={`${styles.navLink} ${isActive("/") ? styles.navLinkActive : ""}`}>
            Trang chủ
          </Link>
          <Link href="/products" className={`${styles.navLink} ${isActive("/products") ? styles.navLinkActive : ""}`}>
            Sản phẩm
          </Link>
          {session?.user && (
            <Link href="/profile" className={`${styles.navLink} ${isActive("/profile") ? styles.navLinkActive : ""}`}>
              Lịch sử đơn
            </Link>
          )}
          {session?.user?.role === "ADMIN" && (
            <Link href="/admin/dashboard" className={`${styles.navLink} ${styles.adminLink}`}>
              🛡️ Quản trị
            </Link>
          )}
        </nav>

        <div className={styles.actions}>
          {/* Cart Icon Link */}
          <Link href="/cart" className={styles.cartButton} aria-label="Giỏ hàng">
            <svg
              className={styles.cartIcon}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
          </Link>

          {/* Authentication Status */}
          {session?.user ? (
            <div className={styles.profileMenu}>
              <Link href="/profile" className={styles.avatar} title={session.user.name || "Tài khoản"}>
                {session.user.name ? session.user.name.charAt(0).toUpperCase() : "U"}
              </Link>
              <button onClick={handleLogout} className={styles.logoutBtn}>
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link href="/login" className={styles.authBtn}>
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
