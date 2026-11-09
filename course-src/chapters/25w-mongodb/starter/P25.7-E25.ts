// P25.7-E25: מעבר מ־PostgreSQL ל־MongoDB
import type { Db } from "mongodb";
import type pg from "pg";

export async function migrateOrders(pool: pg.Pool, db: Db) {
  return { migrated: 0 }; // כתוב כאן
}
