import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/actions/products";
import ProductOrderForm from "@/components/ProductOrderForm";
import styles from "./product-detail.module.css";

export const revalidate = 0;

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const formatVND = (value: any) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(value));
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className={styles.wrapper}>
      {/* Back button */}
      <Link href="/products" className={styles.backBtn}>
        <span>←</span> Quay lại danh sách hoa
      </Link>

      <div className={styles.layout}>
        {/* 1. Left column - Image Showcase */}
        <div className={styles.imageShowcase}>
          <div className={styles.mainImageWrapper}>
            <img
              className={styles.mainImage}
              src={product.images[0] || "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80"}
              alt={product.name}
            />
          </div>

          {product.images.length > 1 && (
            <div className={styles.thumbnailList}>
              {product.images.map((imgUrl, i) => (
                <div key={i} className={`${styles.thumbnail} ${i === 0 ? styles.thumbnailActive : ""}`}>
                  <img className={styles.thumbnailImg} src={imgUrl} alt={`${product.name} ${i + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Right column - Product Content & Order Form */}
        <div className={styles.content}>
          <div className={styles.metaRow}>
            <span className={styles.tag}>{product.occasion.name}</span>
            <span className={styles.categoryTag}>{product.category.name}</span>
          </div>

          <h1 className={`${styles.title} serif-title`}>{product.name}</h1>
          
          <div className={styles.price}>
            {formatVND(product.price)}
          </div>

          <div className={styles.divider} />

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <h3 className={styles.descriptionTitle}>Mô tả chi tiết</h3>
            <p className={styles.description}>{product.description}</p>
          </div>

          <div className={styles.divider} />

          {/* Interactive Order & Customization Form */}
          <ProductOrderForm
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              images: product.images,
              stock: product.stock,
            }}
          />
        </div>
      </div>

      {/* 3. Bottom - Reviews Section */}
      <section className={styles.reviewsSection}>
        <h2 className={`${styles.reviewsTitle} serif-title`}>Đánh Giá Sản Phẩm</h2>
        {product.reviews.length > 0 ? (
          <div className={styles.reviewsList}>
            {product.reviews.map((review) => (
              <div key={review.id} className={styles.reviewItem}>
                <div className={styles.reviewHeader}>
                  <div className={styles.reviewer}>{review.user.name}</div>
                  <div className={styles.reviewDate}>{formatDate(review.createdAt)}</div>
                </div>
                <div className={styles.reviewRating}>
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </div>
                <p className={styles.reviewComment}>{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.noReviews}>Chưa có đánh giá nào cho sản phẩm hoa này. Hãy là người đầu tiên mua hàng và để lại ý kiến của bạn!</p>
        )}
      </section>
    </div>
  );
}
