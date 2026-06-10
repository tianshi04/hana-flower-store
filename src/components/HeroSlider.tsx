"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import styles from "./HeroSlider.module.css";

interface ProductFromDb {
  id: string;
  name: string;
  slug: string;
  price: any; // Decimal
  images: string[];
}

interface HeroSliderProps {
  products: ProductFromDb[];
}

interface SlideItem {
  id: number;
  slug: string;
  badge: string;
  titlePre: string;
  titleHighlight: string;
  description: string;
  rating: number;
  reviews: number;
  priceUSD: string;
  priceVND: number;
  image: string;
  options: string[];
}

export default function HeroSlider({ products }: HeroSliderProps) {
  const { addToCart } = useCart();
  const [currentIdx, setCurrentIdx] = useState(1); // Default to index 1 (Tulips, slide 02) to match image
  const [selectedOption, setSelectedOption] = useState("");
  const [location, setLocation] = useState("Hà Nội");
  const [isAdded, setIsAdded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const slides: SlideItem[] = [
    {
      id: 0,
      slug: "bo-hoa-hong-do-nhung-paris",
      badge: "Bán Chạy Nhất",
      titlePre: "Bó hoa hồng",
      titleHighlight: "đỏ nhung Paris",
      description: "Bó hoa hồng đỏ nhung đắm thắm, được gói sang trọng với giấy đen cao cấp. Đây là món quà hoàn hảo nhất để bày tỏ tình yêu sâu sắc và cháy bỏng.",
      rating: 5,
      reviews: 148,
      priceUSD: "39.99",
      priceVND: 650000,
      image: "/images/red_roses.png",
      options: ["Bó 10 cành hồng", "Bó 20 cành hồng", "Bó 30 cành hồng"],
    },
    {
      id: 1,
      slug: "bo-hoa-tulip-ha-lan-trang-tinh-khoi",
      badge: "New Flower",
      titlePre: "Bouquet of pink",
      titleHighlight: "tulips special",
      description: "Bó hoa tulip Hà Lan cao cấp mang màu hồng pastel lãng mạn, được cắm cẩn thận bởi nghệ nhân hàng đầu. Thể hiện một tình yêu tinh tế và chân thành tuyệt đối.",
      rating: 5,
      reviews: 275,
      priceUSD: "52.99",
      priceVND: 850000,
      image: "/images/pink_tulips.png",
      options: ["12 Unid Tulip", "20 Unid Tulip", "30 Unid Tulip"],
    },
    {
      id: 2,
      slug: "nang-am-ban-mai",
      badge: "Rực Rỡ & Năng Lượng",
      titlePre: "Bó hoa hướng dương",
      titleHighlight: "nắng ấm ban mai",
      description: "Bó hoa hướng dương 5 bông rực rỡ kết hợp với lá bạc nhập khẩu. Mang ý nghĩa chúc mừng tuổi mới đầy năng lượng, sức khỏe và sự nghiệp hanh thông.",
      rating: 4.9,
      reviews: 92,
      priceUSD: "22.50",
      priceVND: 350000,
      image: "/images/sunflowers.png",
      options: ["Bó 5 cành", "Bó 9 cành", "Bó 15 cành"],
    },
    {
      id: 3,
      slug: "bo-hoa-cam-tu-cau-xanh-hy-vong",
      badge: "Ý Nghĩa Sâu Sắc",
      titlePre: "Bó hoa cẩm tú cầu",
      titleHighlight: "xanh hy vọng",
      description: "Một đóa cẩm tú cầu xanh đại đóa nhập khẩu từ Ecuador được gói đơn giản tinh tế. Món quà thay lời cảm ơn chân thành hoặc xin lỗi nhẹ nhàng đầy tinh tế.",
      rating: 4.8,
      reviews: 64,
      priceUSD: "28.99",
      priceVND: 450000,
      image: "/images/hydrangeas.png",
      options: ["Hộp 1 đóa đại", "Giỏ hoa 2 đóa", "Bó hoa 3 đóa"],
    },
    {
      id: 4,
      slug: "bo-hoa-hong-kem-ngot-ngao",
      badge: "Ngọt Ngào & Tình Thơ",
      titlePre: "Bó hoa hồng kem",
      titleHighlight: "ngọt ngào lãng mạn",
      description: "Sự kết hợp ngọt ngào giữa hoa hồng kem dịu nhẹ và hoa baby trắng, mang lại cảm giác thanh khiết, mộc mạc và đầy chất thơ.",
      rating: 5,
      reviews: 110,
      priceUSD: "31.00",
      priceVND: 480000,
      image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80",
      options: ["Bó 10 cành", "Bó 20 cành", "Bó 30 cành"],
    },
  ];

  const currentSlide = slides[currentIdx];

  // Initialize option selection when active slide changes
  useEffect(() => {
    setSelectedOption(currentSlide.options[0]);
  }, [currentIdx]);

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const formatVND = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const handleAddToCart = () => {
    // Find matching product in database by slug
    const dbProduct = products.find((p) => p.slug === currentSlide.slug);

    const productId = dbProduct?.id || `static-${currentSlide.slug}`;
    const fallbackName = `${currentSlide.titlePre} ${currentSlide.titleHighlight}`;
    const name = dbProduct?.name || fallbackName;
    const price = dbProduct ? Number(dbProduct.price) : currentSlide.priceVND;
    const image = dbProduct?.images?.[0] || currentSlide.image;

    addToCart({
      productId,
      name: `${name} (${selectedOption})`,
      slug: currentSlide.slug,
      price,
      image,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  if (!isMounted) return null;

  return (
    <div className={styles.sliderOuter}>
      <div className={styles.sliderCard}>
        {/* Left Side: Vertical Navigation */}
        <div className={styles.leftNav}>
          <button className={styles.navArrow} onClick={handlePrev} aria-label="Previous slide">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
          
          <div className={styles.slideNumbers}>
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                className={`${styles.slideNum} ${currentIdx === i ? styles.slideNumActive : ""}`}
                onClick={() => setCurrentIdx(i)}
              >
                {String(i + 1).padStart(2, "0")}
              </button>
            ))}
          </div>

          <button className={styles.navArrow} onClick={handleNext} aria-label="Next slide">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>

        {/* Center/Left: Slide Content */}
        <div className={styles.slideDetails}>
          <span className={styles.badge}>{currentSlide.badge}</span>
          
          <h1 className={styles.title}>
            {currentSlide.titlePre} <span className={styles.highlight}>{currentSlide.titleHighlight}</span>
          </h1>

          <p className={styles.description}>{currentSlide.description}</p>

          <div className={styles.metaRow}>
            {/* Rating Stars */}
            <div className={styles.rating}>
              <div className={styles.stars}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill={i < Math.floor(currentSlide.rating) ? "#ffb703" : "none"}
                    stroke="#ffb703"
                    strokeWidth="1.5"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <span className={styles.reviewText}>{currentSlide.reviews} đánh giá</span>
            </div>

            {/* Location Selector */}
            <div className={styles.locationSelector}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={styles.dropdownSelect}
              >
                <option value="Hà Nội">Hà Nội</option>
                <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
              </select>
            </div>
          </div>

          {/* Pricing & Add to Cart Panel */}
          <div className={styles.buyPanel}>
            <div className={styles.priceContainer}>
              <span className={styles.priceUSD}>${currentSlide.priceUSD}</span>
              <span className={styles.priceVND}>{formatVND(currentSlide.priceVND)}</span>
            </div>

            <div className={styles.optionSelector}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <select
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
                className={styles.dropdownSelect}
              >
                {currentSlide.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <button
              className={`${styles.addToCartBtn} ${isAdded ? styles.addToCartBtnAdded : ""}`}
              onClick={handleAddToCart}
            >
              {isAdded ? "ĐÃ THÊM GIỎ HÀNG!" : "THÊM VÀO GIỎ HÀNG"}
            </button>
          </div>
        </div>

        {/* Right Side: Product Image & Float Items */}
        <div className={styles.imageSection}>
          {/* Main Product Image */}
          <div className={styles.imageContainer}>
            <img
              src={currentSlide.image}
              alt={currentSlide.titlePre + " " + currentSlide.titleHighlight}
              className={styles.productImg}
            />
          </div>

          {/* Floating Leaves */}
          <div className={`${styles.leaf} ${styles.leaf1}`}>🍃</div>
          <div className={`${styles.leaf} ${styles.leaf2}`}>🍂</div>
          <div className={`${styles.leaf} ${styles.leaf3}`}>🌿</div>

          {/* Social/Favor Actions */}
          <div className={styles.sideActions}>
            <button className={styles.actionCircleBtn} aria-label="Share">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
            
            <button className={styles.actionCircleBtn} aria-label="Add to wishlist">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
