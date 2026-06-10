import Link from "next/link";
import { getCategories, getOccasions, getProducts } from "@/actions/products";
import styles from "./products.module.css";

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    category?: string;
    occasion?: string;
    q?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeCategorySlug = params.category || "";
  const activeOccasionSlug = params.occasion || "";
  const query = params.q || "";

  // 1. Fetch categories, occasions, and products
  const categories = await getCategories();
  const occasions = await getOccasions();

  // Find IDs if slugs are active
  const activeCategory = categories.find((c) => c.slug === activeCategorySlug);
  const activeOccasion = occasions.find((o) => o.slug === activeOccasionSlug);

  const products = await getProducts({
    categoryId: activeCategory?.id,
    occasionId: activeOccasion?.id,
    query: query,
  });

  const formatVND = (value: any) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(value));
  };

  // Helper to generate dynamic search URL queries
  const getQueryUrl = (newParams: { category?: string; occasion?: string; q?: string }) => {
    const searchParams = new URLSearchParams();
    
    // Maintain existing filters if not overridden
    const cat = newParams.category !== undefined ? newParams.category : activeCategorySlug;
    const occ = newParams.occasion !== undefined ? newParams.occasion : activeOccasionSlug;
    const q = newParams.q !== undefined ? newParams.q : query;

    if (cat) searchParams.append("category", cat);
    if (occ) searchParams.append("occasion", occ);
    if (q) searchParams.append("q", q);

    const queryStr = searchParams.toString();
    return `/products${queryStr ? `?${queryStr}` : ""}`;
  };

  return (
    <div className={styles.wrapper}>
      <h1 className={`${styles.title} serif-title`}>Catalog Hoa Tươi Thiết Kế</h1>
      <p className={styles.subtitle}>
        Khám phá các mẫu hoa tươi độc bản phù hợp mọi dịp đặc biệt trong cuộc sống.
      </p>

      <div className={styles.container}>
        {/* 1. Sidebar Filters */}
        <aside className={styles.sidebar}>
          {/* Search Box */}
          <div className={styles.filterBlock}>
            <h3 className={styles.filterTitle}>Tìm Kiếm</h3>
            <form action="/products" method="GET" className={styles.searchBar}>
              {/* Keep category/occasion parameters in search form */}
              {activeCategorySlug && <input type="hidden" name="category" value={activeCategorySlug} />}
              {activeOccasionSlug && <input type="hidden" name="occasion" value={activeOccasionSlug} />}
              
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Tìm tên hoa..."
                className={styles.searchInput}
              />
            </form>
          </div>

          {/* Occasion Filter */}
          <div className={styles.filterBlock}>
            <h3 className={styles.filterTitle}>Lọc Theo Dịp</h3>
            <ul className={styles.filterList}>
              <li>
                <Link
                  href={getQueryUrl({ occasion: "" })}
                  className={`${styles.filterLink} ${!activeOccasionSlug ? styles.filterLinkActive : ""}`}
                >
                  Tất cả dịp
                </Link>
              </li>
              {occasions.map((occ) => (
                <li key={occ.id}>
                  <Link
                    href={getQueryUrl({ occasion: occ.slug })}
                    className={`${styles.filterLink} ${activeOccasionSlug === occ.slug ? styles.filterLinkActive : ""}`}
                  >
                    {occ.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Category Filter */}
          <div className={styles.filterBlock}>
            <h3 className={styles.filterTitle}>Loại Hoa</h3>
            <ul className={styles.filterList}>
              <li>
                <Link
                  href={getQueryUrl({ category: "" })}
                  className={`${styles.filterLink} ${!activeCategorySlug ? styles.filterLinkActive : ""}`}
                >
                  Tất cả hoa
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={getQueryUrl({ category: cat.slug })}
                    className={`${styles.filterLink} ${activeCategorySlug === cat.slug ? styles.filterLinkActive : ""}`}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* 2. Products List */}
        <main className={styles.productsGrid}>
          {products.length > 0 ? (
            products.map((product) => (
              <Link key={product.id} href={`/products/${product.slug}`} className={styles.productCard}>
                <div className={styles.imageWrapper}>
                  <img
                    className={styles.productImg}
                    src={product.images[0] || "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=400&q=80"}
                    alt={product.name}
                  />
                  <span className={styles.tag}>{product.occasion.name}</span>
                  {product.stock <= 0 && <span className={styles.stockBadge}>Hết hàng</span>}
                </div>
                <div className={styles.productInfo}>
                  <h3 className={styles.productTitle}>{product.name}</h3>
                  <p className={styles.productDesc}>{product.description}</p>
                  <div className={styles.priceRow}>
                    <span className={styles.price}>{formatVND(product.price)}</span>
                    <span className={styles.detailBtn}>
                      Chi tiết
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className={styles.noResults}>
              <span className={styles.noResultsIcon}>
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--foreground-light)", display: "block", margin: "0 auto 16px" }}>
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <h3>Không tìm thấy sản phẩm</h3>
              <p>Thử điều chỉnh lại bộ lọc tìm kiếm hoặc xem các dịp khác.</p>
              <Link href="/products" className="btn btn-primary">
                Xem Tất Cả Sản Phẩm
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
