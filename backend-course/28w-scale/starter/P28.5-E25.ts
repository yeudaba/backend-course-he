// P28.5-E25: סנכרון מצטבר מ־PostgreSQL ל־data lake (קובצי Parquet), ודוח שמתעלם מגרסאות ישנות
import fs from "node:fs/promises";
import path from "node:path";
import type { Pool } from "pg";
import type { DuckDBConnection } from "@duckdb/node-api";

export async function syncOrders({ pool, conn, lakeDir, pageSize = 1000 }: { pool: Pool; conn: DuckDBConnection; lakeDir: string; pageSize?: number }): Promise<{ exported: number; file: string | null }> {
  throw new Error("עוד לא כתבת את הפתרון");
}

export async function lakeReport(conn: DuckDBConnection, lakeDir: string): Promise<{ day: string; orders: number; revenue: number }[]> {
  throw new Error("עוד לא כתבת את הפתרון");
}
