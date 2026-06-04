import { ProductRepository } from "@/domain/repositories/product.repository";
import { CategoryRepository } from "@/domain/repositories/category.repository";
import { OccasionRepository } from "@/domain/repositories/occasion.repository";
import { ProductFilters, CreateProductData, UpdateProductData } from "@/domain/repositories/product.repository";

export class GetCategoriesUseCase {
  constructor(private categoryRepo: CategoryRepository) {}
  async execute() {
    return await this.categoryRepo.findMany();
  }
}

export class GetOccasionsUseCase {
  constructor(private occasionRepo: OccasionRepository) {}
  async execute() {
    return await this.occasionRepo.findMany();
  }
}

export class GetProductsUseCase {
  constructor(private productRepo: ProductRepository) {}
  async execute(filters?: ProductFilters) {
    return await this.productRepo.findMany(filters);
  }
}

export class GetProductBySlugUseCase {
  constructor(private productRepo: ProductRepository) {}
  async execute(slug: string) {
    return await this.productRepo.findBySlug(slug);
  }
}

export class GetProductByIdUseCase {
  constructor(private productRepo: ProductRepository) {}
  async execute(id: string) {
    return await this.productRepo.findById(id);
  }
}

export class CreateProductUseCase {
  constructor(private productRepo: ProductRepository) {}
  async execute(data: CreateProductData) {
    return await this.productRepo.create(data);
  }
}

export class UpdateProductUseCase {
  constructor(private productRepo: ProductRepository) {}
  async execute(id: string, data: UpdateProductData) {
    return await this.productRepo.update(id, data);
  }
}

export class DeleteProductUseCase {
  constructor(private productRepo: ProductRepository) {}
  async execute(id: string) {
    return await this.productRepo.delete(id);
  }
}
