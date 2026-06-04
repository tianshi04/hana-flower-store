import { Category } from "@prisma/client";

export interface CategoryRepository {
  findMany(): Promise<Category[]>;
}
