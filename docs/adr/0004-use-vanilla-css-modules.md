# ADR 0004: Sử dụng Vanilla CSS và CSS Modules để thiết kế giao diện

**Trạng thái:** Accepted

**Ngày:** 2026-06-04

## Ngữ cảnh (Context)
Website bán hoa yêu cầu thiết kế giao diện cực kỳ bắt mắt, sang trọng (premium aesthetics, glassmorphism, hiệu ứng chuyển động micro-animations, màu sắc hài hòa) để thu hút người mua. Hệ thống cần có tốc độ tải trang nhanh và khả năng kiểm soát tuyệt đối về phong cách hiển thị.

Các phương án được cân nhắc:
1. **Tailwind CSS**: Rất nhanh để xây dựng prototype nhưng dễ làm phình mã HTML, khó tạo ra các hiệu ứng hoạt ảnh (animations) hoặc bộ chọn (selectors) phức tạp, và vi phạm nguyên tắc chung của dự án trừ khi được yêu cầu.
2. **Component Libraries (MUI, Ant Design)**: Tiện lợi cho dashboard nhưng có giao diện mặc định mang tính "công nghiệp", khó tùy biến thành một trang bán hoa nghệ thuật và mềm mại.
3. **Vanilla CSS & CSS Modules**: Next.js hỗ trợ mặc định CSS Modules. Lớp CSS được giới hạn phạm vi tự động (scoped) cho từng component giúp tránh xung đột tên class, đồng thời giữ nguyên sức mạnh của CSS thuần (CSS Custom Properties, Keyframe Animations, Grid/Flexbox).

## Quyết định (Decision)
Chúng tôi quyết định sử dụng **CSS Modules** kết hợp với hệ thống **CSS Variables (Custom Properties) toàn cục** để thiết kế giao diện cho trang web.

Lý do chọn:
- **Tự do sáng tạo**: Cho phép viết các hiệu ứng hoạt hình mượt mà (chuyển động cánh hoa, hiệu ứng hover phóng to, hiệu ứng kính mờ - glassmorphism) mà không bị giới hạn bởi các lớp tiện ích của framework CSS.
- **Tối ưu hóa dung lượng**: Next.js sẽ tự động chia nhỏ và gộp các file CSS Modules theo từng trang, tối ưu hóa kích thước tải xuống.
- **Tránh xung đột**: Tên lớp CSS được băm (hash) tự động, giúp lập trình viên thoải mái đặt tên class ngắn gọn (`.card`, `.btn`) mà không sợ ảnh hưởng đến các component khác.

## Hệ quả (Consequences)
- **Điểm tích cực**:
  - Giao diện có nét độc bản, sang trọng, mang lại cảm giác cao cấp của một cửa hàng hoa nghệ thuật.
  - Tận dụng tối đa sức mạnh của CSS hiện đại (Variables, Nesting, Flex/Grid).
  - Không cần cài đặt thêm các thư viện CSS nặng nề khác.
- **Đánh đổi**:
  - Cần viết nhiều mã CSS thủ công hơn so với việc sử dụng Tailwind CSS.
  - Cần thiết kế một hệ thống token (màu sắc, khoảng cách, font chữ) rõ ràng trong `globals.css` trước khi bắt tay vào code các component để đảm bảo tính đồng bộ.
