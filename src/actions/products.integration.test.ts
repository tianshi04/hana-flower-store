import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { GenericContainer, StartedTestContainer } from "testcontainers";
import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { auth } from "@/auth";
import {
  getCategories,
  getOccasions,
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./products";

// 1. Mock NextAuth to return a valid customer session
vi.mock("@/auth", () => {
  return {
    auth: vi.fn().mockResolvedValue({
      user: {
        id: "test-customer-id-123",
        name: "Test Customer",
        email: "testcustomer@example.com",
        role: "CUSTOMER",
      },
    }),
  };
});

// Mock next/cache since it expects Next.js environment context
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

// 2. Mock database to redirect all calls to our container instance via global Proxy
vi.mock("@/lib/db", () => {
  return {
    db: new Proxy({} as any, {
      get(target, prop) {
        const testDb = (globalThis as any).testPrisma;
        if (!testDb) {
          throw new Error("Test Prisma client not initialized yet.");
        }
        return testDb[prop];
      },
    }),
  };
});

describe("Products Server Actions Integration Tests (PostgreSQL Testcontainer)", () => {
  let container: StartedTestContainer;
  let prisma: PrismaClient;
  let pool: Pool;
  let connectionString: string;

  // Variables to hold seeded database identifiers
  let categoryId1: string;
  let categoryId2: string;
  let occasionId1: string;
  let productId1: string;
  let productId2: string;

  beforeAll(async () => {
    console.log("Spinning up PostgreSQL Testcontainer for Products...");
    
    // Start Postgres generic container
    container = await new GenericContainer("postgres:15-alpine")
      .withExposedPorts(5432)
      .withEnvironment({
        POSTGRES_USER: "testuser",
        POSTGRES_PASSWORD: "testpassword",
        POSTGRES_DB: "testdb",
      })
      .start();

    const host = container.getHost();
    const port = container.getMappedPort(5432);
    connectionString = `postgresql://testuser:testpassword@${host}:${port}/testdb?schema=public`;

    console.log(`Testcontainer database ready at ${connectionString}`);

    // Push Prisma schema to this test database
    console.log("Pushing Prisma schema to Testcontainer...");
    execSync("npx prisma db push", {
      env: {
        ...process.env,
        DATABASE_URL: connectionString,
      },
    });

    // Initialize Prisma Client pointing to test container DB
    pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });

    // Inject this instance into globalThis for the database Proxy mock to use
    (globalThis as any).testPrisma = prisma;

    // Seed initial data for integration tests
    console.log("Seeding test database fixtures...");
    
    // Create Categories
    const cat1 = await prisma.category.create({
      data: { name: "Hoa Hồng", slug: "hoa-hong", description: "Cac loai hoa hong" },
    });
    categoryId1 = cat1.id;

    const cat2 = await prisma.category.create({
      data: { name: "Hoa Hướng Dương", slug: "hoa-huong-duong", description: "Cac loai hoa huong duong" },
    });
    categoryId2 = cat2.id;

    // Create Occasions
    const occ1 = await prisma.occasion.create({
      data: { name: "Sinh Nhật", slug: "sinh-nhat", description: "Hoa mung sinh nhat" },
    });
    occasionId1 = occ1.id;

    // Create Products
    const prod1 = await prisma.product.create({
      data: {
        name: "Bó Hoa Hồng Đỏ Thắm",
        slug: "bo-hoa-hong-do-tham",
        description: "Bó hoa hồng đỏ rực rỡ",
        price: 350000,
        stock: 10,
        images: ["https://example.com/hong-do.jpg"],
        categoryId: categoryId1,
        occasionId: occasionId1,
      },
    });
    productId1 = prod1.id;

    const prod2 = await prisma.product.create({
      data: {
        name: "Lẵng Hoa Hướng Dương Nắng Vàng",
        slug: "lang-hoa-huong-duong-nang-vang",
        description: "Lẵng hoa hướng dương rực rỡ như nắng",
        price: 550000,
        stock: 5,
        images: ["https://example.com/huong-duong.jpg"],
        categoryId: categoryId2,
        occasionId: occasionId1,
      },
    });
    productId2 = prod2.id;

    console.log("Database seeded successfully.");
  }, 90000);

  afterAll(async () => {
    // Clean up connections and container
    if (prisma) await prisma.$disconnect();
    if (pool) await pool.end();
    if (container) await container.stop();
    console.log("Testcontainer stopped.");
  });

  it("should fetch all categories", async () => {
    const categories = await getCategories();
    expect(categories).toBeDefined();
    expect(categories.length).toBe(2);
    expect(categories.map((c) => c.slug)).toContain("hoa-hong");
  });

  it("should fetch all occasions", async () => {
    const occasions = await getOccasions();
    expect(occasions).toBeDefined();
    expect(occasions.length).toBe(1);
    expect(occasions[0].slug).toBe("sinh-nhat");
  });

  it("should fetch all products without filters", async () => {
    const products = await getProducts();
    expect(products).toBeDefined();
    expect(products.length).toBe(2);
  });

  it("should filter products by category", async () => {
    const products = await getProducts({ categoryId: categoryId1 });
    expect(products.length).toBe(1);
    expect(products[0].id).toBe(productId1);
  });

  it("should filter products by occasion", async () => {
    const products = await getProducts({ occasionId: occasionId1 });
    expect(products.length).toBe(2);
  });

  it("should filter products by query search", async () => {
    const products = await getProducts({ query: "Hướng Dương" });
    expect(products.length).toBe(1);
    expect(products[0].id).toBe(productId2);
  });

  it("should filter products by price range", async () => {
    const products = await getProducts({ minPrice: 300000, maxPrice: 400000 });
    expect(products.length).toBe(1);
    expect(products[0].id).toBe(productId1);
  });

  it("should get product by slug", async () => {
    const prod = await getProductBySlug("bo-hoa-hong-do-tham");
    expect(prod).not.toBeNull();
    expect(prod?.id).toBe(productId1);
    expect(prod?.category.name).toBe("Hoa Hồng");
  });

  it("should get product by ID", async () => {
    const prod = await getProductById(productId2);
    expect(prod).not.toBeNull();
    expect(prod?.slug).toBe("lang-hoa-huong-duong-nang-vang");
  });

  it("should throw unauthorized error when customer tries to create product", async () => {
    const newProductData = {
      name: "Hoa Baby Trắng",
      slug: "hoa-baby-trang",
      description: "Bó hoa baby ngọt ngào",
      price: 250000,
      images: ["https://example.com/baby.jpg"],
      stock: 15,
      categoryId: categoryId1,
      occasionId: occasionId1,
    };

    await expect(createProduct(newProductData)).rejects.toThrow("Unauthorized");
  });

  it("should allow admin to create product", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: {
        id: "admin-user-id",
        name: "Admin User",
        email: "admin@example.com",
        role: "ADMIN",
      },
    });

    const newProductData = {
      name: "Hoa Baby Trắng",
      slug: "hoa-baby-trang",
      description: "Bó hoa baby ngọt ngào",
      price: 250000,
      images: ["https://example.com/baby.jpg"],
      stock: 15,
      categoryId: categoryId1,
      occasionId: occasionId1,
    };

    const created = await createProduct(newProductData);
    expect(created).toBeDefined();
    expect(created.slug).toBe("hoa-baby-trang");

    // Verify it exists in DB
    const prodInDb = await prisma.product.findUnique({ where: { slug: "hoa-baby-trang" } });
    expect(prodInDb).not.toBeNull();
    expect(prodInDb?.name).toBe("Hoa Baby Trắng");
  });

  it("should throw unauthorized error when customer tries to update product", async () => {
    const updateData = {
      name: "Bó Hoa Hồng Đỏ Cực Đẹp",
      slug: "bo-hoa-hong-do-tham",
      description: "Cập nhật mô tả hoa hồng",
      price: 380000,
      images: ["https://example.com/hong-do.jpg"],
      stock: 8,
      categoryId: categoryId1,
      occasionId: occasionId1,
    };

    await expect(updateProduct(productId1, updateData)).rejects.toThrow("Unauthorized");
  });

  it("should allow admin to update product", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: {
        id: "admin-user-id",
        name: "Admin User",
        email: "admin@example.com",
        role: "ADMIN",
      },
    });

    const updateData = {
      name: "Bó Hoa Hồng Đỏ Cực Đẹp",
      slug: "bo-hoa-hong-do-tham",
      description: "Cập nhật mô tả hoa hồng",
      price: 380000,
      images: ["https://example.com/hong-do.jpg"],
      stock: 8,
      categoryId: categoryId1,
      occasionId: occasionId1,
    };

    const updated = await updateProduct(productId1, updateData);
    expect(updated).toBeDefined();
    expect(updated.name).toBe("Bó Hoa Hồng Đỏ Cực Đẹp");
    expect(updated.stock).toBe(8);

    const prodInDb = await prisma.product.findUnique({ where: { id: productId1 } });
    expect(prodInDb?.stock).toBe(8);
  });

  it("should throw unauthorized error when customer tries to delete product", async () => {
    await expect(deleteProduct(productId2)).rejects.toThrow("Unauthorized");
  });

  it("should allow admin to delete product", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: {
        id: "admin-user-id",
        name: "Admin User",
        email: "admin@example.com",
        role: "ADMIN",
      },
    });

    const result = await deleteProduct(productId2);
    expect(result.success).toBe(true);

    const prodInDb = await prisma.product.findUnique({ where: { id: productId2 } });
    expect(prodInDb).toBeNull();
  });
});
