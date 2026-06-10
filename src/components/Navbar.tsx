"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import styles from "./Navbar.module.css";
import { signOut } from "next-auth/react";

interface NavbarProps {
  session: any; // Passed from parent layout (Server Component)
}

export default function Navbar({ session }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount } = useCart();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Reset scroll to top instantly on pathname change
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as any });
    setIsMobileMenuOpen(false); // Close mobile menu on page transition
  }, [pathname]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const isActive = (path: string) => pathname === path;

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <header className={`${styles.header} ${isMobileMenuOpen ? styles.headerOpen : ""}`}>
      <div className={styles.container}>
        {/* Left menu toggle (hamburger) and Logo */}
        <div className={styles.leftSection}>
          <button
            className={styles.menuToggle}
            aria-label="Menu"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
          
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
                <path d="M12 10c2-3.5 5-2 5-2s.5 2.5-1.5 4.5-3.5 1.5-3.5 1.5-1.5.5-3.5-1.5S7 8 7 8s3-1.5 5 2z" />
                <path d="M12 14v7" />
                <path d="M12 17c-2 0-3-1-3-1" />
                <path d="M12 19c2 0 3-1 3-1" />
              </svg>
            </span>
            <span className={styles.logoText}>HanaShop</span>
          </Link>
        </div>

        {/* Navigation links (Desktop) */}
        <nav className={styles.nav}>
          <Link href="/" className={`${styles.navLink} ${isActive("/") ? styles.navLinkActive : ""}`}>
            TRANG CHỦ
          </Link>
          <Link href="/products" className={`${styles.navLink} ${isActive("/products") ? styles.navLinkActive : ""}`}>
            SẢN PHẨM
          </Link>
          {session?.user && (
            <Link href="/profile" className={`${styles.navLink} ${isActive("/profile") ? styles.navLinkActive : ""}`}>
              LỊCH SỬ ĐƠN
            </Link>
          )}
          {session?.user?.role === "ADMIN" && (
            <Link href="/admin/dashboard" className={`${styles.navLink} ${styles.adminLink}`}>
              QUẢN TRỊ
            </Link>
          )}
        </nav>

        {/* Right actions: Search, Account, Cart */}
        <div className={styles.actions}>
          {/* Search form toggle */}
          {isSearchOpen ? (
            <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
              <input
                type="text"
                placeholder="Tìm tên hoa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
                autoFocus
                onBlur={() => {
                  if (!searchQuery) {
                    setTimeout(() => setIsSearchOpen(false), 200);
                  }
                }}
              />
              <button type="submit" className={styles.iconBtn} aria-label="Tìm kiếm">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            </form>
          ) : (
            <button
              className={styles.iconBtn}
              onClick={() => setIsSearchOpen(true)}
              aria-label="Tìm kiếm"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          )}

          {/* Cart Bag Icon Link */}
          <Link href="/cart" className={styles.cartButton} aria-label="Giỏ hàng">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
          </Link>

          {/* User Account / Profile */}
          {session?.user ? (
            <div className={styles.profileMenu}>
              <Link href="/profile" className={styles.iconBtn} title={session.user.name || "Tài khoản"}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>
              <button onClick={handleLogout} className={styles.logoutBtn} title="Đăng xuất">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          ) : (
            <Link href="/login" className={styles.iconBtn} title="Đăng nhập">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Navigation Dropdown Menu */}
      {isMobileMenuOpen && (
        <nav className={styles.mobileNav}>
          <Link
            href="/"
            className={`${styles.mobileNavLink} ${isActive("/") ? styles.mobileNavLinkActive : ""}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            TRANG CHỦ
          </Link>
          <Link
            href="/products"
            className={`${styles.mobileNavLink} ${isActive("/products") ? styles.mobileNavLinkActive : ""}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            SẢN PHẨM
          </Link>
          {session?.user && (
            <Link
              href="/profile"
              className={`${styles.mobileNavLink} ${isActive("/profile") ? styles.mobileNavLinkActive : ""}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              LỊCH SỬ ĐƠN
            </Link>
          )}
          {session?.user?.role === "ADMIN" && (
            <Link
              href="/admin/dashboard"
              className={`${styles.mobileNavLink} ${styles.adminLink}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              QUẢN TRỊ
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
