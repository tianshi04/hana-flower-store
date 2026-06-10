import { getProducts, getCategories, getOccasions, createProduct, deleteProduct } from "@/actions/products";
import styles from "../admin.module.css";
import Link from "next/link";

export const revalidate = 0;

export default async function AdminProductsPage() {
  const products = await getProducts();
  const categories = await getCategories();
  const occasions = await getOccasions();

  const formatVND = (value: any) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(value));
  };

  return (
    <div>
      <h1 className={styles.title}>Quản Lý Sản Phẩm Hoa Tươi</h1>

      <div className={styles.crudFormGrid} style={{ marginBottom: "40px" }}>
        {/* 1. Add Product Form Card */}
        <div className={styles.tableCard}>
          <h2 className="serif-title" style={{ fontSize: "1.25rem", color: "var(--botanical)", marginBottom: "20px" }}>
            Thêm sản phẩm hoa mới
          </h2>

          <form
            action={async (formData: FormData) => {
              "use server";
              const name = formData.get("name") as string;
              const slug = formData.get("slug") as string;
              const description = formData.get("description") as string;
              const price = parseFloat(formData.get("price") as string);
              const stock = parseInt(formData.get("stock") as string, 10);
              const categoryId = formData.get("categoryId") as string;
              const occasionId = formData.get("occasionId") as string;
              const imageUrl = formData.get("imageUrl") as string;

              if (!name || !slug || !categoryId || !occasionId || isNaN(price) || isNaN(stock)) {
                throw new Error("Vui lòng điền đầy đủ các thông tin bắt buộc.");
              }

              await createProduct({
                name,
                slug,
                description,
                price,
                stock,
                categoryId,
                occasionId,
                images: [imageUrl || "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80"],
              });
            }}
            className={styles.form}
          >
            <div className="form-group">
              <label className="form-label">Tên sản phẩm *</label>
              <input type="text" name="name" className="form-input" placeholder="Ví dụ: Bó Hồng Đỏ Juliet" required />
            </div>

            <div className="form-group">
              <label className="form-label">Đường dẫn slug * (Duy nhất, viết liền không dấu)</label>
              <input type="text" name="slug" className="form-input" placeholder="bo-hong-do-juliet" required />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Giá bán (VND) *</label>
                <input type="number" name="price" className="form-input" placeholder="600000" min="0" required />
              </div>
              <div className="form-group">
                <label className="form-label">Số lượng tồn *</label>
                <input type="number" name="stock" className="form-input" placeholder="10" min="0" required />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Danh mục hoa *</label>
                <select name="categoryId" className="form-input" style={{ padding: "12px" }} required>
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Dịp tặng hoa *</label>
                <select name="occasionId" className="form-input" style={{ padding: "12px" }} required>
                  <option value="">-- Chọn dịp lễ --</option>
                  {occasions.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">URL Hình ảnh sản phẩm (Unsplash / Tùy chọn)</label>
              <input
                type="url"
                name="imageUrl"
                className="form-input"
                placeholder="https://images.unsplash.com/photo-..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mô tả sản phẩm *</label>
              <textarea
                name="description"
                className="form-input"
                style={{ minHeight: "80px", resize: "vertical" }}
                placeholder="Nhập mô tả về bó hoa, ý nghĩa, thành phần cắm..."
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className={styles.inlineIcon}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              </span>
              Thêm Sản Phẩm
            </button>
          </form>
        </div>

        {/* 2. Products List Table Card */}
        <div className={styles.tableCard} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h2 className="serif-title" style={{ fontSize: "1.25rem", color: "var(--botanical)", marginBottom: "8px" }}>
            Danh Sách Sản Phẩm Hiện Có ({products.length})
          </h2>

          <div style={{ maxHeight: "650px", overflowY: "auto" }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Ảnh</th>
                  <th className={styles.th}>Tên sản phẩm</th>
                  <th className={styles.th}>Giá bán</th>
                  <th className={styles.th}>Tồn kho</th>
                  <th className={styles.th}>Dịp & Phân loại</th>
                  <th className={styles.th}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className={styles.tableRow}>
                    <td className={styles.td}>
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "4px" }}
                      />
                    </td>
                    <td className={styles.td}>
                      <strong>{product.name}</strong>
                      <span style={{ display: "block", fontSize: "0.75rem", color: "var(--foreground-light)" }}>
                        slug: {product.slug}
                      </span>
                    </td>
                    <td className={styles.td} style={{ fontWeight: "600", color: "var(--primary)" }}>
                      {formatVND(product.price)}
                    </td>
                    <td className={styles.td} style={{ fontWeight: "600", color: product.stock > 0 ? "var(--success)" : "var(--error)" }}>
                      {product.stock} bó
                    </td>
                    <td className={styles.td} style={{ fontSize: "0.8rem" }}>
                      <div style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
                        <span className={styles.inlineIcon} style={{ marginRight: "4px" }}>
                          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
                        </span>
                        {product.category.name}
                      </div>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span className={styles.inlineIcon} style={{ marginRight: "4px" }}>
                          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></svg>
                        </span>
                        {product.occasion.name}
                      </div>
                    </td>
                    <td className={styles.td}>
                      <form
                        action={async () => {
                          "use server";
                          await deleteProduct(product.id);
                        }}
                      >
                        <button type="submit" className={`${styles.actionBtn} ${styles.actionBtnCancel}`}>
                          <span className={styles.inlineIcon}>
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                          </span>
                          Xóa
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
