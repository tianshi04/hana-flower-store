import { db } from "@/lib/db";
import { Occasion } from "@prisma/client";
import { OccasionRepository } from "@/domain/repositories/occasion.repository";

export class PrismaOccasionRepository implements OccasionRepository {
  async findMany(): Promise<Occasion[]> {
    return await db.occasion.findMany({
      orderBy: { name: "asc" },
    });
  }
}
