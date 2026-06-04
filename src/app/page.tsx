import Link from "next/link";
import { getProducts } from "@/actions/products";
import styles from "./page.module.css";

// Force dynamic rendering to always load fresh products
export const revalidate = 0;

export default async function Home() {
  const allProducts = await getProducts();
  // Display top 3 products on the homepage as featured
  const featuredProducts = allProducts.slice(0, 3);

  const formatVND = (value: any) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(value));
  };

  const occasions = [
    {
      title: "Sinh Nhật",
      desc: "Lời chúc rực rỡ và tràn đầy niềm vui.",
      slug: "sinh-nhat",
      img: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=80",
    },
    {
      title: "Tình Yêu",
      desc: "Bày tỏ yêu thương sâu sắc, lãng mạn.",
      slug: "tinh-yeu",
      img: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=400&q=80",
    },
    {
      title: "Khai Trương",
      desc: "Lời chúc may mắn, hồng phát và thịnh vượng.",
      slug: "khai-truong",
      img: "https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&w=400&q=80",
    },
    {
      title: "Chia Buồn",
      desc: "Sự sẻ chia, tiễn đưa thành kính, bình yên.",
      slug: "chia-buon",
      img: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80",
    },
  ];

  const features = [
    {
      icon: "💐",
      title: "Thiết Kế Độc Quyền",
      desc: "Mỗi bó hoa đều được thiết kế nghệ thuật tỉ mỉ bởi nghệ nhân cắm hoa lành nghề.",
    },
    {
      icon: "🚗",
      title: "Giao Hàng Đúng Giờ",
      desc: "Bảo đảm hoa tươi mới nguyên vẹn khi tới tay người nhận. Giao nhanh trong 2h.",
    },
    {
      icon: "💌",
      title: "Thiệp Viết Tay Ý Nghĩa",
      desc: "Tặng kèm thiệp chúc mừng cao cấp viết tay giúp gửi trao trọn vẹn lời chúc.",
    },
  ];

  const testimonials = [
    {
      rating: "★★★★★",
      comment: "Hoa hồng đỏ nhung ở đây cực kỳ to và tươi. Giấy gói sang trọng đúng chuẩn châu Âu. Bạn gái mình nhận được rất thích!",
      author: "Hoàng Minh, Hà Nội",
    },
    {
      rating: "★★★★★",
      comment: "Mình đã đặt kệ hoa khai trương ở đây. Giao hàng cực kỳ đúng giờ, hoa rực rỡ nổi bật nhất cả cửa hàng mới. Sẽ tiếp tục ủng hộ.",
      author: "Thanh Hương, TP. HCM",
    },
    {
      rating: "★★★★★",
      comment: "Dịch vụ cắm hoa chu đáo, tư vấn nhiệt tình. Khung giờ giao hoa chính xác và thiệp ghi lời chúc chữ viết tay rất đẹp.",
      author: "Nguyễn Tuấn, Đà Nẵng",
    },
  ];

  return (
    <div className={styles.page}>
      {/* 1. Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.tagline}>Món quà của thiên nhiên</span>
          <h1 className={`${styles.heroTitle} animate-fade-in`}>
            Nâng Niêu Từng Khoảnh Khắc Bằng Hoa Tươi Nghệ Thuật
          </h1>
          <p className={styles.heroDescription}>
            Tuyển chọn những đóa hoa tươi thắm nhất từ Đà Lạt và Ecuador để kiến tạo nên những tác phẩm hoa độc bản, đồng hành cùng bạn gửi trao yêu thương.
          </p>
          <div className={styles.heroActions}>
            <Link href="/products" className="btn btn-primary">
              Xem Sản Phẩm 💐
            </Link>
            <Link href="/products?occasion=sinh-nhat" className="btn btn-secondary">
              Hoa Sinh Nhật 🎂
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Occasions Section */}
      <section className={styles.section}>
        <h2 className={`${styles.sectionTitle} serif-title`}>Chọn Hoa Theo Dịp</h2>
        <p className={styles.sectionSubtitle}>
          Tìm kiếm bó hoa hoàn hảo phù hợp nhất với thông điệp bạn muốn trao gửi.
        </p>

        <div className={styles.occasionsGrid}>
          {occasions.map((occ) => (
            <Link
              key={occ.slug}
              href={`/products?occasion=${occ.slug}`}
              className={styles.occasionCard}
            >
              <div
                className={styles.occasionBg}
                style={{ backgroundImage: `url('${occ.img}')` }}
              />
              <div className={styles.occasionOverlay}>
                <h3 className={styles.occasionTitle}>{occ.title}</h3>
                <p className={occ.occasionDesc}>{occ.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Features Section */}
      <div className={styles.featuresBg}>
        <section className={styles.section}>
          <div className={styles.featuresGrid}>
            {features.map((feat, i) => (
              <div key={i} className={styles.featureCard}>
                <div className={styles.featureIcon}>{feat.icon}</div>
                <h3 className={styles.featureTitle}>{feat.title}</h3>
                <p className={styles.featureDesc}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 4. Featured Products Section */}
      <section className={styles.section}>
        <h2 className={`${styles.sectionTitle} serif-title`}>Mẫu Hoa Bán Chạy</h2>
        <p className={styles.sectionSubtitle}>
          Những thiết kế cắm hoa tươi nghệ thuật được yêu thích nhất thời gian qua.
        </p>

        <div className={styles.productsGrid}>
          {featuredProducts.map((product) => (
            <div key={product.id} className={styles.productCard}>
              <div className={styles.imageWrapper}>
                <img
                  className={styles.productImg}
                  src={product.images[0] || "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=400&q=80"}
                  alt={product.name}
                />
                <span className={styles.tag}>{product.occasion.name}</span>
              </div>
              <div className={styles.productInfo}>
                <h3 className={styles.productTitle}>{product.name}</h3>
                <p className={styles.productDescription}>{product.description}</p>
                <div className={styles.priceRow}>
                  <span className={styles.price}>{formatVND(product.price)}</span>
                  <Link href={`/products/${product.slug}`} className={styles.detailBtn}>
                    Chi tiết
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Customer Testimonials Section */}
      <section className={styles.section}>
        <h2 className={`${styles.sectionTitle} serif-title`}>Khách Hàng Nói Gì Về Chúng Tôi</h2>
        <p className={styles.sectionSubtitle}>
          Động lực to lớn giúp chúng tôi cải thiện chất lượng phục vụ mỗi ngày.
        </p>

        <div className={styles.reviewsGrid}>
          {testimonials.map((test, i) => (
            <div key={i} className={styles.reviewCard}>
              <div className={styles.rating}>{test.rating}</div>
              <p className={styles.comment}>"{test.comment}"</p>
              <div className={styles.author}>{test.author}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
