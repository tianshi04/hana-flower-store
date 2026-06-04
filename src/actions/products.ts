"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { PrismaProductRepository } from "@/infrastructure/repositories/prisma-product.repository";
import { PrismaCategoryRepository } from "@/infrastructure/repositories/prisma-category.repository";
import { PrismaOccasionRepository } from "@/infrastructure/repositories/prisma-occasion.repository";
import {
  GetCategoriesUseCase,
  GetOccasionsUseCase,
  GetProductsUseCase,
  GetProductBySlugUseCase,
  GetProductByIdUseCase,
  CreateProductUseCase,
  UpdateProductUseCase,
  DeleteProductUseCase,
} from "@/application/use-cases/product/product.usecases";

const productRepo = new PrismaProductRepository();
const categoryRepo = new PrismaCategoryRepository();
const occasionRepo = new PrismaOccasionRepository();

export async function getCategories() {
  const useCase = new GetCategoriesUseCase(categoryRepo);
  return await useCase.execute();
}

export async function getOccasions() {
  const useCase = new GetOccasionsUseCase(occasionRepo);
  return await useCase.execute();
}

export async function getProducts(filters?: {
  categoryId?: string;
  occasionId?: string;
  query?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  const useCase = new GetProductsUseCase(productRepo);
  return await useCase.execute(filters);
}

export async function getProductBySlug(slug: string) {
  const useCase = new GetProductBySlugUseCase(productRepo);
  return await useCase.execute(slug);
}

export async function getProductById(id: string) {
  const useCase = new GetProductByIdUseCase(productRepo);
  return await useCase.execute(id);
}

export async function createProduct(formData: {
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  categoryId: string;
  occasionId: string;
}) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const useCase = new CreateProductUseCase(productRepo);
  const product = await useCase.execute(formData);

  revalidatePath("/products");
  revalidatePath("/admin/products");
  return product;
}

export async function updateProduct(
  id: string,
  formData: {
    name: string;
    slug: string;
    description: string;
    price: number;
    images: string[];
    stock: number;
    categoryId: string;
    occasionId: string;
  }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const useCase = new UpdateProductUseCase(productRepo);
  const product = await useCase.execute(id, formData);

  revalidatePath("/products");
  revalidatePath(`/products/${product.slug}`);
  revalidatePath("/admin/products");
  return product;
}

export async function deleteProduct(id: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const useCase = new DeleteProductUseCase(productRepo);
  await useCase.execute(id);

  revalidatePath("/products");
  revalidatePath("/admin/products");
  return { success: true };
}
