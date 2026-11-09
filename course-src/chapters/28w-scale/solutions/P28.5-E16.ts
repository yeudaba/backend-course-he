// P28.5-E16: ייצוא ל־Parquet מחולק לפי יום — כך שאילתה על יום אחד קוראת קובץ אחד
import type { DuckDBConnection } from "@duckdb/node-api";

const q = (s: string) => `'${s.replaceAll("'", "''")}'`; // מחרוזת SQL בטוחה (נתיבים)

export async function exportByDay(conn: DuckDBConnection, sourceParquet: string, outDir: string): Promise<void> {
  await conn.run(`
    COPY (
      SELECT *, strftime(timezone('Asia/Jerusalem', created_at), '%Y-%m-%d') AS day
      FROM read_parquet(${q(sourceParquet)})
    ) TO ${q(outDir)} (FORMAT parquet, PARTITION_BY (day), OVERWRITE_OR_IGNORE)`);
}

export async function ordersPerDay(conn: DuckDBConnection, outDir: string): Promise<Record<string, number>> {
  const r = await conn.runAndReadAll(`
    SELECT day::VARCHAR AS day, count(*)::INTEGER AS n
    FROM read_parquet(${q(outDir + "/**/*.parquet")}, hive_partitioning = true)
    GROUP BY day ORDER BY day`);
  return Object.fromEntries(r.getRowObjects().map((x) => [String(x.day), Number(x.n)]));
}
