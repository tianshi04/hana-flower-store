"use client";

import Link from "next/link";
import styles from "@/app/page.module.css";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  categoryId: string;
  occasionId: string;
  category: {
    name: string;
    slug: string;
  };
  occasion: {
    name: string;
    slug: string;
  };
}

interface GardenPageClientProps {
  products: Product[];
}

export default function GardenPageClient({ products }: GardenPageClientProps) {
  const formatVND = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Limit featured products to top 6
  const featuredProducts = products.slice(0, 6);

  const occasions = [
    {
      title: "Tình Yêu",
      desc: "Hâm nóng ngọn lửa yêu thương nồng nàn bằng những đóa hoa ngọt ngào nhất.",
      slug: "tinh-yeu",
      bgImage: "/images/pink_tulips.png",
    },
    {
      title: "Sinh Nhật",
      desc: "Món quà tươi tắn mang lại niềm vui rạng rỡ cho lời chúc tuổi mới ngập tràn.",
      slug: "sinh-nhat",
      bgImage: "/images/sunflowers.png",
    },
    {
      title: "Khai Trương",
      desc: "Lời chúc hồng phát, may mắn bền vững cho những hành trình bắt đầu mới.",
      slug: "khai-truong",
      bgImage: "/images/red_roses.png",
    },
    {
      title: "Chia Buồn",
      desc: "Sự đồng cảm chân thành, sẻ chia sâu sắc và lời tiễn đưa bình yên nhất.",
      slug: "chia-buon",
      bgImage: "/images/hydrangeas.png",
    },
  ];

  return (
    <div className={styles.homeWrapper}>
      {/* 1. Split Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          {/* Left Text Block */}
          <div className={styles.heroText}>
            <span className={styles.introBadge}>
              HanaShop Artistry
            </span>
            <h1 className={`${styles.heroTitle} serif-title`}>
              Gửi Gắm Tình Yêu Qua Từng Cánh Hoa
            </h1>
            <p className={styles.heroSubtitle}>
              Trải nghiệm hành trình cảm xúc tinh tế thông qua ngôn ngữ nghệ thuật cắm hoa tươi thiết kế cao cấp của các nghệ nhân tại HanaShop.
            </p>
            <Link href="/products" className="btn btn-primary">
              Khám phá cửa hàng
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "6px" }}>
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>

          {/* Right Image Container */}
          <div className={styles.heroImageWrapper}>
            <img
              className={styles.heroImg}
              src="https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80"
              alt="HanaShop Premium Bouquet"
            />
          </div>
        </div>
      </section>

      {/* 2. Brand Philosophy (Value Propositions) */}
      <section className={styles.philosophySection}>
        <div className={styles.sectionHeader}>
          <h2 className={`${styles.sectionTitle} serif-title`}>Tại Sao Chọn HanaShop?</h2>
          <p className={styles.sectionDesc}>Mỗi sản phẩm trao đi là một cam kết về chất lượng và nghệ thuật</p>
        </div>

        <div className={styles.philosophyGrid}>
          <div className={styles.philosophyCard}>
            <div className={styles.philosophyIcon}>
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <h3 className={`${styles.philosophyTitle} serif-title`}>Nghệ Nhân Thiết Kế</h3>
            <p className={styles.philosophyDesc}>
              Mẫu cắm hoa độc quyền được sáng tạo riêng biệt bởi các nghệ nhân giàu kinh nghiệm, mang đậm tính duy mỹ.
            </p>
          </div>

          <div className={styles.philosophyCard}>
            <div className={styles.philosophyIcon}>
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
            </div>
            <h3 className={`${styles.philosophyTitle} serif-title`}>Hoa Tươi Nhập Khẩu</h3>
            <p className={styles.philosophyDesc}>
              Lựa chọn kỹ lưỡng những đóa hoa tươi nhập khẩu cao cấp trong ngày, đảm bảo hoa luôn ở trạng thái rực rỡ nhất.
            </p>
          </div>

          <div className={styles.philosophyCard}>
            <div className={styles.philosophyIcon}>
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10" style={{ strokeDasharray: "3 3" }} />
              </svg>
            </div>
            <h3 className={`${styles.philosophyTitle} serif-title`}>Giao Hàng Nhanh 2H</h3>
            <p className={styles.philosophyDesc}>
              Đội ngũ giao hàng chuyên nghiệp vận chuyển nhanh trong 2 giờ nội thành, bảo quản hoa nguyên vẹn tuyệt đối.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Occasions Section (Grid categories with titles underneath) */}
      <section className={styles.occasionsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={`${styles.sectionTitle} serif-title`}>Khám Phá Theo Dịp</h2>
          <p className={styles.sectionDesc}>Món quà cảm xúc đong đầy được thiết kế chuyên biệt cho từng khoảnh khắc</p>
        </div>

        <div className={styles.occasionsGrid}>
          {occasions.map((occ) => (
            <Link key={occ.slug} href={`/products?occasion=${occ.slug}`} className={styles.occasionCard}>
              <div className={styles.occasionImageWrapper}>
                <div
                  className={styles.occasionCardBg}
                  style={{ backgroundImage: `url('${occ.bgImage}')` }}
                />
              </div>
              <div className={styles.occasionCardContent}>
                <h3 className={`${styles.occasionCardTitle} serif-title`}>{occ.title}</h3>
                <p className={styles.occasionCardDesc}>{occ.desc}</p>
                <span className={styles.occasionCardBtn}>
                  Khám phá bộ sưu tập
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "4px" }}>
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Featured Products Section (Editorial lookbook) */}
      <section className={styles.productsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={`${styles.sectionTitle} serif-title`}>Bộ Sưu Tập Nổi Bật</h2>
          <p className={styles.sectionDesc}>Những mẫu hoa cắm nghệ thuật độc quyền bán chạy nhất tuần này</p>
        </div>

        <div className={styles.productsGridContainer}>
          {featuredProducts.map((product) => (
            <div key={product.id} className={styles.productCard}>
              <div className={styles.cardImageWrapper}>
                <img
                  className={styles.cardImg}
                  src={product.images[0] || "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=400&q=80"}
                  alt={product.name}
                />
                <span className={styles.cardBadge}>{product.category.name}</span>
              </div>
              <h3 className={styles.cardTitle}>{product.name}</h3>
              <p className={styles.cardDesc}>{product.description}</p>
              <div className={styles.cardFooter}>
                <span className={styles.cardPrice}>{formatVND(product.price)}</span>
                <Link href={`/products/${product.slug}`} className={styles.cardBtn}>
                  Đặt Mua
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Story Section */}
      <section className={styles.storySection}>
        <div className={styles.storyContent}>
          <blockquote className={`${styles.storyQuote} serif-title`}>
            "Mỗi bông hoa là một linh hồn nở rộ giữa thiên nhiên. Tại HanaShop, chúng tôi không chỉ cắm hoa, chúng tôi dệt nên những câu chuyện cảm xúc tinh tế nhất của riêng bạn."
          </blockquote>
          <cite className={styles.storyAuthor}>
            — HanaShop Artistry Team —
          </cite>
        </div>
      </section>
    </div>
  );
}
