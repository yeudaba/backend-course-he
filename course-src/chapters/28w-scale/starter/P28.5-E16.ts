// P28.5-E16: ייצוא ל־Parquet מחולק לפי יום
import type { DuckDBConnection } from "@duckdb/node-api";

export async function exportByDay(conn: DuckDBConnection, sourceParquet: string, outDir: string): Promise<void> {
  throw new Error("עוד לא כתבת את הפתרון");
}

export async function ordersPerDay(conn: DuckDBConnection, outDir: string): Promise<Record<string, number>> {
  throw new Error("עוד לא כתבת את הפתרון");
}
