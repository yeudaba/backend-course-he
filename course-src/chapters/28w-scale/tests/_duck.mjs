// עוזר לבדיקות של יחידה 28.5: DuckDB בזיכרון, עם view בשם orders על files/orders.parquet
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DuckDBInstance } from "@duckdb/node-api";
import { target } from "../../tools/load.mjs";

export const filesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "files");
export const ordersParquet = path.join(filesDir, "orders.parquet");

export async function duck(t) {
  const db = await DuckDBInstance.create(":memory:");
  const conn = await db.connect();
  await conn.run("SET TimeZone = 'UTC'");
  await conn.run(`CREATE VIEW orders AS SELECT * FROM read_parquet('${ordersParquet}')`);
  t.after(() => {
    conn.closeSync();
    db.closeSync();
  });
  const rows = async (sql, params) => (await conn.runAndReadAll(sql, params)).getRowObjectsJson();
  return {
    conn,
    rows,
    // מריץ את קובץ ה־SQL שלך (מ־starter) ומחזיר את השורות (מספרים כמחרוזות — כמו JSON)
    async fileRows(file) {
      const text = fs.readFileSync(target(import.meta.url.replace("_duck.mjs", "x.test.mjs"), file), "utf8");
      if (!text.replace(/--.*$/gm, "").trim()) throw new Error(`הקובץ ${file} ריק — כתוב בו את הפתרון שלך`);
      return rows(text);
    },
    async expectedRows(file) {
      return rows(fs.readFileSync(path.join(filesDir, "..", "solutions", file), "utf8"));
    },
  };
}
