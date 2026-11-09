// P25.7-E16: דירוגים
import type { Db } from "mongodb";

export async function addReview(db: Db, productId: string, { by, rating }: { by: string; rating: number }) {
  return false; // כתוב כאן
}

export async function averageRating(db: Db, productId: string): Promise<number | null> {
  return null; // כתוב כאן
}
