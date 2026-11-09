// P25.7-E18: collection עם schema validation
import type { Db } from "mongodb";

export async function createBooksCollection(db: Db) {
  await db.createCollection("books"); // כתוב כאן: validator
}
