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
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          <span className="serif-title">FlowerAdmin</span>
        </div>

        <ul className={styles.menu}>
          <li>
            <Link href="/admin/dashboard" className={styles.menuItem}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
              Báo cáo chung
            </Link>
          </li>
          <li>
            <Link href="/admin/products" className={styles.menuItem}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
              Quản lý sản phẩm
            </Link>
          </li>
          <li>
            <Link href="/admin/orders" className={styles.menuItem}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>
              Quản lý đơn hàng
            </Link>
          </li>
          <li>
            <Link href="/" className={styles.menuItem} style={{ marginTop: "40px", backgroundColor: "rgba(255,255,255,0.08)" }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
              Về trang chủ cửa hàng
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
