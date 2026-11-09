// P28.5-E24: API אנליטיקה מעל Parquet — DuckDB בתוך התהליך, cache, ו־p95 נמוך תחת עומס
import http from "node:http";
import { DuckDBInstance } from "@duckdb/node-api";

export async function createAnalyticsServer({ parquetPath, cacheTtlMs = 60_000, cacheSize = 100, now = Date.now }: { parquetPath: string; cacheTtlMs?: number; cacheSize?: number; now?: () => number }): Promise<http.Server> {
  throw new Error("עוד לא כתבת את הפתרון");
}
