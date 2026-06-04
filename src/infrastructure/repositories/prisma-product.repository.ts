import { db } from "@/lib/db";
import { Product, Category, Occasion } from "@prisma/client";
import {
  ProductRepository,
  ProductFilters,
  CreateProductData,
  UpdateProductData,
  ProductWithCategoryAndOccasion,
  ProductWithDetails,
} from "@/domain/repositories/product.repository";

export class PrismaProductRepository implements ProductRepository {
  async findMany(filters?: ProductFilters): Promise<ProductWithCategoryAndOccasion[]> {
    const where: any = {};

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }
    if (filters?.occasionId) {
      where.occasionId = filters.occasionId;
    }
    if (filters?.query) {
      where.OR = [
        { name: { contains: filters.query, mode: "insensitive" } },
        { description: { contains: filters.query, mode: "insensitive" } },
      ];
    }
    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    return await db.product.findMany({
      where,
      include: {
        category: true,
        occasion: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string): Promise<ProductWithCategoryAndOccasion | null> {
    return await db.product.findUnique({
      where: { id },
      include: {
        category: true,
        occasion: true,
      },
    });
  }

  async findBySlug(slug: string): Promise<ProductWithDetails | null> {
    return await db.product.findUnique({
      where: { slug },
      include: {
        category: true,
        occasion: true,
        reviews: {
          include: {
            user: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  async create(data: CreateProductData): Promise<Product> {
    return await db.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        images: data.images,
        stock: data.stock,
        categoryId: data.categoryId,
        occasionId: data.occasionId,
      },
    });
  }

  async update(id: string, data: UpdateProductData): Promise<Product> {
    return await db.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        images: data.images,
        stock: data.stock,
        categoryId: data.categoryId,
        occasionId: data.occasionId,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await db.product.delete({
      where: { id },
    });
  }
}
