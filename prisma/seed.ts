import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not defined");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting seeding with PrismaPg adapter...");

  // 1. Clean existing data
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.occasion.deleteMany();
  await prisma.user.deleteMany();

  console.log("Database cleared.");

  // 2. Create Users
  const adminPasswordHash = await bcrypt.hash("adminpassword", 10);
  const customerPasswordHash = await bcrypt.hash("customerpassword", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin Flower Dang",
      email: "admin@flowerdang.com",
      password: adminPasswordHash,
      role: "ADMIN",
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: "Nguyễn Văn Khách",
      email: "customer@flowerdang.com",
      password: customerPasswordHash,
      role: "CUSTOMER",
    },
  });

  console.log("Users created:", { admin: admin.email, customer: customer.email });

  // 3. Create Categories
  const categoriesData = [
    { name: "Hoa Hồng", slug: "hoa-hong", description: "Vẻ đẹp quyến rũ, biểu tượng của tình yêu nồng thắm." },
    { name: "Hoa Hướng Dương", slug: "hoa-huong-duong", description: "Sự ấm áp, niềm tin và hy vọng luôn hướng về tương lai." },
    { name: "Hoa Cẩm Tú Cầu", slug: "hoa-cam-tu-cau", description: "Lòng biết ơn và những cảm xúc chân thành." },
    { name: "Hoa Tulip", slug: "hoa-tulip", description: "Vẻ đẹp kiêu sa, thanh lịch và sự hoàn hảo." },
    { name: "Bó Hoa Hỗn Hợp", slug: "bo-hoa-hon-hop", description: "Sự kết hợp tinh tế giữa nhiều loại hoa nghệ thuật." },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categories[cat.slug] = created;
  }
  console.log("Categories created.");

  // 4. Create Occasions
  const occasionsData = [
    { name: "Sinh Nhật", slug: "sinh-nhat", description: "Món quà tươi tắn mang lại niềm vui và lời chúc tuổi mới rực rỡ." },
    { name: "Tình Yêu", slug: "tinh-yeu", description: "Gắn kết tình cảm đôi lứa, hâm nóng ngọn lửa yêu thương." },
    { name: "Khai Trương", slug: "khai-truong", description: "Lời chúc hồng phát, may mắn và thịnh vượng cho khởi đầu mới." },
    { name: "Chia Buồn", slug: "chia-buon", description: "Sự đồng cảm, sẻ chia và tiễn đưa thành kính nhất." },
  ];

  const occasions: Record<string, any> = {};
  for (const occ of occasionsData) {
    const created = await prisma.occasion.create({ data: occ });
    occasions[occ.slug] = created;
  }
  console.log("Occasions created.");

  // 5. Create Products
  const productsData = [
    {
      name: "Bó Hoa Hồng Đỏ Nhung Paris",
      slug: "bo-hoa-hong-do-nhung-paris",
      description: "Bó hoa hồng đỏ nhung đắm thắm, được gói sang trọng với giấy đen cao cấp. Đây là món quà hoàn hảo nhất để bày tỏ tình yêu sâu sắc và cháy bỏng.",
      price: 650000,
      images: [
        "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80"
      ],
      stock: 15,
      categorySlug: "hoa-hong",
      occasionSlug: "tinh-yeu",
    },
    {
      name: "Bó Hoa Hồng Kem Ngọt Ngào",
      slug: "bo-hoa-hong-kem-ngot-ngao",
      description: "Sự kết hợp ngọt ngào giữa hoa hồng kem dịu nhẹ và hoa baby trắng, mang lại cảm giác thanh khiết, mộc mạc và đầy chất thơ.",
      price: 480000,
      images: ["https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80"],
      stock: 20,
      categorySlug: "hoa-hong",
      occasionSlug: "sinh-nhat",
    },
    {
      name: "Nắng Ấm Ban Mai",
      slug: "nang-am-ban-mai",
      description: "Bó hoa hướng dương 5 bông rực rỡ kết hợp với lá bạc nhập khẩu. Mang ý nghĩa chúc mừng tuổi mới đầy năng lượng, sức khỏe và sự nghiệp hanh thông.",
      price: 350000,
      images: ["https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80"],
      stock: 30,
      categorySlug: "hoa-huong-duong",
      occasionSlug: "sinh-nhat",
    },
    {
      name: "Kệ Hoa Khai Trương Tấn Tài Tấn Lộc",
      slug: "ke-hoa-khai-truong-tan-tai-tan-loc",
      description: "Kệ hoa 2 tầng hoành tráng kết hợp từ hoa đồng tiền, hoa hồng môn và hoa hướng dương rực rỡ, biểu trưng cho sự thăng tiến, may mắn và thịnh vượng vượt bậc.",
      price: 1500000,
      images: ["https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&w=600&q=80"],
      stock: 8,
      categorySlug: "bo-hoa-hon-hop",
      occasionSlug: "khai-truong",
    },
    {
      name: "Bó Hoa Cẩm Tú Cầu Xanh Hy Vọng",
      slug: "bo-hoa-cam-tu-cau-xanh-hy-vong",
      description: "Một đóa cẩm tú cầu xanh đại đóa nhập khẩu từ Ecuador được gói đơn giản tinh tế. Món quà thay lời cảm ơn chân thành hoặc xin lỗi nhẹ nhàng đầy tinh tế.",
      price: 450000,
      images: ["https://images.unsplash.com/photo-1508784932226-22f7f45a5710?auto=format&fit=crop&w=600&q=80"],
      stock: 12,
      categorySlug: "hoa-cam-tu-cau",
      occasionSlug: "sinh-nhat",
    },
    {
      name: "Lối Về Bình Yên",
      slug: "loi-ve-binh-yen",
      description: "Lẵng hoa chia buồn trang trọng kết hợp hoa cúc trắng, hoa lan hồ điệp trắng và cúc pingpong. Thể hiện niềm tiếc thương vô hạn và cầu chúc vong hồn được an nghỉ bình yên.",
      price: 1200000,
      images: ["https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80"],
      stock: 5,
      categorySlug: "bo-hoa-hon-hop",
      occasionSlug: "chia-buon",
    },
    {
      name: "Bó Hoa Tulip Hà Lan Trắng Tinh Khôi",
      slug: "bo-hoa-tulip-ha-lan-trang-tinh-khoi",
      description: "Bó hoa gồm 10 cành hoa Tulip trắng nhập trực tiếp từ Hà Lan. Hoa Tulip trắng mang biểu tượng của một tình yêu kiêu sa, thuần khiết và chân thành tuyệt đối.",
      price: 850000,
      images: ["https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=600&q=80"],
      stock: 10,
      categorySlug: "hoa-tulip",
      occasionSlug: "tinh-yeu",
    }
  ];

  for (const prod of productsData) {
    const { categorySlug, occasionSlug, ...rest } = prod;
    await prisma.product.create({
      data: {
        ...rest,
        categoryId: categories[categorySlug].id,
        occasionId: occasions[occasionSlug].id,
      },
    });
  }

  console.log("Products seeded successfully.");
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
