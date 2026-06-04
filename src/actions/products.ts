"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function getCategories() {
  return await db.category.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getOccasions() {
  return await db.occasion.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getProducts(filters?: {
  categoryId?: string;
  occasionId?: string;
  query?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
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

export async function getProductBySlug(slug: string) {
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

export async function getProductById(id: string) {
  return await db.product.findUnique({
    where: { id },
    include: {
      category: true,
      occasion: true,
    },
  });
}

// Admin CRUD functions
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

  const product = await db.product.create({
    data: {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      price: formData.price,
      images: formData.images,
      stock: formData.stock,
      categoryId: formData.categoryId,
      occasionId: formData.occasionId,
    },
  });

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

  const product = await db.product.update({
    where: { id },
    data: {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      price: formData.price,
      images: formData.images,
      stock: formData.stock,
      categoryId: formData.categoryId,
      occasionId: formData.occasionId,
    },
  });

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

  await db.product.delete({
    where: { id },
  });

  revalidatePath("/products");
  revalidatePath("/admin/products");
  return { success: true };
}
