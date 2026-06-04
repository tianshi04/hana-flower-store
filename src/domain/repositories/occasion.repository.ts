import { Occasion } from "@prisma/client";

export interface OccasionRepository {
  findMany(): Promise<Occasion[]>;
}
