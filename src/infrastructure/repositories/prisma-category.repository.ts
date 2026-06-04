import { db } from "@/lib/db";
import { Category } from "@prisma/client";
import { CategoryRepository } from "@/domain/repositories/category.repository";

export class PrismaCategoryRepository implements CategoryRepository {
  async findMany(): Promise<Category[]> {
    return await db.category.findMany({
      orderBy: { name: "asc" },
    });
  }
}
