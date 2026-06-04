import { Product, Category, Occasion, Prisma } from "@prisma/client";

export interface ProductFilters {
  categoryId?: string;
  occasionId?: string;
  query?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface CreateProductData {
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  categoryId: string;
  occasionId: string;
}

export interface UpdateProductData {
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  categoryId: string;
  occasionId: string;
}

export interface ProductWithCategoryAndOccasion extends Product {
  category: Category;
  occasion: Occasion;
}

export type ProductWithDetails = Prisma.ProductGetPayload<{
  include: {
    category: true;
    occasion: true;
    reviews: {
      include: {
        user: {
          select: { name: true };
        };
      };
    };
  };
}>;

export interface ProductRepository {
  findMany(filters?: ProductFilters): Promise<ProductWithCategoryAndOccasion[]>;
  findById(id: string): Promise<ProductWithCategoryAndOccasion | null>;
  findBySlug(slug: string): Promise<ProductWithDetails | null>;
  create(data: CreateProductData): Promise<Product>;
  update(id: string, data: UpdateProductData): Promise<Product>;
  delete(id: string): Promise<void>;
}
