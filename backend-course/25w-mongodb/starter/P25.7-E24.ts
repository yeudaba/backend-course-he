// P25.7-E24: דשבורד — $facet
import type { Db } from "mongodb";

export async function dashboard(db: Db, from: Date, to: Date) {
  return { byDay: [], byStatus: {}, topProducts: [] }; // כתוב כאן
}
