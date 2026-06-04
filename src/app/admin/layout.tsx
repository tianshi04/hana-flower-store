import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import styles from "./admin.module.css";

export const revalidate = 0;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Route security guard: Ensure only logged-in ADMIN can access admin pages
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className={styles.adminLayout}>
      {/* Left Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span>🛡️</span>
          <span className="serif-title">FlowerAdmin</span>
        </div>

        <ul className={styles.menu}>
          <li>
            <Link href="/admin/dashboard" className={styles.menuItem}>
              <span>📊</span> Báo cáo chung
            </Link>
          </li>
          <li>
            <Link href="/admin/products" className={styles.menuItem}>
              <span>💐</span> Quản lý sản phẩm
            </Link>
          </li>
          <li>
            <Link href="/admin/orders" className={styles.menuItem}>
              <span>📋</span> Quản lý đơn hàng
            </Link>
          </li>
          <li>
            <Link href="/" className={styles.menuItem} style={{ marginTop: "40px", backgroundColor: "rgba(0,0,0,0.2)" }}>
              <span>🏠</span> Về trang chủ cửa hàng
            </Link>
          </li>
        </ul>
      </aside>

      {/* Right Content Panel */}
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
